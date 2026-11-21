// Grupa danych 2 Ustawienia (kontrakt, sekcja 5.3).
// Element systemu: Ustawienia i powiadomienia.
import type { ZnacznikCzasu } from '@/domena/typy/wspolne';

export type StanNumeru = 'niepotwierdzony' | 'potwierdzony' | 'wymaga-potwierdzenia-nowego';
export interface Ustawienia {
  przypomnieniaWlaczone: boolean;                  // domyślnie true
  wyprzedzenieDni: number;                         // 1..30, domyślnie 7
  kanalEmail: boolean;                             // domyślnie true
  adresEmail: string;                              // ≤ 254 znaki, domyślnie e-mail konta eZUS
  adresEmailZrodlo: 'konto-zus' | 'uzytkownik';
  kanalSms: boolean;                               // domyślnie false
  numerTelefonu: string;                           // 9 cyfr, zapis bez +48 i spacji
  stanNumeru: StanNumeru;
  numerPotwierdzony?: string;
  kodWeryfikacyjny?: { kod: string; wyslano: ZnacznikCzasu; numer: string }; // ważny 10 minut
  zapisano?: ZnacznikCzasu;
}
