// Słownik imion i nazwisk zastępczych według płci (kontrakt, sekcja 8). Właściciel: u05 (Przykładowe sprawy: lista, dokumenty i odczyt AI).
// Zaślepka fundamentu: implementuje u05. Nazwę eksportu ustala właściciel.
import type { SlownikImion } from '@/domena/przykladowe-sprawy/dane-zastepcze';

export const slownikImion: SlownikImion = {
  kobieta: { imiona: [], nazwiska: [] },
  mezczyzna: { imiona: [], nazwiska: [] },
};
