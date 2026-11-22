// Żądania i odpowiedzi REST API w wersji 1 (trasy src/app/api/v1/**, opis OpenAPI w GET /api/v1/openapi.json).
// Elementy systemu: Kalkulatory decyzji, Plan rodzica, Kalendarz terminów, Świadczenia w ciąży, Odczyt danych ZUS,
// Kreatory wniosków. Daty mają postać 'RRRR-MM-DD', chwile 'RRRR-MM-DDTHH:MM:SS' w strefie Europe/Warsaw, kwoty są w groszach.
import type { WynikPodzialu, ZasadyPodzialu } from '@/domena/kalkulatory/podzial';
import type { WynikPorownaniaWariantow } from '@/domena/kalkulatory/wariant';
import type { WynikPorownaniaWyliczenia } from '@/domena/przykladowe-sprawy/porownanie';
import type { PorownanieWyliczeniaSprawy, WyliczenieSprawy } from '@/domena/przykladowe-sprawy/wyliczenie';
import type { SwiadczeniaWCiazy } from '@/domena/zasilki/prawo-w-ciazy';
import type { KodKomunikatu } from '@/domena/typy/komunikaty';
import type {
  DaneDrugiegoRodzicaZKonta,
  DaneZKontaZus,
  KontekstPytaniaDoZus,
  PodstawaSkladek,
  PytanieDoZus,
  StanRozliczenSkladek,
  ZaswiadczenieEzla,
  ZaswiadczenieOStanieRozliczen,
  ZrodloweDaneKontaZus,
} from '@/domena/typy/dane-zus';
import type { DaneCiazyIDziecka } from '@/domena/typy/ciaza-dziecko';
import type { DaneWejscioweKalkulatora, ParametryScenariusza, PodstawaWymiaru, WynikiKalkulacji, WynikScenariusza } from '@/domena/typy/kalkulacje';
import type { KalendarzTerminow } from '@/domena/typy/terminy';
import type { ParametrySystemu, StanSymulowanegoZus } from '@/domena/typy/magazyn';
import type { PlanRodziny } from '@/domena/typy/plan';
import type { DaneSprawy, DokumentSprawy, RozstrzygniecieSprawy, WynikWeryfikacjiSprawy } from '@/domena/typy/przykladowe-sprawy';
import type { DaneRodziny } from '@/domena/typy/rodzina';
import type { AdresatWniosku, Wniosek, WniosekZ15, WniosekZam, WniosekZas53 } from '@/domena/typy/wnioski';
import type {
  DataISO,
  FormaZatrudnienia,
  Grosze,
  IdSprawy,
  IdWniosku,
  Pesel,
  Procent,
  RodzicWRodzinie,
  ZnacznikCzasu,
} from '@/domena/typy/wspolne';

// --- Wspólne ------------------------------------------------------------------------------------

/** Odpowiedź błędu każdego punktu końcowego: kod z tablicy komunikatów, kody pól i parametry treści komunikatu. */
export interface BladApi { kod: KodKomunikatu; pola?: Record<string, KodKomunikatu>; parametry?: Record<string, string> }
/** Komunikat z tablicy komunikatów dołączony do udanej odpowiedzi (typ INFO albo WARNING). */
export interface KomunikatApi { kod: KodKomunikatu; parametry?: Record<string, string> }

/**
 * Czas żądania. `dzis` podstawia dzień wyliczenia, `dataDemo` działa jak parametr systemu dataDemo (dzień z godziną serwera),
 * a `teraz` podstawia pełną chwilę. Bez nich serwer liczy od bieżącej daty i godziny w strefie Europe/Warsaw.
 * W żądaniach GET te same pola są parametrami adresu, a `dataDemo` także nagłówkiem `X-Data-Demo`.
 */
export interface CzasZadaniaApi { dzis?: DataISO; dataDemo?: DataISO; teraz?: ZnacznikCzasu }

