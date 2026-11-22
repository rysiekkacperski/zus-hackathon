// Wymiary urlopów i okresy zasiłku po stracie dziecka, po przyjęciu dziecka i przy łączeniu z pracą (kontrakt, sekcja 7.2).
// Właściciel: u09 (Silnik kalkulatora zasiłku macierzyńskiego).
// Konwencje: tydzień = 7 dni; okres N dni od S kończy się S + N − 1; „7. dzień po dniu zgonu” = zgon + 7;
// „ukończenie N lat” = data urodzenia + N lat, a ostatni dzień urlopu to dzień poprzedni.
import { dodajDni, maxData, porownajDaty } from '@/domena/daty';
import { wartoscObowiazujaca } from '@/domena/katalog/odczyt';
import { parametr, type KluczParametru, type RejestrRegul } from '@/domena/kalkulatory/slowniki';
import { dzieciWliczone, okresWum, type DanePrzyjecia } from '@/domena/wnioski/zam-przyjecie';
import type { DataISO, FormaPrzyjecia, Katalog, LiczbaDzieci, Okres } from '@/domena/typy';

export type RodzajStraty = 'martwe-urodzenie' | 'zgon-dziecka' | 'poronienie';

type Odczyt = (klucz: KluczParametru) => number;

function odczyt(katalog: Katalog, dzien: DataISO, rejestr?: RejestrRegul): Odczyt {
  return rejestr !== undefined ? (k) => rejestr.wez(k) : (k) => parametr(katalog, k, dzien).wartosc;
}

const KLUCZE_MACIERZYNSKIEGO: Record<LiczbaDzieci, KluczParametru> = {
  1: 'urlopMacierzynski1',
  2: 'urlopMacierzynski2',
  3: 'urlopMacierzynski3',
  4: 'urlopMacierzynski4',
  5: 'urlopMacierzynski5',
};

const KLUCZE_NA_WARUNKACH: Record<LiczbaDzieci, KluczParametru> = {
  1: 'naWarunkach1',
  2: 'naWarunkach2',
  3: 'naWarunkach3',
  4: 'naWarunkach4',
  5: 'naWarunkach5',
};

/** Liczba dzieci 1–5 (5 = pięcioro i więcej). */
export function liczbaDzieciWZakresie(n: number): LiczbaDzieci {
  return Math.min(5, Math.max(1, Math.trunc(n))) as LiczbaDzieci;
}

/** Wymiar urlopu macierzyńskiego w tygodniach: 20, 31, 33, 35, 37 dla 1, 2, 3, 4, 5 i więcej dzieci. */
export function wymiarMacierzynskiego(liczba: number, katalog: Katalog, dzien: DataISO, rejestr?: RejestrRegul): number {
  return odczyt(katalog, dzien, rejestr)(KLUCZE_MACIERZYNSKIEGO[liczbaDzieciWZakresie(liczba)]);
}

/** Wymiar urlopu na warunkach urlopu macierzyńskiego w tygodniach według liczby dzieci przyjętych jednocześnie. */
export function wymiarNaWarunkach(liczba: number, katalog: Katalog, dzien: DataISO, rejestr?: RejestrRegul): number {
  return odczyt(katalog, dzien, rejestr)(KLUCZE_NA_WARUNKACH[liczbaDzieciWZakresie(liczba)]);
}

/**
 * Łączny wymiar urlopu rodzicielskiego obojga rodziców w tygodniach: 41 (1 dziecko), 43 (więcej niż 1),
 * z zaświadczeniem „Za życiem” 65 i 67; po przekroczeniu wieku granicznego przy przyjęciu 38, z „Za życiem” 62.
 */
export function wymiarRodzicielskiego(
  liczba: number,
  zaZyciem: boolean,
  katalog: Katalog,
  dzien: DataISO,
  rejestr?: RejestrRegul,
  poWiekuGranicznym = false,
): number {
  const o = odczyt(katalog, dzien, rejestr);
  if (poWiekuGranicznym) return o(zaZyciem ? 'rodzicielskiPoWiekuZaZyciem' : 'rodzicielskiPoWieku');
  if (liczba > 1) return o(zaZyciem ? 'rodzicielskiZaZyciemWiecej' : 'rodzicielskiWiecej');
  return o(zaZyciem ? 'rodzicielskiZaZyciem1' : 'rodzicielski1');
}

