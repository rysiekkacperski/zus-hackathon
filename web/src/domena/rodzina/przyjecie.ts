// Przyjęcie dziecka na wychowanie (kontrakt, sekcja 7.2). Właściciel: u24 (Przyjęcie dziecka na wychowanie).
// Czyste funkcje: propozycja roli z PESEL, walidacja ViewProfileChildAdoption, wiek uprawniający do urlopu,
// terminy spraw po przyjęciu dziecka i komunikaty planu 0091, 0092.
import { dodajDni, dodajLata, dodajMiesiace, minData, ostatniDzienMiesiaca, parsujDate, porownajDaty } from '@/domena/daty';
import type {
  BledyPol,
  DaneCiazyIDziecka,
  DataISO,
  Etap,
  FormaPrzyjecia,
  IdPozycji,
  Katalog,
  KodKomunikatu,
  LiczbaDzieci,
  Pesel,
  PrzyjecieDziecka,
} from '@/domena/typy';

export type RolaRodzicaPrzyjmujacego = PrzyjecieDziecka['rolaRodzicaPrzyjmujacego'];
export type OdpowiedzTakNie = 'tak' | 'nie';

/** Pola formularza ViewProfileChildAdoption: daty jako tekst wpisany przez użytkownika. */
export interface FormularzPrzyjecia {
  rola: RolaRodzicaPrzyjmujacego | null;
  forma: FormaPrzyjecia | null;
  dataPrzyjecia: string;
  dataWystapieniaDoSadu: string;               // tylko przysposobienie, obowiązkowo (3.3.4.1.3)
  /** Data urodzenia pierwszego przyjętego dziecka; kolejne dzieci w polach dataUrodzenia2..5. */
  dataUrodzenia: string;
  dataUrodzenia2: string;
  dataUrodzenia3: string;
  dataUrodzenia4: string;
  dataUrodzenia5: string;
  liczbaDzieci: LiczbaDzieci | null;
  odroczenie: OdpowiedzTakNie | null;          // tylko rodzina zastępcza niezawodowa
  dataUprawomocnienia: string;                 // tylko przysposobienie, nieobowiązkowo
}

export type PoleFormularzaPrzyjecia = keyof FormularzPrzyjecia;

/** Pola dat urodzenia kolejnych przyjętych dzieci; przy pięciorgu i więcej pięć najmłodszych dzieci. */
export const POLA_DAT_URODZENIA = [
  'dataUrodzenia',
  'dataUrodzenia2',
  'dataUrodzenia3',
  'dataUrodzenia4',
  'dataUrodzenia5',
] as const satisfies readonly PoleFormularzaPrzyjecia[];

export type PoleDatyUrodzenia = (typeof POLA_DAT_URODZENIA)[number];

/** Pola dat urodzenia pokazywane przy danej liczbie jednocześnie przyjętych dzieci. */
export function polaDatUrodzenia(liczba: LiczbaDzieci | null): readonly PoleDatyUrodzenia[] {
  return POLA_DAT_URODZENIA.slice(0, Math.min(Math.max(liczba ?? 1, 1), POLA_DAT_URODZENIA.length));
}

/** Kolejność pól na ekranie ze wzoru P21-02 (fokus na pierwszym polu z błędem). */
export const KOLEJNOSC_POL_PRZYJECIA: readonly PoleFormularzaPrzyjecia[] = [
  'rola',
  'forma',
  'dataPrzyjecia',
  'dataWystapieniaDoSadu',
  'odroczenie',
  'dataUprawomocnienia',
  'liczbaDzieci',
  ...POLA_DAT_URODZENIA,
];

/** Horyzont daty wystąpienia do sądu opiekuńczego: dziś powiększone o 12 miesięcy. */
export const HORYZONT_WYSTAPIENIA_DO_SADU_MIESIECY = 12;

/** Horyzont daty przyjęcia: dziś powiększone o 12 miesięcy. */
export const HORYZONT_PRZYJECIA_MIESIECY = 12;

