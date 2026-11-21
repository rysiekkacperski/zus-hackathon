// Scalanie odczytu dokumentu z danymi przykładowej sprawy (kontrakt, sekcja 7.2).
// Właściciel: u05 (Przykładowe sprawy: lista, dokumenty i odczyt AI).
// Zaślepka fundamentu: implementuje u05. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { DokumentSprawy, SprawaPrzykladowa, WynikOdczytuDokumentu } from '@/domena/typy';

/** Sprawa z wartościami odczytanymi z dokumentu (0181, 0225, 0107, 0255). Zaślepka zwraca sprawę bez zmian. */
export function scalOdczyt(sprawa: SprawaPrzykladowa, wynik: WynikOdczytuDokumentu, dokument: DokumentSprawy): SprawaPrzykladowa {
  return sprawa;
}
