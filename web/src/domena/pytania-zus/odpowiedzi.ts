// Symulowana odpowiedź ZUS na pytanie (kontrakt, sekcja 7.2). Właściciel: u29 (Pytanie do ZUS, dane konta i odpis aktu urodzenia).
// Zaślepka fundamentu: implementuje u29. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { OdpowiedziZus } from '@/dane/konta-zus/odpowiedzi-zus';
import type { PytanieDoZus, ZnacznikCzasu } from '@/domena/typy';

/** Odpowiedź po `opoznienieDni` dniach od wysłania; null, gdy jeszcze nie nadeszła. */
export function symulowanaOdpowiedz(
  pytanie: PytanieDoZus,
  odpowiedzi: OdpowiedziZus,
  teraz: ZnacznikCzasu,
  opoznienieDni: number,
): NonNullable<PytanieDoZus['odpowiedz']> | null {
  return null;
}
