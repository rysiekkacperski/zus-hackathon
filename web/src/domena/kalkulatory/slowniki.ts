// Odczyt wartości słownika kwot i progów oraz słownika wymiarów i okresów dla kalkulatora zasiłku macierzyńskiego.
// Właściciel: u09 (Silnik kalkulatora zasiłku macierzyńskiego).
// Kalkulator stosuje wartość obowiązującą w dniu porodu, przewidywanego terminu porodu albo przyjęcia dziecka.
// Wpis szuka po identyfikatorze, a potem po nazwie wpisu z Katalogu świadczeń; wariant po kluczu, a potem po kolejności.
// Gdy katalog nie ma wpisu, kalkulator stosuje wartość z kolumny „domyslna” (stan katalogu z dnia uruchomienia).
// Identyfikatory i klucze wariantów odpowiadają ID_KWOT i ID_WYMIAROW z dane/katalog; kwoty ('zl') są w groszach.
import { wartoscObowiazujaca } from '@/domena/katalog/odczyt';
import type { DataISO, IdWpisuSlownika, JednostkaWariantu, Katalog, RodzajSlownika } from '@/domena/typy';

export interface DefinicjaParametru {
  idWpisu: IdWpisuSlownika;
  nazwaWpisu: string;
  slownik: RodzajSlownika;
  klucze: string[];
  indeksWariantu: number;
  domyslna: number;
  jednostka: JednostkaWariantu;
  od?: DataISO;
}

export interface WartoscParametru {
  wartosc: number;
  od: DataISO;
  idWpisu: IdWpisuSlownika;
  nazwa: string;
  jednostka: JednostkaWariantu;
}

function def(
  idWpisu: string,
  nazwaWpisu: string,
  slownik: RodzajSlownika,
  klucze: string[],
  indeksWariantu: number,
  domyslna: number,
  jednostka: JednostkaWariantu,
  od?: DataISO,
): DefinicjaParametru {
  return { idWpisu, nazwaWpisu, slownik, klucze, indeksWariantu, domyslna, jednostka, od };
}

const KWOTY: RodzajSlownika = 'kwoty-i-progi';
const WYMIARY: RodzajSlownika = 'wymiary-i-okresy';

