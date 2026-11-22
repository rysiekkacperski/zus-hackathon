// Zmiany Katalogu świadczeń w panelu Administratora poza nowymi wersjami wartości i nowymi pozycjami (edycja.ts):
// zmiana pól i reguły terminu pozycji K01–K37 i pozycji dodanych w panelu, wyłączenie pozycji, wpisy słownika
// dokumentów i adresatów oraz nowe wpisy słowników kwot i progów albo wymiarów i okresów. Właściciel: u06.
// Funkcje są czyste: datę i konto dostają jako argument, a komunikaty zwracają jako kody tablicy komunikatów.
import { parsujDate } from '@/domena/daty';
import {
  FORMY_ZATRUDNIENIA,
  MAKS_DLUGOSC_OPISU,
  MAKS_DLUGOSC_TYTULU,
  parsujPrzesuniecie,
  parsujWartoscWariantu,
  type JednostkaPrzesuniecia,
  type KotwicaNowejPozycji,
} from '@/domena/katalog/edycja';
import type {
  BledyPol,
  FormaZatrudnienia,
  JednostkaWariantu,
  Katalog,
  Pesel,
  PozycjaKatalogu,
  RegulaTerminu,
  RodzajSlownika,
  WpisSlownika,
  WpisSlownikaDokumentow,
  ZmianyPolPozycji,
  ZnacznikCzasu,
} from '@/domena/typy';

/** Najwięcej wierszy w polach list (dane i dokumenty, kroki, dokumenty wniosku). */
export const MAKS_WIERSZY_LISTY = 20;

function znormalizuj(tekst: string): string {
  return tekst.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pl-PL');
}

/** Wiersze pola listy: jeden element na wiersz, bez pustych wierszy i spacji na końcach. */
export function wierszeListy(tekst: string): string[] {
  return tekst
    .split(/\r?\n/)
    .map((w) => w.trim().replace(/\s+/g, ' '))
    .filter((w) => w !== '');
}

function bladListy(tekst: string, wymagana: boolean): '0340' | '0271' | undefined {
  const wiersze = wierszeListy(tekst);
  if (wymagana && wiersze.length === 0) return '0340';
  if (wiersze.length > MAKS_WIERSZY_LISTY || wiersze.some((w) => w.length > MAKS_DLUGOSC_OPISU)) return '0271';
  return undefined;
}

function bladTekstu(tekst: string, maks: number, pusty: '0340' | '0080' | '0152' | null): '0340' | '0080' | '0152' | '0271' | undefined {
  const t = tekst.trim();
  if (t === '') return pusty ?? undefined;
  return t.length > maks ? '0271' : undefined;
}

// --- Zmiana pozycji katalogu (ViewCatalogItemEdit) ---------------------------------------------

/** Termin pozycji w formularzu: obecna reguła terminu albo nowa reguła z daty kotwiczącej (albo bez terminu). */
export type TerminZmienianejPozycji = 'obecny' | KotwicaNowejPozycji;

export interface FormularzZmianyPozycji {
  tytul: string;
  warunekOpis: string;
  instytucjaIKanal: string;
  daneIDokumenty: string;
  kroki: string;
  termin: TerminZmienianejPozycji;
  przesuniecie: string;
  jednostkaPrzesuniecia: JednostkaPrzesuniecia;
}

export type PoleZmianyPozycji = 'tytul' | 'warunekOpis' | 'instytucjaIKanal' | 'daneIDokumenty' | 'kroki' | 'przesuniecie';

export const TERMINY_ZMIENIANEJ_POZYCJI: readonly TerminZmienianejPozycji[] = [
  'obecny',
  'brak',
  'koniec-10-tygodnia',
  'przewidywany-termin-porodu',
  'data-porodu',
  'data-przyjecia',
];

/** Formularz z bieżącymi polami pozycji; termin zostaje przy obecnej regule. */
export function formularzZmianyPozycji(p: PozycjaKatalogu): FormularzZmianyPozycji {
  return {
    tytul: p.tytul,
    warunekOpis: p.warunekOpis,
    instytucjaIKanal: p.instytucjaIKanal,
    daneIDokumenty: p.instrukcja.daneIDokumenty.join('\n'),
    kroki: p.instrukcja.kroki.join('\n'),
    termin: 'obecny',
    przesuniecie: '',
    jednostkaPrzesuniecia: 'dni',
  };
}

