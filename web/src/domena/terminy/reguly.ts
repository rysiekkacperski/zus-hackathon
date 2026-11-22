// Reguły terminów spraw (kontrakt, sekcja 7.2; Story 3.7.1.1.1, 3.7.1.1.2, 3.3.4.1.2). Właściciel: u13 (Kalendarz terminów).
// Kalendarz liczy termin z reguły terminu pozycji katalogu i z daty kotwiczącej z profilu rodziny.
import { dodajDni, dodajLata, dodajMiesiace, minData, ostatniDzienMiesiaca, pierwszyDzienMiesiaca } from '@/domena/daty';
import { wymiarUrlopuMacierzynskiego } from '@/domena/terminy/slowniki';
import type { DataISO, IdPozycji, IdSprawy, Katalog, Kotwica, RegulaTerminu } from '@/domena/typy';

/** Daty kotwic terminów rodziny. */
export type KotwiceTerminow = Partial<Record<Exclude<Kotwica, 'brak'>, DataISO>>;

const dni = (przesuniecie: number): { przesuniecie: number; jednostka: 'dni' } => ({ przesuniecie, jednostka: 'dni' });
const miesiace = (przesuniecie: number): { przesuniecie: number; jednostka: 'miesiace' } => ({ przesuniecie, jednostka: 'miesiace' });

/** Reguły terminów pozycji K01–K37 z wymagania Reguły terminów epiku 3.7.1. */
export const REGULY_POZYCJI: Readonly<Record<string, RegulaTerminu>> = {
  K01: { typ: 'przesuniecie', kotwica: 'koniec-10-tygodnia', ...dni(0) },
  K02: { typ: 'przesuniecie', kotwica: 'przewidywany-termin-porodu', ...dni(0) },
  K03: { typ: 'przesuniecie', kotwica: 'przewidywany-termin-porodu', ...dni(-1) },
  K05: { typ: 'przesuniecie', kotwica: 'data-porodu', ...dni(7) },
  K06: { typ: 'przesuniecie', kotwica: 'data-porodu', ...dni(21) },
  K07: { typ: 'przesuniecie', kotwica: 'data-porodu', ...dni(21) },
  K08: { typ: 'przesuniecie', kotwica: 'data-porodu', ...dni(21) },
  K09: { typ: 'przesuniecie', kotwica: 'data-porodu', ...miesiace(12), korekta: dni(-14) },
  K10: { typ: 'koniec-roku-urodzin', lata: 6 },
  K11: { typ: 'plus-wymiar', kotwica: 'data-porodu', idWpisu: 'urlop-macierzynski' },
  K12: { typ: 'przesuniecie', kotwica: 'data-porodu', ...miesiace(3) },
  K13: { typ: 'coroczny', dzien: '06-30', poczatekSkladania: '02-01', zalecany: '04-30', doRokuUrodzin: 18 },
  K14: { typ: 'przesuniecie', kotwica: 'data-porodu', ...miesiace(12) },
  K15: { typ: 'przesuniecie', kotwica: 'data-porodu', ...miesiace(12), korekta: dni(-1) },
  K16: { typ: 'przesuniecie', kotwica: 'data-porodu', ...miesiace(3) },
  K17: { typ: 'przesuniecie', kotwica: 'data-porodu', ...miesiace(12) },
  K18: { typ: 'koniec-miesiaca-wieku', miesiace: 12 },
  K21: { typ: 'coroczny', dzien: '12-31', doRokuUrodzin: 14 },
  K23: { typ: 'koniec-roku-urodzin', lata: 6 },
  K29: { typ: 'przesuniecie', kotwica: 'przewidywany-termin-porodu', ...dni(-1) },
  K31: {
    typ: 'dwa-terminy',
    pierwszy: { typ: 'przesuniecie', kotwica: 'data-przyjecia', ...dni(7) },
    drugi: { typ: 'przesuniecie', kotwica: 'data-przyjecia', ...dni(21) },
    kluczEtykietyDrugiego: 'wariant-81-5',
  },
  K32: { typ: 'przesuniecie', kotwica: 'data-przyjecia', ...dni(21) },
};

