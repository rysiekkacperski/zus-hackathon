// Opisy dat kotwiczących terminów odmieniają imiesłów według rodzaju nazwy, a dane katalogu nie mają wtrąceń w półpauzach.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pozycjeKatalogu } from '@/dane/katalog/pozycje';
import { teksty } from '@/teksty';

const tk = teksty.ViewDeadlines.kotwice;

test('opis terminu od przewidywanego terminu porodu ma imiesłów rodzaju męskiego', () => {
  assert.equal(
    tk.plusDni({ nazwa: tk.nazwy.ptpZamiastPorodu, data: '22.03.2027', liczba: '21' }),
    'przewidywany termin porodu 22.03.2027 powiększony o 21 dni',
  );
  assert.equal(
    tk.plus12MinusDni({ nazwa: tk.nazwy.ptpZamiastPorodu, data: '22.03.2027' }),
    'przewidywany termin porodu 22.03.2027 powiększony o 12 miesięcy i pomniejszony o 14 dni',
  );
});

test('opis terminu od daty porodu ma imiesłów rodzaju żeńskiego', () => {
  assert.equal(
    tk.plusDni({ nazwa: tk.nazwy.dataPorodu, data: '22.03.2027', liczba: '21' }),
    'data porodu 22.03.2027 powiększona o 21 dni',
  );
  assert.equal(
    tk.plusMiesiace({ nazwa: tk.nazwy.dataPrzyjecia, data: '01.04.2027', liczba: '12' }),
    'data przyjęcia dziecka 01.04.2027 powiększona o 12 miesięcy',
  );
});

test('kroki, dane i odnośniki pozycji katalogu nie mają wtrąceń w półpauzach', () => {
  for (const p of pozycjeKatalogu) {
    const ciagi = [
      p.instytucjaIKanal,
      ...p.instrukcja.kroki,
      ...p.instrukcja.daneIDokumenty,
      ...p.instrukcja.odnosniki.map((o) => o.etykieta),
    ];
    for (const c of ciagi) assert.ok(!/ [–—-] /.test(c), `${p.id}: ${c}`);
  }
});
