// Wygaśnięcie i odnowienie sesji (kontrakt, sekcja 3.4; analiza 3.1.1, reguła R4).
// Sesja wygasa, gdy od ostatniego działania minęło co najmniej 15 minut:
// ostatnie działanie 10:00:00, działanie 10:14:59 → sesja aktywna; 10:15:00 → sesja wygasła.
import { roznicaSekund } from '@/domena/daty';
import type { ZnacznikCzasu } from '@/domena/typy';

export const CZAS_BEZCZYNNOSCI_SESJI_MINUTY = 15;
export const ODSTEP_ODNOWIENIA_SESJI_SEKUNDY = 30;

export function czySesjaWygasla(ostatnieDzialanie: ZnacznikCzasu, teraz: ZnacznikCzasu): boolean {
  return roznicaSekund(ostatnieDzialanie, teraz) >= CZAS_BEZCZYNNOSCI_SESJI_MINUTY * 60;
}

// Ostatnie działanie odnawiamy najwyżej raz na 30 sekund.
export function czyOdnowicSesje(ostatnieDzialanie: ZnacznikCzasu, teraz: ZnacznikCzasu): boolean {
  return roznicaSekund(ostatnieDzialanie, teraz) >= ODSTEP_ODNOWIENIA_SESJI_SEKUNDY;
}
