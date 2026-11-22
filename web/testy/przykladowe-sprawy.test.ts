// Sprawy wzorcowe zespołu: weryfikacja ubezpieczenia i wyliczenie świadczeń zgodne z rozstrzygnięciem każdej sprawy.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sprawyWzorcowe } from '@/dane/przykladowe-sprawy/sprawy-wzorcowe';
import { weryfikujUbezpieczenieChorobowe } from '@/domena/przykladowe-sprawy/weryfikacja';
import { porownajWyliczenieSprawy, wyliczSwiadczeniaSprawy } from '@/domena/przykladowe-sprawy/wyliczenie';
import { katalogStartowy, katalogZWartosciami } from './pomocnicze';

const katalog = katalogStartowy();

for (const sprawa of sprawyWzorcowe) {
  test(`sprawa ${sprawa.idSprawy}: wyliczenie zgodne z rozstrzygnięciem (0111)`, () => {
    const weryfikacja = weryfikujUbezpieczenieChorobowe(sprawa.dane, katalog, sprawa.dokumenty);
    const wyliczenie = wyliczSwiadczeniaSprawy(sprawa.dane, weryfikacja, katalog, sprawa.dokumenty);
    assert.ok(!('kod' in wyliczenie), `kod ${'kod' in wyliczenie ? wyliczenie.kod : ''}`);
    assert.equal(porownajWyliczenieSprawy(wyliczenie, weryfikacja, sprawa.rozstrzygniecie, 1).kod, '0111');
  });
}

test('sprawa S07: ZWZM od 01.10.2026 do 09.11.2026 po stawce z katalogu', () => {
  const sprawa = sprawyWzorcowe.find((s) => s.idSprawy === 'S07');
  assert.ok(sprawa);
  const zwzm = (k: typeof katalog) => {
    const weryfikacja = weryfikujUbezpieczenieChorobowe(sprawa.dane, k, sprawa.dokumenty);
    const wyliczenie = wyliczSwiadczeniaSprawy(sprawa.dane, weryfikacja, k, sprawa.dokumenty);
    assert.ok(!('kod' in wyliczenie));
    return wyliczenie.swiadczenia.find((s) => s.swiadczenie === 'zwzm')?.okresy[0];
  };
  const start = zwzm(katalog);
  assert.deepEqual([start?.od, start?.do, start?.stawka, start?.miesiecznie], ['2026-10-01', '2026-11-09', 100, 534998]);
  assert.equal(zwzm(katalogZWartosciami({ 'zasilek-w-wysokosci-zasilku-macierzynskiego': { stawka: 95 } }))?.stawka, 95);
});

test('sprawa bez okresu urlopu z wniosku: zasiłek macierzyński od dnia porodu w wymiarze urlopu macierzyńskiego', () => {
  const wzor = sprawyWzorcowe.find((s) => s.idSprawy === 'S01');
  assert.ok(wzor);
  const dane = { ...wzor.dane, wniosek: { ...wzor.dane.wniosek, okresy: { ...wzor.dane.wniosek.okresy, wartosc: null } } };
  const porod = dane.zdarzenie.dataPorodu.wartosc;
  assert.ok(porod);
  const weryfikacja = weryfikujUbezpieczenieChorobowe(dane, katalog, wzor.dokumenty);
  assert.equal(weryfikacja.wyniki.find((w) => w.swiadczenie === 'zasilek-macierzynski')?.prawo, 'przysluguje');
  const wyliczenie = wyliczSwiadczeniaSprawy(dane, weryfikacja, katalog, wzor.dokumenty);
  assert.ok(!('kod' in wyliczenie));
  const macierzynski = wyliczenie.swiadczenia.find((s) => s.swiadczenie === 'zasilek-macierzynski');
  assert.deepEqual(macierzynski?.okresy.map((o) => [o.rodzaj, o.od, o.dni]), [['macierzynski', porod, 140]]);
  assert.ok(macierzynski?.reguly.some((r) => r.includes('od dnia porodu')));
  const porownanie = porownajWyliczenieSprawy(wyliczenie, weryfikacja, [], 1);
  const prawo = porownanie.swiadczenia.find((s) => s.swiadczenie === 'zasilek-macierzynski')?.pozycje.find((p) => p.pole === 'prawo');
  assert.equal(prawo?.wyliczenie, 'Przysługuje');
});
