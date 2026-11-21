// Reguły arkuszy wyniku kalkulatora i porównania scenariuszy (historyjki 3.10.4.3.2, 3.10.4.3.3, 3.10.4.3.4,
// 3.10.4.4.1, 3.10.4.5.1, 3.10.4.6.1). Właściciel: u20. Czyste funkcje bez React, magazynu i zegara.
// Wymiary urlopów są wartościami ze słownika wymiarów i okresów (ANALIZY/12 sekcja 4).
import {
  dodajDni,
  dodajLata,
  maxData,
  parsujDate,
  porownajDaty,
  roznicaDni,
} from '@/domena/daty';
import type {
  BledyPol,
  CzescUrlopuRodzicielskiego,
  DataISO,
  DaneWejscioweKalkulatora,
  FormaZatrudnienia,
  FormaZatrudnieniaDrugiegoRodzica,
  IdPozycji,
  KodKomunikatu,
  Okres,
  OkresScenariusza,
  ParametryScenariusza,
  RodzicWRodzinie,
  ScenariuszKalkulatora,
  WynikScenariusza,
} from '@/domena/typy';

export const RODZICE: readonly RodzicWRodzinie[] = ['matka', 'drugi-rodzic'];
export const NIEPRZENOSZALNE_TYGODNIE = 9;
export const MAKS_CZESCI_RODZICIELSKIEGO = 5;
export const MAKS_WYMIAR_PRACY = 50;
const WYMIAR_MACIERZYNSKIEGO: Record<number, number> = { 1: 20, 2: 31, 3: 33, 4: 35, 5: 37 };

const RODZAJE_MACIERZYNSKIEGO: readonly OkresScenariusza['rodzaj'][] = [
  'macierzynski',
  'czesc-przed-porodem',
  'uzupelniajacy',
  'na-warunkach-macierzynskiego',
  'przejety-macierzynski',
];

/** Wymiar urlopu rodzicielskiego w tygodniach: 41 albo 43, z zaświadczeniem „Za życiem” 65 albo 67. */
export function wymiarRodzicielskiego(d: DaneWejscioweKalkulatora): number {
  const wiecejDzieci = d.liczbaDzieci.wartosc > 1;
  if (d.zaZyciem.wartosc) return wiecejDzieci ? 67 : 65;
  return wiecejDzieci ? 43 : 41;
}

/** Dzień porodu, przewidywany termin porodu albo dzień przyjęcia dziecka. */
export function dataZdarzenia(d: DaneWejscioweKalkulatora): DataISO | null {
  if (d.zdarzenie.wartosc === 'przyjecie') return d.przyjecie?.wartosc.dataPrzyjecia ?? null;
  if (d.zdarzenie.wartosc === 'przewidywany-porod') return d.przewidywanyTerminPorodu?.wartosc ?? null;
  return d.dataPorodu?.wartosc ?? null;
}

/** Dzień urodzenia dziecka, od którego liczymy 12 miesięcy urlopu ojcowskiego i 6. rok życia. */
export function dataUrodzeniaDziecka(d: DaneWejscioweKalkulatora): DataISO | null {
  if (d.zdarzenie.wartosc === 'przyjecie') return d.przyjecie?.wartosc.dataUrodzeniaDziecka ?? null;
  return dataZdarzenia(d);
}

/** Ostatni dzień urlopu macierzyńskiego (z uzupełniającym i przejętą częścią) z wyniku albo z wymiaru słownika. */
export function koniecMacierzynskiego(
  d: DaneWejscioweKalkulatora,
  p: ParametryScenariusza,
  wynik: WynikScenariusza,
): DataISO | null {
  const konce = wynik.okresy.filter((o) => RODZAJE_MACIERZYNSKIEGO.includes(o.rodzaj)).map((o) => o.do);
  if (konce.length > 0) return maxData(...konce);
  const zdarzenie = dataZdarzenia(d);
  if (zdarzenie === null) return null;
  const tygodnie = WYMIAR_MACIERZYNSKIEGO[d.liczbaDzieci.wartosc] ?? 20;
  const przedPorodem = d.zdarzenie.wartosc === 'przyjecie' ? 0 : p.tygodniePrzedPorodem;
  return dodajDni(zdarzenie, 7 * (tygodnie - przedPorodem) - 1);
}

