'use client';

import type { ReactNode } from 'react';
import { klasyEtykietyZaznaczenia, klasyKwadratuZaznaczenia } from '@/komponenty/pole-zaznaczenia';

export interface PrzelacznikProps {
  id: string;
  etykieta: string;
  wlaczony: boolean;
  onZmiana: (w: boolean) => void;
  steruje?: string;
  opis?: ReactNode;
  wylaczony?: boolean;
  nazwa?: string;
  className?: string;
}

// Przełącznik ze wzoru P09-13: pole ez-check z role="switch".
export function Przelacznik({
  id,
  etykieta,
  wlaczony,
  onZmiana,
  steruje,
  opis,
  wylaczony,
  nazwa,
  className,
}: PrzelacznikProps) {
  const idOpisu = `${id}-opis`;
  return (
    <div className={['min-w-0', className].filter(Boolean).join(' ')}>
      <label htmlFor={id} className={klasyEtykietyZaznaczenia[wylaczony ? 'wylaczona' : 'aktywna']}>
        <input
          id={id}
          type="checkbox"
          role="switch"
          name={nazwa}
          checked={wlaczony}
          disabled={wylaczony}
          aria-controls={steruje}
          aria-describedby={opis ? idOpisu : undefined}
          onChange={(e) => onZmiana(e.target.checked)}
          className={klasyKwadratuZaznaczenia}
        />
        <span className="min-w-0">{etykieta}</span>
      </label>
      {opis ? (
        <div id={idOpisu} className="mt-1 ml-8 min-w-0">
          {opis}
        </div>
      ) : null}
    </div>
  );
}
