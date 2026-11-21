// Grupa danych 1 Dane konta użytkownika, rejestr kont demonstracyjnych i sesja (kontrakt, sekcja 5.2).
// Element systemu: Konto i uwierzytelnianie.
import type { DataISO, IdRodziny, Pesel, Plec, ZnacznikCzasu } from '@/domena/typy/wspolne';

export type Rola = 'nowy-uzytkownik' | 'rodzic' | 'drugi-rodzic' | 'administrator';
export type RodzajKonta = 'przykladowe-konto-rodzica' | 'konto-administratora' | 'nowe-konto';
export type SposobZalogowania = 'mobywatel' | 'ezus' | 'mzus';
export type RodzajDecyzjiOZgodzie = 'udzielenie' | 'odmowa' | 'wycofanie';
export type StanZgody = 'brak-decyzji' | 'udzielona' | 'odmowa' | 'wycofana';

export interface DecyzjaOZgodzie { rodzaj: RodzajDecyzjiOZgodzie; wersjaTresci: string; czas: ZnacznikCzasu } // wersja '1.0'
export interface WpisHistoriiSesji { idSesji: string; poczatek: ZnacznikCzasu; sposob: SposobZalogowania;
  koniec?: ZnacznikCzasu; przyczynaKonca?: 'wylogowanie' | 'wygasniecie' }

export interface KontoPrzewodnika {               // Dane konta użytkownika
  pesel: Pesel; imie: string; nazwisko: string; imieINazwiskoDopelniacz?: string;
  dataUrodzenia: DataISO; plec: Plec; rola: Rola; rodzajKonta: RodzajKonta;
  idRodziny: IdRodziny | null;                     // rodzina Rodzica albo Drugiego rodzica
  sposobZalogowania?: SposobZalogowania;           // ostatni sposób
  historiaSesji: WpisHistoriiSesji[];
  ekranSprzedWygasniecia?: string;                 // ścieżka z zapytaniem, zużywana po ponownym zalogowaniu
  decyzjeOZgodzie: DecyzjaOZgodzie[];              // stan zgody = rodzaj ostatniej decyzji
  terminUsunieciaDanychZdrowotnych?: DataISO;      // wycofanie + 30 dni
  terminUsunieciaDanychRodziny?: DataISO;          // usunięcie + 30 dni
  utworzono: ZnacznikCzasu;
}

export interface KontoDemo {                       // rejestr kont demonstracyjnych (prototyp)
  pesel: Pesel; imie: string; nazwisko: string; imieINazwiskoDopelniacz: string;
  dataUrodzenia: DataISO; plec: Plec; rodzaj: RodzajKonta;
  kluczOpisuFormy?: 'jdg-z-dobrowolnym' | 'umowa-o-prace' | 'umowa-zlecenia-z-dobrowolnym' | 'jdg-bez-dobrowolnego'
    | 'umowa-o-prace-ustala-w-ciazy' | 'jdg-rozpoczeta-w-ciazy' | 'administrator';
  kolejnosc: number;
}

export interface Sesja { idSesji: string; pesel: Pesel; sposob: SposobZalogowania; poczatek: ZnacznikCzasu; ostatnieDzialanie: ZnacznikCzasu }

export interface LogowanieWToku { sposob: SposobZalogowania; powrot?: string; poprzedniKodMobywatel?: string } // sessionStorage
