// Reguły strażnika ubezpieczenia chorobowego (historyjka 3.6.1.3.1, kontrakt 7.2). Właściciel: u12.
// Czyste funkcje: brak aktywnego dobrowolnego ubezpieczenia chorobowego, sprawa Opłacenie składek z terminem
// 20. dnia miesiąca, status sprawy ze stanu rozliczeń składek albo z potwierdzenia rodzica, próg zadłużenia
// ze słownika kwot i progów, podwyższenie podstawy wymiaru składek i informacja przy K19 po porodzie.
import { dataZeZnacznika, dodajDni, dodajMiesiaceDoMiesiaca, miesiacZDaty, porownajDaty } from '@/domena/daty';
import { ID_KWOT } from '@/dane/katalog/slownik-kwot';
import { wartoscObowiazujaca } from '@/domena/katalog/odczyt';
import type {
  DaneCiazyIDziecka,
  DaneRodziny,
  DaneZKontaZus,
  DataISO,
  Grosze,
  IdSprawy,
  IdWpisuSlownika,
  Katalog,
  MiesiacISO,
  OstrzezenieSprawy,
  PodstawaSkladek,
  StanRozliczenSkladek,
  StatusSprawy,
  TytulUbezpieczenia,
  ZrodloStatusu,
} from '@/domena/typy';

/**
 * Forma zatrudnienia matki, przy której działa strażnik. Przy umowie o pracę strażnik pokazuje wyłącznie
 * ostrzeżenie o podwyższeniu podstawy (historyjka 3.6.1.3.2).
 */
export type FormaStraznika = 'jdg' | 'umowa-zlecenia' | 'umowa-o-prace';

/** Próg zadłużenia stosowany, gdy słownik kwot i progów nie ma wpisu: 1% minimalnego wynagrodzenia 4806 zł. */
const PROG_ZADLUZENIA_ZAPASOWY: Grosze = 4806;

const PRZEDROSTEK_SPRAWY_OPLACENIA = 'OS-';

/** Rodzaje ostrzeżeń, które nadaje krok strażnika. */
export const RODZAJE_OSTRZEZEN_STRAZNIKA = [
  'brak-duch',
  'podwyzszenie-podstawy',
  'zadluzenie-ponad-prog',
  'stan-rozliczen-niedostepny',
  'informacja-po-porodzie',
] as const satisfies readonly OstrzezenieSprawy['rodzaj'][];

/** Data porodu jest potwierdzona w Danych ciąży i dziecka. */
export function czyPorodPotwierdzony(daneCiazy: DaneCiazyIDziecka | null): boolean {
  return daneCiazy !== null && daneCiazy.dataPoroduPotwierdzona === true && Boolean(daneCiazy.dataPorodu);
}

/** Matka z profilu prowadzi JDG albo wykonuje umowę zlecenia z dobrowolnym ubezpieczeniem chorobowym. */
export function formaMatkiZDuch(daneRodziny: DaneRodziny): FormaStraznika | null {
  const forma = daneRodziny.matka.formaZatrudnienia?.wartosc;
  if (forma !== 'jdg' && forma !== 'umowa-zlecenia') return null;
  return daneRodziny.matka.dobrowolneChorobowe?.wartosc === true ? forma : null;
}

/** Strażnik działa dla matki JDG albo UZ z dobrowolnym ubezpieczeniem chorobowym do potwierdzenia daty porodu. */
export function formaStraznika(daneRodziny: DaneRodziny, daneCiazy: DaneCiazyIDziecka | null): FormaStraznika | null {
  if (czyPorodPotwierdzony(daneCiazy)) return null;
  const zDuch = formaMatkiZDuch(daneRodziny);
  if (zDuch !== null) return zDuch;
  return daneRodziny.matka.formaZatrudnienia?.wartosc === 'umowa-o-prace' ? 'umowa-o-prace' : null;
}

/** Miesiąc składek sprawy Opłacenie składek tworzonej w miesiącu dnia `dzis` (poprzedni miesiąc). */
export function miesiacSkladekNaDzien(dzis: DataISO): MiesiacISO {
  return dodajMiesiaceDoMiesiaca(miesiacZDaty(dzis), -1);
}