/** Najdłuższy łączny urlop rodzicielski z wydłużeniem przy łączeniu z pracą: 82, 86, z „Za życiem” 130, 134 tygodnie. */
export function limitRodzicielskiegoZLaczeniem(liczba: number, zaZyciem: boolean, katalog: Katalog, dzien: DataISO): number {
  const o = odczyt(katalog, dzien);
  if (liczba > 1) return o(zaZyciem ? 'laczenieZaZyciemWiecej' : 'laczenieWiecej');
  return o(zaZyciem ? 'laczenieZaZyciem1' : 'laczenie1');
}

/** Wiek graniczny dziecka przy przyjęciu: 7 lat rodzina zastępcza niezawodowa, 10 lat z odroczeniem, 14 lat przysposobienie. */
export function wiekGranicznyPrzyjecia(
  forma: FormaPrzyjecia,
  odroczenie: boolean,
  katalog: Katalog,
  dzien: DataISO,
  rejestr?: RejestrRegul,
): number | null {
  const o = odczyt(katalog, dzien, rejestr);
  if (forma === 'przysposobienie') return o('wiekPrzysposobienie');
  if (forma === 'rodzina-zastepcza-niezawodowa') return o(odroczenie ? 'wiekOdroczenie' : 'wiekRodzinaZastepcza');
  return null;
}

export interface UzupelniajacyUrlop {
  kategoria: 'do-27-tygodnia-albo-1000-g' | 'od-28-do-36-tygodnia' | 'od-37-tygodnia';
  /** Najwięcej dni pobytu dziecka w szpitalu branych pod uwagę: 105, 56 albo 52. */
  maksDniPobytu: number;
  tygodnie: number;
  /** Od 37. tygodnia: pobyt nie spełnia warunku co najmniej 2 kolejnych dni z początkiem między 5. a 28. dniem życia. */
  pozaOknemPobytu?: boolean;
}

/** Progi uzupełniającego urlopu macierzyńskiego ze słownika wymiarów i okresów (wpis „Uzupełniający urlop macierzyński”). */
export interface ProgiUzupelniajacego {
  /** Graniczny tydzień ciąży: poród przed jego ukończeniem daje kategorię A (28, czyli do 27. tygodnia). */
  tydzienCiazy: number;
  /** Graniczna masa urodzeniowa w gramach: masa do niej daje kategorię A (1000 g). */
  masaG: number;
  /** Najwięcej tygodni w kategorii A (15) i w pozostałych kategoriach (8). */
  tygodnieA: number;
  tygodniePozostale: number;
  /** Tydzień ciąży, od którego poród jest porodem w terminie (kategoria C, 37). */
  tydzienWTerminie: number;
  /** Przy porodzie w terminie pierwszy dzień pobytu w szpitalu między 5. a 28. dniem po porodzie. */
  poczatekPobytuOd: number;
  poczatekPobytuDo: number;
  /** Przy porodzie w terminie najmniejsza liczba kolejnych dni pobytu w szpitalu (2). */
  najkrotszyPobyt: number;
}

// Wartości startowe wpisu „Uzupełniający urlop macierzyński” (dane/katalog/slownik-wymiarow.ts, art. 180^2 Kodeksu pracy).
export const PROGI_UZUPELNIAJACEGO_DOMYSLNE: ProgiUzupelniajacego = {
  tydzienCiazy: 28,
  masaG: 1000,
  tygodnieA: 15,
  tygodniePozostale: 8,
  tydzienWTerminie: 37,
  poczatekPobytuOd: 5,
  poczatekPobytuDo: 28,
  najkrotszyPobyt: 2,
};

/** Pierwszy i ostatni dzień życia dziecka, w którym może zacząć się pobyt w szpitalu przy porodzie od 37. tygodnia. */
export const OKNO_POCZATKU_POBYTU = {
  od: PROGI_UZUPELNIAJACEGO_DOMYSLNE.poczatekPobytuOd,
  do: PROGI_UZUPELNIAJACEGO_DOMYSLNE.poczatekPobytuDo,
} as const;
/** Najmniejsza liczba kolejnych dni pobytu dziecka w szpitalu przy porodzie od 37. tygodnia. */
export const NAJKROTSZY_POBYT_DNI = PROGI_UZUPELNIAJACEGO_DOMYSLNE.najkrotszyPobyt;