/** Dozwolona liczba znaków pola z błędem 0271: 120 przy tytule, 500 przy pozostałych polach i każdym wierszu listy. */
export function maksDlugoscPolaZmiany(pole: PoleZmianyPozycji): number {
  return pole === 'tytul' ? MAKS_DLUGOSC_TYTULU : MAKS_DLUGOSC_OPISU;
}

/**
 * Błędy zmiany pozycji: 0080, 0081, 0271 (tytuł), 0340, 0271 (opis warunku), 0152, 0271 (instytucja i kanał),
 * 0271 (dane i dokumenty, kroki: najwyżej 20 wierszy po 500 znaków), 0153 (przesunięcie nowego terminu).
 */
export function walidujZmianePozycji(
  f: FormularzZmianyPozycji,
  idPozycji: string,
  k: Katalog,
): BledyPol<PoleZmianyPozycji> {
  const bledy: BledyPol<PoleZmianyPozycji> = {};
  const tytul = bladTekstu(f.tytul, MAKS_DLUGOSC_TYTULU, '0080');
  if (tytul) bledy.tytul = tytul;
  else if (k.pozycje.some((p) => p.id !== idPozycji && znormalizuj(p.tytul) === znormalizuj(f.tytul))) bledy.tytul = '0081';
  const opis = bladTekstu(f.warunekOpis, MAKS_DLUGOSC_OPISU, '0340');
  if (opis) bledy.warunekOpis = opis;
  const instytucja = bladTekstu(f.instytucjaIKanal, MAKS_DLUGOSC_OPISU, '0152');
  if (instytucja) bledy.instytucjaIKanal = instytucja;
  const dane = bladListy(f.daneIDokumenty, false);
  if (dane) bledy.daneIDokumenty = dane;
  const kroki = bladListy(f.kroki, false);
  if (kroki) bledy.kroki = kroki;
  if (f.termin !== 'obecny' && f.termin !== 'brak' && parsujPrzesuniecie(f.przesuniecie, f.jednostkaPrzesuniecia) === null) {
    bledy.przesuniecie = '0153';
  }
  return bledy;
}

function regulaZFormularza(f: FormularzZmianyPozycji): RegulaTerminu | undefined {
  if (f.termin === 'obecny') return undefined;
  if (f.termin === 'brak') return { typ: 'brak' };
  const przesuniecie = parsujPrzesuniecie(f.przesuniecie, f.jednostkaPrzesuniecia);
  if (przesuniecie === null) throw new Error('Przesunięcie terminu ma nieprawidłową wartość.');
  return { typ: 'przesuniecie', kotwica: f.termin, przesuniecie, jednostka: f.jednostkaPrzesuniecia };
}

function rowneListy(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((w, i) => w === b[i]);
}

/** Zmienione pola pozycji z formularza bez błędów; pusty obiekt, gdy Administrator niczego nie zmienił. */
export function zmianyPolPozycji(f: FormularzZmianyPozycji, p: PozycjaKatalogu): ZmianyPolPozycji {
  const zmiany: ZmianyPolPozycji = {};
  const tytul = f.tytul.trim().replace(/\s+/g, ' ');
  if (tytul !== p.tytul) zmiany.tytul = tytul;
  const opis = f.warunekOpis.trim();
  if (opis !== p.warunekOpis) zmiany.warunekOpis = opis;
  const instytucja = f.instytucjaIKanal.trim();
  if (instytucja !== p.instytucjaIKanal) zmiany.instytucjaIKanal = instytucja;
  const dane = wierszeListy(f.daneIDokumenty);
  if (!rowneListy(dane, p.instrukcja.daneIDokumenty)) zmiany.daneIDokumenty = dane;
  const kroki = wierszeListy(f.kroki);
  if (!rowneListy(kroki, p.instrukcja.kroki)) zmiany.kroki = kroki;
  const regula = regulaZFormularza(f);
  if (regula !== undefined) zmiany.regulaTerminu = regula;
  return zmiany;
}

// --- Słownik dokumentów i adresatów (ViewCatalogDocumentEdit, ViewCatalogDocumentAdd) -----------------

export type GrupaDokumentow = WpisSlownikaDokumentow['grupa'];

export const GRUPY_DOKUMENTOW: readonly GrupaDokumentow[] = [
  'zasilek-chorobowy',
  'swiadczenie-rehabilitacyjne',
  'zwzm',
  'zasilek-macierzynski',
  'zalaczniki',
  'wnioski-pracownika',
];

export interface FormularzDokumentu {
  grupa: GrupaDokumentow | '';
  swiadczenieAlboWniosek: string;
  formy: FormaZatrudnienia[];
  dokumenty: string;
  adresat: string;
  termin: string;
}

