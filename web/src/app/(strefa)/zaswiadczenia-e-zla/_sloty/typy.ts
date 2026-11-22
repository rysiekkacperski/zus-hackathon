// Propsy slotów ModalSickLeaveDetails (kontrakt, sekcja 12.4). Właściciel pliku: u00, gospodarz: u14.
import type { ReactNode } from 'react';
import type { KontoPrzewodnika, ZaswiadczenieEzla } from '@/domena/typy';

interface PropsWMiejscach {
  akcja: {
    zaswiadczenie: ZaswiadczenieEzla;
    konto: KontoPrzewodnika;
  };
}

export type MiejsceSlotu = keyof PropsWMiejscach;
export type PropsSlotu<M extends MiejsceSlotu> = PropsWMiejscach[M];

export interface WpisSlotu<M extends MiejsceSlotu> {
  id: string; // nazwa pliku slotu, klucz elementu listy
  Komponent: (props: PropsSlotu<M>) => ReactNode;
}
