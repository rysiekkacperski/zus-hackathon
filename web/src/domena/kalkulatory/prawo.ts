// Prawo rodzica do zasiłku macierzyńskiego w kalkulatorze (kontrakt, sekcja 7.2). Właściciel: u09 (Silnik kalkulatora zasiłku macierzyńskiego).
// Zaślepka fundamentu: implementuje u09. Kontrakt nie podaje typu wyniku; ustala go właściciel.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { DaneWejscioweKalkulatora, KodKomunikatu, RodzicWRodzinie } from '@/domena/typy';

export interface PrawoDoZasilku {
  przysluguje: boolean;
  kod?: KodKomunikatu;
  parametry?: Record<string, string>;
}

/** Prawo rodzica do zasiłku z formy zatrudnienia i ubezpieczenia chorobowego. */
export function ustalPrawoDoZasilku(d: DaneWejscioweKalkulatora, rodzic: RodzicWRodzinie): PrawoDoZasilku {
  return { przysluguje: false };
}