/** Rola rodzica przyjmującego z płci zakodowanej w numerze PESEL: parzysta 10. cyfra to matka. */
export function proponujRoleZPesel(p: Pesel): 'matka' | 'ojciec' {
  const cyfra = Number(p.charAt(9));
  return Number.isInteger(cyfra) && cyfra % 2 === 1 ? 'ojciec' : 'matka';
}

/** Najpóźniejsza dopuszczalna data przyjęcia dziecka. */
export function najpozniejszaDataPrzyjecia(dzis: DataISO): DataISO {
  return dodajMiesiace(dzis, HORYZONT_PRZYJECIA_MIESIECY);
}

/** Formularz wypełniony zapisanymi danymi przyjęcia albo propozycją z PESEL i jednym dzieckiem. */
export function formularzZPrzyjecia(
  przyjecie: PrzyjecieDziecka | undefined,
  pesel: Pesel,
  formatuj: (d: DataISO) => string,
): FormularzPrzyjecia {
  if (przyjecie === undefined) {
    return {
      rola: proponujRoleZPesel(pesel),
      forma: null,
      dataPrzyjecia: '',
      dataWystapieniaDoSadu: '',
      dataUrodzenia: '',
      dataUrodzenia2: '',
      dataUrodzenia3: '',
      dataUrodzenia4: '',
      dataUrodzenia5: '',
      liczbaDzieci: 1,
      odroczenie: null,
      dataUprawomocnienia: '',
    };
  }
  const daty = datyUrodzeniaPrzyjetych(przyjecie);
  const data = (i: number) => (daty[i] ? formatuj(daty[i]) : '');
  return {
    rola: przyjecie.rolaRodzicaPrzyjmujacego,
    forma: przyjecie.forma,
    dataPrzyjecia: formatuj(przyjecie.dataPrzyjecia),
    dataWystapieniaDoSadu: przyjecie.dataWystapieniaDoSadu ? formatuj(przyjecie.dataWystapieniaDoSadu) : '',
    dataUrodzenia: data(0),
    dataUrodzenia2: data(1),
    dataUrodzenia3: data(2),
    dataUrodzenia4: data(3),
    dataUrodzenia5: data(4),
    liczbaDzieci: przyjecie.liczbaPrzyjetychDzieci,
    odroczenie:
      przyjecie.odroczenieObowiazkuSzkolnego === undefined ? null : przyjecie.odroczenieObowiazkuSzkolnego ? 'tak' : 'nie',
    dataUprawomocnienia: przyjecie.dataUprawomocnienia ? formatuj(przyjecie.dataUprawomocnienia) : '',
  };
}

type WynikDaty = { data: DataISO } | { kod: KodKomunikatu } | { pusta: true };

// Kolejność kontroli daty (analiza 21, R11): format, potem pustość, potem zakres.
function odczytajDate(tekst: string): WynikDaty {
  const przyciety = tekst.trim();
  if (przyciety === '') return { pusta: true };
  const data = parsujDate(przyciety);
  return data === null ? { kod: '0010' } : { data };
}

