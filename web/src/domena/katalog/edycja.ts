// Edycja Katalogu świadczeń przez Administratora: nowe wersje wpisów słowników i nowe pozycje
// (kontrakt, sekcja 7.2; historyjki 3.5.1.2.1, 3.5.1.2.2, 3.5.1.2.3). Właściciel: u06.
// Funkcje są czyste: datę dostają jako argument, a komunikaty zwracają jako kody tablicy komunikatów.
import { dodajDni, parsujDate, porownajDaty } from '@/domena/daty';
import { parsujKwote } from '@/domena/kwoty';
import type {
  BledyPol,
  DataISO,
  Etap,
  FormaZatrudnienia,
  IdPozycji,
  JednostkaWariantu,
  Katalog,
  Kotwica,
  KodKomunikatu,
  Pesel,
  PozycjaKatalogu,
  RegulaTerminu,
  RodzajPozycji,
  RodzicPozycji,
  WariantWpisu,
  WarunekStrukturalny,
  WersjaWpisu,
  WpisSlownika,
  ZnacznikCzasu,
} from '@/domena/typy';

// --- Rodzaje pól wartości ----------------------------------------------------------------------

/** Pole formularza wartości: kwota w złotych (grosze), stawka w procentach albo wymiar liczbą całkowitą. */
export type RodzajPolaWartosci = 'kwota' | 'stawka' | 'wymiar';

/** Rodzaj wpisu słownika według pól, które Administrator zmienia. */
export type RodzajWpisu = RodzajPolaWartosci | 'mieszany';

const RODZAJ_POLA: Record<JednostkaWariantu, RodzajPolaWartosci> = {
  zl: 'kwota',
  procent: 'stawka',
  'procent-etatu': 'stawka',
  tygodnie: 'wymiar',
  dni: 'wymiar',
  miesiace: 'wymiar',
  lata: 'wymiar',
  osoby: 'wymiar',
  czesci: 'wymiar',
  g: 'wymiar',
};

/** Kwota do 99 999,99 zł (3.5.1.2.1). */
export const MAKS_KWOTA_GROSZE = 9_999_999;
/** Wymiar do 999; masa w gramach do 9999, bo wpis masy urodzeniowej ma wartość 1000 g. */
const MAKS_WYMIARU: Partial<Record<JednostkaWariantu, number>> = { g: 9999 };
const MAKS_WYMIARU_DOMYSLNIE = 999;

export function rodzajPolaWariantu(jednostka: JednostkaWariantu): RodzajPolaWartosci {
  return RODZAJ_POLA[jednostka];
}

export function maksWymiaru(jednostka: JednostkaWariantu): number {
  return MAKS_WYMIARU[jednostka] ?? MAKS_WYMIARU_DOMYSLNIE;
}

/** Warianty, które Administrator wpisuje; wariant wyprowadzony liczy się z innego wpisu. */
export function wariantyEdytowalne(wpis: WpisSlownika): WariantWpisu[] {
  return wpis.warianty.filter((w) => w.wyprowadzony === undefined);
}

/** Wpis z co najmniej jednym wariantem do wpisania, oznaczony w seedzie jako edytowalny. */
export function czyWpisEdytowalny(wpis: WpisSlownika): boolean {
  return wpis.edytowalny && wariantyEdytowalne(wpis).length > 0;
}

export function rodzajWpisu(wpis: WpisSlownika): RodzajWpisu {
  const rodzaje = new Set(wariantyEdytowalne(wpis).map((w) => rodzajPolaWariantu(w.jednostka)));
  if (rodzaje.size === 1) return [...rodzaje][0];
  if (rodzaje.size === 0) return wpis.slownik === 'kwoty-i-progi' ? 'kwota' : 'wymiar';
  return 'mieszany';
}

/** Formularz wpisu z kilkoma wariantami pokazuje obowiązujące wartości (wzory P04-06, P04-09), z jednym jest pusty (P04-01). */
export function czyWypelnicFormularz(wpis: WpisSlownika): boolean {
  return wariantyEdytowalne(wpis).length > 1;
}

// --- Wersje i okresy obowiązywania -------------------------------------------------------------

export type StanWersji = 'obowiazuje' | 'zaplanowana' | 'zakonczona';
export type WersjaZOkresem = WersjaWpisu & { stan: StanWersji };

