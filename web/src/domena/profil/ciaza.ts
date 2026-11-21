// Dane ciąży w Profilu na start (kontrakt, sekcja 7.2). Właściciel: u10 (Profil na start: ciąża, zmiana zatrudnienia, rodzina).
// Zaślepka fundamentu: implementuje u10. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import { dodajDni } from '@/domena/daty';
import type { BledyPol, DataISO, Okres } from '@/domena/typy';

/** Pola formularza ViewProfilePregnancy; kształt ustala właściciel (u10). */
export type FormularzDanychCiazy = Record<string, unknown>;

/** Okres ciąży: od dnia odniesienia − 280 dni do dnia odniesienia. */
export function okresCiazy(odniesienie: DataISO): Okres {
  return { od: dodajDni(odniesienie, -280), do: odniesienie };
}

/** Błędy danych ciąży: 0007, 0008, 0009, 0010, 0011, 0012, 0006. */
export function walidujDaneCiazy(f: FormularzDanychCiazy, dzis: DataISO): BledyPol<string> {
  return {};
}
