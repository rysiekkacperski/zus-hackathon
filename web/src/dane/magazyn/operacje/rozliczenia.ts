// Zaświadczenie o stanie rozliczeń składek (kontrakt, sekcja 6.5). Właściciel: u14 (Dane ZUS: e-ZLA, rozliczenia składek, statusy wniosków).
// Zaślepka fundamentu: implementuje u14. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { DataISO, IdPliku, KontekstOperacji, WynikOperacji } from '@/domena/typy';

/** Zaświadczenie na dzień `dzien` zapisane w symulowanym ZUS i jako plik (0133 przy pueEzusNiedostepne). */
export async function wystawZaswiadczenieORozliczeniach(
  dzien: DataISO,
  ctx: KontekstOperacji,
): Promise<WynikOperacji<{ idPliku: IdPliku }>> {
  return { ok: false, kod: '0003' };
}
