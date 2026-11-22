// Oświadczenie Z-10 we wniosku ZAS-53 (kontrakt, sekcja 7.2). Właściciel: u30 (Kreator wniosku o zasiłek chorobowy ZAS-53).
// Siedem pytań o okoliczności po ustaniu tytułu ubezpieczenia chorobowego, walidacja odpowiedzi (0006, 0010, 0110,
// 0238, 0239, 0240, 0270) i okoliczności wyłączające zasiłek po ustaniu ubezpieczenia (0237).
import { parsujDate, porownajDaty } from '@/domena/daty';
import type { DataISO, KodKomunikatu, OswiadczenieZ10 } from '@/domena/typy';

/**
 * Numer pytania jest stałym identyfikatorem odpowiedzi w szkicu: 1 emerytura albo renta, 2 złożony wniosek,
 * 3 zasiłek dla bezrobotnych, 4 działalność zarobkowa, 5 stypendium, 6 zagraniczna emerytura albo renta,
 * 7 urlop bezpłatny. `PYTANIA_Z10` podaje kolejność pytań na ekranie.
 */
export type NumerPytaniaZ10 = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export const PYTANIA_Z10: readonly NumerPytaniaZ10[] = [1, 6, 2, 3, 4, 5, 7];

/** Pytanie o urlop bezpłatny u jednego pracodawcy w czasie zatrudnienia u innego: pole okresu od i do. */
export const PYTANIE_URLOPU_Z10: NumerPytaniaZ10 = 7;

export type RodzajDzialalnosciZ10 =
  | 'umowa-o-prace'
  | 'umowa-zlecenia'
  | 'dzialalnosc-pozarolnicza'
  | 'gospodarstwo-rolne'
  | 'dzial-specjalny'
  | 'krus'
  | 'krus-dobrowolne'
  | 'inna';
export const RODZAJE_DZIALALNOSCI_Z10: readonly RodzajDzialalnosciZ10[] = [
  'umowa-o-prace',
  'umowa-zlecenia',
  'dzialalnosc-pozarolnicza',
  'gospodarstwo-rolne',
  'dzial-specjalny',
  'krus',
  'krus-dobrowolne',
  'inna',
];

/** Rodzaj działalności z polem liczby hektarów przeliczeniowych. */
export const RODZAJ_Z_HEKTARAMI: RodzajDzialalnosciZ10 = 'gospodarstwo-rolne';

/** Rodzaje działalności, które stanowią tytuł do ubezpieczenia chorobowego albo obowiązkowe ubezpieczenie rolników. */
const DZIALALNOSC_WYLACZAJACA: readonly RodzajDzialalnosciZ10[] = ['umowa-o-prace', 'umowa-zlecenia', 'dzialalnosc-pozarolnicza', 'krus'];

/** Pytania z polem informacji (kto ustalił prawo, gdzie złożono wniosek), od 1 do 100 znaków. */
export const PYTANIA_Z_INFORMACJA: readonly NumerPytaniaZ10[] = [1, 6, 2];
export const MAKS_DLUGOSC_INFORMACJI_Z10 = 100;

/** Formularz ekranu ViewZas53AfterInsurance: odpowiedzi i teksty pól przed walidacją. */
export interface FormularzZ10 {
  odpowiedzi: Partial<Record<NumerPytaniaZ10, 'tak' | 'nie'>>;
  informacja: Partial<Record<NumerPytaniaZ10, string>>;
  data: Partial<Record<NumerPytaniaZ10, string>>;
  rodzajDzialalnosci: RodzajDzialalnosciZ10 | '';
  hektary: string;
  urlopOd: string;
  urlopDo: string;
}

export type PoleZ10 =
  | `odpowiedz-${NumerPytaniaZ10}`
  | `informacja-${NumerPytaniaZ10}`
  | `data-${NumerPytaniaZ10}`
  | 'rodzaj'
  | 'hektary'
  | 'urlop-od'
  | 'urlop-do';

export function pustyFormularzZ10(): FormularzZ10 {
  return { odpowiedzi: {}, informacja: {}, data: {}, rodzajDzialalnosci: '', hektary: '', urlopOd: '', urlopDo: '' };
}

/** Liczba hektarów przeliczeniowych większa od 0 z najwyżej dwoma miejscami po przecinku; null przy innej wartości. */
export function parsujHektary(tekst: string): number | null {
  const t = tekst.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return null;
  const liczba = Number(t);
  return liczba > 0 ? liczba : null;
}

/** Liczba hektarów w zapisie z przecinkiem (`1,50`). */
export function formatujHektary(liczba: number): string {
  return liczba.toFixed(2).replace('.', ',');
}

/** Formularz z zapisanego oświadczenia (powrót do ekranu z zachowanymi odpowiedziami). */
export function formularzZOswiadczenia(o: OswiadczenieZ10 | undefined, formatujDate: (d: DataISO) => string): FormularzZ10 {
  const f = pustyFormularzZ10();
  for (const odp of o?.odpowiedzi ?? []) {
    f.odpowiedzi[odp.pytanie] = odp.tak ? 'tak' : 'nie';
    const informacja = odp.podmiot ?? odp.miejsce;
    if (informacja !== undefined) f.informacja[odp.pytanie] = informacja;
    if (odp.data !== undefined) f.data[odp.pytanie] = formatujDate(odp.data);
    if (odp.rodzajDzialalnosci !== undefined) f.rodzajDzialalnosci = odp.rodzajDzialalnosci as RodzajDzialalnosciZ10;
    if (odp.hektary !== undefined) f.hektary = formatujHektary(odp.hektary);
    if (odp.urlop !== undefined) {
      f.urlopOd = formatujDate(odp.urlop.od);
      f.urlopDo = formatujDate(odp.urlop.do);
    }
  }
  return f;
}