/** Progi z katalogu obowiązujące w dniu porodu, z wartościami domyślnymi bez wpisu. */
export function progiUzupelniajacego(katalog?: Katalog, dzien?: DataISO): ProgiUzupelniajacego {
  if (katalog === undefined || dzien === undefined) return PROGI_UZUPELNIAJACEGO_DOMYSLNE;
  const w = (wariant: string, domyslna: number) => {
    const v = wartoscObowiazujaca(katalog, 'uzupelniajacy-urlop-macierzynski', dzien, wariant);
    return v !== null && Number.isFinite(v.wartosc) && v.wartosc > 0 ? v.wartosc : domyslna;
  };
  const d = PROGI_UZUPELNIAJACEGO_DOMYSLNE;
  return {
    tydzienCiazy: w('tydzienCiazy', d.tydzienCiazy),
    masaG: w('masaUrodzeniowa', d.masaG),
    tygodnieA: w('przedwczesnyPorod', d.tygodnieA),
    tygodniePozostale: w('pozostale', d.tygodniePozostale),
    tydzienWTerminie: w('tydzienPoroduWTerminie', d.tydzienWTerminie),
    poczatekPobytuOd: w('poczatekPobytuOd', d.poczatekPobytuOd),
    poczatekPobytuDo: w('poczatekPobytuDo', d.poczatekPobytuDo),
    najkrotszyPobyt: w('najkrotszyPobyt', d.najkrotszyPobyt),
  };
}

/**
 * Uzupełniający urlop macierzyński: tydzień urlopu za każdy rozpoczęty tydzień pobytu dziecka w szpitalu.
 * Kategoria A (poród przed ukończeniem 28. tygodnia albo masa do 1000 g): do 15 tygodni, okno 105 dni; B (28.–36. tydzień
 * i masa ponad 1000 g): do 8 tygodni, 56 dni; C (od 37. tygodnia): do 8 tygodni przy pobycie co najmniej 2 kolejnych dni
 * rozpoczętym między 5. a 28. dniem życia, liczonym do końca 8. tygodnia życia, czyli najwyżej 52 dni.
 * Progi pochodzą ze słownika wymiarów i okresów (historyjka 3.10.4.2.1, research: prawa-i-obowiazki-rodzica.md).
 */
export function uzupelniajacyUrlop(
  tydzienCiazy: number,
  masaG: number,
  dniPobytu: number,
  opcje: { pierwszyDzienPobytu?: number; progi?: ProgiUzupelniajacego } = {},
): UzupelniajacyUrlop {
  const progi = opcje.progi ?? PROGI_UZUPELNIAJACEGO_DOMYSLNE;
  if (tydzienCiazy < progi.tydzienCiazy || masaG <= progi.masaG) {
    const maks = 7 * progi.tygodnieA;
    return { kategoria: 'do-27-tygodnia-albo-1000-g', maksDniPobytu: maks, tygodnie: Math.ceil(Math.min(dniPobytu, maks) / 7) };
  }
  const maksPozostale = 7 * progi.tygodniePozostale;
  if (tydzienCiazy < progi.tydzienWTerminie) {
    return { kategoria: 'od-28-do-36-tygodnia', maksDniPobytu: maksPozostale, tygodnie: Math.ceil(Math.min(dniPobytu, maksPozostale) / 7) };
  }
  // Od 5. dnia życia do końca 8. tygodnia życia: 56 − 4 = 52 dni.
  const maks = maksPozostale - (progi.poczatekPobytuOd - 1);
  const start = opcje.pierwszyDzienPobytu;
  const wOknie = start === undefined || (start >= progi.poczatekPobytuOd && start <= progi.poczatekPobytuDo);
  const dni = Math.min(dniPobytu, maks);
  if (!wOknie || dni < progi.najkrotszyPobyt) {
    return { kategoria: 'od-37-tygodnia', maksDniPobytu: maks, tygodnie: 0, ...(wOknie ? {} : { pozaOknemPobytu: true }) };
  }
  return { kategoria: 'od-37-tygodnia', maksDniPobytu: maks, tygodnie: Math.min(progi.tygodniePozostale, Math.ceil(dni / 7)) };
}

/**
 * Okres zasiłku macierzyńskiego po urodzeniu martwego dziecka, poronieniu potwierdzonym zaświadczeniem o martwym urodzeniu
 * albo zgonie dziecka, gdy przy życiu nie pozostaje żadne dziecko: od dnia porodu przez 8 tygodni, nie krócej niż do 7. dnia
 * po dniu zgonu; przy zgonie po upływie 8 tygodni życia do 7. dnia po dniu zgonu.
 */
