// Fakty dla odpowiedzi asystenta AI (kontrakt, sekcje 7.2 i 10.3). Właściciel: u31 (Asystent AI).
// Zaślepka fundamentu: implementuje u31. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { Fakt, IntencjaAsystenta, KontekstAsystenta } from '@/domena/typy';

/** Fakty z kontekstu potrzebne do odpowiedzi na intencję. */
export function faktyDlaIntencji(intencja: IntencjaAsystenta, kontekst: KontekstAsystenta): Fakt[] {
  return [];
}
