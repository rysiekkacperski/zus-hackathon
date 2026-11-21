// Propsy slotów i arkuszy ViewCalcMaternityResult (kontrakt, sekcje 2.3 i 12.4). Właściciel pliku: u00, gospodarz: u15.
import type { ReactNode } from 'react';
import type {
  DaneWejscioweKalkulatora,
  IdSprawy,
  ParametryScenariusza,
  PodstawaWymiaru,
  RodzicWRodzinie,
  WynikScenariusza,
} from '@/domena/typy';

export interface PropsSlotuWyniku {
  idSprawy: IdSprawy | null; // parametr ?sprawa=
  zrodlo: string | null; // parametr ?zrodlo=
  daneWejsciowe: DaneWejscioweKalkulatora;
  podstawy: Partial<Record<RodzicWRodzinie, PodstawaWymiaru>>;
  parametry: ParametryScenariusza;
  wynik: WynikScenariusza;
  onZmianaParametrow: (parametry: ParametryScenariusza) => void;
}

// Propsy arkuszy SheetCalcParentalParts, SheetCalcWorkCombination i SheetCalcReturnToWork (?arkusz=).
export interface PropsArkuszaWyniku extends PropsSlotuWyniku {
  otwarte: boolean;
  onZamknij: () => void;
}

interface PropsWMiejscach {
  wynik: PropsSlotuWyniku;
}

export type MiejsceSlotu = keyof PropsWMiejscach;
export type PropsSlotu<M extends MiejsceSlotu> = PropsWMiejscach[M];

export interface WpisSlotu<M extends MiejsceSlotu> {
  id: string; // nazwa pliku slotu, klucz elementu listy
  Komponent: (props: PropsSlotu<M>) => ReactNode;
}