/** Błędy danych przyjęcia: 0006, 0010, 0088, 0089, 0090, 0163, 0191, 0125. */
export function walidujDanePrzyjecia(f: FormularzPrzyjecia, dzis: DataISO): BledyPol<PoleFormularzaPrzyjecia> {
  const bledy: BledyPol<PoleFormularzaPrzyjecia> = {};
  if (f.rola === null) bledy.rola = '0006';
  if (f.forma === null) bledy.forma = '0006';
  if (f.liczbaDzieci === null) bledy.liczbaDzieci = '0006';
  if (f.forma === 'rodzina-zastepcza-niezawodowa' && f.odroczenie === null) bledy.odroczenie = '0006';

  const przyjecie = odczytajDate(f.dataPrzyjecia);
  let dataPrzyjecia: DataISO | null = null;
  if ('pusta' in przyjecie) bledy.dataPrzyjecia = '0088';
  else if ('kod' in przyjecie) bledy.dataPrzyjecia = przyjecie.kod;
  else if (porownajDaty(przyjecie.data, najpozniejszaDataPrzyjecia(dzis)) > 0) bledy.dataPrzyjecia = '0089';
  else dataPrzyjecia = przyjecie.data;

  // Data urodzenia każdego przyjętego dziecka (3.3.4.1.3): 0163, 0010, 0191, 0090 przy polu dziecka.
  for (const pole of polaDatUrodzenia(f.liczbaDzieci)) {
    const urodzenie = odczytajDate(f[pole]);
    if ('pusta' in urodzenie) bledy[pole] = '0163';
    else if ('kod' in urodzenie) bledy[pole] = urodzenie.kod;
    else if (porownajDaty(urodzenie.data, dzis) > 0) bledy[pole] = '0191';
    else if (dataPrzyjecia !== null && porownajDaty(urodzenie.data, dataPrzyjecia) > 0) bledy[pole] = '0090';
  }

  if (f.forma === 'przysposobienie') {
    const sad = odczytajDate(f.dataWystapieniaDoSadu);
    if ('pusta' in sad) bledy.dataWystapieniaDoSadu = '0273';
    else if ('kod' in sad) bledy.dataWystapieniaDoSadu = sad.kod;
    else if (porownajDaty(sad.data, dodajMiesiace(dzis, HORYZONT_WYSTAPIENIA_DO_SADU_MIESIECY)) > 0) {
      bledy.dataWystapieniaDoSadu = '0274';
    }
  }

  if (f.forma === 'przysposobienie') {
    const uprawomocnienie = odczytajDate(f.dataUprawomocnienia);
    if ('kod' in uprawomocnienie) bledy.dataUprawomocnienia = uprawomocnienie.kod;
    else if ('data' in uprawomocnienie && porownajDaty(uprawomocnienie.data, dzis) > 0) bledy.dataUprawomocnienia = '0125';
  }
  return bledy;
}

/** Dane przyjęcia ze źródłem odpowiedź rodzica z poprawnego formularza; null przy błędach. */
export function zbudujPrzyjecie(f: FormularzPrzyjecia, dzis: DataISO): PrzyjecieDziecka | null {
  if (Object.keys(walidujDanePrzyjecia(f, dzis)).length > 0) return null;
  const dataPrzyjecia = parsujDate(f.dataPrzyjecia.trim());
  const datyUrodzenia = polaDatUrodzenia(f.liczbaDzieci).map((pole) => parsujDate(f[pole].trim()));
  const dataUrodzenia = datyUrodzenia[0] ?? null;
  if (
    f.rola === null ||
    f.forma === null ||
    f.liczbaDzieci === null ||
    dataPrzyjecia === null ||
    dataUrodzenia === null ||
    datyUrodzenia.some((d) => d === null)
  ) {
    return null;
  }
  const przyjecie: PrzyjecieDziecka = {
    rolaRodzicaPrzyjmujacego: f.rola,
    forma: f.forma,
    dataPrzyjecia,
    dataUrodzeniaDziecka: dataUrodzenia,
    datyUrodzeniaDzieci: datyUrodzenia as DataISO[],
    liczbaPrzyjetychDzieci: f.liczbaDzieci,
    zrodlo: 'odpowiedz-rodzica',
  };
  if (f.forma === 'rodzina-zastepcza-niezawodowa') przyjecie.odroczenieObowiazkuSzkolnego = f.odroczenie === 'tak';
  if (f.forma === 'przysposobienie') {
    const sad = parsujDate(f.dataWystapieniaDoSadu.trim());
    if (sad !== null) przyjecie.dataWystapieniaDoSadu = sad;
    const uprawomocnienie = parsujDate(f.dataUprawomocnienia.trim());
    if (uprawomocnienie !== null) przyjecie.dataUprawomocnienia = uprawomocnienie;
  }
  return przyjecie;
}

