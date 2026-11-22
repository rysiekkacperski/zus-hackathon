// POST /api/v1/kalkulator/zasilek-macierzynski: zintegrowany kalkulator zasiłku macierzyńskiego (epik 3.10.4).
// Wejście ZadanieZasilkuMacierzynskiegoApi → 200 OdpowiedzZasilkuMacierzynskiegoApi; 400 z kodami pól danych wejściowych
// i parametrów scenariusza (reguły walidujDaneWejsciowe i arkuszy kalkulatora), 503 { kod: '0335' } po awarii wyliczenia.
// Wyliczenie wykonuje czysta funkcja domeny wyliczScenariusz z katalogiem świadczeń serwera (runtime Node.js).
import {
  czyWariant815Dostepny,
  dataZdarzenia,
  domyslneParametry,
  porownanieWariantowPoPowrocie,
  wyliczScenariusz,
} from '@/domena/kalkulatory';
import type { PodstawaWymiaru, RodzicWRodzinie } from '@/domena/typy';
import type { KomunikatApi, OdpowiedzZasilkuMacierzynskiegoApi } from '@/domena/typy/api-v1';
import { czasOdpowiedzi, przygotujPost } from '@/serwer/api/obsluga';
import { obsluzZadanie, odpowiedzBledowPol, odpowiedzBledu, odpowiedzDanych } from '@/serwer/api/odpowiedzi';
import {
  RODZICE,
  czytajDaneWejsciowe,
  czytajParametry,
  czytajPodstawe,
  miesiacPrawaScenariusza,
  walidujRegulyDanych,
  walidujRegulyParametrow,
} from '@/serwer/api/wejscia-kalkulatora';
import { czyObiekt, czytajObiekt, sciezka, type BledyWejscia } from '@/serwer/api/walidacja';

export function POST(zadanie: Request): Promise<Response> {
  return obsluzZadanie('0335', async () => {
    const k = await przygotujPost(zadanie);
    if (k instanceof Response) return k;
    const { tresc, czas, katalog } = k;

    const bledy: BledyWejscia = {};
    const dane = czytajDaneWejsciowe(tresc.daneWejsciowe, bledy);
    if (dane === undefined) return odpowiedzBledowPol(bledy) ?? odpowiedzBledu('0006', { pola: { daneWejsciowe: '0006' } });
    const bladStruktury = odpowiedzBledowPol(bledy);
    if (bladStruktury) return bladStruktury;
    const bladDanych = odpowiedzBledowPol(walidujRegulyDanych(dane, czas.dzis, katalog));
    if (bladDanych) return bladDanych;

    const parametry = czytajParametry(tresc.parametry, domyslneParametry(dane, katalog), bledy);
    const bladParametrow = odpowiedzBledowPol(bledy);
    if (bladParametrow) return bladParametrow;
    const reguly = walidujRegulyParametrow(dane, parametry, czyObiekt(tresc.parametry) ? tresc.parametry : {}, katalog);
    const bladRegul = odpowiedzBledowPol(reguly.bledy, reguly.parametry);
    if (bladRegul) return bladRegul;

    const dzien = dataZdarzenia(dane) ?? czas.dzis;
    const podstawy: Partial<Record<RodzicWRodzinie, PodstawaWymiaru>> = {};
    const komunikatyPodstaw: Partial<Record<RodzicWRodzinie, KomunikatApi>> = {};
    const zadanePodstawy = czytajObiekt(tresc.podstawy, 'podstawy', bledy);
    for (const rodzic of RODZICE) {
      if (zadanePodstawy?.[rodzic] === undefined) continue;
      const forma = rodzic === 'matka' ? dane.formaMatki.wartosc.forma : dane.formaDrugiegoRodzica.wartosc.forma;
      const wynik = czytajPodstawe(zadanePodstawy[rodzic], sciezka('podstawy', rodzic), bledy, {
        forma: forma === 'brak-drugiego-rodzica' ? null : forma,
        miesiacPrawa: miesiacPrawaScenariusza(dane, parametry, dzien),
        dzien,
        teraz: czas.teraz,
        katalog,
      });
      if (wynik === null) continue;
      if ('podstawa' in wynik) podstawy[rodzic] = wynik.podstawa;
      else komunikatyPodstaw[rodzic] = wynik.komunikat;
    }
    const bladPodstaw = odpowiedzBledowPol(bledy);
    if (bladPodstaw) return bladPodstaw;

    const wynik = wyliczScenariusz(dane, podstawy, parametry, katalog, czas.dzis);
    const porownanie = porownanieWariantowPoPowrocie(dane, podstawy, parametry, katalog, czas.dzis);
    const odpowiedz: OdpowiedzZasilkuMacierzynskiegoApi = {
      ...czasOdpowiedzi(k),
      wynik,
      daneWejsciowe: dane,
      parametry,
      podstawy,
      komunikatyPodstaw,
      wariant815: czyWariant815Dostepny(dane, katalog, czas.dzis),
      ...(porownanie ? { porownanieWariantow: porownanie } : {}),
    };
    return odpowiedzDanych(odpowiedz);
  });
}
