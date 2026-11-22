import { useId } from 'react';
import type React from 'react';
import { Ikona, type NazwaIkony } from '@/komponenty/ikona';

export interface KartaProps {
  tytul?: string;
  poziomTytulu?: 2 | 3;
  ikona?: NazwaIkony;
  // ez-card__head--plain: nagłówek bez linii pod spodem
  bezLinii?: boolean;
  akcje?: React.ReactNode;
  as?: 'section' | 'div' | 'article';
  children: React.ReactNode;
  id?: string;
  className?: string;
}

const klasyNaglowka = {
  zLinia: 'mb-4 flex min-h-9 flex-wrap items-center gap-2 border-b border-line pb-3',
  bezLinii: 'mb-3 flex min-h-9 flex-wrap items-center gap-2',
} as const;

const klasyTytulu = {
  2: 'm-0 min-w-0 flex-1 text-section-title text-ink',
  3: 'm-0 min-w-0 flex-1 text-tile-title text-ink',
} as const;

// ez-card: biała karta z promieniem 4 px i odstępem wewnętrznym 20 px.
export function Karta({
  tytul,
  poziomTytulu = 2,
  ikona,
  bezLinii = false,
  akcje,
  as: Znacznik = 'section',
  children,
  id,
  className,
}: KartaProps) {
  const idTytulu = useId();
  const Tytul = poziomTytulu === 2 ? 'h2' : 'h3';
  return (
    <Znacznik
      id={id}
      aria-labelledby={tytul && Znacznik !== 'div' ? idTytulu : undefined}
      className={['box-border min-w-0 rounded-sm bg-surface-card p-5', className].filter(Boolean).join(' ')}
    >
      {tytul ? (
        <div className={bezLinii ? klasyNaglowka.bezLinii : klasyNaglowka.zLinia}>
          {ikona ? <Ikona nazwa={ikona} className="text-brand-decor" /> : null}
          <Tytul id={idTytulu} className={klasyTytulu[poziomTytulu]}>
            {tytul}
          </Tytul>
          {akcje ? <div className="flex flex-wrap items-center gap-4">{akcje}</div> : null}
        </div>
      ) : akcje ? (
        <div className="mb-3 flex flex-wrap items-center justify-end gap-4">{akcje}</div>
      ) : null}
      {children}
    </Znacznik>
  );
}
