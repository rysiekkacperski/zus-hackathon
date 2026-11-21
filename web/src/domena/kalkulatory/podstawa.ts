// Podstawa wymiaru zasiłku macierzyńskiego (kontrakt, sekcja 7.2). Właściciel: u09 (Silnik kalkulatora zasiłku macierzyńskiego).
// Zaślepka fundamentu: implementuje u09. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { DataISO, FormaZatrudnienia, Katalog, MiesiacISO, PodstawaSkladek, PodstawaWymiaru } from '@/domena/typy';

export interface WejsciePodstawy {
  podstawy: PodstawaSkladek[];
  forma: FormaZatrudnienia;
  pelnyEtat: boolean;
  miesiacPrawa: MiesiacISO;
  katalog: Katalog;
  dzien: DataISO;
}

/** Podstawa wymiaru z podstaw składek z 12 miesięcy; 0094 albo 0173, gdy nie da się jej wyliczyć. */
export function wyliczPodstawe(w: WejsciePodstawy): PodstawaWymiaru | { kod: '0094' | '0173' } {
  return { kod: '0094' };
}
