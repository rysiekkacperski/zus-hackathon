// Rozszerzenia typów wspólnych dla weryfikacji przykładowej sprawy (kontrakt, sekcja 12.3).
// Właściciel: u21 (Przykładowe sprawy: weryfikacja i sprawdzenie wyliczeń).
// Pole rozszerzenie niesie szczegóły wyniku świadczeń, uzasadnienie płatnika, okres do wyliczenia,
// parametry komunikatów i rodzaj zdarzenia, których nie ma w polach kontraktu.
import type { DataISO, Grosze, KodKomunikatu, Okres, RodzajUrlopu, RozstrzygniecieSprawy } from '@/domena/typy';

export type SwiadczenieSprawy = RozstrzygniecieSprawy['swiadczenie'];

export type RodzajZdarzeniaSprawy = 'porod' | 'przewidywany-termin' | 'niezdolnosc' | 'okres-ojca';

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
}
