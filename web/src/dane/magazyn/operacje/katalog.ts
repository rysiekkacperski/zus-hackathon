// Edycje Katalogu świadczeń przez Administratora (kontrakt, sekcja 6.5). Właściciel: u06 (Panel Administratora katalogu).
// Zaślepka fundamentu: implementuje u06. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { FormularzNowejPozycji } from '@/domena/katalog/edycja';
import type { IdPozycji, IdWpisuSlownika, KontekstOperacji, WynikOperacji } from '@/domena/typy';

/** Nowa wersja wartości wpisu od dnia `od`; zwiększa edycjeKatalogu.wersja. */
export function dopiszWartosc(
  idWpisu: IdWpisuSlownika,
  wartosci: Record<string, string>,
  od: string,
  ctx: KontekstOperacji,
): WynikOperacji {
  return { ok: false, kod: '0003' };
}

/** Nowa pozycja katalogu; zwiększa edycjeKatalogu.wersja. */
export function dodajPozycje(formularz: FormularzNowejPozycji, ctx: KontekstOperacji): WynikOperacji<{ id: IdPozycji }> {
  return { ok: false, kod: '0003' };
}
