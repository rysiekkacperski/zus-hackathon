// Podział urlopu rodzicielskiego między rodziców (kontrakt, sekcja 7.2).
// Właściciel: u26 (Kalkulatory wariantu zasiłku i podziału urlopu).
// Zaślepka fundamentu: implementuje u26. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { BledyPol, DataISO, Katalog, PodstawaWymiaru, RodzicWRodzinie, ZapisPodzialuUrlopu } from '@/domena/typy';

export interface WejsciePodzialu {
  podstawy: Partial<Record<RodzicWRodzinie, PodstawaWymiaru>>;
  wariantMatki: '81-5' | '100-70';
  liczbaDzieci: number;
  zaZyciem: boolean;
  tygodnieMatki: number;
  tygodnieDrugiegoRodzica: number;
  katalog: Katalog;
  dzien: DataISO;
}

export type WynikPodzialu = ZapisPodzialuUrlopu['wynik'] & { przepadajace: number; bledy: BledyPol<string> };

/** Stawki, kwoty miesięczne i sumy obu rodziców. Zaślepka zwraca pusty wynik. */
export function wyliczPodzial(w: WejsciePodzialu): WynikPodzialu {
  return { stawki: {}, miesiecznie: {}, sumy: {}, przepadajace: 0, bledy: {} };
}
