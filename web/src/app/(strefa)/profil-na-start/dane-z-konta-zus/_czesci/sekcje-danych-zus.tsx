'use client';

// Część ViewProfileZusData: sekcje kopii Danych z konta ZUS (kontrakt 11.2, u03): tytuły ubezpieczenia,
// ubezpieczenie chorobowe, podstawy składek, płatnicy, członkowie rodziny i zasiłki, także stan pustych danych.
// Gospodarz: widok ViewProfileZusData (u07). Teksty: teksty.ViewProfileZusData.sekcjeDanychZus.
// Zaślepka fundamentu: właściciel zastępuje treść z zachowaniem nazwy eksportu i może rozszerzyć propsy o pola opcjonalne.
import type { DaneZKontaZus } from '@/domena/typy';

export interface SekcjeDanychZusProps {
  kopia: DaneZKontaZus;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- zaślepka: propsy wykorzystuje właściciel
export function SekcjeDanychZus(props: SekcjeDanychZusProps) {
  return null;
}
