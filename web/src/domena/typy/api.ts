// Żądania i odpowiedzi API serwera (kontrakt, sekcje 10.2 i 5.15).
// Elementy systemu: Asystent AI, Odczyt danych ZUS.
import type { AkcjaKanaluAsystenta, IntencjaAsystenta, PropozycjaDzialania } from '@/domena/typy/asystent';
import type { Etap } from '@/domena/typy/katalog';
import type { Rola } from '@/domena/typy/konto';
import type { RodzicSprawy, StatusSprawy } from '@/domena/typy/plan';
import type { PowiazanieZastepcze, RodzajDokumentuSprawy, SprawaPrzykladowa } from '@/domena/typy/przykladowe-sprawy';
import type { PlatnikZasilku } from '@/domena/typy/rodzina';
import type { RodzajWniosku, StanWniosku } from '@/domena/typy/wnioski';
import type {
  DataISO,
  FormaZatrudnienia,
  FormaZatrudnieniaDrugiegoRodzica,
  Grosze,
  IdPozycji,
  IdSprawy,
} from '@/domena/typy/wspolne';

export interface Fakt { klucz: string; tekst: string; idSprawy?: IdSprawy; liczby: string[] } // liczby w postaci sformatowanej
export interface KontekstAsystenta { rola: Rola; dzis: DataISO; zgoda: boolean;
  profil: { formaMatki?: FormaZatrudnienia; formaDrugiegoRodzica?: FormaZatrudnieniaDrugiegoRodzica; platnikZasilku?: PlatnikZasilku;
    dochodNaOsobe?: Grosze | 'nieznany'; przewidywanyTerminPorodu?: DataISO; dataPorodu?: DataISO; liczbaDzieci?: number } | null;
  sprawy: { idSprawy: IdSprawy; tytul: string; etap: Etap; rodzic: RodzicSprawy; status: StatusSprawy; termin?: DataISO;
    dniDoTerminu?: number; koszt?: string; wynikPrawa?: string; wariant?: string }[];
  wnioski: { rodzaj: RodzajWniosku; stan: StanWniosku; dataZlozenia?: DataISO }[];
  wyniki: { opis: string; kwoty: string[] }[];
  daneZus: { tytuly: string[]; podstawaOstatnia?: string; ezla?: string; stanRozliczen?: string } | null;
  katalog: { kwoty: { nazwa: string; wartosc: string; od: string }[]; pozycje: { id: IdPozycji; tytul: string; warunek: string; kanal: string }[] } }
export interface ZapytanieAsystenta { idRozmowy: string; wiadomosc: string; historia: { autor: 'uzytkownik' | 'asystent'; tresc: string }[]; kontekst: KontekstAsystenta }
export interface OdpowiedzAsystenta { tekst: string; intencja: IntencjaAsystenta; sprawy: IdSprawy[]; propozycja?: PropozycjaDzialania;
  akcjeKanalow?: AkcjaKanaluAsystenta[]; kodKomunikatu?: '0070' | '0148' | '0256'; oznaczenieAI: true }
export interface WartoscOdczytana { pole: string; wartosc: string | number | boolean | null; daneZastapione?: boolean } // pole: ścieżka w DaneSprawy
export interface WynikOdczytuDokumentu { status: 'odczytany' | 'nierozpoznany' | 'nieczytelny' | 'niedostepny';
  rodzajDokumentu?: RodzajDokumentuSprawy; wartosci: WartoscOdczytana[]; nowePowiazania: PowiazanieZastepcze[]; czasMs: number }

// Odpowiedzi błędów i odpowiedź listy zestawów z tabeli punktów końcowych 10.2.
export interface BladAsystenta { kod: '0071' | '0006' }                  // 503 bez klucza, przy błędzie modelu albo po 20 s; 400 przy złym żądaniu
export type BladOdczytuDokumentu = { kod: '0103' | '0104' } | { status: 'niedostepny' }; // 400 albo 503 (0108)
export interface OdpowiedzZestawowSpraw { sprawy: SprawaPrzykladowa[] }  // GET /api/przykladowe-sprawy/zestawy
