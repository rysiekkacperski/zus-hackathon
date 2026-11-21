// Grupa danych 8 Pozycje planu (kontrakt, sekcja 5.9).
// Element systemu: Plan rodzica.
import type { Etap, IdRegulySwiadczenia, RodzajPozycji } from '@/domena/typy/katalog';
import type { KodKomunikatu } from '@/domena/typy/komunikaty';
import type {
  DataISO,
  FormaZatrudnienia,
  Grosze,
  IdPozycji,
  IdSprawy,
  IdWpisuSlownika,
  MiesiacISO,
  Okres,
  Pesel,
  Procent,
  ZnacznikCzasu,
  ZrodloDanej,
} from '@/domena/typy/wspolne';

export type StatusSprawy = 'do-zrobienia' | 'zlozona' | 'zalatwiona' | 'wymaga-uzupelnienia-profilu';
export type ZrodloStatusu = 'wyliczenie-planu' | 'odpowiedz-rodzica' | 'dane-zus' | 'kreator-wniosku' | 'asystent';
export type RodzicSprawy = 'matka' | 'drugi-rodzic' | 'oboje-rodzice' | 'matka-albo-ojciec' | 'rodzic-przyjmujacy';
export type OznaczenieSprawy = 'wniosek-przygotowany' | 'dane-dziecka-do-przekazania' | 'odpis-do-przekazania-platnikowi' | 'odmowa-zus' | 'nowa-w-planie';
export type OstrzezenieSprawy =
  | { rodzaj: 'brak-duch' }
  | { rodzaj: 'zadluzenie-ponad-prog'; kwota: Grosze; dzien: DataISO }
  | { rodzaj: 'podwyzszenie-podstawy'; srednia: Grosze; ostatnia: Grosze; wzrost: Grosze; wzrostProcent: Procent }
  | { rodzaj: 'stan-rozliczen-niedostepny' }
  | { rodzaj: 'tytul-w-ciazy'; data: DataISO }                                  // K28, 0119
  | { rodzaj: 'ustanie-przed-porodem'; data: DataISO; forma: FormaZatrudnienia; sprawdzPrzedluzenie: boolean } // K29, 0120
  | { rodzaj: 'informacja-po-porodzie' };                                       // K19
export type WybranyWariant =
  | { sprawa: 'K07' | 'K08' | 'K31' | 'K32'; wariant: '81-5' | '100-70'; okresMacierzynski?: Okres; okresyRodzicielskie?: Okres[];
      zapisano: DataISO; zrodlo: 'kalkulator-wariantu' | 'kalkulator-zintegrowany'; numerScenariusza?: number }
  | { sprawa: 'K09'; okresyOjcowskiego: Okres[]; zapisano: DataISO; numerScenariusza?: number }
  | { sprawa: 'K10'; tygodnieMatki: number; tygodnieDrugiegoRodzica: number; dataPoczatku?: DataISO; zapisal: Pesel; zapisano: DataISO }
  | { sprawa: 'K11'; wymiarTygodni: number; zapisano: DataISO }
  | { sprawa: 'K37'; okres: Okres; wymiarPracy: number; zapisano: DataISO };
export interface WynikUstaleniaPrawa {                 // 3.5.2, sprawy K24, K25, K26
  swiadczenie: 'zasilek-chorobowy' | 'swiadczenie-rehabilitacyjne' | 'zwzm' | 'zasilek-macierzynski';
  wskazanyDzien: DataISO;
  postac: 'przysluguje' | 'nie-przysluguje' | 'warunek';
  od?: DataISO; do?: DataISO; wyplaca?: string; stawka?: Procent;
  podzial?: { od: DataISO; do: DataISO; dni: number; rodzaj: 'wynagrodzenie-chorobowe' | 'zasilek-chorobowy' | 'zasilek-po-ustaniu'; stawka: Procent; wyplaca: string }[];
  przyczyna?: { rodzaj: 'brak-ubezpieczenia' } | { rodzaj: 'ustanie'; dzien: DataISO }
    | { rodzaj: 'okres-wyczekiwania'; ostatniDzien: DataISO; dzienNabycia: DataISO; dni: 30 | 90 }
    | { rodzaj: 'wyczerpany-okres-zasilkowy'; dzien: DataISO }
    | { rodzaj: 'zadluzenie'; kwota: Grosze; dzienStanu: DataISO; prog: Grosze };
  kodKomunikatu?: KodKomunikatu; parametryKomunikatu?: Record<string, string>;
  zastosowaneReguly: { idReguly: IdRegulySwiadczenia; wartosci: { idWpisu: IdWpisuSlownika; wartosc: number; od: DataISO }[] }[];
  daneZeZrodlem: { pole: string; wartosc: string; zrodlo: ZrodloDanej | 'profil-rodziny' }[];
  warunkiBezSprawdzenia: string[];
}
export interface PozycjaPlanu {
  idSprawy: IdSprawy; idPozycji: IdPozycji | null;      // null: sprawa strażnika Opłacenie składek
  rodzaj: RodzajPozycji; etap: Etap; rodzic: RodzicSprawy;
  status: StatusSprawy; zrodloStatusu: ZrodloStatusu; dataOznaczenia?: DataISO;
  poPorodzie?: boolean;                                  // sprawa przypadająca po porodzie, liczona przed porodem
  zalezyOdDochodu?: boolean; liczbaDzieci: number;
  kwota?: { kwota: Grosze; okres: 'jednorazowo' | 'miesiecznie' };
  miesiacSkladek?: MiesiacISO;                           // sprawa Opłacenie składek, termin 20. dnia następnego miesiąca
  ostrzezenia: OstrzezenieSprawy[]; oznaczenia: OznaczenieSprawy[];
  wynikUstaleniaPrawa?: WynikUstaleniaPrawa; wybranyWariant?: WybranyWariant;
  idWnioskuZus?: string; bezPrzypomnien?: boolean;
  dane?: { okresK34?: Okres; kanalK34?: 'pracodawca' | 'zus'; wymiarK11Tygodni?: number; wymiarRodzicielskiegoTygodni?: number };
}
export interface ZmianaPlanu { idSprawy: IdSprawy; rodzaj: 'dodana' | 'usunieta' | 'zmieniona-kwota' | 'zmieniony-status' | 'zmieniony-termin'; opis?: string }
export interface PlanRodziny { pozycje: PozycjaPlanu[]; biezacyEtap: Etap; wyliczono: ZnacznikCzasu; dlaKataloguWersja: number; ostatnieZmiany: ZmianaPlanu[] }
