// Pełnomocnictwa PEL i dane mocodawców w symulowanym ZUS (kontrakt, sekcja 8; ANALIZY/19).
// Właściciel: u23.
import type { PelnomocnictwoPel, Pesel, ZrodloweDaneKontaZus } from '@/domena/typy';

/** Pełnomocnictwa PEL według numeru PESEL konta, na którym ZUS je pokazuje. */
export const pelnomocnictwaKontZus: Readonly<Partial<Record<Pesel, readonly PelnomocnictwoPel[]>>> = {};

/**
 * Pełne dane źródłowe mocodawców spoza listy kont przykładowych, czytane przy odczycie danych z pełnomocnictwa PEL.
 * Mocodawca, który ma konto przykładowe, korzysta z danych pozostałych plików rejestru.
 */
export const kontaMocodawcowZus: Readonly<Partial<Record<Pesel, ZrodloweDaneKontaZus>>> = {};
