// Dziecko zgłoszone w symulowanym ZUS (kontrakt, sekcja 7.2; analiza 3.4.1, reguła R8).
// Właściciel: u01 (Logowanie i konta demonstracyjne).
import { dodajDni } from '@/domena/daty';
import { zbudujPesel } from '@/domena/pesel';
import type { CzlonekRodzinyZus, DataISO } from '@/domena/typy';

/** Imię dziecka z symulacji zgłoszenia. */
export const IMIE_DZIECKA_Z_SYMULACJI = 'Zofia';

/** Dziecko z symulacji rodzi się tyle dni przed dniem symulacji. */
export const DNI_OD_URODZENIA_DZIECKA_Z_SYMULACJI = 2;

/** Stałe cyfry 7–9 numeru PESEL dziecka z symulacji; cyfra 10 to parzysta 2 (kobieta). */
const CYFRY_SERII = '078';
const CYFRA_PLCI = 2;

/**
 * Zofia z nazwiskiem konta, urodzona dzis − 2 dni, PESEL RRMMDD + '0782' + cyfra kontrolna.
 * Dla dnia 21.11.2026 i konta Anna Nowak: Zofia Nowak, 19.11.2026, PESEL 26311907825.
 */
export function dzieckoZSymulacji(konto: { nazwisko: string }, dzis: DataISO): Omit<CzlonekRodzinyZus, 'noweDziecko'> {
  const dataUrodzenia = dodajDni(dzis, -DNI_OD_URODZENIA_DZIECKA_Z_SYMULACJI);
  return {
    imie: IMIE_DZIECKA_Z_SYMULACJI,
    nazwisko: konto.nazwisko,
    pesel: zbudujPesel(dataUrodzenia, 'kobieta', CYFRY_SERII, CYFRA_PLCI),
    dataUrodzenia,
  };
}
