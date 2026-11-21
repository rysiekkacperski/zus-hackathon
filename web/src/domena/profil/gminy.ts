// Wyszukiwanie gminy w Profilu na start (kontrakt, sekcja 7.2). Właściciel: u10 (Profil na start: ciąża, zmiana zatrudnienia, rodzina).
// Zaślepka fundamentu: implementuje u10. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { Gmina } from '@/domena/typy';

/** Gminy, których nazwa zawiera fragment `tekst`, bez rozróżniania wielkości liter. */
export function wyszukajGminy(tekst: string, gminy: readonly Gmina[]): Gmina[] {
  return [];
}
