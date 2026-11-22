// Ręczna walidacja wejścia REST API w wersji 1. Czytniki zapisują błąd pola pod ścieżką pola w żądaniu
// (na przykład 'daneWejsciowe.dataPorodu') z kodem z tablicy komunikatów i zwracają odczytaną wartość albo undefined.
// Kody: 0006 brak wyboru albo wartość spoza listy, 0010 data w złym formacie, 0016 kwota w złym zapisie.
import { czyPoprawnaDataISO } from '@/domena/daty';
import type { DataISO, KodKomunikatu, ZnacznikCzasu } from '@/domena/typy';
import { odpowiedzBledu } from '@/serwer/api/odpowiedzi';

export type Obiekt = Record<string, unknown>;
export type BledyWejscia = Record<string, KodKomunikatu>;

const WZOR_ZNACZNIKA = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;

export function czyObiekt(w: unknown): w is Obiekt {
  return typeof w === 'object' && w !== null && !Array.isArray(w);
}

export function czyDataISO(w: unknown): w is DataISO {
  return typeof w === 'string' && czyPoprawnaDataISO(w);
}

export function czyZnacznikCzasu(w: unknown): w is ZnacznikCzasu {
  if (typeof w !== 'string') return false;
  const m = WZOR_ZNACZNIKA.exec(w);
  return m !== null && czyPoprawnaDataISO(m[1]);
}

/** Treść żądania JSON jako obiekt; inna treść daje odpowiedź 400 z kodem 0006. */
export async function odczytajTresc(zadanie: Request): Promise<{ ok: true; tresc: Obiekt } | { ok: false; odpowiedz: Response }> {
  let tresc: unknown;
  try {
    tresc = await zadanie.json();
  } catch {
    return { ok: false, odpowiedz: odpowiedzBledu('0006', { pola: { tresc: '0006' } }) };
  }
  if (!czyObiekt(tresc)) return { ok: false, odpowiedz: odpowiedzBledu('0006', { pola: { tresc: '0006' } }) };
  return { ok: true, tresc };
}

export function sciezka(...czesci: (string | number)[]): string {
  return czesci.map((c, i) => (typeof c === 'number' ? `[${c}]` : i === 0 ? c : `.${c}`)).join('');
}

interface OpcjePola { wymagane?: boolean; kodBraku?: KodKomunikatu }

function brak(w: unknown): boolean {
  return w === undefined || w === null || w === '';
}

export function czytajDate(w: unknown, pole: string, bledy: BledyWejscia, o: OpcjePola = {}): DataISO | undefined {
  if (brak(w)) {
    if (o.wymagane) bledy[pole] = o.kodBraku ?? '0010';
    return undefined;
  }
  if (!czyDataISO(w)) {
    bledy[pole] = '0010';
    return undefined;
  }
  return w;
}

export function czytajZWyliczenia<T extends string>(
  w: unknown,
  dozwolone: readonly T[],
  pole: string,
  bledy: BledyWejscia,
  o: OpcjePola = {},
): T | undefined {
  if (brak(w)) {
    if (o.wymagane) bledy[pole] = o.kodBraku ?? '0006';
    return undefined;
  }
  if (typeof w !== 'string' || !(dozwolone as readonly string[]).includes(w)) {
    bledy[pole] = '0006';
    return undefined;
  }
  return w as T;
}

export function czytajLiczbeCalkowita(
  w: unknown,
  pole: string,
  bledy: BledyWejscia,
  o: OpcjePola & { min?: number; max?: number; kod?: KodKomunikatu } = {},
): number | undefined {
  const kod = o.kod ?? '0006';
  if (brak(w)) {
    if (o.wymagane) bledy[pole] = o.kodBraku ?? kod;
    return undefined;
  }
  if (typeof w !== 'number' || !Number.isSafeInteger(w) || (o.min !== undefined && w < o.min) || (o.max !== undefined && w > o.max)) {
    bledy[pole] = kod;
    return undefined;
  }
  return w;
}

export function czytajLiczbe(
  w: unknown,
  pole: string,
  bledy: BledyWejscia,
  o: OpcjePola & { min?: number; max?: number; kod?: KodKomunikatu } = {},
): number | undefined {
  const kod = o.kod ?? '0006';
  if (brak(w)) {
    if (o.wymagane) bledy[pole] = o.kodBraku ?? kod;
    return undefined;
  }
  if (typeof w !== 'number' || !Number.isFinite(w) || (o.min !== undefined && w < o.min) || (o.max !== undefined && w > o.max)) {
    bledy[pole] = kod;
    return undefined;
  }
  return w;
}

/** Kwota w groszach: liczba całkowita większa od zera i nie większa niż `maks` (0016), brak wymaganej kwoty: `kodBraku`. */
export function czytajKwote(
  w: unknown,
  pole: string,
  bledy: BledyWejscia,
  o: OpcjePola & { maks: number },
): number | undefined {
  if (brak(w)) {
    if (o.wymagane) bledy[pole] = o.kodBraku ?? '0016';
    return undefined;
  }
  if (typeof w !== 'number' || !Number.isSafeInteger(w) || w <= 0 || w > o.maks) {
    bledy[pole] = '0016';
    return undefined;
  }
  return w;
}

export function czytajLogiczna(w: unknown, pole: string, bledy: BledyWejscia, domyslna: boolean): boolean {
  if (w === undefined || w === null) return domyslna;
  if (typeof w !== 'boolean') {
    bledy[pole] = '0006';
    return domyslna;
  }
  return w;
}

export function czytajTekst(w: unknown, pole: string, bledy: BledyWejscia, o: OpcjePola = {}): string | undefined {
  if (w === undefined || w === null) {
    if (o.wymagane) bledy[pole] = o.kodBraku ?? '0006';
    return undefined;
  }
  if (typeof w !== 'string') {
    bledy[pole] = o.kodBraku ?? '0006';
    return undefined;
  }
  return w;
}

/** Obiekt pola; brak wymaganego obiektu albo inna wartość daje 0006. */
export function czytajObiekt(w: unknown, pole: string, bledy: BledyWejscia, o: OpcjePola = {}): Obiekt | undefined {
  if (w === undefined || w === null) {
    if (o.wymagane) bledy[pole] = o.kodBraku ?? '0006';
    return undefined;
  }
  if (!czyObiekt(w)) {
    bledy[pole] = '0006';
    return undefined;
  }
  return w;
}

/** Lista pola; brak listy daje listę pustą, inna wartość 0006. */
export function czytajListe(w: unknown, pole: string, bledy: BledyWejscia): unknown[] {
  if (w === undefined || w === null) return [];
  if (!Array.isArray(w)) {
    bledy[pole] = '0006';
    return [];
  }
  return w;
}

export function czyBezBledow(bledy: BledyWejscia): boolean {
  return Object.keys(bledy).length === 0;
}
