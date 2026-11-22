import type React from 'react';
import { Ikona, type NazwaIkony } from '@/komponenty/ikona';

export interface PrzyciskIkonaProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  ksztalt: 'okragly' | 'kwadratowy' | 'menu';
  ikona: NazwaIkony;
  // etykieta trafia do aria-label
  etykieta: string;
  ref?: React.Ref<HTMLButtonElement>;
}

const klasyBazowe =
  'inline-grid shrink-0 place-items-center p-0 cursor-pointer box-border transition-colors duration-150 motion-reduce:transition-none not-disabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50';

// ez-iconbtn--round, ez-iconbtn--square i pr-menu-btn ze wzorów.
const klasyKsztaltu: Record<PrzyciskIkonaProps['ksztalt'], string> = {
  okragly:
    'size-toggle rounded-full border-0 bg-brand-wash text-brand not-disabled:hover:bg-brand-tint not-disabled:hover:text-brand-deep',
  kwadratowy:
    'size-day rounded-sm border border-brand bg-surface-card text-brand not-disabled:hover:border-brand-deep not-disabled:hover:bg-brand-tint not-disabled:hover:text-brand-deep',
  menu: 'size-control rounded-xs border-2 border-brand bg-surface-card text-brand not-disabled:hover:bg-brand-tint',
};

export function PrzyciskIkona({ ksztalt, ikona, etykieta, className, type = 'button', ref, ...reszta }: PrzyciskIkonaProps) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={etykieta}
      className={[klasyBazowe, klasyKsztaltu[ksztalt], className].filter(Boolean).join(' ')}
      {...reszta}
    >
      <Ikona nazwa={ikona} rozmiar={ksztalt === 'kwadratowy' ? 20 : 24} />
    </button>
  );
}
