// Typowany dostęp do kluczy magazynu (kontrakt, sekcje 5.15 i 6.2) dla hooków i operacji.
// Operacje jednostek czytają i zapisują stan wyłącznie przez te funkcje i wykonajOperacje.
import { seedKatalogu } from '@/dane/katalog';
import { wszystkieKontaDemo as listaKontDemo, znajdzKontoDemo, zajetePesele as peseleKontDemo } from '@/dane/konta-demo';
import { zlozKatalog } from '@/domena/katalog/zloz';
import type {
  DaneDrugiegoRodzicaZKonta,
  DaneRodziny,
  DaneZKontaZus,
  EdycjeKatalogu,
  IdRodziny,
  Katalog,
  KontoDemo,
  KontoPrzewodnika,
  ParametrySystemu,
  Pesel,
  Sesja,
  StanGlobalny,
  StanInterfejsu,
  StanKonta,
  StanRodziny,
  StanSesji,
  StanSymulowanegoZus,
  WynikOperacji,
} from '@/domena/typy';
import {
  KLUCZ_GLOBALNE,
  KLUCZ_SESJA,
  KLUCZ_UI,
  PRZEDROSTEK_KONTA,
  kluczDanychSesji,
  kluczKonta,
  kluczRodziny,
  kluczZus,
} from '@/dane/magazyn/klucze';
import {
  czyBladZapisu,
  kluczeZPrzedrostkiem,
  odczytaj,
  transakcja,
  usun,
  wPunkcieZapisu,
  wTransakcji,
  zapisz,
  zapiszSystemowe,
  type RodzajZapisu,
} from '@/dane/magazyn/rdzen';
import {
  stanGlobalnyPoczatkowy,
  stanInterfejsuPoczatkowy,
  stanSesjiPoczatkowy,
  stanSymulowanegoZusPoczatkowy,
} from '@/dane/magazyn/stan-poczatkowy';

// --- Wykonanie operacji ------------------------------------------------------------------------

class WycofanieOperacji<T> {
  constructor(readonly wynik: WynikOperacji<T>) {}
}

/**
 * Wykonuje operację jako jedną transakcję magazynu. BladZapisu (symulacja albo odrzucony zapis)
 * daje { ok: false, kod: '0003' } bez zmiany stanu. Wewnątrz innej operacji dołącza do jej transakcji
 * w punkcie zapisu: wyjątek cofa zapisy tej operacji i trafia wyżej, żeby operacja zewnętrzna
 * zdecydowała o całości.
 */
export function wykonajOperacje<T>(fn: () => T): WynikOperacji<T> {
  if (wTransakcji()) return { ok: true, wartosc: wPunkcieZapisu(fn) };
  try {
    return { ok: true, wartosc: transakcja(fn) };
  } catch (blad) {
    if (czyBladZapisu(blad)) return { ok: false, kod: '0003' };
    throw blad;
  }
}

/**
 * Jak wykonajOperacje dla funkcji, która sama zwraca WynikOperacji. Wynik { ok: false } wycofuje
 * wszystkie zapisy tej operacji, także wewnątrz innej operacji (punkt zapisu); o dalszym przebiegu
 * decyduje wtedy operacja zewnętrzna.
 */
export function wykonajOperacjeZWynikiem<T>(fn: () => WynikOperacji<T>): WynikOperacji<T> {
  if (wTransakcji()) return wPunkcieZapisu(fn, (wynik) => !wynik.ok);
  try {
    return transakcja(() => {
      const wynik = fn();
      if (!wynik.ok) throw new WycofanieOperacji(wynik);
      return wynik;
    });
  } catch (blad) {
    if (blad instanceof WycofanieOperacji) return blad.wynik as WynikOperacji<T>;
    if (czyBladZapisu(blad)) return { ok: false, kod: '0003' };
    throw blad;
  }
}

// --- Stan globalny i parametry -----------------------------------------------------------------

const GLOBALNE_POCZATKOWE: StanGlobalny = Object.freeze(stanGlobalnyPoczatkowy()) as StanGlobalny;

/** Stan globalny; bez zapisanego klucza stan początkowy (ta sama referencja przy każdym odczycie). */
export function odczytajGlobalne(): StanGlobalny {
  return odczytaj<StanGlobalny>(KLUCZ_GLOBALNE) ?? GLOBALNE_POCZATKOWE;
}

