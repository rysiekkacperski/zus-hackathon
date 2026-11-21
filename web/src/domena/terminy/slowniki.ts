// Odczyt kwot, progów i wymiarów ze słowników Katalogu świadczeń na potrzeby Kalendarza terminów. Właściciel: u13.
// Wpis odszukujemy po identyfikatorze, a gdy go brak, po nazwie wpisu. Wartość obowiązuje w dniu `dzien`
// (od ≤ dzien ≤ do). Gdy słownik nie zawiera wpisu, stosujemy wartość z reguł terminów Story.
import type { DataISO, Grosze, IdWpisuSlownika, Katalog, WpisSlownika } from '@/domena/typy';

export interface OpisWpisu {
  kandydaci: IdWpisuSlownika[];
  nazwa: string[];
  wyklucz?: string[];
  domyslna: number; // w złotych albo w jednostce wpisu
}

export const WPISY_KALENDARZA = {
  swiadczenieWychowawcze: { kandydaci: ['swiadczenie-wychowawcze', 'swiadczenie-wychowawcze-800-plus', '800-plus'], nazwa: ['wychowawcze'], domyslna: 800 },
  becikowe: { kandydaci: ['becikowe'], nazwa: ['becikowe'], wyklucz: ['próg', 'prog'], domyslna: 1000 },
  progBecikowego: { kandydaci: ['prog-becikowego'], nazwa: ['próg becikowego'], domyslna: 1922 },
  dodatek: { kandydaci: ['dodatek-z-tytulu-urodzenia-dziecka', 'dodatek-z-tytulu-urodzenia', 'dodatek-urodzenie'], nazwa: ['dodatek z tytułu urodzenia'], domyslna: 1000 },
  progZasilkuRodzinnego: { kandydaci: ['prog-zasilku-rodzinnego'], nazwa: ['próg zasiłku rodzinnego'], domyslna: 674 },
  swiadczenieRodzicielskie: { kandydaci: ['swiadczenie-rodzicielskie'], nazwa: ['świadczenie rodzicielskie'], domyslna: 1000 },
  zaZyciem: { kandydaci: ['swiadczenie-za-zyciem', 'za-zyciem'], nazwa: ['za życiem'], domyslna: 4000 },
  aktywnieWDomu: { kandydaci: ['aktywny-rodzic-aktywnie-w-domu', 'aktywnie-w-domu'], nazwa: ['aktywnie w domu'], domyslna: 500 },
} as const satisfies Record<string, OpisWpisu>;

export type KluczWpisuKalendarza = keyof typeof WPISY_KALENDARZA;

const WYMIAR_URLOPU_MACIERZYNSKIEGO = [20, 31, 33, 35, 37] as const;

function znajdzWpis(katalog: Katalog, opis: OpisWpisu, dodatkowyId?: IdWpisuSlownika): WpisSlownika | undefined {
  const ids = dodatkowyId ? [dodatkowyId, ...opis.kandydaci] : opis.kandydaci;
  for (const id of ids) {
    const wpis = katalog.slowniki.find((w) => w.id === id);
    if (wpis) return wpis;
  }
  return katalog.slowniki.find((w) => {
    const nazwa = w.nazwa.toLowerCase();
    return opis.nazwa.every((t) => nazwa.includes(t)) && !(opis.wyklucz ?? []).some((t) => nazwa.includes(t));
  });
}

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

/** Kwota wpisu słownika kwot w groszach obowiązująca w dniu `dzien` (pierwszy wariant). */
export function kwotaZeSlownika(
  katalog: Katalog,
  klucz: KluczWpisuKalendarza,
  dzien: DataISO,
  idWpisu?: IdWpisuSlownika,
): Grosze {
  const opis: OpisWpisu = WPISY_KALENDARZA[klucz];
  const wpis = znajdzWpis(katalog, opis, idWpisu);
  const wartosc = wpis ? wartosciWDniu(wpis, dzien)?.[0] : undefined;
  if (wartosc === undefined) return Math.round(opis.domyslna * 100);
  // Słownik zapisuje kwoty w złotych; wartość wielokrotnie większa od kwoty z reguł traktujemy jako grosze.
  return wartosc > opis.domyslna * 20 ? Math.round(wartosc) : Math.round(wartosc * 100);
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
