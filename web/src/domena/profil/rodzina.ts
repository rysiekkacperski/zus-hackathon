// Dane rodziny w Profilu na start (kontrakt, sekcja 7.2). Właściciel: u10 (Profil na start: ciąża, zmiana zatrudnienia, rodzina).
// Zaślepka fundamentu: implementuje u10. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { BledyPol } from '@/domena/typy';

/** Pola formularza ViewProfileFamily; kształt ustala właściciel (u10). */
export type FormularzDanychRodziny = Record<string, unknown>;

/** Błędy danych rodziny: 0013, 0014, 0015, 0016, 0006, 0004. */
export function walidujDaneRodziny(f: FormularzDanychRodziny): BledyPol<string> {
  return {};
}
