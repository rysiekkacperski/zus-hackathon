// Rdzeń magazynu w przeglądarce (kontrakt, sekcja 6.1). Każdy odczyt i zapis localStorage
// i sessionStorage przechodzi przez ten moduł. Rdzeń:
// - serializuje JSON i trzyma w pamięci podręcznej parę { surowy, wartosc } na klucz, więc
//   kolejne odczyty zwracają tę samą referencję (stabilna migawka dla useSyncExternalStore);
// - grupuje zapisy w transakcje: zmiany trafiają do przeglądarki razem na końcu transakcji
//   albo wcale, gdy transakcja się nie powiedzie;
// - rzuca BladZapisu przy zapisie domenowym, gdy włączona jest symulacja błędu zapisu;
// - powiadamia subskrybentów po każdej zatwierdzonej zmianie i po zmianach z innych kart.
import type { StanGlobalny } from '@/domena/typy';
import { KLUCZ_GLOBALNE, KLUCZ_META, PRZEDROSTEK_PRZEWODNIKA } from '@/dane/magazyn/klucze';
import { migrujJesliTrzeba, type MagazynKluczy } from '@/dane/magazyn/migracje';

export type MiejsceZapisu = 'localStorage' | 'sessionStorage';

/**
 * Zapis domenowy zmienia grupy danych elementów systemu i podlega symulacji błędu zapisu.
 * Zapis systemowy (sesja, parametry, rejestr kont, stan interfejsu, logowanie) wykonuje się zawsze.
 */
export type RodzajZapisu = 'domenowe' | 'systemowe';

/** Błąd zapisu danych. Operacje elementów zamieniają go na komunikat 0003 bez zmiany stanu. */
export class BladZapisu extends Error {
  readonly przyczyna: 'symulacja' | 'magazyn';

  constructor(przyczyna: 'symulacja' | 'magazyn', options?: { cause?: unknown }) {
    super(
      przyczyna === 'symulacja'
        ? 'Zapis przerwany przez symulację błędu zapisu.'
        : 'Przeglądarka odrzuciła zapis danych przewodnika.',
      options,
    );
    this.name = 'BladZapisu';
    this.przyczyna = przyczyna;
  }
}

export function czyBladZapisu(blad: unknown): blad is BladZapisu {
  return blad instanceof BladZapisu;
}

// --- Dostęp do Web Storage --------------------------------------------------------------------

/** Magazyn w pamięci strony na wypadek zablokowanego Web Storage (tryb prywatny, polityka witryny). */
class MagazynWPamieci implements MagazynKluczy {
  private readonly wpisy = new Map<string, string>();
  get length(): number {
    return this.wpisy.size;
  }
  key(indeks: number): string | null {
    return [...this.wpisy.keys()][indeks] ?? null;
  }
  getItem(klucz: string): string | null {
    return this.wpisy.get(klucz) ?? null;
  }
  setItem(klucz: string, wartosc: string): void {
    this.wpisy.set(klucz, wartosc);
  }
  removeItem(klucz: string): void {
    this.wpisy.delete(klucz);
  }
}

export function czyPrzegladarka(): boolean {
  return typeof window !== 'undefined';
}

const magazyny: Partial<Record<MiejsceZapisu, MagazynKluczy>> = {};

function czyBrakMiejsca(blad: unknown): boolean {
  if (typeof blad !== 'object' || blad === null) return false;
  const { name, code } = blad as { name?: unknown; code?: unknown };
  return name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED' || code === 22 || code === 1014;
}

function czyZawieraKluczePrzewodnika(m: Storage): boolean {
  for (let i = 0; i < m.length; i += 1) {
    if (m.key(i)?.startsWith(PRZEDROSTEK_PRZEWODNIKA)) return true;
  }
  return false;
}

/**
 * Magazyn przeglądarki albo magazyn w pamięci strony. Zapełniony magazyn z danymi przewodnika zostaje
 * w użyciu, więc odczyty pokazują zapisany stan, a każdy zapis kończy się BladZapisu (0003). Magazyn
 * w pamięci zastępuje Web Storage zablokowany albo bez miejsca na pierwszy zapis (tryb prywatny).
 */
