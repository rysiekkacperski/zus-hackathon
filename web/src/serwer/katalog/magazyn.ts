import 'server-only';

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { seedKatalogu } from '@/dane/katalog';
import { zlozKatalog } from '@/domena/katalog/zloz';
import { czyEdycjeKatalogu, edycjePuste, zastosujZmiane } from '@/domena/katalog/zmiany';
import type { EdycjeKatalogu, Katalog, ZmianaKatalogu } from '@/domena/typy';

// Serwerowy magazyn edycji Katalogu świadczeń dla usługi REST /api/katalog. Właściciel: u06.
//
// Edycje Administratora leżą w pliku JSON `katalog.json` w katalogu ze zmiennej KATALOG_DANE_KATALOG,
// domyślnie `web/.dane/`, i w kopii w pamięci procesu serwera. Wartości startowe katalogu zostają w kodzie
// (`dane/katalog`), a plik przechowuje wyłącznie edycje, które usługa nakłada na seed funkcją `zlozKatalog`.
// Zapis trafia najpierw do pliku tymczasowego, a potem zastępuje plik docelowy, więc przerwany zapis zostawia
// poprzednią treść. Gdy system plików odrzuca zapis (hosting bez trwałego dysku), edycje zostają w pamięci procesu,
// a odpowiedź usługi podaje `trwaly: false`. Zapisy wykonują się po kolei w jednej kolejce obietnic.

const NAZWA_PLIKU = 'katalog.json';

interface PlikKatalogu {
  edycje: EdycjeKatalogu;
  zapisano: string;
}

interface StanMagazynu {
  edycje: EdycjeKatalogu | null;
  trwaly: boolean;
  kolejka: Promise<unknown>;
}

// Stan w obiekcie globalnym przetrwa ponowne załadowanie modułu przez serwer deweloperski.
const globalny = globalThis as typeof globalThis & { __magazynKatalogu?: StanMagazynu };
const stan: StanMagazynu = (globalny.__magazynKatalogu ??= { edycje: null, trwaly: true, kolejka: Promise.resolve() });

/** Katalog danych magazynu: KATALOG_DANE_KATALOG (bezwzględny albo względny wobec folderu web/) albo web/.dane. */
export function katalogDanych(): string {
  const zmienna = process.env.KATALOG_DANE_KATALOG?.trim();
  // Ścieżka zależy od zmiennej środowiskowej, więc komentarz wyłącza śledzenie plików projektu przez Turbopack.
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), zmienna ? zmienna : '.dane');
}

function sciezkaPliku(): string {
  return path.join(katalogDanych(), NAZWA_PLIKU);
}

async function wczytajZPliku(): Promise<EdycjeKatalogu> {
  try {
    const zawartosc: unknown = JSON.parse(await readFile(sciezkaPliku(), 'utf8'));
    const edycje = (zawartosc as Partial<PlikKatalogu> | null)?.edycje;
    if (czyEdycjeKatalogu(edycje)) return edycje;
  } catch {
    // Brak pliku albo uszkodzony JSON: usługa startuje z katalogiem bez edycji.
  }
  return edycjePuste();
}

async function zapiszDoPliku(edycje: EdycjeKatalogu, zapisano: string): Promise<boolean> {
  const plik = sciezkaPliku();
  const tymczasowy = `${plik}.${process.pid}.tmp`;
  try {
    await mkdir(path.dirname(plik), { recursive: true });
    const tresc: PlikKatalogu = { edycje, zapisano };
    await writeFile(tymczasowy, `${JSON.stringify(tresc, null, 2)}\n`, 'utf8');
    await rename(tymczasowy, plik);
    return true;
  } catch {
    return false;
  }
}

/** Bieżące edycje katalogu: kopia w pamięci, a przy pierwszym odczycie plik magazynu. */
export async function odczytajEdycje(): Promise<{ edycje: EdycjeKatalogu; trwaly: boolean }> {
  if (stan.edycje === null) stan.edycje = await wczytajZPliku();
  return { edycje: stan.edycje, trwaly: stan.trwaly };
}

/** Katalog złożony z seedu i bieżących edycji. */
export async function odczytajKatalogZlozony(): Promise<Katalog> {
  return zlozKatalog(seedKatalogu, (await odczytajEdycje()).edycje);
}

function wKolejce<T>(fn: () => Promise<T>): Promise<T> {
  const wynik = stan.kolejka.then(fn, fn);
  stan.kolejka = wynik.catch(() => undefined);
  return wynik;
}

async function utrwal(edycje: EdycjeKatalogu, zapisano: string): Promise<{ edycje: EdycjeKatalogu; trwaly: boolean }> {
  stan.edycje = edycje;
  stan.trwaly = await zapiszDoPliku(edycje, zapisano);
  return { edycje, trwaly: stan.trwaly };
}

/** Stosuje zmianę Administratora do bieżących edycji i zapisuje wynik. */
export function zapiszZmiane(
  zmiana: ZmianaKatalogu,
  zapisano: string,
): Promise<{ edycje: EdycjeKatalogu; trwaly: boolean }> {
  return wKolejce(async () => {
    const { edycje } = await odczytajEdycje();
    return utrwal(zastosujZmiane(edycje, zmiana), zapisano);
  });
}

export type WynikZastapienia =
  | { ok: true; edycje: EdycjeKatalogu; trwaly: boolean }
  | { ok: false; edycje: EdycjeKatalogu };

/**
 * Zastępuje wszystkie edycje (import albo przeniesienie katalogu). Gdy wywołujący podaje `bazowaWersja` różną
 * od bieżącej wersji, zapis nie następuje, a wynik zwraca bieżące edycje (konflikt wersji). Nowe edycje dostają
 * wersję większą od bieżącej, dzięki czemu plany rodzin przeliczą się po zastąpieniu.
 */
export function zastapEdycje(
  nowe: EdycjeKatalogu,
  bazowaWersja: number | undefined,
  zapisano: string,
): Promise<WynikZastapienia> {
  return wKolejce(async () => {
    const { edycje } = await odczytajEdycje();
    if (bazowaWersja !== undefined && bazowaWersja !== edycje.wersja) return { ok: false, edycje };
    const wersja = Math.max(nowe.wersja, edycje.wersja + 1);
    const zapis = await utrwal({ ...nowe, wersja }, zapisano);
    return { ok: true, ...zapis };
  });
}
