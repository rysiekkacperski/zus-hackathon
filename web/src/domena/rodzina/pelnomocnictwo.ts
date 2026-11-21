// Pełnomocnictwo PEL drugiego rodzica i dane drugiego rodzica z konta ZUS (kontrakt, sekcja 7.2).
// Właściciel: u23 (Dołączenie drugiego rodzica i pełnomocnictwo PEL). Funkcje są czyste: datę dostają jako argument.
import { dataZeZnacznika, dodajMiesiace } from '@/domena/daty';
import type {
  DanaZeZrodla,
  DaneDrugiegoRodzicaZKonta,
  DaneZKontaZus,
  DataISO,
  DrugiRodzic,
  FormaZatrudnienia,
  KodKomunikatu,
  PelnomocnictwoPel,
  Pesel,
  PlatnikZasilku,
  StanPelnomocnictwa,
  TytulUbezpieczenia,
  ZrodloDanej,
} from '@/domena/typy';

/** Pierwszy dzień obowiązywania: data początkowa albo, bez dat, dzień dotarcia do ZUS. */
export function poczatekPelnomocnictwa(p: PelnomocnictwoPel): DataISO {
  return p.od ?? p.dataDotarcia;
}

/** Stan pełnomocnictwa w dniu `dzis` (0221, 0222, 0223, 0224). */
export function stanPelnomocnictwa(p: PelnomocnictwoPel | null, dzis: DataISO): StanPelnomocnictwa {
  if (p === null) return 'brak';
  if (p.dataOdwolania !== undefined && p.dataOdwolania <= dzis) return 'odwolane';
  if (p.do !== undefined && p.do < dzis) return 'wygaslo';
  if (p.zakres === 'korespondencja') return 'ograniczone';
  if (poczatekPelnomocnictwa(p) > dzis) return 'obowiazuje-od';
  return 'obowiazuje';
}

const KOLEJNOSC_STANOW: readonly StanPelnomocnictwa[] = ['obowiazuje', 'obowiazuje-od', 'ograniczone', 'wygaslo', 'odwolane'];

/**
 * Pełnomocnictwo PEL do roli Ubezpieczony udzielone kontu `peselPelnomocnika`. Gdy profil zna PESEL drugiego
 * rodzica, liczą się wyłącznie jego pełnomocnictwa. Z kilku wybiera najkorzystniejszy stan, a przy równym stanie
 * pełnomocnictwo, które dotarło do ZUS najpóźniej.
 */
export function wybierzPelnomocnictwo(
  lista: readonly PelnomocnictwoPel[],
  w: { peselPelnomocnika: Pesel; peselMocodawcy?: Pesel },
  dzis: DataISO,
): PelnomocnictwoPel | null {
  const pasujace = lista.filter(
    (p) =>
      p.rola === 'ubezpieczony' &&
      p.peselPelnomocnika === w.peselPelnomocnika &&
      (w.peselMocodawcy === undefined || p.mocodawca.pesel === w.peselMocodawcy),
  );
  const pozycja = (p: PelnomocnictwoPel) => KOLEJNOSC_STANOW.indexOf(stanPelnomocnictwa(p, dzis));
  const posortowane = [...pasujace].sort(
    (a, b) => pozycja(a) - pozycja(b) || (a.dataDotarcia < b.dataDotarcia ? 1 : a.dataDotarcia > b.dataDotarcia ? -1 : 0),
  );
  return posortowane[0] ?? null;
}

/** Pełnomocnictwo z datą początkową późniejszą niż dzień dotarcia do ZUS, czyli udzielone od przyszłej daty. */
export function czyUdzieloneOdPrzyszlejDaty(p: PelnomocnictwoPel): boolean {
  return p.od !== undefined && p.od > p.dataDotarcia;
}

export interface KomunikatPelnomocnictwa {
  kod: Extract<KodKomunikatu, '0220' | '0221' | '0222' | '0223' | '0224'>;
  parametry?: Record<string, string>;
}

