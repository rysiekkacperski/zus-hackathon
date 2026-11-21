// Edycja Katalogu świadczeń przez Administratora: nowe wersje wpisów i nowe pozycje (kontrakt, sekcja 7.2).
// Właściciel: u06 (Panel Administratora katalogu).
// Zaślepka fundamentu: implementuje u06. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type {
  BledyPol,
  DataISO,
  IdPozycji,
  Katalog,
  Pesel,
  WersjaWpisu,
  WpisSlownika,
  ZnacznikCzasu,
} from '@/domena/typy';

/** Pola formularza ViewCatalogItemAdd; kształt ustala właściciel (u06). */
export type FormularzNowejPozycji = Record<string, unknown>;

/** Błędy nowej wersji wpisu: 0048, 0016, 0077, 0078, 0151, 0079, 0010, 0049, 0050. */
export function walidujNowaWersje(
  wpis: WpisSlownika,
  wartosci: Record<string, string>,
  od: string,
  dzis: DataISO,
): BledyPol<string> {
  return {};
}

/** Nowa wersja wpisu i dzień zamknięcia poprzedniej wersji. */
export function nowaWersja(
  wpis: WpisSlownika,
  wartosci: Record<string, string>,
  od: string,
  konto: Pesel,
  teraz: ZnacznikCzasu,
): { nowa: WersjaWpisu; zamknijPoprzednia?: DataISO } {
  throw new Error('Zaślepka: u06');
}

/** Błędy nowej pozycji katalogu: 0080, 0081, 0006, 0152, 0153. */
export function walidujNowaPozycje(formularz: FormularzNowejPozycji, k: Katalog): BledyPol<string> {
  return {};
}

/** Kolejny wolny identyfikator pozycji ('K38' …). */
export function nastepnyIdentyfikator(k: Katalog): IdPozycji {
  throw new Error('Zaślepka: u06');
}
