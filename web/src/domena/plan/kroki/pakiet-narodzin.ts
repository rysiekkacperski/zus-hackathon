// Krok planu `pakietNarodzin` (kontrakt, sekcja 7.2). Właściciel: u19 (Pakiet narodzin).
// Zaślepka fundamentu: zwraca pozycje bez zmian. Właściciel zastępuje treść z zachowaniem nazwy eksportu i podpisu.
import type { KrokPlanu } from '@/domena/plan/kroki/typ';

export const pakietNarodzin: KrokPlanu = (pozycje) => pozycje;