/** 31 grudnia roku, w którym dziecko kończy 6 lat. */
export function ostatniDzienRodzicielskiego(d: DaneWejscioweKalkulatora): DataISO | null {
  const urodzenie = dataUrodzeniaDziecka(d);
  if (urodzenie === null) return null;
  return `${Number(urodzenie.slice(0, 4)) + 6}-12-31`;
}

/** Dzień przed ukończeniem przez dziecko 12 miesięcy (przy przyjęciu 12 miesięcy od przyjęcia). */
export function ostatniDzienOjcowskiego(d: DaneWejscioweKalkulatora): DataISO | null {
  const poczatek = d.zdarzenie.wartosc === 'przyjecie' ? dataZdarzenia(d) : dataUrodzeniaDziecka(d);
  if (poczatek === null) return null;
  return dodajDni(dodajLata(poczatek, 1), -1);
}

export function koniecCzesci(od: DataISO, tygodnie: number): DataISO {
  return dodajDni(od, 7 * tygodnie - 1);
}

export function dniOjcowskiego(wymiar: ParametryScenariusza['ojcowski']['wymiar'], liczbaCzesci: number): number[] {
  if (wymiar === 'brak') return [];
  if (wymiar === '7-dni') return [7];
  return liczbaCzesci === 2 ? [7, 7] : [14];
}

export function tygodnieRodzica(czesci: CzescUrlopuRodzicielskiego[], rodzic: RodzicWRodzinie): number {
  return czesci.filter((c) => c.rodzic === rodzic).reduce((suma, c) => suma + c.tygodnie, 0);
}

export interface PodsumowanieTygodni {
  matka: number;
  drugi: number;
  limitRodzica: number;
  przepadajace: number;
  razem: number;
  wymiar: number;
}

/** Tygodnie każdego rodzica, przepadające z 9 nieprzenoszalnych i razem (R11). */
export function podsumujTygodnie(
  czesci: CzescUrlopuRodzicielskiego[],
  wymiar: number,
  prawo: Record<RodzicWRodzinie, boolean>,
): PodsumowanieTygodni {
  const matka = prawo.matka ? tygodnieRodzica(czesci, 'matka') : 0;
  const drugi = prawo['drugi-rodzic'] ? tygodnieRodzica(czesci, 'drugi-rodzic') : 0;
  const przepadajace =
    Math.max(0, NIEPRZENOSZALNE_TYGODNIE - matka) + Math.max(0, NIEPRZENOSZALNE_TYGODNIE - drugi);
  return {
    matka,
    drugi,
    limitRodzica: wymiar - NIEPRZENOSZALNE_TYGODNIE,
    przepadajace: Math.min(przepadajace, 2 * NIEPRZENOSZALNE_TYGODNIE),
    razem: matka + drugi,
    wymiar,
  };
}

// --- Liczby całkowite z pól tekstowych --------------------------------------------------------

/** Liczba całkowita z pola; null przy pustym polu, ułamku albo innych znakach. */
export function liczbaCalkowita(tekst: string): number | null {
  const t = tekst.trim();
  if (!/^\d{1,4}$/.test(t)) return null;
  return Number(t);
}

// --- Podział urlopów (SheetCalcParentalParts) ---------------------------------------------------

export type SytuacjaPrzejecia =
  | 'rezygnacja'
  | 'orzeczenie'
  | 'szpital'
  | 'porzucenie'
  | 'zgon-matki'
  | 'zatrudnienie-matki';

export const SYTUACJE_PRZY_UBEZPIECZONEJ: readonly SytuacjaPrzejecia[] = [
  'rezygnacja',
  'orzeczenie',
  'szpital',
  'porzucenie',
  'zgon-matki',
];
export const SYTUACJE_PRZY_NIEUBEZPIECZONEJ: readonly SytuacjaPrzejecia[] = [
  'zgon-matki',
  'porzucenie',
  'orzeczenie',
  'zatrudnienie-matki',
];

