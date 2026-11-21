// Przygotowanie kopii Danych z konta ZUS (kontrakt, sekcja 7.2). Właściciel: u03 (Odczyt danych z konta ZUS).
// Zaślepka fundamentu: implementuje u03. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type {
  DaneZKontaZus,
  DataISO,
  TytulUbezpieczenia,
  ZnacznikCzasu,
  ZrodloweDaneKontaZus,
} from '@/domena/typy';

export { oznaczNoweDzieci } from '@/domena/dane-zus/nowe-dzieci';

/** Kopia danych źródłowych z datą odczytu po zastosowaniu rejestru filtryOdczytu. */
export function przygotujKopie(w: {
  zrodlo: ZrodloweDaneKontaZus;
  poprzednia: DaneZKontaZus | null;
  teraz: ZnacznikCzasu;
}): DaneZKontaZus {
  throw new Error('Zaślepka: u03');
}

/** Pierwszy dzień bez tytułu do ubezpieczenia na dzień `dzien`; undefined, gdy tytuł trwa. */
export function brakTytuluOd(tytuly: TytulUbezpieczenia[], dzien: DataISO): DataISO | undefined {
  return undefined;
}

/** Liczba części odczytu pokazywanych w stanie odczytu w toku (6 części). */
export function postepOdczytu(): number {
  return 6;
}
