// Rezygnacja matki z części urlopu i przejęcie urlopu przez ojca (kontrakt, sekcja 6.5). Właściciel: u34 (Rezygnacja matki i wniosek ojca o zasiłek).
// Zaślepka fundamentu: implementuje u34. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type {
  DataISO,
  IdSprawy,
  IdWidoku,
  IdWniosku,
  KontekstOperacji,
  RodzajSytuacjiSzczegolnej,
  Wniosek,
  WniosekOUrlop,
  WniosekZam,
  WynikOperacji,
} from '@/domena/typy';

/** Przyczyna i data zdarzenia przejęcia urlopu; kształt ustala właściciel (u34). */
export interface ParametryPrzejecia {
  przyczyna: 'rezygnacja' | RodzajSytuacjiSzczegolnej;
  dataZdarzenia?: DataISO;
}

export function rozpocznijRezygnacje(idSprawy: IdSprawy, ctx: KontekstOperacji): WynikOperacji<WniosekOUrlop> {
  return { ok: false, kod: '0003' };
}

export function rozpocznijPrzejecie(
  idSprawy: IdSprawy,
  parametry: ParametryPrzejecia,
  ctx: KontekstOperacji,
): WynikOperacji<Wniosek> {
  return { ok: false, kod: '0003' };
}

/** Zapis odpowiedzi z ekranu rezygnacji albo przejęcia i ostatniego ekranu. */
export function zapiszKrok(
  id: IdWniosku,
  zmiana: Partial<WniosekOUrlop> | Partial<WniosekZam>,
  ekran: IdWidoku,
  ctx: KontekstOperacji,
): WynikOperacji<Wniosek> {
  return { ok: false, kod: '0003' };
}
