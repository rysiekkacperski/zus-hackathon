// Nawigacja kreatora ZAM (kontrakt, sekcja 7.2). Właściciel: u27 (Kreator wniosku ZAM do ZUS).
// Po porodzie kreator ma 5 kroków, przed porodem 6 (krok 2: początek zasiłku).
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
