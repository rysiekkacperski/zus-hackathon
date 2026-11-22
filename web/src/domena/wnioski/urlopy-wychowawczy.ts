// Wniosek o urlop wychowawczy i o obniżenie wymiaru czasu pracy (historyjka 3.9.6.1.5, epik 3.9.6).
// Czyste funkcje: data bieżąca przychodzi jako argument `dzis`. Miesiąc urlopu liczymy jako 30 dni.
import { dodajDni, dodajLata, dodajMiesiace, parsujDate, porownajDaty, roznicaDni } from '@/domena/daty';
import type { DataISO, KodKomunikatu, Okres, WniosekOUrlop } from '@/domena/typy';
import type { DaneKreatora } from './urlopy';

/** Wymiar urlopu wychowawczego obojga rodziców i jednego rodzica bez przyczyny wymiaru 36 miesięcy. */
export const MIESIACE_WYCHOWAWCZEGO = 36;
export const MIESIACE_JEDNEGO_RODZICA = 35;
export const MAKS_CZESCI_WYCHOWAWCZEGO = 5;
export const DNI_TERMINU_WYCHOWAWCZEGO = 21;
const DNI_MIESIACA = 30;

export type PodrodzajWychowawczy = 'wychowawczy' | 'obnizenie-wymiaru';
export type PoleWychowawczego =
  | 'rodzaj' | 'dataPoczatku' | 'dataKonca' | 'czesc' | 'zamiar' | 'okresDrugiegoOd' | 'okresDrugiegoDo'
  | 'przyczyna36' | 'wymiarPracy' | 'dotychczasowa' | 'dotychczasowaOd' | 'dotychczasowaDo';

export interface OdpowiedziWychowawczego {
  rodzaj: 'do-6-lat' | 'niepelnosprawnosc';
  dataPoczatku: string;
  dataKonca: string;
  zamiar: '' | 'nie' | 'tak';
  okresDrugiegoOd: string;
  okresDrugiegoDo: string;
  przyczyna36: string;
  wymiarPracy: string;
  dotychczasowa: '' | 'nie' | 'tak';
  dotychczasowaOd: string;
  dotychczasowaDo: string;
}

export function czyWychowawczy(p: string | undefined): p is PodrodzajWychowawczy {
  return p === 'wychowawczy' || p === 'obnizenie-wymiaru';
}

/** Okres w pełnych miesiącach i pozostałych dniach, obie daty włącznie. */
export function miesiaceIDni(o: Okres): { miesiace: number; dni: number } {
  let m = 0;
  while (porownajDaty(dodajDni(dodajMiesiace(o.od, m + 1), -1), o.do) <= 0) m += 1;
  const dni = roznicaDni(dodajMiesiace(o.od, m), o.do) + 1;
  return { miesiace: m, dni: Math.max(0, dni) };
}

function dniOkresu(o: Okres): number {
  const { miesiace, dni } = miesiaceIDni(o);
  return miesiace * DNI_MIESIACA + dni;
}

export function zDni(dni: number): { miesiace: number; dni: number } {
  const d = Math.max(0, dni);
  return { miesiace: Math.floor(d / DNI_MIESIACA), dni: d % DNI_MIESIACA };
}

/** Parametry komunikatów 0283 i 0285: wymiar w miesiącach i dniach, zdanie składa teksty.komunikaty. */
export function parametryWymiaru(dni: number): { miesiace: string; dni: string } {
  const w = zDni(dni);
  return { miesiace: String(w.miesiace), dni: String(w.dni) };
}

/** Wysłane wnioski o urlop wychowawczy obojga rodziców. */
function wyslaneWychowawcze(dane: DaneKreatora): { okres: Okres; wlasny: boolean }[] {
  return dane.wyslane
    .filter((w) => w.wniosek.podrodzaj === 'wychowawczy' && w.wniosek.wychowawczy)
    .map((w) => ({ okres: w.wniosek.wychowawczy!.okres, wlasny: w.rodzic === dane.rodzic }));
}

