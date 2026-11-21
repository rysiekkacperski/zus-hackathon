// Pełnomocnictwo PEL drugiego rodzica (kontrakt, sekcja 7.2). Właściciel: u23 (Dołączenie drugiego rodzica i pełnomocnictwo PEL).
// Zaślepka fundamentu: implementuje u23. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type {
  DanaZeZrodla,
  DaneDrugiegoRodzicaZKonta,
  DaneZKontaZus,
  DataISO,
  PelnomocnictwoPel,
  StanPelnomocnictwa,
} from '@/domena/typy';

/** Stan pełnomocnictwa w dniu `dzis` (0221, 0222, 0223, 0224). */
export function stanPelnomocnictwa(p: PelnomocnictwoPel | null, dzis: DataISO): StanPelnomocnictwa {
  return 'brak';
}

/** Dane drugiego rodzica z kopii Danych z konta ZUS mocodawcy. */
export function daneZPelnomocnictwa(kopiaMocodawcy: DaneZKontaZus): DaneDrugiegoRodzicaZKonta {
  throw new Error('Zaślepka: u23');
}

/** Dana z pierwszeństwem źródeł: konto ZUS > pełnomocnictwo PEL > odpowiedź rodzica. Zaślepka zwraca pierwszą podaną. */
export function pierwszenstwoZrodel<T>(
  a: DanaZeZrodla<T> | null | undefined,
  b: DanaZeZrodla<T> | null | undefined,
): DanaZeZrodla<T> | null {
  return a ?? b ?? null;
}
