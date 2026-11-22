// Walidacje pól wspólne dla wielu widoków (kontrakt, sekcja 7.1).
// Każda funkcja zwraca kod komunikatu z tablicy komunikatów albo null, gdy wartość jest poprawna.
import { parsujDate, porownajDaty } from '@/domena/daty';
import type { DataISO, KodKomunikatu } from '@/domena/typy';

export const MAKS_DLUGOSC_IMIENIA = 40;
export const MAKS_DLUGOSC_NAZWISKA = 60;
export const MAKS_DLUGOSC_EMAIL = 254;
export const MAKS_ROZMIAR_PLIKU = 10485760;  // 10 MB
export const DOZWOLONE_TYPY_PLIKOW = ['application/pdf', 'image/jpeg', 'image/png'] as const;
export type DozwolonyTypPliku = (typeof DOZWOLONE_TYPY_PLIKOW)[number];

const ZNAKI_IMIENIA = /^[\p{L} '’-]+$/u;
const LITERA = /\p{L}/u;
// Białe znaki, w tym twarda spacja U+00A0 i wąska twarda spacja U+202F.
const ODSTEPY = /[\s\u00A0\u202F]/g;

// Puste pole po przycięciu spacji → podany kod.
export function walidujWymagane(tekst: string, kod: KodKomunikatu): KodKomunikatu | null {
  return tekst.trim() === '' ? kod : null;
}

// Imię (1–40 znaków) albo nazwisko (1–60 znaków): litery z polskimi znakami, spacja, łącznik i apostrof (' albo ’).
// Puste imię → 0028, puste nazwisko → 0029, niedozwolone znaki albo przekroczona długość → 0030.
export function walidujImieNazwisko(tekst: string, pole: 'imie' | 'nazwisko'): '0028' | '0029' | '0030' | null {
  const wartosc = tekst.trim().normalize('NFC');
  if (wartosc === '') return pole === 'imie' ? '0028' : '0029';
  const maks = pole === 'imie' ? MAKS_DLUGOSC_IMIENIA : MAKS_DLUGOSC_NAZWISKA;
  if (wartosc.length > maks || !ZNAKI_IMIENIA.test(wartosc) || !LITERA.test(wartosc)) return '0030';
  return null;
}

// Adres e-mail: najwyżej 254 znaki, jeden znak @, niepusta nazwa przed @ i domena z kropką.
// Puste pole → 0059, gdy adres jest wymagany; błędny adres → 0060.
export function walidujEmail(tekst: string, wymagany: boolean): '0059' | '0060' | null {
  const adres = tekst.trim();
  if (adres === '') return wymagany ? '0059' : null;
  if (adres.length > MAKS_DLUGOSC_EMAIL || /\s/.test(adres)) return '0060';
  const czesci = adres.split('@');
  if (czesci.length !== 2 || czesci[0] === '') return '0060';
  const etykietyDomeny = czesci[1].split('.');
  if (etykietyDomeny.length < 2 || etykietyDomeny.some((e) => e === '')) return '0060';
  return null;
}

// Numer telefonu: 9 cyfr, opcjonalnie poprzedzonych prefiksem +48, ze spacjami między cyframi.
// Puste pole → 0213, inny zapis → 0124.
export function walidujTelefon(tekst: string): '0213' | '0124' | null {
  const numer = tekst.replace(ODSTEPY, '');
  if (numer === '') return '0213';
  return /^(\+48)?\d{9}$/.test(numer) ? null : '0124';
}

// Zapis numeru telefonu do przechowania: 9 cyfr bez prefiksu +48 i spacji ('+48 500 100 200' → '500100200').
export function normalizujTelefon(tekst: string): string {
  const numer = tekst.replace(ODSTEPY, '');
  return /^\+48\d{9}$/.test(numer) ? numer.slice(3) : numer;
}

// Zapis numeru rachunku do przechowania: cyfry bez spacji, bez prefiksu kraju PL.
export function normalizujRachunek(tekst: string): string {
  const numer = tekst.replace(ODSTEPY, '');
  return /^pl/i.test(numer) ? numer.slice(2) : numer;
}

// Suma kontrolna NRB: liczba z cyfr 3–26, kodu kraju PL (2521) i cyfr 1–2 daje resztę 1 z dzielenia przez 97.
function czySumaKontrolnaNrb(nrb: string): boolean {
  const przestawiony = `${nrb.slice(2)}2521${nrb.slice(0, 2)}`;
  let reszta = 0;
  for (const cyfra of przestawiony) reszta = (reszta * 10 + Number(cyfra)) % 97;
  return reszta === 1;
}

// Numer rachunku NRB: puste pole → 0039, gdy rachunek jest wymagany; inny zapis niż 26 cyfr → 0040;
// błędna suma kontrolna → 0041. Spacje między cyframi są dozwolone.
export function walidujRachunek(tekst: string, wymagany: boolean): '0039' | '0040' | '0041' | null {
  const nrb = normalizujRachunek(tekst);
  if (nrb === '') return wymagany ? '0039' : null;
  if (!/^\d{26}$/.test(nrb)) return '0040';
  return czySumaKontrolnaNrb(nrb) ? null : '0041';
}

// Prezentacja rachunku w grupach 2 + 6 × 4: '60 1020 1026 0000 1234 5678 9012'. Inny zapis zostaje bez zmian.
export function formatujRachunek(nrb: string): string {
  const numer = normalizujRachunek(nrb);
  if (!/^\d{26}$/.test(numer)) return nrb;
  const grupy = [numer.slice(0, 2)];
  for (let i = 2; i < 26; i += 4) grupy.push(numer.slice(i, i + 4));
  return grupy.join(' ');
}

// Plik: format PDF, JPG albo PNG (inaczej 0103) i rozmiar najwyżej 10 485 760 B (inaczej 0104).
export function walidujPlik(p: { typ: string; rozmiar: number }): '0103' | '0104' | null {
  if (!(DOZWOLONE_TYPY_PLIKOW as readonly string[]).includes(p.typ)) return '0103';
  return p.rozmiar > MAKS_ROZMIAR_PLIKU ? '0104' : null;
}

// Tekst zawiera kod pocztowy w zapisie 00-000 (2 cyfry, łącznik, 3 cyfry), np. adres 'ul. Długa 5 m. 3, 85-001 Bydgoszcz'.
export function walidujKodPocztowy(tekst: string): boolean {
  return /(^|\D)\d{2}-\d{3}(\D|$)/.test(tekst);
}

// Data wpisana w polu: puste → kody.pusta (albo kody.format), zły format albo nieistniejący dzień → kody.format,
// data przed zakres.od → kody.zaWczesnie, data po zakres.do → kody.zaPozno (albo kody.format, gdy kodu brak).
export function walidujDateWZakresie(
  tekst: string,
  zakres: { od?: DataISO; do?: DataISO },
  kody: { format: KodKomunikatu; zaWczesnie?: KodKomunikatu; zaPozno?: KodKomunikatu; pusta?: KodKomunikatu },
): { data: DataISO } | { kod: KodKomunikatu } {
  if (tekst.trim() === '') return { kod: kody.pusta ?? kody.format };
  const data = parsujDate(tekst);
  if (data === null) return { kod: kody.format };
  if (zakres.od !== undefined && porownajDaty(data, zakres.od) < 0) return { kod: kody.zaWczesnie ?? kody.format };
  if (zakres.do !== undefined && porownajDaty(data, zakres.do) > 0) return { kod: kody.zaPozno ?? kody.format };
  return { data };
}

// Liczba całkowita z zakresu [min, max]; spacje jako separator tysięcy są dozwolone ('3 250' → 3250).
// Puste pole, inny zapis i wartość spoza zakresu → podany kod.
export function walidujLiczbeCalkowita(tekst: string, min: number, max: number, kod: KodKomunikatu): { liczba: number } | { kod: KodKomunikatu } {
  const zapis = tekst.replace(ODSTEPY, '');
  if (!/^-?\d+$/.test(zapis)) return { kod };
  const liczba = Number(zapis);
  if (!Number.isSafeInteger(liczba) || liczba < min || liczba > max) return { kod };
  return { liczba: liczba || 0 };
}
