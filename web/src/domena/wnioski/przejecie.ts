// Przejęcie urlopu macierzyńskiego przez ojca (kontrakt, sekcja 7.2). Właściciel: u34 (Rezygnacja matki i wniosek ojca o zasiłek).
// Reguły R5, R6, R8–R14 analizy 25-3.9.2. Funkcje są czyste: dzień dzisiejszy dostają w argumencie.
import { dodajDni, liczbaDniWlacznie, parsujDate, porownajDaty } from '@/domena/daty';
import { czyObjetyChorobowym, MAKS_DNI_PRZED_PORODEM, type UrlopMacierzynski } from '@/domena/wnioski/rezygnacja';
import type {
  DaneCiazyIDziecka,
  DaneRodziny,
  DataISO,
  FormaZatrudnieniaDrugiegoRodzica,
  IdWidoku,
  KodKomunikatu,
  Okres,
  RodzajSytuacjiSzczegolnej,
  WniosekOUrlop,
} from '@/domena/typy';

/** Przyczyna przejęcia urlopu: rezygnacja matki po 14 tygodniach albo jedna z czterech sytuacji szczególnych. */
export type PrzyczynaPrzejecia = 'rezygnacja' | 'szpital' | 'orzeczenie' | 'porzucenie' | 'smierc-matki';
export const PRZYCZYNY_PRZEJECIA: readonly PrzyczynaPrzejecia[] = ['rezygnacja', 'szpital', 'orzeczenie', 'porzucenie', 'smierc-matki'];

export function czyPrzyczynaPrzejecia(w: string | null | undefined): w is PrzyczynaPrzejecia {
  return (PRZYCZYNY_PRZEJECIA as readonly string[]).includes(w ?? '');
}

/** Sytuacja szczególna przejęcia jako rodzaj sytuacji szczególnej profilu. */
export function czySytuacjaPrzejecia(r: RodzajSytuacjiSzczegolnej): r is Exclude<PrzyczynaPrzejecia, 'rezygnacja'> {
  return r === 'szpital' || r === 'orzeczenie' || r === 'porzucenie' || r === 'smierc-matki';
}

// --- Otwarcie (R12, R14) -----------------------------------------------------------------------

export type TrybPrzejecia = 'pracownik' | 'zam';

export interface WynikOtwarciaPrzejecia {
  cel: IdWidoku;
  kod?: KodKomunikatu;
  tryb?: TrybPrzejecia;
}

/**
 * Ekran startowy przejęcia urlopu przez ojca. Ojciec bez tytułu do ubezpieczenia albo bez dobrowolnego
 * ubezpieczenia chorobowego trafia na ViewFamilyPlan z 0064, ojciec na umowie o pracę na ViewFatherTakeover
 * (wniosek do pracodawcy), a ojciec na umowie zlecenia albo działalności z dobrowolnym na kreator ZAM.
 */
export function otworzPrzejecie(daneRodziny: DaneRodziny, daneCiazy: DaneCiazyIDziecka | null): WynikOtwarciaPrzejecia {
  const drugi = daneRodziny.drugiRodzic;
  const forma = drugi.formaZatrudnienia?.wartosc;
  if (!czyObjetyChorobowym(forma, drugi.dobrowolneChorobowe?.wartosc)) return { cel: 'ViewFamilyPlan', kod: '0064' };
  if (!daneCiazy?.dataPorodu) return { cel: 'ViewFatherTakeover', tryb: forma === 'umowa-o-prace' ? 'pracownik' : 'zam' };
  if (forma === 'umowa-o-prace') return { cel: 'ViewFatherTakeover', tryb: 'pracownik' };
  return { cel: 'ViewZamLeaveType', tryb: 'zam' };
}

// --- Propozycje (R5, R6, R8) -------------------------------------------------------------------

export interface PropozycjaPrzejecia {
  przyczyna: PrzyczynaPrzejecia | null;
  dataZdarzenia?: DataISO;
  /** Data początku z rezygnacji matki zapisanej we Wnioskach. */
  dataPoczatku?: DataISO;
  zrodloPrzyczyny?: 'profil-rodziny' | 'wnioski';
}

/** Propozycja przyczyny i daty: sytuacja szczególna z profilu, a bez niej rezygnacja matki z Wniosków. */
export function proponujPrzejecie(daneCiazy: DaneCiazyIDziecka | null, rezygnacja: WniosekOUrlop | null): PropozycjaPrzejecia {
  const sytuacje = (daneCiazy?.sytuacjeSzczegolne ?? []).filter((s) => czySytuacjaPrzejecia(s.rodzaj));
  const sytuacja = sytuacje[sytuacje.length - 1];
  const dataPoczatku = rezygnacja?.rezygnacja?.dataPowrotu;
  if (sytuacja && czySytuacjaPrzejecia(sytuacja.rodzaj)) {
    return {
      przyczyna: sytuacja.rodzaj,
      dataZdarzenia: sytuacja.dataZdarzenia,
      zrodloPrzyczyny: 'profil-rodziny',
      ...(dataPoczatku ? { dataPoczatku } : {}),
    };
  }
  if (dataPoczatku) return { przyczyna: 'rezygnacja', dataPoczatku, zrodloPrzyczyny: 'wnioski' };
  return { przyczyna: null };
}