export function stanGlobalnyNaSerwer(): StanGlobalny {
  return GLOBALNE_POCZATKOWE;
}

export function zmienGlobalne(fn: (stan: StanGlobalny) => StanGlobalny, rodzaj: RodzajZapisu): StanGlobalny {
  const nowy = fn(odczytajGlobalne());
  zapisz(KLUCZ_GLOBALNE, nowy, rodzaj);
  return nowy;
}

export function odczytajParametry(): ParametrySystemu {
  return odczytajGlobalne().parametry;
}

export function czyTrybDemonstracyjny(): boolean {
  return odczytajParametry().trybDemonstracyjny;
}

type PrzelacznikSymulacji = {
  [K in keyof ParametrySystemu['symulacje']]: ParametrySystemu['symulacje'][K] extends boolean ? K : never;
}[keyof ParametrySystemu['symulacje']];

/** Włączony przełącznik symulacji; każda symulacja działa wyłącznie w trybie demonstracyjnym (6.6). */
export function czySymulacja(przelacznik: PrzelacznikSymulacji): boolean {
  const parametry = odczytajParametry();
  return parametry.trybDemonstracyjny && parametry.symulacje[przelacznik];
}

// --- Konta demonstracyjne ----------------------------------------------------------------------

/** Konta przykładowe i nowe konta demonstracyjne w kolejności listy na ViewDemoAccountPicker. */
export function wszystkieKontaDemo(globalne: StanGlobalny = odczytajGlobalne()): KontoDemo[] {
  return listaKontDemo(globalne.noweKontaDemo);
}

export function kontoDemo(pesel: Pesel): KontoDemo | null {
  return znajdzKontoDemo(pesel, odczytajGlobalne().noweKontaDemo) ?? null;
}

/** Numery PESEL zajęte przez konta przykładowe, nowe konta demonstracyjne i konta przewodnika. */
export function zajetePesele(): Pesel[] {
  const zajete = new Set<Pesel>(peseleKontDemo(odczytajGlobalne().noweKontaDemo));
  for (const pesel of peseleKontPrzewodnika()) zajete.add(pesel);
  return [...zajete];
}

// --- Sesja -------------------------------------------------------------------------------------

export function odczytajSesje(): Sesja | null {
  return odczytaj<Sesja>(KLUCZ_SESJA);
}

export function zapiszSesje(sesja: Sesja | null): void {
  if (sesja === null) usun(KLUCZ_SESJA, 'systemowe');
  else zapiszSystemowe(KLUCZ_SESJA, sesja);
}

export function odczytajStanSesji(idSesji: string): StanSesji | null {
  return odczytaj<StanSesji>(kluczDanychSesji(idSesji));
}

export function zmienStanSesji(idSesji: string, fn: (stan: StanSesji) => StanSesji): StanSesji {
  const nowy = fn(odczytajStanSesji(idSesji) ?? stanSesjiPoczatkowy());
  zapiszSystemowe(kluczDanychSesji(idSesji), nowy);
  return nowy;
}

export function usunStanSesji(idSesji: string): void {
  usun(kluczDanychSesji(idSesji), 'systemowe');
}

// --- Konto -------------------------------------------------------------------------------------

export function odczytajStanKonta(pesel: Pesel): StanKonta | null {
  return odczytaj<StanKonta>(kluczKonta(pesel));
}

export function zapiszStanKonta(stan: StanKonta, rodzaj: RodzajZapisu = 'domenowe'): void {
  zapisz(kluczKonta(stan.konto.pesel), stan, rodzaj);
}

/** Zmienia stan istniejącego konta przewodnika; bez konta zwraca null i niczego nie zapisuje. */
export function zmienStanKonta(
  pesel: Pesel,
  fn: (stan: StanKonta) => StanKonta,
  rodzaj: RodzajZapisu = 'domenowe',
): StanKonta | null {
  const stan = odczytajStanKonta(pesel);
  if (stan === null) return null;
  const nowy = fn(stan);
  zapisz(kluczKonta(pesel), nowy, rodzaj);
  return nowy;
}

export function zmienKonto(
  pesel: Pesel,
  fn: (konto: KontoPrzewodnika) => KontoPrzewodnika,
  rodzaj: RodzajZapisu = 'domenowe',
): StanKonta | null {
  return zmienStanKonta(pesel, (stan) => ({ ...stan, konto: fn(stan.konto) }), rodzaj);
}