function magazyn(miejsce: MiejsceZapisu): MagazynKluczy {
  const istniejacy = magazyny[miejsce];
  if (istniejacy) return istniejacy;
  let wybrany: MagazynKluczy;
  try {
    const przegladarki = miejsce === 'localStorage' ? window.localStorage : window.sessionStorage;
    const probny = `${PRZEDROSTEK_PRZEWODNIKA}proba`;
    try {
      przegladarki.setItem(probny, '1');
      przegladarki.removeItem(probny);
      wybrany = przegladarki;
    } catch (blad) {
      if (!czyBrakMiejsca(blad) || !czyZawieraKluczePrzewodnika(przegladarki)) throw blad;
      wybrany = przegladarki;
    }
  } catch {
    wybrany = new MagazynWPamieci();
  }
  magazyny[miejsce] = wybrany;
  return wybrany;
}

// --- Pamięć podręczna --------------------------------------------------------------------------

interface WpisPamieci {
  surowy: string | null;
  wartosc: unknown;
}

const pamiec: Record<MiejsceZapisu, Map<string, WpisPamieci>> = {
  localStorage: new Map(),
  sessionStorage: new Map(),
};

const trybRozwojowy = process.env.NODE_ENV !== 'production';

/** W trybie rozwojowym zamraża migawki, żeby zmiana stanu z pominięciem operacji dała błąd od razu. */
function zamroz<T>(wartosc: T): T {
  if (!trybRozwojowy || wartosc === null || typeof wartosc !== 'object') return wartosc;
  const stos: object[] = [wartosc as object];
  while (stos.length > 0) {
    const obiekt = stos.pop() as object;
    if (Object.isFrozen(obiekt)) continue;
    Object.freeze(obiekt);
    for (const pole of Object.values(obiekt)) {
      if (pole !== null && typeof pole === 'object') stos.push(pole as object);
    }
  }
  return wartosc;
}

function rozbierz(surowy: string | null): unknown {
  if (surowy === null) return null;
  try {
    return zamroz(JSON.parse(surowy) as unknown);
  } catch {
    return null;
  }
}

// --- Wersja schematu ---------------------------------------------------------------------------

let schematSprawdzony = false;

function zapewnijSchemat(): void {
  if (schematSprawdzony) return;
  schematSprawdzony = true;
  const wyczyszczono = migrujJesliTrzeba(magazyn('localStorage'), magazyn('sessionStorage'));
  if (wyczyszczono) {
    pamiec.localStorage.clear();
    pamiec.sessionStorage.clear();
  }
}

function przygotuj(): boolean {
  if (!czyPrzegladarka()) return false;
  zapewnijSchemat();
  zainstalujNasluchInnychKart();
  return true;
}

// --- Transakcje --------------------------------------------------------------------------------

interface ZmianaWToku {
  miejsce: MiejsceZapisu;
  klucz: string;
  surowy: string | null;
  wartosc: unknown;
}

let zmianyWToku: Map<string, ZmianaWToku> | null = null;

function idZmiany(miejsce: MiejsceZapisu, klucz: string): string {
  return `${miejsce}|${klucz}`;
}

export function wTransakcji(): boolean {
  return zmianyWToku !== null;
}

function czyObietnica(wartosc: unknown): boolean {
  return (
    wartosc !== null &&
    (typeof wartosc === 'object' || typeof wartosc === 'function') &&
    typeof (wartosc as { then?: unknown }).then === 'function'
  );
}

function zatwierdz(zmiany: Map<string, ZmianaWToku>): void {
  if (zmiany.size === 0) return;
  const zapisane: { miejsce: MiejsceZapisu; klucz: string; poprzedni: string | null }[] = [];
  try {
    for (const z of zmiany.values()) {
      const m = magazyn(z.miejsce);
      const poprzedni = m.getItem(z.klucz);
      if (z.surowy === null) m.removeItem(z.klucz);
      else m.setItem(z.klucz, z.surowy);
      zapisane.push({ miejsce: z.miejsce, klucz: z.klucz, poprzedni });
    }
  } catch (blad) {
    for (const w of zapisane.reverse()) {
      try {
        const m = magazyn(w.miejsce);
        if (w.poprzedni === null) m.removeItem(w.klucz);
        else m.setItem(w.klucz, w.poprzedni);
      } catch {
        // Przywrócenie poprzedniej wartości jest najlepszym możliwym wysiłkiem.
      }
    }
    throw new BladZapisu('magazyn', { cause: blad });
  }
  for (const z of zmiany.values()) {
    pamiec[z.miejsce].set(z.klucz, { surowy: z.surowy, wartosc: z.wartosc });
  }
  powiadom();
}

