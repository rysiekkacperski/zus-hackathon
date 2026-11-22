// POST /api/odczyt-dokumentu: odczyt modelem bez klucza dostawcy daje 503 i komunikat 0108 także dla nazw plików
// dokumentów przykładowych (KA-08 historyjki 3.4.3.1.2), a wynik z fikstury zwraca wyłącznie tryb 'fikstura'.
import assert from 'node:assert/strict';
import { test } from 'node:test';

for (const zmienna of ['DEEPSEEK_API_KEY', 'ANTHROPIC_API_KEY', 'MODEL_DOSTAWCA']) delete process.env[zmienna];

const { POST } = await import('@/app/api/odczyt-dokumentu/route');

/** Plik PDF bez identyfikatora PPM dokumentu przykładowego. */
function wyslij(nazwa: string, tryb: 'model' | 'fikstura', tresc = '%PDF-1.4'): Promise<Response> {
  const formularz = new FormData();
  formularz.set('plik', new File([new TextEncoder().encode(tresc)], nazwa, { type: 'application/pdf' }));
  formularz.set('powiazania', '[]');
  formularz.set('tryb', tryb);
  return POST(new Request('http://localhost/api/odczyt-dokumentu', { method: 'POST', body: formularz }));
}

test('tryb model bez klucza dostawcy: 503 niedostepny dla nazw plików z fikstur i dla innych plików', async () => {
  for (const nazwa of ['z3-kowalczyk.pdf', 'szpital.pdf', 'termin-porodu.pdf', 'pit-11.pdf', 'inny-plik.pdf']) {
    const odpowiedz = await wyslij(nazwa, 'model');
    assert.equal(odpowiedz.status, 503, nazwa);
    assert.deepEqual(await odpowiedz.json(), { status: 'niedostepny' }, nazwa);
  }
});

test('tryb model bez klucza dostawcy: 503 także dla pliku z identyfikatorem dokumentu przykładowego', async () => {
  const odpowiedz = await wyslij('z3-kowalczyk.pdf', 'model', '%PDF-1.4 PPM-z3-kowalczyk.pdf');
  assert.equal(odpowiedz.status, 503);
});

test('tryb fikstura: dokument przykładowy dostaje wynik odczytu z fikstury', async () => {
  const odpowiedz = await wyslij('z3-kowalczyk.pdf', 'fikstura');
  assert.equal(odpowiedz.status, 200);
  const wynik = (await odpowiedz.json()) as { status: string; rodzajDokumentu?: string };
  assert.equal(wynik.status, 'odczytany');
  assert.equal(wynik.rodzajDokumentu, 'z-3');
});
