// Porównanie wariantów zasiłku macierzyńskiego 81,5% i 100%/70% (kontrakt, sekcja 7.2).
// Właściciel: u26 (Kalkulatory wariantu zasiłku i podziału urlopu).
// Zaślepka fundamentu: implementuje u26. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
import type { DataISO, Katalog, KodKomunikatu, PodstawaWymiaru, ZapisPorownaniaWariantow } from '@/domena/typy';

export interface WejsciePorownaniaWariantow {
  podstawa: PodstawaWymiaru;
  dataPorodu: DataISO;
  liczbaDzieci: number;
  zaZyciem: boolean;
  tygodniePrzedPowrotem: number;
  dzis: DataISO;
  katalog: Katalog;
}

export type WynikPorownaniaWariantow = ZapisPorownaniaWariantow['wynik'] & {
  komunikaty: { kod: KodKomunikatu; parametry?: Record<string, string> }[];
};

/** Kwoty miesięczne i sumy obu wariantów. Zaślepka zwraca zerowe kwoty. */
export function porownajWarianty(w: WejsciePorownaniaWariantow): WynikPorownaniaWariantow {
  return {
    wariant81: { miesiecznie: [], suma: 0 },
    wariant100i70: { miesiecznie: [], suma: 0 },
    roznica: 0,
    dataPowrotu: w.dataPorodu,
    komunikaty: [],
  };
}