export type PoleDokumentu = 'grupa' | 'swiadczenieAlboWniosek' | 'formy' | 'dokumenty' | 'adresat' | 'termin';

export function formularzDokumentuPoczatkowy(): FormularzDokumentu {
  return { grupa: '', swiadczenieAlboWniosek: '', formy: [], dokumenty: '', adresat: '', termin: '' };
}

export function formularzDokumentu(w: WpisSlownikaDokumentow): FormularzDokumentu {
  return {
    grupa: w.grupa,
    swiadczenieAlboWniosek: w.swiadczenieAlboWniosek,
    formy: w.klucz.formy === 'kazda' ? [...FORMY_ZATRUDNIENIA] : [...w.klucz.formy],
    dokumenty: w.dokumenty.join('\n'),
    adresat: w.adresat,
    termin: w.termin,
  };
}

export function maksDlugoscPolaDokumentu(pole: PoleDokumentu): number {
  return pole === 'swiadczenieAlboWniosek' ? MAKS_DLUGOSC_TYTULU : MAKS_DLUGOSC_OPISU;
}

/** Błędy wpisu słownika dokumentów: 0006 (grupa, formy), 0340 i 0271 (pola tekstowe i lista dokumentów). */
export function walidujDokument(f: FormularzDokumentu): BledyPol<PoleDokumentu> {
  const bledy: BledyPol<PoleDokumentu> = {};
  if (f.grupa === '') bledy.grupa = '0006';
  if (f.formy.length === 0) bledy.formy = '0006';
  const nazwa = bladTekstu(f.swiadczenieAlboWniosek, MAKS_DLUGOSC_TYTULU, '0340');
  if (nazwa) bledy.swiadczenieAlboWniosek = nazwa;
  const dokumenty = bladListy(f.dokumenty, true);
  if (dokumenty) bledy.dokumenty = dokumenty;
  const adresat = bladTekstu(f.adresat, MAKS_DLUGOSC_OPISU, '0340');
  if (adresat) bledy.adresat = adresat;
  const termin = bladTekstu(f.termin, MAKS_DLUGOSC_OPISU, '0340');
  if (termin) bledy.termin = termin;
  return bledy;
}

/** Kolejny wolny identyfikator wpisu słownika dokumentów dodanego w panelu: dokument-1, dokument-2 i dalej. */
export function nastepnyIdDokumentu(k: Katalog): string {
  let n = k.dokumenty.length + 1;
  while (k.dokumenty.some((d) => d.id === `dokument-${n}`)) n += 1;
  return `dokument-${n}`;
}

/**
 * Wpis słownika dokumentów z formularza bez błędów. Zmieniony wpis zachowuje identyfikator, kolejność, płatnika
 * i sytuację z klucza; nowy wpis dostaje kolejny identyfikator i miejsce na końcu grupy. Wszystkie cztery formy
 * zatrudnienia zapisujemy jako „każda forma”.
 */
export function dokumentZFormularza(
  f: FormularzDokumentu,
  k: Katalog,
  istniejacy: WpisSlownikaDokumentow | undefined,
): WpisSlownikaDokumentow {
  if (f.grupa === '') throw new Error('Formularz wpisu słownika dokumentów jest niekompletny.');
  const grupa = f.grupa;
  const formy = FORMY_ZATRUDNIENIA.filter((forma) => f.formy.includes(forma));
  const kolejnosc =
    istniejacy?.grupa === grupa
      ? istniejacy.kolejnosc
      : k.dokumenty.filter((d) => d.grupa === grupa).reduce((maks, d) => Math.max(maks, d.kolejnosc), 0) + 1;
  return {
    id: istniejacy?.id ?? nastepnyIdDokumentu(k),
    grupa,
    swiadczenieAlboWniosek: f.swiadczenieAlboWniosek.trim().replace(/\s+/g, ' '),
    klucz: { ...(istniejacy?.klucz ?? {}), formy: formy.length === FORMY_ZATRUDNIENIA.length ? 'kazda' : formy },
    dokumenty: wierszeListy(f.dokumenty),
    adresat: f.adresat.trim(),
    termin: f.termin.trim(),
    kolejnosc,
  };
}

// --- Nowy wpis słownika, czyli nowy parametr (ViewCatalogEntryAdd) ------------------------------------

export interface FormularzNowegoWpisu {
  slownik: RodzajSlownika;
  nazwa: string;
  etykieta: string;
  jednostka: JednostkaWariantu | '';
  wartosc: string;
  od: string;
}

