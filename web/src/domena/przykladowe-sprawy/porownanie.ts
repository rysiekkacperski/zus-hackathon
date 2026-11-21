// Porównanie weryfikacji i wyliczeń z rozstrzygnięciem sprawy (kontrakt, sekcja 7.2).
// Właściciel: u21 (Przykładowe sprawy: weryfikacja i sprawdzenie wyliczeń).
// Zaślepka fundamentu: implementuje u21. Kontrakt nie podaje typów wyniku; ustala je właściciel.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type {
  Grosze,
  KodKomunikatu,
  RozstrzygniecieSprawy,
  WynikScenariusza,
  WynikWeryfikacjiSprawy,
} from '@/domena/typy';

export interface WynikPorownaniaWyliczenia {
  wynik: 'zgodne' | 'rozne' | 'bez-porownania';
  kod: KodKomunikatu;
  parametry?: Record<string, string>;
}

/** Porównanie wyników weryfikacji z rozstrzygnięciem (0177, 0178, 0180). */
export function porownajWeryfikacje(
  wynik: WynikWeryfikacjiSprawy,
  rozstrzygniecie: RozstrzygniecieSprawy[],
): WynikWeryfikacjiSprawy['porownanie'] {
  return [];
}

/** Porównanie wyliczenia kalkulatora z rozstrzygnięciem z tolerancją w groszach (0111, 0112, 0180). */
export function porownajWyliczenie(
  wynik: WynikScenariusza,
  rozstrzygniecie: RozstrzygniecieSprawy[],
  tolerancja: Grosze,
): WynikPorownaniaWyliczenia {
  throw new Error('Zaślepka: u21');
}
