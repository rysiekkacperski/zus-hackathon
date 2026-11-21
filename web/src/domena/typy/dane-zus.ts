// Grupa danych 4 Dane z konta ZUS (kontrakt, sekcja 5.5).
// Element systemu: Odczyt danych ZUS.
import type { FormaPrzyjecia } from '@/domena/typy/ciaza-dziecko';
import type { Etap } from '@/domena/typy/katalog';
import type { StatusSprawy } from '@/domena/typy/plan';
import type { PlatnikZasilku } from '@/domena/typy/rodzina';
import type {
  DataISO,
  FormaZatrudnienia,
  Grosze,
  IdPliku,
  IdSprawy,
  IdWniosku,
  MiesiacISO,
  OkresOtwarty,
  Pesel,
  ZnacznikCzasu,
} from '@/domena/typy/wspolne';

export type RodzajTytulu = 'pracownik' | 'zleceniobiorca' | 'dzialalnosc';
export type RodzajUbezpieczeniaChorobowego = 'obowiazkowe' | 'dobrowolne' | 'brak';
export type PlatnikWyplacaZasilki = 'tak' | 'nie' | 'brak-informacji' | 'nie-dotyczy';
export interface PodstawaSkladek { miesiac: MiesiacISO; kwota: Grosze }
export interface PlatnikSkladek { nazwa: string; nip: string; regon: string; wyplacaZasilki: PlatnikWyplacaZasilki }
export interface TytulUbezpieczenia {
  id: string; rodzaj: RodzajTytulu; od: DataISO; do?: DataISO;
  ubezpieczenieChorobowe: { rodzaj: RodzajUbezpieczeniaChorobowego; od?: DataISO; do?: DataISO };
  podstawySkladek: PodstawaSkladek[];              // ostatnie 12 miesięcy
  platnik: PlatnikSkladek;
}
export interface CzlonekRodzinyZus { imie: string; nazwisko: string; pesel: Pesel; dataUrodzenia: DataISO; noweDziecko: boolean }
export interface ZasilekWyplacony { rodzaj: string; dataWyplaty: DataISO; kwota: Grosze; sposobWyplaty: 'przelew' | 'przekaz-pocztowy' }
export interface SwiadczenieRodzinneZus { rodzaj: '800-plus' | 'aktywny-rodzic'; kwota: Grosze; planowanyTerminWyplaty: DataISO }
export type RodzajWnioskuZus = 'swiadczenie-800-plus' | '800-plus-kolejny-okres' | 'aktywny-rodzic' | 'dobry-start' | 'zasilek-macierzynski' | 'zasilek-chorobowy';
export type StatusWnioskuZus = 'zlozony' | 'w-trakcie' | 'przyznanie' | 'odmowa';
export interface WniosekZus { idWniosku: string; rodzaj: RodzajWnioskuZus; kanal: 'ezus' | 'mzus' | 'bankowosc' | 'empatia' | 'przewodnik';
  dataZlozenia: DataISO; status: StatusWnioskuZus; planowyTerminZalatwienia?: DataISO; idWnioskuPrzewodnika?: IdWniosku }
export interface ZaswiadczenieEzla { seriaINumer: string; dataWystawienia: DataISO; od: DataISO; do: DataISO;
  kodyLiterowe: ('B' | 'E')[]; platnik: string; rodzaj: 'choroba' | 'opieka' }
export interface UmowaOSplacie { rodzaj: 'uklad-ratalny' | 'odroczenie'; kwotaObjeta: Grosze; splacanaZgodnieZUmowa: boolean; caleZadluzenieObjete: boolean }
export interface StanRozliczenSkladek { dzien: DataISO; kwotaZadluzenia: Grosze; umowa?: UmowaOSplacie; dataSplaty?: DataISO;
  opisZadluzenia?: string; zadluzenieOd?: DataISO; odczytano: ZnacznikCzasu }
export interface ZaswiadczenieOStanieRozliczen { id: string; rodzaj: 'o-niezaleganiu' | 'o-wysokosci-zadluzenia'; dzienStanu: DataISO;
  kwotaZadluzenia: Grosze; umowa?: UmowaOSplacie; wystawiono: ZnacznikCzasu; imie: string; nazwisko: string; pesel: Pesel; idPliku?: IdPliku }