/** Komunikat stanu pełnomocnictwa na ekranie ViewSecondParentPowerOfAttorney; daty w parametrach w formacie DD.MM.RRRR. */
export function komunikatStanu(
  p: PelnomocnictwoPel | null,
  stan: StanPelnomocnictwa,
  formatujDate: (d: DataISO) => string,
): KomunikatPelnomocnictwa | null {
  if (p === null || stan === 'brak') return { kod: '0223' };
  const imieINazwisko = p.mocodawca.imieINazwiskoDopelniacz;
  if (stan === 'odwolane') return { kod: '0220', parametry: { imieINazwisko } };
  if (stan === 'wygaslo' && p.do !== undefined) return { kod: '0221', parametry: { imieINazwisko, data: formatujDate(p.do) } };
  if (stan === 'ograniczone') return { kod: '0222', parametry: { imieINazwisko } };
  if (stan === 'obowiazuje-od') {
    return { kod: '0224', parametry: { imieINazwisko, data: formatujDate(poczatekPelnomocnictwa(p)) } };
  }
  return null;
}

/**
 * Dane drugiego rodzica z kopii Danych z konta ZUS mocodawcy: wyłącznie tytuły i okresy ubezpieczenia
 * z ubezpieczeniem chorobowym, podstawami składek i informacją, czy płatnik składek wypłaca zasiłki,
 * oraz wypłacone zasiłki (R-PEL-ZAKRES). Zaświadczeń e-ZLA i pozostałych danych konta nie przenosi.
 */
export function daneZPelnomocnictwa(kopiaMocodawcy: DaneZKontaZus): DaneDrugiegoRodzicaZKonta {
  return {
    zrodlo: 'pelnomocnictwo-pel',
    tytuly: kopiaMocodawcy.tytuly.map((t) => ({
      id: t.id,
      rodzaj: t.rodzaj,
      od: t.od,
      ...(t.do === undefined ? {} : { do: t.do }),
      ubezpieczenieChorobowe: { ...t.ubezpieczenieChorobowe },
      podstawySkladek: t.podstawySkladek.map((p) => ({ ...p })),
      platnik: { ...t.platnik },
    })),
    zasilki: kopiaMocodawcy.zasilki.map((z) => ({ ...z })),
    odczytano: kopiaMocodawcy.odczytano,
  };
}

/** Dana z pierwszeństwem źródeł: konto ZUS > pełnomocnictwo PEL > odpowiedź rodzica. */
export function pierwszenstwoZrodel<T>(
  a: DanaZeZrodla<T> | null | undefined,
  b: DanaZeZrodla<T> | null | undefined,
): DanaZeZrodla<T> | null {
  const waga = (d: DanaZeZrodla<T> | null | undefined): number =>
    d == null ? -1 : d.zrodlo === 'konto-zus' ? 2 : d.zrodlo === 'pelnomocnictwo-pel' ? 1 : 0;
  if (a == null && b == null) return null;
  return waga(b) > waga(a) ? (b ?? null) : (a ?? null);
}

// --- Dane drugiego rodzica z tytułów ubezpieczenia ----------------------------------------------

function czyTrwa(t: TytulUbezpieczenia, dzien: DataISO): boolean {
  return t.od <= dzien && (t.do === undefined || t.do >= dzien);
}

const PIERWSZENSTWO_TYTULOW: readonly TytulUbezpieczenia['rodzaj'][] = ['pracownik', 'dzialalnosc', 'zleceniobiorca'];

/** Tytuł ubezpieczenia, który wyznacza formę zatrudnienia w dniu `dzien`: pracownik > działalność > zlecenie. */
export function tytulGlowny(tytuly: readonly TytulUbezpieczenia[], dzien: DataISO): TytulUbezpieczenia | null {
  for (const rodzaj of PIERWSZENSTWO_TYTULOW) {
    const tytul = tytuly.find((t) => t.rodzaj === rodzaj && czyTrwa(t, dzien));
    if (tytul) return tytul;
  }
  return null;
}

const FORMA_Z_TYTULU: Record<TytulUbezpieczenia['rodzaj'], FormaZatrudnienia> = {
  pracownik: 'umowa-o-prace',
  dzialalnosc: 'jdg',
  zleceniobiorca: 'umowa-zlecenia',
};