export const PARAMETRY = {
  stawka100: def('zasilek-macierzynski-wariant-100-70', 'Zasiłek macierzyński, wariant 100% i 70%', KWOTY, ['macierzynski', '100'], 0, 100, 'procent'),
  stawka70: def('zasilek-macierzynski-wariant-100-70', 'Zasiłek macierzyński, wariant 100% i 70%', KWOTY, ['rodzicielski', '70'], 1, 70, 'procent'),
  stawka815: def('zasilek-macierzynski-wariant-81-5', 'Zasiłek macierzyński, wariant 81,5%', KWOTY, ['stawka', '81-5'], 0, 81.5, 'procent', '2026-01-01'),
  stawka815DrugiRodzic: def('zasilek-macierzynski-wariant-81-5', 'Zasiłek macierzyński, wariant 81,5%', KWOTY, ['drugiRodzic', '70'], 1, 70, 'procent', '2026-01-01'),
  swiadczenieRodzicielskie: def('swiadczenie-rodzicielskie', 'Świadczenie rodzicielskie', KWOTY, ['kwota'], 0, 100000, 'zl'),
  minimalneWynagrodzenie: def('minimalne-wynagrodzenie', 'Minimalne wynagrodzenie', KWOTY, ['kwota'], 0, 480600, 'zl'),
  pomniejszenie: def('pomniejszenie-podstawy-wymiaru-o-skladki', 'Pomniejszenie podstawy wymiaru o składki', KWOTY, ['procent'], 0, 13.71, 'procent'),
  minimalnaPodstawaPracownika: def('minimalna-podstawa-wymiaru-zasilku-pelny-etat', 'Minimalna podstawa wymiaru zasiłku pracownika na pełnym etacie', KWOTY, ['kwota'], 0, 414710, 'zl'),
  najnizszaPodstawaDzialalnosci: def('najnizsza-podstawa-wymiaru-skladek-jdg', 'Najniższa podstawa wymiaru składek osoby prowadzącej pozarolniczą działalność', KWOTY, ['kwota'], 0, 565200, 'zl'),
  urlopMacierzynski1: def('urlop-macierzynski', 'Urlop macierzyński', WYMIARY, ['jednoDziecko'], 0, 20, 'tygodnie'),
  urlopMacierzynski2: def('urlop-macierzynski', 'Urlop macierzyński', WYMIARY, ['dwojeDzieci'], 1, 31, 'tygodnie'),
  urlopMacierzynski3: def('urlop-macierzynski', 'Urlop macierzyński', WYMIARY, ['trojeDzieci'], 2, 33, 'tygodnie'),
  urlopMacierzynski4: def('urlop-macierzynski', 'Urlop macierzyński', WYMIARY, ['czworoDzieci'], 3, 35, 'tygodnie'),
  urlopMacierzynski5: def('urlop-macierzynski', 'Urlop macierzyński', WYMIARY, ['piecioroDzieci'], 4, 37, 'tygodnie'),
  czescPrzedPorodem: def('czesc-urlopu-macierzynskiego-przed-porodem', 'Część urlopu macierzyńskiego przed porodem', WYMIARY, ['tygodnie'], 0, 6, 'tygodnie'),
  urlopPoStracieTygodnie: def('urlop-macierzynski-po-urodzeniu-martwego-dziecka-albo-zgonie', 'Urlop macierzyński po urodzeniu martwego dziecka albo zgonie dziecka', WYMIARY, ['poPorodzie'], 0, 8, 'tygodnie'),
  urlopPoStracieDni: def('urlop-macierzynski-po-urodzeniu-martwego-dziecka-albo-zgonie', 'Urlop macierzyński po urodzeniu martwego dziecka albo zgonie dziecka', WYMIARY, ['odZgonu'], 1, 7, 'dni'),
  uzupelniajacyDo28: def('uzupelniajacy-urlop-macierzynski', 'Uzupełniający urlop macierzyński', WYMIARY, ['przedwczesnyPorod'], 0, 15, 'tygodnie'),
  uzupelniajacyPozostale: def('uzupelniajacy-urlop-macierzynski', 'Uzupełniający urlop macierzyński', WYMIARY, ['pozostale'], 3, 8, 'tygodnie'),
  naWarunkach1: def('urlop-na-warunkach-urlopu-macierzynskiego', 'Urlop na warunkach urlopu macierzyńskiego', WYMIARY, ['jednoDziecko'], 0, 20, 'tygodnie'),
  naWarunkach2: def('urlop-na-warunkach-urlopu-macierzynskiego', 'Urlop na warunkach urlopu macierzyńskiego', WYMIARY, ['dwojeDzieci'], 1, 31, 'tygodnie'),
  naWarunkach3: def('urlop-na-warunkach-urlopu-macierzynskiego', 'Urlop na warunkach urlopu macierzyńskiego', WYMIARY, ['trojeDzieci'], 2, 33, 'tygodnie'),
  naWarunkach4: def('urlop-na-warunkach-urlopu-macierzynskiego', 'Urlop na warunkach urlopu macierzyńskiego', WYMIARY, ['czworoDzieci'], 3, 35, 'tygodnie'),
  naWarunkach5: def('urlop-na-warunkach-urlopu-macierzynskiego', 'Urlop na warunkach urlopu macierzyńskiego', WYMIARY, ['piecioroDzieci'], 4, 37, 'tygodnie'),
  naWarunkachMinimum: def('urlop-na-warunkach-urlopu-macierzynskiego', 'Urlop na warunkach urlopu macierzyńskiego', WYMIARY, ['minimum'], 5, 9, 'tygodnie'),
  wiekRodzinaZastepcza: def('wiek-dziecka-urlop-na-warunkach-urlopu-macierzynskiego', 'Wiek dziecka uprawniający do urlopu na warunkach urlopu macierzyńskiego', WYMIARY, ['rodzinaZastepczaNiezawodowa'], 0, 7, 'lata'),
  wiekOdroczenie: def('wiek-dziecka-urlop-na-warunkach-urlopu-macierzynskiego', 'Wiek dziecka uprawniający do urlopu na warunkach urlopu macierzyńskiego', WYMIARY, ['odroczonyObowiazekSzkolny'], 1, 10, 'lata'),
  wiekPrzysposobienie: def('wiek-dziecka-urlop-na-warunkach-urlopu-macierzynskiego', 'Wiek dziecka uprawniający do urlopu na warunkach urlopu macierzyńskiego', WYMIARY, ['przysposobienie'], 2, 14, 'lata'),
  rodzicielski1: def('urlop-rodzicielski', 'Urlop rodzicielski', WYMIARY, ['jednoDziecko'], 0, 41, 'tygodnie', '2026-01-01'),
  rodzicielskiWiecej: def('urlop-rodzicielski', 'Urlop rodzicielski', WYMIARY, ['wiecejDzieci'], 1, 43, 'tygodnie', '2026-01-01'),
  rodzicielskiZaZyciem1: def('urlop-rodzicielski', 'Urlop rodzicielski', WYMIARY, ['jednoDzieckoZaZyciem'], 2, 65, 'tygodnie', '2026-01-01'),
  rodzicielskiZaZyciemWiecej: def('urlop-rodzicielski', 'Urlop rodzicielski', WYMIARY, ['wiecejDzieciZaZyciem'], 3, 67, 'tygodnie', '2026-01-01'),
  rodzicielskiPoWieku: def('urlop-rodzicielski', 'Urlop rodzicielski', WYMIARY, ['poUrlopieNaWarunkach'], 4, 38, 'tygodnie', '2026-01-01'),
  rodzicielskiPoWiekuZaZyciem: def('urlop-rodzicielski', 'Urlop rodzicielski', WYMIARY, ['poUrlopieNaWarunkachZaZyciem'], 5, 62, 'tygodnie', '2026-01-01'),
  nieprzenoszalna: def('nieprzenoszalna-czesc-urlopu-rodzicielskiego', 'Nieprzenoszalna część urlopu rodzicielskiego', WYMIARY, ['tygodnie'], 0, 9, 'tygodnie'),
  liczbaCzesci: def('liczba-czesci-urlopu-rodzicielskiego', 'Liczba części urlopu rodzicielskiego', WYMIARY, ['czesci'], 0, 5, 'czesci'),
  wykorzystanieRodzicielskiego: def('wykorzystanie-urlopu-rodzicielskiego', 'Wykorzystanie urlopu rodzicielskiego', WYMIARY, ['lata'], 0, 6, 'lata'),
  laczenieWymiarPracy: def('urlop-rodzicielski-przy-laczeniu-z-praca', 'Urlop rodzicielski przy łączeniu z pracą', WYMIARY, ['wymiarPracy'], 0, 50, 'procent-etatu'),
  laczenie1: def('urlop-rodzicielski-przy-laczeniu-z-praca', 'Urlop rodzicielski przy łączeniu z pracą', WYMIARY, ['jednoDziecko'], 1, 82, 'tygodnie'),
  laczenieWiecej: def('urlop-rodzicielski-przy-laczeniu-z-praca', 'Urlop rodzicielski przy łączeniu z pracą', WYMIARY, ['wiecejDzieci'], 2, 86, 'tygodnie'),
  laczenieZaZyciem1: def('urlop-rodzicielski-przy-laczeniu-z-praca', 'Urlop rodzicielski przy łączeniu z pracą', WYMIARY, ['jednoDzieckoZaZyciem'], 3, 130, 'tygodnie'),
  laczenieZaZyciemWiecej: def('urlop-rodzicielski-przy-laczeniu-z-praca', 'Urlop rodzicielski przy łączeniu z pracą', WYMIARY, ['wiecejDzieciZaZyciem'], 4, 134, 'tygodnie'),
  ojcowskiDni: def('urlop-ojcowski', 'Urlop ojcowski', WYMIARY, ['dni'], 0, 14, 'dni'),
  ojcowskiMiesiace: def('urlop-ojcowski', 'Urlop ojcowski', WYMIARY, ['wiekDzieckaMiesiace'], 3, 12, 'miesiace'),
  terminWariantu815: def('termin-wniosku-w-wariancie-81-5', 'Termin wniosku w wariancie 81,5%', WYMIARY, ['dni'], 0, 21, 'dni'),
} as const satisfies Record<string, DefinicjaParametru>;

