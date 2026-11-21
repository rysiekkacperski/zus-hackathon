// Krok planu `warunkiKatalogu` (kontrakt, sekcja 7.2). Właściciel: u08 (Silnik planu rodziny).
// Zaślepka fundamentu: zwraca pozycje bez zmian. Właściciel zastępuje treść z zachowaniem nazwy eksportu i podpisu.
import type { KrokPlanu } from '@/domena/plan/kroki/typ';

export const warunkiKatalogu: KrokPlanu = (pozycje) => pozycje;