// --- Wiek uprawniający do urlopu ---------------------------------------------------------------

/** Wartości ze słownika wymiarów i okresów obowiązujące przy uruchomieniu katalogu. */
const WIEK_DOMYSLNY = { przysposobienie: 14, odroczenie: 10, rodzinaZastepcza: 7 } as const;

// Wpis słownika wymiarów „Wiek dziecka uprawniający do urlopu na warunkach urlopu macierzyńskiego” (u04)
// z wariantami rodzinaZastepczaNiezawodowa, odroczonyObowiazekSzkolny i przysposobienie. Bez wpisu szukamy po nazwie.
const ID_WPISU_WIEKU = 'wiek-dziecka-urlop-na-warunkach-urlopu-macierzynskiego';
const KLUCZ_WIEKU = {
  przysposob: 'przysposobienie',
  odrocz: 'odroczonyObowiazekSzkolny',
  zastepcz: 'rodzinaZastepczaNiezawodowa',
} as const;

function wiekZKatalogu(katalog: Katalog, klucz: keyof typeof KLUCZ_WIEKU): number | null {
  const wpis =
    katalog.slowniki.find((s) => s.id === ID_WPISU_WIEKU) ??
    katalog.slowniki.find((s) => s.slownik === 'wymiary-i-okresy' && /wiek dziecka uprawniaj/i.test(s.nazwa));
  if (wpis === undefined) return null;
  const wersja = wpis.wersje[wpis.wersje.length - 1];
  if (wersja === undefined) return null;
  const wariant =
    wpis.warianty.find((w) => w.klucz === KLUCZ_WIEKU[klucz]) ??
    wpis.warianty.find((w) => w.klucz.toLowerCase().includes(klucz) || w.etykieta.toLowerCase().includes(klucz));
  const wartosc = wariant ? wersja.wartosci[wariant.klucz] : undefined;
  return typeof wartosc === 'number' && wartosc > 0 ? wartosc : null;
}

/**
 * Wiek dziecka w latach, do którego przysługuje urlop na warunkach urlopu macierzyńskiego:
 * 14 lat przy przysposobieniu, 7 lat w rodzinie zastępczej niezawodowej, 10 lat przy odroczeniu
 * obowiązku szkolnego. Rodzina zastępcza zawodowa nie ma tego urlopu, więc wynik to 0.
 */
export function wiekGraniczny(forma: FormaPrzyjecia, odroczenie: boolean, katalog: Katalog): number {
  if (forma === 'rodzina-zastepcza-zawodowa') return 0;
  if (forma === 'przysposobienie') return wiekZKatalogu(katalog, 'przysposob') ?? WIEK_DOMYSLNY.przysposobienie;
  if (odroczenie) return wiekZKatalogu(katalog, 'odrocz') ?? WIEK_DOMYSLNY.odroczenie;
  return wiekZKatalogu(katalog, 'zastepcz') ?? WIEK_DOMYSLNY.rodzinaZastepcza;
}

/** Wiek graniczny dla zapisanych danych przyjęcia. */
export function wiekGranicznyPrzyjecia(p: PrzyjecieDziecka, katalog: Katalog): number {
  return wiekGraniczny(p.forma, p.odroczenieObowiazkuSzkolnego === true, katalog);
}

/** Daty urodzenia wszystkich przyjętych dzieci (dane sprzed 3.3.4.1.3 mają jedną datę). */
export function datyUrodzeniaPrzyjetych(p: PrzyjecieDziecka): DataISO[] {
  return p.datyUrodzeniaDzieci && p.datyUrodzeniaDzieci.length > 0 ? p.datyUrodzeniaDzieci : [p.dataUrodzeniaDziecka];
}