/**
 * Przełączniki symulacji z ustawień demo (`ParametrySystemu.symulacje`), które API obsługuje. Żądanie podaje je w polu
 * `symulacje` (lista nazw albo obiekt z wartościami logicznymi) albo w nagłówku `X-Symulacje` (nazwy po przecinku).
 */
export type SymulacjaApi = Extract<keyof ParametrySystemu['symulacje'],
  'daneZusNiedostepne' | 'stanRozliczenNiedostepny' | 'wysylkaDoZusNiedostepna' | 'pueEzusNiedostepne'>;
export interface SymulacjeZadaniaApi { symulacje?: SymulacjaApi[] | Partial<Record<SymulacjaApi, boolean>> }

/** Czas, w którym serwer wykonał wyliczenie, i wersja katalogu świadczeń użyta w wyliczeniu. */
export interface CzasOdpowiedziApi { dzis: DataISO; teraz: ZnacznikCzasu; wersjaKatalogu: number }

/**
 * Podstawa wymiaru zasiłku w żądaniu: kwota wpisana (`kwota`), podstawy składek z 12 miesięcy (`podstawySkladek`)
 * albo PESEL konta w symulowanym ZUS, z którego serwer odczyta tytuły ubezpieczenia (`peselKontaZus`). Etat `pelnyEtat`
 * dotyczy formy 'umowa-o-prace' z żądania albo z danych wejściowych kalkulatora.
 */
export type PodstawaWZadaniuApi =
  | { kwota: Grosze; pelnyEtat?: boolean; forma?: FormaZatrudnienia }
  | { podstawySkladek: PodstawaSkladek[]; forma?: FormaZatrudnienia; pelnyEtat?: boolean; poczatekUbezpieczenia?: DataISO }
  | { peselKontaZus: Pesel; forma?: FormaZatrudnienia; pelnyEtat?: boolean };

// --- POST /api/v1/kalkulator/zasilek-macierzynski ---------------------------------------------------

/**
 * Dane wejściowe kalkulatora. Każde pole przyjmuje wartość z oznaczeniem źródła `{ wartosc, zrodlo }` albo samą wartość,
 * której serwer nadaje źródło 'wartosc-w-kalkulatorze'.
 */
export interface ZadanieZasilkuMacierzynskiegoApi extends CzasZadaniaApi {
  daneWejsciowe: DaneWejscioweKalkulatora | Record<string, unknown>;
  podstawy?: Partial<Record<RodzicWRodzinie, PodstawaWZadaniuApi>>;
  parametry?: ParametryScenariusza;
}
export interface OdpowiedzZasilkuMacierzynskiegoApi extends CzasOdpowiedziApi {
  wynik: WynikScenariusza;
  daneWejsciowe: DaneWejscioweKalkulatora;
  parametry: ParametryScenariusza;
  podstawy: Partial<Record<RodzicWRodzinie, PodstawaWymiaru>>;
  /** 0094 bez podstaw składek z ubezpieczeniem chorobowym, 0173 bez danych ZUS drugiego rodzica. */
  komunikatyPodstaw: Partial<Record<RodzicWRodzinie, KomunikatApi>>;
  wariant815: { dostepny: boolean; termin: DataISO | null };
  /** Przy wariancie 81,5%: suma matki w obu wariantach i komunikat 0246, gdy wariant 81,5% daje mniej. */
  porownanieWariantow?: { suma815: Grosze; suma100i70: Grosze; komunikat?: KomunikatApi };
}

// --- POST /api/v1/kalkulator/wariant ---------------------------------------------------------------

export interface ZadanieWariantuApi extends CzasZadaniaApi {
  podstawa: PodstawaWZadaniuApi;
  dataPorodu: DataISO;
  liczbaDzieci: number;
  zaZyciem?: boolean;
  /** Tygodnie urlopu rodzicielskiego matki przed powrotem do pracy; domyślnie cały wymiar jednego rodzica. */
  tygodniePrzedPowrotem?: number;
}
export interface OdpowiedzWariantuApi extends CzasOdpowiedziApi {
  podstawa: PodstawaWymiaru; tygodniePrzedPowrotem: number; wynik: WynikPorownaniaWariantow;
}

