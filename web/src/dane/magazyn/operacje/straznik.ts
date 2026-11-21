// Potwierdzenie opłacenia składek w sprawie strażnika (kontrakt, sekcja 6.5). Właściciel: u12 (Ekrany planu, strona główna i strażnik).
// Zaślepka fundamentu: implementuje u12. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { KontekstOperacji, MiesiacISO, WynikOperacji } from '@/domena/typy';

export function potwierdzOplacenieSkladek(miesiac: MiesiacISO, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}