/** Wersje rosnąco po dacie początku; wersja bez daty końca kończy się dzień przed początkiem następnej. */
export function wersjeRosnaco(wpis: WpisSlownika): WersjaWpisu[] {
  const posortowane = [...wpis.wersje].sort((a, b) => porownajDaty(a.od, b.od));
  return posortowane.map((wersja, i) => {
    const nastepna = posortowane[i + 1];
    if (wersja.do !== undefined || nastepna === undefined) return wersja;
    return { ...wersja, do: dodajDni(nastepna.od, -1) };
  });
}

function stanWersji(wersja: WersjaWpisu, dzien: DataISO): StanWersji {
  if (porownajDaty(wersja.od, dzien) > 0) return 'zaplanowana';
  if (wersja.do !== undefined && porownajDaty(wersja.do, dzien) < 0) return 'zakonczona';
  return 'obowiazuje';
}

/** Wersje malejąco po dacie początku ze stanem względem dnia `dzis` (tabela historii ViewCatalogValueEdit). */
export function historiaWersji(wpis: WpisSlownika, dzis: DataISO): WersjaZOkresem[] {
  return wersjeRosnaco(wpis)
    .map((w) => ({ ...w, stan: stanWersji(w, dzis) }))
    .reverse();
}

/** Wersja obowiązująca w dniu `dzien` (od ≤ dzien ≤ do, oba końce włącznie). */
export function wersjaObowiazujacaWpisu(wpis: WpisSlownika, dzien: DataISO): WersjaWpisu | null {
  return wersjeRosnaco(wpis).find((w) => stanWersji(w, dzien) === 'obowiazuje') ?? null;
}

/** Wersje z datą początku późniejszą niż `dzis`, rosnąco. */
export function wersjeZaplanowane(wpis: WpisSlownika, dzis: DataISO): WersjaWpisu[] {
  return wersjeRosnaco(wpis).filter((w) => porownajDaty(w.od, dzis) > 0);
}

/**
 * Wersja odniesienia dla daty początku nowej wartości: obowiązująca w dniu `dzis`, a gdy żadna nie
 * obowiązuje, ostatnia rozpoczęta przed tym dniem.
 */
export function wersjaOdniesienia(wpis: WpisSlownika, dzis: DataISO): WersjaWpisu | null {
  const obowiazujaca = wersjaObowiazujacaWpisu(wpis, dzis);
  if (obowiazujaca) return obowiazujaca;
  const rozpoczete = wersjeRosnaco(wpis).filter((w) => porownajDaty(w.od, dzis) <= 0);
  return rozpoczete[rozpoczete.length - 1] ?? null;
}

// --- Wartości pól ------------------------------------------------------------------------------

const WZOR_STAWKI = /^(\d{1,3})(?:[.,](\d{1,2}))?$/;
const WZOR_WYMIARU = /^\d{1,6}$/;

/** Wpis pola wariantu: kwota w groszach, stawka w procentach albo wymiar liczbą całkowitą. */
export function parsujWartoscWariantu(
  tekst: string,
  jednostka: JednostkaWariantu,
): { wartosc: number } | { kod: KodKomunikatu } {
  const wpisany = tekst.trim();
  const rodzaj = rodzajPolaWariantu(jednostka);
  if (rodzaj === 'kwota') {
    if (wpisany === '') return { kod: '0048' };
    const grosze = parsujKwote(wpisany);
    if (grosze === null || grosze <= 0 || grosze > MAKS_KWOTA_GROSZE) return { kod: '0016' };
    return { wartosc: grosze };
  }
  if (rodzaj === 'stawka') {
    if (wpisany === '') return { kod: '0151' };
    const m = WZOR_STAWKI.exec(wpisany);
    if (!m) return { kod: '0079' };
    const setne = Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0'));
    if (setne <= 0 || setne > 10_000) return { kod: '0079' };
    return { wartosc: setne / 100 };
  }
  if (wpisany === '') return { kod: '0077' };
  if (!WZOR_WYMIARU.test(wpisany)) return { kod: '0078' };
  const liczba = Number(wpisany);
  if (liczba <= 0 || liczba > maksWymiaru(jednostka)) return { kod: '0078' };
  return { wartosc: liczba };
}

function setneZPrzecinkiem(setne: number, zawszeDwieCyfry: boolean): string {
  const calkowite = Math.trunc(setne / 100);
  const reszta = Math.abs(setne % 100);
  if (reszta === 0 && !zawszeDwieCyfry) return String(calkowite);
  const ulamek = String(reszta).padStart(2, '0');
  return `${calkowite},${zawszeDwieCyfry ? ulamek : ulamek.replace(/0$/, '')}`;
}

