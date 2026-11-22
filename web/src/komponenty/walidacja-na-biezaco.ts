// Walidacja pól formularza na bieżąco (kontrakt, sekcja 1.4).
//
// Reguły pokazywania błędu pola:
// - przed próbą wysłania błąd pola pokazuje się po opuszczeniu pola (onOpuszczenie), gdy pole jest wymagane
//   albo ma niepustą lub zmienioną wartość; grupy wyboru zgłaszają opuszczenie po wyjściu fokusu z grupy
//   i po każdym wyborze;
// - błąd znika od razu, gdy zmiana wartości usuwa błąd, a nowy błąd tego pola czeka na kolejne opuszczenie;
// - po próbie wysłania (sprobujWyslac) pola objęte próbą walidują się przy każdej zmianie.
// Błędy liczy funkcja `waliduj` przy każdym renderowaniu, więc zmiana pola nie wymaga osobnego wywołania hooka.
import { useEffect, useRef, useState } from 'react';
import type { KodKomunikatu } from '@/domena/typy/komunikaty';

/** Wynik funkcji walidacji: kod błędu pola albo brak błędu (null, undefined, brak klucza). */
export type WynikWalidacji<P extends string, B extends string = KodKomunikatu> = {
  readonly [K in P]?: B | null;
};

/** Błędy pól do wyświetlenia (zgodne z `BledyPol<P>` dla kodów komunikatów). */
export type BledyNaBiezaco<P extends string, B extends string = KodKomunikatu> = Partial<Record<P, B>>;

export interface OpcjeWalidacjiNaBiezaco<P extends string, W, B extends string = KodKomunikatu> {
  /** Bieżące wartości formularza ze stanu widoku. */
  wartosci: W;
  /** Czysta funkcja walidacji całego formularza, np. `walidujDrugiegoRodzica`. */
  waliduj: (wartosci: W) => WynikWalidacji<P, B>;
  /**
   * Pola w kolejności na ekranie i cel fokusu każdego pola: identyfikator pola (`id` przekazane do PoleTekstowe,
   * PoleWyboru, PoleZaznaczenia), identyfikator `fieldset` grupy (`id` GrupaOpcji, GrupaZaznaczen) albo nazwa
   * grupy radio (`nazwa` GrupaOpcji). Pole spoza mapy ma cel fokusu równy nazwie pola i kolejność z `waliduj`.
   */
  pola?: { readonly [K in NoInfer<P>]?: string };
  /**
   * Pola wymagane. Bez listy każde pole liczy się jako wymagane, więc błąd pokazuje się po każdym opuszczeniu.
   * Z listą pole spoza listy pokazuje błąd po opuszczeniu tylko z niepustą albo zmienioną wartością.
   */
  wymagane?: readonly NoInfer<P>[];
  /** Wartość pola do oceny „pusta” i „zmieniona”; domyślnie `wartosci[pole]`, gdy formularz ma taki klucz. */
  wartoscPola?: (wartosci: W, pole: P) => unknown;
}

export interface WalidacjaNaBiezaco<P extends string, B extends string = KodKomunikatu> {
  /** Błędy do wyświetlenia według reguł pokazywania. */
  bledy: BledyNaBiezaco<P, B>;
  /** Wszystkie bieżące błędy z `waliduj`, także jeszcze niepokazane. */
  bledyAktualne: BledyNaBiezaco<P, B>;
  /** Błąd pola do wyświetlenia albo null. */
  blad: (pole: P) => B | null;
  /** Propsy pola: `<PoleTekstowe {...walidacja.pole('imie')} … />`, także dla GrupaOpcji i PoleZaznaczenia. */
  pole: (pole: P) => { blad: B | null; onOpuszczenie: () => void };
  /** Opuszczenie pola (blur), opuszczenie grupy wyboru albo wybór opcji. */
  onOpuszczenie: (pole: P) => void;
  /**
   * Próba wysłania: oznacza pola (domyślnie wszystkie, albo podane, np. pola bieżącej części) jako walidowane
   * na bieżąco, przenosi fokus na pierwsze pole z błędem i zwraca true, gdy pola nie mają błędów.
   */
  sprobujWyslac: (pola?: readonly P[]) => boolean;
  /** Poprawność pól (domyślnie wszystkich) bez zmiany stanu i fokusu. */
  czyPoprawne: (pola?: readonly P[]) => boolean;
  /** Pierwsze w kolejności pole z bieżącym błędem (domyślnie spośród wszystkich) albo null. */
  pierwszePoleZBledem: (pola?: readonly P[]) => P | null;
  /** Błędy zwrócone przez operację magazynu (np. `wynik.bledyPol`): pokazuje je do zmiany pola i ustawia fokus. */
  pokazBledy: (bledy: BledyNaBiezaco<P, B>) => void;
  /** Przywraca stan początkowy: żadne pole nie pokazuje błędu. */
  resetuj: () => void;
}