export interface StanWychowawczego {
  wykorzystaneWlasne: number;
  wykorzystaneLacznie: number;
  liczbaCzesci: number;
  okresDrugiegoRodzica?: Okres;
}

export function stanWychowawczego(dane: DaneKreatora): StanWychowawczego {
  const lista = wyslaneWychowawcze(dane);
  const wlasne = lista.filter((w) => w.wlasny).reduce((s, w) => s + dniOkresu(w.okres), 0);
  const lacznie = lista.reduce((s, w) => s + dniOkresu(w.okres), 0);
  const drugiego = lista.filter((w) => !w.wlasny).at(-1)?.okres;
  return { wykorzystaneWlasne: wlasne, wykorzystaneLacznie: lacznie, liczbaCzesci: lista.length, okresDrugiegoRodzica: drugiego };
}

/** Pozostały wymiar urlopu w dniach (miesiąc = 30 dni) przed wnioskiem. */
export function pozostalyWymiar(stan: StanWychowawczego, zPrzyczyna: boolean): number {
  const naRodzica = (zPrzyczyna ? MIESIACE_WYCHOWAWCZEGO : MIESIACE_JEDNEGO_RODZICA) * DNI_MIESIACA - stan.wykorzystaneWlasne;
  const lacznie = MIESIACE_WYCHOWAWCZEGO * DNI_MIESIACA - stan.wykorzystaneLacznie;
  return Math.max(0, Math.min(naRodzica, lacznie));
}

/** Ostatni dzień, w którym rodzic może korzystać z urlopu: 31 grudnia roku 6. urodzin albo dzień przed 18. urodzinami. */
export function granicaWychowawczego(dataUrodzenia: DataISO, rodzaj: OdpowiedziWychowawczego['rodzaj']): DataISO {
  if (rodzaj === 'niepelnosprawnosc') return dodajDni(dodajLata(dataUrodzenia, 18), -1);
  return `${dodajLata(dataUrodzenia, 6).slice(0, 4)}-12-31` as DataISO;
}

export function odpowiedziPoczatkowe(dane: DaneKreatora, wniosek: WniosekOUrlop, formatuj: (d: DataISO) => string): OdpowiedziWychowawczego {
  const w = wniosek.wychowawczy;
  const drugi = w?.okresDrugiegoRodzica ?? stanWychowawczego(dane).okresDrugiegoRodzica;
  return {
    rodzaj: w?.rodzaj ?? 'do-6-lat',
    dataPoczatku: w ? formatuj(w.okres.od) : '',
    dataKonca: w ? formatuj(w.okres.do) : '',
    zamiar: w ? (w.okresDrugiegoRodzica ? 'tak' : 'nie') : drugi ? 'tak' : '',
    okresDrugiegoOd: drugi ? formatuj(drugi.od) : '',
    okresDrugiegoDo: drugi ? formatuj(drugi.do) : '',
    przyczyna36: w?.przyczyna36 ?? '',
    wymiarPracy: w?.wymiarPracy !== undefined ? String(w.wymiarPracy) : '',
    dotychczasowa: w ? (w.dotychczasowaPraca ? 'tak' : 'nie') : '',
    dotychczasowaOd: w?.dotychczasowaPraca ? formatuj(w.dotychczasowaPraca.od) : '',
    dotychczasowaDo: w?.dotychczasowaPraca ? formatuj(w.dotychczasowaPraca.do) : '',
  };
}

function data(tekst: string): { kod?: KodKomunikatu; data?: DataISO } {
  if (tekst.trim() === '') return { kod: '0201' };
  const d = parsujDate(tekst.trim());
  return d ? { data: d } : { kod: '0010' };
}