/**
 * Reguła terminu pozycji: reguła ustawiona przez Administratora w panelu katalogu, a bez niej reguła z wymagania
 * epiku dla K01–K37 i reguła z katalogu dla pozycji dodanych w panelu.
 */
export function regulaPozycji(idPozycji: IdPozycji, katalog: Katalog): RegulaTerminu {
  const zKatalogu = katalog.pozycje.find((p) => p.id === idPozycji);
  if (zKatalogu?.zmieniono?.regulaTerminu) return zKatalogu.regulaTerminu;
  const numer = Number(idPozycji.replace(/^K/, ''));
  if (Number.isFinite(numer) && numer >= 1 && numer <= 37) return REGULY_POZYCJI[idPozycji] ?? { typ: 'brak' };
  return zKatalogu?.regulaTerminu ?? { typ: 'brak' };
}

function przesun(d: DataISO, p: { przesuniecie: number; jednostka: 'dni' | 'miesiace' }): DataISO {
  return p.jednostka === 'dni' ? dodajDni(d, p.przesuniecie) : dodajMiesiace(d, p.przesuniecie);
}

function rok(d: DataISO): number {
  return Number(d.slice(0, 4));
}

export interface TerminCoroczny {
  termin: DataISO;
  rokCyklu: number;
  poczatekSkladania?: DataISO;
  zalecany?: DataISO;
}

/** Rok cyklu terminu corocznego w dniu `dzien`: przed początkiem składania trwa cykl poprzedniego roku. */
function rokCykluWDniu(r: Extract<RegulaTerminu, { typ: 'coroczny' }>, dzien: DataISO): number {
  const r0 = rok(dzien);
  if (r.poczatekSkladania && dzien < `${r0}-${r.poczatekSkladania}`) return r0 - 1;
  return r0;
}

/** Pierwszy rok terminu corocznego; dla wniosku o 800+ rok pierwszego 31 maja po dniu urodzenia. */
function pierwszyRokCorocznego(r: Extract<RegulaTerminu, { typ: 'coroczny' }>, urodzenie: DataISO): number {
  const r0 = rok(urodzenie);
  if (r.poczatekSkladania) return `${r0}-05-31` > urodzenie ? r0 : r0 + 1;
  return `${r0}-${r.dzien}` >= urodzenie ? r0 : r0 + 1;
}

/**
 * Termin coroczny bez początku składania (K21, Story 3.7.1.1.4): w roku, w którym dziecko kończy `doRokuUrodzin` lat,
 * termin przypada w dniu poprzedzającym te urodziny i jest ostatnim terminem sprawy.
 */
export function terminCorocznyZOstatnim(r: Extract<RegulaTerminu, { typ: 'coroczny' }>, urodzenie: DataISO, termin: DataISO): DataISO {
  if (r.poczatekSkladania || r.doRokuUrodzin === undefined) return termin;
  if (rok(termin) !== rok(urodzenie) + r.doRokuUrodzin) return termin;
  return minData(termin, dodajDni(dodajLata(urodzenie, r.doRokuUrodzin), -1));
}

/** Termin coroczny w roku cyklu `rokCyklu` (null po ostatnim roku). */
export function terminCorocznyWRoku(
  r: Extract<RegulaTerminu, { typ: 'coroczny' }>,
  urodzenie: DataISO,
  rokCyklu: number,
): TerminCoroczny | null {
  const rokTerminu = Math.max(pierwszyRokCorocznego(r, urodzenie), rokCyklu);
  if (r.doRokuUrodzin !== undefined && rokTerminu > rok(urodzenie) + r.doRokuUrodzin) return null;
  return {
    termin: terminCorocznyZOstatnim(r, urodzenie, `${rokTerminu}-${r.dzien}`),
    rokCyklu: rokTerminu,
    poczatekSkladania: r.poczatekSkladania ? `${rokTerminu}-${r.poczatekSkladania}` : undefined,
    zalecany: r.zalecany ? `${rokTerminu}-${r.zalecany}` : undefined,
  };
}

