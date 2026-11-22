// Dane rodziny w Profilu na start (kontrakt, sekcja 7.2). Właściciel: u10 (Profil na start: ciąża, zmiana zatrudnienia, rodzina).
// Wymagania 3.3.1.2.2: stan cywilny, uznanie ojcostwa wyłącznie przy rodzicach, którzy nie są małżeństwem, gmina ze słownika
// gmin i miesięczny dochód netto na osobę od 0,00 do 99 999,99 zł z najwyżej dwoma miejscami po przecinku albo dochód nieznany.
import { parsujKwote } from '@/domena/kwoty';
import type { BledyPol, DaneRodziny, Gmina, Grosze, KodKomunikatu, StanCywilny, UznanieOjcostwa } from '@/domena/typy';

/** Najwyższy dochód na osobę przyjmowany w polu: 99 999,99 zł. */
export const MAKS_DOCHOD_NA_OSOBE: Grosze = 9_999_999;

export const STANY_CYWILNE: readonly StanCywilny[] = ['malzenstwo', 'nie-malzenstwo'];
export const UZNANIA_OJCOSTWA: readonly UznanieOjcostwa[] = ['uznane', 'nieuznane'];

/** Pola formularza ViewProfileFamily. Gminę wskazuje wybór z podpowiedzi, a dochód tekst wpisany przez użytkownika. */
export interface FormularzDanychRodziny {
  stanCywilny: StanCywilny | null;
  uznanieOjcostwa: UznanieOjcostwa | null;
  gminaTekst: string;
  gmina: Gmina | null;
  dochod: string;
  pominDochod: boolean;
}

export type PoleDanychRodziny = 'stanCywilny' | 'uznanieOjcostwa' | 'gmina' | 'dochod';

/** Pole uznania ojcostwa jest widoczne i obowiązkowe wyłącznie, gdy rodzice nie są małżeństwem. */
export function czyPytacOUznanieOjcostwa(stanCywilny: StanCywilny | null): boolean {
  return stanCywilny === 'nie-malzenstwo';
}

/** Dochód na osobę z wpisu: kwota w groszach albo kod 0015 (puste pole) lub 0016 (nieprawidłowa kwota). */
export function parsujDochod(tekst: string): { kwota: Grosze } | { kod: KodKomunikatu } {
  if (tekst.trim() === '') return { kod: '0015' };
  const kwota = parsujKwote(tekst);
  if (kwota === null || kwota < 0 || kwota > MAKS_DOCHOD_NA_OSOBE) return { kod: '0016' };
  return { kwota };
}

/** Komunikat strony ViewProfileFamily: 0004, gdy konto nie ma zgody na dane dotyczące zdrowia. */
export function komunikatDanychRodziny(zgoda: boolean): KodKomunikatu | null {
  return zgoda ? null : '0004';
}

/** Błędy danych rodziny: 0006 przy stanie cywilnym i uznaniu ojcostwa, 0013 i 0014 przy gminie, 0015 i 0016 przy dochodzie. */
export function walidujDaneRodziny(f: FormularzDanychRodziny): BledyPol<PoleDanychRodziny> {
  const bledy: BledyPol<PoleDanychRodziny> = {};
  if (f.stanCywilny === null) bledy.stanCywilny = '0006';
  if (czyPytacOUznanieOjcostwa(f.stanCywilny) && f.uznanieOjcostwa === null) bledy.uznanieOjcostwa = '0006';
  if (f.gmina === null) bledy.gmina = f.gminaTekst.trim() === '' ? '0013' : '0014';
  if (!f.pominDochod) {
    const dochod = parsujDochod(f.dochod);
    if ('kod' in dochod) bledy.dochod = dochod.kod;
  }
  return bledy;
}

/** Dane rodziny do szkicu profilu z poprawnego formularza, ze źródłem odpowiedź rodzica; null, gdy formularz ma błędy. */
export function daneRodzinyZFormularza(
  f: FormularzDanychRodziny,
): Pick<DaneRodziny, 'stanCywilny' | 'uznanieOjcostwa' | 'gmina' | 'dochodNaOsobe'> | null {
  if (Object.keys(walidujDaneRodziny(f)).length > 0 || f.stanCywilny === null || f.gmina === null) return null;
  let dochod: Grosze | 'nieznany' = 'nieznany';
  if (!f.pominDochod) {
    const wynik = parsujDochod(f.dochod);
    if (!('kwota' in wynik)) return null;
    dochod = wynik.kwota;
  }
  return {
    stanCywilny: { wartosc: f.stanCywilny, zrodlo: 'odpowiedz-rodzica' },
    uznanieOjcostwa:
      czyPytacOUznanieOjcostwa(f.stanCywilny) && f.uznanieOjcostwa !== null
        ? { wartosc: f.uznanieOjcostwa, zrodlo: 'odpowiedz-rodzica' }
        : undefined,
    gmina: { wartosc: f.gmina, zrodlo: 'odpowiedz-rodzica' },
    dochodNaOsobe: { wartosc: dochod, zrodlo: 'odpowiedz-rodzica' },
  };
}
