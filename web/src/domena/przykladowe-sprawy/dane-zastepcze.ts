// Dane zastępcze osób z dokumentów przykładowej sprawy (kontrakt, sekcje 7.2 i 10.2).
// Właściciel: u05 (Przykładowe sprawy: lista, dokumenty i odczyt AI).
// Numer zastępczy zachowuje cyfry 1–6 (data urodzenia) i parzystość 10. cyfry (płeć), losuje cyfry 7–9
// i 10. cyfrę tej samej parzystości, wylicza cyfrę kontrolną i różni się od numeru z dokumentu.
import { losoweCyfry, losowaLiczbaCalkowita, type Losuj } from '@/domena/losowanie';
import { cyfraKontrolnaPesel } from '@/domena/pesel';
import type { Pesel, Plec } from '@/domena/typy';

/** Słownik imion i nazwisk według płci (dane/przykladowe-sprawy/slownik-imion.ts). */
export type SlownikImion = Record<Plec, { imiona: readonly string[]; nazwiska: readonly string[] }>;

const LICZBA_PROB = 200;

/** PESEL zastępczy: te same cyfry 1–6 i parzystość 10. cyfry, numer różny od oryginału. */
export function peselZastepczy(pesel: Pesel, losuj: Losuj, zajete: readonly Pesel[] = []): Pesel {
  if (!/^\d{11}$/.test(pesel)) throw new Error(`Oczekiwano 11 cyfr PESEL: ${pesel}`);
  const prefiks = pesel.slice(0, 6);
  const parzysta = Number(pesel[9]) % 2 === 0;
  const wykluczone = new Set<Pesel>([pesel, ...zajete]);
  for (let proba = 0; proba < LICZBA_PROB; proba++) {
    const cyfry789 = losoweCyfry(losuj, 3);
    const cyfra10 = losowaLiczbaCalkowita(losuj, 0, 4) * 2 + (parzysta ? 0 : 1);
    const pierwsze10 = `${prefiks}${cyfry789}${cyfra10}`;
    const kandydat = `${pierwsze10}${cyfraKontrolnaPesel(pierwsze10)}`;
    if (!wykluczone.has(kandydat)) return kandydat;
  }
  for (let k = 0; k < 5000; k++) {
    const pierwsze10 = `${prefiks}${String(Math.floor(k / 5)).padStart(3, '0')}${(k % 5) * 2 + (parzysta ? 0 : 1)}`;
    const kandydat = `${pierwsze10}${cyfraKontrolnaPesel(pierwsze10)}`;
    if (!wykluczone.has(kandydat)) return kandydat;
  }
  throw new Error(`Brak wolnego numeru zastępczego dla prefiksu ${prefiks}`);
}

/** Imię i nazwisko zastępcze ze słownika dla płci. */
export function daneZastepcze(plec: Plec, slownik: SlownikImion, losuj: Losuj): { imie: string; nazwisko: string } {
  const wpis = slownik[plec];
  if (wpis.imiona.length === 0 || wpis.nazwiska.length === 0) throw new Error(`Pusty słownik imion dla płci ${plec}`);
  return {
    imie: wpis.imiona[losowaLiczbaCalkowita(losuj, 0, wpis.imiona.length - 1)],
    nazwisko: wpis.nazwiska[losowaLiczbaCalkowita(losuj, 0, wpis.nazwiska.length - 1)],
  };
}

/** Tekst klucza powiązania dla osoby bez numeru PESEL: imię i nazwisko małymi literami, pojedyncze spacje. */
export function tekstKluczaImienia(imie: string, nazwisko: string): string {
  return `${imie} ${nazwisko}`.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pl-PL');
}
