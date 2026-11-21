// Krok planu `przyjecieDziecka` (kontrakt, sekcja 7.2). Właściciel: u24 (Przyjęcie dziecka na wychowanie).
// Zaślepka fundamentu: zwraca pozycje bez zmian. Właściciel zastępuje treść z zachowaniem nazwy eksportu i podpisu.
import type { KrokPlanu } from '@/domena/plan/kroki/typ';

export const przyjecieDziecka: KrokPlanu = (pozycje) => pozycje;
