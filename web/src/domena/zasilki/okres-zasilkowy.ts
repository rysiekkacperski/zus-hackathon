// Okres zasiłkowy i wynagrodzenie chorobowe z zaświadczeń e-ZLA (kontrakt, sekcja 7.2; ANALIZY/16 R2–R9).
// Właściciel: u14 (Dane ZUS: e-ZLA, rozliczenia składek, statusy wniosków).
import { czesciDaty, dodajDni, formatujDate, liczbaDniWlacznie, porownajDaty, roznicaDni } from '@/domena/daty';
import { wartoscObowiazujaca } from '@/domena/katalog/odczyt';
import { dataUrodzeniaZPesel } from '@/domena/pesel';
import type {
  DaneZKontaZus,
  DataISO,
  FormaZatrudnienia,
  IdWpisuSlownika,
  Katalog,
  KodKomunikatu,
  Pesel,
  WpisSlownika,
  ZaswiadczenieEzla,
} from '@/domena/typy';

export interface WynikOkresuZasilkowego {
  zaswiadczenia: ZaswiadczenieEzla[]; // zaświadczenia ostatniego okresu zasiłkowego
  wykorzystane: number;
  pozostale: number;
  dataWyczerpania: DataISO | null;
  /** Pierwszy dzień ostatniego okresu zasiłkowego. */
  poczatek?: DataISO;
  /** Limit dni okresu zasiłkowego w ciąży. */
  limit?: number;
  /** Dni wykorzystanej części przypadające po dniu `dzis` z opcji, objęte już wystawionymi zaświadczeniami. */
  poDzis?: number;
}

/** Limity dni wynagrodzenia chorobowego w roku kalendarzowym. */
export interface LimityWynagrodzeniaChorobowego {
  podstawowy: number;
  po50Roku: number;
}

export interface WynikWynagrodzeniaChorobowego {
  rok: number;
  limit: number;
  wykorzystane: number;
  pozostale: number;
  zasilekOd?: DataISO;
  /** Początek nieprzerwanej niezdolności trwającej na przełomie roku, za którą od 1 stycznia przysługuje zasiłek. */
  zasilekZaNiezdolnoscOd?: DataISO;
}

/** Wartości domyślne słowników (3.5.1), gdy katalog nie ma wpisu. */
export const DOMYSLNE_OKRESY = {
  okresZasilkowyWCiazy: 270,
  przerwaWOkresie: 60,
  wynagrodzeniePodstawowe: 33,
  wynagrodzeniePo50: 14,
} as const;

/** Wartości liczbowe wersji wpisu słownika o nazwie zaczynającej się od `nazwa`, obowiązującej w dniu `dzien`. */
export function wartosciWpisuWgNazwy(katalog: Katalog, nazwa: string, dzien: DataISO): number[] {
  const szukana = nazwa.toLowerCase();
  const wpis: WpisSlownika | undefined = katalog.slowniki.find((w) => w.nazwa.toLowerCase().startsWith(szukana));
  if (!wpis) return [];
  const wersja = wpis.wersje.find((w) => w.od <= dzien && (w.do === undefined || dzien <= w.do));
  if (!wersja) return [];
  return Object.values(wersja.wartosci).filter((w) => Number.isFinite(w));
}

/**
 * Wartość wariantu `klucz` wpisu słownika obowiązująca w dniu `dzien`. Wpis szukamy po identyfikatorze z katalogu (u04),
 * a gdy go brak, po początku nazwy wpisu; null, gdy katalog nie ma wpisu albo wartości w tym dniu.
 */
export function wartoscZKatalogu(
  katalog: Katalog,
  wpis: { id: IdWpisuSlownika; nazwa: string; klucz: string },
  dzien: DataISO,
): number | null {
  const szukana = wpis.nazwa.toLowerCase();
  const id =
    katalog.slowniki.find((w) => w.id === wpis.id)?.id ??
    katalog.slowniki.find((w) => w.nazwa.toLowerCase().startsWith(szukana))?.id;
  if (id === undefined) return null;
  const wynik = wartoscObowiazujaca(katalog, id, dzien, wpis.klucz);
  return wynik !== null && Number.isFinite(wynik.wartosc) ? wynik.wartosc : null;
}

