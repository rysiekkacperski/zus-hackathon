// Odczyt i walidacja wejścia kalkulatorów REST API: dane wejściowe kalkulatora zasiłku macierzyńskiego, parametry
// scenariusza i podstawy wymiaru rodziców. Struktura i format pól (0006, 0010, 0016) sprawdza ten moduł, a reguły
// danych (terminy, zakresy, prawo rodziców) sprawdzają funkcje domeny z src/domena/kalkulatory, te same co w przeglądarce.
import { liczbaDniWlacznie, miesiacZDaty } from '@/domena/daty';
import {
  graniceDatyPowrotu,
  maksTygodniRodzica,
  miesiacPowstaniaPrawa,
  poczatekBezCzesci,
  ukladScenariusza,
  walidujCzescOjcowskiego,
  walidujCzesciRodzicielskiego,
  walidujDatePowrotu,
  walidujDaneWejsciowe,
  walidujDateUbezpieczeniaPoPorodzie,
  walidujLaczenie,
  walidujPoczatekNaWarunkach,
  walidujPrzejecie,
  walidujTygodniePrzedPorodem,
  wyliczPodstawe,
  wyliczPodstaweZTytulow,
  type SytuacjaPrzejecia,
} from '@/domena/kalkulatory';
import type {
  CzescUrlopuRodzicielskiego,
  DaneWejscioweKalkulatora,
  DataISO,
  FormaZatrudnienia,
  Katalog,
  KodKomunikatu,
  LaczenieZPraca,
  MiesiacISO,
  ParametryScenariusza,
  PodstawaSkladek,
  PodstawaWymiaru,
  RodzicWRodzinie,
  WartoscKalkulatora,
  ZnacznikCzasu,
  ZrodloWartosciKalkulatora,
} from '@/domena/typy';
import type { KomunikatApi } from '@/domena/typy/api-v1';
import { odczytajKontoZus, sprawdzPesel } from '@/serwer/api/konta-zus';
import {
  czyObiekt,
  czytajDate,
  czytajKwote,
  czytajLiczbe,
  czytajLiczbeCalkowita,
  czytajListe,
  czytajLogiczna,
  czytajObiekt,
  czytajZWyliczenia,
  sciezka,
  type BledyWejscia,
} from '@/serwer/api/walidacja';

export const FORMY_ZATRUDNIENIA: readonly FormaZatrudnienia[] = ['umowa-o-prace', 'umowa-zlecenia', 'jdg', 'brak-tytulu'];
export const RODZICE: readonly RodzicWRodzinie[] = ['matka', 'drugi-rodzic'];
const ZRODLA: readonly ZrodloWartosciKalkulatora[] = ['profil-rodziny', 'konto-zus', 'przykladowa-sprawa', 'wartosc-w-kalkulatorze', 'wartosc-domyslna'];
const FORMY_PRZYJECIA = ['przysposobienie', 'rodzina-zastepcza-niezawodowa', 'rodzina-zastepcza-zawodowa'] as const;
const RODZAJE_STRATY = ['martwe-urodzenie', 'zgon-dziecka', 'poronienie'] as const;
const SYTUACJE_PRZEJECIA: readonly SytuacjaPrzejecia[] = ['rezygnacja', 'orzeczenie', 'porzucenie', 'szpital', 'zgon-matki', 'zatrudnienie-matki'];
/** Najwyższa podstawa wymiaru w kalkulatorach: 99 999,99 zł. */
export const MAKS_PODSTAWY_GROSZE = 9_999_999;

// --- Dane wejściowe kalkulatora -----------------------------------------------------------------

/** Wartość z oznaczeniem źródła albo sama wartość, której źródłem jest kalkulator. */
function rozpakuj(w: unknown): { wartosc: unknown; zrodlo: ZrodloWartosciKalkulatora } | undefined {
  if (w === undefined || w === null) return undefined;
  if (czyObiekt(w) && 'wartosc' in w && typeof w.zrodlo === 'string' && (ZRODLA as readonly string[]).includes(w.zrodlo)) {
    return { wartosc: w.wartosc, zrodlo: w.zrodlo as ZrodloWartosciKalkulatora };
  }
  return { wartosc: w, zrodlo: 'wartosc-w-kalkulatorze' };
}

