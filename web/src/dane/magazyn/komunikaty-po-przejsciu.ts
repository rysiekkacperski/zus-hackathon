// Komunikaty po przejściu (kontrakt, sekcja 6.8). Operacja ustawia komunikat przed nawigacją,
// a nagłówek strony docelowego widoku odbiera go po wejściu na ekran. Komunikaty żyją
// w sessionStorage, więc dotyczą wyłącznie bieżącej karty.
import type { IdWidoku, KomunikatPoPrzejsciu } from '@/domena/typy';
import { KLUCZ_KOMUNIKATY_PO_PRZEJSCIU } from '@/dane/magazyn/klucze';
import { odczytaj, usunSystemowe, zapiszSystemowe } from '@/dane/magazyn/rdzen';

function oczekujace(): KomunikatPoPrzejsciu[] {
  return odczytaj<KomunikatPoPrzejsciu[]>(KLUCZ_KOMUNIKATY_PO_PRZEJSCIU, 'sessionStorage') ?? [];
}

function zapiszOczekujace(komunikaty: KomunikatPoPrzejsciu[]): void {
  if (komunikaty.length === 0) usunSystemowe(KLUCZ_KOMUNIKATY_PO_PRZEJSCIU, 'sessionStorage');
  else zapiszSystemowe(KLUCZ_KOMUNIKATY_PO_PRZEJSCIU, komunikaty, 'sessionStorage');
}

function dlaWidoku(komunikat: KomunikatPoPrzejsciu, idWidoku: IdWidoku): boolean {
  return komunikat.dlaWidoku === undefined || komunikat.dlaWidoku === idWidoku;
}

/**
 * Ustawia komunikat dla następnego widoku (bez `dlaWidoku`) albo dla wskazanego widoku.
 * Ten sam kod dla tego samego widoku zastępuje wcześniejszy wpis, więc komunikat pojawia się raz.
 */
export function ustawKomunikatPoPrzejsciu(komunikat: KomunikatPoPrzejsciu): void {
  const pozostale = oczekujace().filter((k) => !(k.kod === komunikat.kod && k.dlaWidoku === komunikat.dlaWidoku));
  zapiszOczekujace([...pozostale, komunikat]);
}

/** Komunikaty dla widoku bez usuwania (podgląd). */
export function podejrzyjKomunikatyPoPrzejsciu(idWidoku: IdWidoku): KomunikatPoPrzejsciu[] {
  return oczekujace().filter((k) => dlaWidoku(k, idWidoku));
}

/** Odczytuje i usuwa komunikaty dla widoku; komunikaty innych widoków czekają dalej. */
export function odbierzKomunikatyPoPrzejsciu(idWidoku: IdWidoku): KomunikatPoPrzejsciu[] {
  const wszystkie = oczekujace();
  const odebrane = wszystkie.filter((k) => dlaWidoku(k, idWidoku));
  if (odebrane.length > 0) zapiszOczekujace(wszystkie.filter((k) => !dlaWidoku(k, idWidoku)));
  return odebrane;
}
