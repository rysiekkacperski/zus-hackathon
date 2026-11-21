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

/**
 * Okres zasiłkowy w ciąży: zaświadczenia z kodem B z powodu choroby, połączone, gdy przerwa między nimi
 * nie przekracza `przerwa` dni. Liczy wykorzystaną część ostatniego okresu, także dni po dniu odczytu.
 */
export function okresZasilkowyWCiazy(
  zaswiadczenia: ZaswiadczenieEzla[],
  limit: number,
  przerwa: number,
): WynikOkresuZasilkowego {
  const wCiazy = zaswiadczenia
    .filter((z) => czyKodCiazy(z) && z.rodzaj === 'choroba')
    .sort((a, b) => porownajDaty(a.od, b.od) || porownajDaty(a.do, b.do));
  if (wCiazy.length === 0) return { zaswiadczenia: [], wykorzystane: 0, pozostale: limit, dataWyczerpania: null, limit };

  let okres: ZaswiadczenieEzla[] = [wCiazy[0]];
  let koniecOkresu: DataISO = wCiazy[0].do;
  for (const z of wCiazy.slice(1)) {
    const dniPrzerwy = roznicaDni(koniecOkresu, z.od) - 1;
    if (dniPrzerwy > przerwa) {
      okres = [z];
      koniecOkresu = z.do;
    } else {
      okres.push(z);
      if (z.do > koniecOkresu) koniecOkresu = z.do;
    }
  }

  const dni = dniNiezdolnosci(okres);
  const wykorzystane = Math.min(dni.length, limit);
  const pozostale = Math.max(0, limit - dni.length);
  const ostatniDzien = dni[dni.length - 1];
  const dataWyczerpania = dni.length >= limit ? dni[limit - 1] : dodajDni(ostatniDzien, pozostale);
  return { zaswiadczenia: okres, wykorzystane, pozostale, dataWyczerpania, poczatek: dni[0], limit };
}

/** Limit dni wynagrodzenia chorobowego w roku: od roku po roku ukończenia 50 lat obowiązuje limit obniżony. */
export function limitWynagrodzeniaWRoku(
  dataUrodzenia: DataISO,
  rok: number,
  limity: LimityWynagrodzeniaChorobowego,
): number {
  return rok > czesciDaty(dataUrodzenia).rok + 50 ? limity.po50Roku : limity.podstawowy;
}

/** Dni wynagrodzenia chorobowego wykorzystane w roku kalendarzowym dnia `dzis`. */
export function wynagrodzenieChorobowe(
  zaswiadczenia: ZaswiadczenieEzla[],
  dataUrodzenia: DataISO,
  dzis: DataISO,
  limity: LimityWynagrodzeniaChorobowego,
): WynikWynagrodzeniaChorobowego {
  const rok = czesciDaty(dzis).rok;
  const limit = limitWynagrodzeniaWRoku(dataUrodzenia, rok, limity);
  const dniWRoku = dniNiezdolnosci(zaswiadczenia.filter((z) => z.rodzaj === 'choroba')).filter(
    (d) => czesciDaty(d).rok === rok,
  );
  const wykorzystane = Math.min(dniWRoku.length, limit);
  const wynik: WynikWynagrodzeniaChorobowego = { rok, limit, wykorzystane, pozostale: limit - wykorzystane };
  if (dniWRoku.length >= limit && limit > 0) wynik.zasilekOd = dodajDni(dniWRoku[limit - 1], 1);
  return wynik;
}

/** Ostrzeżenia okresu zasiłkowego: 0086 przy wyczerpaniu, 0115 przy pozostałej części nie większej niż próg. */
export function ostrzezeniaOkresu(
  wynik: WynikOkresuZasilkowego,
  prog: number,
): { kod: KodKomunikatu; parametry?: Record<string, string> }[] {
  if (wynik.zaswiadczenia.length === 0) return [];
  if (wynik.pozostale === 0) return [{ kod: '0086' }];
  if (wynik.pozostale <= prog) return [{ kod: '0115', parametry: { liczbaDni: String(wynik.pozostale) } }];
  return [];
}

// --- Wyliczenia dla konta ----------------------------------------------------------------------

/** Wariant wyliczeń na ekranie według formy zatrudnienia i ubezpieczenia chorobowego (ANALIZY/16 sekcja 1). */
export type WariantWyliczenEzla = 'wynagrodzenie' | 'zasilek-od-pierwszego-dnia' | 'bez-ubezpieczenia';

export interface ProfilUbezpieczenia {
  forma: FormaZatrudnienia | null;
  chorobowe: boolean | null;
}

/** Forma zatrudnienia i ubezpieczenie chorobowe z tytułów w Danych z konta ZUS (UoP > JDG > UZ). */
export function profilZKopii(kopia: DaneZKontaZus | null, dzien: DataISO): ProfilUbezpieczenia {
  if (!kopia) return { forma: null, chorobowe: null };
  const aktywne = kopia.tytuly.filter((t) => t.od <= dzien && (t.do === undefined || dzien <= t.do));
  const tytuly = aktywne.length > 0 ? aktywne : kopia.tytuly;
  const kolejnosc = ['pracownik', 'dzialalnosc', 'zleceniobiorca'] as const;
  const tytul = kolejnosc.map((r) => tytuly.find((t) => t.rodzaj === r)).find((t) => t !== undefined);
  if (!tytul) return { forma: 'brak-tytulu', chorobowe: false };
  const forma: FormaZatrudnienia =
    tytul.rodzaj === 'pracownik' ? 'umowa-o-prace' : tytul.rodzaj === 'dzialalnosc' ? 'jdg' : 'umowa-zlecenia';
  return { forma, chorobowe: tytul.ubezpieczenieChorobowe.rodzaj !== 'brak' };
}

export function wariantWyliczen(profil: ProfilUbezpieczenia): WariantWyliczenEzla {
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
  progOstrzezenia: number;
}): WyliczeniaEzla {
  const zaswiadczenia = zaswiadczeniaOdNajnowszych(w.zaswiadczenia);
  const wariant = wariantWyliczen(w.profil);
  const { limit, przerwa } = okresyZKatalogu(w.katalog, w.dzis);
  const okres = wariant === 'bez-ubezpieczenia' ? null : okresZasilkowyWCiazy(zaswiadczenia, limit, przerwa);
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
    ostrzezenia: okres ? ostrzezeniaOkresu(okres, w.progOstrzezenia) : [],
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
