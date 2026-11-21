// Krok planu `okresZasilkowyEzla` (kontrakt, sekcja 7.2). Właściciel: u14 (Dane ZUS: e-ZLA, rozliczenia składek, statusy wniosków).
// Zaślepka fundamentu: zwraca pozycje bez zmian. Właściciel zastępuje treść z zachowaniem nazwy eksportu i podpisu.
import type { KrokPlanu } from '@/domena/plan/kroki/typ';

export const okresZasilkowyEzla: KrokPlanu = (pozycje) => pozycje;
