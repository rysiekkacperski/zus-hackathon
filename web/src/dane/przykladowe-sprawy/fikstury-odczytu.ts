// Wyniki odczytu dokumentów demonstracyjnych przy symulacji odczytDokumentu = 'fikstura' (kontrakt, sekcje 6.6 i 8).
// Właściciel: u05 (Przykładowe sprawy: lista, dokumenty i odczyt AI).
// Zaślepka fundamentu: implementuje u05. Klucz (np. nazwa pliku) i nazwę eksportu ustala właściciel.
import type { WynikOdczytuDokumentu } from '@/domena/typy';

export const fiksturyOdczytu: Readonly<Record<string, WynikOdczytuDokumentu>> = {};
