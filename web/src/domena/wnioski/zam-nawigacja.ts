// Nawigacja kreatora ZAM (kontrakt, sekcja 7.2). Właściciel: u27 (Kreator wniosku ZAM do ZUS).
// Zaślepka fundamentu: implementuje u27. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { IdWidoku, WniosekZam } from '@/domena/typy';

/** Ekrany kreatora ZAM w kolejności. */
export const EKRANY_ZAM: IdWidoku[] = [];

/** Następny ekran kreatora dla stanu wniosku. */
export function nastepnyEkranZam(wniosek: WniosekZam): IdWidoku {
  return 'ViewZamLeaveType';
}
