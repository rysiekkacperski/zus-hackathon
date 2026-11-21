// Rozszerzenia typów wspólnych jednostki u18 (kontrakt, sekcja 12.3).
// Przypomnienie o terminie przechowuje koszt albo skutek spóźnienia, żeby doręczenie i skrzynka
// demonstracyjna składały treść wiadomości z bieżącym tytułem sprawy z katalogu.
import type { KosztSpoznienia } from '@/domena/typy/terminy';

declare module '@/domena/typy/powiadomienia' {
  interface Powiadomienie {
    kosztSpoznienia?: KosztSpoznienia;
  }
}

export {};
