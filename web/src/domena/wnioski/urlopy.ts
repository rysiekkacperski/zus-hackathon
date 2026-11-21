// Wnioski o urlop do pracodawcy: kreator, rodzaje, okresy, stawka, terminy, załączniki (kontrakt, sekcja 7.2).
// Właściciel: u28 (Wnioski o urlop do pracodawcy: rdzeń).
// Zaślepka fundamentu: implementuje u28. Kontrakt nie podaje parametrów części funkcji; ustala je właściciel.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type {
  IdSprawy,
  IdWidoku,
  KodKomunikatu,
  KontoPrzewodnika,
  OkresWniosku,
  PlanRodziny,
  PodrodzajWnioskuOUrlop,
  Rola,
  StanRodziny,
  Wniosek,
  WniosekOUrlop,
  Zalacznik,
} from '@/domena/typy';

/** Ekran startowy kreatora wniosków o urlop (0140, 0064). */
export function otworzKreatorWnioskow(
  konto: KontoPrzewodnika,
  rodzina: StanRodziny | null,
  idSprawy: IdSprawy | undefined,
): { cel: IdWidoku; kod?: KodKomunikatu } {
  return { cel: 'ViewLeaveRequestType' };
}

/** Rodzaje wniosku dostępne dla roli i stanu rodziny. */
export function rodzajeWniosku(
  rola: Rola,
  rodzina: StanRodziny | null,
  plan: PlanRodziny | null,
  wnioski: Wniosek[],
): PodrodzajWnioskuOUrlop[] {
  return [];
}

/** Wartości proponowane w formularzu wniosku. */
export function propozycjeFormularza(...argumenty: unknown[]): Partial<WniosekOUrlop> {
  return {};
}

/** Okresy urlopu we wniosku. */
export function wyliczOkresyUrlopu(...argumenty: unknown[]): OkresWniosku[] {
  return [];
}

/** Stawka zasiłku za okres urlopu (0038, 0165). */
export function stawkaZasilku(...argumenty: unknown[]): { stawka: '81-5' | '100-70' | null; kod?: KodKomunikatu } {
  return { stawka: null };
}

/** Ostrzeżenie o terminie złożenia wniosku (0136, 0137, 0203, 0204, 0205); null, gdy brak. */
export function ostrzezenieTerminu(...argumenty: unknown[]): { kod: KodKomunikatu; parametry?: Record<string, string> } | null {
  return null;
}

/** Załączniki wniosku o urlop. */
export function listaZalacznikow(...argumenty: unknown[]): Zalacznik[] {
  return [];
}