export interface FormularzCzesci {
  rodzic: RodzicWRodzinie | '';
  od: string;
  tygodnie: string;
}

export interface FormularzPodzialu {
  czesci: FormularzCzesci[];
  wymiarOjcowskiego: ParametryScenariusza['ojcowski']['wymiar'];
  liczbaCzesciOjcowskiego: 1 | 2;
  datyOjcowskiego: [string, string];
  dataUbezpieczenia: string;
  formaPoPorodzie: FormaZatrudnienia | '';
  przejecie: boolean;
  sytuacja: SytuacjaPrzejecia | '';
  dataPrzejecia: string;
  koniecPobytu: string;
}

export interface KontekstPodzialu {
  dataPorodu: DataISO;
  koniecMacierzynskiego: DataISO;
  ostatniDzienRodzicielskiego: DataISO;
  ostatniDzienOjcowskiego: DataISO;
  wymiar: number;
  prawoMatki: boolean;
  /** Prawo drugiego rodzica w dniu porodu. */
  prawoDrugiego: boolean;
  /** Drugi rodzic w rodzinie (forma inna niż „rodzina bez drugiego rodzica”). */
  jestDrugiRodzic: boolean;
}

/** Ostatni dzień, w którym drugi rodzic może podjąć ubezpieczenie: rok od porodu minus 7 dni (R13). */
export function ostatniDzienPodjeciaUbezpieczenia(dataPorodu: DataISO): DataISO {
  return dodajDni(dodajLata(dataPorodu, 1), -7);
}

/** Najwcześniejszy dzień przejęcia urlopu macierzyńskiego w sytuacji (R12). */
export function najwczesniejszePrzejecie(
  sytuacja: SytuacjaPrzejecia,
  dataPorodu: DataISO,
  matkaUbezpieczona: boolean,
): { data: DataISO; kod: KodKomunikatu } {
  if (matkaUbezpieczona && sytuacja === 'rezygnacja') return { data: dodajDni(dataPorodu, 98), kod: '0097' };
  if (matkaUbezpieczona && (sytuacja === 'orzeczenie' || sytuacja === 'szpital' || sytuacja === 'porzucenie')) {
    return { data: dodajDni(dataPorodu, 56), kod: '0169' };
  }
  return { data: dodajDni(dataPorodu, 1), kod: '0042' };
}

/** Ojcowski: pierwszy dopuszczalny dzień części (dzień porodu albo podjęcia ubezpieczenia). */
export function poczatekOjcowskiego(k: KontekstPodzialu, f: FormularzPodzialu): DataISO | null {
  if (k.prawoDrugiego) return k.dataPorodu;
  return parsujDate(f.dataUbezpieczenia);
}

/** Czy drugi rodzic ma w scenariuszu prawo do zasiłku (w dniu porodu albo od podjęcia ubezpieczenia). */
export function drugiMaPrawo(k: KontekstPodzialu, f: FormularzPodzialu): boolean {
  if (!k.jestDrugiRodzic) return false;
  return k.prawoDrugiego || parsujDate(f.dataUbezpieczenia) !== null;
}

export type BledyPodzialu = BledyPol<string>;

