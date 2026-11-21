// Okres zasiłkowy i wynagrodzenie chorobowe z zaświadczeń e-ZLA (kontrakt, sekcja 7.2).
// Właściciel: u14 (Dane ZUS: e-ZLA, rozliczenia składek, statusy wniosków).
// Zaślepka fundamentu: implementuje u14. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { DataISO, KodKomunikatu, ZaswiadczenieEzla } from '@/domena/typy';

export interface WynikOkresuZasilkowego {
  zaswiadczenia: ZaswiadczenieEzla[];
  wykorzystane: number;
  pozostale: number;
  dataWyczerpania: DataISO | null;
}

/** Limity dni wynagrodzenia chorobowego w roku kalendarzowym; kształt ustala właściciel (u14). */
export interface LimityWynagrodzeniaChorobowego {
  podstawowy: number;
  po50Roku: number;
}

export interface WynikWynagrodzeniaChorobowego {
  rok: number;
  limit: number;
  wykorzystane: number;
  pozostale: number;
  zasilekOd?: DataISO;
}

/** Liczba dni niezdolności z zaświadczenia, obie daty włącznie. */
export function liczbaDniZaswiadczenia(z: ZaswiadczenieEzla): number {
  return 0;
}

/** Okres zasiłkowy w ciąży z zaświadczeń, z limitem dni i przerwą zerującą okres. */
export function okresZasilkowyWCiazy(
  zaswiadczenia: ZaswiadczenieEzla[],
  limit: number,
  przerwa: number,
): WynikOkresuZasilkowego {
  return { zaswiadczenia: [], wykorzystane: 0, pozostale: limit, dataWyczerpania: null };
}

/** Dni wynagrodzenia chorobowego wykorzystane w roku `dzis`. */
export function wynagrodzenieChorobowe(
  zaswiadczenia: ZaswiadczenieEzla[],
  dataUrodzenia: DataISO,
  dzis: DataISO,
  limity: LimityWynagrodzeniaChorobowego,
): WynikWynagrodzeniaChorobowego {
  throw new Error('Zaślepka: u14');
}

/** Ostrzeżenia okresu zasiłkowego: 0115, 0086. */
export function ostrzezeniaOkresu(
  wynik: WynikOkresuZasilkowego,
  prog: number,
): { kod: KodKomunikatu; parametry?: Record<string, string> }[] {
  return [];
}