/**
 * Początek terminów spraw K31 i K32 (3.3.4.1.4): przy przysposobieniu późniejsza z dat przyjęcia dziecka
 * i wystąpienia do sądu opiekuńczego, w pozostałych formach data przyjęcia dziecka.
 */
export function poczatekTerminowPrzyjecia(p: PrzyjecieDziecka): DataISO {
  if (p.forma !== 'przysposobienie' || p.dataWystapieniaDoSadu === undefined) return p.dataPrzyjecia;
  return porownajDaty(p.dataWystapieniaDoSadu, p.dataPrzyjecia) > 0 ? p.dataWystapieniaDoSadu : p.dataPrzyjecia;
}

/** Daty urodzenia dzieci, które w dniu przyjęcia nie ukończyły `lata` lat (urodziny kończą wiek). */
export function dzieciPrzedUkonczeniemLat(p: PrzyjecieDziecka, lata: number): DataISO[] {
  return datyUrodzeniaPrzyjetych(p).filter((d) => porownajDaty(p.dataPrzyjecia, dodajLata(d, lata)) < 0);
}

/** Daty urodzenia dzieci, które w dniu przyjęcia nie ukończyły `miesiace` miesięcy. */
export function dzieciPrzedUkonczeniemMiesiecy(p: PrzyjecieDziecka, miesiace: number): DataISO[] {
  return datyUrodzeniaPrzyjetych(p).filter((d) => porownajDaty(p.dataPrzyjecia, dodajMiesiace(d, miesiace)) < 0);
}

/** Czy co najmniej jedno przyjęte dziecko w dniu przyjęcia nie ukończyło `lata` lat. */
export function przedUkonczeniemLat(p: PrzyjecieDziecka, lata: number): boolean {
  return dzieciPrzedUkonczeniemLat(p, lata).length > 0;
}

/** Czy co najmniej jedno przyjęte dziecko w dniu przyjęcia nie ukończyło `miesiace` miesięcy. */
export function przedUkonczeniemMiesiecy(p: PrzyjecieDziecka, miesiace: number): boolean {
  return dzieciPrzedUkonczeniemMiesiecy(p, miesiace).length > 0;
}

/** Daty urodzenia dzieci w wieku uprawniającym do urlopu na warunkach urlopu macierzyńskiego i rodzicielskiego. */
export function dzieciWWiekuUprawniajacym(p: PrzyjecieDziecka, katalog: Katalog): DataISO[] {
  const wiek = wiekGranicznyPrzyjecia(p, katalog);
  return wiek > 0 ? dzieciPrzedUkonczeniemLat(p, wiek) : [];
}

/** Co najmniej jedno dziecko w wieku uprawniającym do urlopu na warunkach urlopu macierzyńskiego i rodzicielskiego. */
export function czyWWiekuUprawniajacym(p: PrzyjecieDziecka, katalog: Katalog): boolean {
  return dzieciWWiekuUprawniajacym(p, katalog).length > 0;
}

/** Najstarsze (najwcześniej urodzone) i najmłodsze dziecko z listy dat urodzenia. */
export function najstarsze(daty: readonly DataISO[]): DataISO | undefined {
  return [...daty].sort(porownajDaty)[0];
}

export function najmlodsze(daty: readonly DataISO[]): DataISO | undefined {
  return [...daty].sort(porownajDaty).at(-1);
}

// --- Komunikaty planu ---------------------------------------------------------------------------

export interface KomunikatPlanuPrzyjecia {
  etap: Etap;
  kod: '0091' | '0092' | '0263';
  parametry?: { wiek: string; liczbaDzieci?: string };
}

/**
 * Komunikaty etapu Urlopy i zasiłek macierzyński na ViewFamilyPlan po przyjęciu dziecka:
 * 0092 przy rodzinie zastępczej zawodowej, 0091 z wiekiem 7, 10 albo 14 lat, gdy dziecko
 * w dniu przyjęcia ukończyło wiek uprawniający do urlopu.
 */