/** Walidacja formularza Z-10; poprawny formularz daje odpowiedzi do zapisu w oświadczeniu. */
export function walidujZ10(
  f: FormularzZ10,
  dzis: DataISO,
): { ok: true; odpowiedzi: OswiadczenieZ10['odpowiedzi'] } | { ok: false; bledy: Partial<Record<PoleZ10, KodKomunikatu>> } {
  const bledy: Partial<Record<PoleZ10, KodKomunikatu>> = {};
  const odpowiedzi: OswiadczenieZ10['odpowiedzi'] = [];
  for (const nr of PYTANIA_Z10) {
    const odp = f.odpowiedzi[nr];
    if (odp === undefined) {
      bledy[`odpowiedz-${nr}`] = '0006';
      continue;
    }
    if (odp === 'nie') {
      odpowiedzi.push({ pytanie: nr, tak: false });
      continue;
    }
    const wpis: OswiadczenieZ10['odpowiedzi'][number] = { pytanie: nr, tak: true };
    if (PYTANIA_Z_INFORMACJA.includes(nr)) {
      const informacja = (f.informacja[nr] ?? '').trim();
      if (informacja === '') bledy[`informacja-${nr}`] = '0238';
      else if (nr !== 2) wpis.podmiot = informacja.slice(0, MAKS_DLUGOSC_INFORMACJI_Z10);
      else wpis.miejsce = informacja.slice(0, MAKS_DLUGOSC_INFORMACJI_Z10);
    }
    if (nr === PYTANIE_URLOPU_Z10) {
      const od = walidujDateZ10(f.urlopOd, null);
      const doKonca = walidujDateZ10(f.urlopDo, null);
      if (typeof od !== 'string') bledy['urlop-od'] = od.kod;
      if (typeof doKonca !== 'string') bledy['urlop-do'] = doKonca.kod;
      if (typeof od === 'string' && typeof doKonca === 'string') {
        if (porownajDaty(doKonca, od) < 0) bledy['urlop-do'] = '0110';
        else wpis.urlop = { od, do: doKonca };
      }
      odpowiedzi.push(wpis);
      continue;
    }
    if (nr === 4) {
      if (f.rodzajDzialalnosci === '') bledy.rodzaj = '0006';
      else wpis.rodzajDzialalnosci = f.rodzajDzialalnosci;
      if (f.rodzajDzialalnosci === RODZAJ_Z_HEKTARAMI) {
        const hektary = parsujHektary(f.hektary);
        if (f.hektary.trim() === '') bledy.hektary = '0238';
        else if (hektary === null) bledy.hektary = '0270';
        else wpis.hektary = hektary;
      }
    }
    const tekst = (f.data[nr] ?? '').trim();
    if (tekst === '') {
      bledy[`data-${nr}`] = '0239';
    } else {
      const data = parsujDate(tekst);
      if (data === null) bledy[`data-${nr}`] = '0010';
      else if (porownajDaty(data, dzis) > 0) bledy[`data-${nr}`] = '0240';
      else wpis.data = data;
    }
    odpowiedzi.push(wpis);
  }
  return Object.keys(bledy).length > 0 ? { ok: false, bledy } : { ok: true, odpowiedzi };
}

/** Data pola okresu w formacie DD.MM.RRRR (0239, 0010); `dzis` ogranicza datę do dzisiejszej (0240). */
function walidujDateZ10(tekst: string, dzis: DataISO | null): DataISO | { kod: KodKomunikatu } {
  const t = tekst.trim();
  if (t === '') return { kod: '0239' };
  const data = parsujDate(t);
  if (data === null) return { kod: '0010' };
  if (dzis !== null && porownajDaty(data, dzis) > 0) return { kod: '0240' };
  return data;
}

/** Pytanie, którego odpowiedź tak wyłącza zasiłek po ustaniu ubezpieczenia (0237); null, gdy żadne. */
export function pytanieWylaczajace(odpowiedzi: OswiadczenieZ10['odpowiedzi']): NumerPytaniaZ10 | null {
  for (const odp of odpowiedzi) {
    if (!odp.tak) continue;
    if (odp.pytanie === 1 || odp.pytanie === 3) return odp.pytanie;
    if (odp.pytanie === 4 && DZIALALNOSC_WYLACZAJACA.includes(odp.rodzajDzialalnosci as RodzajDzialalnosciZ10)) return 4;
  }
  return null;
}

/** Komunikaty odpowiedzi oświadczenia Z-10 (0237, 0238–0240). */
export function sprawdzZ10(odpowiedzi: OswiadczenieZ10['odpowiedzi']): KodKomunikatu[] {
  const kody: KodKomunikatu[] = [];
  for (const odp of odpowiedzi) {
    if (!odp.tak) continue;
    if (PYTANIA_Z_INFORMACJA.includes(odp.pytanie) && !(odp.podmiot ?? odp.miejsce)) kody.push('0238');
    if (odp.pytanie === PYTANIE_URLOPU_Z10 ? !odp.urlop : !odp.data) kody.push('0239');
  }
  if (pytanieWylaczajace(odpowiedzi) !== null) kody.push('0237');
  return kody;
}