export interface DaneProfiluZTytulow {
  formaZatrudnienia: DanaZeZrodla<FormaZatrudnienia>;
  dobrowolneChorobowe: DanaZeZrodla<boolean> | null;
  platnikZasilku: DanaZeZrodla<PlatnikZasilku> & { nazwaPlatnika?: string };
}

/**
 * Forma zatrudnienia, dobrowolne ubezpieczenie chorobowe i płatnik zasiłku drugiego rodzica z jego tytułów.
 * Przy umowie o pracę ubezpieczenie chorobowe jest obowiązkowe, więc pole dobrowolnego ubezpieczenia zostaje puste.
 * Płatnik składek, który wypłaca zasiłki, jest płatnikiem zasiłku; w pozostałych przypadkach zasiłek wypłaca ZUS.
 */
export function daneProfiluZTytulow(
  tytuly: readonly TytulUbezpieczenia[],
  zrodlo: Exclude<ZrodloDanej, 'odpowiedz-rodzica'>,
  dzien: DataISO,
): DaneProfiluZTytulow {
  const tytul = tytulGlowny(tytuly, dzien);
  if (tytul === null) {
    return {
      formaZatrudnienia: { wartosc: 'brak-tytulu', zrodlo },
      dobrowolneChorobowe: null,
      platnikZasilku: { wartosc: 'brak-platnika', zrodlo },
    };
  }
  const forma = FORMA_Z_TYTULU[tytul.rodzaj];
  const dobrowolneChorobowe =
    forma === 'umowa-o-prace' ? null : { wartosc: tytul.ubezpieczenieChorobowe.rodzaj === 'dobrowolne', zrodlo };
  const wyplaca = tytul.platnik.wyplacaZasilki;
  const platnikZasilku: DaneProfiluZTytulow['platnikZasilku'] =
    forma === 'umowa-o-prace' && wyplaca === 'tak'
      ? { wartosc: 'platnik-skladek', zrodlo, nazwaPlatnika: tytul.platnik.nazwa }
      : forma === 'umowa-o-prace' && wyplaca === 'brak-informacji'
        ? { wartosc: 'nieustalony', zrodlo }
        : { wartosc: 'zus', zrodlo };
  return { formaZatrudnienia: { wartosc: forma, zrodlo }, dobrowolneChorobowe, platnikZasilku };
}

/** Zasiłki wypłacone w ostatnich 6 miesiącach przed dniem odczytu. */
export function zasilkiZOstatnichMiesiecy<T extends { dataWyplaty: DataISO }>(zasilki: readonly T[], dzien: DataISO): T[] {
  const od = dodajMiesiace(dzien, -6);
  return zasilki.filter((z) => z.dataWyplaty >= od && z.dataWyplaty <= dzien);
}

// --- Dane drugiego rodzica z pełnomocnictwa w profilu rodziny ----------------------------------

/** Profil rodziny zawiera dane drugiego rodzica odczytane na podstawie pełnomocnictwa PEL. */
export function czyDaneZPelnomocnictwa(drugi: DrugiRodzic): boolean {
  return drugi.daneZKontaZus?.zrodlo === 'pelnomocnictwo-pel';
}

/** Kopia odpowiedzi rodzica o drugim rodzicu bez zachowanej kopii. */
function odpowiedziRodzica(drugi: DrugiRodzic): Omit<DrugiRodzic, 'zachowaneOdpowiedzi'> {
  const { zachowaneOdpowiedzi, ...reszta } = drugi;
  void zachowaneOdpowiedzi;
  return structuredClone(reszta);
}

/**
 * Zapis danych z pełnomocnictwa PEL w danych drugiego rodzica (R-PEL-ODCZYT): forma zatrudnienia, dobrowolne
 * ubezpieczenie chorobowe i płatnik zasiłku ze źródłem pełnomocnictwo PEL, dane konta z datą odczytu oraz kopia
 * odpowiedzi rodzica sprzed pierwszego odczytu.
 */
