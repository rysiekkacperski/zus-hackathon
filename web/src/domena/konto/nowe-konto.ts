// Nowe konto demonstracyjne: walidacja pól, PESEL i kody makiet logowania (kontrakt, sekcja 7.2;
// analiza 3.1.1, reguły R12, R14, R18 i R19). Właściciel: u01 (Logowanie i konta demonstracyjne).
// Funkcje są czyste: datę dostają jako argument, a losowość jako źródło `losuj`.
import { parsujDate, wiekWLatach } from '@/domena/daty';
import { losoweCyfry, losowyCiag, ZNAKI_A_Z_0_9, type Losuj } from '@/domena/losowanie';
import { losujPesel } from '@/domena/pesel';
import type { BledyPol, DataISO, Pesel, Plec } from '@/domena/typy';
import { walidujImieNazwisko } from '@/domena/walidacje';

/** Pola formularza ViewDemoNewAccount przed walidacją; data urodzenia w zapisie 'DD.MM.RRRR'. */
export interface DaneNowegoKonta {
  imie: string;
  nazwisko: string;
  dataUrodzenia: string;
  plec: Plec | null;
}

export type PoleNowegoKonta = 'imie' | 'nazwisko' | 'dataUrodzenia' | 'plec';

/** Kolejność pól formularza: pierwsze pole z błędem dostaje fokus. */
export const POLA_NOWEGO_KONTA: readonly PoleNowegoKonta[] = ['imie', 'nazwisko', 'dataUrodzenia', 'plec'];

/** Wiek nowego konta w pełnych latach w dniu założenia (R19). */
export const WIEK_NOWEGO_KONTA = { min: 16, maks: 60 } as const;

/** Długość kodu weryfikacyjnego makiety mObywatel (R12). */
export const DLUGOSC_KODU_MOBYWATEL = 6;

/** Długość i ważność kodu logowania makiety mZUS (R14). */
export const DLUGOSC_KODU_MZUS = 8;
export const WAZNOSC_KODU_MZUS_SEKUNDY = 120;

/**
 * Błędy pól nowego konta, sprawdzane wszystkie naraz (analiza 3.1.1, sekcja 7):
 * imię 0028 albo 0030, nazwisko 0029 albo 0030, data urodzenia 0253 (puste), 0010 (format
 * albo dzień spoza kalendarza), 0254 (wiek spoza 16–60 lat w dniu `dzis`), płeć 0006.
 */
export function walidujNoweKonto(d: DaneNowegoKonta, dzis: DataISO): BledyPol<PoleNowegoKonta> {
  const bledy: BledyPol<PoleNowegoKonta> = {};

  const imie = walidujImieNazwisko(d.imie, 'imie');
  if (imie) bledy.imie = imie;
  const nazwisko = walidujImieNazwisko(d.nazwisko, 'nazwisko');
  if (nazwisko) bledy.nazwisko = nazwisko;

  const zapisDaty = d.dataUrodzenia.trim();
  if (zapisDaty === '') {
    bledy.dataUrodzenia = '0253';
  } else {
    const data = parsujDate(zapisDaty);
    if (data === null) {
      bledy.dataUrodzenia = '0010';
    } else {
      const wiek = data > dzis ? -1 : wiekWLatach(data, dzis);
      if (wiek < WIEK_NOWEGO_KONTA.min || wiek > WIEK_NOWEGO_KONTA.maks) bledy.dataUrodzenia = '0254';
    }
  }

  if (d.plec === null) bledy.plec = '0006';
  return bledy;
}

/**
 * Numer PESEL nowego konta (R18): cyfry 1–6 z daty urodzenia, cyfry 7–9 losowe, cyfra 10 parzysta
 * dla kobiety i nieparzysta dla mężczyzny, poprawna cyfra kontrolna, numer różny od numerów zajętych.
 */
export function peselNowegoKonta(dataUrodzenia: DataISO, plec: Plec, losuj: Losuj, zajete: Pesel[]): Pesel {
  return losujPesel(dataUrodzenia, plec, losuj, zajete);
}

/** Nowy 6-cyfrowy kod makiety logowania mObywatel (z zerami wiodącymi), różny od poprzedniego (R12). */
export function nowyKodMobywatel(poprzedni: string | undefined, losuj: Losuj): string {
  for (let proba = 0; proba < 20; proba++) {
    const kod = losoweCyfry(losuj, DLUGOSC_KODU_MOBYWATEL);
    if (kod !== poprzedni) return kod;
  }
  // Źródło losowości powtarza ten sam kod: następny numer w kolejności jest zawsze różny od poprzedniego.
  const nastepny = (Number(poprzedni ?? '0') + 1) % 10 ** DLUGOSC_KODU_MOBYWATEL;
  return String(nastepny).padStart(DLUGOSC_KODU_MOBYWATEL, '0');
}

/** Nowy kod makiety logowania kodem z aplikacji mZUS: 8 znaków A-Z0-9 (R14). */
export function nowyKodMzus(losuj: Losuj): string {
  return losowyCiag(losuj, DLUGOSC_KODU_MZUS, ZNAKI_A_Z_0_9);
}

/**
 * Stan kodu makiety mZUS po `uplynelo` sekundach od pokazania pierwszego kodu: numer kolejnego kodu
 * (0 dla pierwszego) i liczba sekund ważności bieżącego kodu. Kod wymienia się co 120 sekund.
 */
export function stanKoduMzus(uplynelo: number): { numerKodu: number; pozostalo: number } {
  const sekundy = Math.max(0, Math.floor(uplynelo));
  const numerKodu = Math.floor(sekundy / WAZNOSC_KODU_MZUS_SEKUNDY);
  return { numerKodu, pozostalo: WAZNOSC_KODU_MZUS_SEKUNDY - (sekundy % WAZNOSC_KODU_MZUS_SEKUNDY) };
}
