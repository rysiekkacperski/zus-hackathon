// Wyliczenie scenariusza zasiłku macierzyńskiego (kontrakt, sekcja 7.2). Właściciel: u09 (Silnik kalkulatora zasiłku macierzyńskiego).
// Funkcja jest czysta: te same dane wejściowe, podstawy, parametry, katalog i dzień dają zawsze ten sam wynik.
// Kolejność: zdarzenie i prawo rodziców, urlop macierzyński albo na warunkach urlopu macierzyńskiego (z przejęciem),
// uzupełniający urlop macierzyński, urlop ojcowski, części urlopu rodzicielskiego (domyślne, daty powrotu, łączenie z pracą),
// stawki wariantu, kwoty, harmonogram z podwyższeniem i wyrównaniem, daty powrotu, tygodnie i uprawnienia.
import { dodajDni, dodajLata, formatujDate, maxData, minData, miesiacZDaty, porownajDaty, roznicaDni } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import { harmonogramZPodstaw, sumyHarmonogramu, type OkresZPodstawa, type WyrownanieDoStu } from '@/domena/kalkulatory/harmonogram';
import {
  czyZgonPoOsmiuTygodniach,
  liczbaDzieciWZakresie,
  okresZasilkuPoStracie,
  ukladPrzyjecia,
  uzupelniajacyUrlop,
  wydluzeniePrzyLaczeniu,
  wymiarMacierzynskiego,
  wymiarNaWarunkach,
  wymiarRodzicielskiego,
} from '@/domena/kalkulatory/okresy';
import { koniecCzesci, uprawnieniaPoPowrocie, zastosujDatePowrotu } from '@/domena/kalkulatory/powrot';
import { prawoZFormy, ustalPrawoDoZasilku } from '@/domena/kalkulatory/prawo';
import { kwotaMiesieczna, kwotaZaDni, stawkaDzienna, stawkaDziennaLaczenia } from '@/domena/kalkulatory/rachunek';
import { RejestrRegul } from '@/domena/kalkulatory/slowniki';
import type {
  CzescUrlopuRodzicielskiego,
  DataISO,
  DaneWejscioweKalkulatora,
  FormaZatrudnienia,
  Grosze,
  IdPozycji,
  Katalog,
  KodKomunikatu,
  OkresScenariusza,
  ParametryScenariusza,
  PodstawaWymiaru,
  Procent,
  RodzicWRodzinie,
  WynikScenariusza,
} from '@/domena/typy';

type Rodzaj = OkresScenariusza['rodzaj'];
interface Odcinek {
  rodzic: RodzicWRodzinie;
  rodzaj: Rodzaj;
  od: DataISO;
  do: DataISO;
  stawka: Procent;
  pozaSumami?: boolean;
  /** Stawka okresu i wymiar pracy przy łączeniu urlopu z pracą. */
  laczenie?: { stawkaOkresu: Procent; wymiarPracy: Procent };
}
type Komunikat = WynikScenariusza['komunikaty'][number];

/** Układ scenariusza bez kwot: daty bazowe, prawo rodziców i domyślne części, z których korzystają arkusze kalkulatora. */
export interface UkladScenariusza {
  zdarzenie: 'porod' | 'przewidywany-porod' | 'przyjecie';
  dataZdarzenia: DataISO;
  prawo: Record<RodzicWRodzinie, boolean>;
  /** Pierwszy dzień, od którego drugi rodzic korzysta z urlopów po podjęciu ubezpieczenia po porodzie. */
  drugiRodzicOd?: DataISO;
  formy: Record<RodzicWRodzinie, { forma: FormaZatrudnienia | null; dobrowolne: boolean }>;
  /** Liczba dzieci, od której zależą wymiary (przy stracie dzieci pozostające przy życiu). */
  liczbaDzieci: number;
  strataBezDzieci: boolean;
  wymiarMacierzynskiego: number;
  /** Łączny wymiar urlopu rodzicielskiego obojga rodziców w tygodniach. */
  wymiarRodzicielskiego: number;
  nieprzenoszalna: number;
  macierzynski?: { od: DataISO; do: DataISO };
  /** Pierwszy dzień urlopu rodzicielskiego po urlopie macierzyńskim, uzupełniającym albo na warunkach. */
  poczatekRodzicielskiego: DataISO;
  /** Ostatni dzień, w którym może trwać urlop rodzicielski. */
  koniecWykorzystania: DataISO;
  /** Ostatni dzień urlopu ojcowskiego. */
  koniecOjcowskiego: DataISO;
  przyjecie?: { wiek: number; ostatniDzienPrzedWiekiem: DataISO; poWiekuGranicznym: boolean; przysposobienie: boolean };
  uzupelniajacy?: { rodzic: RodzicWRodzinie; od: DataISO; do: DataISO };
  ojcowski: { od: DataISO; do: DataISO }[];
  domyslneCzesci: CzescUrlopuRodzicielskiego[];
  brakDanych?: KodKomunikatu;
}

