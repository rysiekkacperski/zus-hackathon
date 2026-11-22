// Wyliczenie scenariusza zasiłku macierzyńskiego (kontrakt, sekcja 7.2). Właściciel: u09 (Silnik kalkulatora zasiłku macierzyńskiego).
// Funkcja jest czysta: te same dane wejściowe, podstawy, parametry, katalog i dzień dają zawsze ten sam wynik.
// Kolejność: zdarzenie i prawo rodziców, urlop macierzyński albo na warunkach urlopu macierzyńskiego (z przejęciem),
// uzupełniający urlop macierzyński, urlop ojcowski, części urlopu rodzicielskiego (domyślne, daty powrotu, łączenie z pracą),
// stawki wariantu, kwoty, harmonogram z podwyższeniem i wyrównaniem, daty powrotu, tygodnie i uprawnienia.
import { dodajDni, dodajLata, dodajMiesiace, formatujDate, maxData, minData, miesiacZDaty, porownajDaty, roznicaDni } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import { harmonogramZPodstaw, sumyHarmonogramu, type OkresZPodstawa, type WyrownanieDoStu } from '@/domena/kalkulatory/harmonogram';
import {
  czyZgonPoOsmiuTygodniach,
  liczbaDzieciWZakresie,
  okresZasilkuPoStracie,
  progiUzupelniajacego,
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
import { podstawaPrzedMinimum, podstawyWOkresie } from '@/domena/kalkulatory/podstawa';
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
  LaczenieZPraca,
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
  przyjecie?: {
    wiek: number;
    ostatniDzienPrzedWiekiem: DataISO;
    poWiekuGranicznym: boolean;
    przysposobienie: boolean;
    liczbaWliczonych: number;
    liczbaWszystkich: number;
    zmianaWymiaru?: { data: DataISO; wiek: number; wymiar: number; wymiarPrzed: number };
  };
  uzupelniajacy?: { rodzic: RodzicWRodzinie; od: DataISO; do: DataISO };
  /** Od 37. tygodnia ciąży pobyt dziecka w szpitalu poza oknem od 5. do 28. dnia życia albo krótszy niż 2 dni. */
  uzupelniajacyPozaOknem?: boolean;
  /** Pierwszy dzień, od którego drugi rodzic może zacząć urlop ojcowski. */
  poczatekOjcowskiego: DataISO;
  ojcowski: { od: DataISO; do: DataISO }[];
  domyslneCzesci: CzescUrlopuRodzicielskiego[];
  /** Najwięcej części urlopu rodzicielskiego (5). */
  maksCzesci: number;
  brakDanych?: KodKomunikatu;
}

/** Najwcześniejszy pierwszy dzień części urlopu rodzicielskiego rodzica, tak jak w układzie domyślnym. */
export function najwczesniejszaCzesc(u: UkladScenariusza, rodzic: RodzicWRodzinie): DataISO {
  if (rodzic === 'matka' || u.prawo.matka) {
    return rodzic === 'drugi-rodzic' && u.drugiRodzicOd !== undefined ? maxData(u.drugiRodzicOd, u.poczatekRodzicielskiego) : u.poczatekRodzicielskiego;
  }
  // Rodzic bez matki z prawem do zasiłku zaczyna urlop rodzicielski po urlopie ojcowskim albo od dnia zdarzenia.
  return u.drugiRodzicOd ?? (u.zdarzenie === 'przyjecie' ? u.poczatekRodzicielskiego : u.dataZdarzenia);
}

