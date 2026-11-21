'use client';

// Część ViewProfileZusData: stan odczytu Danych z konta ZUS (kontrakt 11.2, u03): odczyt w toku (P02-03),
// komunikat 0001 z ponowieniem odczytu, komunikat 0002 z datą kopii. Gospodarz: widok ViewProfileZusData (u07).
// Teksty: teksty.ViewProfileZusData.stanOdczytuZus.
// Zaślepka fundamentu: właściciel zastępuje treść z zachowaniem nazwy eksportu i może rozszerzyć propsy o pola opcjonalne.
import type { DaneZKontaZus, StanOdczytuZus } from '@/domena/typy';

export interface StanOdczytuDanychZusProps {
  stan: StanOdczytuZus;
  kopia: DaneZKontaZus | null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- zaślepka: propsy wykorzystuje właściciel
export function StanOdczytuDanychZus(props: StanOdczytuDanychZusProps) {
  return null;
}
