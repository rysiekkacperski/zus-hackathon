// Walidacja pól wyniku i arkuszy kalkulatora: podstawa wymiaru, część przed porodem, początek urlopu przy przyjęciu,
// części urlopu rodzicielskiego, urlop ojcowski, ubezpieczenie po porodzie, przejęcie urlopu i łączenie z pracą.
// Właściciel: u09 (Silnik kalkulatora zasiłku macierzyńskiego). Funkcje zwracają kod komunikatu z parametrami
// sformatowanymi do treści z tablicy komunikatów; format daty (0010) sprawdza widok przez `parsujDate`.
import { dodajDni, dodajLata, formatujDate, porownajDaty } from '@/domena/daty';
import { parsujKwote } from '@/domena/kwoty';
import { koniecCzesci } from '@/domena/kalkulatory/powrot';
import { parametr } from '@/domena/kalkulatory/slowniki';
import type { UkladScenariusza } from '@/domena/kalkulatory/scenariusz';
import type { CzescUrlopuRodzicielskiego, DataISO, Grosze, Katalog, KodKomunikatu } from '@/domena/typy';

export interface BladPola { kod: KodKomunikatu; parametry?: Record<string, string> }

/** Sytuacje przejęcia części urlopu macierzyńskiego przez drugiego rodzica (`ParametryScenariusza.przejecie.sytuacja`). */
export type SytuacjaPrzejecia = 'rezygnacja' | 'orzeczenie' | 'porzucenie' | 'szpital' | 'zgon-matki' | 'zatrudnienie-matki';

const MAKS_PODSTAWY: Grosze = 9_999_999;

/** Podstawa wpisana: obowiązkowa (0093), większa od zera, najwyżej 99 999,99 zł i 2 miejsca po przecinku (0016). */
export function walidujPodstaweWpisana(tekst: string): { kwota: Grosze } | BladPola {
  if (tekst.trim() === '') return { kod: '0093' };
  const kwota = parsujKwote(tekst);
  if (kwota === null || kwota <= 0 || kwota > MAKS_PODSTAWY) return { kod: '0016' };
  return { kwota };
}

/** Część urlopu macierzyńskiego przed porodem: liczba całkowita 0–6 (0061). */
export function walidujTygodniePrzedPorodem(tekst: string, katalog: Katalog, dzien: DataISO): { tygodnie: number } | BladPola {
  const t = tekst.trim();
  const maks = parametr(katalog, 'czescPrzedPorodem', dzien).wartosc;
  if (!/^\d+$/.test(t) || Number(t) > maks) return { kod: '0061' };
  return { tygodnie: Number(t) };
}

/** Początek urlopu na warunkach urlopu macierzyńskiego: od dnia przyjęcia do 21. dnia po nim (0042); puste pole = dzień przyjęcia. */
export function walidujPoczatekNaWarunkach(data: DataISO | null, dataPrzyjecia: DataISO, katalog: Katalog): { data: DataISO } | BladPola {
  if (data === null) return { data: dataPrzyjecia };
  const koniec = dodajDni(dataPrzyjecia, parametr(katalog, 'terminWariantu815', dataPrzyjecia).wartosc);
  if (porownajDaty(data, dataPrzyjecia) < 0 || porownajDaty(data, koniec) > 0) return { kod: '0042' };
  return { data };
}

/**
 * Części urlopu rodzicielskiego. Błędy według indeksu części i pola (`rodzic`, `od`, `tygodnie`) oraz błąd listy (`lista`):
 * 0006 brak rodzica, 0064 rodzic bez prawa, 0042 część poza zakresem, 0061 tygodnie ≤ 0 albo ponad wymiar rodzica,
 * 0095 suma obojga ponad wymiar, 0096 ponad 5 części.
 */
export function walidujCzesciRodzicielskiego(
  czesci: (Partial<CzescUrlopuRodzicielskiego> & { od?: DataISO | null })[],
  u: UkladScenariusza,
  katalog: Katalog,
): { czesci: Record<number, Partial<Record<'rodzic' | 'od' | 'tygodnie', BladPola>>>; lista?: BladPola } {
  const wynik: Record<number, Partial<Record<'rodzic' | 'od' | 'tygodnie', BladPola>>> = {};
  const maksCzesci = parametr(katalog, 'liczbaCzesci', u.dataZdarzenia).wartosc;
  const L = u.wymiarRodzicielskiego;
  const sumy = { matka: 0, 'drugi-rodzic': 0 };
  czesci.forEach((c, i) => {
    const b: Partial<Record<'rodzic' | 'od' | 'tygodnie', BladPola>> = {};
    if (c.rodzic === undefined) b.rodzic = { kod: '0006' };
    else if (!u.prawo[c.rodzic]) b.rodzic = { kod: '0064' };
    if (c.tygodnie === undefined || !Number.isInteger(c.tygodnie) || c.tygodnie <= 0) b.tygodnie = { kod: '0061' };
    if (c.od === undefined || c.od === null) b.od = { kod: '0175' };
    else {
      const najwczesniej = c.rodzic === 'drugi-rodzic' && u.drugiRodzicOd !== undefined && porownajDaty(u.drugiRodzicOd, u.poczatekRodzicielskiego) > 0
        ? u.drugiRodzicOd
        : c.rodzic === 'drugi-rodzic' && !u.prawo.matka
          ? u.dataZdarzenia
          : u.poczatekRodzicielskiego;
      const tygodnie = b.tygodnie === undefined && c.tygodnie !== undefined ? c.tygodnie : 1;
      const koniec = koniecCzesci({ rodzic: c.rodzic ?? 'matka', od: c.od, tygodnie });
      if (porownajDaty(c.od, najwczesniej) < 0 || porownajDaty(koniec, u.koniecWykorzystania) > 0) b.od = { kod: '0042' };
    }
    if (c.rodzic !== undefined && b.tygodnie === undefined && c.tygodnie !== undefined) {
      sumy[c.rodzic] += c.tygodnie;
      if (sumy[c.rodzic] > L - u.nieprzenoszalna) b.tygodnie = { kod: '0061' };
    }
    if (Object.keys(b).length > 0) wynik[i] = b;
  });
  let lista: BladPola | undefined;
  if (czesci.length > maksCzesci) lista = { kod: '0096' };
  else if (sumy.matka + sumy['drugi-rodzic'] > L) {
    const ostatniDrugiego = czesci.map((c, i) => ({ c, i })).filter(({ c }) => c.rodzic === 'drugi-rodzic').at(-1);
    const blad = { kod: '0095' as const, parametry: { liczbaTygodni: String(L) } };
    if (ostatniDrugiego !== undefined) wynik[ostatniDrugiego.i] = { ...wynik[ostatniDrugiego.i], tygodnie: blad };
    else lista = blad;
  }
  return lista !== undefined ? { czesci: wynik, lista } : { czesci: wynik };
}

