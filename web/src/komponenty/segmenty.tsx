'use client';

import { Ikona, type NazwaIkony } from '@/komponenty/ikona';

export interface SegmentyProps<W extends string> {
  etykieta: string;
  opcje: { wartosc: W; etykieta: string; ikona?: NazwaIkony }[];
  wybrana: W;
  onWybor: (w: W) => void;
  steruje?: string;
  id?: string;
  className?: string;
}

const klasySegmentu = {
  wybrany:
    'inline-flex min-h-segment cursor-pointer items-center gap-2 rounded-sm border-0 bg-surface-card px-6 font-sans text-body-strong text-ink transition-colors duration-150 active:translate-y-px motion-reduce:transition-none',
  zwykly:
    'inline-flex min-h-segment cursor-pointer items-center gap-2 rounded-sm border-0 bg-brand-tint px-6 font-sans text-body-strong text-brand transition-[color,background-color,box-shadow] duration-150 hover:text-brand-deep hover:shadow-[inset_0_0_0_1px_var(--color-brand)] active:translate-y-px motion-reduce:transition-none',
} as const;

// Segmenty ez-seg: grupa przycisków przełączających, wybrany ma aria-pressed="true".
export function Segmenty<W extends string>({
  etykieta,
  opcje,
  wybrana,
  onWybor,
  steruje,
  id,
  className,
}: SegmentyProps<W>) {
  return (
    <div
      id={id}
      role="group"
      aria-label={etykieta}
      className={['flex min-w-0 flex-wrap gap-2.5', className].filter(Boolean).join(' ')}
    >
      {opcje.map((opcja) => {
        const wybrany = opcja.wartosc === wybrana;
        return (
          <button
            key={opcja.wartosc}
            type="button"
            aria-pressed={wybrany}
            aria-controls={steruje}
            onClick={() => onWybor(opcja.wartosc)}
            className={klasySegmentu[wybrany ? 'wybrany' : 'zwykly']}
          >
            {opcja.ikona ? <Ikona nazwa={opcja.ikona} rozmiar={20} /> : null}
            {opcja.etykieta}
          </button>
        );
      })}
    </div>
  );
}
