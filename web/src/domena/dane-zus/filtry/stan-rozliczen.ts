// Filtr odczytu danych z konta ZUS `stanRozliczen` (kontrakt, sekcja 7.2). Właściciel: u14 (Dane ZUS: stan rozliczeń składek).
// Zaślepka fundamentu: zwraca kopię bez zmian. Właściciel zastępuje treść z zachowaniem nazwy eksportu i podpisu.
import type { FiltrOdczytu } from '@/domena/dane-zus/filtry/typ';

export const stanRozliczen: FiltrOdczytu = (kopia) => kopia;
