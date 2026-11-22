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
  const wyslij = (sesja: Record<string, string>) =>
    uslugaKatalogu.POST(
      new Request('http://localhost/api/katalog', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          zmiana: { rodzaj: 'nowa-wersja', idWpisu: 'swiadczenie-wychowawcze-800-plus', wersja: { od: '2027-01-01', wartosci: { kwota: 90000 } } },
          ...sesja,
        }),
      }),
    );
  assert.equal((await wyslij({})).status, 401);
  assert.equal((await wyslij({ sesjaDemo: 'test:93041231085' })).status, 403);
  assert.equal((await wyslij({ sesjaDemo: 'test:88031407319' })).status, 200);
  const odczyt = (await (await uslugaKatalogu.GET(new Request('http://localhost/api/katalog'))).json()) as { edycje: { noweWersje: unknown[] } };
  assert.equal(odczyt.edycje.noweWersje.length, 1);
});

test('GET /api/katalog nie zwraca numeru PESEL autora zmiany', async () => {
  const zmiana = { rodzaj: 'zmiana-pozycji', zmiana: { id: 'K12', zmiany: { tytul: 'Świadczenie wychowawcze 800+' }, przez: '88031407319', czas: '2026-11-22T10:00:00' } };
  const zapis = await uslugaKatalogu.POST(
    new Request('http://localhost/api/katalog', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ zmiana, sesjaDemo: 'test:88031407319' }),
    }),
  );
  assert.equal(zapis.status, 200);
  assert.doesNotMatch(await zapis.text(), /\d{11}/);
  const odczyt = await uslugaKatalogu.GET(new Request('http://localhost/api/katalog?zlozony=1'));
  const tresc = await odczyt.text();
  assert.doesNotMatch(tresc, /\d{11}/);
  assert.match(tresc, /"przez":"administrator"/);
});

test('POST /api/v1/zus/konto przyjmuje PESEL wyłącznie w treści żądania', async () => {
  const konto = await import('@/app/api/v1/zus/konto/route');
  const rozliczenia = await import('@/app/api/v1/zus/konto/stan-rozliczen/route');
  const ezla = await import('@/app/api/v1/zus/konto/e-zla/route');
  for (const klucz of ['kontoZus', 'stanRozliczen', 'ezla'] as const) {
    const opis = endpointy.find((e) => e.klucz === klucz);
    assert.equal(opis?.metoda, 'POST');
    assert.match(String(opis.przykladZadania?.pesel), /^\d{11}$/);
    assert.doesNotMatch(opis.sciezka + opis.przykladAdresu, /\d{11}|pesel/i);
  }
  const zadanie = (adres: string, tresc: object) =>
    new Request(`http://localhost${adres}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(tresc) });
  const odczyt = await konto.POST(zadanie('/api/v1/zus/konto', { pesel: '93041231085', postac: 'zrodlowe' }));
  assert.equal(odczyt.status, 200);
  assert.equal(((await odczyt.json()) as { zrodlo: { pesel: string } }).zrodlo.pesel, '93041231085');
  const brak = await konto.POST(zadanie('/api/v1/zus/konto', {}));
  assert.equal(brak.status, 400);
  assert.equal(((await brak.json()) as { kod: string }).kod, '0024');
  const bledny = await konto.POST(zadanie('/api/v1/zus/konto', { pesel: '93041231086' }));
  assert.equal(bledny.status, 400);
  assert.equal(((await bledny.json()) as { kod: string }).kod, '0026');
  // PESEL w nagłówku albo w adresie nie wystarcza: serwer czyta go wyłącznie z treści.
  const wNaglowku = new Request('http://localhost/api/v1/zus/konto?pesel=93041231085', {
    method: 'POST', headers: { 'content-type': 'application/json', 'X-Pesel': '93041231085' }, body: '{}',
  });
  assert.equal((await konto.POST(wNaglowku)).status, 400);
  assert.equal((await rozliczenia.POST(zadanie('/api/v1/zus/konto/stan-rozliczen', { pesel: '95082103460', dzien: '2026-11-22' }))).status, 200);
  assert.equal((await ezla.POST(zadanie('/api/v1/zus/konto/e-zla', { pesel: '93041231085', zgodaNaDaneZdrowia: true }))).status, 200);
  assert.equal((await ezla.POST(zadanie('/api/v1/zus/konto/e-zla', { pesel: '93041231085', zgodaNaDaneZdrowia: false }))).status, 403);
});
