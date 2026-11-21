// Rozszerzenia typów Danych z konta ZUS (kontrakt, sekcja 12.3). Właściciel: u14.
// Pola są opcjonalne, więc dane zapisane wcześniej i dane innych jednostek pozostają poprawne.
import type { OsZadluzenia } from '@/domena/typy';

declare module '@/domena/typy/dane-zus' {
  interface StanRozliczenSkladek {
    /** Podstawa dnia, na który ZUS ustala stan: dzień porodu, przewidywany termin porodu albo e-ZLA. */
    zrodloDniaPrawa?: 'porod' | 'termin-porodu' | 'e-zla';
  }
  interface DaneZKontaZus {
    /** Stan rozliczeń z PUE/eZUS na każdy dzień do dnia odczytu (symulacja odczytu na dowolny dzień). */
    osZadluzenia?: OsZadluzenia;
  }
  interface ZrodloweDaneKontaZus {
    /** Symulowany PUE/eZUS nie zwraca stanu rozliczeń (0150). */
    stanRozliczenNiedostepny?: boolean;
  }
}

export {};
