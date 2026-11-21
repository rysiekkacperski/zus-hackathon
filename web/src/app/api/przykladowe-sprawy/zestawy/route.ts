// GET /api/przykladowe-sprawy/zestawy (kontrakt, sekcje 8 i 10.2): 200 { sprawy: SprawaPrzykladowa[] } z plików JSON
// katalogu PRZYKLADOWE_SPRAWY_ZUS_KATALOG, pusta lista bez katalogu.
// Właściciel: u05 (Przykładowe sprawy: lista, dokumenty i odczyt AI).
// Zaślepka fundamentu: implementuje u05. Zaślepka odpowiada 501 z pustą listą; connection() wyłącza prerender odpowiedzi.
import { connection } from 'next/server';
import type { OdpowiedzZestawowSpraw } from '@/domena/typy';

export async function GET(): Promise<Response> {
  await connection();
  const odpowiedz: OdpowiedzZestawowSpraw = { sprawy: [] };
  return Response.json(odpowiedz, { status: 501 });
}
