// Filtr odczytu danych z konta ZUS `ezla` (kontrakt, sekcja 7.2). Właściciel: u14 (Dane ZUS: zaświadczenia e-ZLA z 12 miesięcy).
// Zaślepka fundamentu: zwraca kopię bez zmian. Właściciel zastępuje treść z zachowaniem nazwy eksportu i podpisu.
import type { FiltrOdczytu } from '@/domena/dane-zus/filtry/typ';

export const ezla: FiltrOdczytu = (kopia) => kopia;
