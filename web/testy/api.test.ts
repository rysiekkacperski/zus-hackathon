// REST API: wyliczenie przez usługę daje ten sam wynik co funkcja domeny, a zapis katalogu wymaga roli Administrator.
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

process.env.KATALOG_DANE_KATALOG = await mkdtemp(path.join(tmpdir(), 'katalog-testy-'));
delete process.env.PANEL_TOKEN;
delete process.env.KATALOG_TRYB_DEMO;

const { endpointy } = await import('@/serwer/api/endpointy');
const zasilek = await import('@/app/api/v1/kalkulator/zasilek-macierzynski/route');
const uslugaKatalogu = await import('@/app/api/katalog/route');

test('POST /api/v1/kalkulator/zasilek-macierzynski odpowiada na przykład z opisu OpenAPI', async () => {
  const opis = endpointy.find((e) => e.klucz === 'zasilekMacierzynski');
  assert.ok(opis);
  const odpowiedz = await zasilek.POST(
    new Request(`http://localhost${opis.sciezka}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(opis.przykladZadania) }),
  );
  assert.equal(odpowiedz.status, 200);
  const tresc = (await odpowiedz.json()) as { wynik: { sumy: { razem: number }; okresy: unknown[] } };
  assert.ok(tresc.wynik.okresy.length > 0);
  assert.ok(tresc.wynik.sumy.razem > 0);
});

test('POST /api/katalog: 401 bez potwierdzenia roli, 403 dla konta rodzica, 200 dla Administratora', async () => {
  const wyslij = (naglowki: Record<string, string>) =>
    uslugaKatalogu.POST(
      new Request('http://localhost/api/katalog', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...naglowki },
        body: JSON.stringify({ zmiana: { rodzaj: 'nowa-wersja', idWpisu: 'swiadczenie-wychowawcze-800-plus', wersja: { od: '2027-01-01', wartosci: { kwota: 90000 } } } }),
      }),
    );
  assert.equal((await wyslij({})).status, 401);
  assert.equal((await wyslij({ 'x-sesja-demo': 'test:93041231085' })).status, 403);
  assert.equal((await wyslij({ 'x-sesja-demo': 'test:88031407319' })).status, 200);
  const odczyt = (await (await uslugaKatalogu.GET(new Request('http://localhost/api/katalog'))).json()) as { edycje: { noweWersje: unknown[] } };
  assert.equal(odczyt.edycje.noweWersje.length, 1);
});

test('GET /api/v1/zus/konto czyta PESEL z nagłówka X-Pesel, a adres go nie zawiera', async () => {
  const konto = await import('@/app/api/v1/zus/konto/route');
  const rozliczenia = await import('@/app/api/v1/zus/konto/stan-rozliczen/route');
  const ezla = await import('@/app/api/v1/zus/konto/e-zla/route');
  for (const klucz of ['kontoZus', 'stanRozliczen', 'ezla'] as const) {
    const opis = endpointy.find((e) => e.klucz === klucz);
    assert.ok(opis?.przykladNaglowkow?.['X-Pesel']);
    assert.doesNotMatch(opis.sciezka + opis.przykladAdresu, /\d{11}|\{pesel\}/);
  }
  const zadanie = (adres: string, naglowki: Record<string, string> = {}) => new Request(`http://localhost${adres}`, { headers: naglowki });
  const odczyt = await konto.GET(zadanie('/api/v1/zus/konto?postac=zrodlowe', { 'X-Pesel': '93041231085' }));
  assert.equal(odczyt.status, 200);
  assert.equal(((await odczyt.json()) as { zrodlo: { pesel: string } }).zrodlo.pesel, '93041231085');
  assert.equal((await konto.GET(zadanie('/api/v1/zus/konto'))).status, 400);
  const bledny = await konto.GET(zadanie('/api/v1/zus/konto', { 'X-Pesel': '93041231086' }));
  assert.equal(bledny.status, 400);
  assert.equal(((await bledny.json()) as { kod: string }).kod, '0026');
  assert.equal((await rozliczenia.GET(zadanie('/api/v1/zus/konto/stan-rozliczen?dzien=2026-11-22', { 'X-Pesel': '95082103460' }))).status, 200);
  assert.equal((await ezla.GET(zadanie('/api/v1/zus/konto/e-zla?zgodaNaDaneZdrowia=tak', { 'X-Pesel': '93041231085' }))).status, 200);
});