// --- POST /api/v1/kalkulator/podzial-urlopu ----------------------------------------------------------

export interface ZadaniePodzialuUrlopuApi extends CzasZadaniaApi {
  podstawy: Partial<Record<RodzicWRodzinie, PodstawaWZadaniuApi>>;
  wariantMatki?: '81-5' | '100-70';
  /** Data porodu albo przewidywany termin porodu; od niej zależą wartości katalogu. Domyślnie `dzis`. */
  dataPorodu?: DataISO;
  liczbaDzieci: number;
  zaZyciem?: boolean;
  /** Bez tygodni serwer przyjmuje wartości startowe kalkulatora. */
  tygodnieMatki?: number;
  tygodnieDrugiegoRodzica?: number;
  drugiRodzicBezPrawa?: boolean;
}
export interface OdpowiedzPodzialuUrlopuApi extends CzasOdpowiedziApi {
  zasady: ZasadyPodzialu; tygodnieMatki: number; tygodnieDrugiegoRodzica: number; wynik: WynikPodzialu;
}

// --- POST /api/v1/plan ---------------------------------------------------------------------------

export interface ZadaniePlanuApi extends CzasZadaniaApi {
  daneRodziny: DaneRodziny;
  daneCiazy?: DaneCiazyIDziecka | null;
  zgoda?: boolean;
  /** Kopia Danych z konta ZUS matki; zamiast niej `peselMatki`, z którego serwer odczyta dane symulowanego ZUS. */
  daneZusMatki?: DaneZKontaZus | null;
  peselMatki?: Pesel;
  daneZusDrugiegoRodzica?: DaneZKontaZus | DaneDrugiegoRodzicaZKonta | null;
  peselDrugiegoRodzica?: Pesel;
  wnioski?: Wniosek[];
  wynikiKalkulacji?: WynikiKalkulacji;
  poprzedniPlan?: PlanRodziny | null;
  parametry?: Partial<Pick<ParametrySystemu, 'progPodwyzszeniaPodstawyProcent' | 'progOstrzezeniaOkresuZasilkowegoDni'>>;
}
export interface OdpowiedzPlanuApi extends CzasOdpowiedziApi { plan: PlanRodziny; kalendarz: KalendarzTerminow }

// --- POST /api/v1/swiadczenia-w-ciazy --------------------------------------------------------------

export interface ZadanieSwiadczenWCiazyApi extends CzasZadaniaApi {
  daneRodziny: DaneRodziny;
  daneCiazy?: DaneCiazyIDziecka | null;
  osoba?: 'matka' | 'drugi-rodzic';
  kopia?: DaneZKontaZus | null;
  peselKontaZus?: Pesel;
  zgoda?: boolean;
  /** Na koncie drugiego rodzica: tytuły matki do profilu (dane z konta ZUS matki albo dane po dołączeniu). */
  tytulyMatkiDlaProfilu?: DaneZKontaZus | DaneDrugiegoRodzicaZKonta | null;
}
export interface OdpowiedzSwiadczenWCiazyApi extends CzasOdpowiedziApi { swiadczenia: SwiadczeniaWCiazy }

// --- POST /api/v1/przykladowe-sprawy/weryfikacja ------------------------------------------------------

