// Grupa danych 3 Powiadomienia (kontrakt, sekcja 5.4).
// Element systemu: Ustawienia i powiadomienia.
import type { DataISO, IdRodziny, IdSprawy, Pesel, ZnacznikCzasu } from '@/domena/typy/wspolne';

export type ElementTworzacy = 'kalendarz-terminow' | 'profil-rodziny' | 'odczyt-danych-zus' | 'kreatory-wnioskow' | 'ustawienia-i-powiadomienia';
export type RodzajPowiadomienia = 'przypomnienie-przed-terminem' | 'przypomnienie-w-dniu-terminu' | 'kod-sms'
  | 'zmiana-statusu-wniosku' | 'odpowiedz-zus' | 'mozliwosc-przejecia-urlopu' | 'pakiet-narodzin';
export type KanalDoreczenia = 'email' | 'sms';
export type StatusDoreczenia = 'zaplanowane' | 'wyslane' | 'pominiete' | 'nieudane';
export type StatusOdczytu = 'nieodczytane' | 'odczytane';
export interface Powiadomienie {
  id: string; elementTworzacy: ElementTworzacy; rodzaj: RodzajPowiadomienia;
  idRodziny?: IdRodziny; idSprawy?: IdSprawy; kontoDocelowe: Pesel;
  termin?: DataISO; liczbaDni?: number;
  planowanaWysylka: ZnacznikCzasu; wyslano?: ZnacznikCzasu;
  kanal: KanalDoreczenia; adresat: string; temat?: string; tresc: string; adresInstrukcji?: string;
  statusDoreczenia: StatusDoreczenia; statusOdczytu: StatusOdczytu; powodPominiecia?: string;
}
