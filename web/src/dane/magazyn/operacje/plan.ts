// Operacje Planu rodzica: statusy, oznaczenia i wybrany wariant (kontrakt, sekcje 6.1 i 6.5). Właściciel: u08 (Silnik planu rodziny).
// Inne elementy systemu zmieniają status sprawy wyłącznie przez te operacje. Każda operacja działa na planie
// rodziny zalogowanego konta, zapisuje zmianę i przelicza rodzinę (plan, terminy, przypomnienia).
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import {
  odczytajZalogowanego,
  osobyRodziny,
  rodzinaKonta,
  wykonajOperacjeZWynikiem,
  zapiszStanRodziny,
} from '@/dane/magazyn/stan';
import {
  przywrocStatus,
  sprawaPozycji,
  zapiszWariantWPlanie,
  zmienOznaczenie,
  zmienStatus,
  znajdzSprawe,
} from '@/domena/plan/statusy';
import type {
  IdSprawy,
  KontekstOperacji,
  OznaczenieSprawy,
  PlanRodziny,
  RodzicWRodzinie,
  StanRodziny,
  StatusSprawy,
  WybranyWariant,
  WynikOperacji,
  ZrodloStatusu,
} from '@/domena/typy';

/** Rodzina zalogowanego konta z wyliczonym planem albo null. */
function rodzinaZPlanem(): (StanRodziny & { plan: PlanRodziny }) | null {
  const zalogowany = odczytajZalogowanego();
  const rodzina = rodzinaKonta(zalogowany?.stanKonta.konto ?? null);
  if (rodzina === null || rodzina.plan === null) return null;
  return rodzina as StanRodziny & { plan: PlanRodziny };
}

/**
 * Zmienia plan rodziny zalogowanego konta funkcją `fn`, zapisuje go i przelicza rodzinę. Bez rodziny,
 * planu albo sprawy zwraca 0003 bez zmiany stanu; błąd zapisu także daje 0003.
 */
function zmienPlan(
  ctx: KontekstOperacji,
  fn: (rodzina: StanRodziny & { plan: PlanRodziny }) => PlanRodziny | null,
): WynikOperacji {
  return wykonajOperacjeZWynikiem<void>(() => {
    const rodzina = rodzinaZPlanem();
    if (rodzina === null) return { ok: false, kod: '0003' };
    const plan = fn(rodzina);
    if (plan === null) return { ok: false, kod: '0003' };
    zapiszStanRodziny({ ...rodzina, plan });
    const przeliczenie = przeliczRodzine(rodzina.idRodziny, ctx);
    return przeliczenie.ok ? { ok: true, wartosc: undefined } : przeliczenie;
  });
}

/** Ustawia status sprawy ze źródłem i datą oznaczenia `ctx.dzis`. */
export function ustawStatusSprawy(
  idSprawy: IdSprawy,
  status: StatusSprawy,
  zrodlo: ZrodloStatusu,
  ctx: KontekstOperacji,
): WynikOperacji {
  return zmienPlan(ctx, ({ plan }) =>
    znajdzSprawe(plan, idSprawy) ? zmienStatus(plan, idSprawy, status, zrodlo, ctx.dzis) : null,
  );
}

/** Przywrócenie statusu sprzed ostatniej zmiany. */
export function cofnijStatus(idSprawy: IdSprawy, ctx: KontekstOperacji): WynikOperacji {
  return zmienPlan(ctx, ({ plan }) => (znajdzSprawe(plan, idSprawy) ? przywrocStatus(plan, idSprawy) : null));
}

/** Dodanie (`wl` = true) albo usunięcie oznaczenia sprawy. */
export function ustawOznaczenie(
  idSprawy: IdSprawy,
  oznaczenie: OznaczenieSprawy,
  wl: boolean,
  ctx: KontekstOperacji,
): WynikOperacji {
  return zmienPlan(ctx, ({ plan }) =>
    znajdzSprawe(plan, idSprawy) ? zmienOznaczenie(plan, idSprawy, oznaczenie, wl) : null,
  );
}

/**
 * Zapisuje wariant przy sprawie, której dotyczy. Sprawa K37 ma osobną sprawę na rodzica, więc wariant trafia
 * do sprawy rodzica zalogowanego konta.
 */
export function zapiszWybranyWariant(wariant: WybranyWariant, ctx: KontekstOperacji): WynikOperacji {
  return zmienPlan(ctx, (rodzina) => {
    const pesel = odczytajZalogowanego()?.stanKonta.konto.pesel;
    const osoby = osobyRodziny(rodzina.daneRodziny);
    const rodzic: RodzicWRodzinie = pesel !== undefined && pesel === osoby.peselDrugiegoRodzica ? 'drugi-rodzic' : 'matka';
    const sprawa = sprawaPozycji(rodzina.plan, wariant.sprawa, rodzic);
    return sprawa ? zapiszWariantWPlanie(rodzina.plan, sprawa.idSprawy, wariant) : null;
  });
}