function zeZrodlem<T>(wartosc: T, zrodlo: ZrodloWartosciKalkulatora): WartoscKalkulatora<T> {
  return { wartosc, zrodlo };
}

function czytajDaty(w: unknown, pole: string, bledy: BledyWejscia): DataISO[] | undefined {
  if (w === undefined || w === null) return undefined;
  const lista = czytajListe(w, pole, bledy);
  const daty: DataISO[] = [];
  lista.forEach((d, i) => {
    const data = czytajDate(d, sciezka(pole, i), bledy, { wymagane: true });
    if (data !== undefined) daty.push(data);
  });
  return daty;
}

function formaRodzicaZWejscia(
  w: unknown,
  pole: string,
  bledy: BledyWejscia,
  dozwolone: readonly string[],
): WartoscKalkulatora<{ forma: never; dobrowolne: boolean }> | undefined {
  const r = rozpakuj(w);
  if (r === undefined) return undefined;
  const obiekt = typeof r.wartosc === 'string' ? { forma: r.wartosc } : czytajObiekt(r.wartosc, pole, bledy, { wymagane: true });
  if (obiekt === undefined) return undefined;
  const forma = czytajZWyliczenia(obiekt.forma, dozwolone, sciezka(pole, 'forma'), bledy, { wymagane: true });
  const dobrowolne = czytajLogiczna(obiekt.dobrowolne, sciezka(pole, 'dobrowolne'), bledy, false);
  if (forma === undefined) return undefined;
  return zeZrodlem({ forma: forma as never, dobrowolne }, r.zrodlo);
}

/**
 * Dane wejściowe kalkulatora z żądania po sprawdzeniu struktury i formatu pól, z kluczami błędów
 * 'daneWejsciowe.<pole>'. Reguły danych sprawdza potem `walidujDaneWejsciowe` z domeny.
 */
