// Podstawa wymiaru zasiłku macierzyńskiego (kontrakt, sekcja 7.2). Właściciel: u09 (Silnik kalkulatora zasiłku macierzyńskiego).
// Reguły: okno 12 pełnych miesięcy kalendarzowych przed miesiącem powstania prawa, średnia podstaw składek,
// pomniejszenie o 13,71% zaokrąglone do grosza, minimum pracownika na pełnym etacie, reguła najniższej podstawy
// osoby prowadzącej pozarolniczą działalność ubezpieczonej krócej niż 12 miesięcy.
import {
  dataZMiesiaca,
  dodajDni,
  dodajMiesiaceDoMiesiaca,
  miesiacZDaty,
  porownajDaty,
} from '@/domena/daty';
import { podzielKwote, procentZaokraglony } from '@/domena/kalkulatory/rachunek';
import { parametr, kwotaParametru } from '@/domena/kalkulatory/slowniki';
import type {
  DataISO,
  DaneWejscioweKalkulatora,
  FormaZatrudnienia,
  Grosze,
  Katalog,
  MiesiacISO,
  ParametryScenariusza,
  PodstawaSkladek,
  PodstawaWymiaru,
  TytulUbezpieczenia,
} from '@/domena/typy';

export interface WejsciePodstawy {
  podstawy: PodstawaSkladek[];
  forma: FormaZatrudnienia;
  pelnyEtat: boolean;
  miesiacPrawa: MiesiacISO;
  katalog: Katalog;
  dzien: DataISO;
  /** Początek ubezpieczenia chorobowego z tytułu; przy działalności rozstrzyga o regule najniższej podstawy. */
  poczatekUbezpieczenia?: DataISO;
}

/**
 * Klucze składników podstawy (`PodstawaWymiaru.skladniki[].opis`), które widok zamienia na etykiety z `teksty.ts`:
 * `srednia` (średnia podstaw składek), `liczba-miesiecy` (kwota = liczba miesięcy w groszach × 100),
 * `pomniejszenie` (pomniejszenie o składki), `minimum-pracownika` (minimalna podstawa pracownika na pełnym etacie),
 * `najnizsza-podstawa-dzialalnosci` (najniższa podstawa pomniejszona o składki),
 * `nadwyzki-dzialalnosci` (1/12 sumy nadwyżek pomniejszonych o składki), `wynik` (podstawa wymiaru).
 */
export type KluczSkladnikaPodstawy =
  | 'srednia'
  | 'liczba-miesiecy'
  | 'pomniejszenie'
  | 'minimum-pracownika'
  | 'najnizsza-podstawa-dzialalnosci'
  | 'nadwyzki-dzialalnosci'
  | 'wynik';

function skladnik(opis: KluczSkladnikaPodstawy, kwota: Grosze) {
  return { opis, kwota };
}

/** Miesiąc powstania prawa: miesiąc porodu, przewidywanego terminu, początku urlopu przed porodem albo przyjęcia dziecka. */
export function miesiacPowstaniaPrawa(d: DaneWejscioweKalkulatora, p?: Pick<ParametryScenariusza, 'tygodniePrzedPorodem'>): MiesiacISO | null {
  const zd = d.zdarzenie.wartosc;
  if (zd === 'przyjecie') return d.przyjecie ? miesiacZDaty(d.przyjecie.wartosc.dataPrzyjecia) : null;
  const data = zd === 'porod' ? d.dataPorodu?.wartosc : d.przewidywanyTerminPorodu?.wartosc;
  if (data === undefined) return null;
  const k = p?.tygodniePrzedPorodem ?? 0;
  return miesiacZDaty(k > 0 ? dodajDni(data, -7 * k) : data);
}

// Pierwszy pełny miesiąc ubezpieczenia: miesiąc początku, gdy ubezpieczenie zaczęło się 1. dnia, w przeciwnym razie następny.
function pierwszyPelnyMiesiac(poczatek: DataISO): MiesiacISO {
  const m = miesiacZDaty(poczatek);
  return poczatek.endsWith('-01') ? m : dodajMiesiaceDoMiesiaca(m, 1);
}

