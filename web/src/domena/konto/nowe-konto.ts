// Nowe konto demonstracyjne: walidacja pól, PESEL i kody makiet logowania (kontrakt, sekcja 7.2).
// Właściciel: u01 (Logowanie i konta demonstracyjne).
// Zaślepka fundamentu: implementuje u01. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { Losuj } from '@/domena/losowanie';
import type { BledyPol, DataISO, Pesel, Plec } from '@/domena/typy';

/** Pola formularza ViewDemoNewAccount przed walidacją; data urodzenia w zapisie 'DD.MM.RRRR'. */
export interface DaneNowegoKonta {
  imie: string;
  nazwisko: string;
  dataUrodzenia: string;
  plec: Plec | null;
}

/** Błędy pól nowego konta: 0028, 0029, 0030, 0010, 0254, 0006. */
export function walidujNoweKonto(
  d: DaneNowegoKonta,
  dzis: DataISO,
): BledyPol<'imie' | 'nazwisko' | 'dataUrodzenia' | 'plec'> {
  return {};
}

/** Numer PESEL nowego konta zgodny z datą urodzenia i płcią, różny od numerów zajętych. */
export function peselNowegoKonta(dataUrodzenia: DataISO, plec: Plec, losuj: Losuj, zajete: Pesel[]): Pesel {
  throw new Error('Zaślepka: u01');
}

/** Nowy kod makiety logowania mObywatel, różny od poprzedniego. */
export function nowyKodMobywatel(poprzedni: string | undefined, losuj: Losuj): string {
  throw new Error('Zaślepka: u01');
}

/** Nowy kod makiety logowania kodem z aplikacji mZUS: 8 znaków A-Z0-9. */
export function nowyKodMzus(losuj: Losuj): string {
  throw new Error('Zaślepka: u01');
}
