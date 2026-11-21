// Podstawa wymiaru zasiłku każdego rodzica w kalkulatorze (u15, historyjka 3.10.4.1.2).
// Czyste funkcje: wybór tytułu z konta ZUS, miesiąc powstania prawa, prawo do zasiłku z formy zatrudnienia,
// podstawa wyliczona silnikiem kalkulatora albo wpisana przez rodzica.
import { dodajDni, miesiacZDaty } from '@/domena/daty';
import { wyliczPodstawe } from '@/domena/kalkulatory';
import type {
  DaneDrugiegoRodzicaZKonta,
  DaneWejscioweKalkulatora,
  DaneZKontaZus,
  DataISO,
  FormaZatrudnienia,
  Katalog,
  MiesiacISO,
  ParametryScenariusza,
  PodstawaWymiaru,
  RodzicWRodzinie,
  TytulUbezpieczenia,
} from '@/domena/typy';
import { dataZdarzenia } from './formularz';

export const RODZICE: readonly RodzicWRodzinie[] = ['matka', 'drugi-rodzic'];

/** Prawo do zasiłku w dniu zdarzenia: umowa o pracę, umowa zlecenia albo JDG z dobrowolnym ubezpieczeniem chorobowym. */
export function prawoZFormy(d: DaneWejscioweKalkulatora, rodzic: RodzicWRodzinie, p?: ParametryScenariusza | null): boolean {
  if (rodzic === 'drugi-rodzic' && p?.drugiRodzicPoPorodzie) return true;
  const { forma, dobrowolne } = rodzic === 'matka' ? d.formaMatki.wartosc : d.formaDrugiegoRodzica.wartosc;
  if (forma === 'umowa-o-prace') return true;
  if (forma === 'umowa-zlecenia' || forma === 'jdg') return dobrowolne;
  return false;
}

export function formaRodzica(d: DaneWejscioweKalkulatora, rodzic: RodzicWRodzinie): FormaZatrudnienia | null {
  const forma = rodzic === 'matka' ? d.formaMatki.wartosc.forma : d.formaDrugiegoRodzica.wartosc.forma;
  return forma === 'brak-drugiego-rodzica' ? null : forma;
}

const RODZAJ_TYTULU: Partial<Record<FormaZatrudnienia, TytulUbezpieczenia['rodzaj']>> = {
  'umowa-o-prace': 'pracownik',
  'umowa-zlecenia': 'zleceniobiorca',
  jdg: 'dzialalnosc',
};

/** Tytuł z konta ZUS zgodny z formą zatrudnienia, z ubezpieczeniem chorobowym. */
export function tytulDlaFormy(
  daneZus: DaneZKontaZus | DaneDrugiegoRodzicaZKonta | null,
  forma: FormaZatrudnienia | null,
): TytulUbezpieczenia | null {
  if (daneZus === null || forma === null) return null;
  const rodzaj = RODZAJ_TYTULU[forma];
  if (!rodzaj) return null;
  return (
    daneZus.tytuly.find((t) => t.rodzaj === rodzaj && t.ubezpieczenieChorobowe.rodzaj !== 'brak' && t.podstawySkladek.length > 0) ??
    null
  );
}

/** Miesiąc powstania prawa: miesiąc porodu albo terminu, przy części przed porodem miesiąc początku urlopu, przy przyjęciu miesiąc przyjęcia. */
export function miesiacPowstaniaPrawa(d: DaneWejscioweKalkulatora, p: ParametryScenariusza | null): MiesiacISO | null {
  const data = dataZdarzenia(d);
  if (data === null) return null;
  const tygodnie = d.zdarzenie.wartosc === 'przyjecie' ? 0 : (p?.tygodniePrzedPorodem ?? 0);
  return miesiacZDaty(dodajDni(data, -7 * tygodnie));
}

export type PodstawaZKonta =
  | { rodzaj: 'wyliczona'; podstawa: PodstawaWymiaru; tytul: TytulUbezpieczenia }
  | { rodzaj: 'brak'; kod: '0094' | '0173' };

