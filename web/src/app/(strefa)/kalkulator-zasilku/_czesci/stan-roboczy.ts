'use client';

// Bieżący, roboczy stan kalkulatora zasiłku macierzyńskiego (u15): dane wejściowe, podstawy wpisane przez rodzica
// i parametry wyniku. Trwałe są wyłącznie zapisane scenariusze (Wyniki kalkulacji); stan roboczy żyje w pamięci karty
// i przechodzi z ViewCalcMaternityInput do ViewCalcMaternityResult. Bez stanu roboczego wynik liczy się z profilu rodziny.
import { useSyncExternalStore } from 'react';
import type {
  DaneWejscioweKalkulatora,
  ParametryScenariusza,
  Pesel,
  PodstawaWymiaru,
  RodzicWRodzinie,
} from '@/domena/typy';

export interface StanRoboczyKalkulatora {
  konto: Pesel;
  dane: DaneWejscioweKalkulatora;
  // Podstawy wpisane przez rodzica albo przekazane z przykładowej sprawy; pozostałe liczymy z konta ZUS.
  podstawy: Partial<Record<RodzicWRodzinie, PodstawaWymiaru>>;
  pelnyEtat: Partial<Record<RodzicWRodzinie, boolean>>;
  parametry: ParametryScenariusza | null;
}

let biezacy: StanRoboczyKalkulatora | null = null;
const sluchacze = new Set<() => void>();

function powiadom() {
  for (const s of sluchacze) s();
}

function subskrybuj(s: () => void) {
  sluchacze.add(s);
  return () => {
    sluchacze.delete(s);
  };
}

function migawka() {
  return biezacy;
}

function migawkaSerwera() {
  return null;
}

export function ustawStanRoboczy(stan: StanRoboczyKalkulatora | null): void {
  biezacy = stan;
  powiadom();
}

export function zmienStanRoboczy(zmiana: (s: StanRoboczyKalkulatora) => StanRoboczyKalkulatora): void {
  if (biezacy === null) return;
  biezacy = zmiana(biezacy);
  powiadom();
}

/** Stan roboczy zalogowanego konta; stan innego konta w tej karcie jest pomijany. */
export function useStanRoboczy(pesel: Pesel | undefined): StanRoboczyKalkulatora | null {
  const stan = useSyncExternalStore(subskrybuj, migawka, migawkaSerwera);
  return stan !== null && stan.konto === pesel ? stan : null;
}