/** Limit okresu zasiłkowego w ciąży i przerwa łącząca okresy niezdolności, ze słownika wymiarów i okresów. */
export function okresyZKatalogu(katalog: Katalog, dzien: DataISO): { limit: number; przerwa: number } {
  const limit = wartoscZKatalogu(katalog, { id: 'okres-zasilkowy', nazwa: 'Okres zasiłkowy', klucz: 'ciaza' }, dzien);
  const przerwa = wartoscZKatalogu(
    katalog,
    { id: 'przerwa-w-niezdolnosci-do-pracy', nazwa: 'Przerwa w niezdolności', klucz: 'dni' },
    dzien,
  );
  return {
    limit: limit ?? DOMYSLNE_OKRESY.okresZasilkowyWCiazy,
    przerwa: przerwa ?? DOMYSLNE_OKRESY.przerwaWOkresie,
  };
}

/** Limity wynagrodzenia chorobowego (33 i 14 dni) ze słownika wymiarów i okresów. */
export function limityZKatalogu(katalog: Katalog, dzien: DataISO): LimityWynagrodzeniaChorobowego {
  const wpis = { id: 'wynagrodzenie-chorobowe-pracownika', nazwa: 'Wynagrodzenie chorobowe pracownika' };
  const podstawowy = wartoscZKatalogu(katalog, { ...wpis, klucz: 'dni' }, dzien);
  const po50Roku = wartoscZKatalogu(katalog, { ...wpis, klucz: 'dniPoUkonczeniuWieku' }, dzien);
  return {
    podstawowy: podstawowy ?? DOMYSLNE_OKRESY.wynagrodzeniePodstawowe,
    po50Roku: po50Roku ?? DOMYSLNE_OKRESY.wynagrodzeniePo50,
  };
}

/** Liczba dni niezdolności z zaświadczenia, obie daty włącznie. */
export function liczbaDniZaswiadczenia(z: ZaswiadczenieEzla): number {
  return liczbaDniWlacznie({ od: z.od, do: z.do });
}

/** Zaświadczenia od najpóźniejszego początku okresu niezdolności (kolejność listy ViewSickLeaveList). */
export function zaswiadczeniaOdNajnowszych(zaswiadczenia: readonly ZaswiadczenieEzla[]): ZaswiadczenieEzla[] {
  return [...zaswiadczenia].sort((a, b) => porownajDaty(b.od, a.od) || porownajDaty(b.do, a.do));
}

/** Zaświadczenie z kodem B, czyli niezdolność do pracy przypadająca w okresie ciąży. */
export function czyKodCiazy(z: ZaswiadczenieEzla): boolean {
  return z.kodyLiterowe.includes('B');
}

/** Dni kalendarzowe objęte zaświadczeniami (bez podwójnego liczenia nakładających się okresów), rosnąco. */
function dniNiezdolnosci(zaswiadczenia: readonly ZaswiadczenieEzla[]): DataISO[] {
  const dni = new Set<DataISO>();
  for (const z of zaswiadczenia) {
    const liczba = liczbaDniZaswiadczenia(z);
    for (let i = 0; i < liczba; i += 1) dni.add(dodajDni(z.od, i));
  }
  return [...dni].sort();
}

/** Ciągi nieprzerwanej niezdolności do pracy z rosnącej listy dni. */
function ciagiNiezdolnosci(dni: readonly DataISO[]): DataISO[][] {
  const ciagi: DataISO[][] = [];
  for (const d of dni) {
    const ostatni = ciagi.at(-1);
    if (ostatni && roznicaDni(ostatni[ostatni.length - 1], d) === 1) ostatni.push(d);
    else ciagi.push([d]);
  }
  return ciagi;
}

/**
 * Okres zasiłkowy w ciąży (3.4.4.1.4): liczony z zaświadczeń rodzaju niezdolność do pracy z powodu choroby, dzień
 * objęty kilkoma zaświadczeniami liczony raz. Okres zaczyna się w pierwszym dniu nieprzerwanej niezdolności, która
 * zawiera dni z kodem B i następuje po co najmniej jednym dniu przerwy, a nieprzerwana niezdolność bez kodu
 * poprzedzająca dni z kodem B wlicza się w całości. Kolejne niezdolności bez kodu B przedłużają okres, gdy przerwa
 * nie przekracza `przerwa` dni. Dni przed `poczatekPrawa`, czyli w okresie wyczekiwania, system pomija.
 */
