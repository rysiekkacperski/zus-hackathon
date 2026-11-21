'use client';

// Bieżący, roboczy stan kalkulatora zasiłku macierzyńskiego (u15): dane wejściowe, podstawy wpisane przez rodzica
// i parametry wyniku. Trwałe są wyłącznie zapisane scenariusze (Wyniki kalkulacji); stan roboczy żyje w pamięci karty
// i przechodzi z ViewCalcMaternityInput do ViewCalcMaternityResult. Bez stanu roboczego wynik liczy się z profilu rodziny.
// Stan kluczuje właściciel danych: PESEL konta albo 'gosc:<id>' w trybie gościa. Logowanie gościa w tej karcie
// przenosi stan roboczy gościa do konta (WlascicielDanych.zGoscia).
import { useEffect, useSyncExternalStore } from 'react';
import type {
  DaneWejscioweKalkulatora,
  ParametryScenariusza,
  PodstawaWymiaru,
  RodzicWRodzinie,
} from '@/domena/typy';

export interface StanRoboczyKalkulatora {
  // Właściciel stanu: PESEL konta albo 'gosc:<id>'.
  konto: string;
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

/**
 * Stan roboczy właściciela danych (konta albo gościa); stan innego właściciela w tej karcie jest pomijany.
 * Stan gościa `zGoscia`, którego przeniosło logowanie, przechodzi na właściciela i dostaje jego klucz.
 */
export function useStanRoboczy(idWlasciciela: string | null, zGoscia?: string): StanRoboczyKalkulatora | null {
  const stan = useSyncExternalStore(subskrybuj, migawka, migawkaSerwera);
  const przejety = stan !== null && idWlasciciela !== null && zGoscia !== undefined && stan.konto === zGoscia;
  useEffect(() => {
    if (!przejety || idWlasciciela === null) return;
    zmienStanRoboczy((s) => (s.konto === zGoscia ? { ...s, konto: idWlasciciela } : s));
  }, [przejety, idWlasciciela, zGoscia]);
  if (stan === null || idWlasciciela === null) return null;
  return stan.konto === idWlasciciela || przejety ? stan : null;
}
