// Hook ViewDemoAccountPicker: dostępność symulacji narodzin dziecka dla dowolnego konta z listy, bez sesji
// (kontrakt, sekcja 6.4). Właściciel: u01 (Logowanie i konta demonstracyjne).
//
// Hook działa jak hooki z dane/magazyn/hooki.ts: zawiesza się podczas prerenderu przez use(browser()) i czyta
// magazyn przez useSyncExternalStore. Migawka jest wartością tekstową, więc ma stabilną referencję.
import { use, useCallback, useSyncExternalStore } from 'react';
import { browser } from 'react-dom';
import {
  dostepnoscSymulacjiNarodzin,
  type DostepnoscSymulacjiNarodzin,
} from '@/dane/magazyn/operacje/konta-demo';
import { subskrybuj } from '@/dane/magazyn/rdzen';
import type { Pesel } from '@/domena/typy';

const POWOD_PRZEGLADARKI = 'Dane przewodnika żyją w magazynie przeglądarki, więc widok renderuje się w przeglądarce.';

function niedostepna(): DostepnoscSymulacjiNarodzin {
  return 'niedostepna';
}

/** Dostępność symulacji narodzin dziecka dla konta `pesel` (konto, jego rodzina i symulowany ZUS). */
export function useDostepnoscSymulacjiNarodzin(pesel: Pesel): DostepnoscSymulacjiNarodzin {
  use(browser(POWOD_PRZEGLADARKI));
  const migawka = useCallback(() => dostepnoscSymulacjiNarodzin(pesel), [pesel]);
  return useSyncExternalStore(subskrybuj, migawka, niedostepna);
}
