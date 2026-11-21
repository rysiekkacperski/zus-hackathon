// Sekcje listy terminów ViewDeadlines (kontrakt, sekcja 7.2). Właściciel: u13 (Kalendarz terminów).
// Zaślepka fundamentu: implementuje u13. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { DataISO, Etap, KalendarzTerminow, PlanRodziny, RodzicSprawy, TerminSprawy } from '@/domena/typy';

/** Filtry listy terminów; kształt ustala właściciel (u13). */
export interface FiltryTerminow {
  etap?: Etap;
  rodzic?: RodzicSprawy;
}

export interface SekcjeTerminow {
  poTerminie: TerminSprawy[];
  najblizsze30Dni: TerminSprawy[];
  pozniej: TerminSprawy[];
}

/** Terminy spraw podzielone na sekcje względem dnia `dzis`. */
export function sekcjeTerminow(
  kalendarz: KalendarzTerminow,
  plan: PlanRodziny,
  dzis: DataISO,
  filtry: FiltryTerminow,
): SekcjeTerminow {
  return { poTerminie: [], najblizsze30Dni: [], pozniej: [] };
}
