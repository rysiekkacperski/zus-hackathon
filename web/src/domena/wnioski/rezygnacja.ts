// Rezygnacja matki z części zasiłku macierzyńskiego (kontrakt, sekcja 7.2). Właściciel: u34 (Rezygnacja matki i wniosek ojca o zasiłek).
// Reguły R1–R4, R7, R13 i R16 analizy 25-3.9.2. Funkcje są czyste: dzień dzisiejszy dostają w argumencie.
import { dodajDni, liczbaDniWlacznie, parsujDate, porownajDaty, roznicaDni } from '@/domena/daty';
import type {
  DaneCiazyIDziecka,
  DaneRodziny,
  DaneZKontaZus,
  DataISO,
  FormaZatrudnieniaDrugiegoRodzica,
  IdWidoku,
  Katalog,
  KodKomunikatu,
  Okres,
  Pesel,
  Wniosek,
  WniosekOUrlop,
  WniosekZam,
} from '@/domena/typy';

// --- Okres urlopu macierzyńskiego (R1, R2) ------------------------------------------------------

/** Wymiar urlopu macierzyńskiego w tygodniach przy 1, 2, 3, 4 i 5 lub więcej dzieciach (słownik wymiarów i okresów). */
export const WYMIAR_DOMYSLNY: readonly number[] = [20, 31, 33, 35, 37];
const IDENTYFIKATORY_WPISU = ['urlop-macierzynski', 'wymiar-urlopu-macierzynskiego'];

/** Liczba dni po dniu porodu, po których matka może przekazać urlop: 14 tygodni, a w sytuacji szczególnej 8 tygodni. */
export const DNI_14_TYGODNI = 98;
export const DNI_8_TYGODNI = 56;
export const MAKS_DNI_PRZED_PORODEM = 42;

/**
 * Wymiar urlopu macierzyńskiego obowiązujący w dniu porodu ze słownika wymiarów i okresów. Wariant
 * wybieramy według kolejności wariantów wpisu (1, 2, 3, 4, 5 i więcej dzieci); bez wpisu w katalogu
 * stosujemy wymiar z seedu słownika.
 */
export function wymiarUrlopuMacierzynskiego(katalog: Katalog | null, dataPorodu: DataISO, liczbaDzieci: number): number {
  const indeks = Math.min(Math.max(Math.trunc(liczbaDzieci) || 1, 1), 5) - 1;
  const wpis = katalog?.slowniki.find((s) => IDENTYFIKATORY_WPISU.includes(s.id));
  if (wpis) {
    const wersja = wpis.wersje.find(
      (w) => porownajDaty(w.od, dataPorodu) <= 0 && (w.do === undefined || porownajDaty(dataPorodu, w.do) <= 0),
    );
    const wariant = wpis.warianty[indeks] ?? wpis.warianty[wpis.warianty.length - 1];
    const wartosc = wersja && wariant ? wersja.wartosci[wariant.klucz] : undefined;
    if (typeof wartosc === 'number' && wartosc > 0) return wartosc;
  }
  return WYMIAR_DOMYSLNY[indeks];
}

/** Okres urlopu macierzyńskiego: początek D − N (N dni przed porodem), koniec początek + 7 × W − 1. */
export function wyliczOkresUrlopuMacierzynskiego(dataPorodu: DataISO, wymiar: number, dniPrzed: number): Okres {
  const od = dodajDni(dataPorodu, -Math.max(0, dniPrzed));
  return { od, do: dodajDni(od, 7 * wymiar - 1) };
}

export interface UrlopMacierzynski {
  dataPorodu: DataISO;
  liczbaDzieci: number;
  tygodnie: number;
  dniPrzed: number;
  okres: Okres;
  /** Dzień następujący po upływie 14 tygodni od porodu (D + 98). */
  po14Tygodniach: DataISO;
  /** Dzień następujący po upływie 8 tygodni od porodu (D + 56). */
  po8Tygodniach: DataISO;
}

/** Urlop macierzyński z progami 14 i 8 tygodni liczonymi od dnia porodu, niezależnie od dni przed porodem. */
export function urlopMacierzynski(
  katalog: Katalog | null,
  dataPorodu: DataISO,
  liczbaDzieci: number,
  dniPrzed: number,
): UrlopMacierzynski {
  const tygodnie = wymiarUrlopuMacierzynskiego(katalog, dataPorodu, liczbaDzieci);
  return {
    dataPorodu,
    liczbaDzieci,
    tygodnie,
    dniPrzed,
    okres: wyliczOkresUrlopuMacierzynskiego(dataPorodu, tygodnie, dniPrzed),
    po14Tygodniach: dodajDni(dataPorodu, DNI_14_TYGODNI),
    po8Tygodniach: dodajDni(dataPorodu, DNI_8_TYGODNI),
  };
}