export interface OcenaWychowawczego {
  bledy: Partial<Record<PoleWychowawczego, KodKomunikatu>>;
  parametry: Partial<Record<PoleWychowawczego, Record<string, string>>>;
  ostrzezenie?: KodKomunikatu;
  numerCzesci: number;
  wymagaPrzyczyny: boolean;
  okres?: Okres;
  okresMiesiace?: { miesiace: number; dni: number };
  pozostalo: { miesiace: number; dni: number };
  wykorzystane: { miesiace: number; dni: number };
  zmiana?: Partial<WniosekOUrlop>;
}

export function ocenWychowawczy(
  podrodzaj: PodrodzajWychowawczy,
  o: OdpowiedziWychowawczego,
  dane: DaneKreatora,
  dzis: DataISO,
): OcenaWychowawczego {
  const bledy: OcenaWychowawczego['bledy'] = {};
  const parametry: OcenaWychowawczego['parametry'] = {};
  const stan = stanWychowawczego(dane);
  const numerCzesci = stan.liczbaCzesci + 1;
  const urodzenie = dane.dziecko?.dataUrodzenia ?? dane.przyjecie?.dataUrodzeniaDziecka ?? dane.dataPorodu;
  const poczatekPrawa = dane.przyjecie?.dataUprawomocnienia ?? urodzenie;
  const rodzaj = podrodzaj === 'wychowawczy' ? o.rodzaj : 'do-6-lat';
  const granica = urodzenie ? granicaWychowawczego(urodzenie, rodzaj) : undefined;
  const pocz = data(o.dataPoczatku);
  const kon = data(o.dataKonca);
  if (pocz.kod) bledy.dataPoczatku = pocz.kod;
  if (kon.kod) bledy.dataKonca = kon.kod;
  let okres: Okres | undefined;
  let ostrzezenie: KodKomunikatu | undefined;
  if (pocz.data) {
    if (poczatekPrawa && porownajDaty(pocz.data, poczatekPrawa) < 0) bledy.dataPoczatku = '0042';
    else if (roznicaDni(dzis, pocz.data) < DNI_TERMINU_WYCHOWAWCZEGO) ostrzezenie = podrodzaj === 'wychowawczy' ? '0281' : '0282';
  }
  if (pocz.data && kon.data && !bledy.dataPoczatku) {
    if (porownajDaty(kon.data, pocz.data) < 0) bledy.dataKonca = '0110';
    else if (granica && porownajDaty(kon.data, granica) > 0) bledy.dataKonca = '0042';
    else okres = { od: pocz.data, do: kon.data };
  }
  const dniWniosku = okres ? dniOkresu(okres) : 0;
  const wymagaPrzyczyny = podrodzaj === 'wychowawczy' && stan.wykorzystaneWlasne + dniWniosku > MIESIACE_JEDNEGO_RODZICA * DNI_MIESIACA;
  const zPrzyczyna = wymagaPrzyczyny && o.przyczyna36 !== '';
  const przed = pozostalyWymiar(stan, wymagaPrzyczyny);
  if (okres && podrodzaj === 'wychowawczy') {
    const lacznie = MIESIACE_WYCHOWAWCZEGO * DNI_MIESIACA - stan.wykorzystaneLacznie;
    if (dniWniosku > lacznie) {
      bledy.dataKonca = '0283';
      parametry.dataKonca = parametryWymiaru(lacznie);
    }
  }
  if (okres && podrodzaj === 'obnizenie-wymiaru') {
    const pozostaly = pozostalyWymiar(stan, false);
    if (dniWniosku > pozostaly) {
      bledy.dataKonca = '0285';
      parametry.dataKonca = parametryWymiaru(pozostaly);
    }
  }
  if (podrodzaj === 'wychowawczy') {
    if (numerCzesci > MAKS_CZESCI_WYCHOWAWCZEGO) bledy.czesc = '0288';
    if (o.zamiar === '') bledy.zamiar = '0006';
    if (o.zamiar === 'tak') {
      const od = data(o.okresDrugiegoOd);
      const doo = data(o.okresDrugiegoDo);
      if (od.kod) bledy.okresDrugiegoOd = od.kod;
      if (doo.kod) bledy.okresDrugiegoDo = doo.kod;
      if (od.data && doo.data && porownajDaty(doo.data, od.data) < 0) bledy.okresDrugiegoDo = '0110';
    }
    if (wymagaPrzyczyny && o.przyczyna36 === '') bledy.przyczyna36 = '0006';
  } else {
    const wymiar = /^\d+$/.test(o.wymiarPracy.trim()) ? Number(o.wymiarPracy.trim()) : NaN;
    if (!(wymiar >= 50 && wymiar <= 99)) bledy.wymiarPracy = '0284';
    if (o.dotychczasowa === '') bledy.dotychczasowa = '0006';
    if (o.dotychczasowa === 'tak') {
      const od = data(o.dotychczasowaOd);
      const doo = data(o.dotychczasowaDo);
      if (od.kod) bledy.dotychczasowaOd = od.kod;
      if (doo.kod) bledy.dotychczasowaDo = doo.kod;
    }
  }
  const pozostaloPo = Math.max(0, (zPrzyczyna ? pozostalyWymiar(stan, true) : przed) - (podrodzaj === 'wychowawczy' ? dniWniosku : 0));
  const okresMiesiace = okres ? miesiaceIDni(okres) : undefined;
  let zmiana: Partial<WniosekOUrlop> | undefined;
  if (okres && Object.keys(bledy).length === 0) {
    const p = zDni(pozostaloPo);
    const drugiOd = parsujDate(o.okresDrugiegoOd.trim());
    const drugiDo = parsujDate(o.okresDrugiegoDo.trim());
    const dotOd = parsujDate(o.dotychczasowaOd.trim());
    const dotDo = parsujDate(o.dotychczasowaDo.trim());
    zmiana = {
      okresy: [],
      numerCzesci: podrodzaj === 'wychowawczy' ? numerCzesci : undefined,
      oswiadczenia: { zamiarDrugiegoRodzica: podrodzaj === 'wychowawczy' ? o.zamiar === 'tak' : undefined },
      wychowawczy: {
        okres,
        rodzaj,
        miesiace: okresMiesiace!.miesiace,
        dni: okresMiesiace!.dni,
        numerCzesci,
        pozostaloMiesiace: p.miesiace,
        pozostaloDni: p.dni,
        okresDrugiegoRodzica: o.zamiar === 'tak' && drugiOd && drugiDo ? { od: drugiOd, do: drugiDo } : undefined,
        przyczyna36: wymagaPrzyczyny ? o.przyczyna36 : undefined,
        wymiarPracy: podrodzaj === 'obnizenie-wymiaru' ? Number(o.wymiarPracy.trim()) : undefined,
        dotychczasowaPraca: podrodzaj === 'obnizenie-wymiaru' ? (o.dotychczasowa === 'tak' && dotOd && dotDo ? { od: dotOd, do: dotDo } : null) : undefined,
      },
    };
  }
  return {
    bledy,
    parametry,
    ostrzezenie,
    numerCzesci,
    wymagaPrzyczyny,
    okres,
    okresMiesiace,
    pozostalo: zDni(pozostaloPo),
    wykorzystane: zDni(stan.wykorzystaneLacznie),
    zmiana,
  };
}

