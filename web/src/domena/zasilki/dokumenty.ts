// Dokumenty i adresaci wniosków ze słownika dokumentów (kontrakt, sekcja 7.2). Właściciel: u16 (Świadczenia w ciąży i dokumenty wniosków).
// Zaślepka fundamentu: implementuje u16. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { FormaZatrudnienia, Katalog, WpisSlownikaDokumentow } from '@/domena/typy';

export interface KluczDokumentow {
  swiadczenieAlboWniosek: string;
  forma: FormaZatrudnienia;
  platnik: WpisSlownikaDokumentow['klucz']['platnik'];
  poUstaniu: boolean;
  sytuacja?: string;
}

/** Wpisy słownika dokumentów pasujące do klucza; 0087, gdy brak wpisu. */
export function wybierzDokumenty(w: KluczDokumentow, katalog: Katalog): WpisSlownikaDokumentow[] | { kod: '0087' } {
  return [];
}
