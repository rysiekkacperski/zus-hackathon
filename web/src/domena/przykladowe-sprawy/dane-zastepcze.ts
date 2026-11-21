// Dane zastępcze osób z dokumentów przykładowej sprawy (kontrakt, sekcje 7.2 i 10.2).
// Właściciel: u05 (Przykładowe sprawy: lista, dokumenty i odczyt AI).
// Zaślepka fundamentu: implementuje u05. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { Losuj } from '@/domena/losowanie';
import type { Pesel, Plec } from '@/domena/typy';

/** Słownik imion i nazwisk według płci (dane/przykladowe-sprawy/slownik-imion.ts). */
export type SlownikImion = Record<Plec, { imiona: readonly string[]; nazwiska: readonly string[] }>;

/** PESEL zastępczy: te same cyfry 1–6 i parzystość 10. cyfry, numer różny od oryginału. */
export function peselZastepczy(pesel: Pesel, losuj: Losuj): Pesel {
  throw new Error('Zaślepka: u05');
}

/** Imię i nazwisko zastępcze ze słownika dla płci. */
export function daneZastepcze(plec: Plec, slownik: SlownikImion, losuj: Losuj): { imie: string; nazwisko: string } {
  throw new Error('Zaślepka: u05');
}
