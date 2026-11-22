// Podział urlopu rodzicielskiego między rodziców (kontrakt, sekcja 7.2).
// Właściciel: u26 (Kalkulatory wariantu zasiłku i podziału urlopu).
// Reguły R1–R12 z analizy epiku 3.10.2: wymiar, limit na rodzica, prawo drugiego rodzica, wartości startowe,
// tygodnie przepadające, stawki i szacunkowe wypłaty.
import { dodajDni, dodajLata, dodajMiesiace } from '@/domena/daty';
import { podstawaWDniuZasilku } from '@/domena/kalkulatory/podstawa';
import {
  kwotaSwiadczeniaRodzicielskiego,
  stawkiZasilku,
  tygodnieNieprzenoszalne,
  tygodnieUrlopuMacierzynskiego,
  tygodnieRodzicielskiegoJednegoRodzica,
  wymiarUrlopuRodzicielskiego,
  wyplataZeStawki,
} from '@/domena/kalkulatory/wariant';
import type { BledyPol, DataISO, Grosze, Katalog, PodstawaWymiaru, Procent, RodzicWRodzinie, ZapisPodzialuUrlopu } from '@/domena/typy';

export interface WejsciePodzialu {
  podstawy: Partial<Record<RodzicWRodzinie, PodstawaWymiaru>>;
  wariantMatki: '81-5' | '100-70';
  liczbaDzieci: number;
  zaZyciem: boolean;
  tygodnieMatki: number;
  tygodnieDrugiegoRodzica: number;
  katalog: Katalog;
  dzien: DataISO;
  drugiRodzicBezPrawa?: boolean;
}

/** Wiersz tabeli „Szacunkowe miesięczne wypłaty”. */
export interface WierszWyplatyPodzialu {
  rodzic: RodzicWRodzinie;
  rodzaj: 'matka' | 'tylko-drugiego-rodzica' | 'ponad-nieprzenoszalne' | 'bez-prawa';
  tygodnie: number;
  podstawa: Grosze | null;
  stawka: Procent | null;
  miesiecznie: Grosze | null;
  suma: Grosze | null;
  /** Podstawa wymiaru od dnia zmiany minimalnej podstawy wymiaru zasiłku w trakcie okresu (3.10.2.1.2). */
  zmiana?: { od: DataISO; podstawa: Grosze; miesiecznie: Grosze };
}

export type WynikPodzialu = ZapisPodzialuUrlopu['wynik'] & {
  przepadajace: number;
  bledy: BledyPol<string>;
  wymiar: number;
  maks: number;
  nieprzenoszalne: number;
  wiersze: WierszWyplatyPodzialu[];
  /** Wariant 81,5%: tygodnie drugiego rodzica ponad 9 przypadają po pierwszych urodzinach dziecka i liczone są po 70%. */
  ponadPoUrodzinach: boolean;
};

export interface ZasadyPodzialu { wymiar: number; maks: number; nieprzenoszalne: number }

/** Wymiar urlopu rodzicielskiego (L), limit jednego rodzica (L − 9) i tygodnie nieprzenoszalne. */
export function zasadyPodzialu(liczbaDzieci: number, zaZyciem: boolean, k: Katalog, dzien: DataISO): ZasadyPodzialu {
  return {
    wymiar: wymiarUrlopuRodzicielskiego(liczbaDzieci, zaZyciem, k, dzien),
    maks: tygodnieRodzicielskiegoJednegoRodzica(liczbaDzieci, zaZyciem, k, dzien),
    nieprzenoszalne: tygodnieNieprzenoszalne(k, dzien),
  };
}

/** Wartości startowe (R4): limit matki i 9 tygodni drugiego rodzica, bez prawa 0. */
export function wartosciStartowe(z: ZasadyPodzialu, drugiRodzicBezPrawa: boolean): { tygodnieMatki: number; tygodnieDrugiegoRodzica: number } {
  return { tygodnieMatki: z.maks, tygodnieDrugiegoRodzica: drugiRodzicBezPrawa ? 0 : Math.min(z.nieprzenoszalne, z.wymiar - z.maks) };
}

/** Tygodnie przepadające (R5): niewykorzystane tygodnie nieprzenoszalne obojga rodziców. */
export function tygodniePrzepadajace(tygodnieMatki: number, tygodnieDrugiegoRodzica: number, nieprzenoszalne: number): number {
  return Math.max(0, nieprzenoszalne - tygodnieDrugiegoRodzica) + Math.max(0, nieprzenoszalne - tygodnieMatki);
}

function czyTygodnie(t: number, maks: number): boolean {
  return Number.isSafeInteger(t) && t >= 0 && t <= maks;
}

