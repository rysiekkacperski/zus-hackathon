'use client';

import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';

export interface ZakladkiProps<W extends string> {
  etykieta: string;
  zakladki: { wartosc: W; etykieta: string }[];
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
              {z.etykieta}
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
