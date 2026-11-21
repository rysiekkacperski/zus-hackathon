// Odczyt Katalogu świadczeń: wartości obowiązujące, historia wpisów, pozycje (kontrakt, sekcja 7.2).
// Właściciel: u04 (Katalog świadczeń: zawartość).
//
// Wersja wpisu obowiązuje w dniu D, gdy od ≤ D ≤ do (oba końce włącznie). Wersja bez daty końca obowiązuje
// do dnia poprzedzającego początek następnej wersji albo bez końca, gdy następnej wersji brak.
// Kwoty (jednostka 'zl') są w groszach, procenty jako liczba (81.5 = 81,5%). Wariant wyprowadzony liczy wartość
// z wpisu źródłowego obowiązującego w tym samym dniu: z pomniejszeniem A − round(A × p%) albo z mnożnikiem round(A × m).
import { dodajDni, porownajDaty } from '@/domena/daty';
import { formatujKwote, formatujProcent, zaokraglijDoGrosza } from '@/domena/kwoty';
import type {
  DataISO,
  IdPozycji,
  IdRegulySwiadczenia,
  IdSprawy,
  IdWpisuSlownika,
  InstrukcjaPozycji,
  JednostkaWariantu,
  Katalog,
  PozycjaKatalogu,
  WariantWpisu,
  WartoscObowiazujaca,
  WersjaWpisu,
  WpisSlownika,
} from '@/domena/typy';

export type StanWersjiWpisu = 'obowiazuje' | 'zaplanowana' | 'zakonczona';

type WersjaZOkresem = WersjaWpisu & { koniec: DataISO | null };

/** Wpis słownika kwot i progów albo wymiarów i okresów o identyfikatorze `idWpisu`; null, gdy brak wpisu. */
export function wpisSlownika(k: Katalog, idWpisu: IdWpisuSlownika): WpisSlownika | null {
  return k.slowniki.find((w) => w.id === idWpisu) ?? null;
}

// Wersje rosnąco według daty początku z efektywną datą końca.
function wersjeZOkresem(wpis: WpisSlownika): WersjaZOkresem[] {
  const posortowane = [...wpis.wersje].sort((a, b) => porownajDaty(a.od, b.od));
  return posortowane.map((wersja, i) => {
    const nastepna = posortowane[i + 1];
    const koniecPrzedNastepna = nastepna === undefined ? null : dodajDni(nastepna.od, -1);
    let koniec: DataISO | null = wersja.do ?? koniecPrzedNastepna;
    if (wersja.do !== undefined && koniecPrzedNastepna !== null && porownajDaty(wersja.do, koniecPrzedNastepna) > 0) {
      koniec = koniecPrzedNastepna;
    }
    return { ...wersja, koniec };
  });
}

function czyObejmuje(w: WersjaZOkresem, dzien: DataISO): boolean {
  return porownajDaty(w.od, dzien) <= 0 && (w.koniec === null || porownajDaty(dzien, w.koniec) <= 0);
}

/** Wersja wpisu obowiązująca w dniu `dzien`; null, gdy w tym dniu żadna wersja nie obowiązuje. */
export function wersjaObowiazujaca(k: Katalog, idWpisu: IdWpisuSlownika, dzien: DataISO): WersjaWpisu | null {
  const wpis = wpisSlownika(k, idWpisu);
  if (wpis === null) return null;
  const znaleziona = wersjeZOkresem(wpis).find((w) => czyObejmuje(w, dzien));
  if (znaleziona === undefined) return null;
  const { koniec, ...wersja } = znaleziona;
  return koniec === null ? wersja : { ...wersja, do: koniec };
}

// Granica rekurencji wariantów wyprowadzonych, która chroni przed cyklem w danych.
const NAJWIEKSZA_GLEBOKOSC_WYPROWADZENIA = 5;

function wyliczWyprowadzony(
  wyprowadzony: NonNullable<WariantWpisu['wyprowadzony']>,
  zrodlo: number,
): number {
  if (wyprowadzony.pomniejszenieProcent !== undefined) {
    return zrodlo - zaokraglijDoGrosza((zrodlo * wyprowadzony.pomniejszenieProcent) / 100);
  }
  if (wyprowadzony.mnoznik !== undefined) return zaokraglijDoGrosza(zrodlo * wyprowadzony.mnoznik);
  return zrodlo;
}

