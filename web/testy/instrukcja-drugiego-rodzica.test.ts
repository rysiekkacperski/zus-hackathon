// ViewCaseGuide: sprawa drugiego z rodziców opisana w trzeciej osobie z nazwą rodzica sprawy, sprawa rodzica konta
// w drugiej osobie (np. urlop ojcowski K09 drugiego rodzica oglądany przez mamę z JDG i sprawa mamy oglądana
// przez drugiego rodzica).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { DokumentyIAdresat, WyborKanalu } from '@/domena/przewodnik/kanaly';

const { notatkaKanalu, osobaRodzicaSprawy, wstepFormy, zdanieKanalu } = await import(
  '@/app/(strefa)/sprawy/[idSprawy]/instrukcja/_czesci/opis-kanalu'
);

const U_PRACODAWCY: WyborKanalu = { typ: 'u-pracodawcy' };
const BEZ_DOKUMENTOW: DokumentyIAdresat = { typ: 'nie-dotyczy' };

function akapit(osoba: string | null): string {
  const wejscie = { wybor: U_PRACODAWCY, forma: 'umowa-o-prace' as const, dokumenty: BEZ_DOKUMENTOW, pozycja: null };
  return [wstepFormy(wejscie.forma, osoba), zdanieKanalu({ ...wejscie, osoba })].filter(Boolean).join(' ');
}

test('osobaRodzicaSprawy nazywa rodzica sprawy tylko wtedy, gdy jest drugim z rodziców wobec rodzica konta', () => {
  assert.equal(osobaRodzicaSprawy('matka', 'matka'), null);
  assert.equal(osobaRodzicaSprawy('drugi-rodzic', 'drugi-rodzic', 'Jan'), null);
  assert.equal(osobaRodzicaSprawy('drugi-rodzic', 'matka'), 'Drugi rodzic');
  assert.equal(osobaRodzicaSprawy('drugi-rodzic', 'matka', ' '), 'Drugi rodzic');
  assert.equal(osobaRodzicaSprawy('drugi-rodzic', 'matka', 'Jan'), 'Jan');
  assert.equal(osobaRodzicaSprawy('matka', 'drugi-rodzic', 'Jan'), 'Mama');
});

test('mama oglądająca sprawę drugiego rodzica na umowie o pracę czyta zdania w trzeciej osobie', () => {
  assert.equal(
    akapit('Drugi rodzic'),
    'Drugi rodzic pracuje na umowie o pracę. Sprawę załatwia u pracodawcy. Wniosek złoży w dziale kadr, osobiście albo w sposób przyjęty w firmie.',
  );
  assert.ok(akapit('Jan').startsWith('Jan pracuje na umowie o pracę. Sprawę załatwia u pracodawcy.'));
  assert.equal(
    notatkaKanalu({ wybor: U_PRACODAWCY, forma: 'umowa-o-prace', oznaczona: false, informacja: false, osoba: 'Jan' }),
    'Tę sprawę załatwia bezpośrednio u swojego pracodawcy.',
  );
});

test('rodzic konta czyta zdania o swojej sprawie w drugiej osobie', () => {
  assert.ok(akapit(null).startsWith('Pracujesz na umowie o pracę. Sprawę załatwiasz u pracodawcy.'));
});

test('drugi rodzic oglądający sprawę mamy czyta o mamie w trzeciej osobie', () => {
  const wybor: WyborKanalu = { typ: 'zewnetrzny', kanal: 'ezus', adres: 'https://www.zus.pl' };
  const zdanie = zdanieKanalu({ wybor, forma: 'jdg', dokumenty: BEZ_DOKUMENTOW, pozycja: null, osoba: 'Mama' });
  assert.equal(wstepFormy('jdg', 'Mama'), 'Mama prowadzi jednoosobową działalność gospodarczą.');
  assert.equal(zdanie, 'Sprawę załatwia w ZUS. Wniosek złoży przez internet w eZUS.');
  assert.equal(wstepFormy(null, 'Mama'), 'Mama prowadzi tę sprawę.');
  assert.equal(wstepFormy(null, null), null);
});
