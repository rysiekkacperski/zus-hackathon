// Harmonogram miesięcznych wypłat zasiłku (kontrakt, sekcja 7.2). Właściciel: u09 (Silnik kalkulatora zasiłku macierzyńskiego).
// Zaślepka fundamentu: implementuje u09. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { Katalog, OkresScenariusza, WynikScenariusza } from '@/domena/typy';

/** Wypłaty w kolejnych miesiącach okresów scenariusza. */
export function harmonogram(okresy: OkresScenariusza[], katalog: Katalog): WynikScenariusza['harmonogram'] {
  return [];
}