function pustyWynik(komunikaty: Komunikat[] = []): WynikScenariusza {
  return {
    okresy: [],
    harmonogram: [],
    sumy: { razem: 0 },
    datyPowrotu: {},
    tygodniePrzepadajace: 0,
    tygodnieNiewykorzystane: 0,
    uprawnieniaPoPowrocie: [],
    zastosowaneReguly: [],
    komunikaty,
  };
}

/** Dzień zdarzenia: data porodu, przewidywany termin porodu albo data przyjęcia dziecka. */
export function dataZdarzenia(d: DaneWejscioweKalkulatora): DataISO | null {
  switch (d.zdarzenie.wartosc) {
    case 'porod':
      return d.dataPorodu?.wartosc ?? null;
    case 'przewidywany-porod':
      return d.przewidywanyTerminPorodu?.wartosc ?? null;
    case 'przyjecie':
      return d.przyjecie?.wartosc.dataPrzyjecia ?? null;
  }
}

/** Czy wariant 81,5% jest dostępny: przed porodem zawsze, po porodzie albo przyjęciu do 21. dnia po dniu zdarzenia. */
export function czyWariant815Dostepny(d: DaneWejscioweKalkulatora, katalog: Katalog, dzis: DataISO): { dostepny: boolean; termin: DataISO | null } {
  const data = dataZdarzenia(d);
  if (data === null) return { dostepny: false, termin: null };
  const rejestr = new RejestrRegul(katalog, data);
  const termin = dodajDni(data, rejestr.wez('terminWariantu815'));
  if (d.zdarzenie.wartosc === 'przewidywany-porod') return { dostepny: true, termin };
  return { dostepny: porownajDaty(dzis, termin) <= 0, termin };
}

function formaDrugiego(d: DaneWejscioweKalkulatora, p: ParametryScenariusza): { forma: FormaZatrudnienia | null; dobrowolne: boolean } {
  const f = d.formaDrugiegoRodzica.wartosc;
  if (p.drugiRodzicPoPorodzie !== undefined && !prawoZFormy(f.forma, f.dobrowolne).przysluguje) {
    return { forma: p.drugiRodzicPoPorodzie.forma, dobrowolne: p.drugiRodzicPoPorodzie.forma !== 'umowa-o-prace' };
  }
  return { forma: f.forma === 'brak-drugiego-rodzica' ? null : f.forma, dobrowolne: f.dobrowolne };
}

