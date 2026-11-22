// Zmiana wartości w Katalogu świadczeń działa w wyliczeniach bez zmiany kodu (panel Administratora).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { domyslneParametry, wyliczScenariusz } from '@/domena/kalkulatory';
import { czyZmianaKatalogu } from '@/domena/katalog/zmiany';
import { warunkiSpraw } from '@/domena/plan/warunki';
import { DZIS, daneKalkulatora, katalogStartowy, katalogZWartosciami, podstawa, wartosc } from './pomocnicze';

const podstawy = { matka: podstawa(600000) };
const bezDrugiego = { formaDrugiegoRodzica: wartosc({ forma: 'brak-drugiego-rodzica', dobrowolne: false }) };

function uzupelniajacy(katalog: ReturnType<typeof katalogStartowy>) {
  const d = daneKalkulatora({ ...bezDrugiego, wczesniactwo: wartosc({ tydzienCiazy: 26, masaG: 900, dniPobytu: 120 }) });
  const wynik = wyliczScenariusz(d, podstawy, domyslneParametry(d, katalog), katalog, DZIS);
  return wynik.okresy.find((o) => o.rodzaj === 'uzupelniajacy');
}

test('uzupełniający urlop macierzyński: limit 15 tygodni z katalogu, po zmianie na 10 tygodni krótszy okres', () => {
  assert.equal(uzupelniajacy(katalogStartowy())?.dni, 105);
  const zmieniony = katalogZWartosciami({ 'uzupelniajacy-urlop-macierzynski': { przedwczesnyPorod: 10 } });
  assert.equal(uzupelniajacy(zmieniony)?.dni, 70);
});

test('urlop rodzicielski i część nieprzenoszalna z katalogu wydłużają urlop matki', () => {
  const d = daneKalkulatora();
  const pod = { matka: podstawa(600000), 'drugi-rodzic': podstawa(600000) };
  const startowy = katalogStartowy();
  const zmieniony = katalogZWartosciami({ 'urlop-rodzicielski': { jednoDziecko: 45 }, 'nieprzenoszalna-czesc-urlopu-rodzicielskiego': { tygodnie: 11 } });
  const tygodnie = (k: typeof startowy) =>
    wyliczScenariusz(d, pod, domyslneParametry(d, k), k, DZIS).okresy.filter((o) => o.rodzaj === 'rodzicielski').map((o) => [o.rodzic, o.dni / 7]);
  assert.deepEqual(tygodnie(startowy), [['matka', 32], ['drugi-rodzic', 9]]);
  assert.deepEqual(tygodnie(zmieniony), [['matka', 34], ['drugi-rodzic', 11]]);
});

test('ostrzeżenie K25 o wyczerpaniu okresu zasiłkowego korzysta z okresu z katalogu', () => {
  const dz = (wartosc: unknown) => ({ wartosc, zrodlo: 'odpowiedz-rodzica' });
  const ezla = (od: string, doDnia: string) => ({ od, do: doDnia, kodyLiterowe: ['B'], rodzaj: 'choroba', platnik: 'x', seriaINumer: od, dataWystawienia: od });
  const wejscie = (katalog: ReturnType<typeof katalogStartowy>) => ({
    daneRodziny: {
      matka: { formaZatrudnienia: dz('umowa-o-prace'), dobrowolneChorobowe: null, platnikZasilku: null, potwierdzeniaSkladek: [] },
      drugiRodzic: { formaZatrudnienia: null },
      stanCywilny: null,
      dochodNaOsobe: null,
    },
    daneCiazy: { przewidywanyTerminPorodu: '2027-03-01', dataPoroduPotwierdzona: false, dzieci: [], sytuacjeSzczegolne: [], liczbaDzieciZCiazy: 1 },
    zgoda: true,
    katalog,
    dzis: DZIS,
    daneZusMatki: { tytuly: [], zaswiadczeniaEzla: [ezla('2026-05-01', '2026-11-30'), ezla('2026-12-01', '2027-01-31')] },
    poprzedniPlan: null,
    parametry: {},
  }) as unknown as Parameters<(typeof warunkiSpraw)['K25']>[0];
  assert.equal(warunkiSpraw.K25(wejscie(katalogStartowy())).spelniony, true);
  assert.equal(warunkiSpraw.K25(wejscie(katalogZWartosciami({ 'okres-zasilkowy': { ciaza: 400 } }))).spelniony, false);
});

test('usługa katalogu przyjmuje wyłącznie regułę terminu w układzie funkcji terminów', () => {
  const zmiana = (regulaTerminu: unknown) => ({ rodzaj: 'zmiana-pozycji', zmiana: { id: 'K05', zmiany: { regulaTerminu }, przez: '88031407319', czas: '2026-11-22T10:00:00Z' } });
  assert.equal(czyZmianaKatalogu(zmiana({ typ: 'przesuniecie', kotwica: 'data-porodu', przesuniecie: 30, jednostka: 'dni' })), true);
  assert.equal(czyZmianaKatalogu(zmiana({ rodzaj: 'od-kotwicy', kotwica: 'data-porodu' })), false);
  assert.equal(czyZmianaKatalogu(zmiana({ typ: 'przesuniecie', kotwica: 'brak', przesuniecie: 3, jednostka: 'dni' })), false);
});

test('katalog wspólny: pobranie raz przy starcie, potem najwyżej co 60 s, po powrocie do karty i po odzyskaniu sieci', async () => {
  const { czyPobracKatalog, ODSTEP_POBIERANIA_MS } = await import('@/dane/magazyn/katalog-serwer');
  assert.equal(czyPobracKatalog('start', null, 1_000), true);
  assert.equal(czyPobracKatalog('start', 1_000, 500_000), false);
  assert.equal(czyPobracKatalog('okresowe', 1_000, 1_000 + ODSTEP_POBIERANIA_MS - 1), false);
  assert.equal(czyPobracKatalog('okresowe', 1_000, 1_000 + ODSTEP_POBIERANIA_MS), true);
  assert.equal(czyPobracKatalog('panel', 1_000, 30_000), false);
  assert.equal(czyPobracKatalog('powrot', 1_000, 5_000), false);
  assert.equal(czyPobracKatalog('powrot', 1_000, 12_000), true);
  assert.equal(czyPobracKatalog('siec', 1_000, 1_001), true);
});
