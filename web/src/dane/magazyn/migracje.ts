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
 * Sprawdza znacznik wersji i w razie potrzeby zakłada stan początkowy.
 * Zwraca true, gdy wyczyściła magazyn (rdzeń unieważnia wtedy pamięć podręczną).
 */
export function migrujJesliTrzeba(lokalny: MagazynKluczy, karta: MagazynKluczy): boolean {
  if (czyAktualnaWersja(lokalny.getItem(KLUCZ_META))) return false;

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
