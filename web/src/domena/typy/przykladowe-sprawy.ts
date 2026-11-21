// Grupa danych 13 Dokumenty przykładowej sprawy (kontrakt, sekcja 5.14).
// Element systemu: Odczyt danych ZUS.
import type { LiczbaDzieci } from '@/domena/typy/ciaza-dziecko';
import type { RodzajTytulu, RodzajUbezpieczeniaChorobowego } from '@/domena/typy/dane-zus';
import type { KodKomunikatu } from '@/domena/typy/komunikaty';
import type { PrzyczynaUstaniaUmowy } from '@/domena/typy/rodzina';
import type { RodzajUrlopu } from '@/domena/typy/wnioski';
import type {
  DataISO,
  Grosze,
  IdPliku,
  MiesiacISO,
  Okres,
  OkresOtwarty,
  Pesel,
  Plec,
  Procent,
  ZnacznikCzasu,
} from '@/domena/typy/wspolne';

export type RodzajDokumentuSprawy = 'zam' | 'z-3' | 'z-3a' | 'z-3b' | 'zas-12' | 'poswiadczenie' | 'zrzut-zus' | 'e-zla'
  | 'zaswiadczenie-o-terminie-porodu' | 'zaswiadczenie-szpitala' | 'zaswiadczenie-o-martwym-urodzeniu' | 'zaswiadczenie-za-zyciem';
export type ZrodloWartosciSprawy = { rodzaj: 'dokument'; idDokumentu: string } | { rodzaj: 'sprawa-zespolu' }
  | { rodzaj: 'korekta-uzytkownika'; wartoscPierwotna: unknown } | { rodzaj: 'podaje-uzytkownik' } | { rodzaj: 'wartosc-domyslna' } | { rodzaj: 'brak' };
export interface WartoscSprawy<T> { wartosc: T | null; zrodlo: ZrodloWartosciSprawy; odczytaneAI?: boolean; daneZastapione?: boolean }
export interface DokumentSprawy { id: string; rodzaj: RodzajDokumentuSprawy; numer: number; wgrano: ZnacznikCzasu; usunietoPlik?: ZnacznikCzasu;
  idPliku?: IdPliku; plikZespolu?: string; konto: Pesel }
export interface DaneSprawy {
  ubezpieczony: { imie: WartoscSprawy<string>; nazwisko: WartoscSprawy<string>; pesel: WartoscSprawy<Pesel>; rola: WartoscSprawy<'matka' | 'ojciec-przejmujacy'> };
  tytul: { rodzaj: WartoscSprawy<RodzajTytulu | 'brak-tytulu'>; od: WartoscSprawy<DataISO>; dataUstania: WartoscSprawy<DataISO> };
  wymiarCzasuPracy: WartoscSprawy<'pelny-etat' | 'niepelny-etat'>;
  ubezpieczenieChorobowe: { rodzaj: WartoscSprawy<RodzajUbezpieczeniaChorobowego>; okresy: WartoscSprawy<OkresOtwarty[]>; dataUstaniaPrzyTrwajacymTytule: WartoscSprawy<DataISO> };
  liczbaUbezpieczonychPlatnika: WartoscSprawy<'do-20' | 'powyzej-20'>;
  ustanieZatrudnienia: { przyczyna: WartoscSprawy<PrzyczynaUstaniaUmowy>; inneZatrudnienie: WartoscSprawy<boolean> };
  pracaPoUstaniu: WartoscSprawy<boolean>;
  zdarzenie: { rodzaj: WartoscSprawy<'porod' | 'martwe-urodzenie' | 'niezdolnosc'>; dataPorodu: WartoscSprawy<DataISO>;
    przewidywanyTermin: WartoscSprawy<DataISO>; liczbaDzieci: WartoscSprawy<LiczbaDzieci>; liczbaMartwych: WartoscSprawy<number>;
    niezdolnosc: WartoscSprawy<{ od: DataISO; do: DataISO; kod?: string }>; dalszeOkresy: WartoscSprawy<Okres[]> };
  dziecko: { tydzienCiazy: WartoscSprawy<number>; masaG: WartoscSprawy<number>; pobyt: WartoscSprawy<Okres>; zaZyciem: WartoscSprawy<DataISO> };
  wniosek: { swiadczenia: WartoscSprawy<('zasilek-macierzynski' | 'zwzm' | 'zasilek-chorobowy')[]>; okresy: WartoscSprawy<{ rodzajUrlopu: RodzajUrlopu; od: DataISO; do: DataISO }[]>;
    oswiadczeniePelnyWymiar: WartoscSprawy<boolean>; dataZlozenia: WartoscSprawy<DataISO>; okresMatki: WartoscSprawy<Okres> };
  kwotyMiesieczne: WartoscSprawy<{ miesiac: MiesiacISO; kwota: Grosze; rodzaj: 'wynagrodzenie' | 'przychod' | 'podstawa-skladek';
    dniPrzepracowane?: number; dniDoPrzepracowania?: number; skladnik?: 'staly' | 'zmienny' | 'faktyczny' }[]>;
  poprzedniZasilek: WartoscSprawy<{ podstawa: Grosze; dataKonca: DataISO }>;
  zadluzenieJdg: WartoscSprawy<{ kwota: Grosze; dzien: DataISO }>;
  swiadczeniaPrzyznane: WartoscSprawy<{ rodzaj: string; od: DataISO; do: DataISO; kwota: Grosze }[]>;
}
export interface RozstrzygniecieSprawy { swiadczenie: 'zasilek-macierzynski' | 'zwzm' | 'zasilek-chorobowy'; prawo: 'przysluguje' | 'nie-przysluguje';
  platnik?: 'zus' | 'platnik-skladek'; okres?: Okres; stawka?: Procent; miesiecznaKwota?: Grosze; zrodlo: ZrodloWartosciSprawy }
export interface WynikWeryfikacjiSprawy { dataZdarzenia: { data: DataISO; rodzaj: string }; okresCiazy?: Okres; dataUstania?: DataISO;
  warunki: { numer: number; nazwa: string; wynik: 'spelniony' | 'niespelniony' | 'ostrzezenie' | 'nie-dotyczy' | 'brak-danych'; uzasadnienie: string }[];
  wyniki: { swiadczenie: RozstrzygniecieSprawy['swiadczenie']; prawo: 'przysluguje' | 'nie-przysluguje'; od?: DataISO; przyczyna?: string; platnik?: 'zus' | 'platnik-skladek' | 'nieustalony' }[];
  porownanie: { swiadczenie: RozstrzygniecieSprawy['swiadczenie']; wynik: 'zgodne' | 'rozne' | 'bez-porownania' }[];
  komunikaty: KodKomunikatu[]; czas: ZnacznikCzasu }
export interface SprawaPrzykladowa { idSprawy?: string; zrodlo: 'zestaw-zus' | 'sprawa-wzorcowa' | 'wgrane-dokumenty'; sytuacja?: string;
  konto: Pesel; rozpoczeto: ZnacznikCzasu; dokumenty: DokumentSprawy[]; dane: DaneSprawy; rozstrzygniecie: RozstrzygniecieSprawy[];
  weryfikacja?: WynikWeryfikacjiSprawy }
export interface PowiazanieZastepcze { klucz: string;                     // SHA-256 (hex) odczytanego PESEL albo imienia i nazwiska
  zastepcze: { imie: string; nazwisko: string; pesel: Pesel }; plec: Plec }
