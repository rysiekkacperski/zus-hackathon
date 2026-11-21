// Propsy slotów ViewProfileSummary (kontrakt, sekcja 12.4). Właściciel pliku: u00, gospodarz: u11.
import type { ReactNode } from 'react';
import type { KontekstRodziny } from '@/dane/magazyn/hooki';
import type { KontoPrzewodnika, SzkicProfilu } from '@/domena/typy';

// Tryb startu (/profil-na-start/podsumowanie, NU) albo tryb rodziny (/profil-rodziny, R i DR).
export type TrybPodsumowania = 'start' | 'rodzina';

interface PropsWMiejscach {
  sekcja: {
    tryb: TrybPodsumowania;
    konto: KontoPrzewodnika;
    szkic: SzkicProfilu | null; // szkic profilu na start albo zmiany profilu
    kontekst: KontekstRodziny | null; // null przed zapisem profilu
  };
}

export type MiejsceSlotu = keyof PropsWMiejscach;
export type PropsSlotu<M extends MiejsceSlotu> = PropsWMiejscach[M];

export interface WpisSlotu<M extends MiejsceSlotu> {
  id: string; // nazwa pliku slotu, klucz elementu listy
  Komponent: (props: PropsSlotu<M>) => ReactNode;
}