/** Układ scenariusza bez kwot: prawo rodziców, okresy bazowe, urlop ojcowski i domyślne części urlopu rodzicielskiego. */
export function ukladScenariusza(
  d: DaneWejscioweKalkulatora,
  p: ParametryScenariusza,
  katalog: Katalog,
  rejestr?: RejestrRegul,
): UkladScenariusza | { brakDanych: KodKomunikatu } {
  const data = dataZdarzenia(d);
  if (data === null) return { brakDanych: d.zdarzenie.wartosc === 'przyjecie' ? '0088' : d.zdarzenie.wartosc === 'porod' ? '0018' : '0007' };
  const r = rejestr ?? new RejestrRegul(katalog, data);
  const zdarzenie = d.zdarzenie.wartosc;
  const prawoMatki = ustalPrawoDoZasilku(d, 'matka').przysluguje;
  const prawoDrugiegoWDniu = ustalPrawoDoZasilku(d, 'drugi-rodzic').przysluguje;
  const drugiRodzicOd =
    !prawoDrugiegoWDniu && zdarzenie !== 'przyjecie' && p.drugiRodzicPoPorodzie !== undefined
      ? p.drugiRodzicPoPorodzie.dataUbezpieczenia
      : undefined;
  const prawoDrugiego = prawoDrugiegoWDniu || drugiRodzicOd !== undefined;
  const fm = d.formaMatki.wartosc;
  const formy = {
    matka: { forma: fm.forma, dobrowolne: fm.dobrowolne },
    'drugi-rodzic': formaDrugiego(d, p),
  };
  const nieprzenoszalna = r.wez('nieprzenoszalna');
  const zaZyciem = d.zaZyciem.wartosc;
  const strata = zdarzenie === 'porod' ? d.strata?.wartosc : undefined;
  const liczbaWszystkich = d.liczbaDzieci.wartosc;
  const liczbaDzieci = strata !== undefined ? Math.max(0, liczbaWszystkich - strata.liczbaDzieci) : liczbaWszystkich;
  const strataBezDzieci = strata !== undefined && liczbaDzieci === 0;
  const koniecWykorzystania = `${Number(data.slice(0, 4)) + r.wez('wykorzystanieRodzicielskiego')}-12-31`;
  const koniecOjcowskiego = dodajDni(dodajLata(data, 1), -1);

  if (zdarzenie === 'przyjecie') {
    const pr = d.przyjecie!.wartosc;
    const u = ukladPrzyjecia({
      forma: pr.forma,
      dataPrzyjecia: pr.dataPrzyjecia,
      dataUrodzeniaDziecka: pr.dataUrodzeniaDziecka,
      odroczenie: pr.odroczenie,
      liczbaDzieci: liczbaWszystkich,
      zaZyciem,
      poczatek: p.poczatekNaWarunkach,
      katalog,
      rejestr: r,
    });
    if (u.rodzaj !== 'uklad') return { brakDanych: u.kod };
    const poczatekRodzicielskiego = dodajDni(u.naWarunkach.do, 1);
    const L = u.wymiarRodzicielskiego;
    const ojcowski =
      pr.forma === 'przysposobienie' && prawoDrugiego
        ? [{ od: p.ojcowski.czesci[0] ?? pr.dataPrzyjecia, do: dodajDni(p.ojcowski.czesci[0] ?? pr.dataPrzyjecia, r.wez('ojcowskiDni') - 1) }]
        : [];
    const domyslneCzesci: CzescUrlopuRodzicielskiego[] = [];
    if (prawoMatki) {
      domyslneCzesci.push({ rodzic: 'matka', od: poczatekRodzicielskiego, tygodnie: L - nieprzenoszalna });
      if (prawoDrugiego) {
        domyslneCzesci.push({ rodzic: 'drugi-rodzic', od: dodajDni(poczatekRodzicielskiego, 7 * (L - nieprzenoszalna)), tygodnie: nieprzenoszalna });
      }
    } else if (prawoDrugiego) {
      domyslneCzesci.push({ rodzic: 'drugi-rodzic', od: poczatekRodzicielskiego, tygodnie: L - nieprzenoszalna });
    }
    return {
      zdarzenie,
      dataZdarzenia: data,
      prawo: { matka: prawoMatki, 'drugi-rodzic': prawoDrugiego },
      formy,
      liczbaDzieci: liczbaWszystkich,
      strataBezDzieci: false,
      wymiarMacierzynskiego: wymiarNaWarunkach(liczbaWszystkich, katalog, data, r),
      wymiarRodzicielskiego: L,
      nieprzenoszalna,
      macierzynski: u.naWarunkach,
      poczatekRodzicielskiego,
      koniecWykorzystania: u.poWiekuGranicznym ? '9999-12-31' : u.ostatniDzienPrzedWiekiem,
      koniecOjcowskiego,
      przyjecie: { wiek: u.wiek, ostatniDzienPrzedWiekiem: u.ostatniDzienPrzedWiekiem, poWiekuGranicznym: u.poWiekuGranicznym, przysposobienie: pr.forma === 'przysposobienie' },
      ojcowski,
      domyslneCzesci,
    };
  }

  const W = wymiarMacierzynskiego(liczbaDzieciWZakresie(Math.max(1, liczbaDzieci)), katalog, data, r);
  const L = wymiarRodzicielskiego(Math.max(1, liczbaDzieci), zaZyciem, katalog, data, r);
  const k = strata !== undefined ? 0 : Math.min(6, Math.max(0, Math.trunc(p.tygodniePrzedPorodem)));
  const od = dodajDni(data, -7 * k);
  let koniecMac = dodajDni(od, 7 * W - 1);
  if (strataBezDzieci) {
    const okres = okresZasilkuPoStracie(data, strata.rodzaj, strata.dataZgonu, katalog);
    const pozno = strata.rodzaj === 'zgon-dziecka' && strata.dataZgonu !== undefined && czyZgonPoOsmiuTygodniach(data, strata.dataZgonu, katalog);
    if (!pozno) koniecMac = okres.do;
  } else if (strata?.dataZgonu !== undefined) {
    koniecMac = maxData(koniecMac, dodajDni(strata.dataZgonu, r.wez('urlopPoStracieDni')));
  }
  const macierzynski = { od, do: koniecMac };

  let uzupelniajacy: UkladScenariusza['uzupelniajacy'];
  if (zdarzenie === 'porod' && d.wczesniactwo !== undefined && !strataBezDzieci) {
    const w = d.wczesniactwo.wartosc;
    const tygodnie = uzupelniajacyUrlop(w.tydzienCiazy, w.masaG, w.dniPobytu).tygodnie;
    const kandydat = p.rodzicUzupelniajacego;
    const rodzic: RodzicWRodzinie | null =
      kandydat === 'drugi-rodzic' && prawoDrugiegoWDniu ? 'drugi-rodzic' : prawoMatki ? 'matka' : prawoDrugiegoWDniu ? 'drugi-rodzic' : null;
    if (tygodnie > 0 && rodzic !== null) {
      r.wez(w.tydzienCiazy <= 27 || w.masaG <= 1000 ? 'uzupelniajacyDo28' : 'uzupelniajacyPozostale');
      const odU = dodajDni(koniecMac, 1);
      uzupelniajacy = { rodzic, od: odU, do: dodajDni(odU, 7 * tygodnie - 1) };
    }
  }
  const poczatekRodzicielskiego = dodajDni(uzupelniajacy?.do ?? koniecMac, 1);

  const ojcowski: { od: DataISO; do: DataISO }[] = [];
  if (prawoDrugiego && !strataBezDzieci && p.ojcowski.wymiar !== 'brak') {
    const dniOjcowskiego = r.wez('ojcowskiDni');
    const min = drugiRodzicOd ?? data;
    const czesci = p.ojcowski.czesci.length > 0 ? p.ojcowski.czesci : [min];
    if (p.ojcowski.wymiar === '7-dni') {
      ojcowski.push({ od: czesci[0], do: dodajDni(czesci[0], 6) });
    } else if (czesci.length >= 2) {
      for (const c of czesci.slice(0, 2)) ojcowski.push({ od: c, do: dodajDni(c, dniOjcowskiego / 2 - 1) });
    } else {
      const pelny = dodajDni(czesci[0], dniOjcowskiego - 1);
      ojcowski.push({ od: czesci[0], do: porownajDaty(pelny, koniecOjcowskiego) <= 0 ? pelny : dodajDni(czesci[0], dniOjcowskiego / 2 - 1) });
    }
  }

  const domyslneCzesci: CzescUrlopuRodzicielskiego[] = [];
  if (!strataBezDzieci) {
    if (prawoMatki) {
      domyslneCzesci.push({ rodzic: 'matka', od: poczatekRodzicielskiego, tygodnie: L - nieprzenoszalna });
      if (prawoDrugiego) {
        const odD = dodajDni(poczatekRodzicielskiego, 7 * (L - nieprzenoszalna));
        domyslneCzesci.push({ rodzic: 'drugi-rodzic', od: drugiRodzicOd ? maxData(odD, drugiRodzicOd) : odD, tygodnie: nieprzenoszalna });
      }
    } else if (prawoDrugiego) {
      const poOjcowskim = ojcowski.length > 0 ? dodajDni(ojcowski.map((o) => o.do).reduce((a, b) => maxData(a, b)), 1) : (drugiRodzicOd ?? data);
      domyslneCzesci.push({ rodzic: 'drugi-rodzic', od: poOjcowskim, tygodnie: L - nieprzenoszalna });
    }
  }

  return {
    zdarzenie,
    dataZdarzenia: data,
    prawo: { matka: prawoMatki, 'drugi-rodzic': prawoDrugiego },
    ...(drugiRodzicOd !== undefined ? { drugiRodzicOd } : {}),
    formy,
    liczbaDzieci,
    strataBezDzieci,
    wymiarMacierzynskiego: W,
    wymiarRodzicielskiego: L,
    nieprzenoszalna,
    macierzynski,
    poczatekRodzicielskiego,
    koniecWykorzystania,
    koniecOjcowskiego,
    ...(uzupelniajacy !== undefined ? { uzupelniajacy } : {}),
    ojcowski,
    domyslneCzesci,
  };
}