/** Początek części urlopu ojcowskiego: obowiązkowy (0175), od dnia porodu albo podjęcia ubezpieczenia, koniec przed ukończeniem przez dziecko 12 miesięcy (0042). */
export function walidujCzescOjcowskiego(od: DataISO | null, dni: number, u: UkladScenariusza): BladPola | null {
  if (od === null) return { kod: '0175' };
  const najwczesniej = u.drugiRodzicOd ?? u.dataZdarzenia;
  if (porownajDaty(od, najwczesniej) < 0 || porownajDaty(dodajDni(od, dni - 1), u.koniecOjcowskiego) > 0) return { kod: '0042' };
  return null;
}

/** Data podjęcia ubezpieczenia chorobowego po porodzie: od dnia po porodzie do 7 dni przed ukończeniem przez dziecko 12 miesięcy (0247). */
export function walidujDateUbezpieczeniaPoPorodzie(data: DataISO, dataPorodu: DataISO): BladPola | null {
  const najpozniej = dodajDni(dodajLata(dataPorodu, 1), -7);
  if (porownajDaty(data, dodajDni(dataPorodu, 1)) < 0 || porownajDaty(data, najpozniej) > 0) {
    return { kod: '0247', parametry: { data: formatujDate(najpozniej) } };
  }
  return null;
}

/**
 * Przejęcie urlopu macierzyńskiego przy matce ubezpieczonej: po rezygnacji od 99. dnia (0097), przy orzeczeniu, porzuceniu
 * i pobycie w szpitalu od 57. dnia (0169), najpóźniej w ostatnim dniu urlopu macierzyńskiego (0042); koniec pobytu
 * obowiązkowy (0176) i nie wcześniej niż data przejęcia (0110).
 */
export function walidujPrzejecie(
  w: { sytuacja: SytuacjaPrzejecia | null; data: DataISO | null; koniecPobytuMatki?: DataISO | null },
  u: UkladScenariusza,
): Partial<Record<'sytuacja' | 'data' | 'koniecPobytuMatki', BladPola>> {
  const b: Partial<Record<'sytuacja' | 'data' | 'koniecPobytuMatki', BladPola>> = {};
  if (w.sytuacja === null) b.sytuacja = { kod: '0006' };
  if (w.data === null) b.data = { kod: '0175' };
  const mac = u.macierzynski;
  if (w.data !== null && mac !== undefined) {
    if (porownajDaty(w.data, mac.do) > 0) b.data = { kod: '0042' };
    else if (u.prawo.matka && w.sytuacja === 'rezygnacja' && porownajDaty(w.data, dodajDni(u.dataZdarzenia, 98)) < 0) b.data = { kod: '0097' };
    else if (
      u.prawo.matka &&
      (w.sytuacja === 'orzeczenie' || w.sytuacja === 'porzucenie' || w.sytuacja === 'szpital') &&
      porownajDaty(w.data, dodajDni(u.dataZdarzenia, 56)) < 0
    ) {
      b.data = { kod: '0169' };
    }
  }
  if (w.sytuacja === 'szpital') {
    if (w.koniecPobytuMatki === null || w.koniecPobytuMatki === undefined) b.koniecPobytuMatki = { kod: '0176' };
    else if (w.data !== null && porownajDaty(w.koniecPobytuMatki, w.data) < 0) b.koniecPobytuMatki = { kod: '0110' };
  }
  return b;
}

/** Łączenie urlopu rodzicielskiego z pracą: część obowiązkowa (0006), tygodnie od 1 do liczby tygodni części (0061), wymiar pracy całkowity 1–50% (0098). */
export function walidujLaczenie(
  w: { czesc: CzescUrlopuRodzicielskiego | null; tygodnie: string; wymiarPracy: string },
  katalog: Katalog,
  dzien: DataISO,
): Partial<Record<'czesc' | 'tygodnie' | 'wymiarPracy', BladPola>> {
  const b: Partial<Record<'czesc' | 'tygodnie' | 'wymiarPracy', BladPola>> = {};
  if (w.czesc === null) b.czesc = { kod: '0006' };
  const t = w.tygodnie.trim();
  if (!/^\d+$/.test(t) || Number(t) < 1 || (w.czesc !== null && Number(t) > w.czesc.tygodnie)) b.tygodnie = { kod: '0061' };
  const p = w.wymiarPracy.trim();
  const maks = parametr(katalog, 'laczenieWymiarPracy', dzien).wartosc;
  if (!/^\d+$/.test(p) || Number(p) < 1 || Number(p) > maks) b.wymiarPracy = { kod: '0098' };
  return b;
}
