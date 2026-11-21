// Grupa danych 10 Wnioski (kontrakt, sekcja 5.11).
// Element systemu: Kreatory wniosków.
import type { FormaPrzyjecia, LiczbaDzieci, RodzajSytuacjiSzczegolnej } from '@/domena/typy/ciaza-dziecko';
import type { Rola } from '@/domena/typy/konto';
import type { IdWidoku } from '@/domena/typy/widoki';
import type {
  DataISO,
  Grosze,
  IdPliku,
  IdSprawy,
  IdWniosku,
  Okres,
  Pesel,
  Procent,
  RodzicWRodzinie,
  ZnacznikCzasu,
} from '@/domena/typy/wspolne';

export type RodzajWniosku = 'zam' | 'zas-53' | 'urlop-do-pracodawcy' | 'rezygnacja-z-czesci-zasilku' | 'wniosek-ojca-o-urlop' | 'odpis-aktu-urodzenia';
export type StanWniosku = 'szkic' | 'przygotowany' | 'wyslany' | 'zlozony';
export type AdresatWniosku = 'zus' | 'platnik-skladek' | 'pracodawca' | 'rejestr-stanu-cywilnego';
export type RodzajUrlopu = 'macierzynski' | 'czesc-przed-porodem' | 'rodzicielski' | 'uzupelniajacy' | 'ojcowski'
  | 'na-warunkach-macierzynskiego' | 'przejety-macierzynski' | 'laczenie-z-praca';
export interface PlikZalacznika { idPliku: IdPliku; nazwa: string; rozmiar: number; typ: 'application/pdf' | 'image/jpeg' | 'image/png' }
export interface Zalacznik { id: string; rodzaj: string; opis?: string; wymagany: boolean; plik?: PlikZalacznika; nazwaPoWyslaniu?: string }
export interface OkresWniosku { rodzajUrlopu: RodzajUrlopu; od: DataISO; do: DataISO; tygodnie?: number; dni?: number; stawka?: Procent; rodzic?: RodzicWRodzinie }
export interface DaneOsobyWniosku { imie: string; nazwisko: string; pesel?: Pesel; dataUrodzenia?: DataISO; miejsceUrodzenia?: string; adres?: string }

interface WniosekBazowy {
  idWniosku: IdWniosku; rodzaj: RodzajWniosku; idSprawy: IdSprawy; konto: Pesel; rola: Rola; stan: StanWniosku;
  ostatniEkran?: IdWidoku; utworzono: ZnacznikCzasu; zaktualizowano: ZnacznikCzasu;
  adresat?: AdresatWniosku; dataZlozenia?: DataISO; potwierdzenie?: string; zalaczniki: Zalacznik[];
}
export interface WniosekZam extends WniosekBazowy {
  rodzaj: 'zam'; rodzajUrlopu?: RodzajUrlopu; okresy: OkresWniosku[];
  wariant?: 'caly-rodzicielski' | 'tylko-macierzynski' | 'brak';
  rodzicielski?: { tryb: 'bezposrednio' | 'pozniej'; dataPoczatku?: DataISO; tygodnie?: number };
  przedPorodem?: { dzienPoczatkuZasilku: DataISO; przewidywanyTerminPorodu: DataISO; liczbaDzieci: LiczbaDzieci; zaswiadczenie?: Zalacznik };
  daneRodzica?: DaneOsobyWniosku; daneDzieci: DaneOsobyWniosku[];
  numerRachunku?: string;                               // 26 cyfr bez spacji
  oswiadczeniaPotwierdzone: boolean; oswiadczenieZaZyciem?: boolean;
  przyjecie?: { forma: FormaPrzyjecia; dataPrzyjecia: DataISO };                       // 3.9.8
  przejecie?: { przyczyna: 'rezygnacja' | RodzajSytuacjiSzczegolnej; dataZdarzenia?: DataISO; dzienZakonczeniaUrlopuMatki?: DataISO;
    matka: DaneOsobyWniosku; zaswiadczeniePlatnikaMatki?: boolean };                 // 3.9.2
  przekazanieDanychDziecka?: { czas: ZnacznikCzasu; dane: DaneOsobyWniosku[]; liczbaUrodzonychDzieci: number };
  nazwaPlikuDlaPlatnika?: string;
}
export interface OswiadczenieZ10 { odpowiedzi: { pytanie: 1 | 2 | 3 | 4 | 5; tak: boolean; podmiot?: string; miejsce?: string; rodzajDzialalnosci?: string; data?: DataISO }[]; wylaczenie0237?: boolean }
export interface WniosekZas53 extends WniosekBazowy {
  rodzaj: 'zas-53';
  zaswiadczenie?: { zrodlo: 'e-zla' | 'tryb-alternatywny'; seriaINumer?: string; od: DataISO; do: DataISO; kodyLiterowe: ('B' | 'E')[]; platnik?: string };
  okresPrawa?: Okres; dzienNabyciaPrawa?: DataISO; dniWyczekiwania?: 30 | 90; stawka?: 100 | 80;
  okresUbezpieczenia?: { rodzaj: 'w-ubezpieczeniu' } | { rodzaj: 'po-ustaniu'; dataUstania: DataISO };
  zadluzenie?: { kwota: Grosze; dzien: DataISO; prog: Grosze; terminSplaty: DataISO };
  kolejneZaswiadczenie?: { idPoprzedniegoWniosku: IdWniosku };
  wnioskodawca?: DaneOsobyWniosku; platnik?: { nazwa: string; nip: string; regon: string };
  numerTelefonu?: string; numerRachunku?: string;       // pusty rachunek: przekaz pocztowy
  wypadek?: { tak: boolean; przyczyna?: 'wypadek-przy-pracy' | 'wypadek-w-drodze' | 'choroba-zawodowa';
    dokument?: { rodzaj: 'decyzja' | 'protokol' | 'karta-wypadku'; numer: string; data: DataISO } };
  oswiadczenieZ10?: OswiadczenieZ10; oswiadczeniePotwierdzone: boolean;
}
export type PodrodzajWnioskuOUrlop = 'czesc-przed-porodem' | 'macierzynski-z-rodzicielskim' | 'rodzicielski' | 'ojcowski'
  | 'uzupelniajacy' | 'na-warunkach-macierzynskiego' | 'laczenie-z-praca' | 'rezygnacja-matki' | 'pozostala-czesc-macierzynskiego';
