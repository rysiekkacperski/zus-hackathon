// Zaproszenie drugiego rodzica (kontrakt, sekcja 7.2). Właściciel: u23 (Dołączenie drugiego rodzica i pełnomocnictwo PEL).
// Zaślepka fundamentu: implementuje u23. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { Losuj } from '@/domena/losowanie';
import type { DataISO, KontoPrzewodnika, StanRodziny, Zaproszenie } from '@/domena/typy';

/** Token zaproszenia: 12 znaków A-Z0-9. */
export function nowyToken(losuj: Losuj): string {
  throw new Error('Zaślepka: u23');
}

/** Stan zaproszenia w dniu `dzis`. Zaślepka zwraca zapisany stan. */
export function stanZaproszenia(z: Zaproszenie, dzis: DataISO): Zaproszenie['stan'] {
  return z.stan;
}

/** Ocena linku zaproszenia dla zalogowanego konta: 0066, 0067, 0068; null, gdy link jest ważny. */
export function ocenLinkZaproszenia(
  token: string,
  konto: KontoPrzewodnika,
  rodzina: StanRodziny | null,
  dzis: DataISO,
): '0066' | '0067' | '0068' | null {
  return null;
}
