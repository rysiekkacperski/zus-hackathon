// Wniosek ZAM przy przyjęciu dziecka na wychowanie (kontrakt, sekcja 7.2).
// Właściciel: u33 (ZAM: wniosek dla płatnika, przed porodem i przy przyjęciu dziecka).
// Zaślepka fundamentu: implementuje u33. Kontrakt nie podaje parametrów funkcji tego modułu; ustala je właściciel.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { Okres } from '@/domena/typy';

/** Okres urlopu na warunkach urlopu macierzyńskiego. */
export function okresWum(...argumenty: unknown[]): Okres | null {
  return null;
}

/** Wymiar urlopu rodzicielskiego po przyjęciu dziecka w tygodniach. */
export function wymiarRodzicielskiegoPoPrzyjeciu(...argumenty: unknown[]): number {
  throw new Error('Zaślepka: u33');
}

/** Wariant zasiłku po przyjęciu dziecka (0165). */
export function wariantPoPrzyjeciu(...argumenty: unknown[]): '81-5' | '100-70' | null {
  return null;
}

/** Dokumenty dołączane do wniosku przy przyjęciu dziecka (0149). */
export function listaDokumentowPrzyjecia(...argumenty: unknown[]): string[] {
  return [];
}
