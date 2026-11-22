// Testy wyliczeń: te same reguły dają te same okresy i kwoty w zintegrowanym kalkulatorze, kalkulatorach szczegółowych,
// planie rodziny i przykładowych sprawach, a wyniki zgadzają się z kryteriami akceptacji historyjek 3.10.4.
// Uruchomienie w folderze web/: `pnpm test` (loader testy/loader.mjs).
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { kontekstPodzialu, walidujPodzial, czesciWyniku, type FormularzPodzialu } from '@/app/(strefa)/kalkulator-zasilku/porownanie/_czesci/reguly-kalkulatora';
import { seedKatalogu } from '@/dane/katalog';
import { sprawyWzorcowe } from '@/dane/przykladowe-sprawy/sprawy-wzorcowe';
import { domyslneParametry, ukladScenariusza, wyliczScenariusz } from '@/domena/kalkulatory';
import { walidujCzesciRodzicielskiego } from '@/domena/kalkulatory/walidacja-arkuszy';
import { okresZasilkuPoStracie } from '@/domena/kalkulatory/okresy';
import { wyliczPodzial } from '@/domena/kalkulatory/podzial';
import { porownajWarianty } from '@/domena/kalkulatory/wariant';
import { porownajWeryfikacje } from '@/domena/przykladowe-sprawy/porownanie';
import { porownajWyliczenieSprawy, wyliczSwiadczeniaSprawy } from '@/domena/przykladowe-sprawy/wyliczenie';
import { weryfikujUbezpieczenieChorobowe, wyliczWynikSprawy } from '@/domena/przykladowe-sprawy/weryfikacja';
import type {
  DaneWejscioweKalkulatora,
  Katalog,
  OkresScenariusza,
  ParametryScenariusza,
  PodstawaWymiaru,
  RodzicWRodzinie,
  WynikScenariusza,
} from '@/domena/typy';

const katalog: Katalog = { ...seedKatalogu, wersja: 1 };
const dzis = '2026-11-22';

function w<T>(wartosc: T) {
  return { wartosc, zrodlo: 'wartosc-w-kalkulatorze' as const };
}
function dane(zmiany: Partial<DaneWejscioweKalkulatora> = {}): DaneWejscioweKalkulatora {
  return {
    zdarzenie: w('porod'),
    dataPorodu: w('2026-11-10'),
    liczbaDzieci: w(1),
    zaZyciem: w(false),
    formaMatki: w({ forma: 'umowa-o-prace', dobrowolne: false }),
    formaDrugiegoRodzica: w({ forma: 'umowa-o-prace', dobrowolne: false }),
    ...zmiany,
  } as DaneWejscioweKalkulatora;
}
function przyjecie(pr: Record<string, unknown>, liczbaDzieci = 1): DaneWejscioweKalkulatora {
  return dane({
    zdarzenie: w('przyjecie'),
    dataPorodu: undefined,
    liczbaDzieci: w(liczbaDzieci),
    przyjecie: w({ forma: 'przysposobienie', dataPrzyjecia: '2026-11-02', dataUrodzeniaDziecka: '2022-05-10', odroczenie: false, ...pr }),
  } as Partial<DaneWejscioweKalkulatora>);
}
function podstawa(kwota: number, pelnyEtat = true): PodstawaWymiaru {
  return { kwota, zrodlo: 'wartosc-wpisana-przez-rodzica', pelnyEtat };
}
const podstawy6000: Partial<Record<RodzicWRodzinie, PodstawaWymiaru>> = { matka: podstawa(600000), 'drugi-rodzic': podstawa(600000) };

