// Okres zasiłkowy w ciąży: wykorzystana część obejmuje wszystkie dni wystawionych zaświadczeń e-ZLA (3.4.4.1.4).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { okresZasilkowyWCiazy } from '@/domena/zasilki/okres-zasilkowy';
import type { ZaswiadczenieEzla } from '@/domena/typy';

const ezla = (od: string, do_: string): ZaswiadczenieEzla => ({
  seriaINumer: `ZZ ${od}`,
  dataWystawienia: od,
  od,
  do: do_,
  kodyLiterowe: ['B'],
  platnik: 'Pracodawca',
  rodzaj: 'choroba',
});

test('dni zaświadczenia po dniu dzisiejszym liczą się do wykorzystanej części i do poDzis', () => {
  // 01.11.2026 do 03.12.2026 to 33 dni, z czego 11 dni przypada po 22.11.2026.
  const wynik = okresZasilkowyWCiazy([ezla('2026-11-01', '2026-12-03')], 270, 60, { dzis: '2026-11-22' });
  assert.equal(wynik.wykorzystane, 33);
  assert.equal(wynik.pozostale, 237);
  assert.equal(wynik.poDzis, 11);
});

test('bez dnia dzisiejszego wynik nie zawiera poDzis', () => {
  const wynik = okresZasilkowyWCiazy([ezla('2026-11-01', '2026-11-10')], 270, 60);
  assert.equal(wynik.wykorzystane, 10);
  assert.equal(wynik.poDzis, undefined);
});
