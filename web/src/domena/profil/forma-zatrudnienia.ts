// Propozycja formy zatrudnienia z kopii Danych z konta ZUS (kontrakt, sekcja 7.2).
// Właściciel: u07 (Profil na start: dane ZUS, płatnik, sytuacja).
// Zaślepka fundamentu: implementuje u07. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { DaneZKontaZus, FormaZatrudnienia, TytulUbezpieczenia } from '@/domena/typy';

export interface PropozycjaFormyZatrudnienia {
  forma: FormaZatrudnienia;
  dobrowolne: boolean | null;
  pozostaleTytuly: TytulUbezpieczenia[];
  tytulyZakonczone: TytulUbezpieczenia[];
}

/** Forma zatrudnienia z pierwszeństwem UoP > JDG > UZ, z tytułami zakończonymi w ostatnich 280 dniach. */
export function proponujFormeZatrudnienia(kopia: DaneZKontaZus): PropozycjaFormyZatrudnienia | null {
  return null;
}
