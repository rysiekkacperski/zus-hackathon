// GET /api/przykladowe-sprawy/zestawy (kontrakt, sekcje 8 i 10.2): 200 { sprawy: SprawaPrzykladowa[] } z plików JSON
// katalogu PRZYKLADOWE_SPRAWY_ZUS_KATALOG, pusta lista bez katalogu.
// Właściciel: u05. Plik JSON zawiera jedną sprawę albo listę spraw; sprawy bez danych pomijamy.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { connection } from 'next/server';
import type { OdpowiedzZestawowSpraw, SprawaPrzykladowa } from '@/domena/typy';

function czySprawa(w: unknown): w is SprawaPrzykladowa {
  const s = w as Partial<SprawaPrzykladowa> | null;
  return s !== null && typeof s === 'object' && typeof s.idSprawy === 'string' && typeof s.dane === 'object'
    && Array.isArray(s.dokumenty) && Array.isArray(s.rozstrzygniecie);
}

async function wczytajZestawy(katalog: string): Promise<SprawaPrzykladowa[]> {
  const pliki = (await readdir(katalog)).filter((nazwa) => nazwa.toLowerCase().endsWith('.json')).sort();
  const sprawy: SprawaPrzykladowa[] = [];
  for (const nazwa of pliki) {
    try {
      const zawartosc: unknown = JSON.parse(await readFile(path.join(katalog, nazwa), 'utf8'));
      const lista = Array.isArray(zawartosc) ? zawartosc : [zawartosc];
      for (const wpis of lista) if (czySprawa(wpis)) sprawy.push({ ...wpis, zrodlo: 'zestaw-zus' });
    } catch {
      // Plik nieczytelny albo z błędnym JSON pomijamy, żeby pozostałe sprawy trafiły na listę.
    }
  }
  return sprawy;
}

export async function GET(): Promise<Response> {
  await connection();
  const katalog = process.env.PRZYKLADOWE_SPRAWY_ZUS_KATALOG?.trim();
  let sprawy: SprawaPrzykladowa[] = [];
  if (katalog) {
    try {
      sprawy = await wczytajZestawy(katalog);
    } catch {
      sprawy = [];
    }
  }
  const odpowiedz: OdpowiedzZestawowSpraw = { sprawy };
  return Response.json(odpowiedz);
}
