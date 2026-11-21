// Odczyt Katalogu świadczeń: wartości obowiązujące, historia wpisów, pozycje (kontrakt, sekcja 7.2).
// Właściciel: u04 (Katalog świadczeń: zawartość).
// Zaślepka fundamentu: implementuje u04. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type {
  DataISO,
  IdPozycji,
  IdRegulySwiadczenia,
  IdSprawy,
  IdWpisuSlownika,
  Katalog,
  PozycjaKatalogu,
  WartoscObowiazujaca,
  WersjaWpisu,
  WpisSlownika,
} from '@/domena/typy';

export type StanWersjiWpisu = 'obowiazuje' | 'zaplanowana' | 'zakonczona';

/** Wartość wariantu wpisu obowiązująca w dniu `dzien` (od ≤ dzien ≤ do); null, gdy brak wersji. */
export function wartoscObowiazujaca(
  k: Katalog,
  idWpisu: IdWpisuSlownika,
  dzien: DataISO,
  wariant: string,
): WartoscObowiazujaca | null {
  return null;
}

/** Wersje wpisu ze stanem względem dnia `dzis`. */
export function historiaWpisu(
  k: Katalog,
  idWpisu: IdWpisuSlownika,
  dzis: DataISO,
): (WersjaWpisu & { stan: StanWersjiWpisu })[] {
  return [];
}

/** Pozycja katalogu o identyfikatorze `id`. */
export function pozycja(k: Katalog, id: IdPozycji): PozycjaKatalogu {
  const znaleziona = k.pozycje.find((p) => p.id === id);
  if (znaleziona === undefined) throw new Error('Zaślepka: u04');
  return znaleziona;
}

/** Tytuł sprawy planu; zaślepka zwraca identyfikator sprawy. */
export function tytulSprawy(k: Katalog, idSprawy: IdSprawy): string {
  return idSprawy;
}

/** Wpisy słowników kwot i wymiarów, z których korzysta reguła świadczenia. */
export function wpisyReguly(k: Katalog, idReguly: IdRegulySwiadczenia): WpisSlownika[] {
  return [];
}