/** Błędy pól arkusza podziału urlopów. Klucze: `czesc-<i>-rodzic|od|tygodnie`, `ojcowski-<i>`, pozostałe pola. */
export function walidujPodzial(f: FormularzPodzialu, k: KontekstPodzialu): BledyPodzialu {
  const bledy: BledyPodzialu = {};
  const prawoDrugiego = drugiMaPrawo(k, f);
  const dataUbezpieczenia = parsujDate(f.dataUbezpieczenia);

  // Ubezpieczenie drugiego rodzica po porodzie.
  if (k.jestDrugiRodzic && !k.prawoDrugiego) {
    if (f.dataUbezpieczenia.trim() !== '') {
      if (dataUbezpieczenia === null) bledy.dataUbezpieczenia = '0010';
      else if (
        porownajDaty(dataUbezpieczenia, k.dataPorodu) <= 0 ||
        porownajDaty(dataUbezpieczenia, ostatniDzienPodjeciaUbezpieczenia(k.dataPorodu)) > 0
      ) {
        bledy.dataUbezpieczenia = '0247';
      }
      if (f.formaPoPorodzie === '') bledy.formaPoPorodzie = '0006';
    }
  }

  // Części urlopu rodzicielskiego.
  const najwczesniej = k.prawoMatki ? dodajDni(k.koniecMacierzynskiego, 1) : k.dataPorodu;
  const tygodnie: Record<RodzicWRodzinie, number> = { matka: 0, 'drugi-rodzic': 0 };
  f.czesci.forEach((c, i) => {
    if (c.rodzic === '') bledy[`czesc-${i}-rodzic`] = '0006';
    const od = parsujDate(c.od);
    const liczba = liczbaCalkowita(c.tygodnie);
    if (c.od.trim() === '') bledy[`czesc-${i}-od`] = '0175';
    else if (od === null) bledy[`czesc-${i}-od`] = '0010';
    if (liczba === null || liczba <= 0) bledy[`czesc-${i}-tygodnie`] = '0061';
    if (c.rodzic !== '' && liczba !== null && liczba > 0) {
      tygodnie[c.rodzic] += liczba;
      if (tygodnie[c.rodzic] > k.wymiar - NIEPRZENOSZALNE_TYGODNIE) bledy[`czesc-${i}-tygodnie`] = '0061';
    }
    if (od !== null && bledy[`czesc-${i}-od`] === undefined) {
      const minimum =
        c.rodzic === 'drugi-rodzic' && !k.prawoDrugiego && dataUbezpieczenia !== null
          ? dataUbezpieczenia
          : c.rodzic === 'drugi-rodzic' && !k.prawoMatki
            ? k.dataPorodu
            : najwczesniej;
      const koniec = liczba !== null && liczba > 0 ? koniecCzesci(od, liczba) : od;
      if (porownajDaty(od, minimum) < 0 || porownajDaty(koniec, k.ostatniDzienRodzicielskiego) > 0) {
        bledy[`czesc-${i}-od`] = '0042';
      }
    }
    if (c.rodzic === 'drugi-rodzic' && !prawoDrugiego) bledy[`czesc-${i}-rodzic`] = '0064';
    if (c.rodzic === 'matka' && !k.prawoMatki) bledy[`czesc-${i}-rodzic`] = '0064';
  });
  if (f.czesci.length > MAKS_CZESCI_RODZICIELSKIEGO) bledy.czesci = '0096';
  if (tygodnie.matka + tygodnie['drugi-rodzic'] > k.wymiar) {
    const ostatniaDrugiego = f.czesci.map((c, i) => ({ c, i })).filter(({ c }) => c.rodzic === 'drugi-rodzic').pop();
    const indeks = ostatniaDrugiego?.i ?? f.czesci.length - 1;
    if (indeks >= 0) bledy[`czesc-${indeks}-tygodnie`] = '0095';
  }

  // Urlop ojcowski.
  const start = poczatekOjcowskiego(k, f);
  if (prawoDrugiego && f.wymiarOjcowskiego !== 'brak') {
    const dni = dniOjcowskiego(f.wymiarOjcowskiego, f.liczbaCzesciOjcowskiego);
    dni.forEach((liczbaDni, i) => {
      const tekst = f.datyOjcowskiego[i] ?? '';
      const od = parsujDate(tekst);
      if (tekst.trim() === '') bledy[`ojcowski-${i}`] = '0175';
      else if (od === null) bledy[`ojcowski-${i}`] = '0010';
      else if (
        (start !== null && porownajDaty(od, start) < 0) ||
        porownajDaty(dodajDni(od, liczbaDni - 1), k.ostatniDzienOjcowskiego) > 0
      ) {
        bledy[`ojcowski-${i}`] = '0042';
      }
    });
  }

  // Przejęcie części urlopu macierzyńskiego.
  if (f.przejecie && prawoDrugiego) {
    if (f.sytuacja === '') bledy.sytuacja = '0006';
    const data = parsujDate(f.dataPrzejecia);
    if (f.dataPrzejecia.trim() === '') bledy.dataPrzejecia = '0175';
    else if (data === null) bledy.dataPrzejecia = '0010';
    else if (f.sytuacja !== '') {
      const minimum = najwczesniejszePrzejecie(f.sytuacja, k.dataPorodu, k.prawoMatki);
      if (porownajDaty(data, k.koniecMacierzynskiego) > 0) bledy.dataPrzejecia = '0042';
      else if (porownajDaty(data, minimum.data) < 0) bledy.dataPrzejecia = minimum.kod;
    }
    if (f.sytuacja === 'szpital') {
      const koniec = parsujDate(f.koniecPobytu);
      if (f.koniecPobytu.trim() === '') bledy.koniecPobytu = '0176';
      else if (koniec === null) bledy.koniecPobytu = '0010';
      else if (data !== null && porownajDaty(koniec, data) < 0) bledy.koniecPobytu = '0110';
      else if (porownajDaty(koniec, k.koniecMacierzynskiego) > 0) bledy.koniecPobytu = '0042';
    }
  }
  return bledy;
}

