// Rozmowa z asystentem AI i zatwierdzanie proponowanych działań (kontrakt, sekcja 6.5). Właściciel: u31 (Asystent AI).
// Zaślepka fundamentu: implementuje u31. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { KontekstOperacji, WynikOperacji } from '@/domena/typy';

/** Wiadomość do API asystenta (0071 przy asystentNiedostepny, bez wywołania API). */
export async function wyslijWiadomosc(tresc: string, ctx: KontekstOperacji): Promise<WynikOperacji> {
  return { ok: false, kod: '0003' };
}

export function zatwierdzDzialanie(idWiadomosci: string, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}

export function odrzucDzialanie(idWiadomosci: string, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}

export function nowaRozmowa(ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}
