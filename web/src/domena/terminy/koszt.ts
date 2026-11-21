// Koszt spóźnienia sprawy (kontrakt, sekcja 7.2). Właściciel: u13 (Kalendarz terminów).
// Zaślepka fundamentu: implementuje u13. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { DataISO, Grosze, Katalog, KosztSpoznienia, PozycjaKatalogu } from '@/domena/typy';

/** Koszt spóźnienia ze sprawy katalogu, terminu i dochodu na osobę. */
export function wyliczKosztSpoznienia(
  pozycja: PozycjaKatalogu,
  termin: DataISO | null,
  dzis: DataISO,
  katalog: Katalog,
  liczbaDzieci: number,
  dochod: Grosze | 'nieznany' | null,
): KosztSpoznienia {
  return { rodzaj: 'brak' };
}