/** Parametry scenariusza po zapisie poprawnego formularza podziału. */
export function parametryZPodzialu(
  p: ParametryScenariusza,
  f: FormularzPodzialu,
  k: KontekstPodzialu,
): ParametryScenariusza {
  const prawoDrugiego = drugiMaPrawo(k, f);
  const czesci: CzescUrlopuRodzicielskiego[] = f.czesci
    .filter((c) => c.rodzic !== '' && (c.rodzic === 'matka' || prawoDrugiego))
    .map((c) => ({ rodzic: c.rodzic as RodzicWRodzinie, od: parsujDate(c.od) ?? c.od, tygodnie: Number(c.tygodnie.trim()) }));
  const dni = prawoDrugiego ? dniOjcowskiego(f.wymiarOjcowskiego, f.liczbaCzesciOjcowskiego) : [];
  const dataUbezpieczenia = parsujDate(f.dataUbezpieczenia);
  const nowe: ParametryScenariusza = {
    ...p,
    czesciRodzicielskiego: czesci,
    ojcowski: {
      wymiar: prawoDrugiego ? f.wymiarOjcowskiego : 'brak',
      czesci: dni.map((_, i) => parsujDate(f.datyOjcowskiego[i] ?? '') ?? ''),
    },
  };
  delete nowe.drugiRodzicPoPorodzie;
  delete nowe.przejecie;
  if (!k.prawoDrugiego && dataUbezpieczenia !== null && f.formaPoPorodzie !== '') {
    nowe.drugiRodzicPoPorodzie = { dataUbezpieczenia, forma: f.formaPoPorodzie };
  }
  if (f.przejecie && prawoDrugiego && f.sytuacja !== '') {
    const data = parsujDate(f.dataPrzejecia) ?? f.dataPrzejecia;
    const koniecPobytu = f.sytuacja === 'szpital' ? (parsujDate(f.koniecPobytu) ?? undefined) : undefined;
    nowe.przejecie = koniecPobytu ? { sytuacja: f.sytuacja, data, koniecPobytuMatki: koniecPobytu } : { sytuacja: f.sytuacja, data };
  }
  if (nowe.laczenie && nowe.laczenie.indeksCzesci >= czesci.length) delete nowe.laczenie;
  return nowe;
}

/** Okres przejętej części urlopu macierzyńskiego: od daty przejęcia do końca macierzyńskiego albo do końca pobytu. */
export function okresPrzejecia(f: FormularzPodzialu, k: KontekstPodzialu): Okres | null {
  const od = parsujDate(f.dataPrzejecia);
  if (od === null || porownajDaty(od, k.koniecMacierzynskiego) > 0) return null;
  const koniecPobytu = f.sytuacja === 'szpital' ? parsujDate(f.koniecPobytu) : null;
  return { od, do: koniecPobytu ?? k.koniecMacierzynskiego };
}

// --- Łączenie urlopu rodzicielskiego z pracą (SheetCalcWorkCombination) -------------------------

/** Wydłużenie urlopu w dniach: tygodnie łączenia × 7 × wymiar pracy, bez niepełnego dnia (R14). */
export function dniWydluzenia(tygodnie: number, wymiarPracy: number): number {
  return Math.floor((tygodnie * 7 * wymiarPracy) / 100);
}

