// Zmiana zatrudnienia w ciąży w Profilu na start (kontrakt, sekcja 7.2).
// Właściciel: u10 (Profil na start: ciąża, zmiana zatrudnienia, rodzina).
// Zaślepka fundamentu: implementuje u10. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { BledyPol, DataISO, Okres, TytulUbezpieczenia, ZmianaZatrudnieniaWCiazy } from '@/domena/typy';

/** Pola formularza ViewProfileEmploymentChange; kształt ustala właściciel (u10). */
export type FormularzZmianyZatrudnienia = Record<string, unknown>;

/** Propozycja zmiany zatrudnienia z tytułów rozpoczętych albo zakończonych w okresie ciąży. */
export function proponujZmianeZatrudnienia(tytuly: TytulUbezpieczenia[], okres: Okres): ZmianaZatrudnieniaWCiazy | null {
  return null;
}

/** Błędy zmiany zatrudnienia: 0073, 0074, 0075, 0076. */
export function walidujZmianeZatrudnienia(
  f: FormularzZmianyZatrudnienia,
  okres: Okres,
  tytuly: TytulUbezpieczenia[],
  dzis: DataISO,
): BledyPol<string> {
  return {};
}