/** Załączniki wniosku: identyfikatory z teksty.ViewLeaveRequestForm.zalacznikiWychowawczego. */
export function zalacznikiWychowawczego(
  podrodzaj: PodrodzajWychowawczy,
  o: Pick<OdpowiedziWychowawczego, 'rodzaj' | 'przyczyna36'>,
  wymagaPrzyczyny: boolean,
): ('odpis-aktu-urodzenia' | 'oswiadczenie-drugiego-rodzica' | 'orzeczenie-niepelnosprawnosci' | 'akt-zgonu' | 'oswiadczenie-o-pracy')[] {
  if (podrodzaj === 'obnizenie-wymiaru') return ['odpis-aktu-urodzenia', 'oswiadczenie-o-pracy'];
  const lista: ReturnType<typeof zalacznikiWychowawczego> = ['odpis-aktu-urodzenia', 'oswiadczenie-drugiego-rodzica'];
  if (o.rodzaj === 'niepelnosprawnosc') lista.push('orzeczenie-niepelnosprawnosci');
  if (wymagaPrzyczyny && o.przyczyna36 === 'zgon') lista.push('akt-zgonu');
  return lista;
}

/** Ochrona przy obniżeniu wymiaru czasu pracy trwa łącznie najwyżej 12 miesięcy. */
export const MIESIACE_OCHRONY_OBNIZENIA = 12;

