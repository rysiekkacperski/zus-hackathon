// Kontrola wersji układu stanu (kontrakt, sekcja 6.2, klucz ppm:v1:meta).
// Przy braku znacznika albo innej wersji usuwa wszystkie klucze przewodnika z localStorage
// i sessionStorage, czyści bazę plików i zapisuje stan początkowy.
import type { MetaMagazynu } from '@/domena/typy';
import {
  KLUCZ_GLOBALNE,
  KLUCZ_META,
  NAZWA_BAZY_PLIKOW,
  PRZEDROSTEK_PRZEWODNIKA,
  WERSJA_SCHEMATU,
} from '@/dane/magazyn/klucze';
import { stanGlobalnyPoczatkowy } from '@/dane/magazyn/stan-poczatkowy';
import { DAWNE_OPOZNIENIA_ODCZYTU_ZUS_MS, OPOZNIENIE_ODCZYTU_ZUS_MS } from '@/dane/parametry-systemu';

/** Minimalny interfejs magazynu Web Storage, który rdzeń dostarcza migracji. */
export interface MagazynKluczy {
  readonly length: number;
  key(indeks: number): string | null;
  getItem(klucz: string): string | null;
  setItem(klucz: string, wartosc: string): void;
  removeItem(klucz: string): void;
}

function czyAktualnaWersja(surowy: string | null): boolean {
  if (surowy === null) return false;
  try {
    const meta = JSON.parse(surowy) as Partial<MetaMagazynu> | null;
    return meta?.wersjaSchematu === WERSJA_SCHEMATU;
  } catch {
    return false;
  }
}

function usunKluczePrzewodnika(magazyn: MagazynKluczy): void {
  const doUsuniecia: string[] = [];
  for (let i = 0; i < magazyn.length; i += 1) {
    const klucz = magazyn.key(i);
    if (klucz !== null && klucz.startsWith(PRZEDROSTEK_PRZEWODNIKA)) doUsuniecia.push(klucz);
  }
  for (const klucz of doUsuniecia) magazyn.removeItem(klucz);
}

function wyczyscBazePlikow(): void {
  if (typeof indexedDB === 'undefined') return;
  try {
    indexedDB.deleteDatabase(NAZWA_BAZY_PLIKOW);
  } catch {
    // Baza plików bywa niedostępna (tryb prywatny). Pliki bez kluczy w localStorage są nieosiągalne.
  }
}

/**
 * Zamienia w zapisanych parametrach dawną wartość początkową czasu odczytu z ZUS na bieżącą.
 * Pozostałe dane stanu globalnego zostają bez zmian. Zwraca true, gdy zapisała zmianę.
 */
function uzupelnijParametry(lokalny: MagazynKluczy): boolean {
  try {
    const surowy = lokalny.getItem(KLUCZ_GLOBALNE);
    if (surowy === null) return false;
    const globalne = JSON.parse(surowy) as {
      parametry?: { symulacje?: { opoznienieOdczytuZusMs?: unknown } };
    } | null;
    const symulacje = globalne?.parametry?.symulacje;
    const opoznienie = symulacje?.opoznienieOdczytuZusMs;
    if (!symulacje || typeof opoznienie !== 'number') return false;
    if (!DAWNE_OPOZNIENIA_ODCZYTU_ZUS_MS.includes(opoznienie)) return false;
    symulacje.opoznienieOdczytuZusMs = OPOZNIENIE_ODCZYTU_ZUS_MS;
    lokalny.setItem(KLUCZ_GLOBALNE, JSON.stringify(globalne));
    return true;
  } catch {
    // Uszkodzony albo zablokowany magazyn: parametry zostają w zapisanej postaci.
    return false;
  }
}

/**
 * Sprawdza znacznik wersji i w razie potrzeby zakłada stan początkowy. Przy aktualnej wersji
 * uzupełnia zapisane parametry o bieżące wartości początkowe.
 * Zwraca true, gdy zmieniła zapisany stan (rdzeń unieważnia wtedy pamięć podręczną).
 */
export function migrujJesliTrzeba(lokalny: MagazynKluczy, karta: MagazynKluczy): boolean {
  if (czyAktualnaWersja(lokalny.getItem(KLUCZ_META))) return uzupelnijParametry(lokalny);

  usunKluczePrzewodnika(lokalny);
  usunKluczePrzewodnika(karta);
  wyczyscBazePlikow();

  const meta: MetaMagazynu = { wersjaSchematu: WERSJA_SCHEMATU };
  try {
    lokalny.setItem(KLUCZ_GLOBALNE, JSON.stringify(stanGlobalnyPoczatkowy()));
    lokalny.setItem(KLUCZ_META, JSON.stringify(meta));
  } catch {
    // Brak miejsca albo zablokowany magazyn: odczyty zwrócą stan początkowy z pamięci.
  }
  return true;
}
