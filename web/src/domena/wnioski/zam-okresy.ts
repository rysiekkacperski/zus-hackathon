// Okresy zasiłku we wniosku ZAM (kontrakt, sekcja 7.2). Właściciel: u27 (Kreator wniosku ZAM do ZUS).
// Reguły R3–R8 z analizy 3.9.1: urlop macierzyński, uzupełniający, rodzicielski, ojcowski, wariant 81,5% i termin 21 dni.
// Wymiary i stawki odpowiadają wartościom Katalogu świadczeń obowiązującym w dniu porodu (słownik wymiarów
// i okresów, słownik kwot i progów).
import { dodajDni, dodajMiesiace, porownajDaty, roznicaDni } from '@/domena/daty';
import type {
  BledyPol,
  DaneCiazyIDziecka,
  DataISO,
  Katalog,
  KodKomunikatu,
  LiczbaDzieci,
  Okres,
  OkresWniosku,
  PlanRodziny,
  Procent,
  RodzajUrlopu,
  RodzicWRodzinie,
  WniosekZam,
} from '@/domena/typy';
import { walidujDateWZakresie, walidujLiczbeCalkowita } from '@/domena/walidacje';

/** Wejście wyliczenia okresów ZAM. */
export interface WejscieOkresowZam {
  wniosek: WniosekZam;
  daneCiazy: DaneCiazyIDziecka | null;
  plan: PlanRodziny | null;
  /** Rodzic, który składa wniosek; domyślnie matka. */
  rodzic?: RodzicWRodzinie;
}

export interface WynikOkresowZam {
  okresy: OkresWniosku[];
  komunikaty: { kod: KodKomunikatu; parametry?: Record<string, string> }[];
  /** Parametry ekranu ViewZamPeriod. */
  parametry: ParametryOkresuZam;
}

/** Wymiar urlopu macierzyńskiego w tygodniach według liczby dzieci urodzonych przy jednym porodzie. */
export const TYGODNIE_URLOPU_MACIERZYNSKIEGO: Record<LiczbaDzieci, number> = { 1: 20, 2: 31, 3: 33, 4: 35, 5: 37 };
/** Termin wniosku z wariantem 81,5% liczony od dnia porodu. */
export const DNI_TERMINU_WARIANTU = 21;
/** Nieprzenoszalna część urlopu rodzicielskiego dla każdego rodzica. */
export const TYGODNIE_NIEPRZENOSZALNE = 9;
/** Długość urlopu ojcowskiego w dniach. */
export const DNI_URLOPU_OJCOWSKIEGO = 14;
/** Urlop rodzicielski wykorzystuje się do 31 grudnia roku, w którym dziecko kończy 6 lat. */
export const LATA_WYKORZYSTANIA_RODZICIELSKIEGO = 6;

export const STAWKA_100: Procent = 100;
export const STAWKA_81_5: Procent = 81.5;
export const STAWKA_70: Procent = 70;

export interface KontekstOkresowZam {
  rodzic: RodzicWRodzinie;
  dataPorodu: DataISO | null;
  /** Dzień początku urlopu macierzyńskiego: dzień porodu albo dzień początku zasiłku przed porodem. */
  poczatekMacierzynskiego: DataISO | null;
  liczbaDzieci: LiczbaDzieci;
  zaZyciem: boolean;
  przedPorodem: boolean;
  wymiarUzupelniajacegoTygodni: number | null;
}

export interface ParametryOkresuZam {
  okresMacierzynski: Okres | null;
  tygodnieMacierzynskiego: number;
  okresUzupelniajacy: Okres | null;
  terminWariantu: DataISO | null;
  dniDoTerminu: number | null;
  wariantDostepny: boolean;
  rodzicielski: { bezposrednioOd: DataISO | null; zakres: Okres | null; maksTygodni: number };
  ojcowski: { zakres: Okres | null };
}

function liczba(n: number | undefined): LiczbaDzieci {
  if (n === undefined || n < 1) return 1;
  return (n > 5 ? 5 : n) as LiczbaDzieci;
}

