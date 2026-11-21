// Kontekst pytania do ZUS (kontrakt, sekcja 7.2). Właściciel: u29 (Pytanie do ZUS, dane konta i odpis aktu urodzenia).
// Zaślepka fundamentu: implementuje u29. Kontrakt nie podaje parametrów zbudujKontekstPytania; ustala je właściciel.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { KontekstPytaniaDoZus } from '@/domena/typy';

/** Kontekst sprawy i profilu dołączany do pytania. Zaślepka zwraca pusty profil. */
export function zbudujKontekstPytania(...argumenty: unknown[]): KontekstPytaniaDoZus {
  return { profil: {} };
}