/** Najwięcej tygodni urlopu rodzicielskiego rodzica: min(L − 9, L − tygodnie drugiego rodzica). */
export function maksTygodniRodzica(u: UkladScenariusza, czesci: CzescUrlopuRodzicielskiego[], rodzic: RodzicWRodzinie): number {
  const drugiego = czesci.filter((c) => c.rodzic !== rodzic).reduce((s, c) => s + c.tygodnie, 0);
  return Math.max(0, Math.min(u.wymiarRodzicielskiego - u.nieprzenoszalna, u.wymiarRodzicielskiego - drugiego));
}

/** Dzień po ostatnim dniu urlopu rodzica przed urlopem rodzicielskim (macierzyński, uzupełniający, na warunkach, ojcowski). */
export function poczatekBezCzesci(u: UkladScenariusza, rodzic: RodzicWRodzinie): DataISO {
  if (rodzic === 'matka') return u.poczatekRodzicielskiego;
  const konce = [...u.ojcowski.map((o) => o.do), ...(u.uzupelniajacy?.rodzic === 'drugi-rodzic' ? [u.uzupelniajacy.do] : [])];
  return konce.length > 0 ? dodajDni(konce.reduce((a, b) => maxData(a, b)), 1) : u.poczatekRodzicielskiego;
}

/** Części urlopu rodzicielskiego scenariusza: z parametrów albo domyślne, po zmianach dat powrotu. */
export function czesciScenariusza(u: UkladScenariusza, p: ParametryScenariusza): { czesci: CzescUrlopuRodzicielskiego[]; komunikaty: Komunikat[] } {
  let czesci = (p.czesciRodzicielskiego.length > 0 ? p.czesciRodzicielskiego : u.domyslneCzesci).filter((c) => u.prawo[c.rodzic] && c.tygodnie > 0);
  const komunikaty: Komunikat[] = [];
  for (const rodzic of ['matka', 'drugi-rodzic'] as const) {
    const data = p.datyPowrotu[rodzic];
    if (data === undefined || !u.prawo[rodzic]) continue;
    const zmiana = zastosujDatePowrotu(czesci, rodzic, data, poczatekBezCzesci(u, rodzic), maksTygodniRodzica(u, czesci, rodzic));
    czesci = zmiana.czesci;
    if (zmiana.komunikat) komunikaty.push(zmiana.komunikat);
  }
  return { czesci, komunikaty };
}

