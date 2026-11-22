// Opisy dat kotwiczących terminów odmieniają imiesłów według rodzaju nazwy, a dane katalogu nie mają wtrąceń w półpauzach.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pozycjeKatalogu } from '@/dane/katalog/pozycje';
import { teksty } from '@/teksty';

const tk = teksty.ViewDeadlines.kotwice;

test('opis terminu od przewidywanego terminu porodu podaje odstęp i datę kotwiczącą w nawiasie', () => {
  assert.equal(
    tk.plusDni({ nazwa: tk.nazwy.ptpZamiastPorodu, data: '22.03.2027', liczba: '21' }),
    '21 dni od przewidywanego terminu porodu (22.03.2027)',
  );
  assert.equal(
    tk.plus12MinusDni({ nazwa: tk.nazwy.ptpZamiastPorodu, data: '22.03.2027' }),
    '14 dni przed upływem 12 miesięcy od przewidywanego terminu porodu (22.03.2027)',
  );
  assert.equal(
    teksty.ViewCaseGuide.terminSzacowany({ opis: tk.plusDni({ nazwa: tk.nazwy.ptpZamiastPorodu, data: '22.03.2027', liczba: '21' }) }),
    'Termin szacowany: 21 dni od przewidywanego terminu porodu (22.03.2027)',
  );
});

test('opis terminu od daty porodu i daty przyjęcia odmienia liczbę dni, tygodni i miesięcy', () => {
  assert.equal(tk.plusDni({ nazwa: tk.nazwy.dataPorodu, data: '22.03.2027', liczba: '21' }), '21 dni od daty porodu (22.03.2027)');
  assert.equal(tk.plusDni({ nazwa: tk.nazwy.dataPorodu, data: '22.03.2027', liczba: '1' }), '1 dzień od daty porodu (22.03.2027)');
  assert.equal(
    tk.plusMiesiace({ nazwa: tk.nazwy.dataPrzyjecia, data: '01.04.2027', liczba: '12' }),
    '12 miesięcy od daty przyjęcia dziecka (01.04.2027)',
  );
  assert.equal(
    tk.plusMiesiace({ nazwa: tk.nazwy.dataPrzyjecia, data: '01.04.2027', liczba: '3' }),
    '3 miesiące od daty przyjęcia dziecka (01.04.2027)',
  );
  assert.equal(
    tk.plusTygodnie({ nazwa: tk.nazwy.dataPorodu, data: '22.03.2027', liczba: '22' }),
    '22 tygodnie urlopu macierzyńskiego od daty porodu (22.03.2027)',
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
