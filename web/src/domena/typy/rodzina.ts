// Grupa danych 5 Dane rodziny i szkic profilu (kontrakt, sekcja 5.6).
// Element systemu: Profil rodziny.
import type { DaneCiazyIDziecka } from '@/domena/typy/ciaza-dziecko';
import type { DaneDrugiegoRodzicaZKonta } from '@/domena/typy/dane-zus';
import type { IdWidoku } from '@/domena/typy/widoki';
import type {
  DanaZeZrodla,
  DataISO,
  FormaZatrudnienia,
  FormaZatrudnieniaDrugiegoRodzica,
  Grosze,
  IdRodziny,
  MiesiacISO,
  Pesel,
  RodzicWRodzinie,
  ZnacznikCzasu,
} from '@/domena/typy/wspolne';

export type SytuacjaRodzica = 'oczekiwanie' | 'narodziny' | 'przyjecie' | 'planowanie';
export type PlatnikZasilku = 'zus' | 'platnik-skladek' | 'nieustalony' | 'brak-platnika';
export type RodzajZmianyZatrudnienia = 'bez-zmian' | 'rozpoczecie' | 'ustanie';
export type PrzyczynaUstaniaUmowy = 'upadlosc' | 'likwidacja' | 'smierc-pracodawcy' | 'naruszenie-z-wyrokiem'
  | 'naruszenie-bez-wyroku' | 'koniec-umowy-terminowej' | 'inna';
export type RodzajUmowyOPrace = 'czas-nieokreslony' | 'czas-okreslony' | 'zastepstwo' | 'probna-dluzsza' | 'probna-krotsza';
export type StanCywilny = 'malzenstwo' | 'nie-malzenstwo';
export type UznanieOjcostwa = 'uznane' | 'nieuznane';
export interface Gmina { idTeryt: string; nazwa: string; powiat: string; wojewodztwo: string; urzadStanuCywilnegoMiejscownik?: string }

export interface ZmianaZatrudnieniaWCiazy {
  rodzaj: DanaZeZrodla<RodzajZmianyZatrudnienia>; forma?: DanaZeZrodla<Exclude<FormaZatrudnienia, 'brak-tytulu'>>;
  data?: DanaZeZrodla<DataISO>; przyczyna?: DanaZeZrodla<PrzyczynaUstaniaUmowy>;
  inneZatrudnienie?: DanaZeZrodla<boolean>;          // tylko upadłość, likwidacja, śmierć pracodawcy
  umowaPrzedluzonaDoPorodu?: boolean;                // wynik reguły K30 (3.5.3)
}
export interface DaneRodzica {
  formaZatrudnienia: DanaZeZrodla<FormaZatrudnienia> | null;
  dobrowolneChorobowe: DanaZeZrodla<boolean> | null;  // UZ i JDG
  platnikZasilku: (DanaZeZrodla<PlatnikZasilku> & { nazwaPlatnika?: string }) | null;
  rodzajUmowy?: DanaZeZrodla<RodzajUmowyOPrace>;
  dataPoczatkuZatrudnienia?: DanaZeZrodla<DataISO>;
  zmianaZatrudnienia?: ZmianaZatrudnieniaWCiazy;
  potwierdzeniaSkladek: { miesiac: MiesiacISO; zrodlo: 'odpowiedz-rodzica'; czas: ZnacznikCzasu }[];
  wymiarPracyWUrlopieRodzicielskim?: number;          // % etatu
  emailPracodawcy?: DanaZeZrodla<string>;             // dane pracodawcy do wniosków o urlopy
  daneZKontaZus?: DaneDrugiegoRodzicaZKonta;          // dla drugiego rodzica po dołączeniu albo z PEL
}
export interface DrugiRodzic extends Omit<DaneRodzica, 'formaZatrudnienia'> {
  formaZatrudnienia: DanaZeZrodla<FormaZatrudnieniaDrugiegoRodzica> | null;
  imie?: string; nazwisko?: string; imieINazwiskoDopelniacz?: string; pesel?: Pesel;
  zachowaneOdpowiedzi?: Omit<DrugiRodzic, 'zachowaneOdpowiedzi'>; // kopia odpowiedzi rodzica sprzed danych z PEL
}
export interface DostepKonta { pesel: Pesel; rola: 'rodzic' | 'drugi-rodzic'; dolaczono: DataISO; odlaczono?: DataISO; stan: 'aktywny' | 'odlaczony' }
export interface Zaproszenie { token: string; utworzono: ZnacznikCzasu; wazneDo: DataISO; zapraszajacy: Pesel;
  stan: 'aktywne' | 'uniewaznione' | 'wykorzystane' | 'wygasle' | 'odrzucone' }
export interface DaneRodziny {
  idRodziny: IdRodziny;
  sytuacja: DanaZeZrodla<SytuacjaRodzica> | null;     // oczekiwanie i narodziny tylko przy zgodzie
  rodzicKonta: RodzicWRodzinie;                        // kim w rodzinie jest konto zakładające (matka, a przy przyjęciu ojciec: drugi-rodzic)
  matka: DaneRodzica; drugiRodzic: DrugiRodzic;
  stanCywilny: DanaZeZrodla<StanCywilny> | null; uznanieOjcostwa?: DanaZeZrodla<UznanieOjcostwa>;
  gmina: DanaZeZrodla<Gmina> | null;
  dochodNaOsobe: DanaZeZrodla<Grosze | 'nieznany'> | null;
  dostepKont: DostepKonta[]; zaproszenie?: Zaproszenie;
  zapisano: ZnacznikCzasu;
}
export interface SzkicProfilu {                        // konto Nowy użytkownik albo zmiana profilu przez Rodzica
  kontekst: 'start' | 'zmiana-profilu'; powrotNaPodsumowanie: boolean;
  ostatniEkran: IdWidoku;
  daneRodziny: Partial<Omit<DaneRodziny, 'idRodziny' | 'dostepKont' | 'zaproszenie' | 'zapisano'>>;
  daneCiazy: Partial<DaneCiazyIDziecka>;
  zmienionePola: string[];                             // ścieżki pól zmienionych w trybie zmiany profilu
  utworzono: ZnacznikCzasu; zaktualizowano: ZnacznikCzasu;
}