function licz(
  d: DaneWejscioweKalkulatora,
  zmiany: Partial<ParametryScenariusza> = {},
  p: Partial<Record<RodzicWRodzinie, PodstawaWymiaru>> = podstawy6000,
): WynikScenariusza {
  return wyliczScenariusz(d, p, { ...domyslneParametry(d, katalog), ...zmiany }, katalog, dzis);
}
function okresy(wynik: WynikScenariusza, rodzic: RodzicWRodzinie, rodzaj: OkresScenariusza['rodzaj']): OkresScenariusza[] {
  return wynik.okresy.filter((o) => o.rodzic === rodzic && o.rodzaj === rodzaj);
}
function formularz(czesci: FormularzPodzialu['czesci'], zmiany: Partial<FormularzPodzialu> = {}): FormularzPodzialu {
  return {
    czesci,
    wymiarOjcowskiego: 'brak',
    liczbaCzesciOjcowskiego: 1,
    datyOjcowskiego: ['', ''],
    dataUbezpieczenia: '',
    formaPoPorodzie: '',
    przejecie: false,
    sytuacja: '',
    dataPrzejecia: '',
    koniecPobytu: '',
    ...zmiany,
  };
}

describe('spójność modułów', () => {
  const bezDrugiego = dane({ formaDrugiegoRodzica: w({ forma: 'brak-drugiego-rodzica', dobrowolne: false }) });
  for (const [kwota, opis] of [[300000, '3000 zł, minimum pełnego etatu'], [600000, '6000 zł']] as const) {
    test(`zintegrowany kalkulator = kalkulator wariantu (${opis})`, () => {
      const wariant = porownajWarianty({ podstawa: podstawa(kwota), dataPorodu: '2026-11-10', liczbaDzieci: 1, zaZyciem: false, tygodniePrzedPowrotem: 32, dzis, katalog });
      assert.equal(licz(bezDrugiego, {}, { matka: podstawa(kwota) }).sumy.matka, wariant.wariant100i70.suma);
      assert.equal(licz(bezDrugiego, { wariant: '81-5' }, { matka: podstawa(kwota) }).sumy.matka, wariant.wariant81.suma);
    });
  }

  test('zintegrowany kalkulator = kalkulator podziału (81,5%, dwoje dzieci, matka 30 i drugi rodzic 13 tygodni)', () => {
    const podzial = wyliczPodzial({ podstawy: podstawy6000, wariantMatki: '81-5', liczbaDzieci: 2, zaZyciem: false, tygodnieMatki: 30, tygodnieDrugiegoRodzica: 13, katalog, dzien: '2026-11-10' });
    const wynik = licz(dane({ liczbaDzieci: w(2) }), {
      wariant: '81-5',
      czesciRodzicielskiego: [{ rodzic: 'matka', od: '2027-06-16', tygodnie: 30 }, { rodzic: 'drugi-rodzic', od: '2028-01-12', tygodnie: 13 }],
    });
    const drugiego = okresy(wynik, 'drugi-rodzic', 'rodzicielski').reduce((suma, o) => suma + o.zaOkres, 0);
    assert.equal(podzial.sumy['drugi-rodzic'], drugiego);
    assert.deepEqual(podzial.stawki['drugi-rodzic'], [70, 81.5]);
  });

  test('kalkulator = plan rodziny: okres po stracie dziecka', () => {
    for (const [porod, zgon] of [['2026-10-01', '2026-11-20'], ['2026-10-01', '2026-10-05'], ['2026-07-01', '2026-10-01']] as const) {
      const wynik = licz(dane({ dataPorodu: w(porod), strata: w({ rodzaj: 'zgon-dziecka', dataZgonu: zgon, liczbaDzieci: 1 }) }));
      assert.equal(okresy(wynik, 'matka', 'macierzynski')[0].do, okresZasilkuPoStracie(porod, 'zgon-dziecka', zgon, katalog).do);
    }
  });

  test('przykładowa sprawa = zintegrowany kalkulator: zasiłek za urlop macierzyński S01', () => {
    const s = sprawyWzorcowe.find((x) => x.idSprawy === 'S01')!;
    const zSprawy = wyliczWynikSprawy(s.dane, podstawa(604030), katalog, s.dokumenty);
    const zKalkulatora = licz(bezDrugiego, {}, { matka: podstawa(604030) });
    const sprawa = okresy(zSprawy, 'matka', 'macierzynski')[0];
    const kalkulator = okresy(zKalkulatora, 'matka', 'macierzynski')[0];
    assert.equal(sprawa.dni, kalkulator.dni);
    assert.equal(sprawa.miesiecznie, kalkulator.miesiecznie);
    assert.equal(sprawa.zaOkres, kalkulator.zaOkres);
  });

  test('sprawy wzorcowe S01–S11: wyliczenie zgodne z rozstrzygnięciem (0111)', () => {
    for (const s of sprawyWzorcowe) {
      const wynik = weryfikujUbezpieczenieChorobowe(s.dane, katalog, s.dokumenty);
      const weryfikacja = { ...wynik, porownanie: porownajWeryfikacje(wynik, s.rozstrzygniecie) };
      const swiadczenia = wyliczSwiadczeniaSprawy(s.dane, weryfikacja, katalog, s.dokumenty);
      assert.ok(!('kod' in swiadczenia), `${s.idSprawy}: brak podstawy`);
      if ('kod' in swiadczenia) continue;
      assert.equal(porownajWyliczenieSprawy(swiadczenia, weryfikacja, s.rozstrzygniecie, 1).kod, '0111', s.idSprawy);
    }
  });
});

