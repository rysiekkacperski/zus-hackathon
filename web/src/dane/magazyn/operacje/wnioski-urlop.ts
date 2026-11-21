// Kreator wniosków o urlop do pracodawcy (kontrakt, sekcja 6.5). Właściciel: u28 (Wnioski o urlop do pracodawcy: rdzeń).
// Zaślepka fundamentu: implementuje u28. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { IdSprawy, IdWidoku, IdWniosku, KontekstOperacji, WniosekOUrlop, WynikOperacji } from '@/domena/typy';

/** Nowy albo wznowiony szkic wniosku o urlop; `scenariusz` to numer scenariusza kalkulatora albo undefined. */
export function rozpocznijLubWznowWniosekOUrlop(
  idSprawy: IdSprawy,
  scenariusz: number | undefined,
  ctx: KontekstOperacji,
): WynikOperacji<WniosekOUrlop> {
  return { ok: false, kod: '0003' };
}

/** Zapis odpowiedzi z ekranu kreatora i ostatniego ekranu. */
export function zapiszKrokWnioskuOUrlop(
  id: IdWniosku,
  zmiana: Partial<WniosekOUrlop>,
  ekran: IdWidoku,
  ctx: KontekstOperacji,
): WynikOperacji<WniosekOUrlop> {
  return { ok: false, kod: '0003' };
}
