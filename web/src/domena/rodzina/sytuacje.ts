// Sytuacje szczególne rodziny i spokojny tryb (kontrakt, sekcja 7.2). Właściciel: u25.
// Czyste funkcje: walidacja zgłoszenia, liczby dzieci, zapis w Danych ciąży i dziecka, spokojny tryb,
// warunki akcji przejęcia urlopu i sprawy K34. Datę dostają jako argument.
import { dodajDni, parsujDate } from '@/domena/daty';
import type {
  BledyPol,
  DaneCiazyIDziecka,
  DaneRodziny,
  DataISO,
  KodKomunikatu,
  LiczbaDzieci,
  Pesel,
  RodzajSytuacjiSzczegolnej,
  SytuacjaSzczegolna,
  ZnacznikCzasu,
} from '@/domena/typy';

// Rozszerzenie Pozycji planu o dane sytuacji szczególnej (kontrakt, sekcja 12.3). Krok planu
// `sytuacjaSzczegolna` zapisuje je przy sprawach po stracie dziecka; Kalendarz terminów (u13) bierze
// `terminPoStracie` jako termin sprawy K06, a widoki planu pokazują wymiar urlopu macierzyńskiego.
declare module '@/domena/typy/plan' {
  interface PozycjaPlanu {
    sytuacjaSzczegolna?: {
      terminPoStracie?: DataISO;               // K06 po urodzeniu martwego dziecka: data porodu + 3 dni
      wymiarMacierzynskiegoTygodni?: number;   // K07, K08 dla liczby dzieci pozostałych przy życiu
      zachowanaPoStracie?: boolean;            // sprawa złożona albo załatwiona, która zostaje w planie
    };
  }
}

/** Kolejność rodzajów jak we wzorze P22-02: najpierw sytuacje dziecka, potem sytuacje matki. */
export const RODZAJE_DZIECKA: readonly RodzajSytuacjiSzczegolnej[] = [
  'martwe-urodzenie',
  'poronienie',
  'zgon-dziecka',
  'przedwczesny-porod',
  'choroba-dziecka',
];
export const RODZAJE_MATKI: readonly RodzajSytuacjiSzczegolnej[] = ['szpital', 'orzeczenie', 'porzucenie', 'smierc-matki'];

/** Rodzaje, po których liczba dzieci pozostałych przy życiu maleje. */
export const RODZAJE_STRATY: readonly RodzajSytuacjiSzczegolnej[] = ['martwe-urodzenie', 'poronienie', 'zgon-dziecka'];
/** Rodzaje straty ciąży: data zdarzenia staje się datą porodu, dziecko nie urodziło się żywe. */
export const RODZAJE_STRATY_CIAZY: readonly RodzajSytuacjiSzczegolnej[] = ['martwe-urodzenie', 'poronienie'];
/** Rodzaje, po których plan pokazuje sprawę K35 Wsparcie organizacji w sytuacji szczególnej. */
export const RODZAJE_Z_K35: readonly RodzajSytuacjiSzczegolnej[] = [
  'martwe-urodzenie',
  'poronienie',
  'zgon-dziecka',
  'przedwczesny-porod',
  'choroba-dziecka',
  'szpital',
  'smierc-matki',
];

const RODZAJE_Z_DATA_PORODU: readonly RodzajSytuacjiSzczegolnej[] = ['zgon-dziecka', 'przedwczesny-porod', 'porzucenie'];

export type PoleSytuacji = 'rodzaj' | 'dataZdarzenia' | 'liczbaDzieci';

/** Pola formularza ViewSpecialSituation: tekst daty i wybór liczby dzieci jak w polach formularza. */
export interface FormularzSytuacji {
  rodzaj: RodzajSytuacjiSzczegolnej | null;
  dataZdarzenia: string;   // DD.MM.RRRR
  liczbaDzieci: string;    // '' bez wyboru, '1'…'5'
}

export const PUSTY_FORMULARZ_SYTUACJI: FormularzSytuacji = { rodzaj: null, dataZdarzenia: '', liczbaDzieci: '' };

/** Czy zgłoszenie sytuacji wymaga potwierdzonej daty porodu. */
export function czyWymagaDatyPorodu(rodzaj: RodzajSytuacjiSzczegolnej): boolean {
  return RODZAJE_Z_DATA_PORODU.includes(rodzaj);
}

export function czyDotyczyDziecka(rodzaj: RodzajSytuacjiSzczegolnej): boolean {
  return RODZAJE_DZIECKA.includes(rodzaj);
}

export function czyStrataCiazy(rodzaj: RodzajSytuacjiSzczegolnej): boolean {
  return RODZAJE_STRATY_CIAZY.includes(rodzaj);
}

