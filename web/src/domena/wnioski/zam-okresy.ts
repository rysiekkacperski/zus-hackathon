// Okresy zasiłku we wniosku ZAM (kontrakt, sekcja 7.2). Właściciel: u27 (Kreator wniosku ZAM do ZUS).
// Zaślepka fundamentu: implementuje u27. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type {
  DaneCiazyIDziecka,
  DataISO,
  Katalog,
  KodKomunikatu,
  OkresWniosku,
  PlanRodziny,
  WniosekZam,
} from '@/domena/typy';

/** Wejście wyliczenia okresów ZAM; kształt ustala właściciel (u27). */
export interface WejscieOkresowZam {
  wniosek: WniosekZam;
  daneCiazy: DaneCiazyIDziecka | null;
  plan: PlanRodziny | null;
}

export interface WynikOkresowZam {
  okresy: OkresWniosku[];
  komunikaty: { kod: KodKomunikatu; parametry?: Record<string, string> }[];
}

/** Okresy zasiłku z wariantem 81,5%, 21 dni rodzicielskiego w ZAM (0038, 0042, 0061). */
export function wyliczOkresyZam(w: WejscieOkresowZam, katalog: Katalog, dzis: DataISO): WynikOkresowZam {
  return { okresy: [], komunikaty: [] };
}
