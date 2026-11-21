// Ryzyka w ciąży, szczególna ochrona umowy i podmioty wsparcia (kontrakt, sekcja 7.2).
// Właściciel: u22 (Ryzyka, szczególna ochrona i podmioty wsparcia).
// Zaślepka fundamentu: implementuje u22. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type {
  BledyPol,
  DataISO,
  Katalog,
  KodKomunikatu,
  PodmiotWsparcia,
  PrzyczynaUstaniaUmowy,
  RodzajSytuacjiSzczegolnej,
  RodzajUmowyOPrace,
} from '@/domena/typy';

/** Pola formularza ViewCatalogSupportOrganizations; kształt ustala właściciel (u22). */
export type FormularzPodmiotu = Record<string, unknown>;

export interface PrzedluzenieUmowy {
  przedluzonaDoPorodu: boolean;
  kod?: KodKomunikatu;
  parametry?: Record<string, string>;
}

/** Przedłużenie umowy o pracę do dnia porodu (K30: 0121, 0157). */
export function ustalPrzedluzenieUmowy(
  ptp: DataISO,
  dataUstania: DataISO,
  przyczyna: PrzyczynaUstaniaUmowy,
  rodzaj: RodzajUmowyOPrace,
): PrzedluzenieUmowy {
  return { przedluzonaDoPorodu: false };
}

/** Organizacje wsparcia dla sytuacji szczególnej (0159). */
export function organizacjeDlaSytuacji(k: Katalog, sytuacja?: RodzajSytuacjiSzczegolnej): PodmiotWsparcia[] {
  return [];
}

/** Błędy formularza podmiotu wsparcia: 0122, 0006, 0160, 0161, 0124, 0060, 0123, 0162. */
export function walidujPodmiot(f: FormularzPodmiotu, k: Katalog): BledyPol<string> {
  return {};
}
