// Statusy spraw planu (kontrakt, sekcja 7.2). Właściciel: u08 (Silnik planu rodziny).
// Zaślepka fundamentu: implementuje u08. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type {
  DataISO,
  IdPozycji,
  IdSprawy,
  PlanRodziny,
  RodzicWRodzinie,
  StatusSprawy,
  ZrodloStatusu,
} from '@/domena/typy';

/** Plan ze zmienionym statusem sprawy. Zaślepka zwraca plan bez zmian. */
export function zmienStatus(
  plan: PlanRodziny,
  idSprawy: IdSprawy,
  status: StatusSprawy,
  zrodlo: ZrodloStatusu,
  dzis: DataISO,
): PlanRodziny {
  return plan;
}

/** Identyfikator sprawy pozycji na rodzica, np. 'K21-matka', 'K21-drugi-rodzic'. */
export function idSprawyDlaRodzica(id: IdPozycji, rodzic: RodzicWRodzinie): IdSprawy {
  return `${id}-${rodzic}`;
}