/**
 * Wykonuje funkcję synchroniczną jako jedną transakcję: odczyty wewnątrz widzą zapisy z tej
 * transakcji, a przeglądarka dostaje wszystkie zmiany naraz po jej zakończeniu. Wyjątek z funkcji
 * odrzuca wszystkie zmiany. Wywołanie zagnieżdżone dołącza do transakcji zewnętrznej.
 */
export function transakcja<T>(fn: () => T): T {
  if (zmianyWToku !== null) return fn();
  if (!przygotuj()) throw new Error('Magazyn przewodnika działa wyłącznie w przeglądarce.');
  const zmiany = new Map<string, ZmianaWToku>();
  zmianyWToku = zmiany;
  let wynik: T;
  try {
    wynik = fn();
    if (czyObietnica(wynik)) {
      throw new Error('Transakcja magazynu przyjmuje wyłącznie funkcję synchroniczną.');
    }
  } finally {
    zmianyWToku = null;
  }
  zatwierdz(zmiany);
  return wynik;
}

/**
 * Punkt zapisu wewnątrz bieżącej transakcji: wyjątek z funkcji albo wynik, dla którego `czyWycofac`
 * zwraca prawdę, cofa zmiany tej funkcji i zostawia wcześniejsze zmiany transakcji. Dzięki temu
 * operacja zagnieżdżona w innej operacji kończy się bez zmiany stanu tak samo jak samodzielna.
 * Poza transakcją wykonuje funkcję bez punktu zapisu.
 */
export function wPunkcieZapisu<T>(fn: () => T, czyWycofac: (wynik: T) => boolean = () => false): T {
  const zmiany = zmianyWToku;
  if (zmiany === null) return fn();
  const punkt = new Map(zmiany);
  const wycofaj = () => {
    zmiany.clear();
    for (const [id, zmiana] of punkt) zmiany.set(id, zmiana);
  };
  let wynik: T;
  try {
    wynik = fn();
  } catch (blad) {
    wycofaj();
    throw blad;
  }
  if (czyWycofac(wynik)) wycofaj();
  return wynik;
}

// --- Odczyt ------------------------------------------------------------------------------------

/** Odczytuje wartość klucza. Brak klucza, uszkodzony JSON albo serwer dają null. */
export function odczytaj<T>(klucz: string, miejsce: MiejsceZapisu = 'localStorage'): T | null {
  if (!przygotuj()) return null;
  const wToku = zmianyWToku?.get(idZmiany(miejsce, klucz));
  if (wToku) return wToku.wartosc as T | null;
  const zPamieci = pamiec[miejsce].get(klucz);
  if (zPamieci) return zPamieci.wartosc as T | null;
  const surowy = magazyn(miejsce).getItem(klucz);
  const wpis: WpisPamieci = { surowy, wartosc: rozbierz(surowy) };
  pamiec[miejsce].set(klucz, wpis);
  return wpis.wartosc as T | null;
}

/** Klucze o podanym przedrostku z uwzględnieniem zmian bieżącej transakcji. */
export function kluczeZPrzedrostkiem(przedrostek: string, miejsce: MiejsceZapisu = 'localStorage'): string[] {
  if (!przygotuj()) return [];
  const m = magazyn(miejsce);
  const klucze = new Set<string>();
  for (let i = 0; i < m.length; i += 1) {
    const klucz = m.key(i);
    if (klucz !== null && klucz.startsWith(przedrostek)) klucze.add(klucz);
  }
  if (zmianyWToku) {
    for (const z of zmianyWToku.values()) {
      if (z.miejsce !== miejsce || !z.klucz.startsWith(przedrostek)) continue;
      if (z.surowy === null) klucze.delete(z.klucz);
      else klucze.add(z.klucz);
    }
  }
  return [...klucze].sort();
}

/** Symulacja błędu zapisu działa wyłącznie w trybie demonstracyjnym (sekcja 6.6). */
export function czyWymuszonyBladZapisu(): boolean {
  const globalne = odczytaj<StanGlobalny>(KLUCZ_GLOBALNE);
  return Boolean(globalne?.parametry.trybDemonstracyjny && globalne.parametry.symulacje.bladZapisu);
}

