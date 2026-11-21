// Filtr odczytu danych z konta ZUS `korespondencja` (kontrakt, sekcja 7.2). Właściciel: u29 (Pytanie do ZUS, dane konta i odpis aktu urodzenia).
// Zaślepka fundamentu: zwraca kopię bez zmian. Właściciel zastępuje treść z zachowaniem nazwy eksportu i podpisu.
import type { FiltrOdczytu } from '@/domena/dane-zus/filtry/typ';

export const korespondencja: FiltrOdczytu = (kopia) => kopia;
