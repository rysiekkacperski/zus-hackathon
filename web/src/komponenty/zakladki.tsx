'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Ikona } from '@/komponenty/ikona';
import { teksty } from '@/teksty';

/**
 * Wybrana zakładka zapamiętana w parametrze adresu (domyślnie `?zakladka=<wartość>`) przez `history.replaceState`,
 * bez nawigacji trasy. Parametr spoza `dostepne` daje pierwszą dostępną zakładkę. Po powrocie na trasę ukrytą
 * w Activity (cacheComponents) wybór zostaje w stanie i wraca do adresu, a parametr adresu z historii przeglądarki
 * (Wstecz) ma pierwszeństwo przed stanem. Widok musi leżeć w `<Suspense>`, bo hook używa `useSearchParams`.
 */
export function useZakladkaWAdresie<W extends string>(
  dostepne: readonly W[],
  parametr = 'zakladka',
): [W, (w: W) => void] {
  const parametry = useSearchParams();
  const zAdresu = parametry.get(parametr);
  const znana = (w: string | null): w is W => w !== null && (dostepne as readonly string[]).includes(w);
  const [wybrana, setWybrana] = useState<string | null>(zAdresu);
  const [poprzedniZAdresu, setPoprzedniZAdresu] = useState(zAdresu);
  if (zAdresu !== poprzedniZAdresu) {
    setPoprzedniZAdresu(zAdresu);
    if (znana(zAdresu)) setWybrana(zAdresu);
  }
  const pierwsza = dostepne[0];
  const biezaca = znana(wybrana) ? wybrana : pierwsza;

  const zapiszWAdresie = useCallback(
    (w: W) => {
      const adres = new URL(window.location.href);
      if (adres.searchParams.get(parametr) === w) return;
      adres.searchParams.set(parametr, w);
      window.history.replaceState(null, '', `${adres.pathname}${adres.search}${adres.hash}`);
    },
    [parametr],
  );

  // Powrót na trasę bez parametru (np. Dalej z kroku kreatora): wybór ze stanu wraca do adresu.
  useEffect(() => {
    if (zAdresu === null && biezaca !== pierwsza) zapiszWAdresie(biezaca);
  }, [zAdresu, biezaca, pierwsza, zapiszWAdresie]);

  const wybierz = useCallback(
    (w: W) => {
      setWybrana(w);
      zapiszWAdresie(w);
    },
    [zapiszWAdresie],
  );

  return [biezaca, wybierz];
}

export interface ZakladkaProps<W extends string> {
  wartosc: W;
  etykieta: string;
  /** Wskaźnik błędu: ikona błędu przed etykietą i tekst „zawiera błąd” dla czytnika ekranu. */
  blad?: boolean;
}

export interface ZakladkiProps<W extends string> {
  etykieta: string;
  zakladki: ZakladkaProps<W>[];
  wybrana: W;
  onWybor: (w: W) => void;
  tloPaneli?: 'page' | 'card';
  children: ReactNode;
  id?: string;
  className?: string;
}

const klasyZakladki = {
  page: {
    wybrana: 'min-w-40 border-brand border-b-surface-page bg-surface-page text-ink',
    panel: 'bg-surface-page',
  },
  card: {
    wybrana: 'min-w-40 border-brand border-b-surface-card bg-surface-card text-ink',
    panel: 'bg-surface-card',
  },
} as const;

// Wskazuje indeks zakładki docelowej dla klawiszy strzałek, Home i End.
export function indeksPoKlawiszu(klawisz: string, biezacy: number, liczba: number): number | null {
  switch (klawisz) {
    case 'ArrowRight':
      return (biezacy + 1) % liczba;
    case 'ArrowLeft':
      return (biezacy - 1 + liczba) % liczba;
    case 'Home':
      return 0;
    case 'End':
      return liczba - 1;
    default:
      return null;
  }
}

export function Zakladki<W extends string>({
  etykieta,
  zakladki,
  wybrana,
  onWybor,
  tloPaneli = 'page',
  children,
  id,
  className,
}: ZakladkiProps<W>) {
  const auto = useId();
  const baza = id ?? auto;
  const przyciski = useRef<(HTMLButtonElement | null)[]>([]);
  const indeksWybranej = Math.max(
    0,
    zakladki.findIndex((z) => z.wartosc === wybrana),
  );
  const idZakladki = (i: number) => `${baza}-zakladka-${i}`;
  const idPanelu = `${baza}-panel`;
  const klasy = klasyZakladki[tloPaneli];

  function obsluzKlawisz(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    // Skróty z modyfikatorem, np. Alt+strzałka w lewo (Wstecz przeglądarki), zostają dla przeglądarki.
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const cel = indeksPoKlawiszu(e.key, i, zakladki.length);
    if (cel === null) return;
    e.preventDefault();
    onWybor(zakladki[cel].wartosc);
    przyciski.current[cel]?.focus();
  }

  return (
    <div id={id} className={['min-w-0', className].filter(Boolean).join(' ')}>
      <div role="tablist" aria-label={etykieta} className="flex flex-wrap border-b border-brand">
        {zakladki.map((z, i) => {
          const czyWybrana = i === indeksWybranej;
          return (
            <button
              key={z.wartosc}
              ref={(el) => {
                przyciski.current[i] = el;
              }}
              type="button"
              role="tab"
              id={idZakladki(i)}
              aria-selected={czyWybrana}
              aria-controls={idPanelu}
              tabIndex={czyWybrana ? 0 : -1}
              onClick={() => onWybor(z.wartosc)}
              onKeyDown={(e) => obsluzKlawisz(e, i)}
              className={[
                '-mb-px inline-flex h-control cursor-pointer items-center justify-center rounded-t-xs border px-6 text-body font-semibold transition-colors duration-150 motion-reduce:transition-none',
                czyWybrana
                  ? klasy.wybrana
                  : 'border-transparent bg-transparent text-brand hover:text-brand-deep hover:underline',
              ].join(' ')}
            >
              {z.blad ? <Ikona nazwa="blad" rozmiar={20} className="mr-2" /> : null}
              {z.etykieta}
              {z.blad ? <span className="sr-only"> {teksty.wspolne.zlozone.zakladkaZBledem}</span> : null}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={idPanelu}
        aria-labelledby={idZakladki(indeksWybranej)}
        tabIndex={0}
        className={['min-w-0 pt-6', klasy.panel].join(' ')}
      >
        {children}
      </div>
    </div>
  );
}
