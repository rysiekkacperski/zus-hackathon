// Dane przyjęcia dziecka w szkicu profilu (kontrakt, sekcja 6.5). Właściciel: u24 (Przyjęcie dziecka na wychowanie).
// Zaślepka fundamentu: implementuje u24. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { FormularzPrzyjecia } from '@/domena/rodzina/przyjecie';
import type { KontekstOperacji, WynikOperacji } from '@/domena/typy';

export function zapiszDanePrzyjeciaWSzkicu(dane: FormularzPrzyjecia, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}