export function czytajDaneWejsciowe(w: unknown, bledy: BledyWejscia, p = 'daneWejsciowe'): DaneWejscioweKalkulatora | undefined {
  const o = czytajObiekt(w, p, bledy, { wymagane: true });
  if (o === undefined) return undefined;

  const zd = rozpakuj(o.zdarzenie);
  const zdarzenie = zd && czytajZWyliczenia(zd.wartosc, ['porod', 'przewidywany-porod', 'przyjecie'] as const, sciezka(p, 'zdarzenie'), bledy, { wymagane: true });
  if (zd === undefined) bledy[sciezka(p, 'zdarzenie')] = '0006';

  const dane: Partial<DaneWejscioweKalkulatora> = {};
  if (zd && zdarzenie) dane.zdarzenie = zeZrodlem(zdarzenie, zd.zrodlo);

  for (const pole of ['dataPorodu', 'przewidywanyTerminPorodu'] as const) {
    const r = rozpakuj(o[pole]);
    if (r === undefined) continue;
    const data = czytajDate(r.wartosc, sciezka(p, pole), bledy);
    if (data !== undefined) dane[pole] = zeZrodlem(data, r.zrodlo);
  }

  const pr = rozpakuj(o.przyjecie);
  if (pr !== undefined) {
    const pp = sciezka(p, 'przyjecie');
    const obiekt = czytajObiekt(pr.wartosc, pp, bledy, { wymagane: true });
    if (obiekt !== undefined) {
      const forma = czytajZWyliczenia(obiekt.forma, FORMY_PRZYJECIA, sciezka(p, 'formaPrzyjecia'), bledy, { wymagane: true });
      const dataPrzyjecia = czytajDate(obiekt.dataPrzyjecia, sciezka(p, 'dataPrzyjecia'), bledy);
      const dataUrodzeniaDziecka = czytajDate(obiekt.dataUrodzeniaDziecka, sciezka(p, 'dataUrodzeniaDziecka'), bledy);
      const datyUrodzeniaDzieci = czytajDaty(obiekt.datyUrodzeniaDzieci, sciezka(pp, 'datyUrodzeniaDzieci'), bledy);
      const dataUprawomocnienia = czytajDate(obiekt.dataUprawomocnienia, sciezka(pp, 'dataUprawomocnienia'), bledy);
      if (forma !== undefined) {
        // Pusta data przyjęcia albo urodzenia trafia do walidacji domeny, która nadaje jej kod 0088 albo 0163.
        dane.przyjecie = zeZrodlem({
          forma,
          dataPrzyjecia: dataPrzyjecia ?? '',
          dataUrodzeniaDziecka: dataUrodzeniaDziecka ?? '',
          odroczenie: czytajLogiczna(obiekt.odroczenie, sciezka(pp, 'odroczenie'), bledy, false),
          ...(datyUrodzeniaDzieci ? { datyUrodzeniaDzieci } : {}),
          ...(dataUprawomocnienia ? { dataUprawomocnienia } : {}),
        }, pr.zrodlo);
      }
    }
  }

  const lz = rozpakuj(o.liczbaDzieci);
  const liczba = lz && czytajLiczbeCalkowita(lz.wartosc, sciezka(p, 'liczbaDzieci'), bledy, { wymagane: true, min: 1, max: 5 });
  if (lz === undefined) bledy[sciezka(p, 'liczbaDzieci')] = '0006';
  if (lz && liczba !== undefined) dane.liczbaDzieci = zeZrodlem(liczba as DaneWejscioweKalkulatora['liczbaDzieci']['wartosc'], lz.zrodlo);

  const zz = rozpakuj(o.zaZyciem);
  dane.zaZyciem = zeZrodlem(czytajLogiczna(zz?.wartosc, sciezka(p, 'zaZyciem'), bledy, false), zz?.zrodlo ?? 'wartosc-domyslna');

  const wc = rozpakuj(o.wczesniactwo);
  if (wc !== undefined) {
    const pw = sciezka(p, 'wczesniactwo');
    const obiekt = czytajObiekt(wc.wartosc, pw, bledy, { wymagane: true });
    if (obiekt !== undefined) {
      const tydzienCiazy = czytajLiczbe(obiekt.tydzienCiazy, sciezka(p, 'tydzienCiazy'), bledy, { wymagane: true, kod: '0021' });
      const masaG = czytajLiczbe(obiekt.masaG, sciezka(p, 'masaUrodzeniowa'), bledy, { wymagane: true, kod: '0022' });
      const dniPobytu = czytajLiczbe(obiekt.dniPobytu ?? 0, sciezka(p, 'dniPobytu'), bledy, { kod: '0164' });
      const pierwszyDzienPobytu = czytajLiczbeCalkowita(obiekt.pierwszyDzienPobytu, sciezka(pw, 'pierwszyDzienPobytu'), bledy, { min: 1 });
      if (tydzienCiazy !== undefined && masaG !== undefined && dniPobytu !== undefined) {
        dane.wczesniactwo = zeZrodlem({ tydzienCiazy, masaG, dniPobytu, ...(pierwszyDzienPobytu !== undefined ? { pierwszyDzienPobytu } : {}) }, wc.zrodlo);
      }
    }
  }

  const st = rozpakuj(o.strata);
  if (st !== undefined) {
    const ps = sciezka(p, 'strata');
    const obiekt = czytajObiekt(st.wartosc, ps, bledy, { wymagane: true });
    if (obiekt !== undefined) {
      const rodzaj = czytajZWyliczenia(obiekt.rodzaj, RODZAJE_STRATY, sciezka(p, 'rodzajStraty'), bledy, { wymagane: true });
      const dataZgonu = czytajDate(obiekt.dataZgonu, sciezka(p, 'dataZgonu'), bledy);
      const liczbaStraty = czytajLiczbeCalkowita(obiekt.liczbaDzieci ?? 1, sciezka(p, 'liczbaDzieciStraty'), bledy, { kod: '0168' });
      if (rodzaj !== undefined && liczbaStraty !== undefined) {
        dane.strata = zeZrodlem({ rodzaj, liczbaDzieci: liczbaStraty, ...(dataZgonu ? { dataZgonu } : {}) }, st.zrodlo);
      }
    }
  }

  const fm = formaRodzicaZWejscia(o.formaMatki, sciezka(p, 'formaMatki'), bledy, FORMY_ZATRUDNIENIA);
  if (o.formaMatki === undefined || o.formaMatki === null) bledy[sciezka(p, 'formaMatki')] = '0006';
  if (fm) dane.formaMatki = fm;
  const fd = formaRodzicaZWejscia(o.formaDrugiegoRodzica, sciezka(p, 'formaDrugiegoRodzica'), bledy, [...FORMY_ZATRUDNIENIA, 'brak-drugiego-rodzica']);
  if (o.formaDrugiegoRodzica === undefined || o.formaDrugiegoRodzica === null) bledy[sciezka(p, 'formaDrugiegoRodzica')] = '0006';
  if (fd) dane.formaDrugiegoRodzica = fd;

  if (!dane.zdarzenie || !dane.liczbaDzieci || !dane.formaMatki || !dane.formaDrugiegoRodzica) return undefined;
  return dane as DaneWejscioweKalkulatora;
}

