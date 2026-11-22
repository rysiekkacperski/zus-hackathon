// Okres nieprzerwanego ubezpieczenia chorobowego, okres wyczekiwania i wyjątek 10 lat (kontrakt, sekcja 7.2;
// ANALIZY/05 sekcje 5.1, 5.3 i 5.5). Właściciel: u16 (Świadczenia w ciąży i dokumenty wniosków).
// Funkcje są czyste: datę dnia dostają jako argument, a wartości reguł czytają ze słowników katalogu.
import { WPISY_REGUL } from '@/dane/katalog/reguly-swiadczen';
import { dodajDni, porownajDaty, roznicaDni } from '@/domena/daty';
import { wartoscObowiazujaca } from '@/domena/katalog/odczyt';
import type {
  DataISO,
  IdWpisuSlownika,
  Katalog,
  OkresOtwarty,
  RodzajUbezpieczeniaChorobowego,
  TytulUbezpieczenia,
} from '@/domena/typy';

// --- Wartości słowników -------------------------------------------------------------------------

export interface WartoscSlownika {
  idWpisu: IdWpisuSlownika;
  wartosc: number;
  od: DataISO;
}

/**
 * Wartość wariantu `klucz` wpisu słownika obowiązująca w dniu `dzien` (od ≤ dzien ≤ do), z wyliczeniem wariantu
 * wyprowadzonego z wpisu źródłowego. Gdy katalog nie ma wpisu, wariantu albo wersji obowiązującej w tym dniu,
 * zwraca wartość z treści reguły i datę uruchomienia katalogu.
 */
export function wartoscSlownika(
  katalog: Katalog,
  idWpisu: IdWpisuSlownika,
  dzien: DataISO,
  klucz: string,
  domyslna: number,
): WartoscSlownika {
  const obowiazujaca = wartoscObowiazujaca(katalog, idWpisu, dzien, klucz);
  if (obowiazujaca === null) return { idWpisu, wartosc: domyslna, od: katalog.dataUruchomienia };
  return { idWpisu, wartosc: obowiazujaca.wartosc, od: obowiazujaca.od };
}

/** Wartości reguły okresu wyczekiwania w dniu `dzien`. */
export function wartosciWyczekiwania(katalog: Katalog, dzien: DataISO) {
  return {
    obowiazkowe: wartoscSlownika(katalog, WPISY_REGUL.okresWyczekiwania, dzien, 'obowiazkowe', 30),
    dobrowolne: wartoscSlownika(katalog, WPISY_REGUL.okresWyczekiwania, dzien, 'dobrowolne', 90),
    przerwa: wartoscSlownika(katalog, WPISY_REGUL.okresWyczekiwania, dzien, 'przerwa', 30),
    absolwent: wartoscSlownika(katalog, WPISY_REGUL.wyjatkiWyczekiwania, dzien, 'dniOdUkonczeniaSzkoly', 90),
    lata: wartoscSlownika(katalog, WPISY_REGUL.wyjatkiWyczekiwania, dzien, 'lataUbezpieczenia', 10),
  };
}

// --- Okresy ubezpieczenia ------------------------------------------------------------------------

export interface OkresUbezpieczenia {
  od: DataISO;
  do?: DataISO;
  rodzaj: Exclude<RodzajUbezpieczeniaChorobowego, 'brak'>;
  tytul: TytulUbezpieczenia;
}

/** Okresy ubezpieczenia chorobowego z tytułów w danych konta ZUS, uporządkowane od najwcześniejszego. */
export function okresyUbezpieczenia(tytuly: readonly TytulUbezpieczenia[], koniecZProfilu?: DataISO): OkresUbezpieczenia[] {
  const okresy: OkresUbezpieczenia[] = [];
  for (const tytul of tytuly) {
    const ch = tytul.ubezpieczenieChorobowe;
    if (ch.rodzaj === 'brak') continue;
    const od = ch.od ?? tytul.od;
    let koniec = ch.do ?? tytul.do;
    if (koniecZProfilu !== undefined && porownajDaty(od, koniecZProfilu) <= 0) {
      if (koniec === undefined || porownajDaty(koniecZProfilu, koniec) < 0) koniec = koniecZProfilu;
    }
    okresy.push({ od, ...(koniec !== undefined ? { do: koniec } : {}), rodzaj: ch.rodzaj, tytul });
  }
  return okresy.sort((a, b) => porownajDaty(a.od, b.od));
}