/** Podstawa z konta ZUS rodzica: 0173 bez danych drugiego rodzica, 0094 bez podstaw składek z ubezpieczeniem chorobowym. */
export function podstawaZKonta(w: {
  dane: DaneWejscioweKalkulatora;
  rodzic: RodzicWRodzinie;
  daneZus: DaneZKontaZus | DaneDrugiegoRodzicaZKonta | null;
  pelnyEtat: boolean;
  parametry: ParametryScenariusza | null;
  katalog: Katalog;
  dzien: DataISO;
}): PodstawaZKonta {
  if (w.daneZus === null && w.rodzic === 'drugi-rodzic') return { rodzaj: 'brak', kod: '0173' };
  const forma = formaRodzica(w.dane, w.rodzic);
  const tytul = tytulDlaFormy(w.daneZus, forma);
  const miesiac = miesiacPowstaniaPrawa(w.dane, w.parametry);
  if (tytul === null || forma === null || miesiac === null) return { rodzaj: 'brak', kod: '0094' };
  const wynik = wyliczPodstawe({
    podstawy: tytul.podstawySkladek,
    forma,
    pelnyEtat: forma === 'umowa-o-prace' ? w.pelnyEtat : false,
    miesiacPrawa: miesiac,
    katalog: w.katalog,
    dzien: w.dzien,
  });
  if ('kod' in wynik) return { rodzaj: 'brak', kod: wynik.kod };
  return { rodzaj: 'wyliczona', podstawa: { ...wynik, zrodlo: 'konto-zus' }, tytul };
}

export interface PodstawaRodzica {
  rodzic: RodzicWRodzinie;
  prawo: boolean;
  zKonta: PodstawaZKonta;
  pelnyEtat: boolean;
  // Podstawa, z której liczymy wypłaty: wpisana albo z przykładowej sprawy, a domyślnie z konta ZUS.
  efektywna: PodstawaWymiaru | null;
}

export function podstawyRodzicow(w: {
  dane: DaneWejscioweKalkulatora;
  daneZus: Record<RodzicWRodzinie, DaneZKontaZus | DaneDrugiegoRodzicaZKonta | null>;
  nadpisania: Partial<Record<RodzicWRodzinie, PodstawaWymiaru>>;
  pelnyEtat: Partial<Record<RodzicWRodzinie, boolean>>;
  parametry: ParametryScenariusza | null;
  katalog: Katalog;
  dzien: DataISO;
}): Record<RodzicWRodzinie, PodstawaRodzica> {
  const wynik = {} as Record<RodzicWRodzinie, PodstawaRodzica>;
  for (const rodzic of RODZICE) {
    const pelnyEtat = w.pelnyEtat[rodzic] ?? true;
    const zKonta = podstawaZKonta({
      dane: w.dane,
      rodzic,
      daneZus: w.daneZus[rodzic],
      pelnyEtat,
      parametry: w.parametry,
      katalog: w.katalog,
      dzien: w.dzien,
    });
    const nadpisanie = w.nadpisania[rodzic];
    wynik[rodzic] = {
      rodzic,
      prawo: prawoZFormy(w.dane, rodzic, w.parametry),
      zKonta,
      pelnyEtat,
      efektywna: nadpisanie ?? (zKonta.rodzaj === 'wyliczona' ? zKonta.podstawa : null),
    };
  }
  return wynik;
}

export function podstawyDoWyliczenia(
  p: Record<RodzicWRodzinie, PodstawaRodzica>,
): Partial<Record<RodzicWRodzinie, PodstawaWymiaru>> {
  const wynik: Partial<Record<RodzicWRodzinie, PodstawaWymiaru>> = {};
  for (const rodzic of RODZICE) {
    const e = p[rodzic].efektywna;
    if (p[rodzic].prawo && e) wynik[rodzic] = e;
  }
  return wynik;
}
