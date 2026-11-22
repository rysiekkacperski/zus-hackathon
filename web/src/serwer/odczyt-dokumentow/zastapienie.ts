import 'server-only';
// Zastąpienie danych osobowych odczytanych z dokumentu danymi losowymi (kontrakt, sekcje 10.2 i 10.3).
// Właściciel: u05. Klucz powiązania to SHA-256 odczytanego numeru PESEL albo imienia i nazwiska;
// przeglądarka dostaje wyłącznie klucz i dane zastępcze, a odczytane dane osobowe nie opuszczają serwera.
import { createHash, randomInt } from 'node:crypto';
import { slownikImion } from '@/dane/przykladowe-sprawy/slownik-imion';
import { daneZastepcze, peselZastepczy, tekstKluczaImienia } from '@/domena/przykladowe-sprawy/dane-zastepcze';
import { czySciezkaDanychSprawy, SCIEZKI_DANYCH_OSOBOWYCH } from '@/domena/przykladowe-sprawy/scalanie';
import { plecZPesel, walidujPesel } from '@/domena/pesel';
import type { Losuj } from '@/domena/losowanie';
import type { Plec, PowiazanieZastepcze, WartoscOdczytana } from '@/domena/typy';

const ZAKRES = 2 ** 32;

/** Źródło losowości serwera: liczba z przedziału [0, 1) z generatora kryptograficznego. */
export const losujNaSerwerze: Losuj = () => randomInt(0, ZAKRES) / ZAKRES;

export function sha256(tekst: string): string {
  return createHash('sha256').update(tekst, 'utf8').digest('hex');
}

/** Powiązania z żądania: wyłącznie poprawne wpisy. */
export function odczytajPowiazania(surowe: unknown): PowiazanieZastepcze[] {
  if (!Array.isArray(surowe)) return [];
  return surowe.filter((p): p is PowiazanieZastepcze => {
    if (p === null || typeof p !== 'object') return false;
    const w = p as Partial<PowiazanieZastepcze>;
    return typeof w.klucz === 'string' && (w.plec === 'kobieta' || w.plec === 'mezczyzna')
      && typeof w.zastepcze?.imie === 'string' && typeof w.zastepcze?.nazwisko === 'string' && typeof w.zastepcze?.pesel === 'string';
  });
}

/**
 * Wartości z danymi zastępczymi i nowe powiązania. Odrzuca pola spoza Danych sprawy (adres, rachunek,
 * dane dziecka). Osoba z numerem PESEL dostaje zestaw po kluczu numeru, osoba bez numeru po kluczu imienia i nazwiska.
 */
export function zastapDaneOsobowe(
  wartosci: readonly WartoscOdczytana[],
  powiazania: readonly PowiazanieZastepcze[],
  losuj: Losuj = losujNaSerwerze,
): { wartosci: WartoscOdczytana[]; nowePowiazania: PowiazanieZastepcze[] } {
  const dozwolone = wartosci.filter((w) => czySciezkaDanychSprawy(w.pole));
  const odczyt = (pole: string): string | null => {
    const w = dozwolone.find((x) => x.pole === pole)?.wartosc;
    return typeof w === 'string' && w.trim() !== '' ? w.trim() : null;
  };
  const pesel = odczyt('ubezpieczony.pesel');
  const imie = odczyt('ubezpieczony.imie');
  const nazwisko = odczyt('ubezpieczony.nazwisko');
  const rola = odczyt('ubezpieczony.rola');
  const bezOsobowych = dozwolone.filter((w) => !SCIEZKI_DANYCH_OSOBOWYCH.has(w.pole));
  if (pesel === null && (imie === null || nazwisko === null)) return { wartosci: bezOsobowych, nowePowiazania: [] };

  const kluczPesel = pesel ? sha256(pesel) : null;
  const kluczImienia = imie && nazwisko ? sha256(tekstKluczaImienia(imie, nazwisko)) : null;
  const znane = powiazania.find((p) => p.klucz === kluczPesel) ?? powiazania.find((p) => p.klucz === kluczImienia);
  const nowePowiazania: PowiazanieZastepcze[] = [];
  let zastepcze: PowiazanieZastepcze['zastepcze'];
  let plec: Plec;

  if (znane) {
    zastepcze = znane.zastepcze;
    plec = znane.plec;
  } else {
    const poprawny = pesel !== null && walidujPesel(pesel).ok;
    plec = poprawny ? plecZPesel(pesel) : rola === 'ojciec-przejmujacy' ? 'mezczyzna' : 'kobieta';
    const osoba = daneZastepcze(plec, slownikImion, losuj);
    const zajete = powiazania.map((p) => p.zastepcze.pesel);
    zastepcze = { ...osoba, pesel: poprawny ? peselZastepczy(pesel, losuj, zajete) : '' };
  }
  for (const klucz of [kluczPesel, kluczImienia]) {
    if (klucz !== null && !powiazania.some((p) => p.klucz === klucz)) nowePowiazania.push({ klucz, zastepcze, plec });
  }

  const wynik: WartoscOdczytana[] = [...bezOsobowych];
  if (imie !== null) wynik.push({ pole: 'ubezpieczony.imie', wartosc: zastepcze.imie, daneZastapione: true });
  if (nazwisko !== null) wynik.push({ pole: 'ubezpieczony.nazwisko', wartosc: zastepcze.nazwisko, daneZastapione: true });
  if (pesel !== null && zastepcze.pesel !== '') wynik.push({ pole: 'ubezpieczony.pesel', wartosc: zastepcze.pesel, daneZastapione: true });
  return { wartosci: wynik, nowePowiazania };
}