type Flagi<P extends string> = Partial<Record<P, true>>;

interface StanWalidacji<P extends string, W, B extends string> {
  /** Pola opuszczone z błędem (do zdjęcia flagi po poprawieniu). */
  ocenione: Flagi<P>;
  /** Pola objęte próbą wysłania części formularza. */
  zywe: Flagi<P>;
  /** Próba wysłania całego formularza. */
  wszystkieZywe: boolean;
  /** Błędy z operacji z wartościami formularza z chwili ich otrzymania. */
  zewnetrzne: { bledy: BledyNaBiezaco<P, B>; wartosci: W } | null;
}

function stanPoczatkowy<P extends string, W, B extends string>(): StanWalidacji<P, W, B> {
  return { ocenione: {}, zywe: {}, wszystkieZywe: false, zewnetrzne: null };
}

function klucze<P extends string>(obiekt: Partial<Record<P, unknown>>): P[] {
  return Object.keys(obiekt) as P[];
}

function oczysc<P extends string, B extends string>(wynik: WynikWalidacji<P, B>): BledyNaBiezaco<P, B> {
  const bledy: BledyNaBiezaco<P, B> = {};
  for (const pole of klucze<P>(wynik)) {
    const blad = wynik[pole];
    if (blad) bledy[pole] = blad;
  }
  return bledy;
}

function czyPusta(wartosc: unknown): boolean {
  if (wartosc === undefined || wartosc === null || wartosc === false) return true;
  if (typeof wartosc === 'string') return wartosc.trim() === '';
  if (Array.isArray(wartosc)) return wartosc.length === 0;
  return false;
}

function takieSame(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

function wartoscZKlucza(wartosci: unknown, pole: string): { znana: boolean; wartosc: unknown } {
  if (wartosci !== null && typeof wartosci === 'object' && Object.prototype.hasOwnProperty.call(wartosci, pole)) {
    return { znana: true, wartosc: (wartosci as Record<string, unknown>)[pole] };
  }
  return { znana: false, wartosc: undefined };
}

const SELEKTOR_FOKUSU =
  'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function pierwszyDoFokusu(elementy: Iterable<Element>): HTMLElement | null {
  let pierwszy: HTMLElement | null = null;
  for (const el of elementy) {
    if (!(el instanceof HTMLElement) || !el.matches(SELEKTOR_FOKUSU)) continue;
    // W grupie radio fokus trafia na zaznaczoną opcję, czyli na przystanek tabulatora grupy.
    if (el instanceof HTMLInputElement && el.checked) return el;
    pierwszy ??= el;
  }
  return pierwszy;
}

/** Element do fokusu dla celu: pole o identyfikatorze, pierwsze pole w kontenerze albo grupa radio o nazwie. */
export function znajdzPoleDoFokusu(cel: string): HTMLElement | null {
  const el = document.getElementById(cel);
  if (el) {
    if (el.matches(SELEKTOR_FOKUSU)) return el;
    return pierwszyDoFokusu(el.querySelectorAll(SELEKTOR_FOKUSU));
  }
  return pierwszyDoFokusu(document.getElementsByName(cel));
}

function ustawFokus(el: HTMLElement) {
  el.focus({ preventScroll: true });
  el.scrollIntoView({ block: 'center' });
}

