// Warianty formularza wniosku o urlop: łączenie z pracą i wydłużenie (kontrakt, sekcje 7.2 i 11.2).
// Właściciel: u32 (Wnioski o urlop: warianty formularza i wysyłka) według 11.2; tabela 7.2 przypisuje plik u28.
// Zaślepka fundamentu: implementuje u32. Kontrakt nie podaje parametrów wyliczWydluzenie; ustala je właściciel.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { WniosekOUrlop } from '@/domena/typy';

/** Wydłużenie urlopu rodzicielskiego przy łączeniu z pracą; null, gdy nie dotyczy. */
export function wyliczWydluzenie(...argumenty: unknown[]): NonNullable<WniosekOUrlop['laczenie']> | null {
  return null;
}