// --- Zapis -------------------------------------------------------------------------------------

function zapiszWTransakcji(miejsce: MiejsceZapisu, klucz: string, wartosc: unknown, rodzaj: RodzajZapisu): void {
  if (!czyPrzegladarka()) throw new Error('Magazyn przewodnika działa wyłącznie w przeglądarce.');
  transakcja(() => {
    if (rodzaj === 'domenowe' && czyWymuszonyBladZapisu()) throw new BladZapisu('symulacja');
    const surowy = wartosc === null || wartosc === undefined ? null : JSON.stringify(wartosc);
    // Migawka powstaje z zapisanego tekstu, więc późniejsza zmiana obiektu wywołującego jej nie dotyczy.
    (zmianyWToku as Map<string, ZmianaWToku>).set(idZmiany(miejsce, klucz), {
      miejsce,
      klucz,
      surowy,
      wartosc: rozbierz(surowy),
    });
  });
}

/** Zapis grupy danych elementu systemu; rzuca BladZapisu przy symulacji błędu zapisu. */
export function zapiszDomenowe<T>(klucz: string, wartosc: T): void {
  zapiszWTransakcji('localStorage', klucz, wartosc, 'domenowe');
}

/** Zapis sesji, parametrów, rejestru kont i stanu interfejsu; wykonuje się zawsze. */
export function zapiszSystemowe<T>(klucz: string, wartosc: T, miejsce: MiejsceZapisu = 'localStorage'): void {
  zapiszWTransakcji(miejsce, klucz, wartosc, 'systemowe');
}

export function zapisz<T>(klucz: string, wartosc: T, rodzaj: RodzajZapisu, miejsce: MiejsceZapisu = 'localStorage'): void {
  if (rodzaj === 'domenowe' && miejsce !== 'localStorage') {
    throw new Error('Zapis domenowy trafia wyłącznie do localStorage.');
  }
  zapiszWTransakcji(miejsce, klucz, wartosc, rodzaj);
}

export function usunDomenowe(klucz: string): void {
  zapiszWTransakcji('localStorage', klucz, null, 'domenowe');
}

export function usunSystemowe(klucz: string, miejsce: MiejsceZapisu = 'localStorage'): void {
  zapiszWTransakcji(miejsce, klucz, null, 'systemowe');
}

export function usun(klucz: string, rodzaj: RodzajZapisu, miejsce: MiejsceZapisu = 'localStorage'): void {
  zapiszWTransakcji(miejsce, klucz, null, rodzaj);
}

// --- Subskrypcje -------------------------------------------------------------------------------

const sluchacze = new Set<() => void>();

function powiadom(): void {
  for (const sluchacz of [...sluchacze]) sluchacz();
}

/** Subskrypcja zmian magazynu dla useSyncExternalStore i zegara. */
export function subskrybuj(sluchacz: () => void): () => void {
  przygotuj();
  sluchacze.add(sluchacz);
  return () => {
    sluchacze.delete(sluchacz);
  };
}

let nasluchZainstalowany = false;

function zainstalujNasluchInnychKart(): void {
  if (nasluchZainstalowany || !czyPrzegladarka()) return;
  nasluchZainstalowany = true;
  window.addEventListener('storage', (zdarzenie: StorageEvent) => {
    let lokalny: Storage | null = null;
    try {
      lokalny = window.localStorage;
    } catch {
      return;
    }
    if (zdarzenie.storageArea !== lokalny) return;
    if (zdarzenie.key === null) {
      pamiec.localStorage.clear();
      schematSprawdzony = false;
      powiadom();
      return;
    }
    if (!zdarzenie.key.startsWith(PRZEDROSTEK_PRZEWODNIKA)) return;
    const wpis = pamiec.localStorage.get(zdarzenie.key);
    if (wpis && wpis.surowy === zdarzenie.newValue) return;
    if (zdarzenie.key === KLUCZ_META) {
      pamiec.localStorage.clear();
      schematSprawdzony = false;
    } else {
      pamiec.localStorage.set(zdarzenie.key, {
        surowy: zdarzenie.newValue,
        wartosc: rozbierz(zdarzenie.newValue),
      });
    }
    powiadom();
  });
}
