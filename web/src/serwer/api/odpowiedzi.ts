// Odpowiedzi REST API w wersji 1: dane w formacie JSON i błąd w jednym formacie BladApi { kod, pola?, parametry? }.
// Status HTTP błędu pochodzi z kolumny Kod HTTP tablicy komunikatów. Kod, który tablica opisuje statusem 2xx
// (komunikat INFO albo WARNING), w odpowiedzi błędu blokuje operację, więc dostaje status 422 Unprocessable Content.
import { unstable_rethrow } from 'next/navigation';
import type { BladApi } from '@/domena/typy/api-v1';
import type { BledyPol, KodKomunikatu } from '@/domena/typy';
import { statusyHttpKomunikatow } from '@/serwer/api/statusy-http';

const NAGLOWKI = { 'Cache-Control': 'no-store' } as const;

/** Status HTTP odpowiedzi błędu z kodem komunikatu. */
export function statusBledu(kod: KodKomunikatu): number {
  const status = statusyHttpKomunikatow[kod] ?? 400;
  return status >= 400 ? status : 422;
}

export function odpowiedzDanych<T>(dane: T, status = 200): Response {
  return Response.json(dane, { status, headers: NAGLOWKI });
}

export function odpowiedzBledu(
  kod: KodKomunikatu,
  opcje: { pola?: Record<string, KodKomunikatu>; parametry?: Record<string, string> } = {},
): Response {
  const blad: BladApi = { kod };
  if (opcje.pola && Object.keys(opcje.pola).length > 0) blad.pola = opcje.pola;
  if (opcje.parametry && Object.keys(opcje.parametry).length > 0) blad.parametry = opcje.parametry;
  return Response.json(blad, { status: statusBledu(kod), headers: NAGLOWKI });
}

/** Błędy pól bez wpisów pustych. */
export function bezPustych(bledy: BledyPol<string>): Record<string, KodKomunikatu> {
  const wynik: Record<string, KodKomunikatu> = {};
  for (const [pole, kod] of Object.entries(bledy)) if (kod !== undefined) wynik[pole] = kod;
  return wynik;
}

/** Odpowiedź błędu walidacji z kodem pierwszego błędnego pola albo null, gdy pola są poprawne. */
export function odpowiedzBledowPol(bledy: BledyPol<string>, parametry?: Record<string, string>): Response | null {
  const pola = bezPustych(bledy);
  const pierwszy = Object.values(pola)[0];
  if (pierwszy === undefined) return null;
  return odpowiedzBledu(pierwszy, { pola, ...(parametry ? { parametry } : {}) });
}

/**
 * Wykonuje obsługę żądania. Wyjątek z funkcji domeny, na przykład po danych o niezgodnej strukturze, kończy się
 * odpowiedzią z kodem `kodAwarii`; szczegóły trafiają wyłącznie do dziennika serwera.
 */
export async function obsluzZadanie(kodAwarii: KodKomunikatu, obsluga: () => Promise<Response>): Promise<Response> {
  try {
    return await obsluga();
  } catch (blad) {
    // Sygnały Next.js (np. rezygnacja z prerenderu po odczycie nagłówków) wracają do frameworka.
    unstable_rethrow(blad);
    console.error('[api/v1]', blad);
    return odpowiedzBledu(kodAwarii);
  }
}