/** Niedziela Wielkanocna w roku `rok` (algorytm Meeusa, Jonesa i Butchera dla kalendarza gregoriańskiego). */
function wielkanoc(rok: number): DataISO {
  const a = rok % 19;
  const b = Math.floor(rok / 100);
  const c = rok % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const miesiac = Math.floor((h + l - 7 * m + 114) / 31);
  const dzien = ((h + l - 7 * m + 114) % 31) + 1;
  return `${rok}-${String(miesiac).padStart(2, '0')}-${String(dzien).padStart(2, '0')}`;
}

/** Dni ustawowo wolne od pracy w roku `rok` poza niedzielami. */
function dniUstawowoWolne(rok: number): Set<DataISO> {
  const stale = ['01-01', '01-06', '05-01', '05-03', '08-15', '11-01', '11-11', '12-24', '12-25', '12-26'].map((md) => `${rok}-${md}`);
  const w = wielkanoc(rok);
  return new Set([...stale, w, dodajDni(w, 1), dodajDni(w, 49), dodajDni(w, 60)]);
}

/** Dzień jest sobotą, niedzielą albo dniem ustawowo wolnym od pracy. */
function czyDzienWolny(dzien: DataISO): boolean {
  const [rok, miesiac, dzienMiesiaca] = dzien.split('-').map(Number);
  const dzienTygodnia = new Date(Date.UTC(rok, miesiac - 1, dzienMiesiaca)).getUTCDay();
  return dzienTygodnia === 0 || dzienTygodnia === 6 || dniUstawowoWolne(rok).has(dzien);
}

/**
 * Termin opłacenia składek za miesiąc: 20. dzień następnego miesiąca, a gdy przypada w sobotę albo w dniu
 * ustawowo wolnym od pracy, najbliższy następny dzień roboczy (historyjka 3.6.1.3.2).
 */
export function terminOplaceniaSkladek(miesiac: MiesiacISO): DataISO {
  let termin: DataISO = `${dodajMiesiaceDoMiesiaca(miesiac, 1)}-20`;
  while (czyDzienWolny(termin)) termin = dodajDni(termin, 1);
  return termin;
}

/** Dzień utworzenia sprawy za miesiąc: pierwszy dzień następnego miesiąca. */
export function dzienUtworzeniaSprawyOplacenia(miesiac: MiesiacISO): DataISO {
  return `${dodajMiesiaceDoMiesiaca(miesiac, 1)}-01`;
}

export function idSprawyOplacenia(miesiac: MiesiacISO): IdSprawy {
  return `${PRZEDROSTEK_SPRAWY_OPLACENIA}${miesiac}`;
}

/** Miesiąc składek, termin i identyfikator sprawy Opłacenie składek w dniu `dzis`; strażnik prowadzi tę sprawę przy JDG. */
export function oplacenieSkladekNaDzien(
  forma: FormaStraznika | null,
  dzis: DataISO,
): { miesiac: MiesiacISO; termin: DataISO; idSprawy: IdSprawy } | null {
  if (forma !== 'jdg') return null;
  const miesiac = miesiacSkladekNaDzien(dzis);
  return { miesiac, termin: terminOplaceniaSkladek(miesiac), idSprawy: idSprawyOplacenia(miesiac) };
}

export function czySprawaOplacenia(idSprawy: IdSprawy): boolean {
  return idSprawy.startsWith(PRZEDROSTEK_SPRAWY_OPLACENIA);
}

/** Miesiąc składek z identyfikatora sprawy Opłacenie składek albo null. */
export function miesiacZIdSprawyOplacenia(idSprawy: IdSprawy): MiesiacISO | null {
  if (!czySprawaOplacenia(idSprawy)) return null;
  const miesiac = idSprawy.slice(PRZEDROSTEK_SPRAWY_OPLACENIA.length);
  return /^\d{4}-\d{2}$/.test(miesiac) ? miesiac : null;
}

/** Kwota wariantu `kwota` wpisu słownika kwot i progów obowiązująca w dniu `dzien`, w groszach (jednostka 'zl'). */
function kwotaWpisu(katalog: Katalog, idWpisu: IdWpisuSlownika, dzien: DataISO): Grosze | null {
  return wartoscObowiazujaca(katalog, idWpisu, dzien, 'kwota')?.wartosc ?? null;
}

/**
 * Próg zadłużenia z tytułu składek osoby prowadzącej pozarolniczą działalność w dniu `dzien`, w groszach:
 * wpis słownika kwot i progów z progiem zadłużenia, a bez niego 1% minimalnego wynagrodzenia ze słownika.
 */
