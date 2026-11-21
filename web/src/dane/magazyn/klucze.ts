// Klucze magazynu w przeglądarce (kontrakt, sekcja 6.2). Nowe klucze dodaje wyłącznie koordynator.
import type { IdRodziny, Pesel } from '@/domena/typy';

/** Wersja układu stanu zapisana w kluczu `ppm:v1:meta` i w przedrostku każdego klucza. */
export const WERSJA_SCHEMATU = 1 as const;

/** Przedrostek wszystkich kluczy przewodnika w localStorage i sessionStorage, niezależnie od wersji. */
export const PRZEDROSTEK_PRZEWODNIKA = 'ppm:';

/** Przedrostek kluczy bieżącej wersji układu. */
export const PRZEDROSTEK = `ppm:v${WERSJA_SCHEMATU}:` as const;

// localStorage
export const KLUCZ_META = `${PRZEDROSTEK}meta`;
export const KLUCZ_GLOBALNE = `${PRZEDROSTEK}globalne`;
export const PRZEDROSTEK_KONTA = `${PRZEDROSTEK}konto:`;
export const PRZEDROSTEK_RODZINY = `${PRZEDROSTEK}rodzina:`;
export const PRZEDROSTEK_ZUS = `${PRZEDROSTEK}zus:`;
export const KLUCZ_SESJA = `${PRZEDROSTEK}sesja`;
export const PRZEDROSTEK_DANYCH_SESJI = `${PRZEDROSTEK}sesja-dane:`;
export const KLUCZ_UI = `${PRZEDROSTEK}ui`;

// sessionStorage
export const KLUCZ_LOGOWANIE = `${PRZEDROSTEK}logowanie`;
export const KLUCZ_KOMUNIKATY_PO_PRZEJSCIU = `${PRZEDROSTEK}komunikaty-po-przejsciu`;
export const PRZEDROSTEK_ODCZYTANO = `${PRZEDROSTEK}odczytano:`;

// IndexedDB
export const NAZWA_BAZY_PLIKOW = 'ppm-pliki';
export const WERSJA_BAZY_PLIKOW = 1;
export const MAGAZYN_PLIKOW = 'pliki';

export function kluczKonta(pesel: Pesel): string {
  return `${PRZEDROSTEK_KONTA}${pesel}`;
}

export function kluczRodziny(idRodziny: IdRodziny): string {
  return `${PRZEDROSTEK_RODZINY}${idRodziny}`;
}

export function kluczZus(pesel: Pesel): string {
  return `${PRZEDROSTEK_ZUS}${pesel}`;
}

export function kluczDanychSesji(idSesji: string): string {
  return `${PRZEDROSTEK_DANYCH_SESJI}${idSesji}`;
}

export function kluczOdczytano(idSesji: string): string {
  return `${PRZEDROSTEK_ODCZYTANO}${idSesji}`;
}
