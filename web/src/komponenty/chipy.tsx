'use client';

import { useRef, type KeyboardEvent } from 'react';
import { indeksPoKlawiszu } from '@/komponenty/zakladki';

export interface ChipyProps<W extends string> {
  etykieta: string;
  opcje: { wartosc: W; etykieta: string }[];
  wybrana: W;
  onWybor: (w: W) => void;
  steruje?: string;
  id?: string;
  className?: string;
}

export function Chipy<W extends string>({
  etykieta,
  opcje,
  wybrana,
  onWybor,
  steruje,
  id,
  className,
}: ChipyProps<W>) {
  const przyciski = useRef<(HTMLButtonElement | null)[]>([]);
  const indeksWybranej = Math.max(
    0,
    opcje.findIndex((o) => o.wartosc === wybrana),
  );

  function obsluzKlawisz(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const cel = indeksPoKlawiszu(e.key, i, opcje.length);
    if (cel === null) return;
    e.preventDefault();
    onWybor(opcje[cel].wartosc);
    przyciski.current[cel]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={etykieta}
      id={id}
      className={['flex flex-wrap items-center gap-3', className].filter(Boolean).join(' ')}
    >
      {opcje.map((o, i) => {
        const czyWybrana = i === indeksWybranej;
        return (
          <button
            key={o.wartosc}
            ref={(el) => {
              przyciski.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={czyWybrana}
            aria-controls={steruje}
            tabIndex={czyWybrana ? 0 : -1}
            onClick={() => onWybor(o.wartosc)}
            onKeyDown={(e) => obsluzKlawisz(e, i)}
            className={[
              'inline-flex h-control cursor-pointer items-center rounded-sm border-0 px-6 text-body font-semibold transition-colors duration-150 motion-reduce:transition-none',
              czyWybrana
                ? 'bg-surface-card text-ink'
                : 'bg-brand-wash text-brand hover:bg-brand-tint hover:text-brand-deep',
            ].join(' ')}
          >
            {o.etykieta}
          </button>
        );
      })}
    </div>
  );
}
