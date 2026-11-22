// Nawigacja kreatora ZAM (kontrakt, sekcja 7.2). Właściciel: u27 (Kreator wniosku ZAM do ZUS).
// Po porodzie kreator ma 5 ekranów, przed porodem 6 (ekran 2: początek zasiłku). Ekrany dzielą się na części
// (liczbaCzesciEkranuZam), a numeracja „Krok X z N” liczy każdą część jako krok. Ścieżkę i liczbę kroków
// kreator ustala od pierwszego kroku (useKrokiKreatoraZam), więc mianownik N pozostaje stały.
import type { IdWidoku, WniosekZam } from '@/domena/typy';

/** Ekrany kreatora ZAM w kolejności (po porodzie). */
export const EKRANY_ZAM: IdWidoku[] = ['ViewZamLeaveType', 'ViewZamPeriod', 'ViewZamData', 'ViewZamStatements', 'ViewZamSummary'];

/** Ekrany kreatora ZAM przed porodem. */
export const EKRANY_ZAM_PRZED_PORODEM: IdWidoku[] = [
  'ViewZamLeaveType',
  'ViewZamPrebirth',
  'ViewZamPeriod',
  'ViewZamData',
  'ViewZamStatements',
  'ViewZamSummary',
];

/** Ekrany kroków wniosku. */
export function ekranyWnioskuZam(wniosek: Pick<WniosekZam, 'przedPorodem'> | null, przedPorodem = false): IdWidoku[] {
  return wniosek?.przedPorodem || przedPorodem ? EKRANY_ZAM_PRZED_PORODEM : EKRANY_ZAM;
}

/**
 * Warunki podziału ekranów kreatora na części. Każda część mieści się w oknie bez przewijania, a w postępie
 * „Krok X z N” liczy się jako osobny krok.
 */
export interface WarunkiCzesciZam {
  /** Liczba dzieci, których dane wnioskodawca wpisuje na ekranie danych; przed porodem 0. */
  liczbaDzieciZDanymi: number;
  /** Ekran okresu ma drugą część: wybór wariantu zasiłku albo liczbę tygodni urlopu rodzicielskiego. */
  okresWDwochCzesciach: boolean;
  /** Ekran początku zasiłku ma część z zaświadczeniem lekarskim, bo zasiłek wypłaca ZUS. */
  zZaswiadczeniem: boolean;
}

const BEZ_PODZIALU: WarunkiCzesciZam = { liczbaDzieciZDanymi: 0, okresWDwochCzesciach: false, zZaswiadczeniem: false };

/**
 * Liczba części ekranu. Początek zasiłku: termin porodu, dzień początku i zaświadczenie. Okres: okres urlopu
 * i wariant albo tryb i liczba tygodni. Dane po porodzie: wnioskodawca, rachunek i dwie części na każde dziecko,
 * przed porodem: wnioskodawca, potem informacja o danych dziecka z rachunkiem.
 */
export function liczbaCzesciEkranuZam(ekran: IdWidoku, w: WarunkiCzesciZam = BEZ_PODZIALU): number {
  switch (ekran) {
    case 'ViewZamPrebirth':
      return w.zZaswiadczeniem ? 3 : 2;
    case 'ViewZamPeriod':
      return w.okresWDwochCzesciach ? 2 : 1;
    case 'ViewZamData':
      return w.liczbaDzieciZDanymi > 0 ? 2 + 2 * w.liczbaDzieciZDanymi : 2;
    default:
      return 1;
  }
}

/** Kroki wniosku z liczbą części każdego ekranu, w kolejności kreatora. */
export function krokiWnioskuZam(
  wniosek: Pick<WniosekZam, 'przedPorodem'> | null,
  przedPorodem = false,
  warunki: WarunkiCzesciZam = BEZ_PODZIALU,
): { id: IdWidoku; czesci: number }[] {
  return ekranyWnioskuZam(wniosek, przedPorodem).map((id) => ({ id, czesci: liczbaCzesciEkranuZam(id, warunki) }));
}

/** Ekran wznowienia kreatora dla stanu wniosku: ostatni wyświetlony ekran szkicu albo ekran po wysłaniu. */
export function nastepnyEkranZam(wniosek: WniosekZam): IdWidoku {
  if (wniosek.stan === 'wyslany' || wniosek.stan === 'zlozony') return 'ViewZamSent';
  if (wniosek.stan === 'przygotowany') return 'ViewZamForPayer';
  const ekrany = ekranyWnioskuZam(wniosek);
  return wniosek.ostatniEkran && ekrany.includes(wniosek.ostatniEkran) ? wniosek.ostatniEkran : 'ViewZamLeaveType';
}

/** Ekran po bieżącym ekranie kreatora. */
export function ekranPoZam(wniosek: Pick<WniosekZam, 'przedPorodem'> | null, biezacy: IdWidoku, przedPorodem = false): IdWidoku {
  const ekrany = ekranyWnioskuZam(wniosek, przedPorodem);
  const i = ekrany.indexOf(biezacy);
  return i >= 0 && i < ekrany.length - 1 ? ekrany[i + 1] : 'ViewZamSent';
}

/** Ekran przed bieżącym ekranem kreatora. */
export function ekranPrzedZam(wniosek: Pick<WniosekZam, 'przedPorodem'> | null, biezacy: IdWidoku): IdWidoku | null {
  const ekrany = ekranyWnioskuZam(wniosek);
  const i = ekrany.indexOf(biezacy);
  return i > 0 ? ekrany[i - 1] : null;
}
