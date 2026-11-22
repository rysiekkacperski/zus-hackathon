// Zmiana zatrudnienia w ciąży w Profilu na start (kontrakt, sekcja 7.2).
// Właściciel: u10 (Profil na start: ciąża, zmiana zatrudnienia, rodzina).
// Wymaganie Zmiana zatrudnienia w ciąży (3.3.1.1.3): zmiana dotyczy umowy o pracę, umowy zlecenia albo jednoosobowej
// działalności gospodarczej, jej data przypada w okresie ciąży (odniesienie − 280 dni do odniesienia), a data ustania jest
// równa dacie początku tytułu, którego dotyczy, albo od niej późniejsza.
import { czyWOkresie, porownajDaty } from '@/domena/daty';
import type {
  BledyPol,
  DataISO,
  FormaZatrudnienia,
  KodKomunikatu,
  Okres,
  PrzyczynaUstaniaUmowy,
  RodzajTytulu,
  RodzajZmianyZatrudnienia,
  TytulUbezpieczenia,
  ZmianaZatrudnieniaWCiazy,
  ZrodloDanej,
} from '@/domena/typy';
import { walidujDateWZakresie } from '@/domena/walidacje';

export type FormaZmiany = Exclude<FormaZatrudnienia, 'brak-tytulu'>;

export const RODZAJE_ZMIANY: readonly RodzajZmianyZatrudnienia[] = ['bez-zmian', 'rozpoczecie', 'ustanie'];
export const FORMY_ZMIANY: readonly FormaZmiany[] = ['umowa-o-prace', 'umowa-zlecenia', 'jdg'];
export const PRZYCZYNY_USTANIA: readonly PrzyczynaUstaniaUmowy[] = [
  'upadlosc',
  'likwidacja',
  'smierc-pracodawcy',
  'naruszenie-z-wyrokiem',
  'naruszenie-bez-wyroku',
  'koniec-umowy-terminowej',
  'inna',
];

/** Przyczyny ustania, przy których rodzic wskazuje, czy zapewniono mu inne zatrudnienie. */
export const PRZYCZYNY_Z_INNYM_ZATRUDNIENIEM: readonly PrzyczynaUstaniaUmowy[] = ['upadlosc', 'likwidacja', 'smierc-pracodawcy'];

/** Pola formularza ViewProfileEmploymentChange. Data jako tekst wpisany przez użytkownika. */
export interface FormularzZmianyZatrudnienia {
  rodzaj: RodzajZmianyZatrudnienia | null;
  forma: FormaZmiany | null;
  data: string;
  przyczyna: PrzyczynaUstaniaUmowy | '';
  inneZatrudnienie: boolean | null;
}

export type PoleZmianyZatrudnienia = 'rodzaj' | 'forma' | 'data' | 'przyczyna' | 'inneZatrudnienie';

const FORMA_TYTULU: Record<RodzajTytulu, FormaZmiany> = {
  pracownik: 'umowa-o-prace',
  zleceniobiorca: 'umowa-zlecenia',
  dzialalnosc: 'jdg',
};

const KOLEJNOSC_FORM: Record<FormaZmiany, number> = { 'umowa-o-prace': 0, jdg: 1, 'umowa-zlecenia': 2 };

export function formaZTytulu(rodzaj: RodzajTytulu): FormaZmiany {
  return FORMA_TYTULU[rodzaj];
}

function wedlugKolejnosci(tytuly: readonly TytulUbezpieczenia[]): TytulUbezpieczenia[] {
  return [...tytuly].sort(
    (a, b) => KOLEJNOSC_FORM[formaZTytulu(a.rodzaj)] - KOLEJNOSC_FORM[formaZTytulu(b.rodzaj)] || porownajDaty(a.od, b.od),
  );
}

/** Czy forma zmiany wymaga podania daty, formy i (przy ustaniu umowy o pracę) przyczyny. */
export function czyZmianaZData(rodzaj: RodzajZmianyZatrudnienia | null): boolean {
  return rodzaj === 'rozpoczecie' || rodzaj === 'ustanie';
}

