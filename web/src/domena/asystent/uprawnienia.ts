// Działania asystenta AI dozwolone dla roli (kontrakt, sekcje 7.2 i 10.3). Właściciel: u31 (Asystent AI).
// Zaślepka fundamentu: implementuje u31. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { PlanRodziny, PropozycjaDzialania, Rola } from '@/domena/typy';

/** Czy rola może zatwierdzić proponowane działanie. */
export function dozwoloneDzialanie(rola: Rola, propozycja: PropozycjaDzialania, plan: PlanRodziny | null): boolean {
  return false;
}