function obejmuje(o: OkresUbezpieczenia, dzien: DataISO): boolean {
  return porownajDaty(o.od, dzien) <= 0 && (o.do === undefined || porownajDaty(dzien, o.do) <= 0);
}

export interface AnalizaUbezpieczenia {
  /** Okres trwający w dniu analizy albo ostatni okres przed tym dniem. */
  okres: OkresUbezpieczenia;
  podlega: boolean;
  /** Początek nieprzerwanego ubezpieczenia z wliczeniem poprzednich okresów po przerwie do 30 dni. */
  poczatek: DataISO;
  dniWyczekiwania: number;
  ostatniDzienWyczekiwania: DataISO;
  dzienNabycia: DataISO;
  wyjatek10Lat: boolean;
  wliczonoPoprzedni: boolean;
}

/**
 * Ubezpieczenie chorobowe w dniu `dzien`: okres trwający w tym dniu (albo ostatni zakończony przed nim),
 * początek nieprzerwanego ubezpieczenia, okres wyczekiwania 30 albo 90 dni i wyjątek 10 lat. Null, gdy
 * matka nie ma żadnego okresu ubezpieczenia chorobowego do tego dnia.
 */
export function analizujUbezpieczenie(
  tytuly: readonly TytulUbezpieczenia[],
  dzien: DataISO,
  katalog: Katalog,
  koniecZProfilu?: DataISO,
): AnalizaUbezpieczenia | null {
  const okresy = okresyUbezpieczenia(tytuly, koniecZProfilu);
  const wartosci = wartosciWyczekiwania(katalog, dzien);
  let indeks = okresy.findIndex((o) => obejmuje(o, dzien));
  let podlega = indeks >= 0;
  if (!podlega) {
    indeks = -1;
    okresy.forEach((o, i) => {
      if (o.do !== undefined && porownajDaty(o.do, dzien) < 0) indeks = i;
    });
    if (indeks < 0) return null;
    podlega = false;
  }
  const okres = okresy[indeks];
  let poczatek = okres.od;
  let wliczonoPoprzedni = false;
  for (let i = indeks - 1; i >= 0; i -= 1) {
    const poprzedni = okresy[i];
    if (poprzedni.do === undefined) break;
    const przerwa = roznicaDni(poprzedni.do, poczatek) - 1;
    if (przerwa > wartosci.przerwa.wartosc) break;
    if (porownajDaty(poprzedni.od, poczatek) < 0) poczatek = poprzedni.od;
    wliczonoPoprzedni = true;
  }
  const dniWyczekiwania = okres.rodzaj === 'obowiazkowe' ? wartosci.obowiazkowe.wartosc : wartosci.dobrowolne.wartosc;

  // Wyjątek 10 lat: wcześniejsze okresy obowiązkowego ubezpieczenia łącznie co najmniej 10 lat.
  let dniWczesniejsze = 0;
  for (const o of okresy) {
    if (o.rodzaj !== 'obowiazkowe' || porownajDaty(o.od, poczatek) >= 0) continue;
    const koniec = o.do !== undefined && porownajDaty(o.do, poczatek) < 0 ? o.do : dodajDni(poczatek, -1);
    dniWczesniejsze += roznicaDni(o.od, koniec) + 1;
  }
  const wymaganeDni = Math.round(wartosci.lata.wartosc * 365.25);
  const wyjatek10Lat = okres.rodzaj === 'obowiazkowe' && dniWczesniejsze >= wymaganeDni;

  return {
    okres,
    podlega,
    poczatek,
    dniWyczekiwania,
    ostatniDzienWyczekiwania: dodajDni(poczatek, dniWyczekiwania - 1),
    dzienNabycia: wyjatek10Lat ? poczatek : dodajDni(poczatek, dniWyczekiwania),
    wyjatek10Lat,
    wliczonoPoprzedni,
  };
}

/** Okres ubezpieczenia chorobowego trwający w dniu `dzien`; null, gdy rodzic nie podlega ubezpieczeniu. */
export function okresUbezpieczeniaChorobowego(
  tytuly: TytulUbezpieczenia[],
  dzien: DataISO,
  katalog: Katalog,
): OkresOtwarty | null {
  const analiza = analizujUbezpieczenie(tytuly, dzien, katalog);
  if (analiza === null || !analiza.podlega) return null;
  return { od: analiza.poczatek, ...(analiza.okres.do !== undefined ? { do: analiza.okres.do } : {}) };
}