export function okresZasilkowyWCiazy(
  zaswiadczenia: readonly ZaswiadczenieEzla[],
  limit: number,
  przerwa: number,
  opcje: { poczatekPrawa?: DataISO; dzis?: DataISO } = {},
): WynikOkresuZasilkowego {
  const pusty: WynikOkresuZasilkowego = { zaswiadczenia: [], wykorzystane: 0, pozostale: limit, dataWyczerpania: null, limit };
  const choroba = zaswiadczenia.filter((z) => z.rodzaj === 'choroba');
  const dniB = new Set(dniNiezdolnosci(choroba.filter(czyKodCiazy)));
  if (dniB.size === 0) return pusty;
  const poczatekPrawa = opcje.poczatekPrawa;
  const dni = dniNiezdolnosci(choroba).filter((d) => poczatekPrawa === undefined || d >= poczatekPrawa);
  const ciagi = ciagiNiezdolnosci(dni);
  let start = -1;
  ciagi.forEach((c, i) => {
    if (c.some((d) => dniB.has(d))) start = i;
  });
  if (start < 0) return pusty;

  const okres: DataISO[] = [...ciagi[start]];
  for (const c of ciagi.slice(start + 1)) {
    if (roznicaDni(okres[okres.length - 1], c[0]) - 1 > przerwa) break;
    okres.push(...c);
  }
  const dniOkresu = new Set(okres);
  const zaswiadczeniaOkresu = choroba
    .filter((z) => {
      const liczba = liczbaDniZaswiadczenia(z);
      for (let i = 0; i < liczba; i += 1) if (dniOkresu.has(dodajDni(z.od, i))) return true;
      return false;
    })
    .sort((x, y) => porownajDaty(x.od, y.od) || porownajDaty(x.do, y.do));

  const wykorzystane = Math.min(okres.length, limit);
  const pozostale = Math.max(0, limit - okres.length);
  const ostatniDzien = okres[okres.length - 1];
  const dataWyczerpania = okres.length >= limit ? okres[limit - 1] : dodajDni(ostatniDzien, pozostale);
  const dzis = opcje.dzis;
  const poDzis = dzis === undefined ? {} : { poDzis: okres.slice(0, limit).filter((d) => d > dzis).length };
  return { zaswiadczenia: zaswiadczeniaOkresu, wykorzystane, pozostale, dataWyczerpania, poczatek: okres[0], limit, ...poDzis };
}

/** Limit dni wynagrodzenia chorobowego w roku: od roku po roku ukończenia 50 lat obowiązuje limit obniżony. */
export function limitWynagrodzeniaWRoku(
  dataUrodzenia: DataISO,
  rok: number,
  limity: LimityWynagrodzeniaChorobowego,
): number {
  return rok > czesciDaty(dataUrodzenia).rok + 50 ? limity.po50Roku : limity.podstawowy;
}

/**
 * Dni wynagrodzenia chorobowego wykorzystane w roku kalendarzowym dnia `dzis`. Gdy niezdolność trwa nieprzerwanie na
 * przełomie roku, a 31 grudnia pracownik pobiera zasiłek chorobowy, dni tej niezdolności w nowym roku to zasiłek
 * chorobowy od 1 stycznia, a dni wynagrodzenia nowego roku system liczy od następnej niezdolności (3.4.4.1.4).
 */
export function wynagrodzenieChorobowe(
  zaswiadczenia: readonly ZaswiadczenieEzla[],
  dataUrodzenia: DataISO,
  dzis: DataISO,
  limity: LimityWynagrodzeniaChorobowego,
): WynikWynagrodzeniaChorobowego {
  const rok = czesciDaty(dzis).rok;
  const limit = limitWynagrodzeniaWRoku(dataUrodzenia, rok, limity);
  const wszystkie = dniNiezdolnosci(zaswiadczenia.filter((z) => z.rodzaj === 'choroba'));

  // Reguła przełomu roku: nieprzerwana niezdolność z zasiłkiem chorobowym 31 grudnia poprzedniego roku.
  const sylwester = `${rok - 1}-12-31` as DataISO;
  const nowyRok = `${rok}-01-01` as DataISO;
  let wylaczone = new Set<DataISO>();
  let kontynuacjaOd: DataISO | undefined;
  const dniPoprzedniegoRoku = wszystkie.filter((d) => czesciDaty(d).rok === rok - 1);
  const limitPoprzedni = limitWynagrodzeniaWRoku(dataUrodzenia, rok - 1, limity);
  if (dniPoprzedniegoRoku.length > limitPoprzedni && wszystkie.includes(sylwester) && wszystkie.includes(nowyRok)) {
    const ciag = ciagiNiezdolnosci(wszystkie).find((c) => c.includes(nowyRok));
    if (ciag) {
      wylaczone = new Set(ciag.filter((d) => czesciDaty(d).rok === rok));
      kontynuacjaOd = ciag[0];
    }
  }

  const dniWRoku = wszystkie.filter((d) => czesciDaty(d).rok === rok && !wylaczone.has(d));
  const wykorzystane = Math.min(dniWRoku.length, limit);
  const wynik: WynikWynagrodzeniaChorobowego = { rok, limit, wykorzystane, pozostale: limit - wykorzystane };
  if (kontynuacjaOd !== undefined) {
    wynik.zasilekOd = nowyRok;
    wynik.zasilekZaNiezdolnoscOd = kontynuacjaOd;
  }
  if (dniWRoku.length >= limit && limit > 0 && kontynuacjaOd === undefined) wynik.zasilekOd = dodajDni(dniWRoku[limit - 1], 1);
  return wynik;
}