/** Liczba dzieci z ciąży: liczba urodzonych dzieci, a przed potwierdzeniem daty porodu liczba z danych ciąży. */
export function liczbaDzieciZCiazy(daneCiazy: DaneCiazyIDziecka | null): number {
  if (daneCiazy === null) return 1;
  if (daneCiazy.dataPoroduPotwierdzona && daneCiazy.liczbaUrodzonychDzieci !== undefined) {
    return daneCiazy.liczbaUrodzonychDzieci;
  }
  return daneCiazy.liczbaDzieciZCiazy ?? daneCiazy.liczbaUrodzonychDzieci ?? 1;
}

function sumaDzieci(sytuacje: readonly SytuacjaSzczegolna[], rodzaje: readonly RodzajSytuacjiSzczegolnej[]): number {
  return sytuacje.filter((s) => rodzaje.includes(s.rodzaj)).reduce((suma, s) => suma + (s.liczbaDzieci ?? 1), 0);
}

export interface LiczbyDzieciRodziny {
  zCiazy: number;
  przyZyciu: number;              // z ciąży pomniejszona o dzieci z sytuacji straty
  urodzoneZywo: number;           // z ciąży pomniejszona o dzieci z urodzenia martwego dziecka i poronienia
  urodzoneZywoZaZyciem: number;   // urodzone żywo z zaświadczeniem „Za życiem”
}

export function liczbyDzieci(daneCiazy: DaneCiazyIDziecka | null): LiczbyDzieciRodziny {
  const zCiazy = liczbaDzieciZCiazy(daneCiazy);
  const sytuacje = daneCiazy?.sytuacjeSzczegolne ?? [];
  const przyZyciu = Math.max(0, zCiazy - sumaDzieci(sytuacje, RODZAJE_STRATY));
  const urodzoneZywo = Math.max(0, zCiazy - sumaDzieci(sytuacje, RODZAJE_STRATY_CIAZY));
  return { zCiazy, przyZyciu, urodzoneZywo, urodzoneZywoZaZyciem: daneCiazy?.zaswiadczenieZaZyciem ? urodzoneZywo : 0 };
}

/** Data zdarzenia wpisywana przez system: przy przedwczesnym porodzie data porodu z profilu rodziny. */
export function dataZdarzeniaZProfilu(rodzaj: RodzajSytuacjiSzczegolnej | null, daneCiazy: DaneCiazyIDziecka | null): DataISO | null {
  if (rodzaj === 'przedwczesny-porod' && daneCiazy?.dataPoroduPotwierdzona && daneCiazy.dataPorodu) return daneCiazy.dataPorodu;
  return null;
}

/** Propozycja daty zdarzenia przy stracie ciąży w profilu z potwierdzoną datą porodu. */
export function proponowanaDataZdarzenia(rodzaj: RodzajSytuacjiSzczegolnej | null, daneCiazy: DaneCiazyIDziecka | null): DataISO | null {
  if (rodzaj === null) return null;
  const zProfilu = dataZdarzeniaZProfilu(rodzaj, daneCiazy);
  if (zProfilu) return zProfilu;
  if (czyStrataCiazy(rodzaj) && daneCiazy?.dataPoroduPotwierdzona && daneCiazy.dataPorodu) return daneCiazy.dataPorodu;
  return null;
}

/** Czy pole liczby dzieci jest na formularzu: rodzaj dotyczący dziecka i więcej niż jedno dziecko z ciąży. */
export function czyPoleLiczbyDzieci(rodzaj: RodzajSytuacjiSzczegolnej | null, daneCiazy: DaneCiazyIDziecka | null): boolean {
  return rodzaj !== null && czyDotyczyDziecka(rodzaj) && liczbaDzieciZCiazy(daneCiazy) > 1;
}

/** Błędy zgłoszenia sytuacji: 0006, 0037, 0193, 0010, 0127, 0102. Komunikat 0194 pokazuje widok. */
export function walidujSytuacje(f: FormularzSytuacji, daneCiazy: DaneCiazyIDziecka | null, dzis: DataISO): BledyPol<PoleSytuacji> {
  const bledy: BledyPol<PoleSytuacji> = {};
  const potwierdzona = Boolean(daneCiazy?.dataPoroduPotwierdzona && daneCiazy.dataPorodu);
  if (f.rodzaj === null) bledy.rodzaj = '0006';
  else if (czyWymagaDatyPorodu(f.rodzaj) && !potwierdzona) bledy.rodzaj = '0037';

  if (dataZdarzeniaZProfilu(f.rodzaj, daneCiazy) === null) {
    const tekst = f.dataZdarzenia.trim();
    const data = parsujDate(tekst);
    if (tekst === '') bledy.dataZdarzenia = '0193';
    else if (data === null) bledy.dataZdarzenia = '0010';
    else if (data > dzis) bledy.dataZdarzenia = '0127';
    else if (f.rodzaj === 'zgon-dziecka' && potwierdzona && daneCiazy?.dataPorodu && data < daneCiazy.dataPorodu) {
      bledy.dataZdarzenia = '0102';
    }
  }

  if (czyPoleLiczbyDzieci(f.rodzaj, daneCiazy)) {
    const liczba = Number(f.liczbaDzieci);
    if (f.liczbaDzieci === '' || !Number.isInteger(liczba) || liczba < 1 || liczba > liczbaDzieciZCiazy(daneCiazy)) {
      bledy.liczbaDzieci = '0006';
    }
  }
  return bledy;
}