/** Sprawa wzorcowa z listy przewodnika (`idSprawyWzorcowej`, na przykład 'S01') albo dane sprawy z dokumentów. */
export interface ZadanieWeryfikacjiSprawyApi extends CzasZadaniaApi {
  idSprawyWzorcowej?: string;
  dane?: DaneSprawy;
  dokumenty?: DokumentSprawy[];
  rozstrzygniecie?: RozstrzygniecieSprawy[];
  /** Tolerancja porównania kwot z rozstrzygnięciem w groszach; domyślnie parametr systemu tolerancjaPorownaniaKwotyGrosze. */
  tolerancjaPorownaniaKwotyGrosze?: Grosze;
}
export interface OdpowiedzWeryfikacjiSprawyApi extends CzasOdpowiedziApi {
  weryfikacja: WynikWeryfikacjiSprawy;
  podstawa: PodstawaWymiaru | null;
  komunikatPodstawy?: KomunikatApi;
  wyliczenie: WynikScenariusza | null;
  /** Porównanie okresu i kwoty z rozstrzygnięciem sprawy z tolerancją 1 grosza (0111, 0112, 0180). */
  porownanieWyliczenia?: WynikPorownaniaWyliczenia;
  /**
   * Wyliczenie każdego świadczenia, które według weryfikacji przysługuje: zasiłek macierzyński, zasiłek w wysokości
   * zasiłku macierzyńskiego (ZWZM) i zasiłek chorobowy z wynagrodzeniem chorobowym; null, gdy podstawy nie da się ustalić.
   */
  wyliczeniaSwiadczen: WyliczenieSprawy | null;
  /** 0094 albo 0173, gdy świadczenie przysługuje, a dokumenty sprawy nie dają podstawy wymiaru. */
  komunikatWyliczen?: KomunikatApi;
  /** Porównanie prawa, okresu i kwoty miesięcznej każdego świadczenia z rozstrzygnięciem (0111, 0112, 0180). */
  porownanieSwiadczen?: PorownanieWyliczeniaSprawy;
}

// --- Symulowany ZUS -----------------------------------------------------------------------------------

/**
 * Treść POST /api/v1/zus/konto. PESEL konta jedzie w treści żądania, którą szyfruje połączenie HTTPS, więc nie trafia
 * do adresu, nagłówków, logów serwera ani historii przeglądarki. `zgodaNaDaneZdrowia: false` pomija zaświadczenia e-ZLA,
 * `postac: 'zrodlowe'` zwraca dane źródłowe konta, a `kanal: 'pue-ezus'` oznacza odczyt przez PUE/eZUS.
 */
export interface ZadanieKontaZusApi extends CzasZadaniaApi, SymulacjeZadaniaApi {
  pesel: Pesel;
  zgodaNaDaneZdrowia?: boolean;
  postac?: 'zrodlowe';
  kanal?: 'pue-ezus';
}
/** Treść POST /api/v1/zus/konto/stan-rozliczen: PESEL konta i dzień stanu, domyślnie `dzis`. */
export interface ZadanieStanuRozliczenApi extends CzasZadaniaApi, SymulacjeZadaniaApi { pesel: Pesel; dzien?: DataISO }
/** Treść POST /api/v1/zus/konto/e-zla: PESEL konta i zgoda na dane dotyczące zdrowia, bez której API odpowiada kodem 0004. */
export interface ZadanieEzlaApi extends CzasZadaniaApi, SymulacjeZadaniaApi { pesel: Pesel; zgodaNaDaneZdrowia: boolean }
export interface OdpowiedzKontaZusApi { dane: DaneZKontaZus }
/**
 * Odpowiedź POST /api/v1/zus/konto z `postac: 'zrodlowe'`: dane źródłowe konta w symulowanym ZUS przed filtrami odczytu.
 * Przeglądarka nakłada na nie swój stan symulacji i przygotowuje kopię z oznaczeniem nowych dzieci względem poprzedniej kopii.
 * Przy `zgodaNaDaneZdrowia: false` lista zaświadczeń e-ZLA jest pusta.
 */
export interface OdpowiedzZrodlowychDanychKontaZusApi { zrodlo: ZrodloweDaneKontaZus }
/**
 * Stan symulowanego ZUS z ustawień demo przeglądarki: nadpisania scenariuszy demonstracyjnych, dziecko z symulacji narodzin,
 * wnioski wysłane z przewodnika, zaświadczenia i korespondencja. Serwer nie przechowuje stanu symulacji, więc nakłada
 * go na dane startowe konta tą samą funkcją co przeglądarka, gdy dotyczy konta z żądania.
 */