/** Reguły danych wejściowych z domeny z kluczami 'daneWejsciowe.<pole>'. */
export function walidujRegulyDanych(d: DaneWejscioweKalkulatora, dzis: DataISO, katalog: Katalog, p = 'daneWejsciowe'): BledyWejscia {
  const bledy: BledyWejscia = {};
  for (const [pole, kod] of Object.entries(walidujDaneWejsciowe(d, dzis, katalog))) if (kod !== undefined) bledy[sciezka(p, pole)] = kod;
  return bledy;
}

// --- Parametry scenariusza ------------------------------------------------------------------------

function czytajLaczenie(w: unknown, pole: string, bledy: BledyWejscia): LaczenieZPraca | undefined {
  const o = czytajObiekt(w, pole, bledy);
  if (o === undefined) return undefined;
  const indeksCzesci = czytajLiczbeCalkowita(o.indeksCzesci, sciezka(pole, 'indeksCzesci'), bledy, { wymagane: true, min: 0 });
  const tygodnie = czytajLiczbeCalkowita(o.tygodnie, sciezka(pole, 'tygodnie'), bledy, { wymagane: true, min: 1, kod: '0061' });
  const wymiarPracy = czytajLiczbeCalkowita(o.wymiarPracy, sciezka(pole, 'wymiarPracy'), bledy, { wymagane: true, min: 1, kod: '0098' });
  const odTygodnia = czytajLiczbeCalkowita(o.odTygodnia, sciezka(pole, 'odTygodnia'), bledy, { min: 0 });
  if (indeksCzesci === undefined || tygodnie === undefined || wymiarPracy === undefined) return undefined;
  return { indeksCzesci, tygodnie, wymiarPracy, ...(odTygodnia !== undefined ? { odTygodnia } : {}) };
}

/**
 * Parametry scenariusza z żądania nałożone na parametry domyślne. Struktura i format pól mają klucze
 * 'parametry.<pole>', a reguły arkuszy kalkulatora sprawdza `walidujRegulyParametrow`.
 */
