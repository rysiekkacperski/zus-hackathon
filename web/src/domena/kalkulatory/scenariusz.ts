// Wyliczenie scenariusza zasiłku macierzyńskiego (kontrakt, sekcja 7.2). Właściciel: u09 (Silnik kalkulatora zasiłku macierzyńskiego).
// Zaślepka fundamentu: implementuje u09. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type {
  DataISO,
  DaneWejscioweKalkulatora,
  Katalog,
  ParametryScenariusza,
  PodstawaWymiaru,
  RodzicWRodzinie,
  WynikScenariusza,
} from '@/domena/typy';

/** Okresy, kwoty, harmonogram i daty powrotu scenariusza. Zaślepka zwraca pusty wynik. */
export function wyliczScenariusz(
  d: DaneWejscioweKalkulatora,
  podstawy: Partial<Record<RodzicWRodzinie, PodstawaWymiaru>>,
  p: ParametryScenariusza,
  katalog: Katalog,
  dzis: DataISO,
): WynikScenariusza {
  return {
    okresy: [],
    harmonogram: [],
    sumy: { razem: 0 },
    datyPowrotu: {},
    tygodniePrzepadajace: 0,
    tygodnieNiewykorzystane: 0,
    uprawnieniaPoPowrocie: [],
    zastosowaneReguly: [],
    komunikaty: [],
  };
}
