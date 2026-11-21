// Reguły terminów spraw (kontrakt, sekcja 7.2). Właściciel: u13 (Kalendarz terminów).
// Zaślepka fundamentu: implementuje u13. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { DataISO, IdSprawy, Katalog, Kotwica, RegulaTerminu } from '@/domena/typy';

/** Daty kotwic terminów rodziny. */
export type KotwiceTerminow = Partial<Record<Exclude<Kotwica, 'brak'>, DataISO>>;

/** Termin wyliczony z reguły terminu pozycji katalogu; null, gdy brak kotwicy albo reguły. */
export function terminZReguly(
  r: RegulaTerminu,
  kotwice: KotwiceTerminow,
  katalog: Katalog,
  liczbaDzieci: number,
  dzis: DataISO,
): DataISO | null {
  return null;
}

/** Następny termin sprawy powtarzalnej po oznaczeniu jej jako załatwionej. */
export function nastepnyTerminPowtarzalny(idSprawy: IdSprawy, dataOznaczenia: DataISO): DataISO | null {
  return null;
}
