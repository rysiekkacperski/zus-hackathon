// Kreator wniosku o zasiłek chorobowy ZAS-53 (kontrakt, sekcja 7.2). Właściciel: u30 (Kreator wniosku o zasiłek chorobowy ZAS-53).
// Zaślepka fundamentu: implementuje u30. Kontrakt nie podaje parametrów części funkcji; ustala je właściciel.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { DaneZKontaZus, KodKomunikatu, Wniosek, WniosekZas53, Zalacznik, ZaswiadczenieEzla } from '@/domena/typy';

export type UstaleniePrawaZas53 = Partial<WniosekZas53> & { kod?: KodKomunikatu; parametry?: Record<string, string> };

/** Blokada kreatora ZAS-53 (0004, 0233, 0083); null, gdy kreator jest dostępny. */
export function sprawdzDostepZas53(...argumenty: unknown[]): { kod: KodKomunikatu; parametry?: Record<string, string> } | null {
  return null;
}

/** Zaświadczenia e-ZLA, do których można złożyć wniosek. */
export function listaZaswiadczenZas53(kopia: DaneZKontaZus | null, wnioski: Wniosek[]): ZaswiadczenieEzla[] {
  return [];
}

/** Prawo do zasiłku chorobowego za okres zaświadczenia (0084, 0086, 0182, 0234, 0235, 0236, 0242). */
export function ustalPrawoZas53(...argumenty: unknown[]): UstaleniePrawaZas53 {
  throw new Error('Zaślepka: u30');
}

/** Czy niezdolność do pracy trwa nieprzerwanie. */
export function nieprzerwanaNiezdolnosc(...argumenty: unknown[]): boolean {
  return false;
}

/** Załączniki wniosku ZAS-53 (0149). */
export function zbudujZalaczniki(...argumenty: unknown[]): Zalacznik[] {
  return [];
}