export function usunStanKonta(pesel: Pesel, rodzaj: RodzajZapisu = 'domenowe'): void {
  usun(kluczKonta(pesel), rodzaj);
}

/** Numery PESEL wszystkich kont przewodnika zapisanych w tej przeglądarce. */
export function peseleKontPrzewodnika(): Pesel[] {
  return kluczeZPrzedrostkiem(PRZEDROSTEK_KONTA).map((klucz) => klucz.slice(PRZEDROSTEK_KONTA.length));
}

export interface Zalogowany {
  sesja: Sesja;
  stanKonta: StanKonta;
}

/** Sesja i stan konta zalogowanego użytkownika albo null bez sesji lub konta. */
export function odczytajZalogowanego(): Zalogowany | null {
  const sesja = odczytajSesje();
  if (sesja === null) return null;
  const stanKonta = odczytajStanKonta(sesja.pesel);
  return stanKonta === null ? null : { sesja, stanKonta };
}

export function zalogowanyPesel(): Pesel | null {
  return odczytajSesje()?.pesel ?? null;
}

// --- Rodzina -----------------------------------------------------------------------------------

export function odczytajStanRodziny(idRodziny: IdRodziny): StanRodziny | null {
  return odczytaj<StanRodziny>(kluczRodziny(idRodziny));
}

export function zapiszStanRodziny(stan: StanRodziny, rodzaj: RodzajZapisu = 'domenowe'): void {
  zapisz(kluczRodziny(stan.idRodziny), stan, rodzaj);
}

/** Zmienia stan istniejącej rodziny; bez rodziny zwraca null i niczego nie zapisuje. */
export function zmienStanRodziny(
  idRodziny: IdRodziny,
  fn: (stan: StanRodziny) => StanRodziny,
  rodzaj: RodzajZapisu = 'domenowe',
): StanRodziny | null {
  const stan = odczytajStanRodziny(idRodziny);
  if (stan === null) return null;
  const nowy = fn(stan);
  zapisz(kluczRodziny(idRodziny), nowy, rodzaj);
  return nowy;
}

export function usunStanRodziny(idRodziny: IdRodziny, rodzaj: RodzajZapisu = 'domenowe'): void {
  usun(kluczRodziny(idRodziny), rodzaj);
}

/** Aktywny dostęp konta do rodziny: konto zakładające (IdRodziny = jego PESEL) albo wpis w dostepKont. */
export function czyKontoMaDostep(daneRodziny: DaneRodziny, pesel: Pesel): boolean {
  if (daneRodziny.idRodziny === pesel) return true;
  return daneRodziny.dostepKont.some((d) => d.pesel === pesel && d.stan === 'aktywny');
}

/** Rodzina widoczna dla konta: istniejąca, nieukryta, z aktywnym dostępem konta. */
export function rodzinaKonta(konto: KontoPrzewodnika | null): StanRodziny | null {
  if (konto === null || konto.idRodziny === null) return null;
  const rodzina = odczytajStanRodziny(konto.idRodziny);
  if (rodzina === null || rodzina.ukryte) return null;
  return czyKontoMaDostep(rodzina.daneRodziny, konto.pesel) ? rodzina : null;
}

export interface OsobyRodziny {
  /** Konto, które zapisało profil rodziny (rola Rodzic). */
  peselRodzica: Pesel;
  /** Dołączone konto z rolą Drugi rodzic. */
  peselDolaczonego?: Pesel;
  /** Konto matki w rodzinie, gdy ma konto przewodnika. */
  peselMatki?: Pesel;
  /** Konto drugiego rodzica w rodzinie, gdy ma konto przewodnika. */
  peselDrugiegoRodzica?: Pesel;
}

/**
 * Konta przewodnika obojga rodziców. Konto zakładające jest matką, chyba że Dane rodziny wskazują
 * drugiego rodzica (przyjęcie dziecka przez ojca); wtedy matką jest konto dołączone.
 */
