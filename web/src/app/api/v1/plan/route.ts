// POST /api/v1/plan: plan świadczeń rodziny i kalendarz terminów (epiki 3.6.1 i 3.7.1).
// Wejście ZadaniePlanuApi (profil rodziny, dane ciąży i dziecka, dane ZUS albo PESEL konta w symulowanym ZUS, wnioski,
// wyniki kalkulacji, poprzedni plan) → 200 OdpowiedzPlanuApi; 400 z kodami pól struktury (0006, 0010, 0024–0026),
// 503 { kod: '0335' } po awarii wyliczenia. Wyliczenie wykonują czyste funkcje domeny wyliczPlan i wyliczTerminy
// w tej samej kolejności co przeliczenie rodziny w przeglądarce, z katalogiem świadczeń serwera.
import { utworzParametryPoczatkowe } from '@/dane/parametry-systemu';
import { wynikiKalkulacjiPuste } from '@/dane/magazyn/stan-poczatkowy';
import { wyliczPlan } from '@/domena/plan/wylicz-plan';
import { daneCiazyDoUzycia, type WejsciePlanu } from '@/domena/przeliczenie';
import { wyliczTerminy } from '@/domena/terminy/wylicz-terminy';
import type { PlanRodziny, Wniosek, WynikiKalkulacji } from '@/domena/typy';
import type { OdpowiedzPlanuApi } from '@/domena/typy/api-v1';
import { czasOdpowiedzi, przygotujPost } from '@/serwer/api/obsluga';
import { obsluzZadanie, odpowiedzBledowPol, odpowiedzBledu, odpowiedzDanych } from '@/serwer/api/odpowiedzi';
import { czytajDaneCiazy, czytajDaneRodziny, czytajDaneZusDrugiego, kopiaZZadania } from '@/serwer/api/wejscia-rodziny';
import { czytajLiczbe, czytajListe, czytajLogiczna, czytajObiekt, type BledyWejscia } from '@/serwer/api/walidacja';

export function POST(zadanie: Request): Promise<Response> {
  return obsluzZadanie('0335', async () => {
    const k = await przygotujPost(zadanie);
    if (k instanceof Response) return k;
    const { tresc, czas, katalog } = k;
    const bledy: BledyWejscia = {};

    const daneRodziny = czytajDaneRodziny(tresc.daneRodziny, bledy, czas.teraz);
    const zgoda = czytajLogiczna(tresc.zgoda, 'zgoda', bledy, true);
    const daneCiazy = czytajDaneCiazy(tresc.daneCiazy, bledy);
    const daneZusMatki = kopiaZZadania(tresc.daneZusMatki, tresc.peselMatki, bledy, { kopia: 'daneZusMatki', pesel: 'peselMatki' }, czas.teraz, zgoda);
    const daneZusDrugiegoRodzica = tresc.daneZusDrugiegoRodzica !== undefined && tresc.daneZusDrugiegoRodzica !== null
      ? czytajDaneZusDrugiego(tresc.daneZusDrugiegoRodzica, bledy, 'daneZusDrugiegoRodzica', czas.teraz)
      : kopiaZZadania(undefined, tresc.peselDrugiegoRodzica, bledy, { kopia: 'daneZusDrugiegoRodzica', pesel: 'peselDrugiegoRodzica' }, czas.teraz, zgoda);
    const wnioski = czytajListe(tresc.wnioski, 'wnioski', bledy) as Wniosek[];
    const wyniki = czytajObiekt(tresc.wynikiKalkulacji, 'wynikiKalkulacji', bledy);
    const poprzedni = czytajObiekt(tresc.poprzedniPlan, 'poprzedniPlan', bledy);
    const zadaneParametry = czytajObiekt(tresc.parametry, 'parametry', bledy) ?? {};
    const domyslne = utworzParametryPoczatkowe();
    const parametry: WejsciePlanu['parametry'] = {
      progPodwyzszeniaPodstawyProcent: czytajLiczbe(zadaneParametry.progPodwyzszeniaPodstawyProcent, 'parametry.progPodwyzszeniaPodstawyProcent', bledy, { min: 0 })
        ?? domyslne.progPodwyzszeniaPodstawyProcent,
      progOstrzezeniaOkresuZasilkowegoDni: czytajLiczbe(zadaneParametry.progOstrzezeniaOkresuZasilkowegoDni, 'parametry.progOstrzezeniaOkresuZasilkowegoDni', bledy, { min: 0 })
        ?? domyslne.progOstrzezeniaOkresuZasilkowegoDni,
    };
    const blad = odpowiedzBledowPol(bledy);
    if (blad) return blad;
    if (daneRodziny === undefined) return odpowiedzBledu('0006', { pola: { daneRodziny: '0006' } });

    const pusteWyniki = wynikiKalkulacjiPuste();
    const wynikiKalkulacji: WynikiKalkulacji = wyniki
      ? { ...pusteWyniki, ...(wyniki as Partial<WynikiKalkulacji>) }
      : pusteWyniki;
    const poprzedniPlan = poprzedni
      ? ({ ostatnieZmiany: [], ...poprzedni, pozycje: Array.isArray(poprzedni.pozycje) ? poprzedni.pozycje : [] } as unknown as PlanRodziny)
      : null;
    const wejscie: WejsciePlanu = {
      daneRodziny,
      daneCiazy: daneCiazyDoUzycia(daneCiazy, zgoda),
      zgoda,
      katalog,
      daneZusMatki,
      daneZusDrugiegoRodzica,
      wnioski,
      wynikiKalkulacji,
      poprzedniPlan,
      dzis: czas.dzis,
      teraz: czas.teraz,
      parametry,
    };
    const plan = wyliczPlan(wejscie);
    const kalendarz = wyliczTerminy({
      plan, daneCiazy: wejscie.daneCiazy, daneRodziny, katalog, dzis: czas.dzis, teraz: czas.teraz,
    });
    const odpowiedz: OdpowiedzPlanuApi = { ...czasOdpowiedzi(k), plan, kalendarz };
    return odpowiedzDanych(odpowiedz);
  });
}
