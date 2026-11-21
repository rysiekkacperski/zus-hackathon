// Rozszerzenia typów wspólnych dla asystenta AI (kontrakt, sekcja 12.3). Właściciel: u31 (Asystent AI).
// Szczegóły kontekstu niosą dane, których wymagają reguły odpowiedzi, a których nie ma w polach kontraktu:
// dobrowolne ubezpieczenie chorobowe, potwierdzenie daty porodu, imiona rodziców, formę z konta ZUS,
// kwoty wariantów z Wyników kalkulacji i kwoty z Katalogu świadczeń w postaci sformatowanej.
import type { FormaZatrudnienia, IdSprawy } from '@/domena/typy';

export interface WariantyZasilkuWKontekscie {
  wariant100i70?: {
    macierzynskiMiesiecznie: string;
    tygodnieMacierzynskiego: number;
    rodzicielskiMiesiecznie: string;
    tygodnieRodzicielskiego: number;
    razem: string;
  };
  wariant81?: { miesiecznie: string; tygodnie: number; razem: string };
  /** Sumy z porównania wariantów (kalkulator wariantu) albo ze scenariuszy kalkulatora zintegrowanego. */
  suma100i70?: string;
  suma81?: string;
}

export interface SzczegolyKontekstuAsystenta {
  dobrowolneChorobowe: { matka?: boolean; drugiRodzic?: boolean };
  dataPoroduPotwierdzona: boolean;
  imionaRodzicow: { matka?: string; drugiRodzic?: string };
  /** Forma i dobrowolne ubezpieczenie chorobowe z Danych z konta ZUS zalogowanego ubezpieczonego. */
  daneZusKonta?: { forma?: FormaZatrudnienia; dobrowolneChorobowe?: boolean };
  warianty: WariantyZasilkuWKontekscie;
  /** Kwoty z Katalogu świadczeń obowiązujące w dniu pytania. */
  kwotyKatalogu: { progBecikowego?: string; swiadczenieRodzicielskie?: string; swiadczenieWychowawcze?: string };
  /** Dochód na osobę w postaci sformatowanej, gdy profil go zawiera. */
  dochodNaOsobe?: string;
  /** Identyfikator pozycji katalogu dla sprawy planu (sprawy na rodzica mają przyrostek, np. K21-matka). */
  pozycjeSpraw: Record<IdSprawy, string>;
}

declare module '@/domena/typy/api' {
  interface KontekstAsystenta {
    szczegoly?: SzczegolyKontekstuAsystenta;
  }
}

export {};
