// Rodzaj umowy o pracę i podmioty wsparcia (kontrakt, sekcja 6.5). Właściciel: u22 (Ryzyka, szczególna ochrona i podmioty wsparcia).
// Zaślepka fundamentu: implementuje u22. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { FormularzPodmiotu } from '@/domena/przewodnik/ryzyka';
import type { KontekstOperacji, RodzajUmowyOPrace, RodzicWRodzinie, WynikOperacji } from '@/domena/typy';

export function zapiszRodzajUmowy(rodzic: RodzicWRodzinie, rodzaj: RodzajUmowyOPrace, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}

/** Nowy albo zmieniony podmiot wsparcia w edycjach katalogu. */
export function zapiszPodmiotWsparcia(dane: FormularzPodmiotu, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}
