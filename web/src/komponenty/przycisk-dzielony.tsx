'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type React from 'react';
import { Ikona } from '@/komponenty/ikona';

export interface PrzyciskDzielonyProps {
  glowny: { etykieta: string; onClick: () => void };
  opcje: { etykieta: string; onClick: () => void }[];
  etykietaWiecej: string;
  id?: string;
  className?: string;
}

// ez-split: część główna i część „więcej” rozdzielone linią w kolorze brand-chart.
const klasyCzesci =
  'flex cursor-pointer items-center border-0 bg-brand text-body-strong text-on-brand transition-colors duration-150 motion-reduce:transition-none hover:bg-brand-deep active:translate-y-px';

export function PrzyciskDzielony({ glowny, opcje, etykietaWiecej, id, className }: PrzyciskDzielonyProps) {
  const [otwarte, ustawOtwarte] = useState(false);
  const idMenu = useId();
  const kontener = useRef<HTMLDivElement>(null);
  const przyciskWiecej = useRef<HTMLButtonElement>(null);
  const pozycje = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!otwarte) return;
    pozycje.current[0]?.focus();
    const zamknijPozaMenu = (zdarzenie: PointerEvent) => {
      if (!kontener.current?.contains(zdarzenie.target as Node)) ustawOtwarte(false);
    };
    document.addEventListener('pointerdown', zamknijPozaMenu);
    return () => document.removeEventListener('pointerdown', zamknijPozaMenu);
  }, [otwarte]);

  const zamknij = (zwrocFokus: boolean) => {
    ustawOtwarte(false);
    if (zwrocFokus) przyciskWiecej.current?.focus();
  };

  const obsluzKlawisz = (zdarzenie: React.KeyboardEvent<HTMLUListElement>) => {
    const elementy = pozycje.current.filter((p): p is HTMLButtonElement => p !== null);
    const biezacy = elementy.indexOf(document.activeElement as HTMLButtonElement);
    if (zdarzenie.key === 'Escape') {
      zdarzenie.preventDefault();
      zamknij(true);
    } else if (zdarzenie.key === 'ArrowDown') {
      zdarzenie.preventDefault();
      elementy[(biezacy + 1) % elementy.length]?.focus();
    } else if (zdarzenie.key === 'ArrowUp') {
      zdarzenie.preventDefault();
      elementy[(biezacy - 1 + elementy.length) % elementy.length]?.focus();
    } else if (zdarzenie.key === 'Home') {
      zdarzenie.preventDefault();
      elementy[0]?.focus();
    } else if (zdarzenie.key === 'End') {
      zdarzenie.preventDefault();
      elementy[elementy.length - 1]?.focus();
    } else if (zdarzenie.key === 'Tab') {
      zamknij(false);
    }
  };

  return (
    <div ref={kontener} id={id} className={['relative inline-flex max-w-full', className].filter(Boolean).join(' ')}>
      <div className="inline-flex min-h-control max-w-full">
        <button type="button" className={`${klasyCzesci} min-w-0 rounded-l-sm px-5 py-2 text-left`} onClick={glowny.onClick}>
          {glowny.etykieta}
        </button>
        <button
          ref={przyciskWiecej}
          type="button"
          aria-label={etykietaWiecej}
          aria-haspopup="menu"
          aria-expanded={otwarte}
          aria-controls={idMenu}
          className={`${klasyCzesci} relative shrink-0 rounded-r-sm px-3 before:absolute before:top-2.5 before:bottom-2.5 before:left-0 before:w-px before:bg-brand-chart`}
          onClick={() => ustawOtwarte((o) => !o)}
          onKeyDown={(zdarzenie) => {
            if (zdarzenie.key === 'ArrowDown' && !otwarte) {
              zdarzenie.preventDefault();
              ustawOtwarte(true);
            }
          }}
        >
          <Ikona nazwa="w-dol" rozmiar={20} />
        </button>
      </div>
      {otwarte ? (
        <ul
          id={idMenu}
          role="menu"
          aria-label={etykietaWiecej}
          onKeyDown={obsluzKlawisz}
          className="absolute top-full right-0 z-30 m-0 mt-1 min-w-60 max-w-[calc(100vw-2rem)] list-none rounded-sm border border-line bg-surface-card py-2"
        >
          {opcje.map((opcja, indeks) => (
            <li key={opcja.etykieta} role="none">
              <button
                ref={(element) => {
                  pozycje.current[indeks] = element;
                }}
                type="button"
                role="menuitem"
                tabIndex={-1}
                className="flex w-full cursor-pointer items-center border-0 bg-transparent px-5 py-3 text-left text-body-strong text-brand hover:bg-brand-tint hover:text-brand-deep"
                onClick={() => {
                  zamknij(true);
                  opcja.onClick();
                }}
              >
                {opcja.etykieta}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
