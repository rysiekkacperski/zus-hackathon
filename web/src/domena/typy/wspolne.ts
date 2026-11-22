// Typy wspólne dla wszystkich elementów systemu (kontrakt, sekcja 5.1).
import type { KodKomunikatu } from '@/domena/typy/komunikaty';

export type DataISO = string;            // 'RRRR-MM-DD'
export type MiesiacISO = string;         // 'RRRR-MM'
export type ZnacznikCzasu = string;      // 'RRRR-MM-DDTHH:MM:SS', Europe/Warsaw
export type Grosze = number;             // liczba całkowita
export type Procent = number;            // 81.5 = 81,5%
export type Pesel = string;              // 11 cyfr
export type IdRodziny = string;          // PESEL konta, które zapisało profil rodziny
export type IdPozycji = string;          // 'K01' … 'K37', kolejne 'K38' …
export type IdSprawy = string;           // 'K12'; sprawy na rodzica: 'K21-matka', 'K21-drugi-rodzic'; strażnik: 'OS-2026-11'
export type IdWpisuSlownika = string;    // slug, np. 'swiadczenie-wychowawcze-800-plus'
export type IdPliku = string;            // klucz w IndexedDB
export type IdWniosku = string;          // 'W-<znacznik>-<losowe>'
export interface Okres { od: DataISO; do: DataISO }           // obie daty włącznie
export interface OkresOtwarty { od: DataISO; do?: DataISO }

export type ZrodloDanej = 'konto-zus' | 'pelnomocnictwo-pel' | 'odpowiedz-rodzica';
export interface DanaZeZrodla<T> { wartosc: T; zrodlo: ZrodloDanej }

export type FormaZatrudnienia = 'umowa-o-prace' | 'umowa-zlecenia' | 'jdg' | 'brak-tytulu';
export type FormaZatrudnieniaDrugiegoRodzica = FormaZatrudnienia | 'brak-drugiego-rodzica';
export type RodzicWRodzinie = 'matka' | 'drugi-rodzic';
export type Plec = 'kobieta' | 'mezczyzna';

export type WynikOperacji<T = void> =
  | { ok: true; wartosc: T }
  | { ok: false; kod: KodKomunikatu; bledyPol?: Record<string, KodKomunikatu>;
      /** Parametry treści komunikatu, na przykład z odpowiedzi błędu REST API. */
      parametry?: Record<string, string> };
export type BledyPol<P extends string> = Partial<Record<P, KodKomunikatu>>;
export interface KontekstOperacji { dzis: DataISO; teraz: ZnacznikCzasu }
