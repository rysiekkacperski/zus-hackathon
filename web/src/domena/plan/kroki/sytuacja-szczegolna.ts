// Krok planu `sytuacjaSzczegolna` (kontrakt, sekcja 7.2). Właściciel: u25 (Sytuacje szczególne i spokojny tryb).
// Zaślepka fundamentu: zwraca pozycje bez zmian. Właściciel zastępuje treść z zachowaniem nazwy eksportu i podpisu.
import type { KrokPlanu } from '@/domena/plan/kroki/typ';

export const sytuacjaSzczegolna: KrokPlanu = (pozycje) => pozycje;
