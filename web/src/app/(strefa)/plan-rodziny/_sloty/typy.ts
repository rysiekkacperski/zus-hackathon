// Propsy slotów ViewFamilyPlan (kontrakt, sekcja 12.4). Właściciel pliku: u00, gospodarz: u12.
import type { ReactNode } from 'react';
import type { KontekstRodziny } from '@/dane/magazyn/hooki';
import type { Pochodzenie, PozycjaPlanu, TerminSprawy } from '@/domena/typy';

// Propsy slotu sprawy, wspólne dla slotów przy sprawie na ViewFamilyPlan i sekcji ViewCaseDetails i ViewCaseGuide.
export interface PropsSlotuSprawy {
  sprawa: PozycjaPlanu;
  termin?: TerminSprawy;
  kontekst: KontekstRodziny;
  pochodzenie?: Pochodzenie;
}

// Propsy slotów sekcji „Co możesz zrobić” i bloku nad planem.
export interface PropsSlotuPlanu {
  kontekst: KontekstRodziny;
}

interface PropsWMiejscach {
  akcje: PropsSlotuPlanu;
  nadPlanem: PropsSlotuPlanu;
  przySprawie: PropsSlotuSprawy;
}

export type MiejsceSlotu = keyof PropsWMiejscach;
export type PropsSlotu<M extends MiejsceSlotu> = PropsWMiejscach[M];

export interface WpisSlotu<M extends MiejsceSlotu> {
  id: string; // nazwa pliku slotu, klucz elementu listy
  Komponent: (props: PropsSlotu<M>) => ReactNode;
}
