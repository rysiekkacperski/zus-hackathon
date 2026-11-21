// Przejęcie urlopu macierzyńskiego przez ojca (kontrakt, sekcja 7.2). Właściciel: u34 (Rezygnacja matki i wniosek ojca o zasiłek).
// Zaślepka fundamentu: implementuje u34. Kontrakt nie podaje parametrów funkcji tego modułu; ustala je właściciel.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { IdWidoku, KodKomunikatu, Okres } from '@/domena/typy';

/** Ekran startowy przejęcia urlopu (0064, 0144, 0210). */
export function otworzPrzejecie(...argumenty: unknown[]): { cel: IdWidoku; kod?: KodKomunikatu } {
  return { cel: 'ViewFatherTakeover' };
}

/** Okres urlopu przejętego przez ojca (0097, 0042). */
export function wyliczOkresPrzejecia(...argumenty: unknown[]): Okres | { kod: '0097' | '0042' } {
  throw new Error('Zaślepka: u34');
}

/** Ostrzeżenie o terminie wniosku ojca (0208); null, gdy brak. */
export function ostrzezenieTerminuWnioskuOjca(...argumenty: unknown[]): '0208' | null {
  return null;
}
