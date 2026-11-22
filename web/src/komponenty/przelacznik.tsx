'use client';

import type { ReactNode } from 'react';
import { BladPola, idBledu, polaczOpisy, trescBledu, type BladPolaWartosc } from '@/komponenty/pole';
import { klasyEtykietyZaznaczenia, klasyKwadratuZaznaczenia } from '@/komponenty/pole-zaznaczenia';

export interface PrzelacznikProps {
  id: string;
  etykieta: string;
  wlaczony: boolean;
  onZmiana: (w: boolean) => void;
  /** Opuszczenie przełącznika i zmiana stanu: walidacja po opuszczeniu (useWalidacjaNaBiezaco). */
  onOpuszczenie?: () => void;
  steruje?: string;
  opis?: ReactNode;
  blad?: BladPolaWartosc;
  parametryBledu?: Record<string, string>;
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
  onOpuszczenie,
  steruje,
  opis,
  blad,
  parametryBledu,
  wylaczony,
  nazwa,
  className,
}: PrzelacznikProps) {
  const idOpisu = `${id}-opis`;
  const maBlad = Boolean(blad);
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
          aria-invalid={maBlad ? true : undefined}
          aria-describedby={polaczOpisy(opis ? idOpisu : null, maBlad ? idBledu(id) : null)}
          onChange={(e) => {
            onZmiana(e.target.checked);
            onOpuszczenie?.();
          }}
          onBlur={onOpuszczenie}
          className={klasyKwadratuZaznaczenia}
        />
        <span className="min-w-0">{etykieta}</span>
      </label>
      {opis ? (
        <div id={idOpisu} className="mt-1 ml-8 min-w-0">
          {opis}
        </div>
      ) : null}
      {blad ? <BladPola id={idBledu(id)} tresc={trescBledu(blad, parametryBledu)} /> : null}
    </div>
  );
}
