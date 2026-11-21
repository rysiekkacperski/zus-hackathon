import type React from 'react';
import { Ikona } from '@/komponenty/ikona';
import { teksty } from '@/teksty';

export interface FlagaDemoProps {
  // domyślnie teksty.wspolne.trybDemonstracyjny
  children?: React.ReactNode;
  id?: string;
  className?: string;
}

// pr-demo-flag: przerywana ramka brand na tle brand-wash, ikona kolby i tekst 14/20 pogrubiony.
export function FlagaDemo({ children, id, className }: FlagaDemoProps) {
  return (
    <span
      id={id}
      className={[
        'inline-flex max-w-full items-center gap-2 rounded-sm border border-dashed border-brand bg-brand-wash px-3 py-1 text-small-strong text-brand',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Ikona nazwa="demo" rozmiar={20} />
      <span className="min-w-0">{children ?? teksty.wspolne.trybDemonstracyjny}</span>
    </span>
  );
}
