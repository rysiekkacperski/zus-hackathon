// Wnioski złożone w ZUS i świadczenia rodzinne kont w symulowanym ZUS (kontrakt, sekcja 8; ANALIZY/15).
// Właściciel: u14. Wnioski wysłane z przewodnika dopisuje `StanSymulowanegoZus.wnioskiZPrzewodnika`.
import type { Pesel, ZrodloweDaneKontaZus } from '@/domena/typy';

export type WnioskiISwiadczeniaKontaZus = Partial<Pick<ZrodloweDaneKontaZus, 'wnioski' | 'swiadczeniaRodzinne'>>;

/** Wnioski i świadczenia rodzinne według numeru PESEL konta. */
export const wnioskiKontZus: Readonly<Partial<Record<Pesel, WnioskiISwiadczeniaKontaZus>>> = {};