export function czytajParametry(w: unknown, domyslne: ParametryScenariusza, bledy: BledyWejscia, p = 'parametry'): ParametryScenariusza {
  const o = czytajObiekt(w, p, bledy);
  if (o === undefined) return domyslne;
  const wynik: ParametryScenariusza = { ...domyslne, datyPowrotu: { ...domyslne.datyPowrotu } };

  const wariant = czytajZWyliczenia(o.wariant, ['81-5', '100-70'] as const, sciezka(p, 'wariant'), bledy);
  if (wariant) wynik.wariant = wariant;
  const tygodnie = czytajLiczbeCalkowita(o.tygodniePrzedPorodem, sciezka(p, 'tygodniePrzedPorodem'), bledy, { min: 0, kod: '0061' });
  if (tygodnie !== undefined) wynik.tygodniePrzedPorodem = tygodnie;
  const poczatek = czytajDate(o.poczatekNaWarunkach, sciezka(p, 'poczatekNaWarunkach'), bledy);
  if (poczatek) wynik.poczatekNaWarunkach = poczatek;
  const uzup = czytajZWyliczenia(o.rodzicUzupelniajacego, RODZICE, sciezka(p, 'rodzicUzupelniajacego'), bledy);
  if (uzup) wynik.rodzicUzupelniajacego = uzup;

  if (o.czesciRodzicielskiego !== undefined) {
    const czesci: CzescUrlopuRodzicielskiego[] = [];
    czytajListe(o.czesciRodzicielskiego, sciezka(p, 'czesciRodzicielskiego'), bledy).forEach((c, i) => {
      const pc = sciezka(p, 'czesciRodzicielskiego', i);
      const obiekt = czytajObiekt(c, pc, bledy, { wymagane: true });
      if (obiekt === undefined) return;
      const rodzic = czytajZWyliczenia(obiekt.rodzic, RODZICE, sciezka(pc, 'rodzic'), bledy, { wymagane: true });
      const od = czytajDate(obiekt.od, sciezka(pc, 'od'), bledy, { wymagane: true, kodBraku: '0175' });
      const t = czytajLiczbeCalkowita(obiekt.tygodnie, sciezka(pc, 'tygodnie'), bledy, { wymagane: true, min: 1, kod: '0061' });
      if (rodzic && od && t !== undefined) czesci.push({ rodzic, od, tygodnie: t });
    });
    wynik.czesciRodzicielskiego = czesci;
  }

  const oj = czytajObiekt(o.ojcowski, sciezka(p, 'ojcowski'), bledy);
  if (oj !== undefined) {
    const wymiar = czytajZWyliczenia(oj.wymiar, ['14-dni', '7-dni', 'brak'] as const, sciezka(p, 'ojcowski', 'wymiar'), bledy, { wymagane: true });
    const czesci = czytajDaty(oj.czesci, sciezka(p, 'ojcowski', 'czesci'), bledy) ?? [];
    if (wymiar) wynik.ojcowski = { wymiar, czesci: czesci.slice(0, 2) };
  }

  const dp = czytajObiekt(o.drugiRodzicPoPorodzie, sciezka(p, 'drugiRodzicPoPorodzie'), bledy);
  if (dp !== undefined) {
    const data = czytajDate(dp.dataUbezpieczenia, sciezka(p, 'drugiRodzicPoPorodzie', 'dataUbezpieczenia'), bledy, { wymagane: true });
    const forma = czytajZWyliczenia(dp.forma, FORMY_ZATRUDNIENIA, sciezka(p, 'drugiRodzicPoPorodzie', 'forma'), bledy, { wymagane: true });
    if (data && forma) wynik.drugiRodzicPoPorodzie = { dataUbezpieczenia: data, forma };
  }

  const pj = czytajObiekt(o.przejecie, sciezka(p, 'przejecie'), bledy);
  if (pj !== undefined) {
    const sytuacja = czytajZWyliczenia(pj.sytuacja, SYTUACJE_PRZEJECIA, sciezka(p, 'przejecie', 'sytuacja'), bledy, { wymagane: true });
    const data = czytajDate(pj.data, sciezka(p, 'przejecie', 'data'), bledy, { wymagane: true, kodBraku: '0175' });
    const koniec = czytajDate(pj.koniecPobytuMatki, sciezka(p, 'przejecie', 'koniecPobytuMatki'), bledy);
    if (sytuacja && data) wynik.przejecie = { sytuacja, data, ...(koniec ? { koniecPobytuMatki: koniec } : {}) };
  }

  const laczenie = czytajLaczenie(o.laczenie, sciezka(p, 'laczenie'), bledy);
  if (laczenie) wynik.laczenie = laczenie;
  if (o.laczeniaDodatkowe !== undefined) {
    const lista = czytajListe(o.laczeniaDodatkowe, sciezka(p, 'laczeniaDodatkowe'), bledy)
      .map((l, i) => czytajLaczenie(l, sciezka(p, 'laczeniaDodatkowe', i), bledy))
      .filter((l): l is LaczenieZPraca => l !== undefined);
    wynik.laczeniaDodatkowe = lista;
  }

  const dpw = czytajObiekt(o.datyPowrotu, sciezka(p, 'datyPowrotu'), bledy);
  if (dpw !== undefined) {
    for (const rodzic of RODZICE) {
      const data = czytajDate(dpw[rodzic], sciezka(p, 'datyPowrotu', rodzic), bledy);
      if (data) wynik.datyPowrotu[rodzic] = data;
    }
  }
  return wynik;
}

