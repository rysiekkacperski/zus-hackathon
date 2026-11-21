// Dane podstawowe kont przykładowych w symulowanym ZUS (kontrakt, sekcja 8; ANALIZY/02 sekcja 11).
// Właściciel: u03. Plik zawiera tytuły ubezpieczenia z ubezpieczeniem chorobowym, podstawami składek
// i płatnikami z NIP i REGON, członków rodziny, zasiłki, adresy i e-maile `@example.com`.
import type { Pesel, ZrodloweDaneKontaZus } from '@/domena/typy';

export type DanePodstawoweKontaZus = Pick<
  ZrodloweDaneKontaZus,
  'tytuly' | 'czlonkowieRodziny' | 'zasilki' | 'emailEzus' | 'adres'
>;

/** Dane podstawowe według numeru PESEL konta. Rejestr `dane/konta-zus/index.ts` łączy je z pozostałymi plikami. */
export const danePodstawoweKontZus: Readonly<Partial<Record<Pesel, DanePodstawoweKontaZus>>> = {};