/** Próg ostrzeżenia o końcu okresu zasiłkowego: 6 tygodni, w których matka składa wniosek o świadczenie rehabilitacyjne. */
export const PROG_OSTRZEZENIA_OKRESU_DNI = 42;

/** Ostrzeżenia okresu zasiłkowego: 0086 przy wyczerpaniu, 0115 przy pozostałej części od 1 do 42 dni. */
export function ostrzezeniaOkresu(
  wynik: WynikOkresuZasilkowego,
  prog: number = PROG_OSTRZEZENIA_OKRESU_DNI,
): { kod: KodKomunikatu; parametry?: Record<string, string> }[] {
  if (wynik.zaswiadczenia.length === 0) return [];
  if (wynik.pozostale === 0) return [{ kod: '0086' }];
  if (wynik.pozostale <= prog) return [{ kod: '0115', parametry: { liczbaDni: String(wynik.pozostale) } }];
  return [];
}

// --- Wyliczenia dla konta ----------------------------------------------------------------------

/** Wariant wyliczeń na ekranie według formy zatrudnienia i ubezpieczenia chorobowego (ANALIZY/16 sekcja 1). */
export type WariantWyliczenEzla =
  | 'wynagrodzenie'
  | 'zasilek-od-pierwszego-dnia'
  | 'po-ustaniu-ubezpieczenia'
  | 'bez-ubezpieczenia';

export interface ProfilUbezpieczenia {
  forma: FormaZatrudnienia | null;
  chorobowe: boolean | null;
  /** Ostatni dzień ubezpieczenia chorobowego, gdy w dniu wyliczeń rodzic nie ma tytułu do ubezpieczenia. */
  koniecUbezpieczenia?: DataISO;
}

/** Forma zatrudnienia i ubezpieczenie chorobowe z tytułów w Danych z konta ZUS (UoP > JDG > UZ). */
export function profilZKopii(kopia: DaneZKontaZus | null, dzien: DataISO): ProfilUbezpieczenia {
  if (!kopia) return { forma: null, chorobowe: null };
  const aktywne = kopia.tytuly.filter((t) => t.od <= dzien && (t.do === undefined || dzien <= t.do));
  if (aktywne.length === 0 && kopia.tytuly.length > 0) {
    const konce = kopia.tytuly
      .filter((t) => t.ubezpieczenieChorobowe.rodzaj !== 'brak')
      .map((t) => t.ubezpieczenieChorobowe.do ?? t.do)
      .filter((d): d is DataISO => d !== undefined && d < dzien)
      .sort();
    const koniec = konce.at(-1);
    return { forma: 'brak-tytulu', chorobowe: false, ...(koniec ? { koniecUbezpieczenia: koniec } : {}) };
  }
  const tytuly = aktywne.length > 0 ? aktywne : kopia.tytuly;
  const kolejnosc = ['pracownik', 'dzialalnosc', 'zleceniobiorca'] as const;
  const tytul = kolejnosc.map((r) => tytuly.find((t) => t.rodzaj === r)).find((t) => t !== undefined);
  if (!tytul) return { forma: 'brak-tytulu', chorobowe: false };
  const forma: FormaZatrudnienia =
    tytul.rodzaj === 'pracownik' ? 'umowa-o-prace' : tytul.rodzaj === 'dzialalnosc' ? 'jdg' : 'umowa-zlecenia';
  return { forma, chorobowe: tytul.ubezpieczenieChorobowe.rodzaj !== 'brak' };
}

