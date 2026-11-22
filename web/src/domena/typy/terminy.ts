// Grupa danych 9 Terminy (kontrakt, sekcja 5.10).
// Element systemu: Kalendarz terminów.
import type { Kotwica } from '@/domena/typy/katalog';
import type { KodKomunikatu } from '@/domena/typy/komunikaty';
import type { DataISO, Grosze, IdSprawy, MiesiacISO, ZnacznikCzasu } from '@/domena/typy/wspolne';

export type KosztSpoznienia =
  | { rodzaj: 'brak' }
  | { rodzaj: 'skutek'; tekst: string }
  | { rodzaj: 'kwota'; kwota: Grosze; moment: 'dzien-po-terminie' | 'na-dzis'; rozbicie: { miesiac: MiesiacISO; kwotaNaDziecko: Grosze }[]; liczbaDzieci: number; tekst?: string };
export interface TerminSprawy {
  idSprawy: IdSprawy; termin: DataISO | null;
  drugiTermin?: { data: DataISO; kluczEtykiety: string };
  kotwica: { rodzaj: Kotwica | 'rok-kalendarzowy'; data: DataISO; opis: string } | null;
  szacowany: boolean; dniDoTerminu: number | null; poTerminie: boolean;
  powtarzalny?: { poczatekSkladania?: DataISO; zalecanyTermin?: DataISO; nastepnyTermin?: DataISO; powrotDoZrobienia?: DataISO };
  koszt: KosztSpoznienia; kodBrakuTerminu?: KodKomunikatu;   // np. 0192, 0259
}
export interface KalendarzTerminow { terminy: TerminSprawy[]; wyliczono: ZnacznikCzasu }
