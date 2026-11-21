// Plik kalendarza .ics z terminami (kontrakt, sekcja 7.2). Właściciel: u18 (Przypomnienia, skrzynka demo i plik kalendarza).
// Zaślepka fundamentu: implementuje u18. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { DataISO, ZnacznikCzasu } from '@/domena/typy';

export interface TerminDoKalendarza {
  tytul: string;
  data: DataISO;
  opis: string;
}

/** Treść pliku iCalendar z wydarzeniami całodniowymi. */
export function zbudujIcs(terminy: TerminDoKalendarza[], teraz: ZnacznikCzasu): string {
  throw new Error('Zaślepka: u18');
}
