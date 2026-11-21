// Symulowane odpowiedzi ZUS na pytania wysłane z przewodnika (kontrakt, sekcja 8; ANALIZY/23).
// Właściciel: u29.
import type { IdSprawy } from '@/domena/typy';

export interface OdpowiedziZus {
  /** Treść odpowiedzi według identyfikatora sprawy, której dotyczy pytanie. */
  wedlugSprawy: Readonly<Partial<Record<IdSprawy, string>>>;
  /** Treść odpowiedzi na pytanie bez sprawy albo na sprawę bez własnej odpowiedzi. */
  ogolna: string;
}

export const odpowiedziZus: OdpowiedziZus = {
  wedlugSprawy: {},
  ogolna: '',
};
