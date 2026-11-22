// Odczyt kwot, progów i wymiarów ze słowników Katalogu świadczeń na potrzeby Kalendarza terminów. Właściciel: u13.
// Wpis kwoty odszukujemy po identyfikatorze z ID_KWOT albo z kosztu spóźnienia pozycji katalogu. Wartość obowiązuje
// w dniu `dzien` (od ≤ dzien ≤ do). Kwoty słownika kwot i progów (jednostka 'zl') są w groszach. Gdy słownik
// nie zawiera wartości, stosujemy kwotę z reguł terminów Story zapisaną w polu `domyslna`.
import { ID_KWOT } from '@/dane/katalog/slownik-kwot';
import { wartoscObowiazujaca } from '@/domena/katalog/odczyt';
import type { DataISO, Grosze, IdWpisuSlownika, Katalog, WpisSlownika } from '@/domena/typy';

export interface OpisWpisu {
  id: IdWpisuSlownika;
  domyslna: Grosze;
}

export const WPISY_KALENDARZA = {
  swiadczenieWychowawcze: { id: ID_KWOT.swiadczenieWychowawcze, domyslna: 80000 },
  becikowe: { id: ID_KWOT.becikowe, domyslna: 100000 },
  progBecikowego: { id: ID_KWOT.progBecikowego, domyslna: 192200 },
  dodatek: { id: ID_KWOT.dodatekZTytuluUrodzenia, domyslna: 100000 },
  progZasilkuRodzinnego: { id: ID_KWOT.progZasilkuRodzinnego, domyslna: 67400 },
  swiadczenieRodzicielskie: { id: ID_KWOT.swiadczenieRodzicielskie, domyslna: 100000 },
  zaZyciem: { id: ID_KWOT.swiadczenieZaZyciem, domyslna: 400000 },
  aktywnieWDomu: { id: ID_KWOT.aktywnyRodzicWDomu, domyslna: 50000 },
} as const satisfies Record<string, OpisWpisu>;

export type KluczWpisuKalendarza = keyof typeof WPISY_KALENDARZA;

// Wariant kwoty we wpisach słownika kwot i progów.
const WARIANT_KWOTY = 'kwota';

/** Kwota wariantu `kwota` wpisu słownika kwot i progów w groszach obowiązująca w dniu `dzien`; null, gdy brak wartości. */
export function kwotaWpisuSlownika(katalog: Katalog, idWpisu: IdWpisuSlownika, dzien: DataISO): Grosze | null {
  return wartoscObowiazujaca(katalog, idWpisu, dzien, WARIANT_KWOTY)?.wartosc ?? null;
}

/**
 * Kwota w groszach obowiązująca w dniu `dzien` z wpisu `idWpisu` (koszt spóźnienia pozycji katalogu),
 * a gdy go brak, z wpisu kalendarza `klucz`; bez wartości w słowniku kwota z reguł terminów Story.
 */
export function kwotaZeSlownika(
  katalog: Katalog,
  klucz: KluczWpisuKalendarza,
  dzien: DataISO,
  idWpisu?: IdWpisuSlownika,
): Grosze {
  const opis: OpisWpisu = WPISY_KALENDARZA[klucz];
  const zWpisuPozycji = idWpisu !== undefined ? kwotaWpisuSlownika(katalog, idWpisu, dzien) : null;
  return zWpisuPozycji ?? kwotaWpisuSlownika(katalog, opis.id, dzien) ?? opis.domyslna;
}

const WYMIAR_URLOPU_MACIERZYNSKIEGO = [20, 31, 33, 35, 37] as const;

/** Wartości wariantów wpisu obowiązujące w dniu `dzien` w kolejności wariantów; null, gdy brak wersji. */
function wartosciWDniu(wpis: WpisSlownika, dzien: DataISO): number[] | null {
  const wersje = wpis.wersje
    .filter((w) => w.od <= dzien && (w.do === undefined || dzien <= w.do))
    .sort((a, b) => (a.od < b.od ? 1 : a.od > b.od ? -1 : 0));
  const wersja = wersje[0];
  if (!wersja) return null;
  const klucze = wpis.warianty.length > 0 ? wpis.warianty.map((w) => w.klucz) : Object.keys(wersja.wartosci);
  return klucze.map((k) => wersja.wartosci[k]).filter((v): v is number => typeof v === 'number');
}

/** Wymiar urlopu macierzyńskiego w tygodniach według liczby dzieci urodzonych przy jednym porodzie. */
export function wymiarUrlopuMacierzynskiego(katalog: Katalog, liczbaDzieci: number, dzien: DataISO, idWpisu?: IdWpisuSlownika): number {
  const indeks = Math.min(Math.max(liczbaDzieci, 1), 5) - 1;
  const wpis =
    (idWpisu ? katalog.slowniki.find((w) => w.id === idWpisu) : undefined) ??
    katalog.slowniki.find((w) => w.id === 'urlop-macierzynski') ??
    katalog.slowniki.find((w) => w.nazwa.toLowerCase() === 'urlop macierzyński');
  const wartosci = wpis ? wartosciWDniu(wpis, dzien) : null;
  const wartosc = wartosci?.[indeks];
  return typeof wartosc === 'number' && wartosc > 0 ? wartosc : WYMIAR_URLOPU_MACIERZYNSKIEGO[indeks];
}