export function progZadluzenia(katalog: Katalog, dzien: DataISO): Grosze {
  const prog = kwotaWpisu(katalog, ID_KWOT.progZadluzeniaJdg, dzien);
  if (prog !== null && prog > 0) return prog;
  const minimalne = kwotaWpisu(katalog, ID_KWOT.minimalneWynagrodzenie, dzien);
  return minimalne !== null && minimalne > 0 ? Math.round(minimalne / 100) : PROG_ZADLUZENIA_ZAPASOWY;
}

/**
 * Progi zadłużenia obowiązujące od dnia `dzis` do dnia powstania prawa do zasiłku `doDnia`: pierwszy próg od
 * dnia `dzis`, kolejne od pierwszego dnia miesiąca, w którym słownik kwot i progów zmienia wartość.
 */
export function progiZadluzenia(katalog: Katalog, dzis: DataISO, doDnia: DataISO): { prog: Grosze; od: DataISO }[] {
  const progi = [{ prog: progZadluzenia(katalog, dzis), od: dzis }];
  let miesiac = dodajMiesiaceDoMiesiaca(miesiacZDaty(dzis), 1);
  for (let i = 0; i < 24 && porownajDaty(`${miesiac}-01`, doDnia) <= 0; i += 1) {
    const prog = progZadluzenia(katalog, `${miesiac}-01`);
    if (prog !== progi[progi.length - 1].prog) progi.push({ prog, od: `${miesiac}-01` });
    miesiac = dodajMiesiaceDoMiesiaca(miesiac, 1);
  }
  return progi;
}

function czyAktywnyWDniu(od: DataISO | undefined, do_: DataISO | undefined, dzien: DataISO): boolean {
  if (od !== undefined && porownajDaty(od, dzien) > 0) return false;
  return do_ === undefined || porownajDaty(dzien, do_) <= 0;
}

/** Tytuł ubezpieczenia z danych konta ZUS odpowiadający formie strażnika, aktywny w dniu `dzien`. */
export function tytulStraznika(kopia: DaneZKontaZus, forma: FormaStraznika, dzien: DataISO): TytulUbezpieczenia | null {
  const rodzaj = forma === 'jdg' ? 'dzialalnosc' : forma === 'umowa-o-prace' ? 'pracownik' : 'zleceniobiorca';
  const tytuly = kopia.tytuly
    .filter((t) => t.rodzaj === rodzaj && czyAktywnyWDniu(t.od, t.do, dzien))
    .sort((a, b) => porownajDaty(b.od, a.od));
  return tytuly[0] ?? null;
}

/** Dobrowolne ubezpieczenie chorobowe jest aktywne przy tytule w dniu `dzien`. */
export function czyDuchAktywne(tytul: TytulUbezpieczenia | null, dzien: DataISO): boolean {
  if (tytul === null) return false;
  const chorobowe = tytul.ubezpieczenieChorobowe;
  return chorobowe.rodzaj === 'dobrowolne' && czyAktywnyWDniu(chorobowe.od, chorobowe.do, dzien);
}

/** Najnowszy stan rozliczeń składek z kopii danych z konta ZUS. */
export function ostatniStanRozliczen(kopia: DaneZKontaZus): StanRozliczenSkladek | null {
  if (kopia.stanRozliczenNiedostepny) return null;
  const stany = [...(kopia.stanyRozliczen ?? [])].sort((a, b) => porownajDaty(b.dzien, a.dzien));
  return stany[0] ?? null;
}

/** Zadłużenie brane pod uwagę przez strażnika: układ spłacany terminowo, który obejmuje całość, daje 0,00 zł. */
export function zadluzenieDlaStraznika(stan: StanRozliczenSkladek): Grosze {
  const umowa = stan.umowa;
  if (umowa && umowa.splacanaZgodnieZUmowa && umowa.caleZadluzenieObjete) return 0;
  return stan.kwotaZadluzenia;
}

export interface PodwyzszeniePodstawy {
  srednia: Grosze;
  ostatnia: Grosze;
  wzrost: Grosze;
  wzrostProcent: number;
  miesiacOstatni: MiesiacISO;
  miesiacOd: MiesiacISO;
  miesiacDo: MiesiacISO;
}

/**
 * Ostatnia podstawa składek przekracza średnią podstaw z poprzednich (najwyżej 11) miesięcy o więcej niż
 * `progProcent`. Wzrost w procentach zaokrąglamy do 0,1.
 */
