// Najbliższe terminy rodziny dla karty Najbliższe terminy na ViewFamilyPlan i dla asystenta AI. Właściciel: u12.
// Lista łączy terminy kalendarza otwartych spraw planu, sprawę Opłacenie składek strażnika ubezpieczenia
// chorobowego razem z kolejną sprawą tego rodzaju oraz przewidywany termin porodu przed potwierdzeniem daty porodu.
// Wpisy zaczynają się od dnia `dzis` i idą rosnąco po dacie, a przy tej samej dacie po identyfikatorze.
import { dodajMiesiaceDoMiesiaca, porownajDaty } from '@/domena/daty';
import { dzienUtworzeniaSprawyOplacenia, terminOplaceniaSkladek } from '@/domena/plan/straznik';
import { tytulOplaceniaSkladek, tytulSprawyPlanu } from '@/domena/plan/tytul-sprawy';
import type {
  DaneCiazyIDziecka,
  DataISO,
  IdSprawy,
  KalendarzTerminow,
  Katalog,
  MiesiacISO,
  PlanRodziny,
  PozycjaPlanu,
  StatusSprawy,
} from '@/domena/typy';
import { teksty } from '@/teksty';

/** Liczba terminów, które pokazuje karta Najbliższe terminy i odpowiedź asystenta. */
export const LICZBA_NAJBLIZSZYCH_TERMINOW = 3;

export type WpisNajblizszegoTerminu =
  | { rodzaj: 'sprawa'; id: IdSprawy; data: DataISO; sprawa: PozycjaPlanu; szacowany: boolean }
  | { rodzaj: 'oplacenie-skladek'; id: IdSprawy; data: DataISO; miesiac: MiesiacISO; sprawa: PozycjaPlanu | null }
  | { rodzaj: 'kolejne-oplacenie-skladek'; id: string; data: DataISO; miesiac: MiesiacISO; dzienUtworzenia: DataISO }
  | { rodzaj: 'przewidywany-termin-porodu'; id: 'ptp'; data: DataISO };

export type RodzajNajblizszegoTerminu = WpisNajblizszegoTerminu['rodzaj'];

export interface WejscieNajblizszychTerminow {
  plan: PlanRodziny | null;
  kalendarz: KalendarzTerminow | null;
  daneCiazy: DaneCiazyIDziecka | null;
  /** Sprawa Opłacenie składek bieżącego miesiąca ze strażnika ubezpieczenia chorobowego albo null. */
  oplacenie: { miesiac: MiesiacISO; termin: DataISO; idSprawy: IdSprawy } | null;
  dzis: DataISO;
}

/** Sprawa jest otwarta, gdy ma status do zrobienia albo czeka na uzupełnienie profilu. */
export function czySprawaOtwarta(status: StatusSprawy): boolean {
  return status === 'do-zrobienia' || status === 'wymaga-uzupelnienia-profilu';
}

/** Pełna lista najbliższych terminów rodziny od dnia `dzis` w kolejności dat. */
export function najblizszeTerminy(w: WejscieNajblizszychTerminow): WpisNajblizszegoTerminu[] {
  const { dzis } = w;
  const pozycje = w.plan?.pozycje ?? [];
  const wpisy: WpisNajblizszegoTerminu[] = [];
  for (const termin of w.kalendarz?.terminy ?? []) {
    const sprawa = pozycje.find((p) => p.idSprawy === termin.idSprawy);
    if (!sprawa || !czySprawaOtwarta(sprawa.status) || termin.termin === null) continue;
    if (porownajDaty(termin.termin, dzis) < 0) continue;
    wpisy.push({ rodzaj: 'sprawa', id: termin.idSprawy, data: termin.termin, sprawa, szacowany: termin.szacowany });
  }
  const oplacenie = w.oplacenie;
  if (oplacenie && porownajDaty(oplacenie.termin, dzis) >= 0 && !wpisy.some((x) => x.id === oplacenie.idSprawy)) {
    const sprawa = pozycje.find((p) => p.idSprawy === oplacenie.idSprawy) ?? null;
    if (!sprawa || czySprawaOtwarta(sprawa.status)) {
      wpisy.push({ rodzaj: 'oplacenie-skladek', id: oplacenie.idSprawy, data: oplacenie.termin, miesiac: oplacenie.miesiac, sprawa });
    }
  }
  if (oplacenie) {
    const nastepny = dodajMiesiaceDoMiesiaca(oplacenie.miesiac, 1);
    wpisy.push({
      rodzaj: 'kolejne-oplacenie-skladek',
      id: `nastepna-${nastepny}`,
      data: terminOplaceniaSkladek(nastepny),
      miesiac: nastepny,
      dzienUtworzenia: dzienUtworzeniaSprawyOplacenia(nastepny),
    });
  }
  const daneCiazy = w.daneCiazy;
  if (
    daneCiazy?.przewidywanyTerminPorodu &&
    !daneCiazy.dataPoroduPotwierdzona &&
    porownajDaty(daneCiazy.przewidywanyTerminPorodu, dzis) >= 0
  ) {
    wpisy.push({ rodzaj: 'przewidywany-termin-porodu', id: 'ptp', data: daneCiazy.przewidywanyTerminPorodu });
  }
  return wpisy.sort((a, b) => porownajDaty(a.data, b.data) || a.id.localeCompare(b.id));
}

/** Tytuł wpisu: tytuł sprawy planu, sprawy Opłacenie składek za miesiąc albo przewidywany termin porodu. */
export function tytulNajblizszegoTerminu(katalog: Katalog, wpis: WpisNajblizszegoTerminu): string {
  switch (wpis.rodzaj) {
    case 'sprawa':
      return tytulSprawyPlanu(katalog, wpis.sprawa);
    case 'oplacenie-skladek':
    case 'kolejne-oplacenie-skladek':
      return tytulOplaceniaSkladek(wpis.miesiac);
    case 'przewidywany-termin-porodu':
      return teksty.ViewFamilyPlan.najblizszeTerminy.ptp;
  }
}
