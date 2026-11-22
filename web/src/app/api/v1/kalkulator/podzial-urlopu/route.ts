// POST /api/v1/kalkulator/podzial-urlopu: kalkulator podziału urlopu rodzicielskiego między rodziców (epik 3.10.2).
// Wejście ZadaniePodzialuUrlopuApi → 200 { ...CzasOdpowiedziApi, zasady, tygodnieMatki, tygodnieDrugiegoRodzica, wynik };
// 400 z kodami pól: 0061 (tygodnie poza zakresem albo suma ponad wymiar), 0093 i 0016 (podstawa), 0010, 0006;
// 422 { kod: '0094' | '0173' }, gdy dane konta ZUS rodzica nie dają podstawy; 503 { kod: '0335' } po awarii wyliczenia.
import { miesiacZDaty } from '@/domena/daty';
import { wartosciStartowe, wyliczPodzial, zasadyPodzialu } from '@/domena/kalkulatory/podzial';
import type { PodstawaWymiaru, RodzicWRodzinie } from '@/domena/typy';
import type { OdpowiedzPodzialuUrlopuApi } from '@/domena/typy/api-v1';
import { czasOdpowiedzi, przygotujPost } from '@/serwer/api/obsluga';
import { bezPustych, obsluzZadanie, odpowiedzBledowPol, odpowiedzBledu, odpowiedzDanych } from '@/serwer/api/odpowiedzi';
import { RODZICE, czytajPodstawe } from '@/serwer/api/wejscia-kalkulatora';
import {
  czytajDate,
  czytajLiczbeCalkowita,
  czytajLogiczna,
  czytajObiekt,
  czytajZWyliczenia,
  sciezka,
  type BledyWejscia,
} from '@/serwer/api/walidacja';

export function POST(zadanie: Request): Promise<Response> {
  return obsluzZadanie('0335', async () => {
    const k = await przygotujPost(zadanie);
    if (k instanceof Response) return k;
    const { tresc, czas, katalog } = k;
    const bledy: BledyWejscia = {};
    const dzien = czytajDate(tresc.dataPorodu, 'dataPorodu', bledy) ?? czas.dzis;
    const liczbaDzieci = czytajLiczbeCalkowita(tresc.liczbaDzieci, 'liczbaDzieci', bledy, { wymagane: true, min: 1, max: 5 });
    const zaZyciem = czytajLogiczna(tresc.zaZyciem, 'zaZyciem', bledy, false);
    const wariantMatki = czytajZWyliczenia(tresc.wariantMatki, ['81-5', '100-70'] as const, 'wariantMatki', bledy) ?? '100-70';
    const bezPrawa = czytajLogiczna(tresc.drugiRodzicBezPrawa, 'drugiRodzicBezPrawa', bledy, false);
    const tygodnieMatki = czytajLiczbeCalkowita(tresc.tygodnieMatki, 'tygodnieMatki', bledy, { min: 0, kod: '0061' });
    const tygodnieDrugiego = czytajLiczbeCalkowita(tresc.tygodnieDrugiegoRodzica, 'tygodnieDrugiegoRodzica', bledy, { min: 0, kod: '0061' });
    const bladDanych = odpowiedzBledowPol(bledy);
    if (bladDanych || liczbaDzieci === undefined) return bladDanych ?? odpowiedzBledu('0006');

    const zasady = zasadyPodzialu(liczbaDzieci, zaZyciem, katalog, dzien);
    const start = wartosciStartowe(zasady, bezPrawa);
    const podstawy: Partial<Record<RodzicWRodzinie, PodstawaWymiaru>> = {};
    const zadane = czytajObiekt(tresc.podstawy, 'podstawy', bledy, { wymagane: true, kodBraku: '0093' });
    for (const rodzic of RODZICE) {
      if (rodzic === 'drugi-rodzic' && bezPrawa) continue;
      if (zadane?.[rodzic] === undefined) {
        if (zadane !== undefined) bledy[sciezka('podstawy', rodzic)] = '0093';
        continue;
      }
      const wynik = czytajPodstawe(zadane[rodzic], sciezka('podstawy', rodzic), bledy, {
        forma: null, miesiacPrawa: miesiacZDaty(dzien), dzien, teraz: czas.teraz, katalog,
      });
      if (wynik === null) continue;
      if ('podstawa' in wynik) podstawy[rodzic] = wynik.podstawa;
      else bledy[sciezka('podstawy', rodzic)] = wynik.komunikat.kod;
    }
    const bladPodstaw = odpowiedzBledowPol(bledy);
    if (bladPodstaw) return bladPodstaw;

    const M = tygodnieMatki ?? start.tygodnieMatki;
    const D = bezPrawa ? 0 : (tygodnieDrugiego ?? start.tygodnieDrugiegoRodzica);
    const wynik = wyliczPodzial({
      podstawy, wariantMatki, liczbaDzieci, zaZyciem, tygodnieMatki: M, tygodnieDrugiegoRodzica: D, katalog, dzien, drugiRodzicBezPrawa: bezPrawa,
    });
    const bledyPodzialu = bezPustych(wynik.bledy);
    if (Object.keys(bledyPodzialu).length > 0) return odpowiedzBledowPol(bledyPodzialu) as Response;
    const odpowiedz: OdpowiedzPodzialuUrlopuApi = { ...czasOdpowiedzi(k), zasady, tygodnieMatki: M, tygodnieDrugiegoRodzica: D, wynik };
    return odpowiedzDanych(odpowiedz);
  });
}