/** Komunikat informacyjny przy polu rodzaju: 0194 po wyborze poronienia. */
export function komunikatPrzyRodzaju(rodzaj: RodzajSytuacjiSzczegolnej | null): KodKomunikatu | null {
  return rodzaj === 'poronienie' ? '0194' : null;
}

/** Sytuacja gotowa do pokazania w arkuszu i zapisu; null, gdy formularz ma błędy. */
export interface ZgloszenieSytuacji {
  rodzaj: RodzajSytuacjiSzczegolnej;
  dataZdarzenia: DataISO;
  liczbaDzieci: number;
}

export function zgloszenieZFormularza(
  f: FormularzSytuacji,
  daneCiazy: DaneCiazyIDziecka | null,
  dzis: DataISO,
): ZgloszenieSytuacji | null {
  if (Object.keys(walidujSytuacje(f, daneCiazy, dzis)).length > 0 || f.rodzaj === null) return null;
  const data = dataZdarzeniaZProfilu(f.rodzaj, daneCiazy) ?? parsujDate(f.dataZdarzenia.trim());
  if (data === null) return null;
  const liczbaDzieci = czyPoleLiczbyDzieci(f.rodzaj, daneCiazy) ? Number(f.liczbaDzieci) : 1;
  return { rodzaj: f.rodzaj, dataZdarzenia: data, liczbaDzieci };
}

/** Puste Dane ciąży i dziecka dla rodziny, która zapisuje pierwszą sytuację bez danych ciąży. */
export function pusteDaneCiazy(): DaneCiazyIDziecka {
  return { dataPoroduPotwierdzona: false, dzieci: [], sytuacjeSzczegolne: [], spokojnyTryb: { wlaczony: false } };
}

function jakoLiczbaDzieci(n: number): LiczbaDzieci {
  return Math.min(5, Math.max(1, Math.round(n))) as LiczbaDzieci;
}

/**
 * Zapis sytuacji w Danych ciąży i dziecka: sytuacja ze źródłem odpowiedź rodzica, data porodu przy stracie
 * ciąży w profilu bez potwierdzonej daty, liczba dzieci urodzonych żywo i włączony spokojny tryb.
 */
export function zapiszSytuacjeWDanychCiazy(
  daneCiazy: DaneCiazyIDziecka | null,
  z: ZgloszenieSytuacji,
  w: { id: string; kontoZapisujace: Pesel; teraz: ZnacznikCzasu; dzis: DataISO },
): DaneCiazyIDziecka {
  const baza = daneCiazy ?? pusteDaneCiazy();
  const sytuacja: SytuacjaSzczegolna = {
    id: w.id,
    rodzaj: z.rodzaj,
    dataZdarzenia: z.dataZdarzenia,
    liczbaDzieci: z.liczbaDzieci,
    zrodlo: 'odpowiedz-rodzica',
    kontoZapisujace: w.kontoZapisujace,
    zapisano: w.teraz,
  };
  let nowe: DaneCiazyIDziecka = {
    ...baza,
    sytuacjeSzczegolne: [...(baza.sytuacjeSzczegolne ?? []), sytuacja],
    spokojnyTryb: baza.spokojnyTryb?.wlaczony
      ? baza.spokojnyTryb
      : { wlaczony: true, od: w.dzis },
  };
  if (czyStrataCiazy(z.rodzaj) && !(baza.dataPoroduPotwierdzona && baza.dataPorodu)) {
    nowe = {
      ...nowe,
      dataPorodu: z.dataZdarzenia,
      dataPoroduPotwierdzona: true,
      zrodloDatyPorodu: 'odpowiedz-rodzica',
      liczbaUrodzonychDzieci: jakoLiczbaDzieci(liczbaDzieciZCiazy(baza)),
    };
  }
  const liczby = liczbyDzieci(nowe);
  return { ...nowe, liczbaDzieciUrodzonychZywo: liczby.urodzoneZywo };
}

