// Sytuacje szczególne i spokojny tryb (kontrakt, sekcja 6.5). Właściciel: u25 (Sytuacje szczególne i spokojny tryb).
// Zaślepka fundamentu: implementuje u25. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { FormularzSytuacji } from '@/domena/rodzina/sytuacje';
import type { KontekstOperacji, WynikOperacji } from '@/domena/typy';

export function zapiszSytuacjeSzczegolna(dane: FormularzSytuacji, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}

export function wylaczSpokojnyTryb(ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}