/** Liczba dni okresu z obiema datami włącznie. */
export function dniOkresu(o: Okres): number {
  return liczbaDniWlacznie(o);
}

// --- Dane wejściowe z rodziny --------------------------------------------------------------------

/** Ubezpieczenie chorobowe rodzica: umowa o pracę zawsze, umowa zlecenia i działalność przy dobrowolnym. */
export function czyObjetyChorobowym(forma: FormaZatrudnieniaDrugiegoRodzica | null | undefined, dobrowolne: boolean | null | undefined): boolean {
  if (forma === 'umowa-o-prace') return true;
  if (forma === 'umowa-zlecenia' || forma === 'jdg') return dobrowolne === true;
  return false;
}

/** Dni urlopu wykorzystane przez matkę przed porodem z wysłanego wniosku o część urlopu przed porodem (R6). */
export function dniPrzedPorodemZWnioskow(wnioski: readonly Wniosek[], dataPorodu: DataISO): number {
  const wniosek = wnioski.find(
    (w): w is WniosekOUrlop =>
      w.rodzaj === 'urlop-do-pracodawcy' && w.stan === 'wyslany' && (w as WniosekOUrlop).podrodzaj === 'czesc-przed-porodem',
  );
  const od = wniosek?.okresy[0]?.od;
  if (!od) return 0;
  const dni = roznicaDni(od, dataPorodu);
  return dni > 0 && dni <= MAKS_DNI_PRZED_PORODEM ? dni : 0;
}

/** Wysłana rezygnacja matki z części urlopu zapisana we Wnioskach rodziny. */
export function wyslanaRezygnacja(wnioski: readonly Wniosek[]): WniosekOUrlop | null {
  const rezygnacje = wnioski.filter(
    (w): w is WniosekOUrlop => w.rodzaj === 'rezygnacja-z-czesci-zasilku' && (w.stan === 'wyslany' || w.stan === 'zlozony'),
  );
  return rezygnacje[rezygnacje.length - 1] ?? null;
}

/** Wysłany wniosek ojca o pozostałą część urlopu macierzyńskiego zapisany we Wnioskach rodziny. */
export function wyslanyWniosekOjca(wnioski: readonly Wniosek[]): WniosekOUrlop | null {
  const wyslane = wnioski.filter(
    (w): w is WniosekOUrlop => w.rodzaj === 'wniosek-ojca-o-urlop' && (w.stan === 'wyslany' || w.stan === 'zlozony'),
  );
  return wyslane[wyslane.length - 1] ?? null;
}

/** Szkic rezygnacji albo wniosku ojca konta do wznowienia. */
export function szkicWniosku(
  wnioski: readonly Wniosek[],
  rodzaj: 'rezygnacja-z-czesci-zasilku' | 'wniosek-ojca-o-urlop',
  konto: Pesel,
): WniosekOUrlop | null {
  return (
    wnioski.find((w): w is WniosekOUrlop => w.rodzaj === rodzaj && w.konto === konto && w.stan === 'szkic') ?? null
  );
}

// --- Wariant ekranu rezygnacji (R3, R4) --------------------------------------------------------

export type WariantRezygnacji =
  | 'formularz'
  | 'brak-daty-porodu'
  | 'brak-drugiego-rodzica'
  | 'ojciec-bez-ubezpieczenia'
  | 'zam-14-tygodni'
  | 'rezygnacja-w-ezus'
  | 'rezygnacja-u-zleceniodawcy';

export interface WejscieRezygnacji {
  daneRodziny: DaneRodziny;
  daneCiazy: DaneCiazyIDziecka | null;
  wnioski: readonly Wniosek[];
  daneZusMatki: DaneZKontaZus | null;
  peselMatki: Pesel;
}

export interface WynikOtwarciaRezygnacji {
  cel: IdWidoku;
  kod?: KodKomunikatu;
  wariant: WariantRezygnacji;
  /** Wniosek ZAM matki za okres urlopu macierzyńskiego (warianty eZUS i zleceniodawcy). */
  wniosekZam?: WniosekZam;
  /** Przy wariancie 14 tygodni: czy wniosek ZAM nie istnieje w ZUS ani w przewodniku. */
  zOrzeczeniem: boolean;
}

