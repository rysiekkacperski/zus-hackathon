// Wniosek ZAM przed porodem i przeliczenie po porodzie (kontrakt, sekcja 7.2).
// Właściciel: u33 (ZAM: wniosek dla płatnika, przed porodem i przy przyjęciu dziecka).
// Funkcje są czyste: datę „dzisiaj” dostają jako argument, wymiary czytają ze słownika wymiarów
// i okresów z wartością domyślną z historyjek, gdy słownik nie zawiera wpisu.
import { dodajDni, porownajDaty, maxData } from '@/domena/daty';
import { wartoscObowiazujaca } from '@/domena/katalog/odczyt';
import { walidujDateWZakresie, walidujPlik } from '@/domena/walidacje';
import type {
  BledyPol,
  DaneCiazyIDziecka,
  DataISO,
  Katalog,
  KodKomunikatu,
  LiczbaDzieci,
  Okres,
  OkresWniosku,
  OznaczenieSprawy,
  WniosekZam,
} from '@/domena/typy';

/** Najwcześniejszy początek zasiłku przed porodem: 6 tygodni (42 dni) przed przewidywanym terminem. */
export const DNI_PRZED_TERMINEM = 42;

/** Wymiar urlopu macierzyńskiego w tygodniach według liczby dzieci (1, 2, 3, 4, 5 i więcej). */
const WYMIAR_MACIERZYNSKIEGO_TYGODNI: Record<LiczbaDzieci, number> = { 1: 20, 2: 31, 3: 33, 4: 35, 5: 37 };

/** Wymiar urlopu rodzicielskiego wnioskodawcy (pełny wymiar pomniejszony o 9 tygodni drugiego rodzica). */
const RODZICIELSKI_WNIOSKODAWCY_TYGODNI = { jedno: 32, wiecej: 34, jednoZaZyciem: 56, wiecejZaZyciem: 58 } as const;

/** Identyfikator wpisu słownika wymiarów i okresów z wymiarem urlopu macierzyńskiego. */
export const WPIS_WYMIARU_MACIERZYNSKIEGO = 'urlop-macierzynski';

function liczbaDoKlucza(liczba: number): LiczbaDzieci {
  if (liczba >= 5) return 5;
  if (liczba <= 1) return 1;
  return liczba as LiczbaDzieci;
}

/** Tygodnie urlopu macierzyńskiego obowiązujące w dniu `dzien` dla liczby dzieci. */
export function wymiarMacierzynskiegoTygodni(liczba: number, katalog: Katalog | null, dzien: DataISO): number {
  const klucz = liczbaDoKlucza(liczba);
  if (katalog !== null) {
    const wartosc = wartoscObowiazujaca(katalog, WPIS_WYMIARU_MACIERZYNSKIEGO, dzien, String(klucz));
    if (wartosc !== null && wartosc.wartosc > 0) return wartosc.wartosc;
  }
  return WYMIAR_MACIERZYNSKIEGO_TYGODNI[klucz];
}

/** Liczba tygodni urlopu rodzicielskiego wnioskodawcy w wariancie z całym urlopem rodzicielskim. */
export function rodzicielskiWnioskodawcyTygodni(liczba: number, zaZyciem: boolean): number {
  if (liczba > 1) return zaZyciem ? RODZICIELSKI_WNIOSKODAWCY_TYGODNI.wiecejZaZyciem : RODZICIELSKI_WNIOSKODAWCY_TYGODNI.wiecej;
  return zaZyciem ? RODZICIELSKI_WNIOSKODAWCY_TYGODNI.jednoZaZyciem : RODZICIELSKI_WNIOSKODAWCY_TYGODNI.jedno;
}

/** Okres o długości `tygodnie` tygodni od dnia `od` (obie daty włącznie). */
export function okresTygodni(od: DataISO, tygodnie: number): Okres {
  return { od, do: dodajDni(od, tygodnie * 7 - 1) };
}

/** Wniosek przed porodem: przewidywany termin porodu bez potwierdzonej daty porodu. */
export function czyTrybPrzedPorodem(daneCiazy: DaneCiazyIDziecka | null | undefined): boolean {
  if (!daneCiazy) return false;
  return Boolean(daneCiazy.przewidywanyTerminPorodu) && !daneCiazy.dataPoroduPotwierdzona;
}