export function okresZasilkuPoStracie(
  dataPorodu: DataISO,
  rodzaj: RodzajStraty,
  dataZgonu: DataISO | undefined,
  katalog: Katalog,
): Okres {
  const tygodnie = parametr(katalog, 'urlopPoStracieTygodnie', dataPorodu).wartosc;
  const dniPoZgonie = parametr(katalog, 'urlopPoStracieDni', dataPorodu).wartosc;
  const koniecOsmiuTygodni = dodajDni(dataPorodu, 7 * tygodnie - 1);
  if (rodzaj === 'zgon-dziecka' && dataZgonu !== undefined) {
    return { od: dataPorodu, do: maxData(koniecOsmiuTygodni, dodajDni(dataZgonu, dniPoZgonie)) };
  }
  return { od: dataPorodu, do: koniecOsmiuTygodni };
}

/** Czy zgon nastąpił po upływie 8 tygodni życia dziecka (po 56. dniu licząc dzień porodu jako pierwszy). */
export function czyZgonPoOsmiuTygodniach(dataPorodu: DataISO, dataZgonu: DataISO, katalog: Katalog): boolean {
  const tygodnie = parametr(katalog, 'urlopPoStracieTygodnie', dataPorodu).wartosc;
  return porownajDaty(dataZgonu, dodajDni(dataPorodu, 7 * tygodnie - 1)) > 0;
}

export interface WejsciePrzyjecia {
  forma: FormaPrzyjecia;
  dataPrzyjecia: DataISO;
  dataUrodzeniaDziecka: DataISO;
  /** Daty urodzenia każdego z jednocześnie przyjętych dzieci; bez nich data `dataUrodzeniaDziecka` dla każdego dziecka. */
  datyUrodzeniaDzieci?: DataISO[];
  odroczenie: boolean;
  liczbaDzieci: number;
  zaZyciem: boolean;
  poczatek?: DataISO;
  katalog: Katalog;
  rejestr?: RejestrRegul;
}

export type UkladPrzyjecia =
  | { rodzaj: 'brak-zasilku'; kod: '0092' }
  | { rodzaj: 'poza-wiekiem'; kod: '0091'; wiek: number }
  | {
      rodzaj: 'uklad';
      naWarunkach: Okres;
      wiek: number;
      /** Dzień przed ukończeniem wieku granicznego przez najmłodsze dziecko wliczone do liczby dzieci. */
      ostatniDzienPrzedWiekiem: DataISO;
      /** Dzień przed ukończeniem przez najmłodsze wliczone dziecko 14 lat (granica urlopu ojcowskiego przy przysposobieniu). */
      dataUrodzeniaNajmlodszego: DataISO;
      wymiarRodzicielskiego: number;
      poWiekuGranicznym: boolean;
      /** Ostatni dzień każdej części urlopu rodzicielskiego: dzień przed wiekiem granicznym albo koniec okresu 38 albo 62 tygodni. */
      koniecRodzicielskiego: DataISO;
      /** Liczba dzieci wliczonych do wymiaru i wszystkich przyjętych dzieci (0263). */
      liczbaWliczonych: number;
      liczbaWszystkich: number;
      /**
       * Wymiar dla jednego dziecka od urodzin, po których wieku granicznego nie ukończyło już tylko jedno wliczone dziecko
       * (0296), i wymiar dla kilkorga dzieci obowiązujący przed tym dniem (43 albo 67 tygodni).
       */
      zmianaWymiaru?: { data: DataISO; wiek: number; wymiar: number; wymiarPrzed: number };
    };

/**
 * Urlop na warunkach urlopu macierzyńskiego i wymiar urlopu rodzicielskiego przy przyjęciu dziecka na wychowanie
 * (historyjki 3.10.4.2.2 i 3.10.4.2.5). Do liczby dzieci wliczamy dzieci, które w dniu przyjęcia nie ukończyły wieku
 * granicznego; okres urlopu na warunkach urlopu macierzyńskiego liczy ta sama funkcja co kreator wniosku ZAM (okresWum).
 * Urlop rodzicielski: 41, 43, 65 albo 67 tygodni do dnia przed ukończeniem wieku granicznego przez najmłodsze wliczone
 * dziecko, a gdy ten wymiar wykracza poza ten dzień, 38 albo z zaświadczeniem „Za życiem” 62 tygodnie do ostatniego dnia
 * okresu tego wymiaru liczonego od dnia po urlopie na warunkach urlopu macierzyńskiego (0290).
 */
