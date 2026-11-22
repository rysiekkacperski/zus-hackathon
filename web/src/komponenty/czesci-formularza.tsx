'use client';

// Podział kroku formularza na części, tak aby jedna część mieściła się w oknie bez przewijania.
//
// Bieżąca część żyje w parametrze adresu (domyślnie ?czesc=N). Przejście do następnej części dodaje wpis
// historii przez window.history.pushState, więc przycisk Wstecz przeglądarki wraca do poprzedniej części;
// Next.js synchronizuje pushState z useSearchParams bez żądania do serwera. Po zmianie części strona
// przewija się na górę, a fokus trafia na nagłówek części albo na h1 strony. Nieprawidłowy parametr daje część 1.
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import { Przycisk } from '@/komponenty/przycisk';
import type { WalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';

const KLUCZ_STANU_HISTORII = 'czesciFormularza';

interface WpisHistoriiCzesci {
  sciezka: string;
  parametr: string;
  zCzesci: number;
}

export interface OpcjeCzesciFormularza<P extends string = string> {
  /** Liczba części kroku (co najmniej 1). */
  liczba: number;
  /** Nazwa parametru adresu, domyślnie `czesc`. */
  parametr?: string;
  /** Identyfikator nagłówka części do fokusu po zmianie części; domyślnie h1 strony. */
  idNaglowka?: string | ((czesc: number) => string | undefined);
  /**
   * Pola każdej części (indeks 0 to część 1). Razem z `walidacja` metoda `dalej` sprawdza pola bieżącej części,
   * a na ostatniej części cały formularz, i przy błędzie w innej części przechodzi do tej części.
   */
  podzial?: readonly (readonly NoInfer<P>[])[];
  walidacja?: Pick<WalidacjaNaBiezaco<P, string>, 'sprobujWyslac' | 'pierwszePoleZBledem'>;
}

export interface CzesciFormularza {
  /** Bieżąca część, od 1 do `liczba`. */
  czesc: number;
  liczba: number;
  czyPierwsza: boolean;
  czyOstatnia: boolean;
  nastepna: () => void;
  poprzednia: () => void;
  /** Przejście do części; `bezFokusu` zostawia fokus walidacji (pole z błędem) bez przewinięcia na górę. */
  przejdzDo: (czesc: number, opcje?: { bezFokusu?: boolean }) => void;
  /** „Przejdź dalej”: na części 1..n−1 waliduje pola części i przechodzi dalej, na ostatniej wywołuje akcję kroku. */
  dalej: (akcjaKroku: () => void) => void;
  /** „Wróć”: na części > 1 wraca do poprzedniej części, na części 1 wywołuje akcję powrotu kroku. */
  wroc: (akcjaPowrotu?: () => void) => void;
}

function odczytajCzesc(surowy: string | null, liczba: number): number {
  if (surowy === null || !/^\d+$/.test(surowy)) return 1;
  const n = Number(surowy);
  return n >= 1 && n <= liczba ? n : 1;
}

/** Adres z parametrem części, np. powrót z następnego kroku na ostatnią część poprzedniego: `adresCzesci(trasa, 2)`. */
export function adresCzesci(adres: string, czesc: number, parametr = 'czesc'): string {
  const url = new URL(adres, 'http://adres.lokalny');
  if (czesc <= 1) url.searchParams.delete(parametr);
  else url.searchParams.set(parametr, String(czesc));
  const zapytanie = url.searchParams.toString();
  return `${url.pathname}${zapytanie ? `?${zapytanie}` : ''}${url.hash}`;
}

function wpisHistorii(stan: unknown): WpisHistoriiCzesci | null {
  if (stan === null || typeof stan !== 'object') return null;
  const wpis = (stan as Record<string, unknown>)[KLUCZ_STANU_HISTORII];
  if (wpis === null || typeof wpis !== 'object') return null;
  return wpis as WpisHistoriiCzesci;
}

function fokusNaNaglowku(idNaglowka: string | undefined) {
  const naglowek =
    (idNaglowka ? document.getElementById(idNaglowka) : null) ??
    document.querySelector<HTMLElement>('#tresc h1') ??
    document.querySelector<HTMLElement>('h1');
  if (!naglowek) return;
  if (!naglowek.hasAttribute('tabindex')) naglowek.setAttribute('tabindex', '-1');
  naglowek.focus({ preventScroll: true });
}

export function useCzesciFormularza<P extends string = string>({
  liczba,
  parametr = 'czesc',
  idNaglowka,
  podzial,
  walidacja,
}: OpcjeCzesciFormularza<P>): CzesciFormularza {
  const parametry = useSearchParams();
  const czesc = odczytajCzesc(parametry.get(parametr), liczba);
  const poprzedniaWidoczna = useRef(czesc);
  const fokusPoZmianie = useRef(true);

  useEffect(() => {
    if (poprzedniaWidoczna.current === czesc) return;
    poprzedniaWidoczna.current = czesc;
    const zFokusem = fokusPoZmianie.current;
    fokusPoZmianie.current = true;
    if (!zFokusem) return;
    window.scrollTo({ top: 0 });
    fokusNaNaglowku(typeof idNaglowka === 'function' ? idNaglowka(czesc) : idNaglowka);
  }, [czesc, idNaglowka]);

  function przejdzDo(docelowa: number, opcje?: { bezFokusu?: boolean }) {
    const n = Math.min(Math.max(1, Math.trunc(docelowa)), liczba);
    if (n === czesc) return;
    fokusPoZmianie.current = !opcje?.bezFokusu;
    const sciezka = window.location.pathname;
    const wpis = wpisHistorii(window.history.state);
    // Wpis bieżącej części powstał przez przejście dalej z części n, więc powrót cofa historię zamiast ją wydłużać.
    if (n === czesc - 1 && wpis?.sciezka === sciezka && wpis.parametr === parametr && wpis.zCzesci === n) {
      window.history.back();
      return;
    }
    const nowyWpis: WpisHistoriiCzesci = { sciezka, parametr, zCzesci: czesc };
    window.history.pushState(
      { [KLUCZ_STANU_HISTORII]: nowyWpis },
      '',
      adresCzesci(`${sciezka}${window.location.search}${window.location.hash}`, n, parametr),
    );
  }

  function czescPola(pole: P): number | null {
    if (!podzial) return null;
    const indeks = podzial.findIndex((pola) => pola.includes(pole));
    return indeks < 0 ? null : indeks + 1;
  }

  function dalej(akcjaKroku: () => void) {
    if (czesc < liczba) {
      const pola = podzial?.[czesc - 1];
      if (walidacja && pola && !walidacja.sprobujWyslac(pola)) return;
      przejdzDo(czesc + 1);
      return;
    }
    if (walidacja && podzial && !walidacja.sprobujWyslac()) {
      const pole = walidacja.pierwszePoleZBledem();
      const docelowa = pole === null ? null : czescPola(pole);
      if (docelowa !== null && docelowa !== czesc) przejdzDo(docelowa, { bezFokusu: true });
      return;
    }
    akcjaKroku();
  }

  return {
    czesc,
    liczba,
    czyPierwsza: czesc === 1,
    czyOstatnia: czesc === liczba,
    nastepna: () => przejdzDo(czesc + 1),
    poprzednia: () => przejdzDo(czesc - 1),
    przejdzDo,
    dalej,
    wroc: (akcjaPowrotu) => {
      if (czesc > 1) przejdzDo(czesc - 1);
      else akcjaPowrotu?.();
    },
  };
}

export interface CzescFormularzaProps {
  czesci: Pick<CzesciFormularza, 'czesc'>;
  /** Numer części, od 1. */
  numer: number;
  children: ReactNode;
}

/** Treść jednej części: renderuje się tylko, gdy jest bieżącą częścią. */
export function CzescFormularza({ czesci, numer, children }: CzescFormularzaProps) {
  return czesci.czesc === numer ? <>{children}</> : null;
}

export interface PrzyciskiCzesciProps {
  czesci: CzesciFormularza;
  /** Akcja kroku na ostatniej części (zapis, wysłanie, przejście do następnego kroku). */
  onAkcjaKroku: () => void;
  /** Etykieta przycisku na ostatniej części; domyślnie „Przejdź dalej”. */
  etykietaAkcji?: string;
  /** Powrót z części 1; bez propsa część 1 nie ma przycisku „Wróć”. */
  onWrocKroku?: () => void;
  /** Blokada przycisków w trakcie zapisu. */
  zajety?: boolean;
  /** Przyciski dodatkowe między „Wróć” a przyciskiem głównym, np. „Zapisz i dokończ później”. */
  dodatkowe?: ReactNode;
  className?: string;
}

/** Wiersz przycisków formularza z częściami: „Wróć” po lewej, przycisk główny po prawej. */
export function PrzyciskiCzesci({
  czesci,
  onAkcjaKroku,
  etykietaAkcji,
  onWrocKroku,
  zajety,
  dodatkowe,
  className,
}: PrzyciskiCzesciProps) {
  const pokazWroc = !czesci.czyPierwsza || onWrocKroku !== undefined;
  return (
    <div className={['flex min-w-0 flex-wrap items-center justify-end gap-4', className].filter(Boolean).join(' ')}>
      {pokazWroc ? (
        <Przycisk wariant="drugorzedny" onClick={() => czesci.wroc(onWrocKroku)} disabled={zajety} className="mr-auto">
          {teksty.wspolne.przyciski.wroc}
        </Przycisk>
      ) : null}
      {dodatkowe}
      <Przycisk
        wariant="glowny"
        // Wciśnięcie myszy nie zabiera fokusu polu, więc błąd pola z opuszczenia nie przesuwa przycisku przed
        // kliknięciem; kliknięcie zawsze waliduje część i przenosi fokus na pierwsze pole z błędem.
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => czesci.dalej(onAkcjaKroku)}
        zajety={czesci.czyOstatnia && zajety}
      >
        {czesci.czyOstatnia ? (etykietaAkcji ?? teksty.wspolne.przyciski.dalej) : teksty.wspolne.przyciski.dalej}
      </Przycisk>
    </div>
  );
}
