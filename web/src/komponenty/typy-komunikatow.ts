import {
  typyKomunikatow,
  type KodKomunikatu,
  type TypKomunikatu as TypKomunikatuZTablicy,
} from '@/domena/typy/komunikaty';
import { teksty } from '@/teksty';

// Typ z kolumny Typ tablicy komunikatów albo SUCCESS, który widok wybiera jawnie dla komunikatu o udanym działaniu.
export type TypKomunikatu = TypKomunikatuZTablicy | 'SUCCESS';

// Typ każdego komunikatu z docs/03-user-stories/tablica-komunikatow.md (kolumna Typ). Mapa leży
// w domena/typy/komunikaty.ts, a ten plik sprawdza, że ma wpis dla każdego kodu.
export const typKomunikatu = typyKomunikatow satisfies Record<KodKomunikatu, 'INFO' | 'WARNING' | 'ERROR'>;

type Komunikaty = typeof teksty.komunikaty;

// Kody w teksty.komunikaty spoza tablicy komunikatów; zbiór pusty przy zgodnych kluczach.
type KodyNadmiarowe = Exclude<keyof Komunikaty, KodKomunikatu>;

// teksty.komunikaty ma treść dla każdego kodu z tablicy (satisfies) i nie ma kodów spoza niej (never).
const trescKomunikatow = teksty.komunikaty satisfies Record<KodKomunikatu, unknown> & Record<KodyNadmiarowe, never>;

export type ParametryKomunikatu<K extends KodKomunikatu> = K extends keyof Komunikaty
  ? Komunikaty[K] extends (parametry: infer P) => string
    ? P
    : undefined
  : undefined;

// Zwraca treść komunikatu z teksty.komunikaty. Komunikat ze zmienną częścią dostaje parametry sformatowane przez wywołującego.
export function trescKomunikatu<K extends KodKomunikatu>(
  kod: K,
  parametry?: ParametryKomunikatu<K> | Record<string, string>,
): string {
  const wpis: unknown = trescKomunikatow[kod];
  if (typeof wpis === 'function') {
    return (wpis as (p: unknown) => string)(parametry ?? {});
  }
  return typeof wpis === 'string' ? wpis : kod;
}
