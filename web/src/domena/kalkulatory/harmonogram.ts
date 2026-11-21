// Harmonogram miesięcznych wypłat zasiłku (kontrakt, sekcja 7.2). Właściciel: u09 (Silnik kalkulatora zasiłku macierzyńskiego).
// Każdy okres każdego rodzica dzielimy na miesiące kalendarzowe. Kwota za miesiąc = podstawa / 30 × stawka × dni okresu
// w miesiącu, zaokrąglona do grosza, a kwota za ostatni miesiąc okresu to suma za okres pomniejszona o kwoty za wcześniejsze
// miesiące. Przyległe okresy jednego rodzica z tą samą stawką liczymy jako jeden okres. Podwyższenie do kwoty świadczenia
// rodzicielskiego ustalamy dla rodzica i miesiąca z okresów urlopu macierzyńskiego, uzupełniającego, na warunkach urlopu
// macierzyńskiego i rodzicielskiego (z łączeniem i wydłużeniem); urlop ojcowski nie podlega podwyższeniu.
import {
  dniWMiesiacu,
  dodajDni,
  maxData,
  miesiacZDaty,
  minData,
  ostatniDzienMiesiaca,
  pierwszyDzienMiesiaca,
  porownajDaty,
  roznicaDni,
  czesciDaty,
} from '@/domena/daty';
import { kwotaMiesieczna, kwotaZaDni, podzielKwote, wGoreDo10Groszy } from '@/domena/kalkulatory/rachunek';
import { kwotaParametru } from '@/domena/kalkulatory/slowniki';
import type { DataISO, Grosze, Katalog, MiesiacISO, OkresScenariusza, Procent, RodzicWRodzinie, WynikScenariusza } from '@/domena/typy';

type PozycjaHarmonogramu = WynikScenariusza['harmonogram'][number];

const RODZAJE_BEZ_PODWYZSZENIA: ReadonlySet<OkresScenariusza['rodzaj']> = new Set(['ojcowski']);

interface Blok {
  rodzic: RodzicWRodzinie;
  od: DataISO;
  do: DataISO;
  podstawa: Grosze;
  stawka: Procent;
  podwyzszany: boolean;
}

export interface WyrownanieDoStu {
  rodzic: RodzicWRodzinie;
  miesiac: MiesiacISO;
  kwota: Grosze;
}

function kolejnoscRodzica(r: RodzicWRodzinie): number {
  return r === 'matka' ? 0 : 1;
}

// Scala przyległe okresy jednego rodzica z tą samą dzienną stawką i tym samym prawem do podwyższenia.
function bloki(okresy: (OkresScenariusza & { podstawa: Grosze })[]): Blok[] {
  const posortowane = [...okresy].sort(
    (a, b) => kolejnoscRodzica(a.rodzic) - kolejnoscRodzica(b.rodzic) || porownajDaty(a.od, b.od),
  );
  const wynik: Blok[] = [];
  for (const o of posortowane) {
    const podwyzszany = !RODZAJE_BEZ_PODWYZSZENIA.has(o.rodzaj);
    const ostatni = wynik.at(-1);
    if (
      ostatni !== undefined &&
      ostatni.rodzic === o.rodzic &&
      ostatni.podstawa === o.podstawa &&
      ostatni.stawka === o.stawka &&
      ostatni.podwyzszany === podwyzszany &&
      dodajDni(ostatni.do, 1) === o.od
    ) {
      ostatni.do = o.do;
    } else {
      wynik.push({ rodzic: o.rodzic, od: o.od, do: o.do, podstawa: o.podstawa, stawka: o.stawka, podwyzszany });
    }
  }
  return wynik;
}

/** Kwota świadczenia rodzicielskiego za miesiąc: pełna za każdy dzień, za część dni kwota / dni miesiąca × dni, w górę do 10 groszy. */
export function kwotaSwiadczeniaZaMiesiac(kwotaMiesiecznaSwiadczenia: Grosze, dniMiesiaca: number, dniZasilku: number): Grosze {
  if (dniZasilku >= dniMiesiaca) return kwotaMiesiecznaSwiadczenia;
  return wGoreDo10Groszy(podzielKwote(kwotaMiesiecznaSwiadczenia, dniMiesiaca) * dniZasilku);
}

/**
 * Harmonogram z dokładną podstawą wymiaru każdego okresu. `dzienSlownika` wskazuje dzień, na który kalkulator
 * odczytuje kwotę świadczenia rodzicielskiego (dzień porodu, przewidywanego terminu albo przyjęcia).
 */
