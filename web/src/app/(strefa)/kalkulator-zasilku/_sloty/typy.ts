// Propsy slotów ViewCalcMaternityInput (kontrakt, sekcja 12.4). Właściciel pliku: u00, gospodarz: u15.
import type { ReactNode } from 'react';
import type { DaneWejscioweKalkulatora, IdSprawy, PodstawaWymiaru, RodzicWRodzinie } from '@/domena/typy';

// Zmiana danych wejściowych i podstaw wymiaru, którą slot przekazuje gospodarzowi.
export interface ZmianaDanychKalkulatora {
  dane?: Partial<DaneWejscioweKalkulatora>;
  podstawy?: Partial<Record<RodzicWRodzinie, PodstawaWymiaru>>;
}

interface PropsWMiejscach {
  daneWejsciowe: {
    zrodlo: string | null; // parametr ?zrodlo=
    idSprawy: IdSprawy | null; // parametr ?sprawa=
    dane: DaneWejscioweKalkulatora | null;
    onUzupelnij: (zmiana: ZmianaDanychKalkulatora) => void;
  };
}

export type MiejsceSlotu = keyof PropsWMiejscach;
export type PropsSlotu<M extends MiejsceSlotu> = PropsWMiejscach[M];

export interface WpisSlotu<M extends MiejsceSlotu> {
  id: string; // nazwa pliku slotu, klucz elementu listy
  Komponent: (props: PropsSlotu<M>) => ReactNode;
}
