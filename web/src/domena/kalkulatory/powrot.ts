// Powrót do pracy: zmiana daty powrotu jednego rodzica, granice daty i uprawnienia po powrocie (kontrakt, sekcja 7.2).
// Właściciel: u09 (Silnik kalkulatora zasiłku macierzyńskiego).
// Zmiana daty dotyczy urlopu rodzicielskiego tego rodzica: wcześniejsza data skraca ostatnie części i usuwa części, które
// zaczynają się w dniu nowej daty albo później; późniejsza wydłuża ostatnią część; bez części kalkulator dodaje część od dnia
// po ostatnim dniu urlopu rodzica. Część kończy się w ostatnim dniu ostatniego pełnego tygodnia przed nową datą.
import { dodajDni, formatujDate, porownajDaty, roznicaDni } from '@/domena/daty';
import type {
  CzescUrlopuRodzicielskiego,
  DataISO,
  FormaZatrudnienia,
  IdPozycji,
  KodKomunikatu,
  RodzicWRodzinie,
} from '@/domena/typy';

export interface ZmianaDatyPowrotu {
  czesci: CzescUrlopuRodzicielskiego[];
  dataPowrotu: DataISO;
  /** 0245 z datą, gdy kalkulator dopasował datę do pełnych tygodni. */
  komunikat?: { kod: KodKomunikatu; parametry: Record<string, string> };
}

/** Koniec części urlopu rodzicielskiego (od + 7 × tygodnie − 1). */
export function koniecCzesci(c: CzescUrlopuRodzicielskiego): DataISO {
  return dodajDni(c.od, 7 * c.tygodnie - 1);
}

/**
 * Części po zmianie daty powrotu rodzica. `poczatekBezCzesci` to dzień po ostatnim dniu urlopu rodzica, od którego
 * kalkulator dodaje część, gdy rodzic nie ma części urlopu rodzicielskiego; `maksTygodni` ogranicza wymiar rodzica.
 */
export function zastosujDatePowrotu(
  czesci: CzescUrlopuRodzicielskiego[],
  rodzic: RodzicWRodzinie,
  data: DataISO,
  poczatekBezCzesci: DataISO,
  maksTygodni: number,
): ZmianaDatyPowrotu {
  const pozostale = czesci.filter((c) => c.rodzic !== rodzic);
  const wlasne = czesci
    .filter((c) => c.rodzic === rodzic)
    .sort((a, b) => porownajDaty(a.od, b.od))
    .filter((c) => porownajDaty(c.od, data) < 0);
  const uzyteWczesniej = (do_: number) => wlasne.slice(0, do_).reduce((s, c) => s + c.tygodnie, 0);
  let nowe: CzescUrlopuRodzicielskiego[];
  let dataPowrotu: DataISO;
  let dopasowano = false;
  if (wlasne.length === 0) {
    const dni = Math.max(0, roznicaDni(poczatekBezCzesci, data));
    const tygodnie = Math.min(Math.floor(dni / 7), maksTygodni);
    dopasowano = dni % 7 !== 0 || tygodnie * 7 !== dni;
    nowe = tygodnie > 0 ? [{ rodzic, od: poczatekBezCzesci, tygodnie }] : [];
    dataPowrotu = tygodnie > 0 ? dodajDni(poczatekBezCzesci, 7 * tygodnie) : data;
  } else {
    const ostatnia = wlasne[wlasne.length - 1];
    const dni = roznicaDni(ostatnia.od, data);
    const dostepne = Math.max(0, maksTygodni - uzyteWczesniej(wlasne.length - 1));
    const tygodnie = Math.min(Math.floor(dni / 7), dostepne);
    dopasowano = tygodnie * 7 !== dni;
    nowe = [...wlasne.slice(0, -1), ...(tygodnie > 0 ? [{ ...ostatnia, tygodnie }] : [])];
    const koniec = nowe.length > 0 ? koniecCzesci(nowe[nowe.length - 1]) : dodajDni(ostatnia.od, -1);
    dataPowrotu = dodajDni(koniec, 1);
  }
  return {
    // Części w kolejności dat: parametry łączenia z pracą wskazują część po indeksie, więc kolejność musi zostać stała.
    czesci: [...pozostale, ...nowe].sort((a, b) => porownajDaty(a.od, b.od)),
    dataPowrotu,
    ...(dopasowano ? { komunikat: { kod: '0245', parametry: { data: formatujDate(dataPowrotu) } } } : {}),
  };
}

/**
 * Najwcześniejsza data powrotu: pierwszy dzień pierwszej części urlopu rodzicielskiego rodzica (bez części: dzień po ostatnim
 * dniu urlopu). Najpóźniejsza: dzień po wykorzystaniu całego dostępnego wymiaru.
 */
export function graniceDatyPowrotu(
  czesci: CzescUrlopuRodzicielskiego[],
  rodzic: RodzicWRodzinie,
  poczatekBezCzesci: DataISO,
  maksTygodni: number,
): { najwczesniej: DataISO; najpozniej: DataISO } {
  const wlasne = czesci.filter((c) => c.rodzic === rodzic).sort((a, b) => porownajDaty(a.od, b.od));
  if (wlasne.length === 0) {
    return { najwczesniej: poczatekBezCzesci, najpozniej: dodajDni(poczatekBezCzesci, 7 * maksTygodni) };
  }
  const ostatnia = wlasne[wlasne.length - 1];
  const wczesniejsze = wlasne.slice(0, -1).reduce((s, c) => s + c.tygodnie, 0);
  return {
    najwczesniej: wlasne[0].od,
    najpozniej: dodajDni(ostatnia.od, 7 * Math.max(0, maksTygodni - wczesniejsze)),
  };
}

/** Walidacja daty powrotu: 0243 przed najwcześniejszą, 0244 po najpóźniejszej (z datą graniczną). */
export function walidujDatePowrotu(
  data: DataISO,
  granice: { najwczesniej: DataISO; najpozniej: DataISO },
): { kod: KodKomunikatu; parametry: Record<string, string> } | null {
  if (porownajDaty(data, granice.najwczesniej) < 0) return { kod: '0243', parametry: { data: formatujDate(granice.najwczesniej) } };
  if (porownajDaty(data, granice.najpozniej) > 0) return { kod: '0244', parametry: { data: formatujDate(granice.najpozniej) } };
  return null;
}

/**
 * Uprawnienia po powrocie do pracy z etapu Powrót do pracy: K20 przerwy na karmienie (matka na umowie o pracę),
 * K21 dwa dni opieki i K23 urlop wychowawczy (rodzic na umowie o pracę), K22 zasiłek opiekuńczy (umowa o pracę
 * albo dobrowolne ubezpieczenie chorobowe).
 */
export function uprawnieniaPoPowrocie(rodzic: RodzicWRodzinie, forma: FormaZatrudnienia | null, dobrowolne: boolean): IdPozycji[] {
  if (forma === 'umowa-o-prace') return rodzic === 'matka' ? ['K20', 'K21', 'K22', 'K23'] : ['K21', 'K22', 'K23'];
  if ((forma === 'umowa-zlecenia' || forma === 'jdg') && dobrowolne) return ['K22'];
  return [];
}