/** Wartość wersji jako tekst pola formularza: 850, 1922,50, 81,5, 41. */
export function wartoscDoPola(wartosc: number, jednostka: JednostkaWariantu): string {
  const rodzaj = rodzajPolaWariantu(jednostka);
  if (rodzaj === 'kwota') return setneZPrzecinkiem(Math.round(wartosc), Math.round(wartosc) % 100 !== 0);
  if (rodzaj === 'stawka') return setneZPrzecinkiem(Math.round(wartosc * 100), false);
  return String(wartosc);
}

// --- Nowa wersja wpisu -------------------------------------------------------------------------

/** Klucz pola daty początku w błędach formularza nowej wersji. */
export const POLE_DATY_POCZATKU = 'od';

/**
 * Błędy nowej wersji wpisu, kluczem jest klucz wariantu albo `od`: 0048, 0016, 0077, 0078, 0151, 0079
 * przy polach wariantów oraz 0010, 0049, 0050 przy dacie początku (kolejność sprawdzeń: format, 0049, 0050).
 */
export function walidujNowaWersje(
  wpis: WpisSlownika,
  wartosci: Record<string, string>,
  od: string,
  dzis: DataISO,
): BledyPol<string> {
  const bledy: BledyPol<string> = {};
  for (const wariant of wariantyEdytowalne(wpis)) {
    const wynik = parsujWartoscWariantu(wartosci[wariant.klucz] ?? '', wariant.jednostka);
    if ('kod' in wynik) bledy[wariant.klucz] = wynik.kod;
  }
  const data = parsujDate(od);
  if (data === null) {
    bledy[POLE_DATY_POCZATKU] = '0010';
    return bledy;
  }
  const odniesienie = wersjaOdniesienia(wpis, dzis);
  if (odniesienie && porownajDaty(data, odniesienie.od) <= 0) {
    bledy[POLE_DATY_POCZATKU] = '0049';
    return bledy;
  }
  const pozniejsze = wpis.wersje.filter((w) => odniesienie === null || porownajDaty(w.od, odniesienie.od) > 0);
  if (pozniejsze.some((w) => porownajDaty(data, w.od) <= 0)) bledy[POLE_DATY_POCZATKU] = '0050';
  return bledy;
}

/**
 * Nowa wersja wpisu z wartościami wszystkich wariantów edytowalnych i dzień zamknięcia poprzedniej
 * wersji (dzień przed datą początku nowej). Wywołuj po walidacji bez błędów.
 */
export function nowaWersja(
  wpis: WpisSlownika,
  wartosci: Record<string, string>,
  od: string,
  konto: Pesel,
  teraz: ZnacznikCzasu,
): { nowa: WersjaWpisu; zamknijPoprzednia?: DataISO } {
  const data = parsujDate(od);
  if (data === null) throw new Error('Data początku nowej wersji ma nieprawidłowy format.');
  const liczby: Record<string, number> = {};
  for (const wariant of wariantyEdytowalne(wpis)) {
    const wynik = parsujWartoscWariantu(wartosci[wariant.klucz] ?? '', wariant.jednostka);
    if ('kod' in wynik) throw new Error(`Nieprawidłowa wartość wariantu ${wariant.klucz}.`);
    liczby[wariant.klucz] = wynik.wartosc;
  }
  const poprzednia = wersjeRosnaco(wpis).filter((w) => porownajDaty(w.od, data) < 0).pop();
  return {
    nowa: { od: data, wartosci: liczby, dodano: { przez: konto, czas: teraz } },
    zamknijPoprzednia: poprzednia ? dodajDni(data, -1) : undefined,
  };
}

// --- Nowa pozycja katalogu ---------------------------------------------------------------------

export type UbezpieczenieChorobowePozycji = WarunekStrukturalny['ubezpieczenieChorobowe'];
export type KotwicaNowejPozycji = Extract<
  Kotwica,
  'brak' | 'koniec-10-tygodnia' | 'przewidywany-termin-porodu' | 'data-porodu' | 'data-przyjecia'
>;
export type JednostkaPrzesuniecia = 'dni' | 'miesiace';
export type RodzicNowejPozycji = Exclude<RodzicPozycji, 'matka-a-bez-tytulu-drugi-rodzic'>;

/** Pola formularza ViewCatalogItemAdd. */
export interface FormularzNowejPozycji {
  tytul: string;
  rodzaj: RodzajPozycji | '';
  etap: Etap | '';
  rodzic: RodzicNowejPozycji | '';
  formyZatrudnienia: FormaZatrudnienia[];
  ubezpieczenieChorobowe: UbezpieczenieChorobowePozycji;
  instytucjaIKanal: string;
  kotwica: KotwicaNowejPozycji;
  przesuniecie: string;
  jednostkaPrzesuniecia: JednostkaPrzesuniecia;
  kosztSpoznienia: string;
}

