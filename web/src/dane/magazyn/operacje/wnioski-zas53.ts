// Kreator wniosku o zasiłek chorobowy ZAS-53 (kontrakt, sekcja 6.5). Właściciel: u30 (Kreator wniosku o zasiłek chorobowy ZAS-53).
// Zaślepka fundamentu: implementuje u30. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { IdSprawy, IdWidoku, IdWniosku, KontekstOperacji, WniosekZas53, WynikOperacji } from '@/domena/typy';

/** Miejsce rozpoczęcia wniosku: sprawa planu i zaświadczenie e-ZLA; kształt ustala właściciel (u30). */
export interface StartWnioskuZas53 {
  idSprawy?: IdSprawy;
  seriaINumer?: string;
}

export function rozpocznijLubWznowZas53(dane: StartWnioskuZas53, ctx: KontekstOperacji): WynikOperacji<WniosekZas53> {
  return { ok: false, kod: '0003' };
}

export function zapiszKrokZas53(
  id: IdWniosku,
  zmiana: Partial<WniosekZas53>,
  ekran: IdWidoku,
  ctx: KontekstOperacji,
): WynikOperacji<WniosekZas53> {
  return { ok: false, kod: '0003' };
}

/** Wysłanie wniosku do ZUS (0044 przy wysylkaDoZusNiedostepna, szkic zachowany). */
export async function wyslijZas53(id: IdWniosku, ctx: KontekstOperacji): Promise<WynikOperacji<{ potwierdzenie: string }>> {
  return { ok: false, kod: '0003' };
}
