// Magazyn edycji katalogu: pierwszy odczyt pliku równoległy z zapisem w kolejce zostawia w pamięci i w pliku edycję
// z zapisu, a kolejny zapis podnosi wersję.
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import type { ZmianaKatalogu } from '@/domena/typy';

process.env.KATALOG_DANE_KATALOG = await mkdtemp(path.join(tmpdir(), 'magazyn-katalogu-'));

const magazyn = await import('@/serwer/katalog/magazyn');
const globalny = globalThis as typeof globalThis & { __magazynKatalogu?: { edycje: unknown; trwaly: boolean } };
const plikKatalogu = path.join(process.env.KATALOG_DANE_KATALOG, 'katalog.json');

const zmiana = (idWpisu: string): ZmianaKatalogu =>
  ({ rodzaj: 'nowa-wersja', idWpisu, wersja: { od: '2027-01-01', wartosci: { kwota: 1 } } }) as ZmianaKatalogu;

test('zimny start: odczyt równoległy z zapisem A nie przywraca starych edycji, a zapis B dopisuje B z wyższą wersją', async () => {
  for (let proba = 0; proba < 50; proba++) {
    await rm(plikKatalogu, { force: true });
    assert.ok(globalny.__magazynKatalogu);
    globalny.__magazynKatalogu.edycje = null;
    globalny.__magazynKatalogu.trwaly = true;

    const zapisA = magazyn.zapiszZmiane(zmiana('A'), 'test');
    await new Promise((gotowe) => setImmediate(gotowe));
    const odczyt = magazyn.odczytajEdycje();
    const [poA] = await Promise.all([zapisA, odczyt]);

    const poOdczycie = await magazyn.odczytajEdycje();
    assert.deepEqual(poOdczycie.edycje.noweWersje.map((n) => n.idWpisu), ['A'], `próba ${proba}`);

    const poB = await magazyn.zapiszZmiane(zmiana('B'), 'test');
    const plik = JSON.parse(await readFile(plikKatalogu, 'utf8')) as { edycje: { wersja: number; noweWersje: { idWpisu: string }[] } };
    assert.deepEqual(plik.edycje.noweWersje.map((n) => n.idWpisu), ['A', 'B'], `próba ${proba}`);
    assert.equal(poB.edycje.wersja, poA.edycje.wersja + 1, `próba ${proba}`);
  }
});
