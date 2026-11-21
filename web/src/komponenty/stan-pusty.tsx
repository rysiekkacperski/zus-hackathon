import type React from 'react';
import { Ikona, type NazwaIkony } from '@/komponenty/ikona';

export interface StanPustyProps {
  ikona: NazwaIkony;
  children: React.ReactNode;
  akcja?: React.ReactNode;
  // ez-empty--dashed: przerywana ramka na tle surface-sunken
  przerywany?: boolean;
  // role="status", gdy stan pusty pojawia się po działaniu użytkownika (filtr, usunięcie)
  rolaStatus?: boolean;
  id?: string;
  className?: string;
}

const klasyWariantu = {
  zwykly: 'gap-4 bg-surface-page px-6 py-16',
  przerywany: 'gap-2 border border-dashed border-line-dashed bg-surface-sunken px-4 py-16',
} as const;

// ez-empty: wyśrodkowana ikona w białym kole 72 px i tekst pod nią.
export function StanPusty({ ikona, children, akcja, przerywany = false, rolaStatus = false, id, className }: StanPustyProps) {
  return (
    <div
      id={id}
      role={rolaStatus ? 'status' : undefined}
      className={[
        'flex flex-col items-center rounded-sm text-center',
        przerywany ? klasyWariantu.przerywany : klasyWariantu.zwykly,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="grid size-empty-icon place-items-center rounded-full bg-surface-card text-brand">
        <Ikona nazwa={ikona} className="size-8" />
      </span>
      <div className="flex min-w-0 flex-col gap-2 [&_p]:m-0">{children}</div>
      {akcja ? <div className="flex flex-wrap justify-center gap-4">{akcja}</div> : null}
    </div>
  );
}
