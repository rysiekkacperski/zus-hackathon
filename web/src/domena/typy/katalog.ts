// Grupa danych 7 Katalog świadczeń (kontrakt, sekcja 5.8).
// Element systemu: Katalog świadczeń.
import type { RodzajSytuacjiSzczegolnej } from '@/domena/typy/ciaza-dziecko';
import type { IdWidoku } from '@/domena/typy/widoki';
import type {
  DataISO,
  FormaZatrudnienia,
  Grosze,
  IdPozycji,
  IdWpisuSlownika,
  Pesel,
  ZnacznikCzasu,
} from '@/domena/typy/wspolne';

export type RodzajPozycji = 'swiadczenie' | 'uprawnienie' | 'obowiazek' | 'informacja';
export type Etap = 'ciaza' | 'pierwsze-tygodnie' | 'urlopy-i-zasilek' | 'pieniadze-na-dziecko' | 'powrot-do-pracy';
export type RodzicPozycji = 'matka' | 'drugi-rodzic' | 'oboje-rodzice' | 'matka-albo-ojciec'
  | 'kazdy-rodzic-na-umowie-o-prace' | 'rodzic-przyjmujacy' | 'matka-a-bez-tytulu-drugi-rodzic';
export type Kotwica = 'brak' | 'koniec-10-tygodnia' | 'przewidywany-termin-porodu' | 'data-porodu'
  | 'data-przyjecia' | 'data-uprawomocnienia' | 'data-urodzenia-dziecka';
export type RegulaTerminu =
  | { typ: 'brak' }
  | { typ: 'przesuniecie'; kotwica: Exclude<Kotwica, 'brak'>; przesuniecie: number; jednostka: 'dni' | 'miesiace'; korekta?: { przesuniecie: number; jednostka: 'dni' | 'miesiace' } }
  | { typ: 'plus-wymiar'; kotwica: Exclude<Kotwica, 'brak'>; idWpisu: IdWpisuSlownika }
  | { typ: 'dzien-przed-urodzinami'; lata: number }
  | { typ: 'koniec-roku-urodzin'; lata: number }
  | { typ: 'koniec-miesiaca-wieku'; miesiace: number }
  | { typ: 'coroczny'; dzien: string; poczatekSkladania?: string; zalecany?: string; doRokuUrodzin?: number } // 'MM-DD'
  | { typ: 'dwa-terminy'; pierwszy: RegulaTerminu; drugi: RegulaTerminu; kluczEtykietyDrugiego: string }
  | { typ: 'specjalna'; kod: string; opis: string };   // reguła złożona z kodem obsługiwanym przez u13
export type KosztSpoznieniaPozycji =
  | { typ: 'brak' }
  | { typ: 'skutek'; tekst: string }
  | { typ: 'kwota'; idWpisuKwoty: IdWpisuSlownika; sposob: 'jednorazowo' | 'za-miesiace'; minimum?: Grosze; naDziecko: boolean;
      idWpisuProgu?: IdWpisuSlownika; tekst: string }
  | { typ: 'specjalny'; kod: string; tekst: string };
export type KanalPozycji =
  | { typ: 'kreator'; idWidoku: IdWidoku }
  | { typ: 'zewnetrzny'; kanal: 'ezus' | 'empatia' | 'mobywatel' | 'gov-rejestr-stanu-cywilnego' | 'gov-zgloszenie-urodzenia'; adres: string; adresSymulowany: string }
  | { typ: 'u-pracodawcy' } | { typ: 'informacja' };
export interface InstrukcjaPozycji { kroki: string[]; daneIDokumenty: string[]; adresKanalu?: string; odnosniki: { etykieta: string; url: string }[] }
export interface WarunekStrukturalny { formyZatrudnienia: FormaZatrudnienia[]; ubezpieczenieChorobowe: 'wymagane' | 'brak' | 'bez-znaczenia';
  warunekEtapu: 'dziecko-nie-urodzilo-sie' | 'dziecko-urodzilo-sie' }
export interface PozycjaKatalogu {
  id: IdPozycji; tytul: string; rodzaj: RodzajPozycji; etap: Etap; rodzic: RodzicPozycji;
  warunekOpis: string; warunekStrukturalny?: WarunekStrukturalny;   // pozycje dodane w panelu
  instytucjaIKanal: string; kanaly: Partial<Record<FormaZatrudnienia | 'kazda', KanalPozycji>>;
  regulaTerminu: RegulaTerminu; kosztSpoznienia: KosztSpoznieniaPozycji; instrukcja: InstrukcjaPozycji;
  dodano?: { przez: Pesel; czas: ZnacznikCzasu };
  wylaczona?: boolean;                            // pozycja wyłączona przez Administratora: plan rodziny jej nie pokazuje
  zmieniono?: { przez: Pesel; czas: ZnacznikCzasu; regulaTerminu: boolean };   // ostatnia zmiana pozycji w panelu
}
/** Pola pozycji katalogu, które Administrator zmienia w panelu (ViewCatalogItemEdit). */
export interface ZmianyPolPozycji { tytul?: string; warunekOpis?: string; instytucjaIKanal?: string;
  daneIDokumenty?: string[]; kroki?: string[]; regulaTerminu?: RegulaTerminu; wylaczona?: boolean }
