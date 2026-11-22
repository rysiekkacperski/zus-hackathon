import type React from 'react';
import { Ikona, type NazwaIkony } from '@/komponenty/ikona';

export interface NotatkaProps {
  children: React.ReactNode;
  ikona?: NazwaIkony;
  id?: string;
  className?: string;
}

// ez-note: ikona w kolorze ink-muted i tekst obok.
export function Notatka({ children, ikona = 'info', id, className }: NotatkaProps) {
  return (
    <div id={id} className={['flex items-start gap-2 text-ink', className].filter(Boolean).join(' ')}>
      <Ikona nazwa={ikona} className="mt-0.5 text-ink-muted" />
      <div className="min-w-0 flex-1 [&_p]:m-0">{children}</div>
    </div>
  );
}
