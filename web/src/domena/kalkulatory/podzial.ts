// Podział urlopu rodzicielskiego między rodziców (kontrakt, sekcja 7.2).
// Właściciel: u26 (Kalkulatory wariantu zasiłku i podziału urlopu).
// Reguły R1–R12 z analizy epiku 3.10.2: wymiar, limit na rodzica, prawo drugiego rodzica, wartości startowe,
// tygodnie przepadające, stawki i szacunkowe wypłaty.
import {
  kwotaSwiadczeniaRodzicielskiego,
  stawkiZasilku,
  sumaZaDni,
  tygodnieNieprzenoszalne,
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
}

export type WynikPodzialu = ZapisPodzialuUrlopu['wynik'] & {
  przepadajace: number;
  bledy: BledyPol<string>;
  wymiar: number;
  maks: number;
  nieprzenoszalne: number;
  wiersze: WierszWyplatyPodzialu[];
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

function wyplata(podstawa: Grosze, stawka: Procent, tygodnie: number, swiadczenie: Grosze): { miesiecznie: Grosze; suma: Grosze } {
  const zeStawki = wyplataZeStawki(podstawa, stawka);
  const dni = tygodnie * 7;
  const suma = sumaZaDni(podstawa, stawka, dni);
  if (zeStawki >= swiadczenie) return { miesiecznie: zeStawki, suma };
  return { miesiecznie: swiadczenie, suma: Math.max(suma, Math.round((swiadczenie * dni) / 30)) };
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
  const pusty = { stawki: {}, miesiecznie: {}, sumy: {}, przepadajace: 0, bledy, ...z, wiersze: [] };
  if (Object.keys(bledy).length > 0) return pusty;

  const stawki = stawkiZasilku(w.katalog, w.dzien);
  const swiadczenie = kwotaSwiadczeniaRodzicielskiego(w.katalog, w.dzien);
  const stawkaRodzicielskiegoMatki = w.wariantMatki === '81-5' ? stawki.s815 : stawki.s70;
  const wiersze: WierszWyplatyPodzialu[] = [];
  const wynik: WynikPodzialu = { ...pusty, stawki: {}, miesiecznie: {}, sumy: {}, przepadajace: tygodniePrzepadajace(M, D, z.nieprzenoszalne), wiersze };

  const pMatki = w.podstawy.matka?.kwota;
  if (pMatki !== undefined) {
    const wm = wyplata(pMatki, stawkaRodzicielskiegoMatki, M, swiadczenie);
    wiersze.push({ rodzic: 'matka', rodzaj: 'matka', tygodnie: M, podstawa: pMatki, stawka: stawkaRodzicielskiegoMatki, ...wm });
    wynik.stawki.matka = [stawkaRodzicielskiegoMatki];
    wynik.miesiecznie.matka = wm.miesiecznie;
    wynik.sumy.matka = wm.suma;
  }

  if (bezPrawa) {
    wiersze.push({ rodzic: 'drugi-rodzic', rodzaj: 'bez-prawa', tygodnie: 0, podstawa: null, stawka: null, miesiecznie: null, suma: null });
    return wynik;
  }
  const pDrugiego = w.podstawy['drugi-rodzic']?.kwota;
  if (pDrugiego !== undefined) {
    const tylkoJego = Math.min(D, z.nieprzenoszalne);
    const ponad = D - tylkoJego;
    const w1 = wyplata(pDrugiego, stawki.s70, tylkoJego, swiadczenie);
    const stawkiDrugiego: Procent[] = [stawki.s70];
    wiersze.push({ rodzic: 'drugi-rodzic', rodzaj: 'tylko-drugiego-rodzica', tygodnie: tylkoJego, podstawa: pDrugiego, stawka: stawki.s70, ...w1 });
    let suma = w1.suma;
    if (ponad > 0) {
      const w2 = wyplata(pDrugiego, stawkaRodzicielskiegoMatki, ponad, swiadczenie);
      if (stawkaRodzicielskiegoMatki === stawki.s70) {
        // Ta sama stawka: jeden wiersz za wszystkie tygodnie drugiego rodzica.
        const caly = wyplata(pDrugiego, stawki.s70, D, swiadczenie);
        wiersze[wiersze.length - 1] = { ...wiersze[wiersze.length - 1], rodzaj: 'tylko-drugiego-rodzica', tygodnie: D, ...caly };
        suma = caly.suma;
      } else {
        wiersze.push({ rodzic: 'drugi-rodzic', rodzaj: 'ponad-nieprzenoszalne', tygodnie: ponad, podstawa: pDrugiego, stawka: stawkaRodzicielskiegoMatki, ...w2 });
        stawkiDrugiego.push(stawkaRodzicielskiegoMatki);
        suma += w2.suma;
      }
    }
    wynik.stawki['drugi-rodzic'] = stawkiDrugiego;
    wynik.miesiecznie['drugi-rodzic'] = w1.miesiecznie;
    wynik.sumy['drugi-rodzic'] = suma;
  }
  return wynik;
}
