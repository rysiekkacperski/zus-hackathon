// Oznaczenie nowych dzieci w kopii Danych z konta ZUS (kontrakt, sekcje 7.2 i 11.2). Właściciel: u03 (Odczyt danych z konta ZUS).
// Zaślepka fundamentu: implementuje u03. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
// Moduł domena/dane-zus/odczyt.ts reeksportuje oznaczNoweDzieci.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { CzlonekRodzinyZus, DaneZKontaZus, DataISO } from '@/domena/typy';

/** Członkowie rodziny z oznaczeniem dzieci, których nie było w poprzedniej kopii. Zaślepka nie oznacza żadnego. */
export function oznaczNoweDzieci(
  czlonkowie: Omit<CzlonekRodzinyZus, 'noweDziecko'>[],
  poprzednia: DaneZKontaZus | null,
  dzienOdczytu: DataISO,
): CzlonekRodzinyZus[] {
  return czlonkowie.map((czlonek) => ({ ...czlonek, noweDziecko: false }));
}