function wartoscWDniu(
  k: Katalog,
  idWpisu: IdWpisuSlownika,
  dzien: DataISO,
  klucz: string,
  glebokosc: number,
): WartoscObowiazujaca | null {
  const wpis = wpisSlownika(k, idWpisu);
  if (wpis === null) return null;
  const wariant = wpis.warianty.find((w) => w.klucz === klucz);
  if (wariant === undefined) return null;
  if (wariant.wyprowadzony !== undefined) {
    if (glebokosc >= NAJWIEKSZA_GLEBOKOSC_WYPROWADZENIA) return null;
    const zrodlo = wartoscWDniu(k, wariant.wyprowadzony.zWpisu, dzien, wariant.wyprowadzony.zWariantu, glebokosc + 1);
    if (zrodlo === null) return null;
    return {
      wartosc: wyliczWyprowadzony(wariant.wyprowadzony, zrodlo.wartosc),
      jednostka: wariant.jednostka,
      od: zrodlo.od,
      ...(zrodlo.do !== undefined ? { do: zrodlo.do } : {}),
      nazwaWpisu: wpis.nazwa,
    };
  }
  const wersja = wersjaObowiazujaca(k, idWpisu, dzien);
  const wartosc = wersja?.wartosci[klucz];
  if (wersja === null || wartosc === undefined) return null;
  return {
    wartosc,
    jednostka: wariant.jednostka,
    od: wersja.od,
    ...(wersja.do !== undefined ? { do: wersja.do } : {}),
    nazwaWpisu: wpis.nazwa,
  };
}

/** Wartość wariantu wpisu obowiązująca w dniu `dzien` (od ≤ dzien ≤ do); null, gdy brak wersji. */
export function wartoscObowiazujaca(
  k: Katalog,
  idWpisu: IdWpisuSlownika,
  dzien: DataISO,
  wariant: string,
): WartoscObowiazujaca | null {
  return wartoscWDniu(k, idWpisu, dzien, wariant, 0);
}

/** Wartość liczbowa wariantu obowiązująca w dniu `dzien`; zgłasza błąd, gdy katalog jej nie zawiera. */
export function wartoscWymagana(k: Katalog, idWpisu: IdWpisuSlownika, dzien: DataISO, wariant: string): number {
  const wynik = wartoscObowiazujaca(k, idWpisu, dzien, wariant);
  if (wynik === null) throw new Error(`Katalog nie zawiera wartości ${idWpisu}.${wariant} obowiązującej ${dzien}`);
  return wynik.wartosc;
}

/** Wszystkie warianty wpisu obowiązujące w dniu `dzien`, według klucza wariantu; null, gdy brak wpisu. */
export function wartosciObowiazujace(
  k: Katalog,
  idWpisu: IdWpisuSlownika,
  dzien: DataISO,
): Record<string, WartoscObowiazujaca> | null {
  const wpis = wpisSlownika(k, idWpisu);
  if (wpis === null) return null;
  const wynik: Record<string, WartoscObowiazujaca> = {};
  for (const wariant of wpis.warianty) {
    const wartosc = wartoscObowiazujaca(k, idWpisu, dzien, wariant.klucz);
    if (wartosc !== null) wynik[wariant.klucz] = wartosc;
  }
  return wynik;
}

// Wartości wariantów wyprowadzonych w wersji: wartość źródła obowiązująca w dniu początku wersji.
function uzupelnijWyprowadzone(k: Katalog, wpis: WpisSlownika, wersja: WersjaWpisu): WersjaWpisu {
  const wyprowadzone = wpis.warianty.filter((w) => w.wyprowadzony !== undefined);
  if (wyprowadzone.length === 0) return wersja;
  const wartosci = { ...wersja.wartosci };
  for (const wariant of wyprowadzone) {
    const wartosc = wartoscObowiazujaca(k, wpis.id, wersja.od, wariant.klucz);
    if (wartosc !== null) wartosci[wariant.klucz] = wartosc.wartosc;
  }
  return { ...wersja, wartosci };
}

/** Wersje wpisu ze stanem względem dnia `dzis`, malejąco według daty początku. */
export function historiaWpisu(
  k: Katalog,
  idWpisu: IdWpisuSlownika,
  dzis: DataISO,
): (WersjaWpisu & { stan: StanWersjiWpisu })[] {
  const wpis = wpisSlownika(k, idWpisu);
  if (wpis === null) return [];
  return wersjeZOkresem(wpis)
    .map(({ koniec, ...wersja }) => {
      const zOkresem: WersjaWpisu = koniec === null ? wersja : { ...wersja, do: koniec };
      let stan: StanWersjiWpisu = 'obowiazuje';
      if (porownajDaty(wersja.od, dzis) > 0) stan = 'zaplanowana';
      else if (koniec !== null && porownajDaty(koniec, dzis) < 0) stan = 'zakonczona';
      return { ...uzupelnijWyprowadzone(k, wpis, zOkresem), stan };
    })
    .reverse();
}