export function komunikatyPlanuPoPrzyjeciu(
  daneCiazy: DaneCiazyIDziecka | null | undefined,
  katalog: Katalog,
): KomunikatPlanuPrzyjecia[] {
  const p = daneCiazy?.przyjecie;
  if (p === undefined) return [];
  if (p.forma === 'rodzina-zastepcza-zawodowa') return [{ etap: 'urlopy-i-zasilek', kod: '0092' }];
  const wiek = wiekGranicznyPrzyjecia(p, katalog);
  const wWieku = dzieciPrzedUkonczeniemLat(p, wiek).length;
  const wszystkie = datyUrodzeniaPrzyjetych(p).length;
  if (wWieku === 0) return [{ etap: 'urlopy-i-zasilek', kod: '0091', parametry: { wiek: String(wiek) } }];
  // 3.3.4.1.4: część przyjętych dzieci ukończyła wiek graniczny, więc wymiar urlopu liczymy dla dzieci w wieku.
  if (wWieku < wszystkie) {
    return [{ etap: 'urlopy-i-zasilek', kod: '0263', parametry: { wiek: String(wiek), liczbaDzieci: String(wWieku) } }];
  }
  return [];
}

// --- Terminy spraw po przyjęciu -----------------------------------------------------------------

export type KotwicaPrzyjecia = 'data-przyjecia' | 'data-uprawomocnienia' | 'data-urodzenia-dziecka';

export interface TerminPoPrzyjeciu {
  termin: DataISO | null;
  drugiTermin?: DataISO;
  kotwica: { rodzaj: KotwicaPrzyjecia; data: DataISO } | null;
  kodBrakuTerminu?: '0192' | '0259';
}

/**
 * Termin sprawy K09 po przysposobieniu (3.3.4.1.4, KA-07, KA-09): 7 dni przed ostatnim dniem rozpoczęcia
 * urlopu ojcowskiego, czyli ostatni dzień złożenia pracodawcy wniosku o urlop. Ostatni dzień rozpoczęcia
 * 14 dni urlopu przypada w 12 miesiącach od uprawomocnienia się orzeczenia i 14 dni przed ukończeniem
 * 14 lat przez najstarsze dziecko poniżej tego wieku.
 */
export function terminK09PoPrzysposobieniu(p: PrzyjecieDziecka, dataUprawomocnienia: DataISO): DataISO {
  const odUprawomocnienia = dodajDni(dodajMiesiace(dataUprawomocnienia, 12), -13);
  const najstarszePonizej14 = najstarsze(dzieciPrzedUkonczeniemLat(p, 14)) ?? p.dataUrodzeniaDziecka;
  const przed14 = dodajDni(dodajLata(najstarszePonizej14, 14), -14);
  return dodajDni(minData(odUprawomocnienia, przed14), -7);
}

/** Liczba dzieci spełniających warunek wieku sprawy po przyjęciu (kwota za każde dziecko, 3.3.4.1.4). */
export function liczbaDzieciSprawyPoPrzyjeciu(idPozycji: IdPozycji, p: PrzyjecieDziecka, katalog: Katalog): number {
  switch (idPozycji) {
    case 'K09':
      return dzieciPrzedUkonczeniemLat(p, 14).length;
    case 'K10':
    case 'K16':
    case 'K31':
    case 'K32':
      return dzieciWWiekuUprawniajacym(p, katalog).length;
    case 'K15':
      return dzieciPrzedUkonczeniemLat(p, 1).length;
    case 'K18':
      return dzieciPrzedUkonczeniemMiesiecy(p, 36).length;
    default:
      return p.liczbaPrzyjetychDzieci;
  }
}

/** Sprawy, których terminy po przyjęciu dziecka liczy reguła tej jednostki. */
export const SPRAWY_Z_TERMINEM_PRZYJECIA: readonly IdPozycji[] = [
  'K05', 'K09', 'K10', 'K12', 'K14', 'K15', 'K16', 'K17', 'K18', 'K31', 'K32', 'K33',
];