/** Pole przyczyny ustania jest widoczne wyłącznie przy ustaniu umowy o pracę. */
export function czyPokazacPrzyczyne(f: Pick<FormularzZmianyZatrudnienia, 'rodzaj' | 'forma'>): boolean {
  return f.rodzaj === 'ustanie' && f.forma === 'umowa-o-prace';
}

/** Pole zapewnienia innego zatrudnienia jest widoczne przy upadłości, likwidacji i śmierci pracodawcy. */
export function czyPokazacInneZatrudnienie(f: Pick<FormularzZmianyZatrudnienia, 'rodzaj' | 'forma' | 'przyczyna'>): boolean {
  return czyPokazacPrzyczyne(f) && f.przyczyna !== '' && PRZYCZYNY_Z_INNYM_ZATRUDNIENIEM.includes(f.przyczyna);
}

/** Komunikat informacyjny przy przyczynie ustania (0076 przy naruszeniu przepisów bez prawomocnego wyroku); nie blokuje przejścia. */
export function komunikatPrzyczyny(f: Pick<FormularzZmianyZatrudnienia, 'rodzaj' | 'forma' | 'przyczyna'>): KodKomunikatu | null {
  return czyPokazacPrzyczyne(f) && f.przyczyna === 'naruszenie-bez-wyroku' ? '0076' : null;
}

/** Propozycja zmiany zatrudnienia z tytułów rozpoczętych albo zakończonych w okresie ciąży. */
export function proponujZmianeZatrudnienia(tytuly: TytulUbezpieczenia[], okres: Okres): ZmianaZatrudnieniaWCiazy | null {
  if (tytuly.length === 0) return null;
  const zKonta = <T,>(wartosc: T) => ({ wartosc, zrodlo: 'konto-zus' as ZrodloDanej });
  const posortowane = wedlugKolejnosci(tytuly);
  const zakonczony = posortowane.find((t) => t.do !== undefined && czyWOkresie(t.do, okres));
  if (zakonczony?.do) {
    return { rodzaj: zKonta('ustanie'), forma: zKonta(formaZTytulu(zakonczony.rodzaj)), data: zKonta(zakonczony.do) };
  }
  const rozpoczety = posortowane.find((t) => czyWOkresie(t.od, okres));
  if (rozpoczety) {
    return { rodzaj: zKonta('rozpoczecie'), forma: zKonta(formaZTytulu(rozpoczety.rodzaj)), data: zKonta(rozpoczety.od) };
  }
  return { rodzaj: zKonta('bez-zmian') };
}

/** Tytuł, na którym opiera się propozycja albo opis danych konta ZUS na ekranie. */
export function tytulPropozycji(tytuly: readonly TytulUbezpieczenia[], okres: Okres): TytulUbezpieczenia | null {
  const posortowane = wedlugKolejnosci(tytuly);
  return (
    posortowane.find((t) => t.do !== undefined && czyWOkresie(t.do, okres)) ??
    posortowane.find((t) => czyWOkresie(t.od, okres)) ??
    posortowane.find((t) => porownajDaty(t.od, okres.do) <= 0 && (t.do === undefined || porownajDaty(t.do, okres.od) >= 0)) ??
    posortowane[0] ??
    null
  );
}

function dataUstaniaPrzedPoczatkiemTytulu(data: DataISO, forma: FormaZmiany, tytuly: readonly TytulUbezpieczenia[]): boolean {
  const tytulyFormy = tytuly.filter((t) => formaZTytulu(t.rodzaj) === forma);
  if (tytulyFormy.length === 0) return false;
  return tytulyFormy.every((t) => porownajDaty(data, t.od) < 0);
}

/**
 * Błędy zmiany zatrudnienia: 0006 przy polach wyboru, 0073, 0010, 0074 i 0075 przy dacie. Komunikat 0076 podaje
 * `komunikatPrzyczyny`, bo nie blokuje przejścia dalej.
 */
