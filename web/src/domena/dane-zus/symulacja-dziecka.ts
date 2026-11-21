// Dziecko zgłoszone w symulowanym ZUS (kontrakt, sekcja 7.2). Właściciel: u01 (Logowanie i konta demonstracyjne).
// Zaślepka fundamentu: implementuje u01. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { CzlonekRodzinyZus, DataISO } from '@/domena/typy';

/** Zofia z nazwiskiem konta, urodzona dzis − 2 dni, PESEL RRMMDD + '0782' + cyfra kontrolna. */
export function dzieckoZSymulacji(konto: { nazwisko: string }, dzis: DataISO): Omit<CzlonekRodzinyZus, 'noweDziecko'> {
  throw new Error('Zaślepka: u01');
}
