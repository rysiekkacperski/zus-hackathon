// Krok planu `statusyZus` (kontrakt, sekcja 7.2). Właściciel: u14 (Dane ZUS: e-ZLA, rozliczenia składek, statusy wniosków).
// Zaślepka fundamentu: zwraca pozycje bez zmian. Właściciel zastępuje treść z zachowaniem nazwy eksportu i podpisu.
import type { KrokPlanu } from '@/domena/plan/kroki/typ';

export const statusyZus: KrokPlanu = (pozycje) => pozycje;

// Wypłaty przy sprawie planu (kontrakt, sekcja 7.2). Zaślepka fundamentu: implementuje u14.
// Właściciel zastępuje treść z zachowaniem nazwy eksportu i podpisu.
import type { DaneZKontaZus, DataISO, PozycjaPlanu, SwiadczenieRodzinneZus, ZasilekWyplacony } from '@/domena/typy';

export interface WyplatyPrzySprawie {
  wyplacone: ZasilekWyplacony[];
  planowane: SwiadczenieRodzinneZus[];
}

export function wyplatyPrzySprawie(sprawa: PozycjaPlanu, kopia: DaneZKontaZus | null, dzis: DataISO): WyplatyPrzySprawie {
  void sprawa;
  void kopia;
  void dzis;
  return { wyplacone: [], planowane: [] };
}