export interface ZmianaPozycjiKatalogu { id: IdPozycji; zmiany: ZmianyPolPozycji; przez: Pesel; czas: ZnacznikCzasu }
export type RodzajSlownika = 'kwoty-i-progi' | 'wymiary-i-okresy';
export type JednostkaWariantu = 'zl' | 'procent' | 'tygodnie' | 'dni' | 'miesiace' | 'lata' | 'osoby' | 'czesci' | 'g' | 'procent-etatu';
export interface WariantWpisu { klucz: string; etykieta: string; jednostka: JednostkaWariantu; wyprowadzony?: { zWpisu: IdWpisuSlownika; zWariantu: string; mnoznik?: number; pomniejszenieProcent?: number } }
export interface WersjaWpisu { od: DataISO; do?: DataISO; wartosci: Record<string, number>; dodano?: { przez: Pesel; czas: ZnacznikCzasu } }
export interface WpisSlownika { id: IdWpisuSlownika; slownik: RodzajSlownika; nazwa: string; warianty: WariantWpisu[];
  wersje: WersjaWpisu[]; szablonOpisu: string; edytowalny: boolean; reguly?: IdRegulySwiadczenia[]; kolejnosc: number }
export type IdRegulySwiadczenia = 'podleganie' | 'okres-wyczekiwania' | 'wyjatki-wyczekiwania' | 'wynagrodzenie-chorobowe'
  | 'zasilek-chorobowy' | 'okres-zasilkowy' | 'zasilek-po-ustaniu' | 'swiadczenie-rehabilitacyjne' | 'zwzm'
  | 'zasilek-macierzynski-bez-wyczekiwania' | 'zadluzenie' | 'platnik-swiadczenia';
export interface RegulaSwiadczenia { id: IdRegulySwiadczenia; nazwa: string; tresc: string; wpisy: IdWpisuSlownika[] }
export interface WpisSlownikaDokumentow { id: string; grupa: 'zasilek-chorobowy' | 'swiadczenie-rehabilitacyjne' | 'zwzm' | 'zasilek-macierzynski' | 'zalaczniki' | 'wnioski-pracownika';
  swiadczenieAlboWniosek: string;
  klucz: { formy: FormaZatrudnienia[] | 'kazda'; platnik?: 'platnik-uprawniony' | 'zus'; poUstaniu?: boolean; sytuacja?: string };
  dokumenty: string[]; adresat: string; termin: string; kolejnosc: number }
export interface PodmiotWsparcia { id: string; nazwa: string; sytuacje: RodzajSytuacjiSzczegolnej[]; zakresPomocy: string;
  telefon?: string; email?: string; adresStrony: string; krs?: string; charytatywny: true; kolejnosc: number;
  /** Dzień sprawdzenia statusu organizacji pożytku publicznego w KRS (api-krs.ms.gov.pl, odpis aktualny). */
  weryfikacjaKrs?: DataISO }
export interface EdycjeKatalogu { wersja: number; noweWersje: { idWpisu: IdWpisuSlownika; wersja: WersjaWpisu }[];
  nowePozycje: PozycjaKatalogu[]; podmioty: { dodane: PodmiotWsparcia[]; zmienione: PodmiotWsparcia[] };
  // Pola dodane po pierwszej wersji układu; zapis bez nich oznacza brak takich edycji.
  zmienionePozycje?: ZmianaPozycjiKatalogu[];     // zmiany pól i wyłączenia pozycji, w kolejności zapisu
  dokumenty?: { dodane: WpisSlownikaDokumentow[]; zmienione: WpisSlownikaDokumentow[] };
  noweWpisy?: WpisSlownika[];                     // nowe wpisy słowników (parametry) dodane w panelu
}
/** Pojedyncza zmiana katalogu wysyłana do usługi REST /api/katalog i stosowana w przeglądarce tą samą funkcją. */
export type ZmianaKatalogu =
  | { rodzaj: 'nowa-wersja'; idWpisu: IdWpisuSlownika; wersja: WersjaWpisu }
  | { rodzaj: 'nowa-pozycja'; pozycja: PozycjaKatalogu }
  | { rodzaj: 'zmiana-pozycji'; zmiana: ZmianaPozycjiKatalogu }
  | { rodzaj: 'podmiot'; podmiot: PodmiotWsparcia; nowy: boolean }
  | { rodzaj: 'dokument'; dokument: WpisSlownikaDokumentow; nowy: boolean }
  | { rodzaj: 'nowy-wpis'; wpis: WpisSlownika }
  | { rodzaj: 'przywrocenie' };
export interface Katalog {                        // seed złożony z edycjami Administratora
  wersja: number; pozycje: PozycjaKatalogu[]; slowniki: WpisSlownika[];
  reguly: RegulaSwiadczenia[]; dokumenty: WpisSlownikaDokumentow[]; podmiotyWsparcia: PodmiotWsparcia[];
  dataUruchomienia: DataISO;                      // '2026-01-01'
}
export interface WartoscObowiazujaca { wartosc: number; jednostka: JednostkaWariantu; od: DataISO; do?: DataISO; nazwaWpisu: string }
