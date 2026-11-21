// Zegar przewodnika (kontrakt, sekcja 1.2). Jedyne miejsce, które czyta Date.now(): kontekst operacji
// dla obsługi zdarzeń i migawki czasu dla hooków useDzis i useTeraz. Czas liczymy w strefie
// Europe/Warsaw, a parametr systemu dataDemo (w trybie demonstracyjnym) podstawia datę „dzisiaj”.
import { dzisZZegara, terazZZegara } from '@/domena/daty';
import type { DataISO, KontekstOperacji, StanGlobalny } from '@/domena/typy';
import { KLUCZ_GLOBALNE } from '@/dane/magazyn/klucze';
import { czyPrzegladarka, odczytaj, subskrybuj } from '@/dane/magazyn/rdzen';

/** Data demonstracyjna obowiązuje wyłącznie przy włączonym trybie demonstracyjnym (sekcja 6.6). */
export function obowiazujacaDataDemo(): DataISO | null {
  const parametry = odczytaj<StanGlobalny>(KLUCZ_GLOBALNE)?.parametry;
  return parametry?.trybDemonstracyjny ? parametry.dataDemo : null;
}

/** Kontekst operacji dla podanej chwili: dzis = dataDemo albo data w Warszawie, teraz = dzis + godzina. */
export function kontekstZChwili(msOdEpoki: number, dataDemo: DataISO | null): KontekstOperacji {
  return { dzis: dzisZZegara(msOdEpoki, dataDemo), teraz: terazZZegara(msOdEpoki, dataDemo) };
}

/** Kontekst operacji z bieżącą chwilą. Wywołuj w obsłudze zdarzeń, nigdy w renderowaniu. */
export function pobierzKontekstOperacji(): KontekstOperacji {
  return kontekstZChwili(Date.now(), obowiazujacaDataDemo());
}

// --- Migawki czasu dla hooków ------------------------------------------------------------------

/** Dokładność odświeżania migawki: co minutę (domyślnie) albo co sekundę (odliczanie). */
export type DokladnoscZegara = 'minuta' | 'sekunda';

const sluchacze: Record<DokladnoscZegara, Set<() => void>> = { minuta: new Set(), sekunda: new Set() };
const migawki: Record<DokladnoscZegara, KontekstOperacji | null> = { minuta: null, sekunda: null };
let dataDemoMigawek: DataISO | null = null;
let interwal: ReturnType<typeof setInterval> | null = null;
let odpietyOdMagazynu: (() => void) | null = null;

function biezacyKontekst(): KontekstOperacji {
  dataDemoMigawek = obowiazujacaDataDemo();
  return kontekstZChwili(Date.now(), dataDemoMigawek);
}

function rozne(d: DokladnoscZegara, a: KontekstOperacji, b: KontekstOperacji): boolean {
  if (a.dzis !== b.dzis) return true;
  return d === 'sekunda' ? a.teraz !== b.teraz : a.teraz.slice(0, 16) !== b.teraz.slice(0, 16);
}

function tik(): void {
  const nowy = biezacyKontekst();
  for (const d of ['minuta', 'sekunda'] as const) {
    const stary = migawki[d];
    if (stary !== null && !rozne(d, stary, nowy)) continue;
    migawki[d] = nowy;
    for (const sluchacz of [...sluchacze[d]]) sluchacz();
  }
}

function poZmianieMagazynu(): void {
  // Zmiana daty demonstracyjnej przelicza „dzisiaj” od razu, bez czekania na kolejne tyknięcie.
  if (obowiazujacaDataDemo() !== dataDemoMigawek) tik();
}

function poZmianieWidocznosci(): void {
  if (document.visibilityState === 'visible') tik();
}

function liczbaSluchaczy(): number {
  return sluchacze.minuta.size + sluchacze.sekunda.size;
}

function uruchom(): void {
  if (interwal !== null || !czyPrzegladarka()) return;
  interwal = setInterval(tik, 1000);
  odpietyOdMagazynu = subskrybuj(poZmianieMagazynu);
  document.addEventListener('visibilitychange', poZmianieWidocznosci);
}

function zatrzymaj(): void {
  if (interwal === null) return;
  clearInterval(interwal);
  interwal = null;
  odpietyOdMagazynu?.();
  odpietyOdMagazynu = null;
  document.removeEventListener('visibilitychange', poZmianieWidocznosci);
}

/** Subskrypcja migawki czasu o podanej dokładności (useSyncExternalStore). */
export function subskrybujZegar(dokladnosc: DokladnoscZegara, sluchacz: () => void): () => void {
  sluchacze[dokladnosc].add(sluchacz);
  uruchom();
  tik();
  return () => {
    sluchacze[dokladnosc].delete(sluchacz);
    // Bez subskrybentów migawka się nie odświeża, więc następny odczyt liczy ją od nowa.
    if (sluchacze[dokladnosc].size === 0) migawki[dokladnosc] = null;
    if (liczbaSluchaczy() === 0) zatrzymaj();
  };
}

/**
 * Migawka czasu: ta sama referencja do chwili zmiany minuty (albo sekundy), dnia lub daty demo.
 * Przy subskrybentach migawkę odświeża tyknięcie zegara. Bez subskrybentów (pierwsze renderowanie
 * przed subskrypcją) migawka odświeża się przy odczycie, więc nie pokazuje chwili sprzed długiej przerwy.
 */
export function migawkaZegara(dokladnosc: DokladnoscZegara): KontekstOperacji {
  const istniejaca = migawki[dokladnosc];
  if (istniejaca !== null && sluchacze[dokladnosc].size > 0) return istniejaca;
  // Bez zmiany dataDemoMigawek: tę wartość porównuje wyłącznie tyknięcie po zmianie magazynu.
  const nowa = kontekstZChwili(Date.now(), obowiazujacaDataDemo());
  if (istniejaca !== null && !rozne(dokladnosc, istniejaca, nowa)) return istniejaca;
  migawki[dokladnosc] = nowa;
  return nowa;
}