// --- Walidacja pól (R6, R10) -------------------------------------------------------------------

/** Liczba dni urlopu wykorzystanych przez matkę przed porodem: liczba całkowita 0..42, puste pole oznacza 0. */
export function walidujDniPrzedPorodem(tekst: string): { dni: number } | { kod: '0202' } {
  const t = tekst.trim();
  if (t === '') return { dni: 0 };
  if (!/^\d{1,3}$/.test(t)) return { kod: '0202' };
  const dni = Number(t);
  return dni <= MAKS_DNI_PRZED_PORODEM ? { dni } : { kod: '0202' };
}

/** Dopuszczalny zakres daty zdarzenia: od dnia porodu do dziś; orzeczenie przy matce bez ubezpieczenia także przed porodem. */
export function zakresDatyZdarzenia(
  przyczyna: Exclude<PrzyczynaPrzejecia, 'rezygnacja'>,
  dataPorodu: DataISO,
  dzis: DataISO,
  matkaUbezpieczona: boolean,
): { od?: DataISO; do: DataISO } {
  if (przyczyna === 'orzeczenie' && !matkaUbezpieczona) return { do: dzis };
  return { od: dataPorodu, do: dzis };
}

export type KodBleduDaty = '0201' | '0010' | '0042' | '0097' | '0127';

/** Walidacja daty zdarzenia sytuacji szczególnej (R10). */
export function walidujDateZdarzenia(
  tekst: string,
  zakres: { od?: DataISO; do: DataISO },
): { data: DataISO } | { kod: KodBleduDaty } {
  if (tekst.trim() === '') return { kod: '0201' };
  const data = parsujDate(tekst);
  if (data === null) return { kod: '0010' };
  if (zakres.od && porownajDaty(data, zakres.od) < 0) return { kod: '0042' };
  if (porownajDaty(data, zakres.do) > 0) return { kod: '0127' };
  return { data };
}

// --- Okres przejęcia (R5, R9, R11) -------------------------------------------------------------

export interface OkresPrzejecia extends Okres {
  /** Pobyt matki w szpitalu: okres trwa do dnia wypisu, najdłużej do `do`. */
  doWypisu: boolean;
  dni: number;
  /** 0210 z dniem następującym po upływie 8 tygodni od porodu. */
  informacja?: { kod: '0210'; data: DataISO };
}

export interface WejscieOkresuPrzejecia {
  przyczyna: PrzyczynaPrzejecia;
  /** Data początku urlopu (rezygnacja) albo data zdarzenia (sytuacja szczególna), już po walidacji formatu. */
  data: DataISO;
  urlop: UrlopMacierzynski;
  matkaUbezpieczona: boolean;
  /** Dzień powrotu matki z rezygnacji przy orzeczeniu i matce ubezpieczonej. */
  dataPowrotuMatki?: DataISO;
}

/**
 * Okres urlopu przejętego przez ojca. Rezygnacja: [data, koniec urlopu] z zakresem [D + 98, koniec] (0097, 0042).
 * Sytuacja szczególna przy matce ubezpieczonej: szpital od dnia zdarzenia do wypisu, orzeczenie od powrotu matki,
 * porzucenie i śmierć od dnia po zdarzeniu; przed upływem 8 tygodni (bez śmierci) początek D + 56 i 0210.
 * Matka bez ubezpieczenia: śmierć i porzucenie od dnia po zdarzeniu, orzeczenie od dnia po powstaniu niezdolności,
 * a przy niezdolności sprzed porodu od dnia porodu.
 */
