// Rezygnacja matki z części zasiłku macierzyńskiego (kontrakt, sekcja 7.2). Właściciel: u34 (Rezygnacja matki i wniosek ojca o zasiłek).
// Zaślepka fundamentu: implementuje u34. Kontrakt nie podaje parametrów części funkcji; ustala je właściciel.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { DataISO, IdWidoku, KodKomunikatu, Okres } from '@/domena/typy';

/** Okres urlopu macierzyńskiego z dniami wykorzystanymi przed porodem. */
export function wyliczOkresUrlopuMacierzynskiego(dataPorodu: DataISO, wymiar: number, dniPrzed: number): Okres {
  throw new Error('Zaślepka: u34');
}

/** Ekran startowy rezygnacji (0206, 0258, 0207, 0261, 0142). */
export function otworzRezygnacje(...argumenty: unknown[]): { cel: IdWidoku; kod?: KodKomunikatu } {
  return { cel: 'ViewMaternityResignation' };
}

/** Komunikat po wysłaniu wniosku (0199, 0135, 0143); null, gdy brak. */
export function komunikatPoWyslaniu(...argumenty: unknown[]): { kod: KodKomunikatu; parametry?: Record<string, string> } | null {
  return null;
}
