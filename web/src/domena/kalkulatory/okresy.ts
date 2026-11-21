// Wymiary urlopów i okresy zasiłku po stracie dziecka, po przyjęciu dziecka i przy łączeniu z pracą (kontrakt, sekcja 7.2).
// Właściciel: u09 (Silnik kalkulatora zasiłku macierzyńskiego).
// Konwencje: tydzień = 7 dni; okres N dni od S kończy się S + N − 1; „7. dzień po dniu zgonu” = zgon + 7;
// „ukończenie N lat” = data urodzenia + N lat, a ostatni dzień urlopu to dzień poprzedni.
import { dodajDni, dodajLata, maxData, minData, porownajDaty } from '@/domena/daty';
import { parametr, type KluczParametru, type RejestrRegul } from '@/domena/kalkulatory/slowniki';
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
}

/**
 * Uzupełniający urlop macierzyński: tydzień urlopu za każdy rozpoczęty tydzień pobytu dziecka w szpitalu.
 * Kategoria A (≤ 27. tydzień albo ≤ 1000 g): okno 105 dni; B (28.–36. tydzień i > 1000 g): 56 dni;
 * C (≥ 37. tydzień): od 5. dnia do końca 8. tygodnia, 52 dni, przy pobycie co najmniej 2 kolejnych dni.
 */
export function uzupelniajacyUrlop(tydzienCiazy: number, masaG: number, dniPobytu: number): UzupelniajacyUrlop {
  if (tydzienCiazy <= 27 || masaG <= 1000) {
    return { kategoria: 'do-27-tygodnia-albo-1000-g', maksDniPobytu: 105, tygodnie: Math.ceil(Math.min(dniPobytu, 105) / 7) };
  }
  if (tydzienCiazy <= 36) {
    return { kategoria: 'od-28-do-36-tygodnia', maksDniPobytu: 56, tygodnie: Math.ceil(Math.min(dniPobytu, 56) / 7) };
  }
  const dni = Math.min(dniPobytu, 52);
  return { kategoria: 'od-37-tygodnia', maksDniPobytu: 52, tygodnie: dni < 2 ? 0 : Math.ceil(dni / 7) };
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
      /** Dzień przed ukończeniem przez dziecko wieku granicznego. */
      ostatniDzienPrzedWiekiem: DataISO;
      wymiarRodzicielskiego: number;
      poWiekuGranicznym: boolean;
    };

/**
 * Urlop na warunkach urlopu macierzyńskiego i wymiar urlopu rodzicielskiego przy przyjęciu dziecka na wychowanie.
 * Koniec = max(początek + 62 dni, min(początek + 7W − 1, dzień przed wiekiem granicznym)), czyli co najmniej 9 tygodni.
 */
export function ukladPrzyjecia(w: WejsciePrzyjecia): UkladPrzyjecia {
  const dzien = w.dataPrzyjecia;
  const wiek = wiekGranicznyPrzyjecia(w.forma, w.odroczenie, w.katalog, dzien, w.rejestr);
  if (wiek === null) return { rodzaj: 'brak-zasilku', kod: '0092' };
  const dataWieku = dodajLata(w.dataUrodzeniaDziecka, wiek);
  if (porownajDaty(w.dataPrzyjecia, dataWieku) >= 0) return { rodzaj: 'poza-wiekiem', kod: '0091', wiek };
  const ostatniDzienPrzedWiekiem = dodajDni(dataWieku, -1);
  const o = odczyt(w.katalog, dzien, w.rejestr);
  const tygodnie = wymiarNaWarunkach(w.liczbaDzieci, w.katalog, dzien, w.rejestr);
  const minimum = o('naWarunkachMinimum');
  const poczatek = w.poczatek ?? w.dataPrzyjecia;
  const koniec = maxData(
    dodajDni(poczatek, 7 * minimum - 1),
    minData(dodajDni(poczatek, 7 * tygodnie - 1), ostatniDzienPrzedWiekiem),
  );
  const pelny = wymiarRodzicielskiego(w.liczbaDzieci, w.zaZyciem, w.katalog, dzien, w.rejestr);
  const koniecPelnego = dodajDni(koniec, 7 * pelny);
  const poWiekuGranicznym = porownajDaty(koniecPelnego, ostatniDzienPrzedWiekiem) > 0;
  return {
    rodzaj: 'uklad',
    naWarunkach: { od: poczatek, do: koniec },
    wiek,
    ostatniDzienPrzedWiekiem,
    wymiarRodzicielskiego: poWiekuGranicznym
      ? wymiarRodzicielskiego(w.liczbaDzieci, w.zaZyciem, w.katalog, dzien, w.rejestr, true)
      : pelny,
    poWiekuGranicznym,
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