export function harmonogramZPodstaw(
  okresy: (OkresScenariusza & { podstawa: Grosze })[],
  katalog: Katalog,
  dzienSlownika: DataISO,
  wyrownania: WyrownanieDoStu[] = [],
): PozycjaHarmonogramu[] {
  const kwotaSwiadczenia = kwotaParametru(katalog, 'swiadczenieRodzicielskie', dzienSlownika);
  const kwoty = new Map<string, { kwota: Grosze; podwyzszana: Grosze; dniPodwyzszane: Set<number> }>();
  const klucz = (miesiac: MiesiacISO, rodzic: RodzicWRodzinie) => `${miesiac}|${rodzic}`;

  for (const b of bloki(okresy)) {
    const suma = kwotaZaDni(b.podstawa, b.stawka, roznicaDni(b.od, b.do) + 1);
    let wczesniej = 0;
    let poczatek = b.od;
    while (porownajDaty(poczatek, b.do) <= 0) {
      const koniec = minData(ostatniDzienMiesiaca(poczatek), b.do);
      const dni = roznicaDni(poczatek, koniec) + 1;
      const ostatni = koniec === b.do;
      const kwota = ostatni ? suma - wczesniej : kwotaZaDni(b.podstawa, b.stawka, dni);
      wczesniej += kwota;
      const m = miesiacZDaty(poczatek);
      const k = klucz(m, b.rodzic);
      const pozycja = kwoty.get(k) ?? { kwota: 0, podwyzszana: 0, dniPodwyzszane: new Set<number>() };
      pozycja.kwota += kwota;
      if (b.podwyzszany) {
        pozycja.podwyzszana += kwota;
        const dzienOd = czesciDaty(poczatek).dzien;
        for (let i = 0; i < dni; i += 1) pozycja.dniPodwyzszane.add(dzienOd + i);
      }
      kwoty.set(k, pozycja);
      poczatek = dodajDni(koniec, 1);
    }
  }

  const wynik: PozycjaHarmonogramu[] = [];
  for (const [k, v] of kwoty) {
    const [miesiac, rodzic] = k.split('|') as [MiesiacISO, RodzicWRodzinie];
    let podwyzszenie = 0;
    if (v.dniPodwyzszane.size > 0) {
      const { rok, miesiac: nr } = czesciDaty(`${miesiac}-01`);
      const naleznosc = kwotaSwiadczeniaZaMiesiac(kwotaSwiadczenia, dniWMiesiacu(rok, nr), v.dniPodwyzszane.size);
      podwyzszenie = Math.max(0, naleznosc - v.podwyzszana);
    }
    wynik.push({ miesiac, rodzic, kwota: v.kwota, podwyzszenie, wyrownanie: 0 });
  }
  for (const w of wyrownania) {
    const istniejaca = wynik.find((p) => p.miesiac === w.miesiac && p.rodzic === w.rodzic);
    if (istniejaca !== undefined) istniejaca.wyrownanie += w.kwota;
    else wynik.push({ miesiac: w.miesiac, rodzic: w.rodzic, kwota: 0, podwyzszenie: 0, wyrownanie: w.kwota });
  }
  return wynik.sort((a, b) => a.miesiac.localeCompare(b.miesiac) || kolejnoscRodzica(a.rodzic) - kolejnoscRodzica(b.rodzic));
}

// Podstawa wymiaru, która daje zapisane w okresie kwoty miesięczną i za okres.
function podstawaOkresu(o: OkresScenariusza): Grosze {
  if (o.stawka <= 0) return 0;
  const przyblizona = Math.round((o.miesiecznie * 100) / o.stawka);
  for (let r = 0; r <= 3; r += 1) {
    for (const p of [przyblizona - r, przyblizona + r]) {
      if (kwotaMiesieczna(p, o.stawka) === o.miesiecznie && kwotaZaDni(p, o.stawka, o.dni) === o.zaOkres) return p;
    }
  }
  return przyblizona;
}

/** Wypłaty w kolejnych miesiącach okresów scenariusza. */
export function harmonogram(okresy: OkresScenariusza[], katalog: Katalog): WynikScenariusza['harmonogram'] {
  if (okresy.length === 0) return [];
  const pierwszy = okresy.map((o) => o.od).reduce((a, b) => minData(a, b));
  return harmonogramZPodstaw(
    okresy.map((o) => ({ ...o, podstawa: podstawaOkresu(o) })),
    katalog,
    pierwszy,
  );
}

/** Sumy rodziców i obojga z harmonogramu (kwoty, podwyższenia i wyrównania). */
export function sumyHarmonogramu(h: WynikScenariusza['harmonogram']): WynikScenariusza['sumy'] {
  const sumy: WynikScenariusza['sumy'] = { razem: 0 };
  for (const p of h) {
    const kwota = p.kwota + p.podwyzszenie + p.wyrownanie;
    sumy[p.rodzic] = (sumy[p.rodzic] ?? 0) + kwota;
    sumy.razem += kwota;
  }
  return sumy;
}

/** Pierwszy i ostatni miesiąc harmonogramu. */
export function zakresHarmonogramu(h: WynikScenariusza['harmonogram']): { od: DataISO; do: DataISO } | null {
  if (h.length === 0) return null;
  const od = h.map((p) => pierwszyDzienMiesiaca(`${p.miesiac}-01`)).reduce((a, b) => minData(a, b));
  const do_ = h.map((p) => ostatniDzienMiesiaca(`${p.miesiac}-01`)).reduce((a, b) => maxData(a, b));
  return { od, do: do_ };
}