export function useWalidacjaNaBiezaco<P extends string, W, B extends string = KodKomunikatu>({
  wartosci,
  waliduj,
  pola,
  wymagane,
  wartoscPola,
}: OpcjeWalidacjiNaBiezaco<P, W, B>): WalidacjaNaBiezaco<P, B> {
  const [stan, setStan] = useState<StanWalidacji<P, W, B>>(stanPoczatkowy);
  const [poczatkowe] = useState(wartosci);
  // Cel fokusu pola, którego nie ma jeszcze na ekranie (np. pole innej części formularza).
  const oczekujacyFokus = useRef<string | null>(null);

  const aktualne = oczysc(waliduj(wartosci));
  const kolejnosc = [...new Set([...klucze<P>(pola ?? {}), ...klucze<P>(aktualne)])];
  const listaWymaganych = wymagane ? new Set<P>(wymagane) : null;

  function wartoscDoOceny(w: W, pole: P) {
    return wartoscPola ? { znana: true, wartosc: wartoscPola(w, pole) } : wartoscZKlucza(w, pole);
  }

  function pokazujePoOpuszczeniu(pole: P): boolean {
    if (listaWymaganych === null || listaWymaganych.has(pole)) return true;
    const biezaca = wartoscDoOceny(wartosci, pole);
    if (!biezaca.znana) return true;
    return !czyPusta(biezaca.wartosc) || !takieSame(biezaca.wartosc, wartoscDoOceny(poczatkowe, pole).wartosc);
  }

  // Pole opuszczone bez błędu albo poprawione w trakcie edycji przestaje pokazywać błąd do kolejnego opuszczenia.
  const doZdjecia = klucze(stan.ocenione).filter((pole) => !aktualne[pole] || !pokazujePoOpuszczeniu(pole));
  if (doZdjecia.length > 0) {
    setStan((s) => {
      const ocenione = { ...s.ocenione };
      for (const pole of doZdjecia) delete ocenione[pole];
      return { ...s, ocenione };
    });
  }
  const zdjete = new Set(doZdjecia);

  function zewnetrznyBlad(pole: P): B | undefined {
    const zew = stan.zewnetrzne;
    const blad = zew?.bledy[pole];
    if (!zew || !blad) return undefined;
    const teraz = wartoscDoOceny(wartosci, pole);
    if (!teraz.znana) return zew.wartosci === wartosci ? blad : undefined;
    return takieSame(teraz.wartosc, wartoscDoOceny(zew.wartosci, pole).wartosc) ? blad : undefined;
  }

  const bledy: BledyNaBiezaco<P, B> = {};
  for (const pole of [...kolejnosc, ...klucze(stan.zewnetrzne?.bledy ?? {})]) {
    if (bledy[pole]) continue;
    const pokazac = stan.wszystkieZywe || stan.zywe[pole] || (stan.ocenione[pole] && !zdjete.has(pole));
    const blad = (pokazac ? aktualne[pole] : undefined) ?? zewnetrznyBlad(pole);
    if (blad) bledy[pole] = blad;
  }

  useEffect(() => {
    const cel = oczekujacyFokus.current;
    if (cel === null) return;
    const el = znajdzPoleDoFokusu(cel);
    if (el === null) return;
    oczekujacyFokus.current = null;
    ustawFokus(el);
  });

  function przeniesFokus(pole: P) {
    const cel = pola?.[pole] ?? pole;
    const el = znajdzPoleDoFokusu(cel);
    if (el) {
      oczekujacyFokus.current = null;
      ustawFokus(el);
    } else {
      oczekujacyFokus.current = cel;
    }
  }

  function pierwszePoleZBledem(zakres?: readonly P[]): P | null {
    const dozwolone = zakres ? new Set(zakres) : null;
    return kolejnosc.find((pole) => aktualne[pole] && (dozwolone === null || dozwolone.has(pole))) ?? null;
  }

  function onOpuszczenie(pole: P) {
    if (stan.wszystkieZywe || stan.zywe[pole] || stan.ocenione[pole]) return;
    // Ocena flagi następuje przy renderowaniu z bieżącymi wartościami, więc działa także zaraz po wyborze opcji.
    setStan((s) => (s.ocenione[pole] ? s : { ...s, ocenione: { ...s.ocenione, [pole]: true } }));
  }

  function sprobujWyslac(zakres?: readonly P[]): boolean {
    setStan((s) => {
      if (!zakres) return { ...s, wszystkieZywe: true, zewnetrzne: null };
      const zywe = { ...s.zywe };
      for (const pole of zakres) zywe[pole] = true;
      return { ...s, zywe, zewnetrzne: null };
    });
    const pierwsze = pierwszePoleZBledem(zakres);
    if (pierwsze === null) return true;
    przeniesFokus(pierwsze);
    return false;
  }

  function pokazBledy(nowe: BledyNaBiezaco<P, B>) {
    const oczyszczone = oczysc<P, B>(nowe);
    setStan((s) => ({ ...s, zewnetrzne: { bledy: oczyszczone, wartosci } }));
    const pierwsze =
      kolejnosc.find((pole) => oczyszczone[pole]) ?? klucze(oczyszczone).find((pole) => oczyszczone[pole]);
    if (pierwsze) przeniesFokus(pierwsze);
  }

  function blad(pole: P): B | null {
    return bledy[pole] ?? null;
  }

  return {
    bledy,
    bledyAktualne: aktualne,
    blad,
    pole: (pole) => ({ blad: blad(pole), onOpuszczenie: () => onOpuszczenie(pole) }),
    onOpuszczenie,
    sprobujWyslac,
    czyPoprawne: (zakres) => pierwszePoleZBledem(zakres) === null,
    pierwszePoleZBledem,
    pokazBledy,
    resetuj: () => {
      oczekujacyFokus.current = null;
      setStan(stanPoczatkowy<P, W, B>());
    },
  };
}
