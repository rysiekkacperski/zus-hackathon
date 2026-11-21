// Kreator wniosku ZAM do ZUS (kontrakt, sekcja 6.5). Właściciel: u27 (Kreator wniosku ZAM do ZUS).
// Zaślepka fundamentu: implementuje u27. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { IdSprawy, IdWidoku, IdWniosku, KontekstOperacji, WniosekZam, WynikOperacji } from '@/domena/typy';

/** Nowy szkic wniosku ZAM dla sprawy albo szkic zapisany wcześniej (wznowienie od ostatniego ekranu). */
export function rozpocznijLubWznowZam(idSprawy: IdSprawy, ctx: KontekstOperacji): WynikOperacji<WniosekZam> {
  return { ok: false, kod: '0003' };
}

/** Zapis odpowiedzi z ekranu kreatora i ostatniego ekranu. */
export function zapiszKrokZam(
  id: IdWniosku,
  zmiana: Partial<WniosekZam>,
  ekran: IdWidoku,
  ctx: KontekstOperacji,
): WynikOperacji<WniosekZam> {
  return { ok: false, kod: '0003' };
}

/** Wysłanie wniosku do ZUS z numerem potwierdzenia (0044 przy wysylkaDoZusNiedostepna, szkic zachowany). */
export async function wyslijZam(id: IdWniosku, ctx: KontekstOperacji): Promise<WynikOperacji<{ potwierdzenie: string }>> {
  return { ok: false, kod: '0003' };
}

/** Przekazanie danych dziecka do ZUS po porodzie (0232). */
export function przekazDaneDzieckaZus(id: IdWniosku, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}
