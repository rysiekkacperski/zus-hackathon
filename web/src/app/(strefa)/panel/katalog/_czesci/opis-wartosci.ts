// Opisy wartości wpisów słowników katalogu dla ViewCatalogList i ViewCatalogValueEdit.
// Szablon opisu wpisu (WpisSlownika.szablonOpisu) zawiera znaczniki {klucz} albo {{klucz}} z kluczem wariantu:
// kwota trafia do opisu jako „800,00 zł”, stawka jako „81,5%”, a wymiar jako sama liczba („41”).
// Szablon bez znaczników opisuje pierwszą wersję wpisu, a kolejne wersje dostają opis z wartości wariantów.
import { wartoscObowiazujaca } from '@/domena/katalog/odczyt';
import { rodzajPolaWariantu, wersjeRosnaco, wersjaObowiazujacaWpisu } from '@/domena/katalog/edycja';
import type { DataISO, JednostkaWariantu, Katalog, WariantWpisu, WersjaWpisu, WpisSlownika } from '@/domena/typy';
import { formatujDate, formatujKwote, formatujLiczbe, formatujProcent } from '@/komponenty/format';
import { teksty } from '@/teksty';

const ZNACZNIK = /\{\{?\s*([A-Za-z0-9_-]+)\s*\}?\}/g;

type JednostkaOdmieniana = keyof typeof teksty.ViewCatalogList.etykiety.jednostki;

function formaLiczebnika(liczba: number): 0 | 1 | 2 {
  if (!Number.isInteger(liczba)) return 1;
  if (liczba === 1) return 0;
  const jednosci = liczba % 10;
  const dziesiatki = liczba % 100;
  return jednosci >= 2 && jednosci <= 4 && (dziesiatki < 12 || dziesiatki > 14) ? 1 : 2;
}

/** Wartość z jednostką: „850,00 zł”, „81,5%”, „41 tygodni”, „14 dni”. */
export function formatujWartosc(wartosc: number, jednostka: JednostkaWariantu): string {
  const etykiety = teksty.ViewCatalogList.etykiety;
  if (jednostka === 'zl') return formatujKwote(wartosc);
  if (jednostka === 'procent') return formatujProcent(wartosc);
  if (jednostka === 'procent-etatu') return etykiety.procentEtatu({ wartosc: formatujProcent(wartosc) });
  const formy = etykiety.jednostki[jednostka as JednostkaOdmieniana];
  return `${formatujLiczbe(wartosc)} ${formy[formaLiczebnika(wartosc)]}`;
}

/** Wartość do wstawienia w szablon opisu: kwota i stawka z jednostką, wymiar jako liczba. */
function wartoscWSzablonie(wartosc: number, jednostka: JednostkaWariantu): string {
  return rodzajPolaWariantu(jednostka) === 'wymiar' ? formatujLiczbe(wartosc) : formatujWartosc(wartosc, jednostka);
}

/** Wartość wariantu wyprowadzonego z innego wpisu w dniu `dzien` (np. minimalna podstawa wymiaru zasiłku). */
function wartoscWyprowadzona(katalog: Katalog, wariant: WariantWpisu, dzien: DataISO): number | null {
  const zrodlo = wariant.wyprowadzony;
  if (zrodlo === undefined) return null;
  const wpisZrodla = katalog.slowniki.find((w) => w.id === zrodlo.zWpisu);
  const wersjaZrodla = wpisZrodla ? wersjaObowiazujacaWpisu(wpisZrodla, dzien) : null;
  const podstawa = wersjaZrodla?.wartosci[zrodlo.zWariantu];
  if (podstawa === undefined) return null;
  const pomnozona = podstawa * (zrodlo.mnoznik ?? 1);
  const wynik =
    zrodlo.pomniejszenieProcent === undefined
      ? pomnozona
      : pomnozona - Math.round((pomnozona * zrodlo.pomniejszenieProcent) / 100);
  return wariant.jednostka === 'zl' ? Math.round(wynik) : wynik;
}

/** Wartości wszystkich wariantów wersji; warianty wyprowadzone liczy katalog w dniu początku wersji. */
export function wartosciWersji(
  katalog: Katalog,
  wpis: WpisSlownika,
  wersja: WersjaWpisu,
  dzis: DataISO,
): Record<string, number> {
  const dzien = wersja.od > dzis ? wersja.od : dzis;
  const wynik: Record<string, number> = {};
  for (const wariant of wpis.warianty) {
    const zapisana = wersja.wartosci[wariant.klucz];
    if (zapisana !== undefined) {
      wynik[wariant.klucz] = zapisana;
      continue;
    }
    const zKatalogu = wariant.wyprowadzony ? wartoscObowiazujaca(katalog, wpis.id, dzien, wariant.klucz) : null;
    const wartosc = zKatalogu?.wartosc ?? wartoscWyprowadzona(katalog, wariant, dzien);
    if (wartosc !== null) wynik[wariant.klucz] = wartosc;
  }
  return wynik;
}

/** Opis wersji wpisu w tabelach katalogu, np. „800,00 zł miesięcznie na dziecko”. */
export function opisWersji(katalog: Katalog, wpis: WpisSlownika, wersja: WersjaWpisu, dzis: DataISO): string {
  const wartosci = wartosciWersji(katalog, wpis, wersja, dzis);
  const warianty = new Map(wpis.warianty.map((w) => [w.klucz, w]));
  const szablon = wpis.szablonOpisu.trim();

  if (szablon !== '' && new RegExp(ZNACZNIK.source).test(szablon)) {
    return szablon.replace(ZNACZNIK, (calosc, klucz: string) => {
      const wariant = warianty.get(klucz);
      const wartosc = wartosci[klucz];
      return wariant && wartosc !== undefined ? wartoscWSzablonie(wartosc, wariant.jednostka) : calosc;
    });
  }
  const pierwsza = wersjeRosnaco(wpis)[0];
  if (szablon !== '' && pierwsza !== undefined && pierwsza.od === wersja.od) return szablon;

  const czesci = wpis.warianty
    .filter((w) => wartosci[w.klucz] !== undefined)
    .map((w) => ({ etykieta: w.etykieta, tekst: formatujWartosc(wartosci[w.klucz], w.jednostka) }));
  if (czesci.length === 1) return czesci[0].tekst;
  return czesci.map((c) => `${c.etykieta}: ${c.tekst}`).join('; ');
}

/** Okres obowiązywania wersji: „od 01.01.2024” albo „od 01.01.2024” i „do 31.12.2027”. */
export function okresWersji(wersja: WersjaWpisu): { od: string; do?: string } {
  const t = teksty.ViewCatalogList;
  return {
    od: t.okresOd({ data: formatujDate(wersja.od) }),
    do: wersja.do === undefined ? undefined : t.okresDo({ data: formatujDate(wersja.do) }),
  };
}
