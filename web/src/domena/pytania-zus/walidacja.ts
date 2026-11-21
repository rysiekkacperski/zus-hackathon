// Walidacja treści pytania do ZUS (kontrakt, sekcja 7.2). Właściciel: u29 (Pytanie do ZUS, dane konta i odpis aktu urodzenia).
// Zaślepka fundamentu: implementuje u29. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */

/** Błąd treści pytania: 0129, 0130; null, gdy treść jest poprawna. */
export function walidujTrescPytania(t: string): '0129' | '0130' | null {
  return null;
}