export interface FormularzLaczenia {
  indeksCzesci: string;
  tygodnie: string;
  wymiarPracy: string;
}

export function walidujLaczenie(f: FormularzLaczenia, czesci: CzescUrlopuRodzicielskiego[]): BledyPol<keyof FormularzLaczenia> {
  const bledy: BledyPol<keyof FormularzLaczenia> = {};
  const czesc = f.indeksCzesci === '' ? undefined : czesci[Number(f.indeksCzesci)];
  if (czesc === undefined) bledy.indeksCzesci = '0006';
  const tygodnie = liczbaCalkowita(f.tygodnie);
  if (tygodnie === null || tygodnie < 1 || (czesc !== undefined && tygodnie > czesc.tygodnie)) bledy.tygodnie = '0061';
  const wymiar = liczbaCalkowita(f.wymiarPracy);
  if (wymiar === null || wymiar < 1 || wymiar > MAKS_WYMIAR_PRACY) bledy.wymiarPracy = '0098';
  return bledy;
}

export interface WynikLaczenia {
  dniWydluzenia: number;
  okresLaczenia: Okres;
  okresWydluzenia: Okres | null;
  nowyKoniecCzesci: DataISO;
  /** Części rozpoczynające się po końcu łączonej części, przesunięte o dni wydłużenia. */
  przesunieteCzesci: { czesc: CzescUrlopuRodzicielskiego; okres: Okres }[];
}

export function wyliczLaczenie(
  czesci: CzescUrlopuRodzicielskiego[],
  indeks: number,
  tygodnie: number,
  wymiarPracy: number,
): WynikLaczenia | null {
  const czesc = czesci[indeks];
  if (czesc === undefined) return null;
  const koniec = koniecCzesci(czesc.od, czesc.tygodnie);
  const dni = dniWydluzenia(tygodnie, wymiarPracy);
  const przesunieteCzesci = czesci
    .filter((c, i) => i !== indeks && porownajDaty(c.od, koniec) > 0)
    .map((c) => {
      const od = dodajDni(c.od, dni);
      return { czesc: c, okres: { od, do: koniecCzesci(od, c.tygodnie) } };
    });
  return {
    dniWydluzenia: dni,
    okresLaczenia: { od: czesc.od, do: dodajDni(czesc.od, 7 * tygodnie - 1) },
    okresWydluzenia: dni > 0 ? { od: dodajDni(koniec, 1), do: dodajDni(koniec, dni) } : null,
    nowyKoniecCzesci: dodajDni(koniec, dni),
    przesunieteCzesci,
  };
}

// --- Powrót do pracy (SheetCalcReturnToWork) ----------------------------------------------------

export interface ZakresPowrotu {
  najwczesniej: DataISO;
  najpozniej: DataISO;
  /** Tygodnie urlopu rodzicielskiego, które rodzic może wykorzystać. */
  dostepneTygodnie: number;
}

/** Ostatni dzień urlopu z zasiłkiem rodzica poza urlopem rodzicielskim (macierzyński, ojcowski). */
function ostatniDzienPozaRodzicielskim(wynik: WynikScenariusza, rodzic: RodzicWRodzinie): DataISO | null {
  const konce = wynik.okresy
    .filter((o) => o.rodzic === rodzic && o.rodzaj !== 'rodzicielski' && o.rodzaj !== 'laczenie-z-praca' && o.rodzaj !== 'wydluzenie-rodzicielskiego')
    .map((o) => o.do);
  return konce.length > 0 ? maxData(...konce) : null;
}

