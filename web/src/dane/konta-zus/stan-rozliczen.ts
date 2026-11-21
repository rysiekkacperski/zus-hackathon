// Osie zadłużenia kont prowadzących jednoosobową działalność gospodarczą w symulowanym ZUS
// (kontrakt, sekcja 8; ANALIZY/17). Właściciel: u14.
import type { OsZadluzenia, Pesel } from '@/domena/typy';

/** Oś zadłużenia według numeru PESEL płatnika składek na własne ubezpieczenia. */
export const osieZadluzeniaKontZus: Readonly<Partial<Record<Pesel, OsZadluzenia>>> = {};
