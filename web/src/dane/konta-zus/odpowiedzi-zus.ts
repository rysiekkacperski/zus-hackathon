// Symulowane odpowiedzi ZUS na pytania wysłane z przewodnika (kontrakt, sekcja 8; ANALIZY/23).
// Właściciel: u29.
// Treści są odpowiedziami trybu demonstracyjnego bez rozstrzygnięć prawnych; dokument symulowanych odpowiedzi
// dla spraw K01–K37 dostarcza zespół i zastępuje nim wpisy `wedlugSprawy`.
import type { IdSprawy } from '@/domena/typy';

export interface OdpowiedziZus {
  /** Treść odpowiedzi według identyfikatora sprawy, której dotyczy pytanie. */
  wedlugSprawy: Readonly<Partial<Record<IdSprawy, string>>>;
  /** Treść odpowiedzi na pytanie bez sprawy albo na sprawę bez własnej odpowiedzi. */
  ogolna: string;
}

export const odpowiedziZus: OdpowiedziZus = {
  wedlugSprawy: {
    K08:
      'Dziękujemy za pytanie w sprawie wniosku o zasiłek macierzyński. To odpowiedź symulowana w trybie demonstracyjnym przewodnika. ' +
      'Odpowiedź konsultanta ZUS w tej sprawie zobaczysz w tym miejscu i w korespondencji w eZUS.',
  },
  ogolna:
    'Dziękujemy za pytanie. To odpowiedź symulowana w trybie demonstracyjnym przewodnika. ' +
    'Odpowiedź konsultanta ZUS zobaczysz w tym miejscu i w korespondencji w eZUS.',
};