/** Podstawa wymiaru z podstaw składek z 12 miesięcy; 0094, gdy w danych ZUS brak podstaw składek. */
export function wyliczPodstawe(w: WejsciePodstawy): PodstawaWymiaru | { kod: '0094' | '0173' } {
  const { katalog, dzien } = w;
  const poczatekOkna = dodajMiesiaceDoMiesiaca(w.miesiacPrawa, -12);
  const pierwszyMiesiac =
    w.poczatekUbezpieczenia !== undefined ? pierwszyPelnyMiesiac(w.poczatekUbezpieczenia) : poczatekOkna;
  const miesiace = w.podstawy
    .filter((p) => p.miesiac >= poczatekOkna && p.miesiac < w.miesiacPrawa && p.miesiac >= pierwszyMiesiac && p.kwota > 0)
    .sort((a, b) => a.miesiac.localeCompare(b.miesiac));
  if (miesiace.length === 0) return { kod: '0094' };

  const procentPomniejszenia = parametr(katalog, 'pomniejszenie', dzien).wartosc;
  const krotkoUbezpieczonaDzialalnosc =
    w.forma === 'jdg' &&
    w.poczatekUbezpieczenia !== undefined &&
    porownajDaty(w.poczatekUbezpieczenia, dataZMiesiaca(poczatekOkna)) > 0;

  if (krotkoUbezpieczonaDzialalnosc) {
    const najnizsza = kwotaParametru(katalog, 'najnizszaPodstawaDzialalnosci', dzien);
    const czescStala = najnizsza - procentZaokraglony(najnizsza, procentPomniejszenia);
    const sumaNadwyzek = miesiace.reduce((suma, m) => {
      const nadwyzka = m.kwota - najnizsza;
      return suma + (nadwyzka - procentZaokraglony(nadwyzka, procentPomniejszenia));
    }, 0);
    const nadwyzki = podzielKwote(sumaNadwyzek, 12);
    const kwota = czescStala + nadwyzki;
    return {
      kwota,
      zrodlo: 'konto-zus',
      miesiacPowstaniaPrawa: w.miesiacPrawa,
      skladniki: [
        skladnik('najnizsza-podstawa-dzialalnosci', czescStala),
        skladnik('nadwyzki-dzialalnosci', nadwyzki),
        skladnik('liczba-miesiecy', miesiace.length * 100),
        skladnik('wynik', kwota),
      ],
    };
  }

  const suma = miesiace.reduce((s, m) => s + m.kwota, 0);
  const srednia = podzielKwote(suma, miesiace.length);
  const pomniejszenie = procentZaokraglony(srednia, procentPomniejszenia);
  let kwota = srednia - pomniejszenie;
  const skladniki = [
    skladnik('srednia', srednia),
    skladnik('liczba-miesiecy', miesiace.length * 100),
    skladnik('pomniejszenie', pomniejszenie),
  ];
  const pracownik = w.forma === 'umowa-o-prace';
  if (pracownik && w.pelnyEtat) {
    const minimum = minimalnaPodstawaPracownika(katalog, dzien);
    if (kwota < minimum) {
      kwota = minimum;
      skladniki.push(skladnik('minimum-pracownika', minimum));
    }
  }
  skladniki.push(skladnik('wynik', kwota));
  return {
    kwota,
    zrodlo: 'konto-zus',
    ...(pracownik ? { pelnyEtat: w.pelnyEtat } : {}),
    miesiacPowstaniaPrawa: w.miesiacPrawa,
    skladniki,
  };
}

/** Minimalna podstawa pracownika na pełnym etacie: minimalne wynagrodzenie pomniejszone o 13,71% (obecnie 4147,10 zł). */
export function minimalnaPodstawaPracownika(katalog: Katalog, dzien: DataISO): Grosze {
  const minimalne = kwotaParametru(katalog, 'minimalneWynagrodzenie', dzien);
  const procent = parametr(katalog, 'pomniejszenie', dzien).wartosc;
  return minimalne - procentZaokraglony(minimalne, procent);
}

const RODZAJ_TYTULU: Record<'pracownik' | 'zleceniobiorca' | 'dzialalnosc', FormaZatrudnienia> = {
  pracownik: 'umowa-o-prace',
  zleceniobiorca: 'umowa-zlecenia',
  dzialalnosc: 'jdg',
};

/**
 * Podstawa wymiaru z tytułów ubezpieczenia na koncie ZUS rodzica. Bierze podstawy składek tytułów formy zatrudnienia
 * z ubezpieczeniem chorobowym. Bez danych drugiego rodzica zwraca 0173, bez podstaw składek 0094.
 */
export function wyliczPodstaweZTytulow(w: {
  tytuly: TytulUbezpieczenia[] | null;
  forma: FormaZatrudnienia;
  pelnyEtat: boolean;
  miesiacPrawa: MiesiacISO;
  katalog: Katalog;
  dzien: DataISO;
}): PodstawaWymiaru | { kod: '0094' | '0173' } {
  if (w.tytuly === null) return { kod: '0173' };
  const tytuly = w.tytuly.filter(
    (t) => RODZAJ_TYTULU[t.rodzaj] === w.forma && t.ubezpieczenieChorobowe.rodzaj !== 'brak',
  );
  if (tytuly.length === 0) return { kod: '0094' };
  const podstawy = new Map<MiesiacISO, Grosze>();
  for (const t of tytuly) {
    for (const p of t.podstawySkladek) podstawy.set(p.miesiac, (podstawy.get(p.miesiac) ?? 0) + p.kwota);
  }
  const poczatki = tytuly.map((t) => t.ubezpieczenieChorobowe.od ?? t.od).sort();
  return wyliczPodstawe({
    podstawy: [...podstawy.entries()].map(([miesiac, kwota]) => ({ miesiac, kwota })),
    forma: w.forma,
    pelnyEtat: w.pelnyEtat,
    miesiacPrawa: w.miesiacPrawa,
    katalog: w.katalog,
    dzien: w.dzien,
    poczatekUbezpieczenia: poczatki[0],
  });
}

/** Podstawa wpisana przez rodzica albo z przykładowej sprawy. */
export function podstawaWpisana(kwota: Grosze, zrodlo: 'wartosc-wpisana-przez-rodzica' | 'przykladowa-sprawa', pelnyEtat?: boolean): PodstawaWymiaru {
  return { kwota, zrodlo, ...(pelnyEtat !== undefined ? { pelnyEtat } : {}) };
}