describe('kryteria akceptacji kalkulatora', () => {
  test('3.10.4.2.3: urodzenie martwego dziecka i zgon dziecka', () => {
    const martwe = licz(
      dane({ dataPorodu: w('2026-11-05'), formaMatki: w({ forma: 'jdg', dobrowolne: true }), strata: w({ rodzaj: 'martwe-urodzenie', liczbaDzieci: 1 }) }),
      {},
      { matka: podstawa(517740, false) },
    );
    assert.equal(martwe.okresy.length, 1);
    assert.deepEqual([martwe.okresy[0].do, martwe.okresy[0].zaOkres], ['2026-12-30', 966448]);
    const pozno = licz(dane({ dataPorodu: w('2026-07-01'), strata: w({ rodzaj: 'zgon-dziecka', dataZgonu: '2026-10-01', liczbaDzieci: 1 }) }));
    assert.equal(okresy(pozno, 'matka', 'macierzynski')[0].do, '2026-10-08');
    assert.equal(okresy(pozno, 'matka', 'rodzicielski').length, 0);
    const mnogi = licz(dane({ dataPorodu: w('2026-11-19'), liczbaDzieci: w(2), strata: w({ rodzaj: 'martwe-urodzenie', liczbaDzieci: 1 }) }), { wariant: '81-5' });
    assert.deepEqual([okresy(mnogi, 'matka', 'macierzynski')[0].do, okresy(mnogi, 'matka', 'macierzynski')[0].stawka], ['2027-04-07', 81.5]);
  });

  test('3.10.4.1.4: minimalna podstawa pracownika na pełnym etacie', () => {
    const wynik = licz(bezDrugiegoRodzica(), {}, { matka: podstawa(300000) });
    assert.equal(okresy(wynik, 'matka', 'macierzynski')[0].miesiecznie, 414710);
    assert.equal(okresy(licz(bezDrugiegoRodzica(), {}, { matka: podstawa(300000, false) }), 'matka', 'macierzynski')[0].miesiecznie, 300000);
  });

  test('3.10.4.4.1 i 3.10.4.4.2: łączenie urlopu rodzicielskiego z pracą', () => {
    const d = dane({ dataPorodu: w('2026-11-19') });
    const p = { matka: podstawa(707578), 'drugi-rodzic': podstawa(819755) };
    assert.deepEqual(czesciWyniku(d, domyslneParametry(d, katalog), katalog)[0], { rodzic: 'matka', od: '2027-04-08', tygodnie: 32 });
    const wynik = licz(d, { laczenie: { indeksCzesci: 0, tygodnie: 20, wymiarPracy: 50 } }, p);
    const laczenie = okresy(wynik, 'matka', 'laczenie-z-praca')[0];
    const wydluzenie = okresy(wynik, 'matka', 'wydluzenie-rodzicielskiego')[0];
    assert.deepEqual([laczenie.miesiecznie, laczenie.zaOkres], [247652, 1155700]);
    assert.deepEqual([wydluzenie.od, wydluzenie.do, wydluzenie.stawka, wydluzenie.zaOkres], ['2027-11-18', '2028-01-26', 70, 1155700]);
    assert.equal(okresy(wynik, 'drugi-rodzic', 'rodzicielski')[0].od, '2028-01-27');
    const wydluzenie7 = okresy(licz(d, { laczenie: { indeksCzesci: 0, tygodnie: 7, wymiarPracy: 25 } }, p), 'matka', 'wydluzenie-rodzicielskiego')[0];
    assert.deepEqual([wydluzenie7.dni, wydluzenie7.do], [12, '2027-11-29']);
    const w815 = okresy(licz(d, { wariant: '81-5', laczenie: { indeksCzesci: 0, tygodnie: 20, wymiarPracy: 50 } }, p), 'matka', 'laczenie-z-praca')[0];
    assert.deepEqual([w815.miesiecznie, w815.zaOkres], [288338, 1345680]);
  });

  test('3.10.4.2.5: przyjęcie dziecka na wychowanie', () => {
    const ka01 = licz(przyjecie({ datyUrodzeniaDzieci: ['2022-05-10', '2024-03-14'] }, 2), {}, { matka: podstawa(600000) });
    assert.equal(okresy(ka01, 'matka', 'rodzicielski')[0].do, '2028-01-30');
    const rzn = przyjecie({ forma: 'rodzina-zastepcza-niezawodowa', dataUrodzeniaDziecka: '2020-05-10' });
    const ka06 = licz(rzn);
    assert.equal(okresy(ka06, 'drugi-rodzic', 'rodzicielski')[0].do, '2027-12-12');
    assert.ok(ka06.komunikaty.some((k) => k.kod === '0290'));
    const k = kontekstPodzialu(rzn, domyslneParametry(rzn, katalog), katalog)!;
    const domyslne = formularz(k.domyslneCzesci!.map((c) => ({ rodzic: c.rodzic, od: c.od.split('-').reverse().join('.'), tygodnie: String(c.tygodnie) })));
    assert.deepEqual(walidujPodzial(domyslne, k), {});
    const laczenie = licz(rzn, { laczenie: { indeksCzesci: 0, tygodnie: 10, wymiarPracy: 50 } });
    assert.ok(laczenie.okresy.every((o) => o.do <= '2027-12-12'), 'urlop po łączeniu kończy się w ostatnim dniu okresu 38 tygodni');
    const ka08 = licz(przyjecie({ datyUrodzeniaDzieci: ['2022-05-10', '2013-12-20'] }, 2));
    assert.equal(okresy(ka08, 'matka', 'rodzicielski')[0].do, '2028-01-16');
    assert.ok(ka08.komunikaty.some((x) => x.kod === '0296'));
    const d10 = przyjecie({ datyUrodzeniaDzieci: ['2022-05-10', '2014-01-24'] }, 2);
    const czesci10: ParametryScenariusza['czesciRodzicielskiego'] = [
      { rodzic: 'matka', od: '2027-06-07', tygodnie: 34 },
      { rodzic: 'drugi-rodzic', od: '2027-06-07', tygodnie: 9 },
    ];
    assert.equal(okresy(licz(d10, { czesciRodzicielskiego: czesci10 }), 'matka', 'rodzicielski')[0].do, '2028-01-23');
    const k10 = kontekstPodzialu(d10, domyslneParametry(d10, katalog), katalog)!;
    assert.deepEqual(walidujPodzial(formularz([{ rodzic: 'matka', od: '07.06.2027', tygodnie: '34' }, { rodzic: 'drugi-rodzic', od: '07.06.2027', tygodnie: '9' }]), k10), {});
  });

  test('urlop ojcowski przy przysposobieniu: 12 miesięcy od uprawomocnienia, najpóźniej przed 14. urodzinami', () => {
    const d = przyjecie({ dataUrodzeniaDziecka: '2020-05-10', dataUprawomocnienia: '2027-06-01' });
    const k = kontekstPodzialu(d, domyslneParametry(d, katalog), katalog)!;
    assert.equal(k.ostatniDzienOjcowskiego, '2028-05-31');
    const starsze = przyjecie({ dataUrodzeniaDziecka: '2013-01-15', dataUprawomocnienia: '2027-06-01' });
    const k14 = kontekstPodzialu(starsze, domyslneParametry(starsze, katalog), katalog)!;
    assert.equal(walidujPodzial(formularz([], { wymiarOjcowskiego: '14-dni', datyOjcowskiego: ['01.03.2027', ''] }), k14)['ojcowski-0'], '0042');
  });

  test('części urlopu rodzicielskiego: bez nakładania się części jednego rodzica i najwyżej 5 części', () => {
    const nakladanie = licz(dane(), {
      czesciRodzicielskiego: [{ rodzic: 'matka', od: '2027-03-30', tygodnie: 20 }, { rodzic: 'matka', od: '2027-05-04', tygodnie: 12 }, { rodzic: 'drugi-rodzic', od: '2027-11-09', tygodnie: 9 }],
    });
    assert.equal(nakladanie.sumy.matka, 5936000);
    const daty = ['2027-03-30', '2027-05-04', '2027-06-08', '2027-07-13', '2027-08-17', '2027-09-21'];
    const szesc = licz(dane(), { czesciRodzicielskiego: daty.map((od) => ({ rodzic: 'matka' as const, od, tygodnie: 2 })) });
    assert.equal(okresy(szesc, 'matka', 'rodzicielski').length, 5);
    assert.ok(szesc.komunikaty.some((k) => k.kod === '0096'));
  });

  test('uzupełniający urlop macierzyński po porodzie od 37. tygodnia: pobyt od 5. do 28. dnia życia', () => {
    const uzupelniajacy = (pierwszyDzienPobytu: number) =>
      okresy(licz(dane({ wczesniactwo: w({ tydzienCiazy: 38, masaG: 3200, dniPobytu: 10, pierwszyDzienPobytu }) })), 'matka', 'uzupelniajacy');
    assert.equal(uzupelniajacy(4).length, 0);
    assert.equal(uzupelniajacy(6)[0].dni, 14);
    assert.equal(uzupelniajacy(29).length, 0);
  });
});

