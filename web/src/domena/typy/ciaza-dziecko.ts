// Grupa danych 6 Dane ciąży i dziecka (kontrakt, sekcja 5.7).
// Element systemu: Profil rodziny. Zapis wyłącznie przy zgodzie na dane dotyczące zdrowia.
import type { CzlonekRodzinyZus } from '@/domena/typy/dane-zus';
import type { DataISO, Pesel, ZnacznikCzasu } from '@/domena/typy/wspolne';

export type LiczbaDzieci = 1 | 2 | 3 | 4 | 5;          // 5 = pięcioraczki i więcej
export type FormaPrzyjecia = 'przysposobienie' | 'rodzina-zastepcza-niezawodowa' | 'rodzina-zastepcza-zawodowa';
// 'poronienie-bez-zaswiadczenia' to poronienie przed dopisaniem zaświadczenia o martwym urodzeniu (3.3.5.1.3),
// a 'poronienie' to poronienie potwierdzone zaświadczeniem o martwym urodzeniu.
export type RodzajSytuacjiSzczegolnej = 'martwe-urodzenie' | 'poronienie-bez-zaswiadczenia' | 'poronienie' | 'zgon-dziecka' | 'przedwczesny-porod'
  | 'choroba-dziecka' | 'szpital' | 'orzeczenie' | 'porzucenie' | 'smierc-matki';
export interface DzieckoProfilu { imie?: string; nazwisko?: string; pesel?: Pesel; dataUrodzenia?: DataISO; miejsceUrodzenia?: string;
  zrodlo: 'konto-zus' | 'odpowiedz-rodzica' }
export interface PrzyjecieDziecka { rolaRodzicaPrzyjmujacego: 'matka' | 'ojciec'; forma: FormaPrzyjecia; dataPrzyjecia: DataISO;
  dataUrodzeniaDziecka: DataISO; liczbaPrzyjetychDzieci: LiczbaDzieci; odroczenieObowiazkuSzkolnego?: boolean;
  /** Daty urodzenia każdego przyjętego dziecka (najwyżej pięć); pierwsza równa `dataUrodzeniaDziecka`. 3.3.4.1.3 */
  datyUrodzeniaDzieci?: DataISO[];
  /** Data wystąpienia do sądu opiekuńczego z wnioskiem o przysposobienie. 3.3.4.1.3 */
  dataWystapieniaDoSadu?: DataISO;
  dataUprawomocnienia?: DataISO; zrodlo: 'odpowiedz-rodzica' }
export interface SytuacjaSzczegolna { id: string; rodzaj: RodzajSytuacjiSzczegolnej; dataZdarzenia: DataISO; liczbaDzieci?: number;
  zrodlo: 'odpowiedz-rodzica'; kontoZapisujace: Pesel; zapisano: ZnacznikCzasu }
export interface DaneCiazyIDziecka {
  przewidywanyTerminPorodu?: DataISO; liczbaDzieciZCiazy?: LiczbaDzieci;   // ciąża mnoga = liczba > 1
  dataPierwszejWizyty?: DataISO | 'brak-wizyty';                          // data objęcia opieką lekarza albo położnej
  dataPorodu?: DataISO; dataPoroduPotwierdzona: boolean; zrodloDatyPorodu?: 'odpowiedz-rodzica' | 'konto-zus';
  liczbaUrodzonychDzieci?: LiczbaDzieci; liczbaDzieciUrodzonychZywo?: number;
  dzieci: DzieckoProfilu[];
  tydzienCiazyWDniuPorodu?: number;                                       // 22..44
  masaUrodzeniowaG?: number;                                              // 300..7000
  dniHospitalizacji5do28?: number;                                        // 0..52, kolejne dni od 5. dnia po porodzie
  pobytWSzpitaluPoPorodzie?: boolean;                                     // przy tygodniu do 36 albo masie do 1000 g
  ciezkaChorobaDziecka?: boolean; zaswiadczenieZaZyciem?: boolean;
  wymiarUzupelniajacegoUrlopu?: 'brak' | 'do-8' | 'do-15' | 'nie-sprawdzono';
  wymiarUrlopuRodzicielskiegoTygodni?: number;                            // 41, 43, 65, 67, 38, 62
  przyjecie?: PrzyjecieDziecka;
  sytuacjeSzczegolne: SytuacjaSzczegolna[];
  spokojnyTryb: { wlaczony: boolean; od?: DataISO; wylaczono?: DataISO };
  noweDzieckoOczekujace?: { dzieci: CzlonekRodzinyZus[]; wykryto: ZnacznikCzasu; zamknieto?: ZnacznikCzasu };
  wylaczoneZUzycia?: { od: ZnacznikCzasu; terminUsuniecia: DataISO };    // po wycofaniu zgody
}
