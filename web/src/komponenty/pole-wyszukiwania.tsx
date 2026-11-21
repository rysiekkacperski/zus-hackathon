'use client';

import { Ikona } from '@/komponenty/ikona';
import { klasyPolaWpisu } from '@/komponenty/pole';

export interface PoleWyszukiwaniaProps {
  id: string;
  etykieta: string;
  wartosc: string;
  onZmiana: (w: string) => void;
  placeholder?: string;
  steruje?: string;
  className?: string;
}

export function PoleWyszukiwania({
  id,
  etykieta,
  wartosc,
  onZmiana,
  placeholder,
  steruje,
  className,
}: PoleWyszukiwaniaProps) {
  return (
    <label className={['relative block min-w-0', className].filter(Boolean).join(' ')}>
      <span className="sr-only">{etykieta}</span>
      <Ikona
        nazwa="szukaj"
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-brand"
      />
      <input
        id={id}
        type="search"
        value={wartosc}
        placeholder={placeholder}
        aria-controls={steruje}
        autoComplete="off"
        onChange={(e) => onZmiana(e.target.value)}
        className={`${klasyPolaWpisu} pr-3 pl-12 focus:pr-[0.6875rem] focus:pl-[2.9375rem]`}
      />
    </label>
  );
}