/** Stawka dzienna: podstawa / 30 zaokrąglona do grosza, × stawka, ponownie zaokrąglona do grosza (3.10.2.1.2). */
export function stawkaDzienna(podstawa: Grosze, stawka: Procent): Grosze {
  return Math.round((Math.round(podstawa / 30) * Math.round(stawka * 10)) / 1000);
}

/** Podstawa w dniu: pracownik na pełnym etacie ma co najmniej minimalną podstawę obowiązującą w tym dniu (podstawa.ts). */
function podstawaWDniu(p: PodstawaWymiaru, dzien: DataISO, k: Katalog): Grosze {
  return podstawaWDniuZasilku(p, k, dzien);
}

/** Części okresu [od, od + dni − 1] z podstawą obowiązującą w każdej części (zmiana minimalnej podstawy od 1. dnia miesiąca). */
function czesciOkresu(p: PodstawaWymiaru, od: DataISO, dni: number, k: Katalog): { od: DataISO; dni: number; podstawa: Grosze }[] {
  if (dni <= 0) return [];
  const koniec = dodajDni(od, dni - 1);
  const czesci: { od: DataISO; dni: number; podstawa: Grosze }[] = [{ od, dni: 0, podstawa: podstawaWDniu(p, od, k) }];
  let miesiac = dodajMiesiace(`${od.slice(0, 7)}-01`, 1);
  while (miesiac <= koniec) {
    const kwota = podstawaWDniu(p, miesiac, k);
    if (kwota !== czesci[czesci.length - 1].podstawa) czesci.push({ od: miesiac, dni: 0, podstawa: kwota });
    miesiac = dodajMiesiace(miesiac, 1);
  }
  return czesci.map((c, i) => {
    const nastepna = czesci[i + 1]?.od ?? dodajDni(koniec, 1);
    return { ...c, dni: Math.round((Date.parse(nastepna) - Date.parse(c.od)) / 86400000) };
  });
}

function wyplata(
  p: PodstawaWymiaru,
  stawka: Procent,
  tygodnie: number,
  od: DataISO,
  swiadczenie: Grosze,
  k: Katalog,
): { podstawa: Grosze; miesiecznie: Grosze; suma: Grosze; zmiana?: WierszWyplatyPodzialu['zmiana'] } {
  const czesci = czesciOkresu(p, od, tygodnie * 7, k);
  if (czesci.length === 0) czesci.push({ od, dni: 0, podstawa: podstawaWDniu(p, od, k) });
  const policzone = czesci.map((c) => {
    const zeStawki = wyplataZeStawki(c.podstawa, stawka);
    const suma = stawkaDzienna(c.podstawa, stawka) * c.dni;
    if (zeStawki >= swiadczenie) return { ...c, miesiecznie: zeStawki, suma };
    return { ...c, miesiecznie: swiadczenie, suma: Math.max(suma, Math.round((swiadczenie * c.dni) / 30)) };
  });
  const [pierwsza, druga] = policzone;
  return {
    podstawa: pierwsza.podstawa,
    miesiecznie: pierwsza.miesiecznie,
    suma: policzone.reduce((a, c) => a + c.suma, 0),
    ...(druga ? { zmiana: { od: druga.od, podstawa: druga.podstawa, miesiecznie: druga.miesiecznie } } : {}),
  };
}