/** Wymiar uzupełniającego urlopu macierzyńskiego ze sprawy K11 planu albo z profilu rodziny. */
export function wymiarUzupelniajacegoZPlanu(plan: PlanRodziny | null, daneCiazy: DaneCiazyIDziecka | null): number | null {
  const k11 = plan?.pozycje.find((p) => p.idPozycji === 'K11');
  if (!k11) return null;
  if (k11.dane?.wymiarK11Tygodni) return k11.dane.wymiarK11Tygodni;
  if (k11.wybranyWariant?.sprawa === 'K11') return k11.wybranyWariant.wymiarTygodni;
  if (daneCiazy?.wymiarUzupelniajacegoUrlopu === 'do-15') return 15;
  return 8;
}

export function kontekstOkresowZam(w: WejscieOkresowZam): KontekstOkresowZam {
  const { wniosek, daneCiazy, plan } = w;
  const przed = wniosek.przedPorodem;
  const dataPorodu = daneCiazy?.dataPoroduPotwierdzona && daneCiazy.dataPorodu ? daneCiazy.dataPorodu : null;
  const przedPorodem = dataPorodu === null;
  const liczbaDzieci = przedPorodem
    ? liczba(przed?.liczbaDzieci ?? daneCiazy?.liczbaDzieciZCiazy)
    : liczba(daneCiazy?.liczbaUrodzonychDzieci ?? daneCiazy?.liczbaDzieciZCiazy);
  const poczatek = przedPorodem ? przed?.dzienPoczatkuZasilku || null : przed?.dzienPoczatkuZasilku && dataPorodu
    ? (porownajDaty(przed.dzienPoczatkuZasilku, dataPorodu) < 0 ? przed.dzienPoczatkuZasilku : dataPorodu)
    : dataPorodu;
  return {
    rodzic: w.rodzic ?? 'matka',
    dataPorodu,
    poczatekMacierzynskiego: poczatek,
    liczbaDzieci,
    zaZyciem: daneCiazy?.zaswiadczenieZaZyciem === true,
    przedPorodem,
    wymiarUzupelniajacegoTygodni: wymiarUzupelniajacegoZPlanu(plan, daneCiazy),
  };
}

/** Okres o długości `dni` od dnia `od` włącznie. */
export function okresOdDni(od: DataISO, dni: number): Okres {
  return { od, do: dodajDni(od, dni - 1) };
}

/** Najwyższa liczba tygodni urlopu rodzicielskiego wnioskodawcy (R5, R6). */
export function maksTygodniRodzicielskiego(k: Pick<KontekstOkresowZam, 'rodzic' | 'liczbaDzieci' | 'zaZyciem'>): number {
  if (k.rodzic === 'drugi-rodzic') return TYGODNIE_NIEPRZENOSZALNE;
  const wymiar = k.zaZyciem ? (k.liczbaDzieci > 1 ? 67 : 65) : k.liczbaDzieci > 1 ? 43 : 41;
  return wymiar - TYGODNIE_NIEPRZENOSZALNE;
}

/** Parametry ekranu okresu: okresy wyliczone, termin 21 dni i zakresy pól. */
export function parametryOkresuZam(k: KontekstOkresowZam, dzis: DataISO): ParametryOkresuZam {
  const tygodnieMacierzynskiego = TYGODNIE_URLOPU_MACIERZYNSKIEGO[k.liczbaDzieci];
  const okresMacierzynski = k.poczatekMacierzynskiego ? okresOdDni(k.poczatekMacierzynskiego, tygodnieMacierzynskiego * 7) : null;
  const okresUzupelniajacy =
    okresMacierzynski && k.wymiarUzupelniajacegoTygodni
      ? okresOdDni(dodajDni(okresMacierzynski.do, 1), k.wymiarUzupelniajacegoTygodni * 7)
      : null;
  const terminWariantu = k.dataPorodu ? dodajDni(k.dataPorodu, DNI_TERMINU_WARIANTU) : null;
  const dniDoTerminu = terminWariantu ? roznicaDni(dzis, terminWariantu) : null;
  const wariantDostepny = k.przedPorodem || (dniDoTerminu !== null && dniDoTerminu >= 0);
  const koniecPoprzedniego = okresUzupelniajacy?.do ?? okresMacierzynski?.do ?? null;
  const bezposrednioOd = koniecPoprzedniego ? dodajDni(koniecPoprzedniego, 1) : null;
  const rokGraniczny = k.dataPorodu ? Number(k.dataPorodu.slice(0, 4)) + LATA_WYKORZYSTANIA_RODZICIELSKIEGO : null;
  const zakresRodzicielskiego =
    bezposrednioOd && rokGraniczny !== null ? { od: bezposrednioOd, do: `${rokGraniczny}-12-31` } : null;
  const zakresOjcowskiego = k.dataPorodu
    ? { od: k.dataPorodu, do: dodajDni(dodajMiesiace(k.dataPorodu, 12), -DNI_URLOPU_OJCOWSKIEGO) }
    : null;
  return {
    okresMacierzynski,
    tygodnieMacierzynskiego,
    okresUzupelniajacy,
    terminWariantu,
    dniDoTerminu,
    wariantDostepny,
    rodzicielski: { bezposrednioOd, zakres: zakresRodzicielskiego, maksTygodni: maksTygodniRodzicielskiego(k) },
    ojcowski: { zakres: zakresOjcowskiego },
  };
}

