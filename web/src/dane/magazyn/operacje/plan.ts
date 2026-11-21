// Operacje Planu rodzica: statusy, oznaczenia i wybrany wariant (kontrakt, sekcje 6.1 i 6.5). Właściciel: u08 (Silnik planu rodziny).
// Zaślepka fundamentu: implementuje u08. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
// Inne elementy systemu zmieniają status sprawy wyłącznie przez te operacje.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type {
  IdSprawy,
  KontekstOperacji,
  OznaczenieSprawy,
  StatusSprawy,
  WybranyWariant,
  WynikOperacji,
  ZrodloStatusu,
} from '@/domena/typy';

export function ustawStatusSprawy(
  idSprawy: IdSprawy,
  status: StatusSprawy,
  zrodlo: ZrodloStatusu,
  ctx: KontekstOperacji,
): WynikOperacji {
  return { ok: false, kod: '0003' };
}

/** Przywrócenie statusu sprzed ostatniej zmiany. */
export function cofnijStatus(idSprawy: IdSprawy, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}

/** Dodanie (`wl` = true) albo usunięcie oznaczenia sprawy. */
export function ustawOznaczenie(
  idSprawy: IdSprawy,
  oznaczenie: OznaczenieSprawy,
  wl: boolean,
  ctx: KontekstOperacji,
): WynikOperacji {
  return { ok: false, kod: '0003' };
}

export function zapiszWybranyWariant(wariant: WybranyWariant, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}