export type PoleNowejPozycji =
  | 'tytul'
  | 'rodzaj'
  | 'etap'
  | 'rodzic'
  | 'formyZatrudnienia'
  | 'instytucjaIKanal'
  | 'przesuniecie'
  | 'kosztSpoznienia';

export const RODZAJE_POZYCJI: readonly RodzajPozycji[] = ['swiadczenie', 'uprawnienie', 'obowiazek', 'informacja'];
export const ETAPY: readonly Etap[] = [
  'ciaza',
  'pierwsze-tygodnie',
  'urlopy-i-zasilek',
  'pieniadze-na-dziecko',
  'powrot-do-pracy',
];
export const RODZICE_NOWEJ_POZYCJI: readonly RodzicNowejPozycji[] = [
  'matka',
  'drugi-rodzic',
  'oboje-rodzice',
  'matka-albo-ojciec',
  'kazdy-rodzic-na-umowie-o-prace',
  'rodzic-przyjmujacy',
];
export const FORMY_ZATRUDNIENIA: readonly FormaZatrudnienia[] = ['umowa-o-prace', 'umowa-zlecenia', 'jdg', 'brak-tytulu'];
export const UBEZPIECZENIA_CHOROBOWE: readonly UbezpieczenieChorobowePozycji[] = ['bez-znaczenia', 'wymagane', 'brak'];
export const KOTWICE_NOWEJ_POZYCJI: readonly KotwicaNowejPozycji[] = [
  'brak',
  'koniec-10-tygodnia',
  'przewidywany-termin-porodu',
  'data-porodu',
  'data-przyjecia',
];
export const JEDNOSTKI_PRZESUNIECIA: readonly JednostkaPrzesuniecia[] = ['dni', 'miesiace'];

export const MAKS_DLUGOSC_TYTULU = 120;
export const MAKS_DLUGOSC_OPISU = 500;
const ZAKRES_PRZESUNIECIA: Record<JednostkaPrzesuniecia, number> = { dni: 366, miesiace: 36 };
const WZOR_PRZESUNIECIA = /^[-+]?\d{1,4}$/;

/** Wartości domyślne formularza: ubezpieczenie chorobowe bez znaczenia, data kotwicząca brak terminu (KA-01 3.5.1.2.3). */
export function formularzNowejPozycjiPoczatkowy(): FormularzNowejPozycji {
  return {
    tytul: '',
    rodzaj: '',
    etap: '',
    rodzic: '',
    formyZatrudnienia: [],
    ubezpieczenieChorobowe: 'bez-znaczenia',
    instytucjaIKanal: '',
    kotwica: 'brak',
    przesuniecie: '',
    jednostkaPrzesuniecia: 'dni',
    kosztSpoznienia: '',
  };
}

function znormalizujTytul(tytul: string): string {
  return tytul.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pl-PL');
}

/** Przesunięcie terminu: liczba całkowita od -366 do 366 dni albo od -36 do 36 miesięcy. */
export function parsujPrzesuniecie(tekst: string, jednostka: JednostkaPrzesuniecia): number | null {
  const wpisany = tekst.trim().replace(/[−–]/g, '-');
  if (!WZOR_PRZESUNIECIA.test(wpisany)) return null;
  const liczba = Number(wpisany);
  return Math.abs(liczba) <= ZAKRES_PRZESUNIECIA[jednostka] ? liczba : null;
}

/** Dozwolona liczba znaków pola z błędem 0271: 120 przy tytule, 500 przy instytucji i kanale oraz koszcie spóźnienia (3.5.1.2.6). */
export function maksDlugoscPola(pole: PoleNowejPozycji): number {
  return pole === 'tytul' ? MAKS_DLUGOSC_TYTULU : MAKS_DLUGOSC_OPISU;
}

/**
 * Błędy nowej pozycji katalogu: 0080, 0081, 0271 (tytuł), 0006 (rodzaj, etap, rodzic, formy), 0152, 0271
 * (instytucja), 0153 (przesunięcie), 0271 (koszt spóźnienia).
 */