function bezDrugiegoRodzica(): DaneWejscioweKalkulatora {
  return dane({ formaDrugiegoRodzica: w({ forma: 'brak-drugiego-rodzica', dobrowolne: false }) });
}

describe('walidacja arkusza i REST API', () => {
  test('3.10.4.2.5 KA-10: walidator domeny (REST API) i arkusz przyjmują te same części', () => {
    const d = przyjecie({ datyUrodzeniaDzieci: ['2022-05-10', '2014-01-24'] }, 2);
    const p = domyslneParametry(d, katalog);
    const u = ukladScenariusza(d, p, katalog);
    assert.ok('zdarzenie' in u);
    if (!('zdarzenie' in u)) return;
    const czesci: ParametryScenariusza['czesciRodzicielskiego'] = [
      { rodzic: 'matka', od: '2027-06-07', tygodnie: 34 },
      { rodzic: 'drugi-rodzic', od: '2027-06-07', tygodnie: 9 },
    ];
    const api = walidujCzesciRodzicielskiego(czesci, u, katalog);
    assert.deepEqual(api, { czesci: {} });
    const zaDuzo = walidujCzesciRodzicielskiego([{ ...czesci[0], tygodnie: 35 }, czesci[1]], u, katalog);
    assert.equal(zaDuzo.czesci[0]?.tygodnie?.kod, '0061');
  });
});
