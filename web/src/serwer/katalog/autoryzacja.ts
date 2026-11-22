import 'server-only';

import { timingSafeEqual } from 'node:crypto';
import { kontoPrzykladowe } from '@/dane/konta-demo';

// Uprawnienie do zapisu w usłudze REST /api/katalog: zapisuje wyłącznie rola Administrator. Właściciel: u06.
//
// Prototyp trzyma sesję mZUS w przeglądarce, więc serwer przyjmuje dwa sposoby potwierdzenia roli:
// 1. nagłówek `Authorization: Bearer <PANEL_TOKEN>`, gdy zmienna PANEL_TOKEN ma wartość; ten sposób służy
//    systemom ZUS i skryptom, które zmieniają katalog bez przeglądarki;
// 2. nagłówek `X-Sesja-Demo: <identyfikator sesji>:<PESEL>` z numerem PESEL konta demonstracyjnego z rolą
//    Administrator; ten sposób działa w trybie demonstracyjnym, czyli dopóki zmienna KATALOG_TRYB_DEMO
//    ma wartość inną niż `nie`.
// Wdrożenie produkcyjne ustawia KATALOG_TRYB_DEMO=nie i PANEL_TOKEN albo zastępuje ten moduł autoryzacją mZUS.

export const NAGLOWEK_SESJI_DEMO = 'x-sesja-demo';

export type WynikAutoryzacji = { ok: true; przez: string } | { ok: false; status: 401 | 403 };

function rowneTokeny(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Czy tryb demonstracyjny usługi katalogu przyjmuje sesję demo z przeglądarki. */
export function czyTrybDemoKatalogu(): boolean {
  return process.env.KATALOG_TRYB_DEMO?.trim().toLowerCase() !== 'nie';
}

/** Rozstrzyga, czy żądanie pochodzi od Administratora; `przez` to PESEL konta albo znacznik tokenu panelu. */
export function autoryzujAdministratora(zadanie: Request): WynikAutoryzacji {
  const token = process.env.PANEL_TOKEN?.trim();
  const naglowek = zadanie.headers.get('authorization')?.trim() ?? '';
  if (token && naglowek.toLowerCase().startsWith('bearer ')) {
    return rowneTokeny(naglowek.slice(7).trim(), token) ? { ok: true, przez: 'panel-token' } : { ok: false, status: 403 };
  }
  const sesja = zadanie.headers.get(NAGLOWEK_SESJI_DEMO)?.trim() ?? '';
  if (sesja === '') return { ok: false, status: 401 };
  if (!czyTrybDemoKatalogu()) return { ok: false, status: 403 };
  const m = /^([A-Za-z0-9_-]{1,80}):(\d{11})$/.exec(sesja);
  if (m === null) return { ok: false, status: 401 };
  const konto = kontoPrzykladowe(m[2]);
  return konto?.rodzaj === 'konto-administratora' ? { ok: true, przez: konto.pesel } : { ok: false, status: 403 };
}
