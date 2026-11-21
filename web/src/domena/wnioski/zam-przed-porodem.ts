// Wniosek ZAM przed porodem i przeliczenie po porodzie (kontrakt, sekcja 7.2).
// Właściciel: u33 (ZAM: wniosek dla płatnika, przed porodem i przy przyjęciu dziecka).
// Zaślepka fundamentu: implementuje u33. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { DataISO, LiczbaDzieci, Okres, WniosekZam } from '@/domena/typy';

/** Zakres dnia początku zasiłku przed porodem (0229, 0042, 0103, 0104). */
export function zakresDniaPoczatku(ptp: DataISO, dzis: DataISO): Okres {
  throw new Error('Zaślepka: u33');
}

/** Wniosek przeliczony po porodzie (0231, 0232). Zaślepka zwraca wniosek bez zmian. */
export function przeliczPoPorodzie(wniosek: WniosekZam, dataPorodu: DataISO, liczba: LiczbaDzieci): WniosekZam {
  return wniosek;
}