export function zakresPowrotu(
  czesci: CzescUrlopuRodzicielskiego[],
  rodzic: RodzicWRodzinie,
  wymiar: number,
  wynik: WynikScenariusza,
  koniecMacierzynskiegoMatki: DataISO | null,
): ZakresPowrotu | null {
  const wlasne = czesci.filter((c) => c.rodzic === rodzic).sort((a, b) => porownajDaty(a.od, b.od));
  const innego = tygodnieRodzica(czesci, rodzic === 'matka' ? 'drugi-rodzic' : 'matka');
  const dostepneTygodnie = Math.max(0, Math.min(wymiar - NIEPRZENOSZALNE_TYGODNIE, wymiar - innego));
  if (wlasne.length === 0) {
    const ostatni = ostatniDzienPozaRodzicielskim(wynik, rodzic) ?? (rodzic === 'matka' ? koniecMacierzynskiegoMatki : null);
    if (ostatni === null) return null;
    const poczatek = dodajDni(ostatni, 1);
    return { najwczesniej: poczatek, najpozniej: dodajDni(poczatek, 7 * dostepneTygodnie), dostepneTygodnie };
  }
  const pierwsza = wlasne[0];
  const ostatnia = wlasne[wlasne.length - 1];
  const wczesniejsze = wlasne.slice(0, -1).reduce((s, c) => s + c.tygodnie, 0);
  const zostaje = Math.max(0, dostepneTygodnie - wczesniejsze);
  return { najwczesniej: pierwsza.od, najpozniej: dodajDni(ostatnia.od, 7 * zostaje), dostepneTygodnie };
}

export interface WynikZmianyPowrotu {
  czesci: CzescUrlopuRodzicielskiego[];
  dataPowrotu: DataISO;
  dopasowano: boolean;
  tygodnieRodzica: number;
  niewykorzystane: number;
}

/**
 * Części urlopu rodzicielskiego rodzica po zmianie daty powrotu (R15): wcześniejsza data skraca ostatnie części
 * i usuwa części zaczynające się od nowej daty, późniejsza wydłuża ostatnią część, brak części dodaje część
 * od dnia po ostatnim dniu urlopu. Części kończą się w ostatnim dniu ostatniego pełnego tygodnia przed nową datą.
 */
export function zmienPowrot(
  czesci: CzescUrlopuRodzicielskiego[],
  rodzic: RodzicWRodzinie,
  nowaData: DataISO,
  zakres: ZakresPowrotu,
): WynikZmianyPowrotu {
  const pozostale = czesci.filter((c) => c.rodzic !== rodzic);
  const wlasne = czesci
    .filter((c) => c.rodzic === rodzic && porownajDaty(c.od, nowaData) < 0)
    .sort((a, b) => porownajDaty(a.od, b.od));
  let dopasowano = false;
  let nowe: CzescUrlopuRodzicielskiego[];
  if (wlasne.length === 0) {
    const dni = roznicaDni(zakres.najwczesniej, nowaData);
    const tygodnie = Math.floor(dni / 7);
    dopasowano = dni % 7 !== 0;
    nowe = tygodnie > 0 ? [{ rodzic, od: zakres.najwczesniej, tygodnie }] : [];
  } else {
    const ostatnia = wlasne[wlasne.length - 1];
    const dni = roznicaDni(ostatnia.od, nowaData);
    const tygodnie = Math.floor(dni / 7);
    dopasowano = dni % 7 !== 0;
    nowe = [...wlasne.slice(0, -1), ...(tygodnie > 0 ? [{ ...ostatnia, tygodnie }] : [])];
  }
  const ostatniaNowa = nowe[nowe.length - 1];
  const dataPowrotu = ostatniaNowa ? dodajDni(koniecCzesci(ostatniaNowa.od, ostatniaNowa.tygodnie), 1) : zakres.najwczesniej;
  const uzyte = nowe.reduce((s, c) => s + c.tygodnie, 0);
  const wynikCzesci = [...pozostale, ...nowe].sort((a, b) => porownajDaty(a.od, b.od));
  return {
    czesci: wynikCzesci,
    dataPowrotu,
    dopasowano,
    tygodnieRodzica: uzyte,
    niewykorzystane: Math.max(0, zakres.dostepneTygodnie - uzyte),
  };
}

export function walidujDatePowrotu(tekst: string, zakres: ZakresPowrotu): { data: DataISO } | { kod: KodKomunikatu; parametr?: DataISO } {
  const data = parsujDate(tekst);
  if (data === null) return { kod: '0010' };
  if (porownajDaty(data, zakres.najwczesniej) < 0) return { kod: '0243', parametr: zakres.najwczesniej };
  if (porownajDaty(data, zakres.najpozniej) > 0) return { kod: '0244', parametr: zakres.najpozniej };
  return { data };
}

