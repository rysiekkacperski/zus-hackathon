// Dane wejściowe i parametry domyślne kalkulatora (kontrakt, sekcja 7.2). Właściciel: u09 (Silnik kalkulatora zasiłku macierzyńskiego).
// Walidacja danych wejściowych zwraca kod komunikatu przy polu, którego dotyczy. Klucze pól:
// `zdarzenie`, `przewidywanyTerminPorodu`, `dataPorodu`, `formaPrzyjecia`, `dataPrzyjecia`, `dataUrodzeniaDziecka`,
// `liczbaDzieci`, `tydzienCiazy`, `masaUrodzeniowa`, `dniPobytu`, `rodzajStraty`, `dataZgonu`, `liczbaDzieciStraty`,
// `formaMatki`, `formaDrugiegoRodzica`. Format daty (0010) sprawdza widok przy zamianie tekstu na datę (`parsujDate`).
import { dodajLata, dodajMiesiace, porownajDaty } from '@/domena/daty';
import { ustalPrawoDoZasilku } from '@/domena/kalkulatory/prawo';
import { parametr } from '@/domena/kalkulatory/slowniki';
import { uzupelniajacyUrlop, wiekGranicznyPrzyjecia } from '@/domena/kalkulatory/okresy';
import type { BledyPol, DataISO, DaneWejscioweKalkulatora, Katalog, KodKomunikatu, ParametryScenariusza } from '@/domena/typy';

export type PoleDanychWejsciowych =
  | 'zdarzenie'
  | 'przewidywanyTerminPorodu'
  | 'dataPorodu'
  | 'formaPrzyjecia'
  | 'dataPrzyjecia'
  | 'dataUrodzeniaDziecka'
  | 'liczbaDzieci'
  | 'tydzienCiazy'
  | 'masaUrodzeniowa'
  | 'dniPobytu'
  | 'rodzajStraty'
  | 'dataZgonu'
  | 'liczbaDzieciStraty'
  | 'formaMatki'
  | 'formaDrugiegoRodzica';

/** Parametry komunikatów pól, które mają zmienną część: 0091 (wiek), 0164 (liczba dni), 0168 (liczba dzieci). */
export function parametryBleduPola(
  d: DaneWejscioweKalkulatora,
  pole: PoleDanychWejsciowych,
  kod: KodKomunikatu,
  katalog: Katalog,
): Record<string, string> | undefined {
  if (kod === '0091' && d.przyjecie !== undefined) {
    const p = d.przyjecie.wartosc;
    const wiek = wiekGranicznyPrzyjecia(p.forma, p.odroczenie, katalog, p.dataPrzyjecia);
    return wiek === null ? undefined : { wiek: String(wiek) };
  }
  if (kod === '0164' && d.wczesniactwo !== undefined) {
    const w = d.wczesniactwo.wartosc;
    return { liczbaDni: String(uzupelniajacyUrlop(w.tydzienCiazy, w.masaG, 0).maksDniPobytu) };
  }
  if (kod === '0168' && pole === 'liczbaDzieciStraty') return { liczbaDzieci: String(d.liczbaDzieci.wartosc) };
  return undefined;
}