export function osobyRodziny(daneRodziny: DaneRodziny): OsobyRodziny {
  const aktywne = daneRodziny.dostepKont.filter((d) => d.stan === 'aktywny');
  const peselRodzica = aktywne.find((d) => d.rola === 'rodzic')?.pesel ?? daneRodziny.idRodziny;
  const peselDolaczonego = aktywne.find((d) => d.rola === 'drugi-rodzic' && d.pesel !== peselRodzica)?.pesel;
  const rodzicJestMatka = daneRodziny.rodzicKonta === 'matka';
  return {
    peselRodzica,
    peselDolaczonego,
    peselMatki: rodzicJestMatka ? peselRodzica : peselDolaczonego,
    peselDrugiegoRodzica: rodzicJestMatka ? peselDolaczonego : peselRodzica,
  };
}

// --- Symulowany ZUS ----------------------------------------------------------------------------

export function odczytajStanZus(pesel: Pesel): StanSymulowanegoZus | null {
  return odczytaj<StanSymulowanegoZus>(kluczZus(pesel));
}

/** Zmienia stan symulowanego ZUS konta; brakujący stan zakłada ze stanu początkowego. */
export function zmienStanZus(
  pesel: Pesel,
  fn: (stan: StanSymulowanegoZus) => StanSymulowanegoZus,
  rodzaj: RodzajZapisu = 'domenowe',
): StanSymulowanegoZus {
  const nowy = fn(odczytajStanZus(pesel) ?? stanSymulowanegoZusPoczatkowy(pesel));
  zapisz(kluczZus(pesel), nowy, rodzaj);
  return nowy;
}

export function usunStanZus(pesel: Pesel, rodzaj: RodzajZapisu = 'domenowe'): void {
  usun(kluczZus(pesel), rodzaj);
}

// --- Katalog i dane ZUS rodziców ---------------------------------------------------------------

const katalogiWedlugEdycji = new WeakMap<EdycjeKatalogu, Katalog>();
let ostatnieEdycjeTekst: string | null = null;
let ostatniKatalog: Katalog | null = null;

/**
 * Katalog świadczeń: seed z dane/katalog złożony z edycjami Administratora. Te same edycje dają zawsze
 * tę samą referencję katalogu (stabilna migawka useKatalog), także po zapisie innych pól stanu globalnego,
 * który tworzy nowy obiekt edycji o tej samej treści.
 */
export function katalogZEdycji(edycje: EdycjeKatalogu): Katalog {
  const zapamietany = katalogiWedlugEdycji.get(edycje);
  if (zapamietany !== undefined) return zapamietany;
  const tekst = JSON.stringify(edycje);
  const katalog =
    ostatniKatalog !== null && tekst === ostatnieEdycjeTekst ? ostatniKatalog : zlozKatalog(seedKatalogu, edycje);
  ostatnieEdycjeTekst = tekst;
  ostatniKatalog = katalog;
  katalogiWedlugEdycji.set(edycje, katalog);
  return katalog;
}

export function odczytajKatalog(): Katalog {
  return katalogZEdycji(odczytajGlobalne().edycjeKatalogu);
}

/**
 * Dane drugiego rodzica z konta ZUS według pierwszeństwa źródeł: kopia z jego konta przewodnika,
 * dane zapisane w profilu rodziny (po dołączeniu albo z pełnomocnictwa PEL), dane z PEL w kopii matki.
 */
export function daneZusDrugiegoRodzica(
  rodzina: StanRodziny,
  stanDrugiegoRodzica: StanKonta | null,
  stanMatki: StanKonta | null,
): DaneZKontaZus | DaneDrugiegoRodzicaZKonta | null {
  return (
    stanDrugiegoRodzica?.kopiaDanychZus ??
    rodzina.daneRodziny.drugiRodzic.daneZKontaZus ??
    stanMatki?.kopiaDanychZus?.daneDrugiegoRodzicaZPel ??
    null
  );
}

// --- Stan interfejsu ---------------------------------------------------------------------------

const INTERFEJS_POCZATKOWY: StanInterfejsu = Object.freeze(stanInterfejsuPoczatkowy());

export function odczytajStanInterfejsu(): StanInterfejsu {
  return odczytaj<StanInterfejsu>(KLUCZ_UI) ?? INTERFEJS_POCZATKOWY;
}

export function stanInterfejsuNaSerwer(): StanInterfejsu {
  return INTERFEJS_POCZATKOWY;
}

/** Zapis wygody widoku (ppm:v1:ui), na przykład zwinięcia menu bocznego. */
export function ustawStanInterfejsu(zmiana: Partial<StanInterfejsu>): void {
  zapiszSystemowe(KLUCZ_UI, { ...odczytajStanInterfejsu(), ...zmiana });
}
