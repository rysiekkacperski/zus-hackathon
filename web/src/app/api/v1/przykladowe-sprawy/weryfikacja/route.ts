// POST /api/v1/przykladowe-sprawy/weryfikacja: weryfikacja ubezpieczenia chorobowego przykładowej sprawy i wyliczenie
// zasiłku macierzyńskiego (epik 3.4.3). Wejście ZadanieWeryfikacjiSprawyApi: sprawa wzorcowa przewodnika (S01–S11)
// albo dane sprawy z dokumentów → 200 OdpowiedzWeryfikacjiSprawyApi z wynikiem weryfikacji, porównaniem z rozstrzygnięciem
// (0177, 0178, 0180), podstawą wymiaru, wyliczeniem z porównaniem kwot (0111, 0112) oraz wyliczeniami każdego
// przysługującego świadczenia (ZWZM, zasiłek macierzyński, zasiłek chorobowy) z porównaniem; 400 z kodami pól danych
// sprawy, 409 { kod: '0109' } bez danych do weryfikacji, 503 { kod: '0335' } po awarii wyliczenia.
// Zestawy spraw ZUS nie trafiają do API: endpoint przyjmuje sprawy wzorcowe zespołu albo dane podane w żądaniu.
import { utworzParametryPoczatkowe } from '@/dane/parametry-systemu';
import { sprawyWzorcowe } from '@/dane/przykladowe-sprawy/sprawy-wzorcowe';
import { komunikatyPorownaniaWeryfikacji, porownajWeryfikacje, porownajWyliczenie } from '@/domena/przykladowe-sprawy/porownanie';
import { walidujDaneSprawy } from '@/domena/przykladowe-sprawy/walidacja';
import { porownajWyliczenieSprawy, wyliczSwiadczeniaSprawy } from '@/domena/przykladowe-sprawy/wyliczenie';
import {
  brakiDoWeryfikacji,
  czyZasilekMacierzynskiPrzysluguje,
  ustalPodstaweZeSprawy,
  weryfikujUbezpieczenieChorobowe,
  wyliczWynikSprawy,
} from '@/domena/przykladowe-sprawy/weryfikacja';
import type { DaneSprawy, DokumentSprawy, RozstrzygniecieSprawy } from '@/domena/typy';
import type { OdpowiedzWeryfikacjiSprawyApi } from '@/domena/typy/api-v1';
import { czasOdpowiedzi, przygotujPost } from '@/serwer/api/obsluga';
import { obsluzZadanie, odpowiedzBledowPol, odpowiedzBledu, odpowiedzDanych } from '@/serwer/api/odpowiedzi';
import { daneSprawyZZadania } from '@/serwer/api/wejscia-sprawy';
import { czytajLiczbeCalkowita, czytajListe, czytajObiekt, czytajTekst, sciezka, type BledyWejscia } from '@/serwer/api/walidacja';

export function POST(zadanie: Request): Promise<Response> {
  return obsluzZadanie('0335', async () => {
    const k = await przygotujPost(zadanie);
    if (k instanceof Response) return k;
    const { tresc, czas, katalog } = k;
    const bledy: BledyWejscia = {};

    let dane: DaneSprawy | undefined;
    let dokumenty: DokumentSprawy[] = [];
    let rozstrzygniecie: RozstrzygniecieSprawy[] = [];
    const id = czytajTekst(tresc.idSprawyWzorcowej, 'idSprawyWzorcowej', bledy);
    if (id !== undefined) {
      const wzorcowa = sprawyWzorcowe.find((s) => s.idSprawy === id);
      if (wzorcowa === undefined) return odpowiedzBledu('0006', { pola: { idSprawyWzorcowej: '0006' } });
      dane = structuredClone(wzorcowa.dane);
      dokumenty = structuredClone(wzorcowa.dokumenty);
      rozstrzygniecie = structuredClone(wzorcowa.rozstrzygniecie);
    } else {
      const o = czytajObiekt(tresc.dane, 'dane', bledy, { wymagane: true, kodBraku: '0109' });
      if (o !== undefined) dane = daneSprawyZZadania(o, bledy);
      dokumenty = czytajListe(tresc.dokumenty, 'dokumenty', bledy) as DokumentSprawy[];
    }
    if (tresc.rozstrzygniecie !== undefined) rozstrzygniecie = czytajListe(tresc.rozstrzygniecie, 'rozstrzygniecie', bledy) as RozstrzygniecieSprawy[];
    const tolerancja = czytajLiczbeCalkowita(tresc.tolerancjaPorownaniaKwotyGrosze, 'tolerancjaPorownaniaKwotyGrosze', bledy, { min: 0 })
      ?? utworzParametryPoczatkowe().tolerancjaPorownaniaKwotyGrosze;
    const blad = odpowiedzBledowPol(bledy);
    if (blad) return blad;
    if (dane === undefined) return odpowiedzBledu('0109', { pola: { dane: '0109' } });

    const bladDanych = odpowiedzBledowPol(Object.fromEntries(Object.entries(walidujDaneSprawy(dane)).map(([pole, kod]) => [sciezka('dane', pole), kod])));
    if (bladDanych) return bladDanych;
    const braki = brakiDoWeryfikacji(dane);
    if (Object.keys(braki).length > 0) {
      return odpowiedzBledu('0109', { pola: Object.fromEntries(Object.keys(braki).map((pole) => [sciezka('dane', pole), '0109' as const])) });
    }

    const wynik = weryfikujUbezpieczenieChorobowe(dane, katalog, dokumenty);
    const porownanie = porownajWeryfikacje(wynik, rozstrzygniecie);
    const weryfikacja = { ...wynik, porownanie, komunikaty: [...wynik.komunikaty, ...komunikatyPorownaniaWeryfikacji(porownanie)], czas: czas.teraz };

    const podstawa = ustalPodstaweZeSprawy(dane, katalog);
    const wyliczenie = !('kod' in podstawa) && czyZasilekMacierzynskiPrzysluguje(weryfikacja)
      ? wyliczWynikSprawy(dane, podstawa, katalog, dokumenty)
      : null;
    // Wyliczenia każdego przysługującego świadczenia (zasiłek macierzyński, ZWZM, zasiłek chorobowy) i ich porównanie
    // z rozstrzygnięciem: te same funkcje co ekran weryfikacji sprawy i wynik kalkulatora w trybie przykładowej sprawy.
    const swiadczenia = wyliczSwiadczeniaSprawy(dane, weryfikacja, katalog, dokumenty);
    const odpowiedz: OdpowiedzWeryfikacjiSprawyApi = {
      ...czasOdpowiedzi(k),
      weryfikacja,
      podstawa: 'kod' in podstawa ? null : podstawa,
      ...('kod' in podstawa ? { komunikatPodstawy: { kod: podstawa.kod } } : {}),
      wyliczenie,
      ...(wyliczenie ? { porownanieWyliczenia: porownajWyliczenie(wyliczenie, rozstrzygniecie, tolerancja) } : {}),
      wyliczeniaSwiadczen: 'kod' in swiadczenia ? null : swiadczenia,
      ...('kod' in swiadczenia
        ? { komunikatWyliczen: { kod: swiadczenia.kod } }
        : { porownanieSwiadczen: porownajWyliczenieSprawy(swiadczenia, weryfikacja, rozstrzygniecie, tolerancja) }),
    };
    return odpowiedzDanych(odpowiedz);
  });
}
