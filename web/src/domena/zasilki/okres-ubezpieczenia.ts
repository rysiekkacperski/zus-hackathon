// Okres nieprzerwanego ubezpieczenia chorobowego (kontrakt, sekcja 7.2). Właściciel: u16 (Świadczenia w ciąży i dokumenty wniosków).
// Zaślepka fundamentu: implementuje u16. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { DataISO, Katalog, OkresOtwarty, TytulUbezpieczenia } from '@/domena/typy';

/** Okres ubezpieczenia chorobowego trwający w dniu `dzien`; null, gdy rodzic nie podlega ubezpieczeniu. */
export function okresUbezpieczeniaChorobowego(
  tytuly: TytulUbezpieczenia[],
  dzien: DataISO,
  katalog: Katalog,
): OkresOtwarty | null {
  return null;
}