export function podwyzszeniePodstawy(podstawy: PodstawaSkladek[], progProcent: number): PodwyzszeniePodstawy | null {
  const posortowane = [...podstawy].sort((a, b) => a.miesiac.localeCompare(b.miesiac));
  if (posortowane.length < 2) return null;
  const ostatnia = posortowane[posortowane.length - 1];
  const poprzednie = posortowane.slice(0, -1).slice(-11);
  const suma = poprzednie.reduce((s, p) => s + p.kwota, 0);
  const srednia = Math.round(suma / poprzednie.length);
  if (srednia <= 0) return null;
  const wzrost = ostatnia.kwota - srednia;
  const procent = (wzrost / srednia) * 100;
  if (!(procent > progProcent)) return null;
  return {
    srednia,
    ostatnia: ostatnia.kwota,
    wzrost,
    wzrostProcent: Math.round(procent * 10) / 10,
    miesiacOstatni: ostatnia.miesiac,
    miesiacOd: poprzednie[0].miesiac,
    miesiacDo: poprzednie[poprzednie.length - 1].miesiac,
  };
}

export interface StatusOplacenia {
  status: StatusSprawy;
  zrodlo: ZrodloStatusu;
  dataOznaczenia?: DataISO;
  ostrzezenia: OstrzezenieSprawy[];
  /** Rodzic może potwierdzić opłacenie w arkuszu SheetContributionPaidConfirm. */
  potwierdzenieRodzica: boolean;
}

/**
 * Status sprawy Opłacenie składek za `miesiac`: zadłużenie ponad próg daje ostrzeżenie z kwotą, stan rozliczeń
 * po terminie bez zadłużenia ponad próg daje status załatwiona ze źródłem konto ZUS. Bez stanu rozliczeń
 * albo przy nieudanym odczycie status wynika z potwierdzenia rodzica.
 */
export function statusOplacenia(w: {
  miesiac: MiesiacISO;
  potwierdzenia: DaneRodziny['matka']['potwierdzeniaSkladek'];
  stan: StanRozliczenSkladek | null;
  stanNiedostepny: boolean;
  prog: Grosze;
}): StatusOplacenia {
  const termin = terminOplaceniaSkladek(w.miesiac);
  const ostrzezenia: OstrzezenieSprawy[] = [];
  if (w.stan !== null && !w.stanNiedostepny) {
    const zadluzenie = zadluzenieDlaStraznika(w.stan);
    if (zadluzenie > w.prog) {
      ostrzezenia.push({ rodzaj: 'zadluzenie-ponad-prog', kwota: zadluzenie, dzien: w.stan.dzien });
      return { status: 'do-zrobienia', zrodlo: 'dane-zus', ostrzezenia, potwierdzenieRodzica: false };
    }
    if (porownajDaty(w.stan.dzien, termin) > 0) {
      return {
        status: 'zalatwiona',
        zrodlo: 'dane-zus',
        dataOznaczenia: w.stan.dzien,
        ostrzezenia,
        potwierdzenieRodzica: false,
      };
    }
  }
  const potwierdzenieRodzica = w.stan === null || w.stanNiedostepny;
  if (w.stanNiedostepny) ostrzezenia.push({ rodzaj: 'stan-rozliczen-niedostepny' });
  const potwierdzenie = w.potwierdzenia.find((p) => p.miesiac === w.miesiac);
  if (potwierdzenie && potwierdzenieRodzica) {
    return {
      status: 'zalatwiona',
      zrodlo: 'odpowiedz-rodzica',
      dataOznaczenia: dataZeZnacznika(potwierdzenie.czas),
      ostrzezenia,
      potwierdzenieRodzica,
    };
  }
  return { status: 'do-zrobienia', zrodlo: 'wyliczenie-planu', ostrzezenia, potwierdzenieRodzica };
}

export interface OcenaStraznika {
  forma: FormaStraznika;
  /** Dane z konta ZUS matki są dostępne. */
  daneZus: boolean;
  odczytano?: string;
  tytul: TytulUbezpieczenia | null;
  /** null bez danych z konta ZUS. */
  duchAktywne: boolean | null;
  stanRozliczen: StanRozliczenSkladek | null;
  stanRozliczenNiedostepny: boolean;
  zadluzenie: Grosze | null;
  prog: Grosze;
  /** Progi zadłużenia od dziś do przewidywanego terminu porodu (historyjka 3.6.1.3.2). */
  progi: { prog: Grosze; od: DataISO }[];
  podwyzszenie: PodwyzszeniePodstawy | null;
  /** Sprawa Opłacenie składek bieżącego miesiąca (wyłącznie JDG). */
  oplacenie: ({ miesiac: MiesiacISO; termin: DataISO; idSprawy: IdSprawy } & StatusOplacenia) | null;
  /** Ostrzeżenia strażnika w etapie Ciąża. */
  liczbaOstrzezen: number;
}