/** Błędy danych wejściowych kalkulatora (0007, 0008, 0018, 0019, 0006, 0088, 0089, 0090, 0091, 0092, 0021, 0022, 0164, 0167, 0102, 0127, 0168). */
export function walidujDaneWejsciowe(d: DaneWejscioweKalkulatora, dzis: DataISO, katalog?: Katalog): BledyPol<string> {
  const b: BledyPol<PoleDanychWejsciowych> = {};
  const zd = d.zdarzenie?.wartosc;
  if (zd === undefined) {
    b.zdarzenie = '0006';
  } else if (zd === 'przewidywany-porod') {
    const t = d.przewidywanyTerminPorodu?.wartosc;
    if (t === undefined) b.przewidywanyTerminPorodu = '0007';
    else if (porownajDaty(t, dzis) < 0) b.przewidywanyTerminPorodu = '0008';
  } else if (zd === 'porod') {
    const t = d.dataPorodu?.wartosc;
    if (t === undefined) b.dataPorodu = '0018';
    else if (porownajDaty(t, dzis) > 0) b.dataPorodu = '0019';
  } else {
    const p = d.przyjecie?.wartosc;
    if (p === undefined) {
      b.formaPrzyjecia = '0006';
    } else {
      if (p.forma === 'rodzina-zastepcza-zawodowa') b.formaPrzyjecia = '0092';
      if (!p.dataPrzyjecia) b.dataPrzyjecia = '0088';
      else if (porownajDaty(p.dataPrzyjecia, dodajMiesiace(dzis, 12)) > 0) b.dataPrzyjecia = '0089';
      if (!p.dataUrodzeniaDziecka) b.dataUrodzeniaDziecka = '0163';
      else if (p.dataPrzyjecia && porownajDaty(p.dataUrodzeniaDziecka, p.dataPrzyjecia) > 0) b.dataUrodzeniaDziecka = '0090';
      else if (p.dataPrzyjecia && p.forma !== 'rodzina-zastepcza-zawodowa' && katalog !== undefined) {
        const wiek = wiekGranicznyPrzyjecia(p.forma, p.odroczenie, katalog, p.dataPrzyjecia);
        if (wiek !== null && porownajDaty(p.dataPrzyjecia, dodajLata(p.dataUrodzeniaDziecka, wiek)) >= 0) b.dataUrodzeniaDziecka = '0091';
      }
    }
  }

  const liczba = d.liczbaDzieci?.wartosc;
  if (liczba === undefined || liczba < 1 || liczba > 5) b.liczbaDzieci = '0006';

  if (zd === 'porod' && d.wczesniactwo !== undefined) {
    const w = d.wczesniactwo.wartosc;
    const tydzienOk = Number.isInteger(w.tydzienCiazy) && w.tydzienCiazy >= 22 && w.tydzienCiazy <= 44;
    const masaOk = Number.isFinite(w.masaG) && w.masaG >= 300 && w.masaG <= 7000;
    if (!tydzienOk) b.tydzienCiazy = '0021';
    if (!masaOk) b.masaUrodzeniowa = '0022';
    if (tydzienOk && masaOk) {
      const maks = uzupelniajacyUrlop(w.tydzienCiazy, w.masaG, 0).maksDniPobytu;
      if (!Number.isInteger(w.dniPobytu) || w.dniPobytu < 0 || w.dniPobytu > maks) b.dniPobytu = '0164';
    } else if (!Number.isInteger(w.dniPobytu) || w.dniPobytu < 0) {
      b.dniPobytu = '0164';
    }
  }

  if (zd === 'porod' && d.strata !== undefined) {
    const s = d.strata.wartosc;
    if (!s.rodzaj) b.rodzajStraty = '0006';
    if (s.rodzaj === 'zgon-dziecka') {
      const porod = d.dataPorodu?.wartosc;
      if (s.dataZgonu === undefined) b.dataZgonu = '0167';
      else if (porod !== undefined && porownajDaty(s.dataZgonu, porod) < 0) b.dataZgonu = '0102';
      else if (porownajDaty(s.dataZgonu, dzis) > 0) b.dataZgonu = '0127';
    }
    if (liczba !== undefined && liczba > 1 && (s.liczbaDzieci < 1 || s.liczbaDzieci > liczba)) b.liczbaDzieciStraty = '0168';
  }

  if (d.formaMatki?.wartosc?.forma === undefined) b.formaMatki = '0006';
  if (d.formaDrugiegoRodzica?.wartosc?.forma === undefined) b.formaDrugiegoRodzica = '0006';
  return b;
}

/**
 * Parametry scenariusza domyślne dla danych wejściowych: wariant 100% i 70%, bez części przed porodem, urlop ojcowski 14 dni.
 * Pusta lista części urlopu rodzicielskiego i pusta lista początków urlopu ojcowskiego oznaczają układ domyślny, który
 * `wyliczScenariusz` wylicza z bieżących danych (części: `ukladScenariusza(d, p, katalog).domyslneCzesci`).
 */
export function domyslneParametry(d: DaneWejscioweKalkulatora, katalog: Katalog): ParametryScenariusza {
  const p: ParametryScenariusza = {
    wariant: '100-70',
    tygodniePrzedPorodem: 0,
    czesciRodzicielskiego: [],
    ojcowski: { wymiar: 'brak', czesci: [] },
    datyPowrotu: {},
  };
  if (d.zdarzenie.wartosc === 'przyjecie' && d.przyjecie !== undefined) p.poczatekNaWarunkach = d.przyjecie.wartosc.dataPrzyjecia;
  const prawoMatki = ustalPrawoDoZasilku(d, 'matka').przysluguje;
  const prawoDrugiego = ustalPrawoDoZasilku(d, 'drugi-rodzic').przysluguje;
  if (prawoMatki) p.rodzicUzupelniajacego = 'matka';
  else if (prawoDrugiego) p.rodzicUzupelniajacego = 'drugi-rodzic';
  const jestDrugiRodzic = d.formaDrugiegoRodzica.wartosc.forma !== 'brak-drugiego-rodzica';
  const przysposobienie = d.przyjecie?.wartosc.forma === 'przysposobienie';
  const dzien = d.dataPorodu?.wartosc ?? d.przewidywanyTerminPorodu?.wartosc ?? d.przyjecie?.wartosc.dataPrzyjecia ?? katalog.dataUruchomienia;
  const dniOjcowskiego = parametr(katalog, 'ojcowskiDni', dzien).wartosc;
  if (jestDrugiRodzic && dniOjcowskiego > 0 && (d.zdarzenie.wartosc !== 'przyjecie' || przysposobienie)) {
    p.ojcowski = { wymiar: dniOjcowskiego >= 14 ? '14-dni' : '7-dni', czesci: [] };
  }
  return p;
}
