// Zaślepka fundamentu: kalendarz bez terminów. Właściciel: u13 (Kalendarz terminów).
// Docelowo wylicza termin, kotwicę i koszt spóźnienia każdej sprawy planu (kontrakt, sekcja 7.2).
import type { DaneCiazyIDziecka, DaneRodziny, DataISO, KalendarzTerminow, Katalog, PlanRodziny, ZnacznikCzasu } from '@/domena/typy';

export interface WejscieTerminow {
  plan: PlanRodziny;
  daneCiazy: DaneCiazyIDziecka | null;
  daneRodziny: DaneRodziny;
  katalog: Katalog;
  dzis: DataISO;
  teraz: ZnacznikCzasu;
}

export function wyliczTerminy(w: WejscieTerminow): KalendarzTerminow {
  return { terminy: [], wyliczono: w.teraz };
}
