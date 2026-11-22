// Wnioski o urlop, ZAM i Z-15 czytają wymiary, terminy i minimalną podstawę z Katalogu świadczeń: wynik przy katalogu
// startowym jest równy wartościom domyślnym, a zmiana wpisu w panelu Administratora zmienia wynik wniosku.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { DaneCiazyIDziecka, Katalog, TytulUbezpieczenia, WniosekZam } from '@/domena/typy';
import {
  WYMIARY_DOMYSLNE,
  stawkaZasilku,
  wyliczOkresyUrlopu,
  wymiarRodzicielskiego,
  wymiaryUrlopow,
  type DaneKreatora,
} from '@/domena/wnioski/urlopy';
import { kontekstOkresowZam, parametryOkresuZam } from '@/domena/wnioski/zam-okresy';
import { wariantPoPrzyjeciu } from '@/domena/wnioski/zam-przyjecie';
import { podstawaWymiaruZ15 } from '@/domena/wnioski/z15';
import { DZIS, katalogStartowy, katalogZWartosciami } from './pomocnicze';

const POROD = '2026-11-10';

function daneKreatora(katalog: Katalog | undefined): DaneKreatora {
  return {
    rodzic: 'matka',
    rola: 'rodzic',
    pesel: '93041231085',
    imieINazwisko: 'Anna Nowak',
    dataPorodu: POROD,
    dataPoroduPotwierdzona: true,
    liczbaDzieci: 1,
    zaZyciem: false,
    wyslane: [],
    wymiary: katalog === undefined ? undefined : wymiaryUrlopow(katalog, POROD),
  };
}

function okresyMacierzynskiegoZRodzicielskim(katalog: Katalog | undefined) {
  return wyliczOkresyUrlopu('macierzynski-z-rodzicielskim', { od: POROD, zakres: 'z-calym-rodzicielskim', wariant: '81-5' }, daneKreatora(katalog));
}

function parametryZam(katalog: Katalog | undefined) {
  const wniosek = { idWniosku: 'W1', rodzaj: 'zam', rodzajUrlopu: 'macierzynski', okresy: [] } as unknown as WniosekZam;
  const daneCiazy = { dataPoroduPotwierdzona: true, dataPorodu: POROD, liczbaUrodzonychDzieci: 1 } as unknown as DaneCiazyIDziecka;
  return parametryOkresuZam(kontekstOkresowZam({ wniosek, daneCiazy, plan: null, katalog }), DZIS);
}

test('wymiary urlopów z katalogu startowego są równe wartościom domyślnym', () => {
  assert.deepEqual(wymiaryUrlopow(katalogStartowy(), POROD), WYMIARY_DOMYSLNE);
  assert.deepEqual(okresyMacierzynskiegoZRodzicielskim(katalogStartowy()), okresyMacierzynskiegoZRodzicielskim(undefined));
  assert.deepEqual(parametryZam(katalogStartowy()), parametryZam(undefined));
  assert.deepEqual(wymiarRodzicielskiego(1, false, wymiaryUrlopow(katalogStartowy(), POROD)), { calkowity: 41, naRodzica: 32 });
});

test('zmiana wymiaru urlopu rodzicielskiego 41 → 45 tygodni zmienia wniosek o urlop i ZAM', () => {
  const katalog = katalogZWartosciami({ 'urlop-rodzicielski': { jednoDziecko: 45 } });
  assert.deepEqual(wymiarRodzicielskiego(1, false, wymiaryUrlopow(katalog, POROD)), { calkowity: 45, naRodzica: 36 });
  const [macierzynski, rodzicielski] = okresyMacierzynskiegoZRodzicielskim(katalog);
  assert.equal(macierzynski.tygodnie, 20);
  assert.equal(rodzicielski.tygodnie, 36);
  assert.equal(rodzicielski.do, '2027-12-06');
  assert.equal(parametryZam(katalogStartowy()).rodzicielski.maksTygodni, 32);
  assert.equal(parametryZam(katalog).rodzicielski.maksTygodni, 36);
});

test('termin 21 dni wariantu 81,5% i nieprzenoszalna część czytają katalog', () => {
  const katalog = katalogZWartosciami({ 'termin-wniosku-w-wariancie-81-5': { dni: 28 }, 'nieprzenoszalna-czesc-urlopu-rodzicielskiego': { tygodnie: 10 } });
  const startowe = stawkaZasilku({ zakres: 'z-calym-rodzicielskim', dzis: DZIS, dataPorodu: POROD, wymiary: wymiaryUrlopow(katalogStartowy(), POROD) });
  const zmienione = stawkaZasilku({ zakres: 'z-calym-rodzicielskim', dzis: DZIS, dataPorodu: POROD, wymiary: wymiaryUrlopow(katalog, POROD) });
  assert.equal(startowe.termin, '2026-12-01');
  assert.equal(zmienione.termin, '2026-12-08');
  assert.equal(parametryZam(katalog).rodzicielski.maksTygodni, 31);
  assert.equal(parametryZam(katalog).terminWariantu, '2026-12-08');
  assert.equal(wariantPoPrzyjeciu(POROD, DZIS, katalogStartowy()).termin, '2026-12-01');
  assert.equal(wariantPoPrzyjeciu(POROD, DZIS, katalog).termin, '2026-12-08');
});

test('Z-15: minimalna podstawa pracownika z katalogu w dniu opieki', () => {
  const tytul = {
    rodzaj: 'pracownik',
    podstawySkladek: [{ miesiac: '2026-10', kwota: 300000 }],
  } as unknown as TytulUbezpieczenia;
  assert.equal(podstawaWymiaruZ15(tytul, '2026-12-15', katalogStartowy()), 414710);
  assert.equal(podstawaWymiaruZ15(tytul, '2027-01-15', katalogStartowy()), 427135);
  const katalog = katalogZWartosciami({ 'minimalne-wynagrodzenie': { kwota: 500000 } });
  assert.equal(podstawaWymiaruZ15(tytul, '2026-12-15', katalog), 500000 - Math.round(500000 * 0.1371));
});
