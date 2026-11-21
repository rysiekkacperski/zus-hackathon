// Zaświadczenia lekarskie e-ZLA kont w symulowanym ZUS (kontrakt, sekcja 8; ANALIZY/16).
// Właściciel: u14.
import type { Pesel, ZaswiadczenieEzla } from '@/domena/typy';

/** Zaświadczenia e-ZLA według numeru PESEL ubezpieczonego. */
export const zaswiadczeniaEzlaKontZus: Readonly<Partial<Record<Pesel, readonly ZaswiadczenieEzla[]>>> = {};