export type PoleNowegoWpisu = 'nazwa' | 'etykieta' | 'jednostka' | 'wartosc' | 'od';

/** Jednostki nowego parametru w każdym słowniku. */
export const JEDNOSTKI_SLOWNIKA: Readonly<Record<RodzajSlownika, readonly JednostkaWariantu[]>> = {
  'kwoty-i-progi': ['zl', 'procent'],
  'wymiary-i-okresy': ['tygodnie', 'dni', 'miesiace', 'lata'],
};

export function formularzNowegoWpisuPoczatkowy(slownik: RodzajSlownika): FormularzNowegoWpisu {
  return { slownik, nazwa: '', etykieta: '', jednostka: '', wartosc: '', od: '' };
}

export function maksDlugoscPolaWpisu(pole: PoleNowegoWpisu): number {
  return pole === 'nazwa' || pole === 'etykieta' ? MAKS_DLUGOSC_TYTULU : MAKS_DLUGOSC_OPISU;
}

/**
 * Błędy nowego wpisu słownika: 0340, 0271, 0341 (nazwa), 0271 (etykieta wartości), 0006 (jednostka),
 * 0048, 0016, 0151, 0079, 0077, 0078 (wartość według jednostki), 0010 (data początku obowiązywania).
 */
export function walidujNowyWpis(f: FormularzNowegoWpisu, k: Katalog): BledyPol<PoleNowegoWpisu> {
  const bledy: BledyPol<PoleNowegoWpisu> = {};
  const nazwa = bladTekstu(f.nazwa, MAKS_DLUGOSC_TYTULU, '0340');
  if (nazwa) bledy.nazwa = nazwa;
  else if (k.slowniki.some((w) => znormalizuj(w.nazwa) === znormalizuj(f.nazwa))) bledy.nazwa = '0341';
  const etykieta = bladTekstu(f.etykieta, MAKS_DLUGOSC_TYTULU, null);
  if (etykieta) bledy.etykieta = etykieta;
  if (f.jednostka === '' || !JEDNOSTKI_SLOWNIKA[f.slownik].includes(f.jednostka)) bledy.jednostka = '0006';
  else {
    const wynik = parsujWartoscWariantu(f.wartosc, f.jednostka);
    if ('kod' in wynik) bledy.wartosc = wynik.kod;
  }
  if (parsujDate(f.od) === null) bledy.od = '0010';
  return bledy;
}

/** Kolejny wolny identyfikator nowego wpisu słownika: parametr-1, parametr-2 i dalej. */
export function nastepnyIdWpisu(k: Katalog): string {
  let n = 1;
  while (k.slowniki.some((w) => w.id === `parametr-${n}`)) n += 1;
  return `parametr-${n}`;
}

/** Klucz jedynego wariantu nowego wpisu; kolejne wersje Administrator dopisuje w ViewCatalogValueEdit. */
export const KLUCZ_WARIANTU_NOWEGO_WPISU = 'wartosc';

/** Nowy wpis słownika z jedną wersją od daty z formularza bez błędów; wpis jest edytowalny i stoi na końcu słownika. */
export function nowyWpisSlownika(
  f: FormularzNowegoWpisu,
  k: Katalog,
  w: { konto: Pesel; teraz: ZnacznikCzasu },
): WpisSlownika {
  const od = parsujDate(f.od);
  if (f.jednostka === '' || od === null) throw new Error('Formularz nowego wpisu słownika jest niekompletny.');
  const wynik = parsujWartoscWariantu(f.wartosc, f.jednostka);
  if ('kod' in wynik) throw new Error('Wartość nowego wpisu słownika jest nieprawidłowa.');
  const nazwa = f.nazwa.trim().replace(/\s+/g, ' ');
  const etykieta = f.etykieta.trim().replace(/\s+/g, ' ');
  const kolejnosc = k.slowniki.filter((s) => s.slownik === f.slownik).reduce((maks, s) => Math.max(maks, s.kolejnosc), 0) + 1;
  return {
    id: nastepnyIdWpisu(k),
    slownik: f.slownik,
    nazwa,
    warianty: [{ klucz: KLUCZ_WARIANTU_NOWEGO_WPISU, etykieta: etykieta === '' ? nazwa : etykieta, jednostka: f.jednostka }],
    wersje: [{ od, wartosci: { [KLUCZ_WARIANTU_NOWEGO_WPISU]: wynik.wartosc }, dodano: { przez: w.konto, czas: w.teraz } }],
    szablonOpisu: '',
    edytowalny: true,
    kolejnosc: Math.floor(kolejnosc),
  };
}