export interface KontekstPytaniaDoZus {
  sprawa?: { idSprawy: IdSprawy; tytul: string; etap: Etap; status: StatusSprawy; termin?: DataISO; terminSzacowany?: boolean };
  profil: { formaZatrudnienia?: FormaZatrudnienia; ubezpieczenieChorobowe?: boolean; platnikZasilku?: PlatnikZasilku;
    przewidywanyTerminPorodu?: DataISO; dataPorodu?: DataISO; liczbaDzieci?: number;
    przyjecie?: { forma: FormaPrzyjecia; dataPrzyjecia: DataISO } };
}
export interface PytanieDoZus { idPytania: string; idSprawy?: IdSprawy; tresc: string; kontekst: KontekstPytaniaDoZus;
  wyslano: ZnacznikCzasu; status: 'wyslane' | 'odpowiedz'; odpowiedz?: { tresc: string; czas: ZnacznikCzasu; symulowana: boolean };
  peselNadawcy: Pesel; powiadomionoOOdpowiedzi?: boolean }
export interface PelnomocnictwoPel { idPelnomocnictwa: string;
  mocodawca: { imie: string; nazwisko: string; imieINazwiskoDopelniacz: string; pesel: Pesel };
  peselPelnomocnika: Pesel; rola: 'ubezpieczony'; zakres: 'bez-ograniczen' | 'korespondencja';
  od?: DataISO; do?: DataISO; dataDotarcia: DataISO; dataOdwolania?: DataISO }
export type StanPelnomocnictwa = 'obowiazuje' | 'obowiazuje-od' | 'ograniczone' | 'wygaslo' | 'odwolane' | 'brak';
export interface DaneDrugiegoRodzicaZKonta {        // po dołączeniu albo z pełnomocnictwa PEL
  zrodlo: 'konto-zus' | 'pelnomocnictwo-pel'; tytuly: TytulUbezpieczenia[]; zasilki: ZasilekWyplacony[]; odczytano: ZnacznikCzasu }

export interface ZrodloweDaneKontaZus {             // dane źródłowe konta w symulowanym ZUS (seed + symulacje)
  pesel: Pesel; imie: string; nazwisko: string;
  tytuly: TytulUbezpieczenia[]; czlonkowieRodziny: Omit<CzlonekRodzinyZus, 'noweDziecko'>[];
  zasilki: ZasilekWyplacony[]; swiadczeniaRodzinne: SwiadczenieRodzinneZus[]; wnioski: WniosekZus[];
  zaswiadczeniaEzla: ZaswiadczenieEzla[]; osZadluzenia?: OsZadluzenia;
  zaswiadczeniaORozliczeniach: ZaswiadczenieOStanieRozliczen[];
  korespondencja: PytanieDoZus[]; pelnomocnictwa: PelnomocnictwoPel[];
  emailEzus?: string; adres?: string;
}
export interface OsZadluzenia { zmiany: { od: DataISO; kwota: Grosze; opis?: string }[]; umowa?: UmowaOSplacie & OkresOtwarty; splaty?: { dzien: DataISO; kwota: Grosze }[] }

export interface DaneZKontaZus {                    // kopia z datą odczytu, zapisywana na koncie
  odczytano: ZnacznikCzasu; pesel: Pesel; imie: string; nazwisko: string;
  tytuly: TytulUbezpieczenia[]; brakTytuluOd?: DataISO;
  czlonkowieRodziny: CzlonekRodzinyZus[];
  zasilki: ZasilekWyplacony[];                      // ostatnie 6 miesięcy
  swiadczeniaRodzinne: SwiadczenieRodzinneZus[]; wnioski: WniosekZus[];
  zaswiadczeniaEzla: ZaswiadczenieEzla[];           // ostatnie 12 miesięcy
  stanyRozliczen: StanRozliczenSkladek[];           // na dzień odczytu i dni powstania prawa ≤ dzień odczytu
  stanRozliczenNiedostepny?: boolean;               // 0150
  zaswiadczeniaORozliczeniach: ZaswiadczenieOStanieRozliczen[];
  korespondencja: PytanieDoZus[]; pelnomocnictwa: PelnomocnictwoPel[];
  daneDrugiegoRodzicaZPel?: DaneDrugiegoRodzicaZKonta;
  emailEzus?: string; adres?: string;
}
export type StanOdczytuZus =
  | { stan: 'brak' } | { stan: 'trwa'; pobrano: number; zKolei: number }
  | { stan: 'udany'; czas: ZnacznikCzasu }
  | { stan: 'nieudany-z-kopia'; czas: ZnacznikCzasu }   // 0002 z datą kopii
  | { stan: 'nieudany-bez-kopii'; czas: ZnacznikCzasu }; // 0001 z ponowieniem
