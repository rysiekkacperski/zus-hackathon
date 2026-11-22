// Dzień i chwila żądania REST API (kontrakt zegara przewodnika: strefa Europe/Warsaw i parametr dataDemo).
// Pierwszeństwo: `teraz` (pełna chwila), `dzis` (dzień z godziną serwera), `dataDemo` z treści, parametru adresu
// albo nagłówka X-Data-Demo, a bez nich bieżąca data i godzina serwera w Warszawie. Odczyt zegara poprzedza `await io()`,
// więc przy Cache Components chwila należy do żądania, a nie do prerenderu.
import { io } from 'next/cache';
import { dataZeZnacznika, dzisZZegara, terazZZegara } from '@/domena/daty';
import type { DataISO, KontekstOperacji } from '@/domena/typy';
import { czyDataISO, czyZnacznikCzasu, type BledyWejscia, type Obiekt } from '@/serwer/api/walidacja';

export const NAGLOWEK_DATY_DEMO = 'x-data-demo';

function wartoscZadania(zadanie: Request, tresc: Obiekt | undefined, klucz: string): unknown {
  if (tresc !== undefined && tresc[klucz] !== undefined) return tresc[klucz];
  const zAdresu = new URL(zadanie.url).searchParams.get(klucz);
  return zAdresu === null || zAdresu === '' ? undefined : zAdresu;
}

/** Kontekst czasu żądania albo błędy pól `dzis`, `dataDemo` i `teraz` (0010). */
export async function czasZadania(
  zadanie: Request,
  tresc?: Obiekt,
): Promise<{ ok: true; czas: KontekstOperacji } | { ok: false; bledy: BledyWejscia }> {
  const bledy: BledyWejscia = {};
  const teraz = wartoscZadania(zadanie, tresc, 'teraz');
  const dzis = wartoscZadania(zadanie, tresc, 'dzis');
  const dataDemo = wartoscZadania(zadanie, tresc, 'dataDemo') ?? (zadanie.headers.get(NAGLOWEK_DATY_DEMO) || undefined);
  if (teraz !== undefined && !czyZnacznikCzasu(teraz)) bledy.teraz = '0010';
  if (dzis !== undefined && !czyDataISO(dzis)) bledy.dzis = '0010';
  if (dataDemo !== undefined && !czyDataISO(dataDemo)) bledy.dataDemo = '0010';
  if (Object.keys(bledy).length > 0) return { ok: false, bledy };

  if (typeof teraz === 'string') {
    const dzien = typeof dzis === 'string' ? dzis : dataZeZnacznika(teraz);
    return { ok: true, czas: { dzis: dzien, teraz: dzien === dataZeZnacznika(teraz) ? teraz : `${dzien}${teraz.slice(10)}` } };
  }
  await io();
  const ms = Date.now();
  const podstawiony: DataISO | null = typeof dzis === 'string' ? dzis : typeof dataDemo === 'string' ? dataDemo : null;
  return { ok: true, czas: { dzis: dzisZZegara(ms, podstawiony), teraz: terazZZegara(ms, podstawiony) } };
}
