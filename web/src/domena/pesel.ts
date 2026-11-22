// Numer PESEL: walidacja, odczyt daty urodzenia i płci, budowa numeru (kontrakt, sekcja 7.1).
// Cyfry 1–6: RRMMDD z miesiącem przesuniętym o stulecie (1800: +80, 1900: +0, 2000: +20, 2100: +40, 2200: +60).
// Cyfry 7–9: numer serii, cyfra 10: parzysta dla kobiety, nieparzysta dla mężczyzny,
// cyfra 11: kontrolna z wagami 1, 3, 7, 9, 1, 3, 7, 9, 1, 3 i k = (10 − (suma mod 10)) mod 10.
import { czesciDaty, czyPoprawnaDataISO } from '@/domena/daty';
import { type Losuj, losoweCyfry, losowaLiczbaCalkowita } from '@/domena/losowanie';
import type { DataISO, Pesel, Plec } from '@/domena/typy';

export type BladPesel = '0024' | '0025' | '0026';

const WAGI_PESEL = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3] as const;
const WZOR_PESEL = /^\d{11}$/;
const PRZESUNIECIE_MIESIACA: Record<number, number> = { 18: 80, 19: 0, 20: 20, 21: 40, 22: 60 };

function dwieCyfry(n: number): string {
  return String(n).padStart(2, '0');
}

// Cyfra kontrolna dla pierwszych 10 cyfr: '9304123108' → 5.
export function cyfraKontrolnaPesel(pierwsze10: string): number {
  if (!/^\d{10}$/.test(pierwsze10)) throw new Error(`Oczekiwano 10 cyfr PESEL: ${pierwsze10}`);
  let suma = 0;
  for (let i = 0; i < 10; i++) suma += Number(pierwsze10[i]) * WAGI_PESEL[i];
  return (10 - (suma % 10)) % 10;
}

// Data urodzenia zapisana w cyfrach 1–6 albo null, gdy numer nie koduje istniejącego dnia.
export function dataUrodzeniaZPesel(p: Pesel): DataISO | null {
  if (!WZOR_PESEL.test(p)) return null;
  const rr = Number(p.slice(0, 2));
  const mm = Number(p.slice(2, 4));
  const dd = p.slice(4, 6);
  const przesuniecie = Math.floor(mm / 20) * 20;
  const stulecie = { 0: 1900, 20: 2000, 40: 2100, 60: 2200, 80: 1800 }[przesuniecie];
  if (stulecie === undefined) return null;
  const data = `${stulecie + rr}-${dwieCyfry(mm - przesuniecie)}-${dd}`;
  return czyPoprawnaDataISO(data) ? data : null;
}

// Płeć z cyfry 10: parzysta to kobieta, nieparzysta to mężczyzna.
export function plecZPesel(p: Pesel): Plec {
  return Number(p[9]) % 2 === 0 ? 'kobieta' : 'mezczyzna';
}

// Pole PESEL: puste → 0024, inny zapis niż 11 cyfr → 0025, błędna cyfra kontrolna albo nieistniejąca data → 0026.
export function walidujPesel(tekst: string): { ok: true; pesel: Pesel } | { ok: false; kod: BladPesel } {
  const pesel = tekst.trim();
  if (pesel === '') return { ok: false, kod: '0024' };
  if (!WZOR_PESEL.test(pesel)) return { ok: false, kod: '0025' };
  if (cyfraKontrolnaPesel(pesel.slice(0, 10)) !== Number(pesel[10]) || dataUrodzeniaZPesel(pesel) === null) {
    return { ok: false, kod: '0026' };
  }
  return { ok: true, pesel };
}

// Data urodzenia z numeru PESEL zgodna ze wskazaną datą (komunikaty 0027 i 0211).
export function czyPeselZgodnyZData(p: Pesel, d: DataISO): boolean {
  return dataUrodzeniaZPesel(p) === d;
}

// Buduje numer z daty urodzenia (lata 1800–2299), płci, cyfr 7–9 i cyfry 10.
// `cyfraPlci` to dowolna cyfra 0–9: gdy jej parzystość nie odpowiada płci, funkcja bierze następną cyfrę (9 → 0),
// więc losowa cyfra 0–9 daje równomierny rozkład cyfr właściwej parzystości.
export function zbudujPesel(dataUrodzenia: DataISO, plec: Plec, cyfry789: string, cyfraPlci: number): Pesel {
  const { rok, miesiac, dzien } = czesciDaty(dataUrodzenia);
  const przesuniecie = PRZESUNIECIE_MIESIACA[Math.floor(rok / 100)];
  if (przesuniecie === undefined) throw new Error(`Rok spoza zakresu PESEL (1800–2299): ${rok}`);
  if (!/^\d{3}$/.test(cyfry789)) throw new Error(`Oczekiwano 3 cyfr serii PESEL: ${cyfry789}`);
  if (!Number.isInteger(cyfraPlci) || cyfraPlci < 0 || cyfraPlci > 9) throw new Error(`Oczekiwano cyfry 0–9: ${cyfraPlci}`);
  const parzysta = plec === 'kobieta';
  const cyfra10 = (cyfraPlci % 2 === 0) === parzysta ? cyfraPlci : (cyfraPlci + 1) % 10;
  const pierwsze10 = `${dwieCyfry(rok % 100)}${dwieCyfry(miesiac + przesuniecie)}${dwieCyfry(dzien)}${cyfry789}${cyfra10}`;
  return `${pierwsze10}${cyfraKontrolnaPesel(pierwsze10)}`;
}

const LICZBA_PROB_LOSOWYCH = 50;
const LICZBA_KOMBINACJI = 1000 * 5;          // cyfry 7–9 × pięć cyfr 10 o właściwej parzystości

// Losowy numer PESEL dla daty urodzenia i płci, różny od numerów z listy `zajete`.
// Po nieudanych próbach losowych przegląda wszystkie kombinacje od losowego miejsca; brak wolnego numeru to błąd.
export function losujPesel(dataUrodzenia: DataISO, plec: Plec, losuj: Losuj, zajete: readonly Pesel[] = []): Pesel {
  const zajeteNumery = new Set(zajete);
  for (let proba = 0; proba < LICZBA_PROB_LOSOWYCH; proba++) {
    const pesel = zbudujPesel(dataUrodzenia, plec, losoweCyfry(losuj, 3), losowaLiczbaCalkowita(losuj, 0, 9));
    if (!zajeteNumery.has(pesel)) return pesel;
  }
  const start = losowaLiczbaCalkowita(losuj, 0, LICZBA_KOMBINACJI - 1);
  for (let i = 0; i < LICZBA_KOMBINACJI; i++) {
    const k = (start + i) % LICZBA_KOMBINACJI;
    const pesel = zbudujPesel(dataUrodzenia, plec, String(Math.floor(k / 5)).padStart(3, '0'), (k % 5) * 2);
    if (!zajeteNumery.has(pesel)) return pesel;
  }
  throw new Error(`Brak wolnego numeru PESEL dla daty ${dataUrodzenia}`);
}