/** Wartość wariantu w postaci do wyświetlenia: kwota z walutą, procent ze znakiem %, pozostałe liczby bez jednostki. */
export function formatujWartoscWariantu(wartosc: number, jednostka: JednostkaWariantu): string {
  if (jednostka === 'zl') return formatujKwote(wartosc);
  if (jednostka === 'procent') return formatujProcent(wartosc);
  return String(wartosc).replace('.', ',');
}

/** Opis wersji wpisu według szablonu wpisu, np. „800,00 zł miesięcznie na dziecko”. */
export function opisWersji(wpis: WpisSlownika, wersja: WersjaWpisu): string {
  return wpis.szablonOpisu.replace(/\{([A-Za-z0-9]+)\}/g, (calosc, klucz: string) => {
    const wariant = wpis.warianty.find((w) => w.klucz === klucz);
    const wartosc = wersja.wartosci[klucz];
    if (wariant === undefined || wartosc === undefined) return calosc;
    return formatujWartoscWariantu(wartosc, wariant.jednostka);
  });
}

/** Opis wartości wpisu obowiązującej w dniu `dzien`; null, gdy w tym dniu żadna wersja nie obowiązuje. */
export function opisWartosciObowiazujacej(k: Katalog, idWpisu: IdWpisuSlownika, dzien: DataISO): string | null {
  const wpis = wpisSlownika(k, idWpisu);
  const wersja = wersjaObowiazujaca(k, idWpisu, dzien);
  if (wpis === null || wersja === null) return null;
  return opisWersji(wpis, uzupelnijWyprowadzone(k, wpis, wersja));
}

/** Pozycja katalogu o identyfikatorze `id`; zgłasza błąd, gdy katalog jej nie zawiera. */
export function pozycja(k: Katalog, id: IdPozycji): PozycjaKatalogu {
  const znaleziona = k.pozycje.find((p) => p.id === id);
  if (znaleziona === undefined) throw new Error(`Katalog nie zawiera pozycji ${id}`);
  return znaleziona;
}

/** Pozycja katalogu o identyfikatorze `id` albo null, gdy katalog jej nie zawiera. */
export function pozycjaLubBrak(k: Katalog, id: IdPozycji): PozycjaKatalogu | null {
  return k.pozycje.find((p) => p.id === id) ?? null;
}

/** Identyfikator pozycji katalogu ze sprawy planu: 'K21-matka' → 'K21'; null dla spraw spoza katalogu (strażnik). */
export function idPozycjiZeSprawy(idSprawy: IdSprawy): IdPozycji | null {
  const m = /^(K\d{2,})(?:-|$)/.exec(idSprawy);
  return m === null ? null : m[1];
}

/** Tytuł sprawy planu z pozycji katalogu; dla sprawy spoza katalogu zwraca identyfikator sprawy. */
export function tytulSprawy(k: Katalog, idSprawy: IdSprawy): string {
  const idPozycji = idPozycjiZeSprawy(idSprawy);
  if (idPozycji === null) return idSprawy;
  return pozycjaLubBrak(k, idPozycji)?.tytul ?? idSprawy;
}

/** Instrukcja pozycji katalogu: kroki, dane i dokumenty, adres kanału i odnośniki. */
export function instrukcjaPozycji(k: Katalog, id: IdPozycji): InstrukcjaPozycji {
  return pozycja(k, id).instrukcja;
}

/** Wpisy słowników kwot i wymiarów, z których korzysta reguła świadczenia. */
export function wpisyReguly(k: Katalog, idReguly: IdRegulySwiadczenia): WpisSlownika[] {
  const zReguly = k.reguly.find((r) => r.id === idReguly)?.wpisy ?? [];
  const wynik: WpisSlownika[] = [];
  const dodane = new Set<IdWpisuSlownika>();
  for (const idWpisu of zReguly) {
    const wpis = wpisSlownika(k, idWpisu);
    if (wpis !== null && !dodane.has(wpis.id)) {
      wynik.push(wpis);
      dodane.add(wpis.id);
    }
  }
  const zWpisow = k.slowniki
    .filter((w) => !dodane.has(w.id) && (w.reguly ?? []).includes(idReguly))
    .sort((a, b) => (a.slownik === b.slownik ? a.kolejnosc - b.kolejnosc : a.slownik === 'kwoty-i-progi' ? -1 : 1));
  return [...wynik, ...zWpisow];
}
