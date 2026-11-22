// Wyliczenia zintegrowanego kalkulatora zasiłku macierzyńskiego na przykładach z kwotami policzonymi ręcznie.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { domyslneParametry, wyliczScenariusz } from '@/domena/kalkulatory';
import { etykietyStawekZasilku, porownajWarianty } from '@/domena/kalkulatory/wariant';
import { teksty } from '@/teksty';
import { DZIS, daneKalkulatora, katalogStartowy, katalogZWartosciami, podstawa, wartosc } from './pomocnicze';

const katalog = katalogStartowy();
const podstawy = { matka: podstawa(600000), 'drugi-rodzic': podstawa(600000) };

test('podstawa 6000 zł, jedno dziecko, wariant 100% i 70%', () => {
  const d = daneKalkulatora();
  const wynik = wyliczScenariusz(d, podstawy, domyslneParametry(d, katalog), katalog, DZIS);
  const okresy = wynik.okresy.map((o) => [o.rodzic, o.rodzaj, o.od, o.do, o.stawka, o.zaOkres]);
  assert.deepEqual(okresy, [
    ['matka', 'macierzynski', '2026-11-10', '2027-03-29', 100, 2800000],
    ['matka', 'rodzicielski', '2027-03-30', '2027-11-08', 70, 3136000],
    ['drugi-rodzic', 'ojcowski', '2026-11-10', '2026-11-23', 100, 280000],
    ['drugi-rodzic', 'rodzicielski', '2027-11-09', '2028-01-10', 70, 882000],
  ]);
  assert.equal(wynik.sumy.razem, 7098000);
});

test('podstawa 6000 zł, wariant 81,5%: 4890 zł miesięcznie matki i 70 952 zł razem', () => {
  const d = daneKalkulatora();
  const wynik = wyliczScenariusz(d, podstawy, { ...domyslneParametry(d, katalog), wariant: '81-5' }, katalog, DZIS);
  assert.equal(wynik.okresy.find((o) => o.rodzaj === 'macierzynski')?.miesiecznie, 489000);
  assert.equal(wynik.sumy.matka, 5933200);
  assert.equal(wynik.sumy.razem, 7095200);
});

test('wpisana podstawa 3000 zł na pełnym etacie rośnie do minimalnej podstawy 4147,10 zł', () => {
  const d = daneKalkulatora();
  const wynik = wyliczScenariusz(d, { ...podstawy, matka: podstawa(300000) }, domyslneParametry(d, katalog), katalog, DZIS);
  const macierzynski = wynik.okresy.find((o) => o.rodzaj === 'macierzynski');
  assert.equal(macierzynski?.miesiecznie, 414710);
  assert.equal(macierzynski?.zaOkres, 1971792);
});

test('zgon dziecka w 3. tygodniu życia: zasiłek przez 8 tygodni od porodu', () => {
  const d = daneKalkulatora({ strata: wartosc({ rodzaj: 'zgon-dziecka', dataZgonu: '2026-11-25', liczbaDzieci: 1 }) });
  const wynik = wyliczScenariusz(d, podstawy, domyslneParametry(d, katalog), katalog, DZIS);
  assert.deepEqual(wynik.okresy.map((o) => [o.od, o.do, o.dni]), [['2026-11-10', '2027-01-04', 56]]);
  assert.equal(wynik.sumy.razem, 1120000);
});

test('kalkulator wariantu i kalkulator zintegrowany dają tę samą podstawę po minimum', () => {
  const wariant = porownajWarianty({ podstawa: podstawa(300000), dataPorodu: '2026-11-10', liczbaDzieci: 1, zaZyciem: false, tygodniePrzedPowrotem: 32, dzis: DZIS, katalog });
  const d = daneKalkulatora({ formaDrugiegoRodzica: wartosc({ forma: 'brak-drugiego-rodzica', dobrowolne: false }) });
  const zintegrowany = wyliczScenariusz(d, { matka: podstawa(300000) }, domyslneParametry(d, katalog), katalog, DZIS);
  assert.equal(wariant.wariant100i70.suma, zintegrowany.sumy.matka);
});

test('przyjęcie dziecka na wychowanie: uprawnienia po powrocie bez przerw na karmienie K20', () => {
  const porod = wyliczScenariusz(daneKalkulatora(), podstawy, domyslneParametry(daneKalkulatora(), katalog), katalog, DZIS);
  assert.ok(porod.uprawnieniaPoPowrocie.includes('K20'));
  const d = daneKalkulatora({
    zdarzenie: wartosc('przyjecie' as const),
    przyjecie: wartosc({ forma: 'przysposobienie' as const, dataPrzyjecia: '2026-11-02', dataUrodzeniaDziecka: '2020-05-10', odroczenie: false }),
  });
  const wynik = wyliczScenariusz(d, podstawy, domyslneParametry(d, katalog), katalog, DZIS);
  assert.ok(!wynik.uprawnieniaPoPowrocie.includes('K20'));
  assert.ok(wynik.uprawnieniaPoPowrocie.includes('K21'));
});

test('etykiety stawek wariantów zasiłku pochodzą z katalogu i zmieniają się po zmianie w panelu Administratora', () => {
  const t = teksty.ViewCalcMaternityVariant;
  const startowe = etykietyStawekZasilku(katalog, DZIS);
  assert.deepEqual(startowe, { s815: '81,5%', s100: '100%', s70: '70%' });
  assert.equal(t.nazwaWariantu('100-70', startowe), '100% i 70%');
  const zmieniony = katalogZWartosciami({
    'zasilek-macierzynski-wariant-81-5': { stawka: 82 },
    'zasilek-macierzynski-wariant-100-70': { rodzicielski: 65 },
  });
  const st = etykietyStawekZasilku(zmieniony, DZIS);
  assert.deepEqual(st, { s815: '82%', s100: '100%', s70: '65%' });
  assert.equal(t.nazwaWariantu('81-5', st), '82%');
  assert.equal(t.nazwaWariantu('100-70', st), '100% i 65%');
  assert.match(t.poTerminieOpis({ termin: '30.11.2026', s815: st.s815 }), /wariant 82% minął/);
  assert.equal(teksty.SheetCalcReturnToWork.wariant81Wybrany(st), 'Wariant 82% (wybrany)');
});
