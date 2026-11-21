// Wysyłka wniosku o urlop do pracodawcy (kontrakt, sekcja 7.2). Właściciel: u32 (Wnioski o urlop: warianty formularza i wysyłka).
// Zaślepka fundamentu: implementuje u32. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { BledyPol } from '@/domena/typy';

/** Pola formularza wysyłki ViewLeaveRequestSummary; kształt ustala właściciel (u32). */
export type FormularzWysylki = Record<string, unknown>;

/** Błędy wysyłki: 0134, 0060, 0103, 0104. */
export function walidujWysylke(f: FormularzWysylki): BledyPol<string> {
  return {};
}