/** Stawki, kwoty miesięczne i sumy obu rodziców. Błędy zakresu tygodni dają 0061 (R10). */
export function wyliczPodzial(w: WejsciePodzialu): WynikPodzialu {
  const z = zasadyPodzialu(w.liczbaDzieci, w.zaZyciem, w.katalog, w.dzien);
  const bezPrawa = w.drugiRodzicBezPrawa === true;
  const M = w.tygodnieMatki;
  const D = bezPrawa ? 0 : w.tygodnieDrugiegoRodzica;
  const bledy: BledyPol<string> = {};
  if (!czyTygodnie(M, z.maks)) bledy.tygodnieMatki = '0061';
  if (!bezPrawa && !czyTygodnie(D, z.maks)) bledy.tygodnieDrugiegoRodzica = '0061';
  else if (!bezPrawa && czyTygodnie(M, z.maks) && M + D > z.wymiar) bledy.tygodnieDrugiegoRodzica = '0061';
  const pusty = { stawki: {}, miesiecznie: {}, sumy: {}, przepadajace: 0, bledy, ...z, wiersze: [], ponadPoUrodzinach: false };
  if (Object.keys(bledy).length > 0) return pusty;

  const stawki = stawkiZasilku(w.katalog, w.dzien);
  const swiadczenie = kwotaSwiadczeniaRodzicielskiego(w.katalog, w.dzien);
  const stawkaRodzicielskiegoMatki = w.wariantMatki === '81-5' ? stawki.s815 : stawki.s70;
  // Kolejność urlopów: macierzyński matki, tygodnie rodzicielskiego matki, tygodnie drugiego rodzica (ponad 9, potem 9 tylko jego).
  const poczatekMatki = dodajDni(w.dzien, tygodnieUrlopuMacierzynskiego(w.liczbaDzieci, w.katalog, w.dzien) * 7);
  const poczatekDrugiego = dodajDni(poczatekMatki, M * 7);
  const pierwszeUrodziny = dodajLata(w.dzien, 1);
  // Stawka 81,5% za tygodnie drugiego rodzica ponad 9, gdy co najmniej jeden dzień urlopu rodzicielskiego ze stawką 81,5%,
  // matki albo drugiego rodzica, przypada przed pierwszymi urodzinami dziecka (3.10.2.1.2, ta sama reguła w scenariusz.ts).
  const ponadPrzedUrodzinami = (M > 0 && poczatekMatki < pierwszeUrodziny) || poczatekDrugiego < pierwszeUrodziny;
  const stawkaPonad = w.wariantMatki === '81-5' && ponadPrzedUrodzinami ? stawki.s815 : stawki.s70;
  const wiersze: WierszWyplatyPodzialu[] = [];
  const wynik: WynikPodzialu = {
    ...pusty,
    stawki: {},
    miesiecznie: {},
    sumy: {},
    przepadajace: tygodniePrzepadajace(M, D, z.nieprzenoszalne),
    wiersze,
    ponadPoUrodzinach: w.wariantMatki === '81-5' && !bezPrawa && D > z.nieprzenoszalne && !ponadPrzedUrodzinami,
  };

  const pMatki = w.podstawy.matka;
  if (pMatki !== undefined) {
    const wm = wyplata(pMatki, stawkaRodzicielskiegoMatki, M, poczatekMatki, swiadczenie, w.katalog);
    wiersze.push({ rodzic: 'matka', rodzaj: 'matka', tygodnie: M, stawka: stawkaRodzicielskiegoMatki, ...wm });
    wynik.stawki.matka = [stawkaRodzicielskiegoMatki];
    wynik.miesiecznie.matka = wm.miesiecznie;
    wynik.sumy.matka = wm.suma;
  }

  if (bezPrawa) {
    wiersze.push({ rodzic: 'drugi-rodzic', rodzaj: 'bez-prawa', tygodnie: 0, podstawa: null, stawka: null, miesiecznie: null, suma: null });
    return wynik;
  }
  const pDrugiego = w.podstawy['drugi-rodzic'];
  if (pDrugiego !== undefined) {
    const tylkoJego = Math.min(D, z.nieprzenoszalne);
    const ponad = D - tylkoJego;
    const stawkiDrugiego: Procent[] = [stawki.s70];
    let suma: Grosze;
    let miesiecznie: Grosze;
    if (ponad > 0 && stawkaPonad === stawki.s70) {
      // Ta sama stawka: jeden wiersz za wszystkie tygodnie drugiego rodzica.
      const caly = wyplata(pDrugiego, stawki.s70, D, poczatekDrugiego, swiadczenie, w.katalog);
      wiersze.push({ rodzic: 'drugi-rodzic', rodzaj: 'tylko-drugiego-rodzica', tygodnie: D, stawka: stawki.s70, ...caly });
      suma = caly.suma;
      miesiecznie = caly.miesiecznie;
    } else {
      const poczatekTylkoJego = dodajDni(poczatekDrugiego, ponad * 7);
      const w1 = wyplata(pDrugiego, stawki.s70, tylkoJego, poczatekTylkoJego, swiadczenie, w.katalog);
      wiersze.push({ rodzic: 'drugi-rodzic', rodzaj: 'tylko-drugiego-rodzica', tygodnie: tylkoJego, stawka: stawki.s70, ...w1 });
      suma = w1.suma;
      miesiecznie = w1.miesiecznie;
      if (ponad > 0) {
        const w2 = wyplata(pDrugiego, stawkaPonad, ponad, poczatekDrugiego, swiadczenie, w.katalog);
        wiersze.push({ rodzic: 'drugi-rodzic', rodzaj: 'ponad-nieprzenoszalne', tygodnie: ponad, stawka: stawkaPonad, ...w2 });
        stawkiDrugiego.push(stawkaPonad);
        suma += w2.suma;
      }
    }
    wynik.stawki['drugi-rodzic'] = stawkiDrugiego;
    wynik.miesiecznie['drugi-rodzic'] = miesiecznie;
    wynik.sumy['drugi-rodzic'] = suma;
  }
  return wynik;
}
