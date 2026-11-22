// Wspólny katalog świadczeń: synchronizacja edycji Administratora z usługą REST /api/katalog. Właściciel: u06.
//
// Usługa przechowuje edycje katalogu wspólne dla wszystkich użytkowników, a przeglądarka trzyma ich kopię
// w StanGlobalny.edycjeKatalogu, z której korzystają plan rodziny, terminy, kalkulatory i panel.
// - Operacja panelu zapisuje zmianę lokalnie funkcją `zapiszZmianeKatalogu` i dopisuje ją do kolejki
//   `zmianyKataloguDoWyslania` w tej samej transakcji, a potem wysyła kolejkę do usługi (POST, po jednej zmianie).
// - Po przyjęciu zmiany przeglądarka przyjmuje edycje z odpowiedzi usługi i nakłada na nie zmiany, które jeszcze
//   czekają w kolejce, więc widzi także zmiany innych Administratorów.
// - Przeglądarka pobiera edycje (GET) raz przy starcie aplikacji, potem najwyżej co 60 s, po powrocie do karty
//   i po odzyskaniu sieci. Odpowiedź na zapis w panelu niesie aktualne edycje, więc zastępuje kolejne pobranie.
//   Edycje z usługi zastępują kopię lokalną, gdy kolejka jest pusta; przy niepustej kolejce przeglądarka najpierw
//   wysyła kolejkę. Równoległe wywołania korzystają z jednego żądania.
// - Bez usługi (błąd sieci, brak trasy, błąd serwera) kopia lokalna działa dalej jak katalog startowy z edycjami
//   tej przeglądarki, a kolejka czeka na kolejną próbę. Zmianę odrzuconą przez usługę (brak roli, błędne dane)
//   przeglądarka zdejmuje z kolejki i zgłasza stan „odrzucona”.
import { useSyncExternalStore } from 'react';
import { PESEL_ADMINISTRATORA_ZUS } from '@/dane/konta-demo';
import { czyPrzegladarka, type RodzajZapisu } from '@/dane/magazyn/rdzen';
import { odczytajGlobalne, odczytajSesje, odczytajZalogowanego, wykonajOperacje, zmienGlobalne } from '@/dane/magazyn/stan';
import { czyEdycjeKatalogu, zastosujZmiane } from '@/domena/katalog/zmiany';
import type { EdycjeKatalogu, OdpowiedzKatalogu, ZmianaKatalogu } from '@/domena/typy';

const ADRES_USLUGI = '/api/katalog';
const NAGLOWEK_SESJI_DEMO = 'X-Sesja-Demo';
/** Najkrótszy odstęp między okresowymi pobraniami katalogu i pobraniem przy otwarciu panelu. */
export const ODSTEP_POBIERANIA_MS = 60_000;
/** Najkrótszy odstęp między pobraniami po powrocie do karty, który chroni przed seriami przełączeń kart. */
const ODSTEP_PO_POWROCIE_MS = 10_000;

// --- Stan połączenia z usługą --------------------------------------------------------------------

export type StanKataloguSerwera =
  | { stan: 'nieznany' }
  | { stan: 'wspolny'; trwaly: boolean }
  | { stan: 'lokalny' }
  | { stan: 'odrzucona' };

let stanSerwera: StanKataloguSerwera = { stan: 'nieznany' };
const sluchacze = new Set<() => void>();
const STAN_NA_SERWERZE: StanKataloguSerwera = { stan: 'nieznany' };

function ustawStan(nowy: StanKataloguSerwera): void {
  if (JSON.stringify(nowy) === JSON.stringify(stanSerwera)) return;
  stanSerwera = nowy;
  for (const s of [...sluchacze]) s();
}

function subskrybujStan(sluchacz: () => void): () => void {
  sluchacze.add(sluchacz);
  return () => {
    sluchacze.delete(sluchacz);
  };
}

/** Stan katalogu wspólnego: wspólny z usługą, lokalny bez usługi albo po odrzuceniu zmiany. */
export function useStanKataloguSerwera(): StanKataloguSerwera {
  return useSyncExternalStore(subskrybujStan, () => stanSerwera, () => STAN_NA_SERWERZE);
}

// --- Zapis zmiany w przeglądarce -------------------------------------------------------------------

function kolejka(): ZmianaKatalogu[] {
  return odczytajGlobalne().zmianyKataloguDoWyslania ?? [];
}