function podzielOdcinek(o: Odcinek, granica: DataISO): [Odcinek | null, Odcinek | null] {
  if (porownajDaty(granica, o.od) <= 0) return [null, o];
  if (porownajDaty(granica, o.do) > 0) return [o, null];
  return [{ ...o, do: dodajDni(granica, -1) }, { ...o, od: granica }];
}

/** Okresy, kwoty, harmonogram i daty powrotu scenariusza. */
export function wyliczScenariusz(
  d: DaneWejscioweKalkulatora,
  podstawy: Partial<Record<RodzicWRodzinie, PodstawaWymiaru>>,
  p: ParametryScenariusza,
  katalog: Katalog,
  dzis: DataISO,
): WynikScenariusza {
  const data = dataZdarzenia(d);
  if (data === null) return pustyWynik();
  const r = new RejestrRegul(katalog, data);
  const u = ukladScenariusza(d, p, katalog, r);
  if (!('zdarzenie' in u)) return pustyWynik([{ kod: u.brakDanych }]);
  const komunikaty: Komunikat[] = [];
  const zdarzenie = u.zdarzenie;
  const przyjecie = zdarzenie === 'przyjecie';

  for (const rodzic of ['matka', 'drugi-rodzic'] as const) {
    const pr = ustalPrawoDoZasilku(d, rodzic);
    if (!pr.przysluguje && pr.kod !== undefined && !(rodzic === 'drugi-rodzic' && u.drugiRodzicOd !== undefined)) {
      komunikaty.push({ kod: pr.kod, parametry: { rodzic } });
    }
  }

  // Wariant zasiłku: 81,5% dostępny przed porodem albo do 21. dnia po dniu porodu albo przyjęcia.
  const { dostepny } = czyWariant815Dostepny(d, katalog, dzis);
  if (!u.strataBezDzieci) {
    r.wez('terminWariantu815');
    if (!dostepny) komunikaty.push({ kod: przyjecie ? '0165' : '0038' });
  }
  const wariant: '81-5' | '100-70' = p.wariant === '81-5' && dostepny && !u.strataBezDzieci ? '81-5' : '100-70';
  const s100 = () => r.wez('stawka100');
  const s70 = () => r.wez('stawka70');
  const s815 = () => r.wez('stawka815');
  const stawkaMacierzynska = () => (wariant === '81-5' ? s815() : s100());

  const odcinki: Odcinek[] = [];

  // Urlop macierzyński albo na warunkach urlopu macierzyńskiego, z przejęciem przez drugiego rodzica.
  const mac = u.macierzynski!;
  const rodzajMac: Rodzaj = przyjecie ? 'na-warunkach-macierzynskiego' : 'macierzynski';
  const stawkaMacMatki = u.strataBezDzieci ? s100() : stawkaMacierzynska();
  const przejecie = !przyjecie && u.prawo['drugi-rodzic'] && !u.strataBezDzieci ? p.przejecie : undefined;
  if (u.prawo.matka) {
    if (przejecie !== undefined && porownajDaty(przejecie.data, mac.do) <= 0) {
      const koniecPrzejecia = przejecie.koniecPobytuMatki !== undefined ? minData(przejecie.koniecPobytuMatki, mac.do) : mac.do;
      if (porownajDaty(przejecie.data, mac.od) > 0) {
        odcinki.push({ rodzic: 'matka', rodzaj: rodzajMac, od: mac.od, do: dodajDni(przejecie.data, -1), stawka: stawkaMacMatki });
      }
      odcinki.push({ rodzic: 'drugi-rodzic', rodzaj: 'przejety-macierzynski', od: przejecie.data, do: koniecPrzejecia, stawka: stawkaMacierzynska() });
      if (porownajDaty(koniecPrzejecia, mac.do) < 0) {
        odcinki.push({ rodzic: 'matka', rodzaj: rodzajMac, od: dodajDni(koniecPrzejecia, 1), do: mac.do, stawka: stawkaMacMatki });
      }
    } else {
      odcinki.push({ rodzic: 'matka', rodzaj: rodzajMac, od: mac.od, do: mac.do, stawka: stawkaMacMatki });
    }
  } else if (przejecie !== undefined && porownajDaty(przejecie.data, mac.do) <= 0) {
    const koniec = przejecie.koniecPobytuMatki !== undefined ? minData(przejecie.koniecPobytuMatki, mac.do) : mac.do;
    odcinki.push({ rodzic: 'drugi-rodzic', rodzaj: 'przejety-macierzynski', od: maxData(przejecie.data, data), do: koniec, stawka: stawkaMacierzynska() });
  }
  if (u.strataBezDzieci) komunikaty.push({ kod: '0166' });

  if (u.uzupelniajacy !== undefined) {
    odcinki.push({ ...u.uzupelniajacy, rodzaj: 'uzupelniajacy', stawka: s100() });
  }
  for (const o of u.ojcowski) {
    odcinki.push({ rodzic: 'drugi-rodzic', rodzaj: 'ojcowski', od: o.od, do: o.do, stawka: s100(), pozaSumami: przyjecie });
  }
  if (u.ojcowski.length > 0) r.wez('ojcowskiDni');

  // Części urlopu rodzicielskiego.
  const { czesci: czesciPoPowrocie, komunikaty: kPowrotu } = czesciScenariusza(u, p);
  komunikaty.push(...kPowrotu);
  let czesci = czesciPoPowrocie.map((c, i) => ({ ...c, indeks: i }));

  // Przy przyjęciu urlop rodzicielski w pełnym wymiarze kończy się najpóźniej dzień przed wiekiem granicznym.
  if (u.przyjecie !== undefined && !u.przyjecie.poWiekuGranicznym) {
    let obciete = false;
    czesci = czesci
      .map((c) => {
        const maks = Math.floor((roznicaDni(c.od, u.przyjecie!.ostatniDzienPrzedWiekiem) + 1) / 7);
        if (maks < c.tygodnie) obciete = true;
        return { ...c, tygodnie: Math.max(0, Math.min(c.tygodnie, maks)) };
      })
      .filter((c) => c.tygodnie > 0);
    if (obciete) komunikaty.push({ kod: '0172', parametry: { wiek: String(u.przyjecie.wiek) } });
  }

  // Łączenie z pracą: wydłużenie po końcu części i przesunięcie późniejszych części obojga rodziców.
  const laczenie = p.laczenie;
  let wydluzenie: { indeks: number; od: DataISO; do: DataISO; wymiarPracy: number; tygodnie: number } | null = null;
  if (laczenie !== undefined) {
    const czesc = czesci.find((c) => c.indeks === laczenie.indeksCzesci);
    if (czesc !== undefined && u.formy[czesc.rodzic].forma === 'umowa-o-prace' && laczenie.wymiarPracy > 0) {
      r.wez('laczenieWymiarPracy');
      const t = Math.min(laczenie.tygodnie, czesc.tygodnie);
      const dni = wydluzeniePrzyLaczeniu(t * 7, laczenie.wymiarPracy);
      const koniec = koniecCzesci(czesc);
      czesci = czesci.map((c) => (c !== czesc && porownajDaty(c.od, koniec) > 0 ? { ...c, od: dodajDni(c.od, dni) } : c));
      wydluzenie = { indeks: czesc.indeks, od: dodajDni(koniec, 1), do: dodajDni(koniec, dni), wymiarPracy: laczenie.wymiarPracy, tygodnie: t };
    }
  }

  // Stawki części: drugi rodzic w wariancie 81,5% za pierwsze 9 tygodni 70%, ponad nie 81,5%.
  const posortowane = [...czesci].sort((a, b) => porownajDaty(a.od, b.od));
  const limit70 = u.nieprzenoszalna * 7;

  // Wyrównanie do 100% w wariancie 81,5%: po porodzie, gdy żaden dzień urlopu rodzicielskiego matki ani tygodni drugiego
  // rodzica ponad jego 9 tygodni nie przypada przed pierwszymi urodzinami dziecka; po przyjęciu, gdy żaden dzień urlopu
  // rodzicielskiego rodzica, który przyjął dziecko, nie przypada przed pierwszymi urodzinami dziecka.
  const dataUrodzeniaDziecka = przyjecie ? d.przyjecie?.wartosc.dataUrodzeniaDziecka : data;
  const pierwszeUrodziny = dodajLata(dataUrodzeniaDziecka ?? data, 1);
  const przedUrodzinami = (od: DataISO) => porownajDaty(od, pierwszeUrodziny) < 0;
  let dniPonad = 0;
  let ponadPrzedUrodzinami = false;
  for (const c of posortowane) {
    if (c.rodzic !== 'drugi-rodzic') continue;
    const dni = roznicaDni(c.od, koniecCzesci(c)) + 1;
    const przy70 = Math.min(Math.max(0, limit70 - dniPonad), dni);
    dniPonad += przy70;
    if (przy70 < dni && przedUrodzinami(dodajDni(c.od, przy70))) ponadPrzedUrodzinami = true;
  }
  const rodzicielskiMatkiPrzedUrodzinami = czesci.some((c) => c.rodzic === 'matka' && przedUrodzinami(c.od));
  const wyrownanie =
    wariant === '81-5' &&
    u.prawo.matka &&
    !rodzicielskiMatkiPrzedUrodzinami &&
    (przyjecie || !ponadPrzedUrodzinami);
  if (wyrownanie) komunikaty.push({ kod: przyjecie ? '0267' : '0174' });
  let dniDrugiegoPrzy70 = 0;
  for (const c of posortowane) {
    const do_ = koniecCzesci(c);
    const bazowy: Odcinek = { rodzic: c.rodzic, rodzaj: 'rodzicielski', od: c.od, do: do_, stawka: 0 };
    let kawalki: Odcinek[];
    if (c.rodzic === 'matka') {
      kawalki = [{ ...bazowy, stawka: wariant === '81-5' && !wyrownanie ? s815() : s70() }];
    } else if (wariant === '81-5') {
      const zostalo = Math.max(0, limit70 - dniDrugiegoPrzy70);
      const dni = roznicaDni(c.od, do_) + 1;
      const przy70 = Math.min(zostalo, dni);
      dniDrugiegoPrzy70 += przy70;
      const stawka70 = r.wez('stawka815DrugiRodzic');
      kawalki = [];
      if (przy70 > 0) kawalki.push({ ...bazowy, do: dodajDni(c.od, przy70 - 1), stawka: stawka70 });
      if (przy70 < dni) kawalki.push({ ...bazowy, od: dodajDni(c.od, przy70), stawka: wyrownanie ? s70() : s815() });
    } else {
      kawalki = [{ ...bazowy, stawka: s70() }];
    }
    if (wydluzenie !== null && wydluzenie.indeks === c.indeks) {
      const granica = dodajDni(c.od, 7 * wydluzenie.tygodnie);
      const mnoznik = (100 - wydluzenie.wymiarPracy) / 100;
      const wynik: Odcinek[] = [];
      for (const k of kawalki) {
        const [przed, po] = podzielOdcinek(k, granica);
        if (przed) {
          wynik.push({
            ...przed,
            rodzaj: 'laczenie-z-praca',
            stawka: przed.stawka * mnoznik,
            laczenie: { stawkaOkresu: przed.stawka, wymiarPracy: wydluzenie.wymiarPracy },
          });
        }
        if (po) wynik.push(po);
      }
      // W okresie wydłużenia rodzic korzysta z urlopu rodzicielskiego w pełnym wymiarze, więc zasiłek ma pełną stawkę okresu.
      const ostatniaStawka = kawalki[kawalki.length - 1].stawka;
      if (porownajDaty(wydluzenie.od, wydluzenie.do) <= 0) {
        wynik.push({ rodzic: c.rodzic, rodzaj: 'wydluzenie-rodzicielskiego', od: wydluzenie.od, do: wydluzenie.do, stawka: ostatniaStawka });
      }
      kawalki = wynik;
    }
    odcinki.push(...kawalki);
  }

  // Zgon dziecka po upływie 8 tygodni życia: urlop w trakcie kończy się 7. dnia po dniu zgonu, kolejnych urlopów brak.
  let koncowe = odcinki;
  const strata = zdarzenie === 'porod' ? d.strata?.wartosc : undefined;
  if (u.strataBezDzieci && strata?.dataZgonu !== undefined) {
    const koniec = dodajDni(strata.dataZgonu, r.wez('urlopPoStracieDni'));
    koncowe = odcinki
      .filter((o) => porownajDaty(o.od, koniec) <= 0)
      .map((o) => (porownajDaty(o.do, koniec) > 0 ? { ...o, do: koniec } : o));
  }
  if (u.strataBezDzieci) {
    r.wez('urlopPoStracieTygodnie');
    r.wez('urlopPoStracieDni');
  }

  const podstawaRodzica = (rodzic: RodzicWRodzinie): Grosze => podstawy[rodzic]?.kwota ?? 0;
  const okresy: (OkresZPodstawa & { pozaSumami?: boolean })[] = koncowe
    .sort((a, b) => (a.rodzic === b.rodzic ? porownajDaty(a.od, b.od) : a.rodzic === 'matka' ? -1 : 1))
    .map((o) => {
      const dni = roznicaDni(o.od, o.do) + 1;
      const podstawa = podstawaRodzica(o.rodzic);
      const stawka = Math.round(o.stawka * 100) / 100;
      const dzienna = o.laczenie
        ? stawkaDziennaLaczenia(podstawa, o.laczenie.stawkaOkresu, o.laczenie.wymiarPracy)
        : stawkaDzienna(podstawa, stawka);
      return {
        rodzic: o.rodzic,
        rodzaj: o.rodzaj,
        od: o.od,
        do: o.do,
        dni,
        stawka,
        miesiecznie: kwotaMiesieczna(podstawa, stawka),
        zaOkres: dzienna * dni,
        podstawa,
        dzienna,
        ...(o.pozaSumami ? { pozaSumami: true } : {}),
      };
    });

  // Wyrównanie zasiłku za urlop macierzyński do 100%, w miesiącu po końcu urlopu macierzyńskiego matki.
  const wyrownania: WyrownanieDoStu[] = [];
  if (wyrownanie) {
    const macMatki = okresy.filter(
      (o) => o.rodzic === 'matka' && (o.rodzaj === 'macierzynski' || o.rodzaj === 'na-warunkach-macierzynskiego'),
    );
    const roznica = macMatki.reduce((s, o) => s + kwotaZaDni(o.podstawa, s100(), o.dni) - o.zaOkres, 0);
    if (roznica > 0 && macMatki.length > 0) {
      const koniec = macMatki.map((o) => o.do).reduce((a, b) => maxData(a, b));
      wyrownania.push({ rodzic: 'matka', miesiac: miesiacZDaty(dodajDni(koniec, 1)), kwota: roznica });
    }
  }

  r.wez('swiadczenieRodzicielskie');
  const h = harmonogramZPodstaw(okresy.filter((o) => !o.pozaSumami), katalog, data, wyrownania);
  const sumy = sumyHarmonogramu(h);

  // Daty powrotu do pracy: dzień po ostatnim dniu ostatniego urlopu rodzica z zasiłkiem.
  const datyPowrotu: WynikScenariusza['datyPowrotu'] = {};
  for (const rodzic of ['matka', 'drugi-rodzic'] as const) {
    const wlasne = okresy.filter((o) => o.rodzic === rodzic);
    if (wlasne.length > 0) datyPowrotu[rodzic] = dodajDni(wlasne.map((o) => o.do).reduce((a, b) => maxData(a, b)), 1);
  }

  const tygodnie = (rodzic: RodzicWRodzinie) => czesci.filter((c) => c.rodzic === rodzic).reduce((s, c) => s + c.tygodnie, 0);
  const tygM = tygodnie('matka');
  const tygD = tygodnie('drugi-rodzic');
  const tygodniePrzepadajace = u.strataBezDzieci ? 0 : Math.max(0, u.nieprzenoszalna - tygD) + Math.max(0, u.nieprzenoszalna - tygM);
  const tygodnieNiewykorzystane = u.strataBezDzieci ? 0 : Math.max(0, u.wymiarRodzicielskiego - tygM - tygD - tygodniePrzepadajace);

  const uprawnienia = new Set<IdPozycji>();
  for (const rodzic of ['matka', 'drugi-rodzic'] as const) {
    if (!u.prawo[rodzic]) continue;
    for (const id of uprawnieniaPoPowrocie(rodzic, u.formy[rodzic].forma, u.formy[rodzic].dobrowolne)) {
      if (!(id === 'K20' && u.strataBezDzieci)) uprawnienia.add(id);
    }
  }

  // Reguły podstawy wymiaru z konta ZUS.
  for (const podstawa of Object.values(podstawy)) {
    if (podstawa?.zrodlo !== 'konto-zus') continue;
    r.wez('pomniejszenie');
    if (podstawa.skladniki?.some((s) => s.opis === 'minimum-pracownika')) r.wez('minimalnaPodstawaPracownika');
    if (podstawa.skladniki?.some((s) => s.opis === 'najnizsza-podstawa-dzialalnosci')) r.wez('najnizszaPodstawaDzialalnosci');
  }

  return {
    okresy: okresy.map((o) => ({
      rodzic: o.rodzic,
      rodzaj: o.rodzaj,
      od: o.od,
      do: o.do,
      dni: o.dni,
      stawka: o.stawka,
      miesiecznie: o.miesiecznie,
      zaOkres: o.zaOkres,
    })),
    harmonogram: h,
    sumy,
    datyPowrotu,
    tygodniePrzepadajace,
    tygodnieNiewykorzystane,
    uprawnieniaPoPowrocie: [...uprawnienia].sort(),
    zastosowaneReguly: r.lista(),
    komunikaty,
  };
}