/**
 * Termin sprawy po przyjęciu dziecka (wymaganie Sprawy po przyjęciu dziecka i Sprawy ciąży i porodu
 * po przyjęciu dziecka). Wynik null oznacza sprawę spoza listy, liczoną według pozycji katalogu.
 */
export function terminPoPrzyjeciu(idPozycji: IdPozycji, p: PrzyjecieDziecka, katalog: Katalog): TerminPoPrzyjeciu | null {
  const przyjecie = { rodzaj: 'data-przyjecia' as const, data: p.dataPrzyjecia };
  const poczatek = { rodzaj: 'data-przyjecia' as const, data: poczatekTerminowPrzyjecia(p) };
  // 3.3.4.1.4: termin zależny od wieku od najstarszego dziecka spełniającego warunek sprawy, K10 od najmłodszego.
  const urodzenieZ = (daty: readonly DataISO[], najmlodszego = false) => {
    const data = (najmlodszego ? najmlodsze(daty) : najstarsze(daty)) ?? p.dataUrodzeniaDziecka;
    return { rodzaj: 'data-urodzenia-dziecka' as const, data };
  };
  const urodzenie = urodzenieZ(datyUrodzeniaPrzyjetych(p));
  const przed18 = dodajDni(dodajLata(urodzenie.data, 18), -1);
  switch (idPozycji) {
    case 'K31':
      return { termin: dodajDni(poczatek.data, 7), drugiTermin: dodajDni(poczatek.data, 21), kotwica: poczatek };
    case 'K32':
      return { termin: dodajDni(poczatek.data, 21), kotwica: poczatek };
    case 'K33':
      return { termin: null, kotwica: null };
    case 'K09': {
      if (p.dataUprawomocnienia === undefined) return { termin: null, kotwica: null, kodBrakuTerminu: '0192' };
      return { termin: terminK09PoPrzysposobieniu(p, p.dataUprawomocnienia), kotwica: { rodzaj: 'data-uprawomocnienia', data: p.dataUprawomocnienia } };
    }
    case 'K10': {
      const wiek = wiekGranicznyPrzyjecia(p, katalog);
      const u = urodzenieZ(dzieciWWiekuUprawniajacym(p, katalog), true);
      return { termin: dodajDni(dodajLata(u.data, wiek), -1), kotwica: u };
    }
    case 'K05':
      if (p.forma !== 'przysposobienie') return { termin: dodajDni(p.dataPrzyjecia, 7), kotwica: przyjecie };
      if (p.dataUprawomocnienia === undefined) return { termin: null, kotwica: null, kodBrakuTerminu: '0259' };
      return { termin: dodajDni(p.dataUprawomocnienia, 7), kotwica: { rodzaj: 'data-uprawomocnienia', data: p.dataUprawomocnienia } };
    case 'K12':
    case 'K16':
      return { termin: dodajMiesiace(p.dataPrzyjecia, 3), kotwica: przyjecie };
    case 'K14':
    case 'K17':
      return { termin: minData(dodajMiesiace(p.dataPrzyjecia, 12), przed18), kotwica: przyjecie };
    case 'K15': {
      const u = urodzenieZ(dzieciPrzedUkonczeniemLat(p, 1));
      return { termin: dodajDni(dodajLata(u.data, 1), -1), kotwica: u };
    }
    case 'K18': {
      const roczek = dodajMiesiace(urodzenieZ(dzieciPrzedUkonczeniemMiesiecy(p, 36)).data, 12);
      return porownajDaty(p.dataPrzyjecia, roczek) >= 0
        ? { termin: ostatniDzienMiesiaca(p.dataPrzyjecia), kotwica: przyjecie }
        : { termin: ostatniDzienMiesiaca(roczek), kotwica: urodzenie };
    }
    default:
      return null;
  }
}
