// Propsy sekcji akcji ViewCaseGuide (kontrakt, sekcja 12.4). Właściciel pliku: u00, gospodarz: u17.
import type { ReactNode } from 'react';
import type { PropsSlotuSprawy } from '@/app/(strefa)/plan-rodziny/_sloty/typy';

export type { PropsSlotuSprawy } from '@/app/(strefa)/plan-rodziny/_sloty/typy';

interface PropsWMiejscach {
  akcja: PropsSlotuSprawy;
}

export type MiejsceSlotu = keyof PropsWMiejscach;
export type PropsSlotu<M extends MiejsceSlotu> = PropsWMiejscach[M];

export interface WpisSlotu<M extends MiejsceSlotu> {
  id: string; // nazwa pliku sekcji, klucz elementu listy
  Komponent: (props: PropsSlotu<M>) => ReactNode;
}
