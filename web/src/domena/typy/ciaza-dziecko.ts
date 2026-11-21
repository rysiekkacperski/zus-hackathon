// Grupa danych 6 Dane ciąży i dziecka (kontrakt, sekcja 5.7).
// Element systemu: Profil rodziny. Zapis wyłącznie przy zgodzie na dane dotyczące zdrowia.
import type { CzlonekRodzinyZus } from '@/domena/typy/dane-zus';
import type { DataISO, Pesel, ZnacznikCzasu } from '@/domena/typy/wspolne';

export type LiczbaDzieci = 1 | 2 | 3 | 4 | 5;          // 5 = pięcioraczki i więcej
export type FormaPrzyjecia = 'przysposobienie' | 'rodzina-zastepcza-niezawodowa' | 'rodzina-zastepcza-zawodowa';
export type RodzajSytuacjiSzczegolnej = 'martwe-urodzenie' | 'poronienie' | 'zgon-dziecka' | 'przedwczesny-porod'
  | 'choroba-dziecka' | 'szpital' | 'orzeczenie' | 'porzucenie' | 'smierc-matki';
export interface DzieckoProfilu { imie?: string; nazwisko?: string; pesel?: Pesel; dataUrodzenia?: DataISO; miejsceUrodzenia?: string;
  zrodlo: 'konto-zus' | 'odpowiedz-rodzica' }
export interface PrzyjecieDziecka { rolaRodzicaPrzyjmujacego: 'matka' | 'ojciec'; forma: FormaPrzyjecia; dataPrzyjecia: DataISO;
  dataUrodzeniaDziecka: DataISO; liczbaPrzyjetychDzieci: LiczbaDzieci; odroczenieObowiazkuSzkolnego?: boolean;
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
  dniHospitalizacji5do28?: number;                                        // 0..24
  ciezkaChorobaDziecka?: boolean; zaswiadczenieZaZyciem?: boolean;
  wymiarUzupelniajacegoUrlopu?: 'brak' | 'do-8' | 'do-15' | 'nie-sprawdzono';
  wymiarUrlopuRodzicielskiegoTygodni?: number;                            // 41, 43, 65, 67, 38, 62
  przyjecie?: PrzyjecieDziecka;
  sytuacjeSzczegolne: SytuacjaSzczegolna[];
  spokojnyTryb: { wlaczony: boolean; od?: DataISO; wylaczono?: DataISO };
  noweDzieckoOczekujace?: { dzieci: CzlonekRodzinyZus[]; wykryto: ZnacznikCzasu; zamknieto?: ZnacznikCzasu };
  wylaczoneZUzycia?: { od: ZnacznikCzasu; terminUsuniecia: DataISO };    // po wycofaniu zgody
}