export function walidujZmianeZatrudnienia(
  f: FormularzZmianyZatrudnienia,
  okres: Okres,
  tytuly: TytulUbezpieczenia[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- podpis z kontraktu; reguły daty nie zależą od dnia dzisiejszego
  dzis: DataISO,
): BledyPol<PoleZmianyZatrudnienia> {
  const bledy: BledyPol<PoleZmianyZatrudnienia> = {};
  if (f.rodzaj === null) {
    bledy.rodzaj = '0006';
    return bledy;
  }
  if (!czyZmianaZData(f.rodzaj)) return bledy;
  if (f.forma === null) bledy.forma = '0006';
  const data = walidujDateWZakresie(f.data, okres, { pusta: '0073', format: '0010', zaWczesnie: '0074', zaPozno: '0074' });
  if ('kod' in data) bledy.data = data.kod;
  else if (f.rodzaj === 'ustanie' && f.forma !== null && dataUstaniaPrzedPoczatkiemTytulu(data.data, f.forma, tytuly)) {
    bledy.data = '0075';
  }
  if (czyPokazacPrzyczyne(f) && f.przyczyna === '') bledy.przyczyna = '0006';
  if (czyPokazacInneZatrudnienie(f) && f.inneZatrudnienie === null) bledy.inneZatrudnienie = '0006';
  return bledy;
}

/**
 * Zmiana zatrudnienia do szkicu profilu z poprawnego formularza. Źródło każdego pola: konto ZUS, gdy wartość jest równa
 * propozycji z danych konta ZUS, a w pozostałych przypadkach odpowiedź rodzica. Przyczyna i inne zatrudnienie zawsze
 * pochodzą z odpowiedzi rodzica.
 */
export function zmianaZFormularza(
  f: FormularzZmianyZatrudnienia,
  propozycja: ZmianaZatrudnieniaWCiazy | null,
  okres: Okres,
): ZmianaZatrudnieniaWCiazy | null {
  if (f.rodzaj === null) return null;
  const zrodlo = <T,>(wartosc: T, zPropozycji: T | undefined): ZrodloDanej =>
    zPropozycji !== undefined && wartosc === zPropozycji ? 'konto-zus' : 'odpowiedz-rodzica';
  const wynik: ZmianaZatrudnieniaWCiazy = {
    rodzaj: { wartosc: f.rodzaj, zrodlo: zrodlo(f.rodzaj, propozycja?.rodzaj.wartosc) },
  };
  if (!czyZmianaZData(f.rodzaj)) return wynik;
  const data = walidujDateWZakresie(f.data, okres, { format: '0010' });
  if (f.forma === null || !('data' in data)) return null;
  const zgodnaZPropozycja = propozycja?.rodzaj.wartosc === f.rodzaj;
  wynik.forma = { wartosc: f.forma, zrodlo: zgodnaZPropozycja ? zrodlo(f.forma, propozycja?.forma?.wartosc) : 'odpowiedz-rodzica' };
  wynik.data = {
    wartosc: data.data,
    zrodlo: zgodnaZPropozycja && propozycja?.forma?.wartosc === f.forma ? zrodlo(data.data, propozycja?.data?.wartosc) : 'odpowiedz-rodzica',
  };
  if (czyPokazacPrzyczyne(f) && f.przyczyna !== '') {
    wynik.przyczyna = { wartosc: f.przyczyna, zrodlo: 'odpowiedz-rodzica' };
    if (czyPokazacInneZatrudnienie(f) && f.inneZatrudnienie !== null) {
      wynik.inneZatrudnienie = { wartosc: f.inneZatrudnienie, zrodlo: 'odpowiedz-rodzica' };
    }
  }
  return wynik;
}

/** Formularz z zapisanej zmiany zatrudnienia albo z propozycji z danych konta ZUS. */
export function formularzZeZmiany(
  zmiana: ZmianaZatrudnieniaWCiazy | null | undefined,
  formatujDate: (d: DataISO) => string,
): FormularzZmianyZatrudnienia {
  return {
    rodzaj: zmiana?.rodzaj.wartosc ?? null,
    forma: zmiana?.forma?.wartosc ?? null,
    data: zmiana?.data ? formatujDate(zmiana.data.wartosc) : '',
    przyczyna: zmiana?.przyczyna?.wartosc ?? '',
    inneZatrudnienie: zmiana?.inneZatrudnienie?.wartosc ?? null,
  };
}
