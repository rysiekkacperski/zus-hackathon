// Kolejka zmian katalogu w przeglądarce: wysyłka po wylogowaniu Administratora i edycje sprzed synchronizacji.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { EdycjeKatalogu, ZmianaKatalogu } from '@/domena/typy';

class Pamiec {
  m = new Map<string, string>();
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
  removeItem(k: string) { this.m.delete(k); }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  get length() { return this.m.size; }
  clear() { this.m.clear(); }
}
const g = globalThis as unknown as Record<string, unknown>;
g.window = { localStorage: new Pamiec(), sessionStorage: new Pamiec(), addEventListener() {}, removeEventListener() {} };
g.localStorage = (g.window as { localStorage: Pamiec }).localStorage;
g.sessionStorage = (g.window as { sessionStorage: Pamiec }).sessionStorage;

const ks = await import('@/dane/magazyn/katalog-serwer');
const stan = await import('@/dane/magazyn/stan');
const { autoryzujAdministratora } = await import('@/serwer/katalog/autoryzacja');
const { PESEL_ADMINISTRATORA_ZUS } = await import('@/dane/konta-demo');
const { edycjePuste, zastosujZmiane } = await import('@/domena/katalog/zmiany');

const RODZIC = '93041231085';
let edycjeSerwera: EdycjeKatalogu = edycjePuste();
let dziala = false;
const posty: number[] = [];
g.fetch = async (adres: string, init?: { method?: string; headers?: Record<string, string>; body?: string }) => {
  if (!dziala) throw new TypeError('fetch failed');
  if (init?.method === 'POST') {
    // Sesja Administratora jedzie w polu sesjaDemo treści, a nagłówki żądania nie zawierają numeru PESEL.
    assert.ok(!Object.values(init.headers ?? {}).some((w) => /\d{11}/.test(w)));
    const tresc = JSON.parse(init.body ?? '{}') as unknown;
    const autoryzacja = autoryzujAdministratora(new Request(`http://x${adres}`, { method: 'POST', headers: init.headers, body: init.body }), tresc);
    posty.push(autoryzacja.ok ? 200 : autoryzacja.status);
    if (!autoryzacja.ok) return new Response('{}', { status: autoryzacja.status });
    edycjeSerwera = zastosujZmiane(edycjeSerwera, (JSON.parse(init.body ?? '{}') as { zmiana: ZmianaKatalogu }).zmiana);
  }
  return Response.json({ edycje: edycjeSerwera, trwaly: true });
};

function zaloguj(pesel: string, rola: string) {
  stan.wykonajOperacje(() => {
    stan.zapiszStanKonta({ konto: { pesel, rola, imie: 'a', nazwisko: 'b', historiaSesji: [] } } as never, 'systemowe');
    stan.zapiszSesje({ idSesji: `sesja${pesel}`, pesel, ostatnieDzialanie: new Date().toISOString() } as never);
  });
}
const chwila = () => new Promise((r) => setTimeout(r, 20));
const wpis = (id: string) => ({ id, nazwa: id, slownik: 'kwoty-i-progi', warianty: [], wersje: [] });

test('zmiana Administratora zapisana bez usługi trafia na serwer po wylogowaniu i zalogowaniu rodzica', async () => {
  zaloguj(PESEL_ADMINISTRATORA_ZUS, 'administrator');
  stan.wykonajOperacje(() => ks.zapiszZmianeKatalogu({ rodzaj: 'nowy-wpis', wpis: wpis('parametr-1') } as unknown as ZmianaKatalogu));
  ks.zaplanujWysylkeKatalogu();
  await chwila();
  assert.equal(stan.odczytajGlobalne().zmianyKataloguDoWyslania?.length, 1);

  stan.wykonajOperacje(() => stan.zapiszSesje(null));
  zaloguj(RODZIC, 'rodzic');
  dziala = true;
  await ks.pobierzKatalogZSerwera('siec');
  await chwila();
  await ks.pobierzKatalogZSerwera('siec');
  await chwila();

  assert.deepEqual(posty, [200]);
  assert.deepEqual(edycjeSerwera.noweWpisy?.map((w) => w.id), ['parametr-1']);
  assert.deepEqual(stan.odczytajGlobalne().edycjeKatalogu.noweWpisy?.map((w) => w.id), ['parametr-1']);
  assert.equal(stan.odczytajGlobalne().zmianyKataloguDoWyslania?.length, 0);
});

test('edycje zapisane przed synchronizacją trafiają na serwer zamiast ustąpić pustym edycjom usługi', async () => {
  edycjeSerwera = edycjePuste();
  posty.length = 0;
  const lokalne = zastosujZmiane(edycjePuste(), {
    rodzaj: 'podmiot',
    podmiot: { id: 'podmiot-9', nazwa: 'X', kolejnosc: 9 },
    nowy: true,
  } as ZmianaKatalogu);
  stan.wykonajOperacje(() =>
    stan.zmienGlobalne((s) => ({ ...s, edycjeKatalogu: lokalne, zmianyKataloguDoWyslania: undefined }), 'systemowe'),
  );
  await ks.pobierzKatalogZSerwera('siec');
  await chwila();
  await ks.pobierzKatalogZSerwera('siec');
  await chwila();

  assert.deepEqual(posty, [200]);
  assert.deepEqual(edycjeSerwera.podmioty.dodane.map((p) => p.id), ['podmiot-9']);
  assert.deepEqual(stan.odczytajGlobalne().edycjeKatalogu.podmioty.dodane.map((p) => p.id), ['podmiot-9']);
});
