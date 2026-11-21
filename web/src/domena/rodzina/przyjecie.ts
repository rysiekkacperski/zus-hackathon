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
  dataUrodzenia: string;
  liczbaDzieci: LiczbaDzieci | null;
  odroczenie: OdpowiedzTakNie | null;          // tylko rodzina zastępcza niezawodowa
  dataUprawomocnienia: string;                 // tylko przysposobienie, nieobowiązkowo
}

export type PoleFormularzaPrzyjecia = keyof FormularzPrzyjecia;

/** Kolejność pól na ekranie ze wzoru P21-02 (fokus na pierwszym polu z błędem). */
export const KOLEJNOSC_POL_PRZYJECIA: readonly PoleFormularzaPrzyjecia[] = [
  'rola',
  'forma',
  'dataPrzyjecia',
  'dataUrodzenia',
  'odroczenie',
  'dataUprawomocnienia',
  'liczbaDzieci',
];

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
      dataUrodzenia: '',
      liczbaDzieci: 1,
      odroczenie: null,
      dataUprawomocnienia: '',
    };
  }
  return {
    rola: przyjecie.rolaRodzicaPrzyjmujacego,
    forma: przyjecie.forma,
    dataPrzyjecia: formatuj(przyjecie.dataPrzyjecia),
    dataUrodzenia: formatuj(przyjecie.dataUrodzeniaDziecka),
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

  const urodzenie = odczytajDate(f.dataUrodzenia);
  if ('pusta' in urodzenie) bledy.dataUrodzenia = '0163';
  else if ('kod' in urodzenie) bledy.dataUrodzenia = urodzenie.kod;
  else if (porownajDaty(urodzenie.data, dzis) > 0) bledy.dataUrodzenia = '0191';
  else if (dataPrzyjecia !== null && porownajDaty(urodzenie.data, dataPrzyjecia) > 0) bledy.dataUrodzenia = '0090';

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
  const dataUrodzenia = parsujDate(f.dataUrodzenia.trim());
  if (f.rola === null || f.forma === null || f.liczbaDzieci === null || dataPrzyjecia === null || dataUrodzenia === null) {
    return null;
  }
  const przyjecie: PrzyjecieDziecka = {
    rolaRodzicaPrzyjmujacego: f.rola,
    forma: f.forma,
    dataPrzyjecia,
    dataUrodzeniaDziecka: dataUrodzenia,
    liczbaPrzyjetychDzieci: f.liczbaDzieci,
    zrodlo: 'odpowiedz-rodzica',
  };
  if (f.forma === 'rodzina-zastepcza-niezawodowa') przyjecie.odroczenieObowiazkuSzkolnego = f.odroczenie === 'tak';
  if (f.forma === 'przysposobienie') {
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

/** Czy dziecko w dniu przyjęcia nie ukończyło `lata` lat (urodziny kończą wiek). */
export function przedUkonczeniemLat(p: PrzyjecieDziecka, lata: number): boolean {
  return porownajDaty(p.dataPrzyjecia, dodajLata(p.dataUrodzeniaDziecka, lata)) < 0;
}

/** Czy dziecko w dniu przyjęcia nie ukończyło `miesiace` miesięcy. */
export function przedUkonczeniemMiesiecy(p: PrzyjecieDziecka, miesiace: number): boolean {
  return porownajDaty(p.dataPrzyjecia, dodajMiesiace(p.dataUrodzeniaDziecka, miesiace)) < 0;
}

/** Dziecko w wieku uprawniającym do urlopu na warunkach urlopu macierzyńskiego i rodzicielskiego. */
export function czyWWiekuUprawniajacym(p: PrzyjecieDziecka, katalog: Katalog): boolean {
  const wiek = wiekGranicznyPrzyjecia(p, katalog);
  return wiek > 0 && przedUkonczeniemLat(p, wiek);
}

// --- Komunikaty planu ---------------------------------------------------------------------------

export interface KomunikatPlanuPrzyjecia {
  etap: Etap;
  kod: '0091' | '0092';
  parametry?: { wiek: string };
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
  if (przedUkonczeniemLat(p, wiek)) return [];
  return [{ etap: 'urlopy-i-zasilek', kod: '0091', parametry: { wiek: String(wiek) } }];
}

// --- Terminy spraw po przyjęciu -----------------------------------------------------------------

export type KotwicaPrzyjecia = 'data-przyjecia' | 'data-uprawomocnienia' | 'data-urodzenia-dziecka';

export interface TerminPoPrzyjeciu {
  termin: DataISO | null;
  drugiTermin?: DataISO;
  kotwica: { rodzaj: KotwicaPrzyjecia; data: DataISO } | null;
  kodBrakuTerminu?: '0192' | '0259';
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
  const urodzenie = { rodzaj: 'data-urodzenia-dziecka' as const, data: p.dataUrodzeniaDziecka };
  const przed18 = dodajDni(dodajLata(p.dataUrodzeniaDziecka, 18), -1);
  switch (idPozycji) {
    case 'K31':
      return { termin: dodajDni(p.dataPrzyjecia, 7), drugiTermin: dodajDni(p.dataPrzyjecia, 21), kotwica: przyjecie };
    case 'K32':
      return { termin: dodajDni(p.dataPrzyjecia, 21), kotwica: przyjecie };
    case 'K33':
      return { termin: null, kotwica: null };
    case 'K09': {
      if (p.dataUprawomocnienia === undefined) return { termin: null, kotwica: null, kodBrakuTerminu: '0192' };
      const odUprawomocnienia = dodajDni(dodajMiesiace(p.dataUprawomocnienia, 12), -14);
      const przed14 = dodajDni(dodajLata(p.dataUrodzeniaDziecka, 14), -14);
      return { termin: minData(odUprawomocnienia, przed14), kotwica: { rodzaj: 'data-uprawomocnienia', data: p.dataUprawomocnienia } };
    }
    case 'K10': {
      const wiek = wiekGranicznyPrzyjecia(p, katalog);
      return { termin: dodajDni(dodajLata(p.dataUrodzeniaDziecka, wiek), -1), kotwica: urodzenie };
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
    case 'K15':
      return { termin: dodajDni(dodajLata(p.dataUrodzeniaDziecka, 1), -1), kotwica: urodzenie };
    case 'K18': {
      const roczek = dodajMiesiace(p.dataUrodzeniaDziecka, 12);
      return porownajDaty(p.dataPrzyjecia, roczek) >= 0
        ? { termin: ostatniDzienMiesiaca(p.dataPrzyjecia), kotwica: przyjecie }
        : { termin: ostatniDzienMiesiaca(roczek), kotwica: urodzenie };
    }
    default:
      return null;
  }
}