/** Urlop ojcowski: 14 dni jednorazowo albo w 2 częściach po 7 dni, przycięty do 7 dni, gdy 14 dni wykracza poza okres. */
function okresyOjcowskiego(p: ParametryScenariusza, min: DataISO, koniec: DataISO, dniOjcowskiego: number): { od: DataISO; do: DataISO }[] {
  const wynik: { od: DataISO; do: DataISO }[] = [];
  if (p.ojcowski.wymiar === 'brak') return wynik;
  const czesci = p.ojcowski.czesci.filter((c) => c !== '').length > 0 ? p.ojcowski.czesci.filter((c) => c !== '') : [min];
  if (p.ojcowski.wymiar === '7-dni') {
    wynik.push({ od: czesci[0], do: dodajDni(czesci[0], 6) });
  } else if (czesci.length >= 2) {
    for (const c of czesci.slice(0, 2)) wynik.push({ od: c, do: dodajDni(c, dniOjcowskiego / 2 - 1) });
  } else {
    const pelny = dodajDni(czesci[0], dniOjcowskiego - 1);
    wynik.push({ od: czesci[0], do: porownajDaty(pelny, koniec) <= 0 ? pelny : dodajDni(czesci[0], dniOjcowskiego / 2 - 1) });
  }
  return wynik;
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

  const maksCzesci = r.wez('liczbaCzesci');

  if (zdarzenie === 'przyjecie') {
    const pr = d.przyjecie!.wartosc;
    const u = ukladPrzyjecia({
      forma: pr.forma,
      dataPrzyjecia: pr.dataPrzyjecia,
      dataUrodzeniaDziecka: pr.dataUrodzeniaDziecka,
      ...(pr.datyUrodzeniaDzieci !== undefined ? { datyUrodzeniaDzieci: pr.datyUrodzeniaDzieci } : {}),
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
    const przysposobienie = pr.forma === 'przysposobienie';
    // Urlop ojcowski przy przysposobieniu: w ciągu 12 miesięcy od dnia uprawomocnienia postanowienia o przysposobieniu
    // i najpóźniej w dniu przed ukończeniem przez dziecko 14 lat (art. 182^3 § 1 pkt 2 Kodeksu pracy). Bez daty
    // uprawomocnienia kalkulator liczy 12 miesięcy od dnia przyjęcia dziecka.
    const koniecOjcowskiegoPrzyjecia = minData(
      dodajDni(dodajMiesiace(pr.dataUprawomocnienia ?? pr.dataPrzyjecia, r.wez('ojcowskiMiesiace')), -1),
      dodajDni(dodajLata(u.dataUrodzeniaNajmlodszego, r.wez('wiekPrzysposobienie')), -1),
    );
    const ojcowski =
      przysposobienie && prawoDrugiego
        ? okresyOjcowskiego(p, pr.dataPrzyjecia, koniecOjcowskiegoPrzyjecia, r.wez('ojcowskiDni'))
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
      liczbaDzieci: u.liczbaWliczonych,
      strataBezDzieci: false,
      wymiarMacierzynskiego: wymiarNaWarunkach(u.liczbaWliczonych, katalog, data, r),
      wymiarRodzicielskiego: L,
      nieprzenoszalna,
      macierzynski: u.naWarunkach,
      poczatekRodzicielskiego,
      koniecWykorzystania: u.koniecRodzicielskiego,
      koniecOjcowskiego: koniecOjcowskiegoPrzyjecia,
      przyjecie: {
        wiek: u.wiek,
        ostatniDzienPrzedWiekiem: u.ostatniDzienPrzedWiekiem,
        poWiekuGranicznym: u.poWiekuGranicznym,
        przysposobienie,
        liczbaWliczonych: u.liczbaWliczonych,
        liczbaWszystkich: u.liczbaWszystkich,
        ...(u.zmianaWymiaru !== undefined ? { zmianaWymiaru: u.zmianaWymiaru } : {}),
      },
      poczatekOjcowskiego: pr.dataPrzyjecia,
      ojcowski,
      domyslneCzesci,
      maksCzesci,
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
  let uzupelniajacyPozaOknem = false;
  if (zdarzenie === 'porod' && d.wczesniactwo !== undefined && !strataBezDzieci) {
    const w = d.wczesniactwo.wartosc;
    const wynikU = uzupelniajacyUrlop(w.tydzienCiazy, w.masaG, w.dniPobytu, {
      ...(w.pierwszyDzienPobytu !== undefined ? { pierwszyDzienPobytu: w.pierwszyDzienPobytu } : {}),
      progi: progiUzupelniajacego(katalog, data),
    });
    if (wynikU.pozaOknemPobytu) uzupelniajacyPozaOknem = true;
    const tygodnie = wynikU.tygodnie;
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

  const ojcowski =
    prawoDrugiego && !strataBezDzieci ? okresyOjcowskiego(p, drugiRodzicOd ?? data, koniecOjcowskiego, r.wez('ojcowskiDni')) : [];

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
    ...(uzupelniajacyPozaOknem ? { uzupelniajacyPozaOknem } : {}),
    poczatekOjcowskiego: drugiRodzicOd ?? data,
    ojcowski,
    domyslneCzesci,
    maksCzesci,
  };
}

/** Najwięcej tygodni urlopu rodzicielskiego rodzica: min(L − 9, L − tygodnie drugiego rodzica). */
export function maksTygodniRodzica(u: UkladScenariusza, czesci: CzescUrlopuRodzicielskiego[], rodzic: RodzicWRodzinie): number {
  const drugiego = czesci.filter((c) => c.rodzic !== rodzic).reduce((s, c) => s + c.tygodnie, 0);
  return Math.max(0, Math.min(u.wymiarRodzicielskiego - u.nieprzenoszalna, u.wymiarRodzicielskiego - drugiego));
}

/** Wszystkie łączenia urlopu rodzicielskiego z pracą scenariusza: `laczenie` i `laczeniaDodatkowe`. */
export function laczeniaScenariusza(p: Pick<ParametryScenariusza, 'laczenie' | 'laczeniaDodatkowe'>): LaczenieZPraca[] {
  return [...(p.laczenie !== undefined ? [p.laczenie] : []), ...(p.laczeniaDodatkowe ?? [])];
}

/** Dzień po ostatnim dniu urlopu rodzica przed urlopem rodzicielskim (macierzyński, uzupełniający, na warunkach, ojcowski). */
export function poczatekBezCzesci(u: UkladScenariusza, rodzic: RodzicWRodzinie): DataISO {
  if (rodzic === 'matka') return u.poczatekRodzicielskiego;
  const konce = [...u.ojcowski.map((o) => o.do), ...(u.uzupelniajacy?.rodzic === 'drugi-rodzic' ? [u.uzupelniajacy.do] : [])];
  return konce.length > 0 ? dodajDni(konce.reduce((a, b) => maxData(a, b)), 1) : u.poczatekRodzicielskiego;
}

/** Części urlopu rodzicielskiego scenariusza: z parametrów albo domyślne, po zmianach dat powrotu. */
export function czesciScenariusza(u: UkladScenariusza, p: ParametryScenariusza): { czesci: CzescUrlopuRodzicielskiego[]; komunikaty: Komunikat[] } {
  const komunikaty: Komunikat[] = [];
  let czesci = normalizujCzesci(
    (p.czesciRodzicielskiego.length > 0 ? p.czesciRodzicielskiego : u.domyslneCzesci).filter((c) => u.prawo[c.rodzic] && c.tygodnie > 0),
    u.maksCzesci,
    komunikaty,
  );
  for (const rodzic of ['matka', 'drugi-rodzic'] as const) {
    const data = p.datyPowrotu[rodzic];
    if (data === undefined || !u.prawo[rodzic]) continue;
    const zmiana = zastosujDatePowrotu(czesci, rodzic, data, poczatekBezCzesci(u, rodzic), maksTygodniRodzica(u, czesci, rodzic));
    czesci = zmiana.czesci;
    if (zmiana.komunikat) komunikaty.push(zmiana.komunikat);
  }
  return { czesci, komunikaty };
}

/**
 * Części w kolejności dat, bez nakładania się części tego samego rodzica i najwyżej `maksCzesci` części (0096).
 * Część rodzica zaczynająca się w trakcie jego wcześniejszej części zaczyna się w dniu po jej końcu, więc żaden dzień
 * urlopu nie jest liczony dwa razy. Części obojga rodziców mogą trwać jednocześnie.
 */
export function normalizujCzesci(
  czesci: CzescUrlopuRodzicielskiego[],
  maksCzesci: number,
  komunikaty: Komunikat[] = [],
): CzescUrlopuRodzicielskiego[] {
  const posortowane = czesci.map((c, i) => ({ c, i })).sort((a, b) => porownajDaty(a.c.od, b.c.od) || a.i - b.i).map(({ c }) => c);
  const koniecRodzica: Partial<Record<RodzicWRodzinie, DataISO>> = {};
  const wynik = posortowane.map((c) => {
    const poprzedni = koniecRodzica[c.rodzic];
    const od = poprzedni !== undefined && porownajDaty(c.od, poprzedni) <= 0 ? dodajDni(poprzedni, 1) : c.od;
    const czesc = od === c.od ? c : { ...c, od };
    koniecRodzica[c.rodzic] = koniecCzesci(czesc);
    return czesc;
  });
  const uporzadkowane = wynik.sort((a, b) => porownajDaty(a.od, b.od));
  if (uporzadkowane.length > maksCzesci) {
    komunikaty.push({ kod: '0096' });
    return uporzadkowane.slice(0, maksCzesci);
  }
  return uporzadkowane;
}

type CzescZIndeksem = CzescUrlopuRodzicielskiego & { indeks: number };

/** Części skrócone do pełnych tygodni kończących się najpóźniej w dniu `granica`, bez części bez tygodni. */
function przytnijCzesciDoGranicy(czesci: CzescZIndeksem[], granica: DataISO): { czesci: CzescZIndeksem[]; obciete: boolean } {
  let obciete = false;
  const wynik = czesci
    .map((c) => {
      const maks = Math.floor((roznicaDni(c.od, granica) + 1) / 7);
      if (maks < c.tygodnie) obciete = true;
      return { ...c, tygodnie: Math.max(0, Math.min(c.tygodnie, maks)) };
    })
    .filter((c) => c.tygodnie > 0);
  return { czesci: wynik, obciete };
}

/**
 * Przy kilkorgu przyjętych dzieciach od urodzin, po których wieku granicznego nie ukończyło już tylko jedno wliczone
 * dziecko, obowiązuje wymiar dla jednego dziecka (41 albo 65 tygodni), a urlop obojga rodziców wykorzystany przed tym
 * dniem wlicza się do tego wymiaru. Dni urlopu od tego dnia przysługują w kolejności dat do wyczerpania wymiaru,
 * a część kończy się po ostatnim pełnym tygodniu (historyjka 3.10.4.2.5, KA-08 i KA-10).
 */
function przyciecieDoWymiaru(czesci: CzescZIndeksem[], zmiana: { data: DataISO; wymiar: number }): CzescZIndeksem[] {
  const dzienPrzed = dodajDni(zmiana.data, -1);
  const dniPrzed = (c: CzescZIndeksem) =>
    porownajDaty(c.od, zmiana.data) >= 0 ? 0 : roznicaDni(c.od, minData(koniecCzesci(c), dzienPrzed)) + 1;
  let pozostalo = Math.max(0, 7 * zmiana.wymiar - czesci.reduce((suma, c) => suma + dniPrzed(c), 0));
  const tygodnie = new Map<number, number>();
  for (const c of [...czesci].sort((a, b) => porownajDaty(a.od, b.od))) {
    const przed = dniPrzed(c);
    const wziete = Math.min(7 * c.tygodnie - przed, pozostalo);
    pozostalo -= wziete;
    tygodnie.set(c.indeks, Math.min(c.tygodnie, Math.floor((przed + wziete) / 7)));
  }
  return czesci.map((c) => ({ ...c, tygodnie: tygodnie.get(c.indeks) ?? c.tygodnie })).filter((c) => c.tygodnie > 0);
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

  // Przy przyjęciu każda część urlopu rodzicielskiego obojga rodziców kończy się najpóźniej w dniu przed ukończeniem wieku
  // granicznego przez najmłodsze wliczone dziecko (0172), a w wymiarze 38 albo 62 tygodni w ostatnim dniu okresu tego
  // wymiaru (0290). Dzieci po wieku granicznym są poza wymiarem (0263), a od urodzin, po których przed wiekiem granicznym
  // jest już tylko jedno dziecko, wymiar wynosi 41 albo 65 tygodni (0296). Historyjka 3.10.4.2.5.
  // Urlop wykorzystany przed urodzinami, od których obowiązuje wymiar dla jednego dziecka, wlicza się do tego wymiaru
  // (przyciecieDoWymiaru, KA-10). Po łączeniu z pracą części i wydłużenia przesunięte poza granicę skracamy ponownie.
  let obcieteDoGranicy = false;
  if (u.przyjecie !== undefined) {
    const przyciete = przytnijCzesciDoGranicy(czesci, u.koniecWykorzystania);
    czesci = przyciete.czesci;
    obcieteDoGranicy = przyciete.obciete;
    if (u.przyjecie.liczbaWliczonych < u.przyjecie.liczbaWszystkich) {
      komunikaty.push({ kod: '0263', parametry: { liczbaDzieci: String(u.przyjecie.liczbaWliczonych), wiek: String(u.przyjecie.wiek) } });
    }
    const zmiana = u.przyjecie.zmianaWymiaru;
    if (zmiana !== undefined) {
      czesci = przyciecieDoWymiaru(czesci, zmiana);
      komunikaty.push({ kod: '0296', parametry: { data: formatujDate(zmiana.data), wiek: String(zmiana.wiek), liczbaTygodni: String(zmiana.wymiar) } });
    }
  }

  // Łączenie z pracą w dowolnych częściach obojga rodziców, od wybranego tygodnia części: wydłużenie urlopu po końcu
  // części i przesunięcie późniejszych części obojga rodziców. Łączny urlop rodzicielski z wydłużeniem najwyżej 82 albo
  // 86 tygodni, z zaświadczeniem „Za życiem” 130 albo 134 tygodnie (słownik wymiarów i okresów, historyjka 3.10.4.4.1).
  const laczeniaCzesci = new Map<number, { tygodnie: number; wymiarPracy: number; odTygodnia: number }>();
  const maksWymiarPracy = r.wez('laczenieWymiarPracy');
  for (const l of laczeniaScenariusza(p)) {
    const czesc = czesci.find((c) => c.indeks === l.indeksCzesci);
    if (czesc === undefined || u.formy[czesc.rodzic].forma !== 'umowa-o-prace' || l.wymiarPracy <= 0) continue;
    if (laczeniaCzesci.has(czesc.indeks)) continue;
    const odTygodnia = Math.max(0, Math.min(czesc.tygodnie - 1, Math.trunc(l.odTygodnia ?? 0)));
    const tygodnie = Math.min(l.tygodnie, czesc.tygodnie - odTygodnia);
    if (tygodnie <= 0) continue;
    laczeniaCzesci.set(czesc.indeks, { tygodnie, wymiarPracy: Math.min(l.wymiarPracy, maksWymiarPracy), odTygodnia });
  }
  const wydluzenia = new Map<number, { od: DataISO; do: DataISO; wymiarPracy: number; tygodnie: number; odTygodnia: number }>();
  if (laczeniaCzesci.size > 0) {
    const zz = d.zaZyciem.wartosc;
    const kluczLimitu = u.liczbaDzieci > 1 ? (zz ? 'laczenieZaZyciemWiecej' : 'laczenieWiecej') : zz ? 'laczenieZaZyciem1' : 'laczenie1';
    const limitDni = 7 * r.wez(kluczLimitu);
    let dniUrlopu = czesci.reduce((suma, c) => suma + 7 * c.tygodnie, 0);
    const kolejnosc = [...laczeniaCzesci.keys()].sort((a, b) =>
      porownajDaty(czesci.find((c) => c.indeks === a)!.od, czesci.find((c) => c.indeks === b)!.od),
    );
    for (const indeks of kolejnosc) {
      const czesc = czesci.find((c) => c.indeks === indeks)!;
      const l = laczeniaCzesci.get(indeks)!;
      const dni = Math.max(0, Math.min(wydluzeniePrzyLaczeniu(l.tygodnie * 7, l.wymiarPracy), limitDni - dniUrlopu));
      dniUrlopu += dni;
      const koniec = koniecCzesci(czesc);
      czesci = czesci.map((c) => (c.indeks !== indeks && porownajDaty(c.od, koniec) > 0 ? { ...c, od: dodajDni(c.od, dni) } : c));
      wydluzenia.set(indeks, { od: dodajDni(koniec, 1), do: dodajDni(koniec, dni), ...l });
    }
  }
  if (u.przyjecie !== undefined) {
    const granica = u.koniecWykorzystania;
    const poLaczeniu = przytnijCzesciDoGranicy(czesci, granica);
    czesci = poLaczeniu.czesci;
    if (poLaczeniu.obciete) obcieteDoGranicy = true;
    for (const [indeks, w] of wydluzenia) {
      if (porownajDaty(w.do, granica) <= 0) continue;
      wydluzenia.set(indeks, { ...w, do: granica });
      obcieteDoGranicy = true;
    }
    if (u.przyjecie.poWiekuGranicznym) {
      r.wez('rodzicielskiPoWieku');
      komunikaty.push({ kod: '0290', parametry: { wymiar: String(u.wymiarRodzicielskiego), data: formatujDate(granica) } });
    } else if (obcieteDoGranicy) {
      komunikaty.push({ kod: '0172', parametry: { wiek: String(u.przyjecie.wiek) } });
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
    const wydluzenie = wydluzenia.get(c.indeks);
    if (wydluzenie !== undefined) {
      const poczatekLaczenia = dodajDni(c.od, 7 * wydluzenie.odTygodnia);
      const granica = dodajDni(poczatekLaczenia, 7 * wydluzenie.tygodnie);
      const mnoznik = (100 - wydluzenie.wymiarPracy) / 100;
      const wynik: Odcinek[] = [];
      for (const k of kawalki) {
        const [przedLaczeniem, odLaczenia] = podzielOdcinek(k, poczatekLaczenia);
        if (przedLaczeniem) wynik.push(przedLaczeniem);
        if (!odLaczenia) continue;
        const [przed, po] = podzielOdcinek(odLaczenia, granica);
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
  // Przy zgonie przed upływem 8 tygodni życia okres trwa 8 tygodni od porodu, nie krócej niż do 7. dnia po dniu zgonu,
  // i ustala go już układ scenariusza (art. 180 § 4 i § 5 Kodeksu pracy, okresZasilkuPoStracie).
  let koncowe = odcinki;
  const strata = zdarzenie === 'porod' ? d.strata?.wartosc : undefined;
  const zgonPoOsmiuTygodniach =
    strata?.rodzaj === 'zgon-dziecka' && strata.dataZgonu !== undefined && czyZgonPoOsmiuTygodniach(data, strata.dataZgonu, katalog);
  if (u.strataBezDzieci && strata?.dataZgonu !== undefined && zgonPoOsmiuTygodniach) {
    const koniec = dodajDni(strata.dataZgonu, r.wez('urlopPoStracieDni'));
    koncowe = odcinki
      .filter((o) => porownajDaty(o.od, koniec) <= 0)
      .map((o) => (porownajDaty(o.do, koniec) > 0 ? { ...o, do: koniec } : o));
  }
  if (u.strataBezDzieci) {
    r.wez('urlopPoStracieTygodnie');
    r.wez('urlopPoStracieDni');
  }

  // Podstawa wymiaru w każdym dniu okresu: pracownik na pełnym etacie ma co najmniej minimalną podstawę obowiązującą w tym
  // dniu, a okres z różnymi podstawami liczymy w częściach przed dniem zmiany i od dnia zmiany (3.10.4.1.4, 3.10.4.3.5).
  // Wiersz okresu zbiera części: dni i kwota za okres to sumy części, kwota miesięczna z podstawy pierwszego dnia okresu.
  let minimumUzyte = false;
  const czesciOdcinka = (o: Odcinek): (OkresZPodstawa & { pozaSumami?: boolean })[] => {
    const podstawa = podstawy[o.rodzic];
    const pracownik = u.formy[o.rodzic].forma === 'umowa-o-prace';
    const zakresy = podstawa === undefined ? [{ od: o.od, do: o.do, kwota: 0 }] : podstawyWOkresie(podstawa, katalog, o, pracownik);
    const stawka = Math.round(o.stawka * 100) / 100;
    return zakresy.map((z) => {
      if (podstawa !== undefined && pracownik && podstawa.pelnyEtat === true && z.kwota > podstawaPrzedMinimum(podstawa)) minimumUzyte = true;
      const dni = roznicaDni(z.od, z.do) + 1;
      const dzienna = o.laczenie
        ? stawkaDziennaLaczenia(z.kwota, o.laczenie.stawkaOkresu, o.laczenie.wymiarPracy)
        : stawkaDzienna(z.kwota, stawka);
      return {
        rodzic: o.rodzic,
        rodzaj: o.rodzaj,
        od: z.od,
        do: z.do,
        dni,
        stawka,
        miesiecznie: kwotaMiesieczna(z.kwota, stawka),
        zaOkres: dzienna * dni,
        podstawa: z.kwota,
        dzienna,
        ...(o.pozaSumami ? { pozaSumami: true } : {}),
      };
    });
  };
  const kawalkiOkresow = koncowe
    .sort((a, b) => (a.rodzic === b.rodzic ? porownajDaty(a.od, b.od) : a.rodzic === 'matka' ? -1 : 1))
    .map(czesciOdcinka);
  const kawalkiPodstaw = kawalkiOkresow.flat();
  const okresy = kawalkiOkresow.map((k) => ({
    ...k[0],
    do: k[k.length - 1].do,
    dni: k.reduce((suma, c) => suma + c.dni, 0),
    zaOkres: k.reduce((suma, c) => suma + c.zaOkres, 0),
  }));
  if (minimumUzyte) r.wez('minimalnaPodstawaPracownika');

  // Wyrównanie zasiłku za urlop macierzyński do 100%, w miesiącu po końcu urlopu macierzyńskiego matki.
  const wyrownania: WyrownanieDoStu[] = [];
  if (wyrownanie) {
    const macMatki = kawalkiPodstaw.filter(
      (o) => o.rodzic === 'matka' && (o.rodzaj === 'macierzynski' || o.rodzaj === 'na-warunkach-macierzynskiego'),
    );
    const roznica = macMatki.reduce((s, o) => s + kwotaZaDni(o.podstawa, s100(), o.dni) - o.zaOkres, 0);
    if (roznica > 0 && macMatki.length > 0) {
      const koniec = macMatki.map((o) => o.do).reduce((a, b) => maxData(a, b));
      wyrownania.push({ rodzic: 'matka', miesiac: miesiacZDaty(dodajDni(koniec, 1)), kwota: roznica });
    }
  }

  r.wez('swiadczenieRodzicielskie');
  const h = harmonogramZPodstaw(kawalkiPodstaw.filter((o) => !o.pozaSumami), katalog, data, wyrownania);
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
    // Po stracie wszystkich dzieci uprawnienia po powrocie K20–K23 nie dotyczą rodziny, tak jak w planie rodziny po stracie.
    if (!u.prawo[rodzic] || u.strataBezDzieci) continue;
    for (const id of uprawnieniaPoPowrocie(rodzic, u.formy[rodzic].forma, u.formy[rodzic].dobrowolne)) {
      // Przerwy na karmienie (K20) przysługują pracownicy karmiącej piersią, więc pomijamy je przy przyjęciu dziecka na wychowanie.
      if (!(id === 'K20' && u.zdarzenie === 'przyjecie')) uprawnienia.add(id);
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
