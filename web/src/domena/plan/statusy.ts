// Statusy spraw planu (kontrakt, sekcja 7.2; historyjka 3.6.1.1.1, wymaganie Statusy spraw).
// Właściciel: u08 (Silnik planu rodziny).
// Status złożona i załatwiona ustawiają przewodnik po formalnościach, kreatory wniosków, odczyt danych ZUS
// i strażnik wyłącznie przez operacje planu, które wołają te funkcje.
import '@/domena/plan/zmiany';
import type {
  DataISO,
  IdPozycji,
  IdSprawy,
  OznaczenieSprawy,
  PlanRodziny,
  PozycjaPlanu,
  RodzicWRodzinie,
  StatusSprawy,
  WybranyWariant,
  ZrodloStatusu,
} from '@/domena/typy';

/** Statusy, które sprawa zachowuje po każdym przeliczeniu planu. */
export const STATUSY_ZACHOWYWANE: readonly StatusSprawy[] = ['zlozona', 'zalatwiona'];

export function czyStatusZachowywany(status: StatusSprawy): boolean {
  return STATUSY_ZACHOWYWANE.includes(status);
}

function zmienPozycje(plan: PlanRodziny, idSprawy: IdSprawy, fn: (p: PozycjaPlanu) => PozycjaPlanu): PlanRodziny {
  return { ...plan, pozycje: plan.pozycje.map((p) => (p.idSprawy === idSprawy ? fn(p) : p)) };
}

/** Sprawa planu o identyfikatorze `idSprawy` albo undefined. */
export function znajdzSprawe(plan: PlanRodziny | null, idSprawy: IdSprawy): PozycjaPlanu | undefined {
  return plan?.pozycje.find((p) => p.idSprawy === idSprawy);
}

/**
 * Plan ze zmienionym statusem sprawy. Sprawa dostaje źródło statusu i datę oznaczenia, a poprzedni status
 * trafia do `poprzedniStatus`, z którego korzysta cofnięcie. Plan bez sprawy wraca bez zmian.
 */
export function zmienStatus(
  plan: PlanRodziny,
  idSprawy: IdSprawy,
  status: StatusSprawy,
  zrodlo: ZrodloStatusu,
  dzis: DataISO,
): PlanRodziny {
  return zmienPozycje(plan, idSprawy, (p) => ({
    ...p,
    status,
    zrodloStatusu: zrodlo,
    dataOznaczenia: dzis,
    poprzedniStatus: { status: p.status, zrodloStatusu: p.zrodloStatusu, dataOznaczenia: p.dataOznaczenia },
  }));
}

/**
 * Plan z przywróconym statusem sprzed ostatniej zmiany. Bez zapisanego poprzedniego statusu sprawa wraca
 * do statusu do zrobienia ze źródłem wyliczenie planu, a przeliczenie planu ustala jej status z profilu.
 */
export function przywrocStatus(plan: PlanRodziny, idSprawy: IdSprawy): PlanRodziny {
  return zmienPozycje(plan, idSprawy, (p) => {
    const { poprzedniStatus, dataOznaczenia, ...reszta } = p;
    void dataOznaczenia;
    if (poprzedniStatus) {
      return { ...reszta, status: poprzedniStatus.status, zrodloStatusu: poprzedniStatus.zrodloStatusu, dataOznaczenia: poprzedniStatus.dataOznaczenia };
    }
    return { ...reszta, status: 'do-zrobienia', zrodloStatusu: 'wyliczenie-planu' };
  });
}

/** Plan z dodanym (`wl` = true) albo usuniętym oznaczeniem sprawy. */
export function zmienOznaczenie(plan: PlanRodziny, idSprawy: IdSprawy, oznaczenie: OznaczenieSprawy, wl: boolean): PlanRodziny {
  return zmienPozycje(plan, idSprawy, (p) => {
    const bez = p.oznaczenia.filter((o) => o !== oznaczenie);
    return { ...p, oznaczenia: wl ? [...bez, oznaczenie] : bez };
  });
}

/** Plan z wariantem zapisanym przy sprawie `idSprawy`. */
export function zapiszWariantWPlanie(plan: PlanRodziny, idSprawy: IdSprawy, wariant: WybranyWariant): PlanRodziny {
  return zmienPozycje(plan, idSprawy, (p) => ({ ...p, wybranyWariant: wariant }));
}

/** Identyfikator sprawy pozycji na rodzica, np. 'K21-matka', 'K21-drugi-rodzic'. */
export function idSprawyDlaRodzica(id: IdPozycji, rodzic: RodzicWRodzinie): IdSprawy {
  return `${id}-${rodzic}`;
}

/**
 * Sprawa planu dla pozycji katalogu i rodzica: sprawa o identyfikatorze pozycji albo sprawa tej pozycji
 * na rodzica (K21, K23, K30, K37), gdy pozycja ma osobne sprawy na rodzica.
 */
export function sprawaPozycji(plan: PlanRodziny | null, id: IdPozycji, rodzic?: RodzicWRodzinie): PozycjaPlanu | undefined {
  if (!plan) return undefined;
  const wprost = plan.pozycje.find((p) => p.idSprawy === id);
  if (wprost) return wprost;
  const naRodzica = plan.pozycje.filter((p) => p.idPozycji === id);
  if (rodzic) return naRodzica.find((p) => p.idSprawy === idSprawyDlaRodzica(id, rodzic)) ?? naRodzica[0];
  return naRodzica[0];
}
