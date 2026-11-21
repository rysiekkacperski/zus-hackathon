// Wysyłka i pobranie wniosku o urlop do pracodawcy (kontrakt, sekcja 6.5). Właściciel: u32 (Wnioski o urlop: warianty formularza i wysyłka).
// Zaślepka fundamentu: implementuje u32. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { IdWniosku, KontekstOperacji, WynikOperacji } from '@/domena/typy';

/** Wysłanie wniosku e-mailem do pracodawcy (0138 przy uslugaEmailNiedostepna). */
export async function wyslijWniosekDoPracodawcy(id: IdWniosku, ctx: KontekstOperacji): Promise<WynikOperacji> {
  return { ok: false, kod: '0003' };
}

/** Wniosek przygotowany do pobrania i wydruku. */
export function pobierzWniosekOUrlop(id: IdWniosku, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}