/** Pierwszy dzień, od którego matka może zacząć zasiłek przed porodem (parametr [data] komunikatu 0229). */
export function najwczesniejszyPoczatek(ptp: DataISO): DataISO {
  return dodajDni(ptp, -DNI_PRZED_TERMINEM);
}

/**
 * Zakres dnia początku zasiłku przed porodem: od dnia 42 dni przed przewidywanym terminem porodu,
 * nie wcześniej niż dzisiaj, do dnia poprzedzającego przewidywany termin porodu.
 */
export function zakresDniaPoczatku(ptp: DataISO, dzis: DataISO): Okres {
  return { od: maxData(najwczesniejszyPoczatek(ptp), dzis), do: dodajDni(ptp, -1) };
}

export type PolePoczatkuZasilku = 'dzienPoczatku' | 'zaswiadczenie';

export interface FormularzPoczatkuZasilku {
  dzienPoczatku: string;
  wymagaZaswiadczenia: boolean;
  maZaswiadczenie: boolean;
}

/** Walidacja ekranu ViewZamPrebirth: 0006, 0010, 0042 przy dniu początku, 0228 przy zaświadczeniu. */
export function walidujPoczatekZasilku(
  f: FormularzPoczatkuZasilku,
  ptp: DataISO,
  dzis: DataISO,
): { bledy: BledyPol<PolePoczatkuZasilku>; dzien?: DataISO } {
  const bledy: BledyPol<PolePoczatkuZasilku> = {};
  const zakres = zakresDniaPoczatku(ptp, dzis);
  const wynik = walidujDateWZakresie(f.dzienPoczatku, zakres, {
    pusta: '0006',
    format: '0010',
    zaWczesnie: '0042',
    zaPozno: '0042',
  });
  if ('kod' in wynik) bledy.dzienPoczatku = wynik.kod;
  if (f.wymagaZaswiadczenia && !f.maZaswiadczenie) bledy.zaswiadczenie = '0228';
  return 'data' in wynik ? { bledy, dzien: wynik.data } : { bledy };
}

const TYPY_Z_ROZSZERZENIA: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

/** Typ pliku z typu przeglądarki, a gdy przeglądarka go nie podała, z rozszerzenia nazwy. */
export function typPliku(p: { nazwa: string; typ: string }): string {
  if (p.typ) return p.typ;
  const rozszerzenie = p.nazwa.split('.').pop()?.toLowerCase() ?? '';
  return TYPY_Z_ROZSZERZENIA[rozszerzenie] ?? '';
}

/** Plik zaświadczenia lekarskiego: PDF, JPG albo PNG (0103) do 10 MB (0104). */
export function walidujPlikZaswiadczenia(p: { nazwa: string; typ: string; rozmiar: number }): '0103' | '0104' | null {
  return walidujPlik({ typ: typPliku(p), rozmiar: p.rozmiar });
}

/**
 * Okresy wniosku przed porodem liczone od dnia początku zasiłku: urlop macierzyński w wymiarze dla
 * liczby dzieci z ciąży, a w wariancie z całym urlopem rodzicielskim także urlop rodzicielski
 * wnioskodawcy bezpośrednio po nim, z zasiłkiem 81,5% za cały okres.
 */
export function okresyZamPrzedPorodem(
  w: { dzienPoczatku: DataISO; liczbaDzieci: number; wariant: 'caly-rodzicielski' | 'tylko-macierzynski'; zaZyciem: boolean },
  katalog: Katalog | null,
): OkresWniosku[] {
  const tygodnie = wymiarMacierzynskiegoTygodni(w.liczbaDzieci, katalog, w.dzienPoczatku);
  const macierzynski = okresTygodni(w.dzienPoczatku, tygodnie);
  const stawkaMacierzynskiego = w.wariant === 'caly-rodzicielski' ? 81.5 : 100;
  const okresy: OkresWniosku[] = [
    { rodzajUrlopu: 'macierzynski', ...macierzynski, tygodnie, stawka: stawkaMacierzynskiego, rodzic: 'matka' },
  ];
  if (w.wariant === 'caly-rodzicielski') {
    const tygodnieRodzicielskiego = rodzicielskiWnioskodawcyTygodni(w.liczbaDzieci, w.zaZyciem);
    okresy.push({
      rodzajUrlopu: 'rodzicielski',
      ...okresTygodni(dodajDni(macierzynski.do, 1), tygodnieRodzicielskiego),
      tygodnie: tygodnieRodzicielskiego,
      stawka: 81.5,
      rodzic: 'matka',
    });
  }
  return okresy;
}

