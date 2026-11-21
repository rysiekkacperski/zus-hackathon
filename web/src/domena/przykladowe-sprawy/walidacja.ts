// Walidacja danych przykładowej sprawy (kontrakt, sekcja 7.2). Właściciel: u05 (Przykładowe sprawy: lista, dokumenty i odczyt AI).
// Zaślepka fundamentu: implementuje u05. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { BledyPol, DaneSprawy } from '@/domena/typy';

/** Błędy pól danych sprawy (0109 i walidatory pól). */
export function walidujDaneSprawy(d: DaneSprawy): BledyPol<string> {
  return {};
}
