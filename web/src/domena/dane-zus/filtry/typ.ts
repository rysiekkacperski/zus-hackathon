// Podpis filtra odczytu danych z konta ZUS (kontrakt, sekcja 7.2): filtr dostaje kopię po poprzednich filtrach
// i wejście odczytu, zwraca nową kopię. Filtry są czyste i nie zmieniają przekazanych obiektów.
import type { DaneZKontaZus, ZnacznikCzasu, ZrodloweDaneKontaZus } from '@/domena/typy';

export interface WejscieFiltraOdczytu {
  zrodlo: ZrodloweDaneKontaZus;
  poprzednia: DaneZKontaZus | null;
  teraz: ZnacznikCzasu;
}

export type FiltrOdczytu = (kopia: DaneZKontaZus, w: WejscieFiltraOdczytu) => DaneZKontaZus;
