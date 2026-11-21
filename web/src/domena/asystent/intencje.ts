// Intencje wiadomości do asystenta AI (kontrakt, sekcje 7.2 i 10.3). Właściciel: u31 (Asystent AI).
// Zaślepka fundamentu: implementuje u31. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { IntencjaAsystenta } from '@/domena/typy';

/** Intencja ze słów kluczowych, gdy model jest niedostępny. */
export function klasyfikujSlowamiKluczowymi(tekst: string): IntencjaAsystenta {
  return 'poza-zakresem-spoza-katalogu';
}

/** Czy wiadomość ma od 1 do 1000 znaków. */
export function walidujWiadomosc(t: string): boolean {
  return true;
}
