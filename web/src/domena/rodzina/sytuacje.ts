// Sytuacje szczególne rodziny (kontrakt, sekcja 7.2). Właściciel: u25 (Sytuacje szczególne i spokojny tryb).
// Zaślepka fundamentu: implementuje u25. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { BledyPol, DaneCiazyIDziecka, DataISO, RodzajSytuacjiSzczegolnej } from '@/domena/typy';

/** Pola formularza ViewSpecialSituation; kształt ustala właściciel (u25). */
export type FormularzSytuacji = Record<string, unknown>;

/** Błędy zgłoszenia sytuacji: 0102, 0127, 0193, 0010, 0006, 0037, 0194. */
export function walidujSytuacje(f: FormularzSytuacji, daneCiazy: DaneCiazyIDziecka | null, dzis: DataISO): BledyPol<string> {
  return {};
}

/** Czy zgłoszenie sytuacji wymaga daty porodu. */
export function czyWymagaDatyPorodu(rodzaj: RodzajSytuacjiSzczegolnej): boolean {
  return false;
}