/**
 * Porównanie wypłat po zmianie daty powrotu matki albo rodzica, który przyjął dziecko, w wariancie 81,5%: suma w wariancie
 * 81,5% i w wariancie 100% i 70% dla tych samych okresów. Komunikat 0246, gdy wariant 81,5% daje mniej.
 */
export function porownanieWariantowPoPowrocie(
  d: DaneWejscioweKalkulatora,
  podstawy: Partial<Record<RodzicWRodzinie, PodstawaWymiaru>>,
  p: ParametryScenariusza,
  katalog: Katalog,
  dzis: DataISO,
  rodzic: RodzicWRodzinie = 'matka',
): { suma815: Grosze; suma100i70: Grosze; komunikat?: { kod: KodKomunikatu; parametry: Record<string, string> } } | null {
  if (p.wariant !== '81-5') return null;
  const w815 = wyliczScenariusz(d, podstawy, p, katalog, dzis);
  const w100 = wyliczScenariusz(d, podstawy, { ...p, wariant: '100-70' }, katalog, dzis);
  const suma815 = w815.sumy[rodzic] ?? 0;
  const suma100i70 = w100.sumy[rodzic] ?? 0;
  const powrot = w815.datyPowrotu[rodzic];
  if (suma815 < suma100i70 && powrot !== undefined) {
    return {
      suma815,
      suma100i70,
      komunikat: { kod: '0246', parametry: { data: formatujDate(powrot), kwota: formatujKwote(suma100i70 - suma815) } },
    };
  }
  return { suma815, suma100i70 };
}