/**
 * Reguły arkuszy kalkulatora dla parametrów podanych w żądaniu: część przed porodem (0061), początek urlopu przy
 * przyjęciu (0042), części urlopu rodzicielskiego (0006, 0064, 0042, 0061, 0095, 0096, 0175), urlop ojcowski (0042),
 * ubezpieczenie drugiego rodzica po porodzie (0247), przejęcie urlopu (0097, 0169, 0176, 0110), łączenie z pracą
 * (0061, 0098) i daty powrotu (0243, 0244). Zwraca błędy pól i parametry treści pierwszego komunikatu.
 */
export function walidujRegulyParametrow(
  d: DaneWejscioweKalkulatora,
  par: ParametryScenariusza,
  zadane: Record<string, unknown>,
  katalog: Katalog,
  p = 'parametry',
): { bledy: BledyWejscia; parametry?: Record<string, string> } {
  const bledy: BledyWejscia = {};
  let parametry: Record<string, string> | undefined;
  const dodaj = (pole: string, b: { kod: KodKomunikatu; parametry?: Record<string, string> } | null | undefined) => {
    if (!b) return;
    bledy[pole] = b.kod;
    if (parametry === undefined && b.parametry) parametry = b.parametry;
  };
  const u = ukladScenariusza(d, par, katalog);
  if (!('zdarzenie' in u) || u.brakDanych !== undefined) return { bledy };

  if (zadane.tygodniePrzedPorodem !== undefined) {
    const t = walidujTygodniePrzedPorodem(String(par.tygodniePrzedPorodem), katalog, u.dataZdarzenia);
    if ('kod' in t) dodaj(sciezka(p, 'tygodniePrzedPorodem'), t);
  }
  if (zadane.poczatekNaWarunkach !== undefined && d.przyjecie !== undefined && par.poczatekNaWarunkach !== undefined) {
    const w = walidujPoczatekNaWarunkach(par.poczatekNaWarunkach, d.przyjecie.wartosc.dataPrzyjecia, katalog);
    if ('kod' in w) dodaj(sciezka(p, 'poczatekNaWarunkach'), w);
  }
  if (zadane.czesciRodzicielskiego !== undefined && par.czesciRodzicielskiego.length > 0) {
    const w = walidujCzesciRodzicielskiego(par.czesciRodzicielskiego, u, katalog);
    for (const [i, pola] of Object.entries(w.czesci)) {
      for (const [pole, b] of Object.entries(pola)) dodaj(sciezka(p, 'czesciRodzicielskiego', Number(i), pole), b);
    }
    dodaj(sciezka(p, 'czesciRodzicielskiego'), w.lista);
  }
  if (zadane.ojcowski !== undefined && par.ojcowski.czesci.length > 0) {
    u.ojcowski.forEach((o, i) => {
      if (par.ojcowski.czesci[i] !== undefined) dodaj(sciezka(p, 'ojcowski', 'czesci', i), walidujCzescOjcowskiego(o.od, liczbaDniWlacznie(o), u));
    });
  }
  if (par.drugiRodzicPoPorodzie !== undefined && d.dataPorodu !== undefined) {
    dodaj(sciezka(p, 'drugiRodzicPoPorodzie', 'dataUbezpieczenia'), walidujDateUbezpieczeniaPoPorodzie(par.drugiRodzicPoPorodzie.dataUbezpieczenia, d.dataPorodu.wartosc));
  }
  if (par.przejecie !== undefined) {
    const w = walidujPrzejecie({
      sytuacja: par.przejecie.sytuacja as SytuacjaPrzejecia,
      data: par.przejecie.data,
      koniecPobytuMatki: par.przejecie.koniecPobytuMatki ?? null,
    }, u);
    for (const [pole, b] of Object.entries(w)) dodaj(sciezka(p, 'przejecie', pole), b);
  }
  const czesciUkladu = par.czesciRodzicielskiego.length > 0 ? par.czesciRodzicielskiego : u.domyslneCzesci;
  const laczenia: [string, LaczenieZPraca][] = [
    ...(par.laczenie ? [[sciezka(p, 'laczenie'), par.laczenie] as [string, LaczenieZPraca]] : []),
    ...(par.laczeniaDodatkowe ?? []).map((l, i) => [sciezka(p, 'laczeniaDodatkowe', i), l] as [string, LaczenieZPraca]),
  ];
  for (const [pole, l] of laczenia) {
    const w = walidujLaczenie({ czesc: czesciUkladu[l.indeksCzesci] ?? null, tygodnie: String(l.tygodnie), wymiarPracy: String(l.wymiarPracy) }, katalog, u.dataZdarzenia);
    for (const [klucz, b] of Object.entries(w)) dodaj(sciezka(pole, klucz === 'czesc' ? 'indeksCzesci' : klucz), b);
  }
  for (const rodzic of RODZICE) {
    const data = zadane.datyPowrotu !== undefined ? par.datyPowrotu[rodzic] : undefined;
    if (data === undefined) continue;
    const granice = graniceDatyPowrotu(czesciUkladu, rodzic, poczatekBezCzesci(u, rodzic), maksTygodniRodzica(u, czesciUkladu, rodzic));
    dodaj(sciezka(p, 'datyPowrotu', rodzic), walidujDatePowrotu(data, granice));
  }
  return parametry ? { bledy, parametry } : { bledy };
}

