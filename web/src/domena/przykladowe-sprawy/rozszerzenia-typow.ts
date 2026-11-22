// Rozszerzenia typów wspólnych dla weryfikacji przykładowej sprawy (kontrakt, sekcja 12.3).
// Właściciel: u21 (Przykładowe sprawy: weryfikacja i sprawdzenie wyliczeń).
// Pole rozszerzenie niesie szczegóły wyniku świadczeń, uzasadnienie płatnika, okres do wyliczenia,
// parametry komunikatów i rodzaj zdarzenia, których nie ma w polach kontraktu.
import type { DataISO, Grosze, KodKomunikatu, Okres, RodzajUrlopu, RozstrzygniecieSprawy, WartoscSprawy } from '@/domena/typy';

export type SwiadczenieSprawy = RozstrzygniecieSprawy['swiadczenie'];

export type RodzajZdarzeniaSprawy = 'porod' | 'przewidywany-termin' | 'niezdolnosc' | 'okres-ojca';

/** Świadczenie, którego prawa ZUS odmówił, ze zrzutu z systemu ZUS: rodzaj (kod albo nazwa), dzień i przyczyna odmowy. */
export interface SwiadczenieOdmowione {
  rodzaj: string;
  od?: DataISO;
  przyczyna?: string;
}

/** Szczegóły wyniku świadczenia, których nie zawiera typ wspólny. */
export interface SzczegolWynikuSwiadczenia {
  swiadczenie: SwiadczenieSprawy;
  do?: DataISO;
  okresBezPrawa?: Okres;
  numerWarunkuPrzyczyny?: number;
  swiadczenieRodzicielskie?: Grosze;
}

/** Okres zasiłku za urlop macierzyński przyjęty do wyliczenia (po korekcie początku przed porodem). */
export interface OkresDoWyliczenia {
  rodzajUrlopu: RodzajUrlopu;
  odZWniosku: DataISO;
  od: DataISO;
  skorygowany: boolean;
  zaswiadczenieOTerminie: boolean;
}

export interface RozszerzenieWeryfikacji {
  szczegoly: SzczegolWynikuSwiadczenia[];
  uzasadnieniePlatnika: string;
  okresDoWyliczenia?: OkresDoWyliczenia;
  parametryKomunikatow?: Partial<Record<KodKomunikatu, Record<string, string>>>;
  rodzajZdarzenia: RodzajZdarzeniaSprawy;
}

declare module '@/domena/typy/przykladowe-sprawy' {
  interface WynikWeryfikacjiSprawy {
    rozszerzenie?: RozszerzenieWeryfikacji;
  }
  interface DaneSprawy {
    /** Wymiar etatu przy niepełnym etacie jako ułamek licznik/mianownik, na przykład 1/2. */
    wymiarEtatu?: WartoscSprawy<string>;
    /** Świadczenia, których prawa ZUS odmówił, odczytane ze zrzutu z systemu ZUS. */
    swiadczeniaOdmowione?: WartoscSprawy<SwiadczenieOdmowione[]>;
  }
}

/** Podstawa wymiaru obowiązująca od dnia zmiany minimalnej podstawy wymiaru zasiłku w trakcie okresu zasiłku. */
export interface ZmianaPodstawyWOkresie {
  od: DataISO;
  kwota: Grosze;
}

declare module '@/domena/typy/kalkulacje' {
  interface PodstawaWymiaru {
    /** Kolejne podstawy wymiaru od dnia zmiany minimalnej podstawy wymiaru zasiłku, w kolejności dat. */
    zmianyWOkresie?: ZmianaPodstawyWOkresie[];
  }
}
