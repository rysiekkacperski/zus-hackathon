// Decyzje z kalkulatorów wariantu zasiłku i podziału urlopu (kontrakt, sekcja 6.5).
// Właściciel: u26 (Kalkulatory wariantu zasiłku i podziału urlopu).
// Zaślepka fundamentu: implementuje u26. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { KontekstOperacji, WynikOperacji, ZapisPodzialuUrlopu, ZapisPorownaniaWariantow } from '@/domena/typy';

export function zapiszDecyzjeWariantu(
  zapis: Omit<ZapisPorownaniaWariantow, 'id' | 'zapisano' | 'konto'>,
  ctx: KontekstOperacji,
): WynikOperacji {
  return { ok: false, kod: '0003' };
}

export function zapiszPlanPodzialu(
  zapis: Omit<ZapisPodzialuUrlopu, 'id' | 'zapisano' | 'konto'>,
  ctx: KontekstOperacji,
): WynikOperacji {
  return { ok: false, kod: '0003' };
}
