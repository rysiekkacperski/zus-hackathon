// Krok planu `straznik` (kontrakt, sekcja 7.2). Właściciel: u12 (Ekrany planu, strona główna i strażnik).
// Zaślepka fundamentu: zwraca pozycje bez zmian. Właściciel zastępuje treść z zachowaniem nazwy eksportu i podpisu.
import type { KrokPlanu } from '@/domena/plan/kroki/typ';

export const straznik: KrokPlanu = (pozycje) => pozycje;