// --- Powrót do pracy na wyniku: okresy pracy i uprawnienia ------------------------------------

/** Okresy pracy między urlopami z zasiłkiem rodzica (luki między kolejnymi okresami wyniku). */
export function okresyPracyMiedzyUrlopami(wynik: WynikScenariusza, rodzic: RodzicWRodzinie): Okres[] {
  const okresy = wynik.okresy.filter((o) => o.rodzic === rodzic).sort((a, b) => porownajDaty(a.od, b.od));
  const luki: Okres[] = [];
  let koniec: DataISO | null = null;
  for (const o of okresy) {
    if (koniec !== null && roznicaDni(koniec, o.od) > 1) luki.push({ od: dodajDni(koniec, 1), do: dodajDni(o.od, -1) });
    if (koniec === null || porownajDaty(o.do, koniec) > 0) koniec = o.do;
  }
  return luki;
}

/** Okresy łączenia urlopu z pracą rodzica. */
export function okresyLaczenia(wynik: WynikScenariusza, rodzic: RodzicWRodzinie): OkresScenariusza[] {
  return wynik.okresy.filter((o) => o.rodzic === rodzic && o.rodzaj === 'laczenie-z-praca');
}

/** Uprawnienia po powrocie do pracy (R16): K20 matka na umowie o pracę, K21 i K23 umowa o pracę, K22 umowa o pracę albo dobrowolne. */
export function uprawnieniaPoPowrocie(
  rodzic: RodzicWRodzinie,
  forma: FormaZatrudnienia | FormaZatrudnieniaDrugiegoRodzica,
  dobrowolne: boolean,
): IdPozycji[] {
  if (forma === 'umowa-o-prace') return rodzic === 'matka' ? ['K20', 'K21', 'K22', 'K23'] : ['K21', 'K22', 'K23'];
  if ((forma === 'umowa-zlecenia' || forma === 'jdg') && dobrowolne) return ['K22'];
  return [];
}

// --- Scenariusze ------------------------------------------------------------------------------

export interface OkresDoPorownania {
  rodzic: RodzicWRodzinie;
  rodzaj: 'macierzynski' | 'rodzicielski' | 'ojcowski';
}

export const WIERSZE_OKRESOW: readonly OkresDoPorownania[] = [
  { rodzic: 'matka', rodzaj: 'macierzynski' },
  { rodzic: 'matka', rodzaj: 'rodzicielski' },
  { rodzic: 'drugi-rodzic', rodzaj: 'macierzynski' },
  { rodzic: 'drugi-rodzic', rodzaj: 'ojcowski' },
  { rodzic: 'drugi-rodzic', rodzaj: 'rodzicielski' },
];

const RODZAJE_GRUPY: Record<OkresDoPorownania['rodzaj'], readonly OkresScenariusza['rodzaj'][]> = {
  macierzynski: RODZAJE_MACIERZYNSKIEGO,
  rodzicielski: ['rodzicielski', 'laczenie-z-praca', 'wydluzenie-rodzicielskiego'],
  ojcowski: ['ojcowski'],
};

/** Początek i koniec urlopu rodzaju (pierwszy dzień pierwszego i ostatni dzień ostatniego okresu). */
export function zakresUrlopu(wynik: WynikScenariusza, w: OkresDoPorownania): Okres | null {
  const okresy = wynik.okresy.filter((o) => o.rodzic === w.rodzic && RODZAJE_GRUPY[w.rodzaj].includes(o.rodzaj));
  if (okresy.length === 0) return null;
  const od = okresy.map((o) => o.od).sort()[0];
  return { od, do: maxData(...okresy.map((o) => o.do)) };
}

export function walidujWyborScenariuszy(numery: number[]): KodKomunikatu | null {
  return numery.length < 2 || numery.length > 3 ? '0170' : null;
}

export function sortujScenariusze(scenariusze: ScenariuszKalkulatora[]): ScenariuszKalkulatora[] {
  return [...scenariusze].sort((a, b) => a.numer - b.numer);
}
