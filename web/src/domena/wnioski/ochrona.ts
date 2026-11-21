// Szczególna ochrona stosunku pracy po złożeniu wniosku o urlop (kontrakt, sekcja 7.2).
// Właściciel: u22 (Ryzyka, szczególna ochrona i podmioty wsparcia).
// Zaślepka fundamentu: implementuje u22. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { DataISO, Okres, RodzajUrlopu, Wniosek } from '@/domena/typy';

/** Początek ochrony: 14, 21 albo 7 dni przed początkiem urlopu, nie wcześniej niż złożenie wniosku. Zaślepka zwraca dzień złożenia. */
export function poczatekOchrony(dataZlozenia: DataISO, poczatekUrlopu: DataISO, rodzajUrlopu: RodzajUrlopu): DataISO {
  return dataZlozenia;
}

/** Okresy ochrony z wysłanych wniosków o urlop (0158). */
export function okresyOchrony(wnioski: Wniosek[]): Okres[] {
  return [];
}
