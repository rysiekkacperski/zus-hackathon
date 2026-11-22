// Układ stanu w przeglądarce (kontrakt, sekcja 5.15, klucze z sekcji 6.2 i scenariusze z sekcji 6.6).
import type { InterakcjeAsystenta } from '@/domena/typy/asystent';
import type { DaneCiazyIDziecka } from '@/domena/typy/ciaza-dziecko';
import type {
  CzlonekRodzinyZus,
  DaneZKontaZus,
  PytanieDoZus,
  StanOdczytuZus,
  WniosekZus,
  ZaswiadczenieOStanieRozliczen,
  ZrodloweDaneKontaZus,
} from '@/domena/typy/dane-zus';
import type { WynikiKalkulacji } from '@/domena/typy/kalkulacje';
import type { EdycjeKatalogu, ZmianaKataloguWKolejce } from '@/domena/typy/katalog';
import type { KodKomunikatu } from '@/domena/typy/komunikaty';
import type { KontoDemo, KontoPrzewodnika } from '@/domena/typy/konto';
import type { PlanRodziny } from '@/domena/typy/plan';
import type { Powiadomienie } from '@/domena/typy/powiadomienia';
import type { PowiazanieZastepcze, SprawaPrzykladowa } from '@/domena/typy/przykladowe-sprawy';
import type { DaneRodziny, SzkicProfilu } from '@/domena/typy/rodzina';
import type { KalendarzTerminow } from '@/domena/typy/terminy';
import type { Ustawienia } from '@/domena/typy/ustawienia';
import type { IdWidoku } from '@/domena/typy/widoki';
import type { Wniosek } from '@/domena/typy/wnioski';
import type {
  DataISO,
  IdPliku,
  IdRodziny,
  IdSprawy,
  KontekstOperacji,
  Pesel,
  ZnacznikCzasu,
} from '@/domena/typy/wspolne';

export interface ParametrySystemu {
  trybDemonstracyjny: boolean;                       // prototyp: true
  dataDemo: DataISO | null;                          // podstawiana data „dzisiaj”
  progPodwyzszeniaPodstawyProcent: number;           // 50
  progOstrzezeniaOkresuZasilkowegoDni: number;       // 30
  tolerancjaPorownaniaKwotyGrosze: number;           // 1
  opoznienieOdpowiedziZusDni: number;                // 4
  symulacje: {
    bladZapisu: boolean;                             // 0003 w operacjach domenowych
    daneZusNiedostepne: boolean;                     // 0001 albo 0002
    stanRozliczenNiedostepny: boolean;               // 0150
    kanalNiedostepny: boolean;                       // 0035
    mobywatelZainstalowany: boolean;
    wysylkaDoZusNiedostepna: boolean;                // 0044
    pueEzusNiedostepne: boolean;                     // 0133
    rejestrStanuCywilnegoNiedostepny: boolean;       // 0147
    uslugaEmailNiedostepna: boolean;                 // 0138
    asystentNiedostepny: boolean;                    // 0071
    odczytDokumentu: 'model' | 'fikstura' | 'nierozpoznany' | 'nieczytelny' | 'niedostepny';
    opoznienieOdczytuZusMs: number;                  // 4000
    kodSmsStaly: string | null;                      // '482913' do testów KA
  };
}
export interface StanGlobalny { wersjaSchematu: 1; noweKontaDemo: KontoDemo[]; parametry: ParametrySystemu;
  edycjeKatalogu: EdycjeKatalogu; licznikiPotwierdzen: Record<string, number>; zaproszenia: Record<string, IdRodziny>;
  zmianyKataloguDoWyslania?: ZmianaKataloguWKolejce[] }      // zmiany Administratora czekające na zapis w usłudze /api/katalog
export interface StanKonta { konto: KontoPrzewodnika; ustawienia: Ustawienia | null; powiadomienia: Powiadomienie[];
  kopiaDanychZus: DaneZKontaZus | null; stanOdczytuZus: StanOdczytuZus; szkicProfilu: SzkicProfilu | null;
  wynikiKalkulacji: WynikiKalkulacji; interakcjeAsystenta: InterakcjeAsystenta }
export interface StanRodziny { idRodziny: IdRodziny; daneRodziny: DaneRodziny; daneCiazy: DaneCiazyIDziecka | null;
  plan: PlanRodziny | null; kalendarz: KalendarzTerminow | null; wnioski: Wniosek[]; wynikiKalkulacji: WynikiKalkulacji;
  ukryte?: { od: ZnacznikCzasu; terminUsuniecia: DataISO };
  wyliczono?: { dzis: DataISO; katalogWersja: number; odczytyZus: Record<Pesel, ZnacznikCzasu> } }
export interface StanSymulowanegoZus { pesel: Pesel; dzieckoZSymulacji?: Omit<CzlonekRodzinyZus, 'noweDziecko'>;
  korespondencja: PytanieDoZus[]; wnioskiZPrzewodnika: WniosekZus[]; zaswiadczeniaORozliczeniach: ZaswiadczenieOStanieRozliczen[];
  nadpisania?: Partial<ZrodloweDaneKontaZus> }       // scenariusze demonstracyjne
export interface StanSesji { przykladowaSprawa?: SprawaPrzykladowa; powiazaniaZastepcze: PowiazanieZastepcze[];
  panelAsystenta: { otwarty: boolean; idRozmowy?: string; szkic: string };
  oczekujacyPowrotZKanalu?: { idSprawy: IdSprawy; kanal: string; otwarto: ZnacznikCzasu }; plikiSesji: IdPliku[] }
export interface KomunikatPoPrzejsciu { kod: KodKomunikatu; parametry?: Record<string, string>; dlaWidoku?: IdWidoku }

// Typy kluczy, które tabela 6.2 zapisuje bez nazwy.
export interface MetaMagazynu { wersjaSchematu: 1 }                       // ppm:v1:meta
export interface StanInterfejsu { menuZwiniete: boolean }                 // ppm:v1:ui
export interface RekordPliku {                                            // baza IndexedDB ppm-pliki, magazyn pliki
  id: IdPliku; blob: Blob; nazwa: string; typ: string; rozmiar: number; wgrano: ZnacznikCzasu;
  wlasciciel: Pesel; idSesji?: string; wygasa?: ZnacznikCzasu;           // dokument przykładowej sprawy: wgrano + 24 h
}

// Scenariusz demonstracyjny z rejestru dane/scenariusze (sekcja 6.6).
export interface ScenariuszDemo { id: string; nazwa: string; opis: string; pesel: Pesel;
  zastosuj: (ctx: KontekstOperacji) => { konto?: Partial<StanKonta>; rodzina?: StanRodziny; zus?: Partial<StanSymulowanegoZus>; parametry?: Partial<ParametrySystemu> } }
