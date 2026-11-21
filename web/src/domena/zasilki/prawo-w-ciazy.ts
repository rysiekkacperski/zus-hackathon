// Ustalenie prawa do świadczeń z ubezpieczenia chorobowego w ciąży (kontrakt, sekcja 7.2).
// Właściciel: u16 (Świadczenia w ciąży i dokumenty wniosków).
// Zaślepka fundamentu: implementuje u16. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
// Kontrakt nie podaje parametrów podzialZaswiadczenia i sprawdzZadluzenie poza pierwszym; ustala je właściciel.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type {
  DaneCiazyIDziecka,
  DaneRodziny,
  DaneZKontaZus,
  DataISO,
  Katalog,
  WynikUstaleniaPrawa,
  ZaswiadczenieEzla,
} from '@/domena/typy';

export interface WejscieUstaleniaPrawa {
  swiadczenie: WynikUstaleniaPrawa['swiadczenie'];
  wskazanyDzien: DataISO;
  osoba: 'matka' | 'drugi-rodzic';
  daneRodziny: DaneRodziny;
  daneCiazy: DaneCiazyIDziecka | null;
  kopia: DaneZKontaZus | null;
  katalog: Katalog;
  dzis: DataISO;
}

export type PodzialZaswiadczenia = NonNullable<WynikUstaleniaPrawa['podzial']>;
export type ZadluzenieBlokujace = Extract<NonNullable<WynikUstaleniaPrawa['przyczyna']>, { rodzaj: 'zadluzenie' }>;

/** Prawo do świadczenia we wskazanym dniu (K24, K25, K26). Zaślepka zwraca postać „warunek”. */
export function ustalPrawo(w: WejscieUstaleniaPrawa): WynikUstaleniaPrawa {
  return {
    swiadczenie: w.swiadczenie,
    wskazanyDzien: w.wskazanyDzien,
    postac: 'warunek',
    zastosowaneReguly: [],
    daneZeZrodlem: [],
    warunkiBezSprawdzenia: [],
  };
}

/** Podział okresu zaświadczenia na wynagrodzenie chorobowe, zasiłek chorobowy i zasiłek po ustaniu. */
export function podzialZaswiadczenia(z: ZaswiadczenieEzla, ...argumenty: unknown[]): PodzialZaswiadczenia {
  return [];
}

/** Zadłużenie blokujące prawo do świadczenia; null, gdy go brak. */
export function sprawdzZadluzenie(...argumenty: unknown[]): ZadluzenieBlokujace | null {
  return null;
}