// --- Podstawy wymiaru -----------------------------------------------------------------------------

const RODZAJ_DLA_FORMY: Partial<Record<FormaZatrudnienia, string>> = { 'umowa-o-prace': 'pracownik', 'umowa-zlecenia': 'zleceniobiorca', jdg: 'dzialalnosc' };

export interface KontekstPodstawy {
  /** Forma zatrudnienia rodzica z danych wejściowych albo z żądania. */
  forma: FormaZatrudnienia | null;
  miesiacPrawa: MiesiacISO;
  dzien: DataISO;
  teraz: ZnacznikCzasu;
  katalog: Katalog;
}

export type WynikPodstawy = { podstawa: PodstawaWymiaru } | { komunikat: KomunikatApi } | null;

/**
 * Podstawa wymiaru rodzica z żądania: kwota wpisana, podstawy składek albo dane konta symulowanego ZUS z numeru PESEL.
 * Brak podstaw składek z ubezpieczeniem chorobowym daje komunikat 0094, konto bez danych ZUS komunikat 0173.
 */
export function czytajPodstawe(w: unknown, pole: string, bledy: BledyWejscia, k: KontekstPodstawy): WynikPodstawy {
  const o = czytajObiekt(w, pole, bledy);
  if (o === undefined) return null;
  const pelnyEtat = czytajLogiczna(o.pelnyEtat, sciezka(pole, 'pelnyEtat'), bledy, k.forma === 'umowa-o-prace');
  const forma = czytajZWyliczenia(o.forma, FORMY_ZATRUDNIENIA, sciezka(pole, 'forma'), bledy) ?? k.forma;

  if (o.kwota !== undefined) {
    const kwota = czytajKwote(o.kwota, sciezka(pole, 'kwota'), bledy, { wymagane: true, kodBraku: '0093', maks: MAKS_PODSTAWY_GROSZE });
    if (kwota === undefined) return null;
    return { podstawa: { kwota, zrodlo: 'wartosc-wpisana-przez-rodzica', ...(forma === 'umowa-o-prace' ? { pelnyEtat } : {}) } };
  }

  if (o.podstawySkladek !== undefined) {
    const podstawy: PodstawaSkladek[] = [];
    czytajListe(o.podstawySkladek, sciezka(pole, 'podstawySkladek'), bledy).forEach((ps, i) => {
      const pp = sciezka(pole, 'podstawySkladek', i);
      const obiekt = czytajObiekt(ps, pp, bledy, { wymagane: true });
      if (obiekt === undefined) return;
      const miesiac = typeof obiekt.miesiac === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(obiekt.miesiac) ? obiekt.miesiac : undefined;
      if (miesiac === undefined) bledy[sciezka(pp, 'miesiac')] = '0010';
      const kwota = czytajLiczbeCalkowita(obiekt.kwota, sciezka(pp, 'kwota'), bledy, { wymagane: true, min: 0, kod: '0016' });
      if (miesiac !== undefined && kwota !== undefined) podstawy.push({ miesiac, kwota });
    });
    const poczatek = czytajDate(o.poczatekUbezpieczenia, sciezka(pole, 'poczatekUbezpieczenia'), bledy);
    if (forma === null || forma === 'brak-tytulu') {
      bledy[sciezka(pole, 'forma')] = '0006';
      return null;
    }
    const wynik = wyliczPodstawe({
      podstawy, forma, pelnyEtat: forma === 'umowa-o-prace' && pelnyEtat, miesiacPrawa: k.miesiacPrawa, katalog: k.katalog, dzien: k.dzien,
      ...(poczatek ? { poczatekUbezpieczenia: poczatek } : {}),
    });
    return 'kod' in wynik ? { komunikat: { kod: wynik.kod } } : { podstawa: wynik };
  }

  if (o.peselKontaZus !== undefined) {
    const pesel = sprawdzPesel(o.peselKontaZus);
    if (!pesel.ok) {
      bledy[sciezka(pole, 'peselKontaZus')] = pesel.kod;
      return null;
    }
    const kopia = odczytajKontoZus(pesel.pesel, k.teraz);
    if (kopia === null) return { komunikat: { kod: '0173' } };
    const rodzaj = forma ? RODZAJ_DLA_FORMY[forma] : undefined;
    const formaZKonta = forma ?? (FORMY_ZATRUDNIENIA.find((f) => kopia.tytuly.some((t) => t.rodzaj === RODZAJ_DLA_FORMY[f])) ?? null);
    if (formaZKonta === null || formaZKonta === 'brak-tytulu' || (rodzaj !== undefined && !kopia.tytuly.some((t) => t.rodzaj === rodzaj))) {
      return { komunikat: { kod: '0094' } };
    }
    const wynik = wyliczPodstaweZTytulow({
      tytuly: kopia.tytuly, forma: formaZKonta, pelnyEtat: formaZKonta === 'umowa-o-prace' && pelnyEtat,
      miesiacPrawa: k.miesiacPrawa, katalog: k.katalog, dzien: k.dzien,
    });
    return 'kod' in wynik ? { komunikat: { kod: wynik.kod } } : { podstawa: { ...wynik, zrodlo: 'konto-zus' } };
  }

  bledy[pole] = '0093';
  return null;
}

/** Miesiąc powstania prawa danych wejściowych z parametrami albo miesiąc dnia `dzien`. */
export function miesiacPrawaScenariusza(d: DaneWejscioweKalkulatora, par: ParametryScenariusza, dzien: DataISO): MiesiacISO {
  return miesiacPowstaniaPrawa(d, par) ?? miesiacZDaty(dzien);
}