/** Orzeczenie o niezdolności matki do samodzielnej egzystencji zapisane w profilu rodziny. */
export function maOrzeczenie(daneCiazy: DaneCiazyIDziecka | null): boolean {
  return (daneCiazy?.sytuacjeSzczegolne ?? []).some((s) => s.rodzaj === 'orzeczenie');
}

/**
 * Wariant ekranu ViewMaternityResignation. Matka na umowie o pracę: brak drugiego rodzica (0206),
 * ojciec bez ubezpieczenia chorobowego (0258), formularz. Matka na umowie zlecenia albo działalności
 * z dobrowolnym: wniosek ZAM wysłany do ZUS (0207), wniosek ZAM przygotowany dla zleceniodawcy (0261),
 * bez wniosku ZAM akcja wniosku wyłącznie o 14 tygodni.
 */
export function otworzRezygnacje(w: WejscieRezygnacji): WynikOtwarciaRezygnacji {
  const zOrzeczeniem = maOrzeczenie(w.daneCiazy);
  const wynik = (wariant: WariantRezygnacji, kod?: KodKomunikatu, wniosekZam?: WniosekZam): WynikOtwarciaRezygnacji => ({
    cel: 'ViewMaternityResignation',
    wariant,
    zOrzeczeniem,
    ...(kod ? { kod } : {}),
    ...(wniosekZam ? { wniosekZam } : {}),
  });
  if (!w.daneCiazy?.dataPorodu) return wynik('brak-daty-porodu');

  const formaMatki = w.daneRodziny.matka.formaZatrudnienia?.wartosc;
  if (formaMatki === 'umowa-zlecenia' || formaMatki === 'jdg') {
    const zamy = w.wnioski.filter((x): x is WniosekZam => x.rodzaj === 'zam' && x.konto === w.peselMatki);
    const wyslany = zamy.find((z) => z.stan === 'wyslany' || z.stan === 'zlozony');
    if (wyslany) return wynik('rezygnacja-w-ezus', '0207', wyslany);
    const dlaPlatnika = zamy.find((z) => z.stan === 'przygotowany' && z.adresat === 'platnik-skladek');
    if (dlaPlatnika) return wynik('rezygnacja-u-zleceniodawcy', '0261', dlaPlatnika);
    const wZus = (w.daneZusMatki?.wnioski ?? []).some((z) => z.rodzaj === 'zasilek-macierzynski' && z.status !== 'odmowa');
    if (wZus) return wynik('rezygnacja-w-ezus', '0207');
    return wynik('zam-14-tygodni');
  }

  const drugi = w.daneRodziny.drugiRodzic;
  const formaOjca = drugi.formaZatrudnienia?.wartosc;
  if (!formaOjca || formaOjca === 'brak-drugiego-rodzica') return wynik('brak-drugiego-rodzica', '0206');
  if (!czyObjetyChorobowym(formaOjca, drugi.dobrowolneChorobowe?.wartosc)) return wynik('ojciec-bez-ubezpieczenia', '0258');
  return wynik('formularz');
}

/** Okres wniosku ZAM matki wyłącznie o 14 tygodni: od dnia porodu do ostatniego dnia 14. tygodnia (D + 97). */
export function okresZamZa14Tygodni(dataPorodu: DataISO): Okres {
  return { od: dataPorodu, do: dodajDni(dataPorodu, DNI_14_TYGODNI - 1) };
}

// --- Data powrotu do pracy (R3, walidacja) -----------------------------------------------------

export type KodBleduPowrotu = '0201' | '0010' | '0141' | '0209' | '0042';

/** Najwcześniejsza data powrotu: po 14 tygodniach, przy orzeczeniu po 8 tygodniach. */
export function najwczesniejszyPowrot(urlop: UrlopMacierzynski, zOrzeczeniem: boolean): DataISO {
  return zOrzeczeniem ? urlop.po8Tygodniach : urlop.po14Tygodniach;
}

/** Walidacja daty powrotu do pracy: obowiązkowa, DD.MM.RRRR, zakres [najwcześniejszy powrót, koniec urlopu]. */
export function walidujDatePowrotu(
  tekst: string,
  urlop: UrlopMacierzynski,
  zOrzeczeniem: boolean,
): { data: DataISO } | { kod: KodBleduPowrotu } {
  if (tekst.trim() === '') return { kod: '0201' };
  const data = parsujDate(tekst);
  if (data === null) return { kod: '0010' };
  if (porownajDaty(data, najwczesniejszyPowrot(urlop, zOrzeczeniem)) < 0) return { kod: zOrzeczeniem ? '0209' : '0141' };
  if (porownajDaty(data, urlop.okres.do) > 0) return { kod: '0042' };
  return { data };
}