export function wyliczOkresPrzejecia(w: WejscieOkresuPrzejecia): OkresPrzejecia | { kod: '0097' | '0042' } {
  const koniec = w.urlop.okres.do;
  const zbuduj = (od: DataISO, doWypisu: boolean, informacja?: OkresPrzejecia['informacja']): OkresPrzejecia | { kod: '0042' } => {
    if (porownajDaty(od, koniec) > 0) return { kod: '0042' };
    return { od, do: koniec, doWypisu, dni: liczbaDniWlacznie({ od, do: koniec }), ...(informacja ? { informacja } : {}) };
  };

  if (w.przyczyna === 'rezygnacja') {
    if (porownajDaty(w.data, w.urlop.po14Tygodniach) < 0) return { kod: '0097' };
    return zbuduj(w.data, false);
  }

  const p8 = w.urlop.po8Tygodniach;
  if (!w.matkaUbezpieczona) {
    if (w.przyczyna === 'orzeczenie') {
      const po = dodajDni(w.data, 1);
      return zbuduj(porownajDaty(w.data, w.urlop.dataPorodu) < 0 ? w.urlop.dataPorodu : po, false);
    }
    if (w.przyczyna === 'szpital') return zbuduj(w.data, true);
    return zbuduj(dodajDni(w.data, 1), false);
  }

  const przed8 = porownajDaty(w.data, p8) < 0 && w.przyczyna !== 'smierc-matki';
  const informacja = przed8 ? { kod: '0210' as const, data: p8 } : undefined;
  switch (w.przyczyna) {
    case 'szpital':
      return zbuduj(przed8 ? p8 : w.data, true, informacja);
    case 'orzeczenie': {
      const powrot = w.dataPowrotuMatki && porownajDaty(w.dataPowrotuMatki, p8) >= 0 ? w.dataPowrotuMatki : null;
      return zbuduj(przed8 ? p8 : (powrot ?? dodajDni(w.data, 1)), false, informacja);
    }
    case 'porzucenie':
      return zbuduj(przed8 ? p8 : dodajDni(w.data, 1), false, informacja);
    default:
      return zbuduj(dodajDni(w.data, 1), false);
  }
}

/** Ostrzeżenie 0208 dla ojca pracownika, gdy początek urlopu przypada wcześniej niż 14 dni po dniu wypełnienia formularza. */
export function ostrzezenieTerminuWnioskuOjca(
  poczatek: DataISO,
  dzis: DataISO,
  forma: FormaZatrudnieniaDrugiegoRodzica | null | undefined,
): '0208' | null {
  if (forma !== 'umowa-o-prace') return null;
  return porownajDaty(poczatek, dodajDni(dzis, 14)) < 0 ? '0208' : null;
}

// --- Załączniki (R13) --------------------------------------------------------------------------

export type RodzajZalacznikaPrzejecia =
  | 'odpis-skrocony-aktu-urodzenia'
  | 'oswiadczenie-matki-o-rezygnacji'
  | 'oswiadczenie-matki'
  | 'zaswiadczenie-szpitala'
  | 'oswiadczenie-ojca-z-data-zdarzenia'
  | 'kopia-orzeczenia'
  | 'zaswiadczenie-platnika-zasilku-matki'
  | 'zaswiadczenie-placowki-o-przyjeciu'
  | 'zaswiadczenie-placowki-o-wypisie'
  | 'orzeczenie-o-niezdolnosci-matki';

/** Załączniki wniosku ojca do pracodawcy według przyczyny przejęcia. */
export function zalacznikiWnioskuOjca(przyczyna: PrzyczynaPrzejecia): RodzajZalacznikaPrzejecia[] {
  switch (przyczyna) {
    case 'rezygnacja':
      return ['odpis-skrocony-aktu-urodzenia', 'oswiadczenie-matki-o-rezygnacji'];
    case 'szpital':
      return ['oswiadczenie-matki', 'zaswiadczenie-szpitala', 'odpis-skrocony-aktu-urodzenia'];
    case 'orzeczenie':
      return ['kopia-orzeczenia', 'odpis-skrocony-aktu-urodzenia'];
    default:
      return ['oswiadczenie-ojca-z-data-zdarzenia', 'odpis-skrocony-aktu-urodzenia'];
  }
}

/**
 * Załączniki wniosku ZAM ojca: zaświadczenie płatnika zasiłku matki przy matce ubezpieczonej, przy szpitalu
 * oświadczenie matki i zaświadczenie szpitala o pobycie matki (KA-15 3.9.2.2.1), przy orzeczeniu orzeczenie; odpis skrócony aktu urodzenia
 * wyłącznie, gdy zasiłek wypłaca płatnik składek.
 */
export function zalacznikiZamOjca(
  przyczyna: PrzyczynaPrzejecia,
  matkaUbezpieczona: boolean,
  zasilekWyplacaZus: boolean,
): RodzajZalacznikaPrzejecia[] {
  const lista: RodzajZalacznikaPrzejecia[] = [];
  if (matkaUbezpieczona) lista.push('zaswiadczenie-platnika-zasilku-matki');
  if (przyczyna === 'szpital') lista.push('oswiadczenie-matki', 'zaswiadczenie-szpitala');
  if (przyczyna === 'orzeczenie') lista.push('orzeczenie-o-niezdolnosci-matki');
  if (!zasilekWyplacaZus) lista.push('odpis-skrocony-aktu-urodzenia');
  return lista;
}

/** Dzień zakończenia urlopu przez matkę przy rezygnacji: dzień przed początkiem urlopu ojca. */
export function dzienZakonczeniaUrlopuMatki(poczatekUrlopuOjca: DataISO): DataISO {
  return dodajDni(poczatekUrlopuOjca, -1);
}
