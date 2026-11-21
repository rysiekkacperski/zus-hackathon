// Filtr odczytu danych z konta ZUS `pelnomocnictwa` (kontrakt, sekcja 7.2). Właściciel: u23 (Dołączenie drugiego rodzica i pełnomocnictwo PEL).
// Zaślepka fundamentu: zwraca kopię bez zmian. Właściciel zastępuje treść z zachowaniem nazwy eksportu i podpisu.
import type { FiltrOdczytu } from '@/domena/dane-zus/filtry/typ';

export const pelnomocnictwa: FiltrOdczytu = (kopia) => kopia;
