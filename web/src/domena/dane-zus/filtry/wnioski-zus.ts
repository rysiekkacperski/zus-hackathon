// Filtr odczytu danych z konta ZUS `wnioskiZus` (kontrakt, sekcja 7.2). Właściciel: u14 (Dane ZUS: statusy wniosków).
// Zaślepka fundamentu: zwraca kopię bez zmian. Właściciel zastępuje treść z zachowaniem nazwy eksportu i podpisu.
import type { FiltrOdczytu } from '@/domena/dane-zus/filtry/typ';

export const wnioskiZus: FiltrOdczytu = (kopia) => kopia;