/**
 * Okres szczególnej ochrony po wysłaniu wniosku o urlop wychowawczy albo o obniżenie wymiaru czasu pracy (3.9.6.2.2).
 * Początek: dzień złożenia, nie wcześniej niż 21 dni przed początkiem okresu. Koniec urlopu wychowawczego: ostatni dzień
 * urlopu. Koniec obniżenia: ostatni dzień obniżenia, łącznie z wcześniejszym obniżeniem najwyżej 12 miesięcy.
 */
export function ochronaWychowawczego(
  wychowawczy: NonNullable<WniosekOUrlop['wychowawczy']>,
  podrodzaj: PodrodzajWychowawczy,
  dataZlozenia: DataISO,
): Okres {
  const wczesniej = dodajDni(wychowawczy.okres.od, -DNI_TERMINU_WYCHOWAWCZEGO);
  const od = porownajDaty(dataZlozenia, wczesniej) > 0 ? dataZlozenia : wczesniej;
  if (podrodzaj === 'wychowawczy') return { od, do: wychowawczy.okres.do };
  const dotychczas = wychowawczy.dotychczasowaPraca ? roznicaDni(wychowawczy.dotychczasowaPraca.od, wychowawczy.dotychczasowaPraca.do) + 1 : 0;
  const limit = dodajDni(dodajMiesiace(od, MIESIACE_OCHRONY_OBNIZENIA), -1 - dotychczas);
  return { od, do: porownajDaty(limit, wychowawczy.okres.do) < 0 ? limit : wychowawczy.okres.do };
}

/** Staż pracy uprawniający do urlopu wychowawczego i obniżenia wymiaru czasu pracy. */
export const MIESIACE_ZATRUDNIENIA_WYCHOWAWCZEGO = 6;

/**
 * Dzień, od którego pracownik ma 6 miesięcy zatrudnienia, z wliczeniem zakończonych okresów zatrudnienia (KA-02, KA-03).
 * Zwraca null bez trwającego zatrudnienia albo bez okresów w danych konta ZUS.
 */
export function dataSzesciuMiesiecyZatrudnienia(okresy: readonly { od: DataISO; do?: DataISO }[] | undefined): DataISO | null {
  if (!okresy || okresy.length === 0) return null;
  const trwajace = [...okresy].filter((o) => o.do === undefined).sort((a, b) => porownajDaty(a.od, b.od))[0];
  if (!trwajace) return null;
  let miesiace = 0;
  let dni = 0;
  for (const o of okresy) {
    if (o.do === undefined) continue;
    const w = miesiaceIDni({ od: o.od, do: o.do });
    miesiace += w.miesiace;
    dni += w.dni;
  }
  const pozostaloMiesiecy = MIESIACE_ZATRUDNIENIA_WYCHOWAWCZEGO - miesiace;
  if (pozostaloMiesiecy <= 0) return trwajace.od;
  const data = dodajDni(dodajMiesiace(trwajace.od, pozostaloMiesiecy), -dni);
  return porownajDaty(data, trwajace.od) < 0 ? trwajace.od : data;
}