export interface StanSymulacjiZusApi { stanSymulowany?: StanSymulowanegoZus | null }
export interface OdpowiedzStanuRozliczenApi {
  pesel: Pesel; dzien: DataISO;
  stan: StanRozliczenSkladek | null;
  /** 'o-niezaleganiu' albo 'o-wysokosci-zadluzenia': dokument, który ZUS wyda według stanu z dnia. */
  rodzajZaswiadczenia: ZaswiadczenieOStanieRozliczen['rodzaj'] | null;
  komunikaty: KomunikatApi[];
}
export interface ZadanieZaswiadczeniaApi extends CzasZadaniaApi, SymulacjeZadaniaApi, StanSymulacjiZusApi {
  pesel: Pesel; dzien?: DataISO;
  /** Imię i nazwisko wnioskodawcy dla konta spoza danych startowych symulowanego ZUS. */
  wnioskodawca?: { imie: string; nazwisko: string };
}
export interface OdpowiedzZaswiadczeniaApi { zaswiadczenie: ZaswiadczenieOStanieRozliczen }
export interface OdpowiedzEzlaApi { pesel: Pesel; poczatekOkna: DataISO; zaswiadczenia: ZaswiadczenieEzla[] }

export type WniosekDoZusApi = WniosekZam | WniosekZas53 | WniosekZ15;
export interface ZadanieWnioskuDoZusApi extends CzasZadaniaApi, SymulacjeZadaniaApi {
  wniosek: WniosekDoZusApi;
  /** Identyfikatory załączników wymaganych przed wysłaniem (dla Z-15 lista z kreatora). */
  wymaganeZalaczniki?: string[];
  /** Wniosek ZAM: dane ciąży i plan rodziny do ponownego sprawdzenia terminu 21 dni na wariant 81,5% (0038). */
  daneCiazy?: DaneCiazyIDziecka | null;
  plan?: PlanRodziny | null;
  /** Ostatni numer dnia (NNNN z numeru potwierdzenia), który klient dostał dla tego rodzaju wniosku; serwer nadaje wyższy. */
  ostatniNumerPotwierdzenia?: number;
}
export interface OdpowiedzWnioskuDoZusApi {
  idWniosku: IdWniosku; rodzaj: WniosekDoZusApi['rodzaj']; stan: 'wyslany'; adresat: AdresatWniosku;
  dataZlozenia: DataISO; potwierdzenie: string; przyjeto: ZnacznikCzasu;
  /** Wniosek w stanie wysłanym; załączniki mają nazwę pliku bez odwołania do pliku w przeglądarce. */
  wniosek: WniosekDoZusApi;
}

export interface ZadaniePytaniaDoZusApi extends CzasZadaniaApi, SymulacjeZadaniaApi {
  pesel: Pesel; tresc: string; idSprawy?: IdSprawy; kontekst?: KontekstPytaniaDoZus;
}
export interface OdpowiedzPytaniaDoZusApi { pytanie: PytanieDoZus; przewidywanaOdpowiedz: ZnacznikCzasu }

// --- POST /api/v1/walidacje/{rodzaj} ---------------------------------------------------------------------

export type RodzajWalidacjiApi = 'pesel' | 'imie' | 'nazwisko' | 'email' | 'telefon' | 'rachunek' | 'kod-pocztowy'
  | 'kwota' | 'data' | 'tresc-pytania' | 'plik' | 'dane-wejsciowe-kalkulatora' | 'dane-sprawy' | 'dane-zam';
export interface ZadanieWalidacjiApi extends CzasZadaniaApi {
  /** Tekst pola dla walidacji pojedynczego pola. */
  wartosc?: string;
  wymagany?: boolean;
  /** Plik: typ MIME i rozmiar w bajtach. */
  plik?: { typ: string; rozmiar: number };
  /** Obiekt dla walidacji danych wejściowych kalkulatora, danych sprawy i danych wniosku ZAM. */
  dane?: unknown;
}
export interface OdpowiedzWalidacjiApi { poprawne: true; wartosc?: string | number | Record<string, unknown> }

/** Procent zostaje w odpowiedziach jako liczba, na przykład 81.5. */
export type ProcentApi = Procent;