/** Ostrzeżenie 0142, gdy data powrotu przypada wcześniej niż 7 dni po dniu wypełnienia formularza. */
export function ostrzezenieTerminuRezygnacji(dataPowrotu: DataISO, dzis: DataISO): '0142' | null {
  return porownajDaty(dataPowrotu, dodajDni(dzis, 7)) < 0 ? '0142' : null;
}

// --- Załączniki rezygnacji (R13) ---------------------------------------------------------------

export type RodzajZalacznikaRezygnacji = 'kopia-wniosku-ojca' | 'oswiadczenie-ojca-o-przerwaniu-dzialalnosci' | 'kopia-orzeczenia';

export interface ZalacznikRezygnacji {
  rodzaj: RodzajZalacznikaRezygnacji;
  /** Kopia wniosku ojca dołączona z Wniosków drugiego rodzica. */
  zWnioskow?: { idWniosku: string; dataZlozenia?: DataISO };
}

/** Załączniki rezygnacji zależne od formy zatrudnienia i ubezpieczenia chorobowego ojca oraz orzeczenia matki. */
export function zalacznikiRezygnacji(
  formaOjca: FormaZatrudnieniaDrugiegoRodzica | null | undefined,
  zOrzeczeniem: boolean,
  wniosekOjca: WniosekOUrlop | null,
): ZalacznikRezygnacji[] {
  const lista: ZalacznikRezygnacji[] = [];
  if (formaOjca === 'umowa-o-prace') {
    lista.push({
      rodzaj: 'kopia-wniosku-ojca',
      ...(wniosekOjca ? { zWnioskow: { idWniosku: wniosekOjca.idWniosku, dataZlozenia: wniosekOjca.dataZlozenia } } : {}),
    });
  } else if (formaOjca === 'umowa-zlecenia' || formaOjca === 'jdg') {
    lista.push({ rodzaj: 'oswiadczenie-ojca-o-przerwaniu-dzialalnosci' });
  }
  if (zOrzeczeniem) lista.push({ rodzaj: 'kopia-orzeczenia' });
  return lista;
}

// --- Po wysłaniu (R7, R16) ---------------------------------------------------------------------

/** Termin wniosku ojca pracownika: 14 dni przed początkiem urlopu. */
export function terminWnioskuOjca(poczatek: DataISO): DataISO {
  return dodajDni(poczatek, -14);
}

/**
 * Początek szczególnej ochrony ojca pracownika: dzień złożenia, a przy złożeniu wcześniej niż 14 dni
 * przed urlopem dzień przypadający 14 dni przed jego rozpoczęciem.
 */
export function poczatekOchronyOjca(dataZlozenia: DataISO, poczatekUrlopu: DataISO): DataISO {
  const czternascieDniPrzed = terminWnioskuOjca(poczatekUrlopu);
  return porownajDaty(dataZlozenia, czternascieDniPrzed) < 0 ? czternascieDniPrzed : dataZlozenia;
}

/**
 * Komunikat ViewLeaveRequestSent po wysłaniu rezygnacji (0143) albo wniosku ojca pracownika (0135, 0199).
 * Parametry dat są w formacie DD.MM.RRRR (formatuje wywołujący przez `formatuj`).
 */
export function komunikatPoWyslaniu(
  wniosek: Pick<WniosekOUrlop, 'rodzaj' | 'okresy' | 'dataZlozenia'>,
  dzis: DataISO,
  formatuj: (d: DataISO) => string = (d) => d,
): { kod: KodKomunikatu; parametry?: Record<string, string> } | null {
  if (wniosek.rodzaj === 'rezygnacja-z-czesci-zasilku') return { kod: '0143' };
  if (wniosek.rodzaj !== 'wniosek-ojca-o-urlop') return null;
  const zlozono = wniosek.dataZlozenia ?? dzis;
  const poczatek = wniosek.okresy[0]?.od;
  if (!poczatek) return { kod: '0135', parametry: { data: formatuj(zlozono) } };
  const ochrona = poczatekOchronyOjca(zlozono, poczatek);
  if (ochrona !== zlozono) {
    return { kod: '0199', parametry: { data: formatuj(zlozono), dataPoczatkuOchrony: formatuj(ochrona) } };
  }
  return { kod: '0135', parametry: { data: formatuj(zlozono) } };
}
