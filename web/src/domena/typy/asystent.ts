// Grupa danych 12 Interakcje asystenta AI (kontrakt, sekcja 5.13).
// Element systemu: Asystent AI.
import type { KodKomunikatu } from '@/domena/typy/komunikaty';
import type { Rola } from '@/domena/typy/konto';
import type { StatusSprawy } from '@/domena/typy/plan';
import type { IdWidoku } from '@/domena/typy/widoki';
import type { IdSprawy, Pesel, ZnacznikCzasu } from '@/domena/typy/wspolne';

export type IntencjaAsystenta = 'termin-sprawy' | 'prawo-do-swiadczenia' | 'sprawy-na-tydzien' | 'wysokosc-zasilku' | 'sposob-zalatwienia'
  | 'rozpoczecie-wniosku-zam' | 'porownanie-wariantow' | 'oznaczenie-sprawy' | 'otwarcie-kalkulatora' | 'otwarcie-instrukcji'
  | 'uzupelnienie-profilu' | 'zaswiadczenia-lekarskie' | 'poza-zakresem-medyczne' | 'poza-zakresem-podatkowe' | 'poza-zakresem-inne-osoby'
  | 'poza-zakresem-spoza-katalogu' | 'poza-zakresem-ocena-indywidualna';
export type PropozycjaDzialania =
  | { rodzaj: 'oznacz-sprawe'; idSprawy: IdSprawy; status: 'zlozona' | 'zalatwiona' }
  | { rodzaj: 'przejdz'; idWidoku: IdWidoku; parametry?: Record<string, string>; nowaKarta?: boolean };
export type AkcjaKanaluAsystenta = 'pytanie-do-zus' | 'e-wizyta' | 'mama-zus' | 'infolinia';
export interface WiadomoscAsystenta { id: string; autor: 'uzytkownik' | 'asystent'; tresc: string; czas: ZnacznikCzasu; rola: Rola;
  intencja?: IntencjaAsystenta; sprawy?: IdSprawy[]; propozycja?: PropozycjaDzialania; akcjeKanalow?: AkcjaKanaluAsystenta[];
  kodKomunikatu?: KodKomunikatu; stanPropozycji?: 'oczekuje' | 'wykonana' | 'odrzucona' }
export interface RozmowaAsystenta { idRozmowy: string; konto: Pesel; rozpoczeto: ZnacznikCzasu; wiadomosci: WiadomoscAsystenta[] }
export interface ZapisAudytowyAsystenta { id: string; czas: ZnacznikCzasu; konto: Pesel; rola: Rola; idRozmowy: string;
  decyzja: 'zatwierdzenie' | 'odrzucenie'; dzialanie: PropozycjaDzialania; statusPrzed?: StatusSprawy; statusPo?: StatusSprawy }
export interface InterakcjeAsystenta { rozmowy: RozmowaAsystenta[]; audyt: ZapisAudytowyAsystenta[] }