/** Bieżący termin coroczny w dniu `dzis`. */
export function terminCorocznyNaDzien(
  r: Extract<RegulaTerminu, { typ: 'coroczny' }>,
  urodzenie: DataISO,
  dzis: DataISO,
): TerminCoroczny | null {
  return terminCorocznyWRoku(r, urodzenie, rokCykluWDniu(r, dzis));
}

/** Termin wyliczony z reguły terminu pozycji katalogu; null, gdy brak kotwicy albo reguły. */
export function terminZReguly(
  r: RegulaTerminu,
  kotwice: KotwiceTerminow,
  katalog: Katalog,
  liczbaDzieci: number,
  dzis: DataISO,
): DataISO | null {
  switch (r.typ) {
    case 'brak':
    case 'specjalna':
      return null;
    case 'przesuniecie': {
      const baza = kotwice[r.kotwica];
      if (!baza) return null;
      const po = przesun(baza, r);
      return r.korekta ? przesun(po, r.korekta) : po;
    }
    case 'plus-wymiar': {
      const baza = kotwice[r.kotwica];
      if (!baza) return null;
      return dodajDni(baza, wymiarUrlopuMacierzynskiego(katalog, liczbaDzieci, baza, r.idWpisu) * 7);
    }
    case 'dzien-przed-urodzinami': {
      const urodzenie = kotwice['data-urodzenia-dziecka'];
      return urodzenie ? dodajDni(dodajLata(urodzenie, r.lata), -1) : null;
    }
    case 'koniec-roku-urodzin': {
      const urodzenie = kotwice['data-urodzenia-dziecka'];
      return urodzenie ? `${rok(urodzenie) + r.lata}-12-31` : null;
    }
    case 'koniec-miesiaca-wieku': {
      const urodzenie = kotwice['data-urodzenia-dziecka'];
      return urodzenie ? ostatniDzienMiesiaca(dodajMiesiace(urodzenie, r.miesiace)) : null;
    }
    case 'coroczny': {
      const urodzenie = kotwice['data-urodzenia-dziecka'];
      return urodzenie ? (terminCorocznyNaDzien(r, urodzenie, dzis)?.termin ?? null) : null;
    }
    case 'dwa-terminy':
      return terminZReguly(r.pierwszy, kotwice, katalog, liczbaDzieci, dzis);
  }
}

/** Następny termin sprawy powtarzalnej po oznaczeniu jej jako załatwionej. */
export function nastepnyTerminPowtarzalny(idSprawy: IdSprawy, dataOznaczenia: DataISO): DataISO | null {
  const idPozycji = idSprawy.split('-')[0];
  const r = REGULY_POZYCJI[idPozycji];
  if (!r || r.typ !== 'coroczny') return null;
  return `${rokCykluWDniu(r, dataOznaczenia) + 1}-${r.dzien}`;
}

/** Dzień, w którym sprawa powtarzalna załatwiona w danym roku wraca do statusu do zrobienia. */
export function powrotDoZrobieniaPowtarzalnej(idSprawy: IdSprawy, dataOznaczenia: DataISO): DataISO | null {
  const idPozycji = idSprawy.split('-')[0];
  const r = REGULY_POZYCJI[idPozycji];
  if (!r || r.typ !== 'coroczny') return null;
  const nastepnyRok = rokCykluWDniu(r, dataOznaczenia) + 1;
  return r.poczatekSkladania ? `${nastepnyRok}-${r.poczatekSkladania}` : `${nastepnyRok}-01-01`;
}

/** Czy sprawa ma regułę terminu powtarzalnego. */
export function czyPowtarzalna(idPozycji: IdPozycji | null, katalog: Katalog): boolean {
  if (idPozycji === null) return false;
  return regulaPozycji(idPozycji, katalog).typ === 'coroczny';
}

/** Pierwszy dzień miesiąca terminu (początek składania wniosku o Aktywnego Rodzica). */
export function poczatekMiesiacaTerminu(termin: DataISO): DataISO {
  return pierwszyDzienMiesiaca(termin);
}

/** Najwcześniejsza z dat (pomocniczo dla limitów wieku dziecka). */
export function wczesniejsza(a: DataISO, b: DataISO): DataISO {
  return minData(a, b);
}
