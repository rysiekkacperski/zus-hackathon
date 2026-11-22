// Propsy slotów ViewBirthPackage (kontrakt, sekcja 12.4). Właściciel pliku: u00, gospodarz: u19.
import type { ReactNode } from 'react';
import type { KontekstRodziny } from '@/dane/magazyn/hooki';

interface PropsWMiejscach {
  akcja: {
    kontekst: KontekstRodziny;
  };
}

export type MiejsceSlotu = keyof PropsWMiejscach;
export type PropsSlotu<M extends MiejsceSlotu> = PropsWMiejscach[M];

export interface WpisSlotu<M extends MiejsceSlotu> {
  id: string; // nazwa pliku slotu, klucz elementu listy
  Komponent: (props: PropsSlotu<M>) => ReactNode;
}
