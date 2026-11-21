// Grupa danych 11 Wyniki kalkulacji (kontrakt, sekcja 5.12).
// Element systemu: Kalkulatory decyzji.
import type { FormaPrzyjecia, LiczbaDzieci } from '@/domena/typy/ciaza-dziecko';
import type { JednostkaWariantu } from '@/domena/typy/katalog';
import type { KodKomunikatu } from '@/domena/typy/komunikaty';
import type { RodzajUrlopu } from '@/domena/typy/wnioski';
import type {
  DataISO,
  FormaZatrudnienia,
  FormaZatrudnieniaDrugiegoRodzica,
  Grosze,
  IdPozycji,
  IdWpisuSlownika,
  MiesiacISO,
  Pesel,
  Procent,
  RodzicWRodzinie,
} from '@/domena/typy/wspolne';

export type ZrodloWartosciKalkulatora = 'profil-rodziny' | 'konto-zus' | 'przykladowa-sprawa' | 'wartosc-w-kalkulatorze' | 'wartosc-domyslna';
export interface WartoscKalkulatora<T> { wartosc: T; zrodlo: ZrodloWartosciKalkulatora }
export interface PodstawaWymiaru { kwota: Grosze; zrodlo: 'konto-zus' | 'wartosc-wpisana-przez-rodzica' | 'przykladowa-sprawa';
  pelnyEtat?: boolean; skladniki?: { opis: string; kwota: Grosze }[]; miesiacPowstaniaPrawa?: MiesiacISO }
export interface DaneWejscioweKalkulatora {
  zdarzenie: WartoscKalkulatora<'porod' | 'przewidywany-porod' | 'przyjecie'>;
  dataPorodu?: WartoscKalkulatora<DataISO>; przewidywanyTerminPorodu?: WartoscKalkulatora<DataISO>;
  przyjecie?: WartoscKalkulatora<{ forma: FormaPrzyjecia; dataPrzyjecia: DataISO; dataUrodzeniaDziecka: DataISO; odroczenie: boolean }>;
  liczbaDzieci: WartoscKalkulatora<LiczbaDzieci>; zaZyciem: WartoscKalkulatora<boolean>;
  wczesniactwo?: WartoscKalkulatora<{ tydzienCiazy: number; masaG: number; dniPobytu: number; pierwszyDzienPobytu?: number }>;
  strata?: WartoscKalkulatora<{ rodzaj: 'martwe-urodzenie' | 'zgon-dziecka' | 'poronienie'; dataZgonu?: DataISO; liczbaDzieci: number }>;
  formaMatki: WartoscKalkulatora<{ forma: FormaZatrudnienia; dobrowolne: boolean }>;
  formaDrugiegoRodzica: WartoscKalkulatora<{ forma: FormaZatrudnieniaDrugiegoRodzica; dobrowolne: boolean }>;
}
export interface CzescUrlopuRodzicielskiego { rodzic: RodzicWRodzinie; od: DataISO; tygodnie: number }
export interface ParametryScenariusza {
  wariant: '81-5' | '100-70'; tygodniePrzedPorodem: number;          // 0..6
  poczatekNaWarunkach?: DataISO; rodzicUzupelniajacego?: RodzicWRodzinie;
  czesciRodzicielskiego: CzescUrlopuRodzicielskiego[];                // ≤ 5
  ojcowski: { wymiar: '14-dni' | '7-dni' | 'brak'; czesci: DataISO[] };
  drugiRodzicPoPorodzie?: { dataUbezpieczenia: DataISO; forma: FormaZatrudnienia };
  przejecie?: { sytuacja: string; data: DataISO; koniecPobytuMatki?: DataISO };
  laczenie?: { indeksCzesci: number; tygodnie: number; wymiarPracy: number };
  datyPowrotu: Partial<Record<RodzicWRodzinie, DataISO>>;
}
export interface OkresScenariusza { rodzic: RodzicWRodzinie; rodzaj: RodzajUrlopu | 'wydluzenie-rodzicielskiego'; od: DataISO; do: DataISO;
  dni: number; stawka: Procent; miesiecznie: Grosze; zaOkres: Grosze }
export interface WynikScenariusza {
  okresy: OkresScenariusza[];
  harmonogram: { miesiac: MiesiacISO; rodzic: RodzicWRodzinie; kwota: Grosze; podwyzszenie: Grosze; wyrownanie: Grosze }[];
  sumy: Partial<Record<RodzicWRodzinie, Grosze>> & { razem: Grosze };
  datyPowrotu: Partial<Record<RodzicWRodzinie, DataISO>>; tygodniePrzepadajace: number; tygodnieNiewykorzystane: number;
  uprawnieniaPoPowrocie: IdPozycji[];                                  // K20–K23
  zastosowaneReguly: { opis: string; idWpisu?: IdWpisuSlownika; wartosc?: number; jednostka?: JednostkaWariantu; od?: DataISO }[];
  komunikaty: { kod: KodKomunikatu; parametry?: Record<string, string> }[];
}
export interface ScenariuszKalkulatora { numer: number; zapisano: DataISO; konto: Pesel; zakres: 'rodzina' | 'konto';
  przykladowaSprawa: boolean; wybranyWPlanie: boolean; daneWejsciowe: DaneWejscioweKalkulatora;
  podstawy: Partial<Record<RodzicWRodzinie, PodstawaWymiaru>>; parametry: ParametryScenariusza; wynik: WynikScenariusza }
export interface ZapisPorownaniaWariantow { id: string; sprawa: 'K07' | 'K08'; zapisano: DataISO; konto: Pesel;
  podstawa: PodstawaWymiaru; tygodniePrzedPowrotem: number; dataPorodu: DataISO; liczbaDzieci: number; zaZyciem: boolean;
  wynik: { wariant81: { miesiecznie: Grosze[]; suma: Grosze }; wariant100i70: { miesiecznie: Grosze[]; suma: Grosze }; roznica: Grosze; dataPowrotu: DataISO };
  decyzja: '81-5' | '100-70' }
export interface ZapisPodzialuUrlopu { id: string; zapisano: DataISO; konto: Pesel; podstawy: Partial<Record<RodzicWRodzinie, PodstawaWymiaru>>;
  wariantMatki: '81-5' | '100-70'; liczbaDzieci: number; zaZyciem: boolean; wymiar: number; tygodnieMatki: number;
  tygodnieDrugiegoRodzica: number; tygodniePrzepadajace: number;
  wynik: { stawki: Partial<Record<RodzicWRodzinie, Procent[]>>; miesiecznie: Partial<Record<RodzicWRodzinie, Grosze>>; sumy: Partial<Record<RodzicWRodzinie, Grosze>> } }
export interface WynikiKalkulacji { scenariusze: ScenariuszKalkulatora[]; porownaniaWariantow: ZapisPorownaniaWariantow[]; podzialyUrlopu: ZapisPodzialuUrlopu[]; nastepnyNumer: number }
