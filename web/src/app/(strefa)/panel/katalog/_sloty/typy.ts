// Propsy slotów ViewCatalogList (kontrakt, sekcja 12.4). Właściciel pliku: u00, gospodarz: u06.
import type { ReactNode } from 'react';
import type { DataISO, Katalog } from '@/domena/typy';

// Wartości parametru ?zakladka= (tabela 2.2).
export type ZakladkaKatalogu = 'pozycje' | 'kwoty' | 'wymiary' | 'reguly' | 'dokumenty';

interface PropsWMiejscach {
  zakladka: {
    katalog: Katalog;
    dzis: DataISO;
  };
}

export type MiejsceSlotu = keyof PropsWMiejscach;
export type PropsSlotu<M extends MiejsceSlotu> = PropsWMiejscach[M];

export interface WpisSlotu<M extends MiejsceSlotu> {
  id: string; // nazwa pliku slotu, klucz elementu listy
  zakladka: ZakladkaKatalogu; // zakładka, której panel renderuje slot
  Komponent: (props: PropsSlotu<M>) => ReactNode;
}