/**
 * Zapisuje zmianę katalogu w kopii lokalnej i dopisuje ją do kolejki wysyłki w jednej transakcji magazynu.
 * Wywołuj wewnątrz operacji; wysyłkę uruchamia `zaplanujWysylkeKatalogu` po zakończeniu operacji.
 */
export function zapiszZmianeKatalogu(zmiana: ZmianaKatalogu, rodzaj: RodzajZapisu = 'domenowe'): EdycjeKatalogu {
  return zmienGlobalne(
    (g) => ({
      ...g,
      edycjeKatalogu: zastosujZmiane(g.edycjeKatalogu, zmiana),
      zmianyKataloguDoWyslania: [...(g.zmianyKataloguDoWyslania ?? []), zmiana],
    }),
    rodzaj,
  ).edycjeKatalogu;
}

/** Przyjmuje edycje z usługi, zdejmuje z kolejki `wyslane` zmian i nakłada pozostałe zmiany kolejki. */
function przyjmijEdycjeSerwera(edycjeSerwera: EdycjeKatalogu, wyslane: number): void {
  wykonajOperacje(() => {
    const g = odczytajGlobalne();
    const reszta = (g.zmianyKataloguDoWyslania ?? []).slice(wyslane);
    const edycje = reszta.reduce<EdycjeKatalogu>(zastosujZmiane, edycjeSerwera);
    const bezZmian =
      JSON.stringify(edycje) === JSON.stringify(g.edycjeKatalogu) &&
      reszta.length === (g.zmianyKataloguDoWyslania ?? []).length;
    if (bezZmian) return;
    zmienGlobalne((s) => ({ ...s, edycjeKatalogu: edycje, zmianyKataloguDoWyslania: reszta }), 'systemowe');
  });
}

function zdejmijPierwszaZmiane(): void {
  wykonajOperacje(() => {
    zmienGlobalne((s) => ({ ...s, zmianyKataloguDoWyslania: (s.zmianyKataloguDoWyslania ?? []).slice(1) }), 'systemowe');
  });
}

// --- Wysyłka i pobieranie --------------------------------------------------------------------------

/**
 * Potwierdzenie roli Administrator dla usługi w trybie demonstracyjnym: sesja zalogowanego Administratora.
 * Przywrócenie katalogu startowego z ustawień demo potwierdza konto Administrator ZUS, bo ustawienia demo
 * działają bez logowania.
 */
function naglowkiZapisu(zmiana: ZmianaKatalogu): Record<string, string> {
  const naglowki: Record<string, string> = { 'Content-Type': 'application/json' };
  const sesja = odczytajSesje();
  const administrator = odczytajZalogowanego()?.stanKonta.konto.rola === 'administrator';
  if (sesja !== null && administrator) naglowki[NAGLOWEK_SESJI_DEMO] = `${sesja.idSesji}:${sesja.pesel}`;
  else if (zmiana.rodzaj === 'przywrocenie') naglowki[NAGLOWEK_SESJI_DEMO] = `ustawienia-demo:${PESEL_ADMINISTRATORA_ZUS}`;
  return naglowki;
}

type WynikWysylki = { rodzaj: 'przyjeta'; odpowiedz: OdpowiedzKatalogu } | { rodzaj: 'odrzucona' } | { rodzaj: 'niedostepna' };

async function wyslijZmiane(zmiana: ZmianaKatalogu): Promise<WynikWysylki> {
  let odpowiedz: Response;
  try {
    odpowiedz = await fetch(ADRES_USLUGI, {
      method: 'POST',
      headers: naglowkiZapisu(zmiana),
      body: JSON.stringify({ zmiana }),
      cache: 'no-store',
    });
  } catch {
    return { rodzaj: 'niedostepna' };
  }
  if (odpowiedz.status === 400 || odpowiedz.status === 401 || odpowiedz.status === 403 || odpowiedz.status === 413) {
    return { rodzaj: 'odrzucona' };
  }
  if (!odpowiedz.ok) return { rodzaj: 'niedostepna' };
  try {
    const dane = (await odpowiedz.json()) as Partial<OdpowiedzKatalogu>;
    if (!czyEdycjeKatalogu(dane.edycje)) return { rodzaj: 'niedostepna' };
    return { rodzaj: 'przyjeta', odpowiedz: { edycje: dane.edycje, trwaly: dane.trwaly !== false } };
  } catch {
    return { rodzaj: 'niedostepna' };
  }
}

