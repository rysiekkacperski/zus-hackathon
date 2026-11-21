// Usunięcie danych rodziny (kontrakt, sekcja 6.5). Właściciel: u02 (Zgoda, powitanie i ustawienia przewodnika).
// Zaślepka fundamentu: implementuje u02. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { KontekstOperacji, WynikOperacji } from '@/domena/typy';

/** Rola NU, rodzina ukryta z terminem +30 dni, ukrycie przypomnień i niewysłanych wniosków, usunięcie logu asystenta. */
export function usunDaneRodziny(ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}
