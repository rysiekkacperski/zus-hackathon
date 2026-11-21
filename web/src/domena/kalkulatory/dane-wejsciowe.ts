// Dane wejściowe i parametry domyślne kalkulatora (kontrakt, sekcja 7.2). Właściciel: u09 (Silnik kalkulatora zasiłku macierzyńskiego).
// Zaślepka fundamentu: implementuje u09. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { BledyPol, DataISO, DaneWejscioweKalkulatora, Katalog, ParametryScenariusza } from '@/domena/typy';

/** Błędy danych wejściowych kalkulatora. */
export function walidujDaneWejsciowe(d: DaneWejscioweKalkulatora, dzis: DataISO): BledyPol<string> {
  return {};
}

/** Parametry scenariusza domyślne dla danych wejściowych. */
export function domyslneParametry(d: DaneWejscioweKalkulatora, katalog: Katalog): ParametryScenariusza {
  return {
    wariant: '81-5',
    tygodniePrzedPorodem: 0,
    czesciRodzicielskiego: [],
    ojcowski: { wymiar: 'brak', czesci: [] },
    datyPowrotu: {},
  };
}