export function zastosujDaneZPelnomocnictwa(
  drugi: DrugiRodzic,
  dane: DaneDrugiegoRodzicaZKonta,
  mocodawca: PelnomocnictwoPel['mocodawca'],
): DrugiRodzic {
  const zachowane = czyDaneZPelnomocnictwa(drugi) && drugi.zachowaneOdpowiedzi ? drugi.zachowaneOdpowiedzi : odpowiedziRodzica(drugi);
  const profil = daneProfiluZTytulow(dane.tytuly, 'pelnomocnictwo-pel', dataZeZnacznika(dane.odczytano));
  return {
    ...drugi,
    imie: mocodawca.imie,
    nazwisko: mocodawca.nazwisko,
    imieINazwiskoDopelniacz: mocodawca.imieINazwiskoDopelniacz,
    pesel: mocodawca.pesel,
    formaZatrudnienia: profil.formaZatrudnienia,
    dobrowolneChorobowe: profil.dobrowolneChorobowe,
    platnikZasilku: profil.platnikZasilku,
    daneZKontaZus: dane,
    zachowaneOdpowiedzi: zachowane,
  };
}

/** Usunięcie danych ze źródłem pełnomocnictwo PEL i przywrócenie zachowanych odpowiedzi rodzica. */
export function przywrocOdpowiedziRodzica(drugi: DrugiRodzic): DrugiRodzic {
  if (!czyDaneZPelnomocnictwa(drugi)) return drugi;
  if (drugi.zachowaneOdpowiedzi) return structuredClone(drugi.zachowaneOdpowiedzi);
  const { daneZKontaZus, zachowaneOdpowiedzi, ...reszta } = drugi;
  void daneZKontaZus;
  void zachowaneOdpowiedzi;
  return reszta;
}

export type DecyzjaOdswiezenia =
  | { rodzaj: 'bez-zmian' }
  | { rodzaj: 'odczytaj' }
  | { rodzaj: 'usun'; komunikat: KomunikatPelnomocnictwa };

/**
 * Decyzja przy otwarciu przewodnika przez Rodzica, gdy drugi rodzic nie dołączył (R-PEL-ODSWIEZENIE): obowiązujące
 * pełnomocnictwo daje ponowny odczyt, a pierwszy odczyt, gdy nastał dzień początku pełnomocnictwa udzielonego od
 * przyszłej daty; wygasłe, odwołane, ograniczone albo brakujące pełnomocnictwo usuwa zapisane dane.
 */
export function decyzjaOdswiezenia(
  drugi: DrugiRodzic,
  p: PelnomocnictwoPel | null,
  dzis: DataISO,
  formatujDate: (d: DataISO) => string,
): DecyzjaOdswiezenia {
  const stan = stanPelnomocnictwa(p, dzis);
  if (!czyDaneZPelnomocnictwa(drugi)) {
    return stan === 'obowiazuje' && p !== null && czyUdzieloneOdPrzyszlejDaty(p) ? { rodzaj: 'odczytaj' } : { rodzaj: 'bez-zmian' };
  }
  if (stan === 'obowiazuje') return { rodzaj: 'odczytaj' };
  const imieINazwisko =
    p?.mocodawca.imieINazwiskoDopelniacz ?? drugi.imieINazwiskoDopelniacz ?? [drugi.imie, drugi.nazwisko].filter(Boolean).join(' ');
  if (stan === 'wygaslo' && p?.do !== undefined) {
    return { rodzaj: 'usun', komunikat: { kod: '0221', parametry: { imieINazwisko, data: formatujDate(p.do) } } };
  }
  if (stan === 'ograniczone') return { rodzaj: 'usun', komunikat: { kod: '0222', parametry: { imieINazwisko } } };
  if (stan === 'obowiazuje-od' && p !== null) {
    return {
      rodzaj: 'usun',
      komunikat: { kod: '0224', parametry: { imieINazwisko, data: formatujDate(poczatekPelnomocnictwa(p)) } },
    };
  }
  return { rodzaj: 'usun', komunikat: { kod: '0220', parametry: { imieINazwisko } } };
}
