// Odczyt wartości słownika kwot i progów oraz słownika wymiarów i okresów dla kalkulatora zasiłku macierzyńskiego.
// Właściciel: u09 (Silnik kalkulatora zasiłku macierzyńskiego).
// Kalkulator stosuje wartość obowiązującą w dniu porodu, przewidywanego terminu porodu albo przyjęcia dziecka.
// Wpis szuka po identyfikatorze, a potem po nazwie wpisu z Katalogu świadczeń; wariant po kluczu, a potem po kolejności.
// Gdy katalog nie ma wpisu, kalkulator stosuje wartość z kolumny „domyslna” (stan katalogu z dnia uruchomienia).
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
  stawka100: def('zasilek-macierzynski-wariant-100-i-70', 'Zasiłek macierzyński, wariant 100% i 70%', KWOTY, ['100', 'stawka-100', 'macierzynski'], 0, 100, 'procent'),
  stawka70: def('zasilek-macierzynski-wariant-100-i-70', 'Zasiłek macierzyński, wariant 100% i 70%', KWOTY, ['70', 'stawka-70', 'rodzicielski'], 1, 70, 'procent'),
  stawka815: def('zasilek-macierzynski-wariant-81-5', 'Zasiłek macierzyński, wariant 81,5%', KWOTY, ['81-5', 'stawka-81-5', 'macierzynski-i-rodzicielski'], 0, 81.5, 'procent', '2026-01-01'),
  stawka815DrugiRodzic: def('zasilek-macierzynski-wariant-81-5', 'Zasiłek macierzyński, wariant 81,5%', KWOTY, ['70', 'drugi-rodzic', '9-tygodni-drugiego-rodzica'], 1, 70, 'procent', '2026-01-01'),
  swiadczenieRodzicielskie: def('swiadczenie-rodzicielskie', 'Świadczenie rodzicielskie', KWOTY, ['miesiecznie', 'kwota'], 0, 1000, 'zl'),
  minimalneWynagrodzenie: def('minimalne-wynagrodzenie', 'Minimalne wynagrodzenie', KWOTY, ['miesiecznie', 'kwota'], 0, 4806, 'zl'),
  pomniejszenie: def('pomniejszenie-podstawy-wymiaru-o-skladki', 'Pomniejszenie podstawy wymiaru o składki', KWOTY, ['procent', 'pomniejszenie'], 0, 13.71, 'procent'),
  minimalnaPodstawaPracownika: def('minimalna-podstawa-wymiaru-zasilku-pracownika', 'Minimalna podstawa wymiaru zasiłku pracownika na pełnym etacie', KWOTY, ['kwota', 'miesiecznie'], 0, 4147.1, 'zl'),
  najnizszaPodstawaDzialalnosci: def('najnizsza-podstawa-wymiaru-skladek-dzialalnosci', 'Najniższa podstawa wymiaru składek osoby prowadzącej pozarolniczą działalność', KWOTY, ['miesiecznie', 'kwota'], 0, 5652, 'zl'),
  urlopMacierzynski1: def('urlop-macierzynski', 'Urlop macierzyński', WYMIARY, ['1', '1-dziecko'], 0, 20, 'tygodnie'),
  urlopMacierzynski2: def('urlop-macierzynski', 'Urlop macierzyński', WYMIARY, ['2', '2-dzieci'], 1, 31, 'tygodnie'),
  urlopMacierzynski3: def('urlop-macierzynski', 'Urlop macierzyński', WYMIARY, ['3', '3-dzieci'], 2, 33, 'tygodnie'),
  urlopMacierzynski4: def('urlop-macierzynski', 'Urlop macierzyński', WYMIARY, ['4', '4-dzieci'], 3, 35, 'tygodnie'),
  urlopMacierzynski5: def('urlop-macierzynski', 'Urlop macierzyński', WYMIARY, ['5', '5-dzieci', '5-i-wiecej'], 4, 37, 'tygodnie'),
  czescPrzedPorodem: def('czesc-urlopu-macierzynskiego-przed-porodem', 'Część urlopu macierzyńskiego przed porodem', WYMIARY, ['tygodnie', 'najwyzej'], 0, 6, 'tygodnie'),
  urlopPoStracieTygodnie: def('urlop-macierzynski-po-stracie-dziecka', 'Urlop macierzyński po urodzeniu martwego dziecka albo zgonie dziecka', WYMIARY, ['tygodnie', 'po-porodzie'], 0, 8, 'tygodnie'),
  urlopPoStracieDni: def('urlop-macierzynski-po-stracie-dziecka', 'Urlop macierzyński po urodzeniu martwego dziecka albo zgonie dziecka', WYMIARY, ['dni', 'od-zgonu'], 1, 7, 'dni'),
  uzupelniajacyDo28: def('uzupelniajacy-urlop-macierzynski', 'Uzupełniający urlop macierzyński', WYMIARY, ['do-28-tygodnia', 'tygodnie-a'], 0, 15, 'tygodnie'),
  uzupelniajacyPozostale: def('uzupelniajacy-urlop-macierzynski', 'Uzupełniający urlop macierzyński', WYMIARY, ['pozostale', 'tygodnie-b'], 1, 8, 'tygodnie'),
  naWarunkach1: def('urlop-na-warunkach-urlopu-macierzynskiego', 'Urlop na warunkach urlopu macierzyńskiego', WYMIARY, ['1', '1-dziecko'], 0, 20, 'tygodnie'),
  naWarunkach2: def('urlop-na-warunkach-urlopu-macierzynskiego', 'Urlop na warunkach urlopu macierzyńskiego', WYMIARY, ['2', '2-dzieci'], 1, 31, 'tygodnie'),
  naWarunkach3: def('urlop-na-warunkach-urlopu-macierzynskiego', 'Urlop na warunkach urlopu macierzyńskiego', WYMIARY, ['3', '3-dzieci'], 2, 33, 'tygodnie'),
  naWarunkach4: def('urlop-na-warunkach-urlopu-macierzynskiego', 'Urlop na warunkach urlopu macierzyńskiego', WYMIARY, ['4', '4-dzieci'], 3, 35, 'tygodnie'),
  naWarunkach5: def('urlop-na-warunkach-urlopu-macierzynskiego', 'Urlop na warunkach urlopu macierzyńskiego', WYMIARY, ['5', '5-dzieci', '5-i-wiecej'], 4, 37, 'tygodnie'),
  naWarunkachMinimum: def('urlop-na-warunkach-urlopu-macierzynskiego', 'Urlop na warunkach urlopu macierzyńskiego', WYMIARY, ['minimum', 'co-najmniej'], 5, 9, 'tygodnie'),
  wiekRodzinaZastepcza: def('wiek-dziecka-urlop-na-warunkach', 'Wiek dziecka uprawniający do urlopu na warunkach urlopu macierzyńskiego', WYMIARY, ['rodzina-zastepcza-niezawodowa', 'rzn'], 0, 7, 'lata'),
  wiekOdroczenie: def('wiek-dziecka-urlop-na-warunkach', 'Wiek dziecka uprawniający do urlopu na warunkach urlopu macierzyńskiego', WYMIARY, ['odroczenie', 'odroczony-obowiazek-szkolny'], 1, 10, 'lata'),
  wiekPrzysposobienie: def('wiek-dziecka-urlop-na-warunkach', 'Wiek dziecka uprawniający do urlopu na warunkach urlopu macierzyńskiego', WYMIARY, ['przysposobienie'], 2, 14, 'lata'),
  rodzicielski1: def('urlop-rodzicielski', 'Urlop rodzicielski', WYMIARY, ['1-dziecko', '1'], 0, 41, 'tygodnie', '2026-01-01'),
  rodzicielskiWiecej: def('urlop-rodzicielski', 'Urlop rodzicielski', WYMIARY, ['wiecej-niz-1', 'wiecej'], 1, 43, 'tygodnie', '2026-01-01'),
  rodzicielskiZaZyciem1: def('urlop-rodzicielski', 'Urlop rodzicielski', WYMIARY, ['za-zyciem-1', '1-za-zyciem'], 2, 65, 'tygodnie', '2026-01-01'),
  rodzicielskiZaZyciemWiecej: def('urlop-rodzicielski', 'Urlop rodzicielski', WYMIARY, ['za-zyciem-wiecej', 'wiecej-za-zyciem'], 3, 67, 'tygodnie', '2026-01-01'),
  rodzicielskiPoWieku: def('urlop-rodzicielski', 'Urlop rodzicielski', WYMIARY, ['po-9-tygodniach', 'po-urlopie-na-warunkach'], 4, 38, 'tygodnie', '2026-01-01'),
  rodzicielskiPoWiekuZaZyciem: def('urlop-rodzicielski', 'Urlop rodzicielski', WYMIARY, ['po-9-tygodniach-za-zyciem', 'po-urlopie-na-warunkach-za-zyciem'], 5, 62, 'tygodnie', '2026-01-01'),
  nieprzenoszalna: def('nieprzenoszalna-czesc-urlopu-rodzicielskiego', 'Nieprzenoszalna część urlopu rodzicielskiego', WYMIARY, ['tygodnie', 'kazdy-rodzic'], 0, 9, 'tygodnie'),
  liczbaCzesci: def('liczba-czesci-urlopu-rodzicielskiego', 'Liczba części urlopu rodzicielskiego', WYMIARY, ['czesci', 'najwyzej'], 0, 5, 'czesci'),
  wykorzystanieRodzicielskiego: def('wykorzystanie-urlopu-rodzicielskiego', 'Wykorzystanie urlopu rodzicielskiego', WYMIARY, ['lata', 'do-roku'], 0, 6, 'lata'),
  laczenieWymiarPracy: def('urlop-rodzicielski-przy-laczeniu-z-praca', 'Urlop rodzicielski przy łączeniu z pracą', WYMIARY, ['wymiar-pracy', 'procent-etatu'], 0, 50, 'procent-etatu'),
  laczenie1: def('urlop-rodzicielski-przy-laczeniu-z-praca', 'Urlop rodzicielski przy łączeniu z pracą', WYMIARY, ['1-dziecko', '1'], 1, 82, 'tygodnie'),
  laczenieWiecej: def('urlop-rodzicielski-przy-laczeniu-z-praca', 'Urlop rodzicielski przy łączeniu z pracą', WYMIARY, ['wiecej-niz-1', 'wiecej'], 2, 86, 'tygodnie'),
  laczenieZaZyciem1: def('urlop-rodzicielski-przy-laczeniu-z-praca', 'Urlop rodzicielski przy łączeniu z pracą', WYMIARY, ['za-zyciem-1'], 3, 130, 'tygodnie'),
  laczenieZaZyciemWiecej: def('urlop-rodzicielski-przy-laczeniu-z-praca', 'Urlop rodzicielski przy łączeniu z pracą', WYMIARY, ['za-zyciem-wiecej'], 4, 134, 'tygodnie'),
  ojcowskiDni: def('urlop-ojcowski', 'Urlop ojcowski', WYMIARY, ['dni', 'wymiar'], 0, 14, 'dni'),
  ojcowskiMiesiace: def('urlop-ojcowski', 'Urlop ojcowski', WYMIARY, ['miesiace', 'do-ukonczenia'], 2, 12, 'miesiace'),
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

/** Kwota parametru w groszach (wartości słownika kwot są w złotych). */
export function kwotaParametru(k: Katalog, klucz: KluczParametru, dzien: DataISO): number {
  return Math.round(parametr(k, klucz, dzien).wartosc * 100);
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
    return Math.round(this.wez(klucz) * 100);
  }

  lista() {
    return [...this.wpisy.values()];
  }
}