export type KluczParametru = keyof typeof PARAMETRY;

function wpisPoNazwie(k: Katalog, d: DefinicjaParametru) {
  const nazwa = d.nazwaWpisu.toLocaleLowerCase('pl');
  return k.slowniki.find((w) => w.id === d.idWpisu) ?? k.slowniki.find((w) => w.nazwa.toLocaleLowerCase('pl') === nazwa);
}

/** Wartość parametru kalkulatora obowiązująca w dniu `dzien`, z nazwą wpisu i datą początku obowiązywania. */
export function parametr(k: Katalog, klucz: KluczParametru, dzien: DataISO): WartoscParametru {
  const d: DefinicjaParametru = PARAMETRY[klucz];
  const wpis = wpisPoNazwie(k, d);
  if (wpis !== undefined) {
    const kluczeWpisu = wpis.warianty.map((w) => w.klucz);
    const wariant =
      d.klucze.find((kl) => kluczeWpisu.includes(kl)) ??
      (wpis.warianty.length === 1 ? kluczeWpisu[0] : kluczeWpisu[d.indeksWariantu]);
    if (wariant !== undefined) {
      const w = wartoscObowiazujaca(k, wpis.id, dzien, wariant);
      if (w !== null && Number.isFinite(w.wartosc)) {
        return { wartosc: w.wartosc, od: w.od, idWpisu: wpis.id, nazwa: w.nazwaWpisu || wpis.nazwa, jednostka: w.jednostka };
      }
    }
  }
  return {
    wartosc: d.domyslna,
    od: d.od ?? k.dataUruchomienia ?? '2026-01-01',
    idWpisu: wpis?.id ?? d.idWpisu,
    nazwa: wpis?.nazwa ?? d.nazwaWpisu,
    jednostka: d.jednostka,
  };
}