/** Okresy wariantu dla wniosku o urlop macierzyński (R8). */
export function okresyMacierzynskiego(
  p: ParametryOkresuZam,
  wariant: WniosekZam['wariant'],
): OkresWniosku[] {
  if (!p.okresMacierzynski) return [];
  const mac: OkresWniosku = {
    rodzajUrlopu: 'macierzynski',
    ...p.okresMacierzynski,
    tygodnie: p.tygodnieMacierzynskiego,
    stawka: STAWKA_100,
    rodzic: 'matka',
  };
  if (wariant !== 'caly-rodzicielski' || !p.wariantDostepny) return [mac];
  const od = dodajDni(p.okresMacierzynski.do, 1);
  const tygodnie = p.rodzicielski.maksTygodni;
  return [
    { ...mac, stawka: STAWKA_81_5 },
    { rodzajUrlopu: 'rodzicielski', ...okresOdDni(od, tygodnie * 7), tygodnie, stawka: STAWKA_81_5, rodzic: 'matka' },
  ];
}

/** Pola ekranu ViewZamPeriod w postaci wpisanej przez użytkownika. */
export interface FormularzOkresuZam {
  wariant: 'caly-rodzicielski' | 'tylko-macierzynski' | null;
  trybRodzicielskiego: 'bezposrednio' | 'pozniej' | null;
  dataPoczatku: string;
  tygodnie: string;
  dataOjcowskiego: string;
}

export type PoleOkresuZam = 'wariant' | 'trybRodzicielskiego' | 'dataPoczatku' | 'tygodnie' | 'dataOjcowskiego';

export type WynikWalidacjiOkresuZam =
  | { ok: true; zmiana: Pick<WniosekZam, 'okresy' | 'wariant' | 'rodzicielski'> }
  | { ok: false; bledy: BledyPol<PoleOkresuZam> };

