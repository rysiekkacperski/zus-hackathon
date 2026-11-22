// Numer potwierdzenia wniosku do ZUS po restarcie serwera i kolizje identyfikatorów nowych elementów katalogu.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nastepnyNumerPotwierdzenia } from '@/serwer/api/numeracja';
import { edycjePuste, zastosujZmiane, zmianyOdtwarzajaceEdycje } from '@/domena/katalog/zmiany';
import type { EdycjeKatalogu, PodmiotWsparcia, PozycjaKatalogu, WpisSlownika, ZmianaKatalogu } from '@/domena/typy';

const globalny = globalThis as typeof globalThis & { __licznikiPotwierdzenApi?: Map<string, number> };

test('numer potwierdzenia po restarcie serwera jest wyższy od ostatniego numeru podanego przez przeglądarkę', () => {
  assert.equal(nastepnyNumerPotwierdzenia('ZAS53-DEMO', '2026-11-22'), 'ZAS53-DEMO-20261122-0001');
  globalny.__licznikiPotwierdzenApi?.clear();
  assert.equal(nastepnyNumerPotwierdzenia('ZAS53-DEMO', '2026-11-22', 1), 'ZAS53-DEMO-20261122-0002');
  assert.equal(nastepnyNumerPotwierdzenia('ZAS53-DEMO', '2026-11-22', 0), 'ZAS53-DEMO-20261122-0003');
});

const pozycja = (id: string, tytul: string) =>
  ({ id, tytul, instrukcja: { kroki: [], daneIDokumenty: [] }, kanaly: {}, regulaTerminu: { typ: 'brak' } }) as unknown as PozycjaKatalogu;
const podmiot = (id: string, nazwa: string) => ({ id, nazwa, kolejnosc: 1 }) as unknown as PodmiotWsparcia;
const wpis = (id: string, nazwa: string) =>
  ({ id, nazwa, slownik: 'kwoty-i-progi', warianty: [], wersje: [] }) as unknown as WpisSlownika;

const zastosuj = (e: EdycjeKatalogu, ...zmiany: ZmianaKatalogu[]) => zmiany.reduce(zastosujZmiane, e);

test('nowa pozycja z identyfikatorem zajętym przez inną pozycję dostaje kolejny wolny identyfikator', () => {
  const serwer = zastosuj(edycjePuste(), { rodzaj: 'nowa-pozycja', pozycja: pozycja('K40', 'X') });
  const poB = zastosuj(serwer, { rodzaj: 'nowa-pozycja', pozycja: pozycja('K40', 'Y') });
  assert.deepEqual(poB.nowePozycje.map((p) => [p.id, p.tytul]), [['K40', 'X'], ['K41', 'Y']]);
  const powtorzenie = zastosuj(poB, { rodzaj: 'nowa-pozycja', pozycja: pozycja('K40', 'Y') });
  assert.equal(powtorzenie.nowePozycje.length, 2);
  assert.equal(powtorzenie.wersja, poB.wersja + 1);
});

test('nowy podmiot i nowy wpis słownika z zajętym identyfikatorem trafiają do edycji z wolnym identyfikatorem', () => {
  const e = zastosuj(
    edycjePuste(),
    { rodzaj: 'podmiot', podmiot: podmiot('podmiot-9', 'PA'), nowy: true },
    { rodzaj: 'podmiot', podmiot: podmiot('podmiot-9', 'PB'), nowy: true },
    { rodzaj: 'nowy-wpis', wpis: wpis('parametr-1', 'WA') },
    { rodzaj: 'nowy-wpis', wpis: wpis('parametr-1', 'WB') },
  );
  assert.deepEqual(e.podmioty.dodane.map((p) => [p.id, p.nazwa]), [['podmiot-9', 'PA'], ['podmiot-10', 'PB']]);
  assert.deepEqual(e.noweWpisy?.map((w) => [w.id, w.nazwa]), [['parametr-1', 'WA'], ['parametr-2', 'WB']]);
});

test('zmiany odtwarzające edycje zapisane przed synchronizacją dają te same edycje na edycjach bez zmian', () => {
  const lokalne = zastosuj(
    edycjePuste(),
    { rodzaj: 'nowa-wersja', idWpisu: 'swiadczenie-wychowawcze', wersja: { od: '2027-01-01', wartosci: { kwota: 900 } } },
    { rodzaj: 'podmiot', podmiot: podmiot('podmiot-9', 'PA'), nowy: true },
    { rodzaj: 'nowa-pozycja', pozycja: pozycja('K40', 'X') },
  );
  const odtworzone = zastosuj(edycjePuste(), ...zmianyOdtwarzajaceEdycje(lokalne));
  assert.deepEqual({ ...odtworzone, wersja: 0 }, { ...lokalne, wersja: 0 });
  assert.deepEqual(zmianyOdtwarzajaceEdycje(edycjePuste()), []);
});
