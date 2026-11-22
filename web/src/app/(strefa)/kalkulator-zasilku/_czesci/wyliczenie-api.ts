'use client';

// Wyliczenie zintegrowanego kalkulatora zasiłku macierzyńskiego przez POST /api/v1/kalkulator/zasilek-macierzynski.
// Wynik ekranu ViewCalcMaternityResult i podglądy arkuszy liczy serwer tą samą funkcją domeny wyliczScenariusz,
// z katalogiem świadczeń serwera. Podstawę z konta ZUS żądanie przekazuje jako podstawy składek tytułu, z których
// serwer liczy podstawę funkcją wyliczPodstawe, a podstawę wpisaną albo z przykładowej sprawy jako kwotę.
import { wyliczZasilekMacierzynski } from '@/dane/api/klient';
import { useWyliczenieApi, type OpcjeWyliczeniaApi, type WyliczenieApi } from '@/dane/api/wyliczenie';
import type {
  DaneWejscioweKalkulatora,
  DataISO,
  ParametryScenariusza,
  RodzicWRodzinie,
} from '@/domena/typy';
import type {
  OdpowiedzZasilkuMacierzynskiegoApi,
  PodstawaWZadaniuApi,
  ZadanieZasilkuMacierzynskiegoApi,
} from '@/domena/typy/api-v1';
import { RODZICE, formaRodzica, type PodstawaRodzica } from './podstawy';

export type PodstawyZadaniaApi = Partial<Record<RodzicWRodzinie, PodstawaWZadaniuApi>>;

/**
 * Podstawy rodziców z prawem do zasiłku w postaci żądania REST API. Podstawa z konta ZUS: podstawy składek tytułu
 * z formą i etatem, tak jak w podstawaZKonta. Podstawa wpisana albo z przykładowej sprawy: kwota z etatem.
 */
export function podstawyDoZadaniaApi(
  dane: DaneWejscioweKalkulatora,
  podstawy: Record<RodzicWRodzinie, PodstawaRodzica>,
): PodstawyZadaniaApi {
  const wynik: PodstawyZadaniaApi = {};
  for (const rodzic of RODZICE) {
    const p = podstawy[rodzic];
    const efektywna = p.efektywna;
    if (!p.prawo || efektywna === null) continue;
    const forma = formaRodzica(dane, rodzic);
    if (p.zKonta.rodzaj === 'wyliczona' && efektywna === p.zKonta.podstawa && forma !== null && forma !== 'brak-tytulu') {
      wynik[rodzic] = { podstawySkladek: p.zKonta.tytul.podstawySkladek, forma, pelnyEtat: forma === 'umowa-o-prace' && p.pelnyEtat };
    } else {
      // Etat podajemy wprost, bo bez niego serwer przyjmuje pełny etat pracownika.
      wynik[rodzic] = { kwota: efektywna.kwota, pelnyEtat: efektywna.pelnyEtat === true };
    }
  }
  return wynik;
}

export interface WejscieScenariuszaApi {
  dane: DaneWejscioweKalkulatora;
  podstawy: PodstawyZadaniaApi;
  parametry: ParametryScenariusza;
  dzis: DataISO;
}

export function zadanieScenariusza(w: WejscieScenariuszaApi): ZadanieZasilkuMacierzynskiegoApi {
  return { dzis: w.dzis, daneWejsciowe: w.dane, podstawy: w.podstawy, parametry: w.parametry };
}

/** Wynik scenariusza z REST API; `wejscie` równe null pomija wyliczenie. */
export function useScenariuszApi(
  wejscie: WejscieScenariuszaApi | null,
  opcje?: OpcjeWyliczeniaApi,
): WyliczenieApi<OdpowiedzZasilkuMacierzynskiegoApi> {
  return useWyliczenieApi(wejscie === null ? null : zadanieScenariusza(wejscie), wyliczZasilekMacierzynski, opcje);
}