export function walidujNowaPozycje(formularz: FormularzNowejPozycji, k: Katalog): BledyPol<PoleNowejPozycji> {
  const bledy: BledyPol<PoleNowejPozycji> = {};
  const tytul = formularz.tytul.trim();
  if (tytul === '') bledy.tytul = '0080';
  else if (tytul.length > MAKS_DLUGOSC_TYTULU) bledy.tytul = '0271';
  else if (k.pozycje.some((p) => znormalizujTytul(p.tytul) === znormalizujTytul(tytul))) bledy.tytul = '0081';
  if (formularz.rodzaj === '') bledy.rodzaj = '0006';
  if (formularz.etap === '') bledy.etap = '0006';
  if (formularz.rodzic === '') bledy.rodzic = '0006';
  if (formularz.formyZatrudnienia.length === 0) bledy.formyZatrudnienia = '0006';
  const instytucja = formularz.instytucjaIKanal.trim();
  if (instytucja === '') bledy.instytucjaIKanal = '0152';
  else if (instytucja.length > MAKS_DLUGOSC_OPISU) bledy.instytucjaIKanal = '0271';
  if (formularz.kosztSpoznienia.trim().length > MAKS_DLUGOSC_OPISU) bledy.kosztSpoznienia = '0271';
  if (
    formularz.kotwica !== 'brak' &&
    parsujPrzesuniecie(formularz.przesuniecie, formularz.jednostkaPrzesuniecia) === null
  ) {
    bledy.przesuniecie = '0153';
  }
  return bledy;
}

/** Kolejny wolny identyfikator pozycji: „K” i numer o jeden większy od największego, dwie cyfry (K38 po K37). */
export function nastepnyIdentyfikator(k: Katalog): IdPozycji {
  const numery = k.pozycje
    .map((p) => /^K(\d+)$/.exec(p.id))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => Number(m[1]));
  const nastepny = (numery.length === 0 ? 0 : Math.max(...numery)) + 1;
  return `K${String(nastepny).padStart(2, '0')}`;
}

/** Warunek etapu: etap Ciąża oznacza „dziecko się nie urodziło”, pozostałe etapy „dziecko się urodziło”. */
export function warunekEtapu(etap: Etap): WarunekStrukturalny['warunekEtapu'] {
  return etap === 'ciaza' ? 'dziecko-nie-urodzilo-sie' : 'dziecko-urodzilo-sie';
}

/** Reguła terminu z daty kotwiczącej i przesunięcia; brak terminu daje regułę bez terminu. */
export function regulaTerminuNowejPozycji(formularz: FormularzNowejPozycji): RegulaTerminu {
  if (formularz.kotwica === 'brak') return { typ: 'brak' };
  const przesuniecie = parsujPrzesuniecie(formularz.przesuniecie, formularz.jednostkaPrzesuniecia);
  if (przesuniecie === null) throw new Error('Przesunięcie terminu ma nieprawidłową wartość.');
  return {
    typ: 'przesuniecie',
    kotwica: formularz.kotwica,
    przesuniecie,
    jednostka: formularz.jednostkaPrzesuniecia,
  };
}

/**
 * Pozycja katalogu z formularza bez błędów. Opis warunku tekstem składa wywołujący z etykiet interfejsu.
 * Kanał pozycji dodanej w panelu jest informacją w przewodniku z opisem instytucji i kanału.
 */
export function zbudujPozycje(
  formularz: FormularzNowejPozycji,
  w: { id: IdPozycji; warunekOpis: string; konto: Pesel; teraz: ZnacznikCzasu },
): PozycjaKatalogu {
  if (formularz.rodzaj === '' || formularz.etap === '' || formularz.rodzic === '') {
    throw new Error('Formularz nowej pozycji jest niekompletny.');
  }
  const koszt = formularz.kosztSpoznienia.trim();
  return {
    id: w.id,
    tytul: formularz.tytul.trim().replace(/\s+/g, ' '),
    rodzaj: formularz.rodzaj,
    etap: formularz.etap,
    rodzic: formularz.rodzic,
    warunekOpis: w.warunekOpis,
    warunekStrukturalny: {
      formyZatrudnienia: FORMY_ZATRUDNIENIA.filter((f) => formularz.formyZatrudnienia.includes(f)),
      ubezpieczenieChorobowe: formularz.ubezpieczenieChorobowe,
      warunekEtapu: warunekEtapu(formularz.etap),
    },
    instytucjaIKanal: formularz.instytucjaIKanal.trim(),
    kanaly: { kazda: { typ: 'informacja' } },
    regulaTerminu: regulaTerminuNowejPozycji(formularz),
    kosztSpoznienia: koszt === '' ? { typ: 'brak' } : { typ: 'skutek', tekst: koszt },
    instrukcja: { kroki: [], daneIDokumenty: [], odnosniki: [] },
    dodano: { przez: w.konto, czas: w.teraz },
  };
}
