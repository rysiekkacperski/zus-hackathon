// Ustalenie płatnika zasiłku (kontrakt, sekcja 7.2). Właściciel: u07 (Profil na start: dane ZUS, płatnik, sytuacja).
// Zaślepka fundamentu: implementuje u07. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { FormaZatrudnienia, PlatnikZasilku, TytulUbezpieczenia, ZrodloDanej } from '@/domena/typy';

export type OdpowiedzOPlatniku = 'tak' | 'nie' | 'nie-wiem';

export type UstaleniePlatnikaZasilku =
  | { platnik: PlatnikZasilku; nazwa?: string; zrodlo: ZrodloDanej }
  | { pytaj: true; nazwaPlatnika?: string };

/** Płatnik zasiłku z formy zatrudnienia i tytułu albo potrzeba pytania rodzica (ViewProfilePayer). */
export function ustalPlatnikaZasilku(forma: FormaZatrudnienia, tytul?: TytulUbezpieczenia): UstaleniePlatnikaZasilku {
  return { pytaj: true };
}

/** Płatnik zasiłku z odpowiedzi rodzica na ViewProfilePayer. */
export function platnikZOdpowiedzi(o: OdpowiedzOPlatniku): PlatnikZasilku {
  return 'nieustalony';
}