/** Walidacja ekranu okresu i okresy do zapisu w szkicu (R3–R8; 0006, 0010, 0042, 0061). */
export function walidujOkresZam(
  rodzaj: RodzajUrlopu,
  f: FormularzOkresuZam,
  k: KontekstOkresowZam,
  dzis: DataISO,
): WynikWalidacjiOkresuZam {
  const p = parametryOkresuZam(k, dzis);
  const bledy: BledyPol<PoleOkresuZam> = {};
  if (rodzaj === 'macierzynski') {
    if (p.wariantDostepny && f.wariant === null) return { ok: false, bledy: { wariant: '0006' } };
    const wariant = p.wariantDostepny ? (f.wariant ?? 'brak') : 'brak';
    return { ok: true, zmiana: { okresy: okresyMacierzynskiego(p, wariant), wariant, rodzicielski: undefined } };
  }
  if (rodzaj === 'uzupelniajacy') {
    if (!p.okresUzupelniajacy) return { ok: false, bledy: { wariant: '0006' } };
    return {
      ok: true,
      zmiana: {
        okresy: [{ rodzajUrlopu: 'uzupelniajacy', ...p.okresUzupelniajacy, tygodnie: k.wymiarUzupelniajacegoTygodni ?? undefined, stawka: STAWKA_100, rodzic: 'matka' }],
        wariant: 'brak',
        rodzicielski: undefined,
      },
    };
  }
  if (rodzaj === 'ojcowski') {
    const zakres = p.ojcowski.zakres ?? undefined;
    const data = walidujDateWZakresie(f.dataOjcowskiego, { od: zakres?.od, do: zakres?.do }, { format: '0010', pusta: '0006', zaWczesnie: '0042', zaPozno: '0042' });
    if ('kod' in data) return { ok: false, bledy: { dataOjcowskiego: data.kod } };
    return {
      ok: true,
      zmiana: {
        okresy: [{ rodzajUrlopu: 'ojcowski', ...okresOdDni(data.data, DNI_URLOPU_OJCOWSKIEGO), dni: DNI_URLOPU_OJCOWSKIEGO, stawka: STAWKA_100, rodzic: k.rodzic }],
        wariant: 'brak',
        rodzicielski: undefined,
      },
    };
  }
  if (rodzaj === 'rodzicielski') {
    if (f.trybRodzicielskiego === null) bledy.trybRodzicielskiego = '0006';
    let od: DataISO | null = null;
    if (f.trybRodzicielskiego === 'bezposrednio') od = p.rodzicielski.bezposrednioOd;
    if (f.trybRodzicielskiego === 'pozniej') {
      const zakres = p.rodzicielski.zakres ?? undefined;
      const data = walidujDateWZakresie(f.dataPoczatku, { od: zakres?.od, do: zakres?.do }, { format: '0010', pusta: '0006', zaWczesnie: '0042', zaPozno: '0042' });
      if ('kod' in data) bledy.dataPoczatku = data.kod;
      else od = data.data;
    }
    let tygodnie: number | null = null;
    if (f.tygodnie.trim() === '') bledy.tygodnie = '0006';
    else {
      const t = walidujLiczbeCalkowita(f.tygodnie, 1, p.rodzicielski.maksTygodni, '0061');
      if ('kod' in t) bledy.tygodnie = t.kod;
      else tygodnie = t.liczba;
    }
    if (Object.keys(bledy).length > 0 || od === null || tygodnie === null || f.trybRodzicielskiego === null) {
      return { ok: false, bledy: Object.keys(bledy).length > 0 ? bledy : { trybRodzicielskiego: '0006' } };
    }
    return {
      ok: true,
      zmiana: {
        okresy: [{ rodzajUrlopu: 'rodzicielski', ...okresOdDni(od, tygodnie * 7), tygodnie, stawka: STAWKA_70, rodzic: k.rodzic }],
        wariant: 'brak',
        rodzicielski: { tryb: f.trybRodzicielskiego, dataPoczatku: od, tygodnie },
      },
    };
  }
  return { ok: false, bledy: { wariant: '0006' } };
}

/**
 * Okresy wniosku zapisanego w szkicu po ponownym sprawdzeniu terminu 21 dni (R8, R12). Wniosek z całym
 * urlopem rodzicielskim po upływie terminu obejmuje tylko urlop macierzyński z zasiłkiem 100% i komunikat 0038.
 */
export function wyliczOkresyZam(w: WejscieOkresowZam, katalog: Katalog, dzis: DataISO): WynikOkresowZam {
  const k = kontekstOkresowZam(w);
  const p = parametryOkresuZam(k, dzis);
  const { wniosek } = w;
  if (wniosek.rodzajUrlopu !== 'macierzynski') return { okresy: wniosek.okresy, komunikaty: [], parametry: p };
  if (!p.wariantDostepny) {
    const komunikaty = [{ kod: '0038' as const }];
    return { okresy: okresyMacierzynskiego(p, 'brak'), komunikaty, parametry: p };
  }
  return { okresy: okresyMacierzynskiego(p, wniosek.wariant ?? 'brak'), komunikaty: [], parametry: p };
}

/** Czy szkic wymaga zmiany przy wysłaniu: wariant z całym urlopem rodzicielskim po terminie 21 dni (R12). */
export function czyMinalTerminWariantu(w: WejscieOkresowZam, dzis: DataISO): boolean {
  if (w.wniosek.rodzajUrlopu !== 'macierzynski' || w.wniosek.wariant !== 'caly-rodzicielski') return false;
  return !parametryOkresuZam(kontekstOkresowZam(w), dzis).wariantDostepny;
}
