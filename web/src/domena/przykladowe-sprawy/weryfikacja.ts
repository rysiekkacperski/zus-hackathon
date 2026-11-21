// Weryfikacja przykładowej sprawy i dane do kalkulatora (kontrakt, sekcja 7.2).
// Właściciel: u21 (Przykładowe sprawy: weryfikacja i sprawdzenie wyliczeń).
// Zaślepka fundamentu: implementuje u21. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type {
  DaneSprawy,
  DaneWejscioweKalkulatora,
  Katalog,
  PodstawaWymiaru,
  WynikWeryfikacjiSprawy,
} from '@/domena/typy';

/** Osiem warunków prawa do świadczeń z ubezpieczenia chorobowego (0226, 0227). */
export function weryfikujUbezpieczenieChorobowe(dane: DaneSprawy, katalog: Katalog): WynikWeryfikacjiSprawy {
  throw new Error('Zaślepka: u21');
}

/** Podstawa wymiaru z kwot miesięcznych sprawy; kod, gdy nie da się jej ustalić. */
export function ustalPodstaweZeSprawy(dane: DaneSprawy, katalog: Katalog): PodstawaWymiaru | { kod: '0094' | '0173' } {
  return { kod: '0094' };
}

/** Dane wejściowe kalkulatora ze sprawy przykładowej. */
export function daneWejscioweZeSprawy(dane: DaneSprawy): DaneWejscioweKalkulatora {
  throw new Error('Zaślepka: u21');
}
