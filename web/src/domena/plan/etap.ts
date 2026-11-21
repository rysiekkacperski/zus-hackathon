// Bieżący etap ścieżki rodzica (kontrakt, sekcja 7.2). Właściciel: u08 (Silnik planu rodziny).
// Zaślepka fundamentu: implementuje u08. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { DaneCiazyIDziecka, DataISO, Etap } from '@/domena/typy';

/** Etap rodziny w dniu `dzis`; od porodu do 42. dnia po porodzie: pierwsze tygodnie. */
export function wyznaczBiezacyEtap(daneCiazy: DaneCiazyIDziecka | null, dzis: DataISO): Etap {
  return 'ciaza';
}
