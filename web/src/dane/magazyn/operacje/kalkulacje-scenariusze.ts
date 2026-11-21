// Scenariusze kalkulatora zasiłku macierzyńskiego (kontrakt, sekcja 6.5).
// Właściciel: u20 (Kalkulator: urlopy obojga rodziców, łączenie z pracą, powrót, scenariusze).
// Zaślepka fundamentu: implementuje u20. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { IdWniosku, KontekstOperacji, ScenariuszKalkulatora, WynikOperacji } from '@/domena/typy';

/** Scenariusz przed nadaniem numeru, daty zapisu i konta. */
export type NowyScenariuszKalkulatora = Omit<ScenariuszKalkulatora, 'numer' | 'zapisano' | 'konto' | 'wybranyWPlanie'>;

export function zapiszScenariusz(
  scenariusz: NowyScenariuszKalkulatora,
  ctx: KontekstOperacji,
): WynikOperacji<{ numer: number }> {
  return { ok: false, kod: '0003' };
}

/** Wybór scenariusza w planie rodziny (wybrany wariant spraw przez zapiszWybranyWariant). */
export function zapiszScenariuszWPlanie(numer: number, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}

/** Przeniesienie okresów scenariusza do wniosku ZAM. */
export function przeniesDoZam(numer: number, ctx: KontekstOperacji): WynikOperacji<{ idWniosku: IdWniosku }> {
  return { ok: false, kod: '0003' };
}

/** Przeniesienie okresów scenariusza do wniosku o urlop do pracodawcy. */
export function przeniesDoWnioskuOUrlop(numer: number, ctx: KontekstOperacji): WynikOperacji<{ idWniosku: IdWniosku }> {
  return { ok: false, kod: '0003' };
}
