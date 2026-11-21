// Filtr odczytu danych z konta ZUS `podstawowe` (kontrakt, sekcja 7.2). Właściciel: u03 (Odczyt danych z konta ZUS: podstawy z 12 miesięcy, zasiłki z 6 miesięcy).
// Zaślepka fundamentu: zwraca kopię bez zmian. Właściciel zastępuje treść z zachowaniem nazwy eksportu i podpisu.
import type { FiltrOdczytu } from '@/domena/dane-zus/filtry/typ';

export const podstawowe: FiltrOdczytu = (kopia) => kopia;
