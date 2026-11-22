// Numery potwierdzeń i identyfikatory rekordów (kontrakt, sekcja 6.5 i 7.1).
import { czesciDaty, czesciZnacznika } from '@/domena/daty';
import type { DataISO, ZnacznikCzasu } from '@/domena/typy';

export type PrefiksPotwierdzenia = 'ZAM-DEMO' | 'ZAS53-DEMO' | 'URLOP-DEMO' | 'USC-DEMO' | 'Z15-DEMO';

function dwieCyfry(n: number): string {
  return String(n).padStart(2, '0');
}

function dataBezSeparatorow(dzis: DataISO): string {
  const { rok, miesiac, dzien } = czesciDaty(dzis);
  return `${String(rok).padStart(4, '0')}${dwieCyfry(miesiac)}${dwieCyfry(dzien)}`;
}

// Klucz licznika dziennego w StanGlobalny.licznikiPotwierdzen, np. 'ZAM-DEMO-20261121'.
export function kluczLicznikaPotwierdzen(prefiks: PrefiksPotwierdzenia, dzis: DataISO): string {
  return `${prefiks}-${dataBezSeparatorow(dzis)}`;
}

// 'ZAM-DEMO', '2026-11-21', 1 → 'ZAM-DEMO-20261121-0001'.
export function numerPotwierdzenia(prefiks: PrefiksPotwierdzenia, dzis: DataISO, kolejny: number): string {
  if (!Number.isInteger(kolejny) || kolejny < 1 || kolejny > 9999) throw new Error(`Numer kolejny spoza zakresu 1–9999: ${kolejny}`);
  return `${kluczLicznikaPotwierdzen(prefiks, dzis)}-${String(kolejny).padStart(4, '0')}`;
}

// Identyfikator z chwili i losowych znaków: 'W', '2026-11-21T10:15:00', 'K7Q2' → 'W-20261121101500-K7Q2'.
export function idZLosowych(prefiks: string, teraz: ZnacznikCzasu, losowe: string): string {
  const c = czesciZnacznika(teraz);
  const znacznik = `${String(c.rok).padStart(4, '0')}${dwieCyfry(c.miesiac)}${dwieCyfry(c.dzien)}${dwieCyfry(c.godzina)}${dwieCyfry(c.minuta)}${dwieCyfry(c.sekunda)}`;
  return `${prefiks}-${znacznik}-${losowe}`;
}