export interface WejscieStraznika {
  daneRodziny: DaneRodziny;
  daneCiazy: DaneCiazyIDziecka | null;
  kopia: DaneZKontaZus | null;
  katalog: Katalog;
  progPodwyzszeniaProcent: number;
  dzis: DataISO;
}

/** Stan strażnika ubezpieczenia chorobowego albo null, gdy strażnik nie dotyczy rodziny. */
export function ocenStraznika(w: WejscieStraznika): OcenaStraznika | null {
  const forma = formaStraznika(w.daneRodziny, w.daneCiazy);
  if (forma === null) return null;
  const kopia = w.kopia;
  const tytul = kopia ? tytulStraznika(kopia, forma, w.dzis) : null;
  const uop = forma === 'umowa-o-prace';
  const duchAktywne = kopia && !uop ? czyDuchAktywne(tytul, w.dzis) : null;
  const stanNiedostepny = kopia?.stanRozliczenNiedostepny === true;
  const stan = kopia && forma === 'jdg' ? ostatniStanRozliczen(kopia) : null;
  const prog = progZadluzenia(w.katalog, w.dzis);
  const podstawy = tytul?.podstawySkladek ?? [];
  const podwyzszenie = podwyzszeniePodstawy(podstawy, w.progPodwyzszeniaProcent);
  // Matce na umowie o pracę strażnik pokazuje wyłącznie ostrzeżenie o podwyższeniu podstawy.
  if (uop && podwyzszenie === null) return null;
  let oplacenie: OcenaStraznika['oplacenie'] = null;
  const sprawaOplacenia = oplacenieSkladekNaDzien(forma, w.dzis);
  if (sprawaOplacenia) {
    oplacenie = {
      ...sprawaOplacenia,
      ...statusOplacenia({
        miesiac: sprawaOplacenia.miesiac,
        potwierdzenia: w.daneRodziny.matka.potwierdzeniaSkladek ?? [],
        stan,
        stanNiedostepny: forma === 'jdg' && stanNiedostepny,
        prog,
      }),
    };
  }
  const liczbaOstrzezen =
    (duchAktywne === false ? 1 : 0) + (podwyzszenie ? 1 : 0) + (oplacenie?.ostrzezenia.length ?? 0);
  return {
    forma,
    daneZus: kopia !== null,
    odczytano: kopia?.odczytano,
    tytul,
    duchAktywne,
    stanRozliczen: stan,
    stanRozliczenNiedostepny: forma === 'jdg' && stanNiedostepny,
    zadluzenie: stan ? zadluzenieDlaStraznika(stan) : null,
    prog,
    progi: progiZadluzenia(w.katalog, w.dzis, w.daneCiazy?.przewidywanyTerminPorodu ?? w.dzis),
    podwyzszenie,
    oplacenie,
    liczbaOstrzezen,
  };
}

/** Ostrzeżenia strażnika o prawie do zasiłku macierzyńskiego: brak DUCh i podwyższenie podstawy. */
export function ostrzezeniaPrawaDoZasilku(ocena: OcenaStraznika): OstrzezenieSprawy[] {
  const wynik: OstrzezenieSprawy[] = [];
  if (ocena.duchAktywne === false) wynik.push({ rodzaj: 'brak-duch' });
  if (ocena.podwyzszenie) {
    const p = ocena.podwyzszenie;
    wynik.push({
      rodzaj: 'podwyzszenie-podstawy',
      srednia: p.srednia,
      ostatnia: p.ostatnia,
      wzrost: p.wzrost,
      wzrostProcent: p.wzrostProcent,
    });
  }
  return wynik;
}

/** Matce JDG z DUCh po potwierdzeniu daty porodu sprawa K19 pokazuje informację o ustaniu DUCh. */
export function czyInformacjaPoPorodzie(daneRodziny: DaneRodziny, daneCiazy: DaneCiazyIDziecka | null): boolean {
  return czyPorodPotwierdzony(daneCiazy) && formaMatkiZDuch(daneRodziny) === 'jdg';
}
