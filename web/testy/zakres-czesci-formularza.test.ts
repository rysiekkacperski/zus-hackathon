// Zakres próby wysłania formularza z częściami: pola części odwiedzonych i części z pierwszym błędem.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { czescPola, zakresProbyWyslania } from '@/komponenty/zakres-czesci-formularza';

const PODZIAL = [['zdarzenie', 'dataPorodu'], ['formaPrzyjecia'], ['liczbaDzieci'], ['formaMatki']] as const;
type Pole = (typeof PODZIAL)[number][number] | 'spozaPodzialu';

test('czescPola zwraca numer części od 1 albo null dla pola spoza podziału', () => {
  assert.equal(czescPola<Pole>(PODZIAL, 'dataPorodu'), 1);
  assert.equal(czescPola<Pole>(PODZIAL, 'formaMatki'), 4);
  assert.equal(czescPola<Pole>(PODZIAL, 'spozaPodzialu'), null);
});

test('próba wysłania z błędem obejmuje części odwiedzone i część z pierwszym błędem, bez części nieodwiedzonych', () => {
  const zakres = zakresProbyWyslania<Pole>(PODZIAL, ['liczbaDzieci', 'formaMatki'], 'dataPorodu', {
    dataPorodu: '0001',
    formaPrzyjecia: '0002',
  });
  assert.equal(zakres.czescZBledem, 1);
  assert.deepEqual(new Set(zakres.pola), new Set(['liczbaDzieci', 'formaMatki', 'zdarzenie', 'dataPorodu']));
  assert.ok(!zakres.pola.includes('formaPrzyjecia'));
});

test('próba wysłania obejmuje pola z błędem spoza podziału', () => {
  const zakres = zakresProbyWyslania<Pole>(PODZIAL, ['formaMatki'], 'spozaPodzialu', { spozaPodzialu: '0003' });
  assert.equal(zakres.czescZBledem, null);
  assert.deepEqual(new Set(zakres.pola), new Set(['formaMatki', 'spozaPodzialu']));
});

test('próba wysłania bez błędów obejmuje tylko pola odwiedzone', () => {
  const zakres = zakresProbyWyslania<Pole>(PODZIAL, ['formaMatki', 'formaMatki'], null);
  assert.equal(zakres.czescZBledem, null);
  assert.deepEqual(zakres.pola, ['formaMatki']);
});