/** Kwota parametru w groszach (słownik kwot zapisuje kwoty o jednostce 'zl' w groszach). */
export function kwotaParametru(k: Katalog, klucz: KluczParametru, dzien: DataISO): number {
  return Math.round(parametr(k, klucz, dzien).wartosc);
}

/** Rejestr parametrów użytych w wyliczeniu, z którego powstaje lista zastosowanych reguł. */
export class RejestrRegul {
  private readonly wpisy = new Map<string, { opis: string; idWpisu: IdWpisuSlownika; wartosc: number; od: DataISO }>();

  constructor(
    private readonly katalog: Katalog,
    private readonly dzien: DataISO,
  ) {}

  /** Odczytuje parametr i zapisuje go jako zastosowaną regułę. */
  wez(klucz: KluczParametru): number {
    const w = parametr(this.katalog, klucz, this.dzien);
    const id = `${w.idWpisu}|${w.wartosc}`;
    if (!this.wpisy.has(id)) this.wpisy.set(id, { opis: w.nazwa, idWpisu: w.idWpisu, wartosc: w.wartosc, od: w.od });
    return w.wartosc;
  }

  /** Kwota parametru w groszach z zapisem reguły. */
  kwota(klucz: KluczParametru): number {
    return Math.round(this.wez(klucz));
  }

  lista() {
    return [...this.wpisy.values()];
  }
}
