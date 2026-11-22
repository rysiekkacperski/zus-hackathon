// POST /api/v1/kalkulator/wariant: kalkulator wariantu zasiłku macierzyńskiego, 81,5% albo 100% i 70% (epik 3.10.1).
// Wejście ZadanieWariantuApi → 200 { ...CzasOdpowiedziApi, podstawa, wynik: WynikPorownaniaWariantow };
// 400 z kodami pól: 0093 i 0016 (podstawa), 0010 (data porodu), 0006 (liczba dzieci), 0061 (tygodnie przed powrotem),
// 422 { kod: '0094' | '0173' }, gdy dane konta ZUS nie dają podstawy wymiaru; 503 { kod: '0335' } po awarii wyliczenia.
import { porownajWarianty, tygodnieRodzicielskiegoJednegoRodzica, walidujTygodnie } from '@/domena/kalkulatory/wariant';
import { miesiacZDaty } from '@/domena/daty';
import type { OdpowiedzWariantuApi } from '@/domena/typy/api-v1';
import { czasOdpowiedzi, przygotujPost } from '@/serwer/api/obsluga';
import { obsluzZadanie, odpowiedzBledowPol, odpowiedzBledu, odpowiedzDanych } from '@/serwer/api/odpowiedzi';
import { czytajPodstawe } from '@/serwer/api/wejscia-kalkulatora';
import { czytajDate, czytajLiczbeCalkowita, czytajLogiczna, type BledyWejscia } from '@/serwer/api/walidacja';

export function POST(zadanie: Request): Promise<Response> {
  return obsluzZadanie('0335', async () => {
    const k = await przygotujPost(zadanie);
    if (k instanceof Response) return k;
    const { tresc, czas, katalog } = k;
    const bledy: BledyWejscia = {};
    const dataPorodu = czytajDate(tresc.dataPorodu, 'dataPorodu', bledy, { wymagane: true, kodBraku: '0018' });
    const liczbaDzieci = czytajLiczbeCalkowita(tresc.liczbaDzieci, 'liczbaDzieci', bledy, { wymagane: true, min: 1, max: 5 });
    const zaZyciem = czytajLogiczna(tresc.zaZyciem, 'zaZyciem', bledy, false);
    const bladDanych = odpowiedzBledowPol(bledy);
    if (bladDanych || dataPorodu === undefined || liczbaDzieci === undefined) return bladDanych ?? odpowiedzBledu('0006');

    const maks = tygodnieRodzicielskiegoJednegoRodzica(liczbaDzieci, zaZyciem, katalog, dataPorodu);
    let tygodnie = maks;
    if (tresc.tygodniePrzedPowrotem !== undefined && tresc.tygodniePrzedPowrotem !== null) {
      const t = walidujTygodnie(String(tresc.tygodniePrzedPowrotem), maks);
      if ('kod' in t) bledy.tygodniePrzedPowrotem = t.kod;
      else tygodnie = t.tygodnie;
    }
    const podstawa = tresc.podstawa === undefined
      ? (bledy.podstawa = '0093', null)
      : czytajPodstawe(tresc.podstawa, 'podstawa', bledy, {
          forma: null, miesiacPrawa: miesiacZDaty(dataPorodu), dzien: dataPorodu, teraz: czas.teraz, katalog,
        });
    const bladWejscia = odpowiedzBledowPol(bledy);
    if (bladWejscia) return bladWejscia;
    if (podstawa === null) return odpowiedzBledu('0093', { pola: { podstawa: '0093' } });
    if ('komunikat' in podstawa) return odpowiedzBledu(podstawa.komunikat.kod, { pola: { podstawa: podstawa.komunikat.kod } });

    const wynik = porownajWarianty({
      podstawa: podstawa.podstawa, dataPorodu, liczbaDzieci, zaZyciem, tygodniePrzedPowrotem: tygodnie, dzis: czas.dzis, katalog,
    });
    const odpowiedz: OdpowiedzWariantuApi = { ...czasOdpowiedzi(k), podstawa: podstawa.podstawa, tygodniePrzedPowrotem: tygodnie, wynik };
    return odpowiedzDanych(odpowiedz);
  });
}
