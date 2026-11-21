// Decyzja o zgodzie na dane dotyczące zdrowia (kontrakt, sekcja 6.5). Właściciel: u02 (Zgoda, powitanie i ustawienia przewodnika).
// Zaślepka fundamentu: implementuje u02. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { KontekstOperacji, RodzajDecyzjiOZgodzie, WynikOperacji } from '@/domena/typy';

/** Rekord decyzji; wycofanie wyłącza dane ciąży z użycia, wyznacza termin usunięcia +30 dni i przelicza rodzinę. */
export function zapiszDecyzjeOZgodzie(rodzaj: RodzajDecyzjiOZgodzie, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}