/** Wyłączenie spokojnego trybu: sytuacje zostają, tryb wyłączony z datą wyłączenia. */
export function wylaczSpokojnyTrybWDanychCiazy(daneCiazy: DaneCiazyIDziecka, dzis: DataISO): DaneCiazyIDziecka {
  return { ...daneCiazy, spokojnyTryb: { ...daneCiazy.spokojnyTryb, wlaczony: false, wylaczono: dzis } };
}

/** Czy rodzina jest w spokojnym trybie. Dane wyłączone z użycia po wycofaniu zgody nie włączają trybu. */
export function czySpokojnyTryb(daneCiazy: DaneCiazyIDziecka | null | undefined): boolean {
  return Boolean(daneCiazy && !daneCiazy.wylaczoneZUzycia && daneCiazy.spokojnyTryb?.wlaczony);
}

/** Komunikat po potwierdzeniu daty porodu: w spokojnym trybie 0126 w miejscu 0057 (dla 3.3.2). */
export function komunikatPoPotwierdzeniuPorodu(daneCiazy: DaneCiazyIDziecka | null | undefined): '0057' | '0126' {
  return czySpokojnyTryb(daneCiazy) ? '0126' : '0057';
}

/** Czy widok pokazuje treści, które wzory oznaczają jako gratulacyjne. */
export function czyTresciGratulacyjne(daneCiazy: DaneCiazyIDziecka | null | undefined): boolean {
  return !czySpokojnyTryb(daneCiazy);
}

/** Termin sprawy K06 po urodzeniu martwego dziecka albo poronieniu: data porodu + 3 dni. */
export function terminK06PoStracie(daneCiazy: DaneCiazyIDziecka | null): DataISO | null {
  if (daneCiazy === null || !daneCiazy.dataPorodu) return null;
  const liczby = liczbyDzieci(daneCiazy);
  const strataCiazy = daneCiazy.sytuacjeSzczegolne.some((s) => czyStrataCiazy(s.rodzaj));
  return strataCiazy && liczby.urodzoneZywo === 0 ? dodajDni(daneCiazy.dataPorodu, 3) : null;
}

/** Czy profil zawiera drugiego rodzica. */
export function czyJestDrugiRodzic(daneRodziny: DaneRodziny): boolean {
  const drugi = daneRodziny.drugiRodzic;
  if (drugi.formaZatrudnienia?.wartosc === 'brak-drugiego-rodzica') return false;
  return drugi.formaZatrudnienia !== null || Boolean(drugi.imie || drugi.pesel);
}

/** Ostatnio zapisana sytuacja matki uprawniająca do przejęcia urlopu macierzyńskiego przez ojca. */
export function sytuacjaMatkiDoPrzejecia(daneRodziny: DaneRodziny, daneCiazy: DaneCiazyIDziecka | null): SytuacjaSzczegolna | null {
  if (daneCiazy === null || daneCiazy.wylaczoneZUzycia) return null;
  if (!daneCiazy.dataPoroduPotwierdzona || !daneCiazy.dataPorodu || !czyJestDrugiRodzic(daneRodziny)) return null;
  const sytuacje = daneCiazy.sytuacjeSzczegolne.filter((s) => RODZAJE_MATKI.includes(s.rodzaj));
  return sytuacje.length === 0 ? null : sytuacje[sytuacje.length - 1];
}

/** Rodzaj straty i data zgonu do okresu zasiłku po stracie dziecka; najpóźniejszy zgon wyznacza koniec okresu. */
export function stratyDoOkresuK34(daneCiazy: DaneCiazyIDziecka):
  | { rodzaj: 'martwe-urodzenie' | 'zgon-dziecka' | 'poronienie'; dataZgonu?: DataISO }
  | null {
  const sytuacje = daneCiazy.sytuacjeSzczegolne;
  const zgony = sytuacje.filter((s) => s.rodzaj === 'zgon-dziecka').map((s) => s.dataZdarzenia).sort();
  if (zgony.length > 0) return { rodzaj: 'zgon-dziecka', dataZgonu: zgony[zgony.length - 1] };
  if (sytuacje.some((s) => s.rodzaj === 'martwe-urodzenie')) return { rodzaj: 'martwe-urodzenie' };
  if (sytuacje.some((s) => s.rodzaj === 'poronienie')) return { rodzaj: 'poronienie' };
  return null;
}

/** Kanał sprawy K34 według formy zatrudnienia matki; null, gdy matka nie podlegała ubezpieczeniu chorobowemu. */
export function kanalK34(daneRodziny: DaneRodziny): 'pracodawca' | 'zus' | null {
  const forma = daneRodziny.matka.formaZatrudnienia?.wartosc;
  if (forma === 'umowa-o-prace') return 'pracodawca';
  if ((forma === 'umowa-zlecenia' || forma === 'jdg') && daneRodziny.matka.dobrowolneChorobowe?.wartosc === true) return 'zus';
  return null;
}