/** Czy wniosek był złożony przed porodem i trafił do ZUS albo został przygotowany dla płatnika. */
export function czyWniosekPrzedPorodemDoPrzeliczenia(wniosek: WniosekZam): boolean {
  return Boolean(wniosek.przedPorodem) && wniosek.stan !== 'szkic';
}

/**
 * Wniosek przeliczony po potwierdzeniu daty porodu: gdy poród nastąpił przed dniem początku zasiłku,
 * urlop macierzyński zaczyna się w dniu porodu, w przeciwnym razie zachowuje dzień początku; okres
 * trwa wymiar dla liczby urodzonych dzieci. Urlop rodzicielski objęty wnioskiem przesuwa się tak,
 * żeby zaczynał się dzień po końcu urlopu macierzyńskiego i zachował liczbę tygodni.
 */
export function przeliczPoPorodzie(wniosek: WniosekZam, dataPorodu: DataISO, liczba: LiczbaDzieci): WniosekZam {
  const przedPorodem = wniosek.przedPorodem;
  if (!przedPorodem) return wniosek;
  const od = porownajDaty(dataPorodu, przedPorodem.dzienPoczatkuZasilku) < 0 ? dataPorodu : przedPorodem.dzienPoczatkuZasilku;
  const tygodnie = WYMIAR_MACIERZYNSKIEGO_TYGODNI[liczbaDoKlucza(liczba)];
  const macierzynski = okresTygodni(od, tygodnie);
  let poprzedniKoniec = macierzynski.do;
  const okresy = wniosek.okresy.map((okres): OkresWniosku => {
    if (okres.rodzajUrlopu === 'macierzynski' || okres.rodzajUrlopu === 'czesc-przed-porodem') {
      return { ...okres, ...macierzynski, tygodnie };
    }
    if (okres.rodzajUrlopu === 'rodzicielski' && okres.stawka === 81.5) {
      const tygodnieOkresu = okres.tygodnie ?? Math.round((okres.dni ?? 0) / 7);
      const nowy = okresTygodni(dodajDni(poprzedniKoniec, 1), tygodnieOkresu);
      poprzedniKoniec = nowy.do;
      return { ...okres, ...nowy };
    }
    return okres;
  });
  if (!okresy.some((o) => o.rodzajUrlopu === 'macierzynski' || o.rodzajUrlopu === 'czesc-przed-porodem')) {
    okresy.unshift({ rodzajUrlopu: 'macierzynski', ...macierzynski, tygodnie, stawka: 100, rodzic: 'matka' });
  }
  return { ...wniosek, okresy };
}

/** Oznaczenie sprawy K08 po porodzie: dane dziecka dla ZUS albo odpis aktu urodzenia dla płatnika. */
export function oznaczeniePoPorodzie(wniosek: WniosekZam): OznaczenieSprawy {
  return wniosek.adresat === 'platnik-skladek' ? 'odpis-do-przekazania-platnikowi' : 'dane-dziecka-do-przekazania';
}

/** Komunikat sprawy po przeliczeniu: 0231 dla wniosku w ZUS, bez komunikatu dla płatnika. */
export function komunikatPoPorodzie(wniosek: WniosekZam): KodKomunikatu | null {
  return wniosek.adresat === 'platnik-skladek' ? null : '0231';
}

/** Komunikat ekranu ViewZamForPayer: 0230 dla wniosku przed porodem, 0046 po porodzie. */
export function komunikatDlaPlatnika(wniosek: WniosekZam): '0046' | '0230' {
  return wniosek.przedPorodem ? '0230' : '0046';
}

/** Litery bez znaków diakrytycznych do nazwy pliku. */
function bezZnakowDiakrytycznych(tekst: string): string {
  return tekst
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Nazwa pliku PDF dla płatnika: Wniosek-ZAM-Karolina-Lis.pdf albo Wniosek-ZAM-przed-porodem-Karolina-Lis.pdf. */
export function nazwaPlikuDlaPlatnika(wniosek: WniosekZam, imie: string, nazwisko: string): string {
  const osoba = bezZnakowDiakrytycznych(`${imie}-${nazwisko}`);
  const przed = wniosek.przedPorodem ? 'przed-porodem-' : '';
  return `Wniosek-ZAM-${przed}${osoba}.pdf`;
}