export function ukladPrzyjecia(w: WejsciePrzyjecia): UkladPrzyjecia {
  const dzien = w.dataPrzyjecia;
  const wiek = wiekGranicznyPrzyjecia(w.forma, w.odroczenie, w.katalog, dzien, w.rejestr);
  if (wiek === null) return { rodzaj: 'brak-zasilku', kod: '0092' };
  const dane: DanePrzyjecia = {
    forma: w.forma,
    dataPrzyjecia: w.dataPrzyjecia,
    dataUrodzeniaDziecka: w.dataUrodzeniaDziecka,
    liczbaPrzyjetychDzieci: liczbaDzieciWZakresie(w.liczbaDzieci),
    odroczenieObowiazkuSzkolnego: w.odroczenie,
    ...(w.datyUrodzeniaDzieci !== undefined && w.datyUrodzeniaDzieci.length > 0 ? { datyUrodzeniaDzieci: w.datyUrodzeniaDzieci } : {}),
  };
  const dzieci = dzieciWliczone(dane, w.katalog);
  if (dzieci === null) return { rodzaj: 'brak-zasilku', kod: '0092' };
  if (dzieci.wliczone.length === 0) return { rodzaj: 'poza-wiekiem', kod: '0091', wiek };
  const n = dzieci.wliczone.length;
  const naWarunkach = okresWum(dane, w.katalog, w.poczatek ?? w.dataPrzyjecia);
  if (naWarunkach === null) return { rodzaj: 'poza-wiekiem', kod: '0091', wiek };
  const o = odczyt(w.katalog, dzien, w.rejestr);
  o(KLUCZE_NA_WARUNKACH[liczbaDzieciWZakresie(n)]);
  o('naWarunkachMinimum');
  const ostatniDzienPrzedWiekiem = dodajDni(dzieci.urodzinyGraniczne[n - 1], -1);
  const poczatekRodzicielskiego = dodajDni(naWarunkach.do, 1);
  let pelny = wymiarRodzicielskiego(n, w.zaZyciem, w.katalog, dzien, w.rejestr);
  let zmianaWymiaru: { data: DataISO; wiek: number; wymiar: number; wymiarPrzed: number } | undefined;
  if (n > 1) {
    const urodzinyJednego = dzieci.urodzinyGraniczne[n - 2];
    if (porownajDaty(urodzinyJednego, dodajDni(poczatekRodzicielskiego, 7 * pelny - 1)) <= 0) {
      const wymiarPrzed = pelny;
      pelny = wymiarRodzicielskiego(1, w.zaZyciem, w.katalog, dzien, w.rejestr);
      zmianaWymiaru = { data: urodzinyJednego, wiek, wymiar: pelny, wymiarPrzed };
    }
  }
  const poWiekuGranicznym = porownajDaty(dodajDni(poczatekRodzicielskiego, 7 * pelny - 1), ostatniDzienPrzedWiekiem) > 0;
  const wymiar = poWiekuGranicznym ? wymiarRodzicielskiego(n, w.zaZyciem, w.katalog, dzien, w.rejestr, true) : pelny;
  const koniecRodzicielskiego = poWiekuGranicznym
    ? dodajDni(poczatekRodzicielskiego, 7 * wymiar - 1)
    : maxData(poczatekRodzicielskiego, ostatniDzienPrzedWiekiem);
  return {
    rodzaj: 'uklad',
    naWarunkach,
    wiek,
    ostatniDzienPrzedWiekiem,
    dataUrodzeniaNajmlodszego: dzieci.wliczone[n - 1],
    wymiarRodzicielskiego: wymiar,
    poWiekuGranicznym,
    koniecRodzicielskiego,
    liczbaWliczonych: n,
    liczbaWszystkich: dzieci.wszystkie,
    ...(zmianaWymiaru !== undefined && !poWiekuGranicznym ? { zmianaWymiaru } : {}),
  };
}

/**
 * Okresy urlopów po przyjęciu dziecka w układzie domyślnym: urlop na warunkach urlopu macierzyńskiego i urlop rodzicielski
 * rodzica, który przyjął dziecko (wymiar łączny pomniejszony o 9 tygodni drugiego rodzica). Pusta lista bez prawa do urlopu.
 */
export function okresyPoPrzyjeciu(w: WejsciePrzyjecia): Okres[] {
  const u = ukladPrzyjecia(w);
  if (u.rodzaj !== 'uklad') return [];
  const nieprzenoszalna = parametr(w.katalog, 'nieprzenoszalna', w.dataPrzyjecia).wartosc;
  const od = dodajDni(u.naWarunkach.do, 1);
  return [u.naWarunkach, { od, do: dodajDni(od, 7 * (u.wymiarRodzicielskiego - nieprzenoszalna) - 1) }];
}

/** Dni wydłużenia urlopu rodzicielskiego przy łączeniu z pracą w wymiarze `wymiar` procent etatu, bez niepełnego dnia. */
export function wydluzeniePrzyLaczeniu(dni: number, wymiar: number): number {
  return Math.floor((dni * wymiar) / 100);
}