/**
 * Rodzic bez tytułu do ubezpieczenia zachowuje prawo do zasiłku, gdy niezdolność do pracy powstała w czasie ubezpieczenia
 * chorobowego i trwa po jego ustaniu albo powstała najpóźniej 14. dnia od ustania ubezpieczenia i trwa bez przerwy
 * co najmniej 30 dni (3.4.4.1.4).
 */
export function niezdolnoscPoUstaniu(zaswiadczenia: readonly ZaswiadczenieEzla[], koniec: DataISO): boolean {
  const ciagi = ciagiNiezdolnosci(dniNiezdolnosci(zaswiadczenia.filter((z) => z.rodzaj === 'choroba')));
  return ciagi.some((c) => {
    const od = c[0];
    const ostatni = c[c.length - 1];
    if (od <= koniec) return ostatni > koniec;
    return roznicaDni(koniec, od) <= 14 && c.length >= 30;
  });
}

export function wariantWyliczen(profil: ProfilUbezpieczenia): WariantWyliczenEzla {
  if (profil.forma === 'brak-tytulu') return 'bez-ubezpieczenia';
  if ((profil.forma === 'umowa-zlecenia' || profil.forma === 'jdg') && profil.chorobowe === false) {
    return 'bez-ubezpieczenia';
  }
  if (profil.forma === 'umowa-o-prace') return 'wynagrodzenie';
  return 'zasilek-od-pierwszego-dnia';
}

export interface WyliczeniaEzla {
  wariant: WariantWyliczenEzla;
  zaswiadczenia: ZaswiadczenieEzla[];
  liczbaZKodemB: number;
  okres: WynikOkresuZasilkowego | null; // null przy braku ubezpieczenia chorobowego
  wynagrodzenie: WynikWynagrodzeniaChorobowego | null; // tylko umowa o pracę
  ostrzezenia: { kod: KodKomunikatu; parametry?: Record<string, string> }[];
}

/** Wyliczenia z zaświadczeń konta przekazywane widokom i planowi rodziny (ANALIZY/16 R9). */
export function wyliczeniaEzla(w: {
  zaswiadczenia: readonly ZaswiadczenieEzla[];
  pesel: Pesel;
  profil: ProfilUbezpieczenia;
  katalog: Katalog;
  dzis: DataISO;
  /** Dzień nabycia prawa do zasiłku po okresie wyczekiwania; dni wcześniejsze system pomija w okresie zasiłkowym. */
  poczatekPrawa?: DataISO;
  progOstrzezenia?: number;
}): WyliczeniaEzla {
  const zaswiadczenia = zaswiadczeniaOdNajnowszych(w.zaswiadczenia);
  const koniec = w.profil.koniecUbezpieczenia;
  const wariant: WariantWyliczenEzla =
    w.profil.forma === 'brak-tytulu' && koniec !== undefined && niezdolnoscPoUstaniu(zaswiadczenia, koniec)
      ? 'po-ustaniu-ubezpieczenia'
      : wariantWyliczen(w.profil);
  const { limit, przerwa } = okresyZKatalogu(w.katalog, w.dzis);
  const okres =
    wariant === 'bez-ubezpieczenia'
      ? null
      : okresZasilkowyWCiazy(zaswiadczenia, limit, przerwa, { dzis: w.dzis, ...(w.poczatekPrawa ? { poczatekPrawa: w.poczatekPrawa } : {}) });
  const dataUrodzenia = dataUrodzeniaZPesel(w.pesel) ?? '1990-01-01';
  const wynagrodzenie =
    wariant === 'wynagrodzenie'
      ? wynagrodzenieChorobowe(zaswiadczenia, dataUrodzenia, w.dzis, limityZKatalogu(w.katalog, w.dzis))
      : null;
  return {
    wariant,
    zaswiadczenia,
    liczbaZKodemB: zaswiadczenia.filter(czyKodCiazy).length,
    okres,
    wynagrodzenie,
    ostrzezenia: okres ? ostrzezeniaOkresu(okres, w.progOstrzezenia ?? PROG_OSTRZEZENIA_OKRESU_DNI) : [],
  };
}

/** Lista serii i numerów zaświadczeń rozdzielona przecinkami. */
export function listaNumerow(zaswiadczenia: readonly ZaswiadczenieEzla[]): string {
  return zaswiadczenia.map((z) => z.seriaINumer).join(', ');
}

/** Okres niezdolności „DD.MM.RRRR – DD.MM.RRRR”. */
export function okresNiezdolnosci(z: ZaswiadczenieEzla): string {
  return `${formatujDate(z.od)} – ${formatujDate(z.do)}`;
}