export interface WniosekOUrlop extends WniosekBazowy {
  rodzaj: 'urlop-do-pracodawcy' | 'rezygnacja-z-czesci-zasilku' | 'wniosek-ojca-o-urlop';
  podrodzaj?: PodrodzajWnioskuOUrlop; okresy: OkresWniosku[];
  zakres?: 'z-calym-rodzicielskim' | 'wylacznie-macierzynski' | 'wylacznie-na-warunkach'; numerCzesci?: number;
  wariant?: '81-5' | '100-70'; stawkaWSzkicu?: '81-5' | '100-70';
  oswiadczenia: { zamiarDrugiegoRodzica?: boolean; wczesniejszyOjcowski?: 'nie' | '7-dni'; drugiRodzicBezUzupelniajacego?: boolean;
    laczenieCzesciZWydluzenia?: boolean; wymiarWCzesciZWydluzenia?: number };
  laczenie?: { wymiarPracy: number; okres: Okres; dniLaczenia: number; dniWydluzenia: number; ostatniDzienUrlopu: DataISO };
  daneRodzica?: DaneOsobyWniosku; daneDziecka?: DaneOsobyWniosku;
  emailPracodawcy?: string; dataPoczatkuOchrony?: DataISO; dataPrzygotowania?: DataISO;
  rezygnacja?: { dataPowrotu: DataISO; zOrzeczeniem: boolean };
  wniosekOjca?: { przyczyna: 'rezygnacja' | RodzajSytuacjiSzczegolnej; dataZdarzenia?: DataISO; dniPrzedPorodem: number; zobowiazanieOWypisie?: boolean };
}
export interface WniosekOOdpis extends WniosekBazowy {
  rodzaj: 'odpis-aktu-urodzenia'; rodzajOdpisu?: 'skrocony' | 'zupelny' | 'wielojezyczny';
  daneDziecka?: DaneOsobyWniosku; daneWnioskodawcy?: DaneOsobyWniosku;
  cel?: 'sprawa-w-zus' | 'swiadczenie-socjalne' | 'opieka-albo-adopcja' | 'zatrudnienie' | 'inny';
  oplataSkarbowa?: Grosze; sposobOdbioru?: 'e-doreczenia' | 'poczta' | 'osobiscie'; adresDoDoreczenia?: string;
  urzadStanuCywilnego?: string; przewidywanyDzienWydania?: DataISO;
}
export type Wniosek = WniosekZam | WniosekZas53 | WniosekOUrlop | WniosekOOdpis;