async function wyslijKolejke(): Promise<void> {
  for (;;) {
    const pierwsza = kolejka()[0];
    if (pierwsza === undefined) return;
    const wynik = await wyslijZmiane(pierwsza);
    if (wynik.rodzaj === 'niedostepna') {
      ustawStan({ stan: 'lokalny' });
      return;
    }
    if (wynik.rodzaj === 'odrzucona') {
      zdejmijPierwszaZmiane();
      ustawStan({ stan: 'odrzucona' });
      continue;
    }
    przyjmijEdycjeSerwera(wynik.odpowiedz.edycje, 1);
    ostatniePobranie = Date.now();
    ustawStan({ stan: 'wspolny', trwaly: wynik.odpowiedz.trwaly });
  }
}

/** Chwila ostatniego pobrania albo przyjętego zapisu; null do pierwszego pobrania w tej karcie. */
let ostatniePobranie: number | null = null;
let pobieranieWToku: Promise<void> | null = null;

let wysylkaWToku: Promise<void> | null = null;
let wyslijPonownie = false;

/** Uruchamia wysyłkę kolejki zmian katalogu poza bieżącą transakcją magazynu. */
export function zaplanujWysylkeKatalogu(): void {
  if (!czyPrzegladarka()) return;
  if (wysylkaWToku !== null) {
    wyslijPonownie = true;
    return;
  }
  wysylkaWToku = (async () => {
    await Promise.resolve();
    do {
      wyslijPonownie = false;
      await wyslijKolejke();
    } while (wyslijPonownie);
  })().finally(() => {
    wysylkaWToku = null;
  });
}

/**
 * Powód pobrania katalogu: `start` przy otwarciu aplikacji (raz w karcie), `okresowe` i `panel` najwyżej co
 * ODSTEP_POBIERANIA_MS, `powrot` po powrocie do karty, `siec` po odzyskaniu sieci bez odstępu.
 */
export type PowodPobraniaKatalogu = 'start' | 'okresowe' | 'panel' | 'powrot' | 'siec';

/** Mówi, czy pobrać katalog z danego powodu, gdy ostatnie pobranie było w chwili `ostatnie` (null: jeszcze nie było). */
export function czyPobracKatalog(powod: PowodPobraniaKatalogu, ostatnie: number | null, teraz: number): boolean {
  if (ostatnie === null) return true;
  if (powod === 'start') return false;
  if (powod === 'siec') return true;
  return teraz - ostatnie >= (powod === 'powrot' ? ODSTEP_PO_POWROCIE_MS : ODSTEP_POBIERANIA_MS);
}

/**
 * Pobiera edycje wspólnego katalogu z usługi, gdy pozwala na to `czyPobracKatalog`. Pusta kolejka: edycje z usługi
 * zastępują kopię lokalną. Niepusta kolejka: przeglądarka najpierw wysyła zmiany. Bez usługi kopia lokalna zostaje
 * bez zmian.
 */
export function pobierzKatalogZSerwera(powod: PowodPobraniaKatalogu = 'okresowe', teraz: number = Date.now()): Promise<void> {
  if (!czyPrzegladarka()) return Promise.resolve();
  if (pobieranieWToku !== null) return pobieranieWToku;
  if (!czyPobracKatalog(powod, ostatniePobranie, teraz)) return Promise.resolve();
  ostatniePobranie = teraz;
  pobieranieWToku = pobierz().finally(() => {
    pobieranieWToku = null;
  });
  return pobieranieWToku;
}

async function pobierz(): Promise<void> {
  if (kolejka().length > 0) {
    zaplanujWysylkeKatalogu();
    return;
  }
  let dane: Partial<OdpowiedzKatalogu>;
  try {
    const odpowiedz = await fetch(ADRES_USLUGI, { cache: 'no-store' });
    if (!odpowiedz.ok) {
      ustawStan({ stan: 'lokalny' });
      return;
    }
    dane = (await odpowiedz.json()) as Partial<OdpowiedzKatalogu>;
  } catch {
    ustawStan({ stan: 'lokalny' });
    return;
  }
  if (!czyEdycjeKatalogu(dane.edycje)) {
    ustawStan({ stan: 'lokalny' });
    return;
  }
  if (kolejka().length > 0) {
    zaplanujWysylkeKatalogu();
    return;
  }
  przyjmijEdycjeSerwera(dane.edycje, 0);
  ustawStan({ stan: 'wspolny', trwaly: dane.trwaly !== false });
}
