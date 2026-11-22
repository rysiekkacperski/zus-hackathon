// Propsy slotów ViewGuideSettings (kontrakt, sekcja 12.4). Właściciel pliku: u00, gospodarz: u02.
import type { ReactNode } from 'react';
import type { KontoPrzewodnika } from '@/domena/typy';

interface PropsWMiejscach {
  sekcja: {
    konto: KontoPrzewodnika;
  };
}

export type MiejsceSlotu = keyof PropsWMiejscach;
export type PropsSlotu<M extends MiejsceSlotu> = PropsWMiejscach[M];

export interface WpisSlotu<M extends MiejsceSlotu> {
  id: string; // nazwa pliku slotu, klucz elementu listy
  Komponent: (props: PropsSlotu<M>) => ReactNode;
}
