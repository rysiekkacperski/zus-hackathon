'use client';

import Link from 'next/link';
import type React from 'react';
import { Ikona, type NazwaIkony } from '@/komponenty/ikona';
import { teksty } from '@/teksty';

export type WariantPrzycisku = 'glowny' | 'drugorzedny' | 'tlo';
export type SzerokoscPrzycisku = 'auto' | 'pelna' | 'szeroka';

export interface PrzyciskProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  wariant: WariantPrzycisku;
  szerokosc?: SzerokoscPrzycisku;
  ikona?: NazwaIkony;
  ikonaPo?: NazwaIkony;
  // aria-busy i blokada ponownego kliknięcia
  zajety?: boolean;
  className?: string;
  ref?: React.Ref<HTMLButtonElement>;
}

export interface PrzyciskLinkProps {
  href: string;
  wariant: WariantPrzycisku;
  szerokosc?: SzerokoscPrzycisku;
  ikona?: NazwaIkony;
  ikonaPo?: NazwaIkony;
  nowaKarta?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  id?: string;
}

// ez-btn: wysokość 46 px, ramka 2 px, promień 2 px, tekst 16/24 pogrubiony.
const klasyBazowe =
  'min-h-control items-center justify-center gap-2 rounded-xs border-2 px-5 py-2 text-center text-body-strong no-underline cursor-pointer box-border transition-colors duration-150 motion-reduce:transition-none not-disabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50';

const klasyWariantu: Record<WariantPrzycisku, string> = {
  glowny:
    'border-brand bg-brand text-on-brand not-disabled:hover:border-brand-deep not-disabled:hover:bg-brand-deep not-disabled:hover:text-on-brand',
  drugorzedny:
    'border-brand bg-surface-card text-brand not-disabled:hover:border-brand-deep not-disabled:hover:bg-brand-tint not-disabled:hover:text-brand-deep',
  tlo: 'border-brand-wash bg-brand-wash text-brand not-disabled:hover:border-brand-tint not-disabled:hover:bg-brand-tint not-disabled:hover:text-brand-deep',
};

const klasySzerokosci: Record<SzerokoscPrzycisku, string> = {
  auto: 'inline-flex',
  pelna: 'flex w-full',
  szeroka: 'inline-flex min-w-39',
};

export function klasyPrzycisku(wariant: WariantPrzycisku, szerokosc: SzerokoscPrzycisku = 'auto', className?: string) {
  return [klasyBazowe, klasySzerokosci[szerokosc], klasyWariantu[wariant], className].filter(Boolean).join(' ');
}

export function Przycisk({
  wariant,
  szerokosc = 'auto',
  ikona,
  ikonaPo,
  zajety = false,
  className,
  ref,
  type = 'button',
  onClick,
  children,
  ...reszta
}: PrzyciskProps) {
  return (
    <button
      ref={ref}
      type={type}
      aria-busy={zajety || undefined}
      className={klasyPrzycisku(wariant, szerokosc, className)}
      onClick={(e) => {
        if (zajety) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...reszta}
    >
      {zajety ? (
        <Ikona nazwa="ladowanie" rozmiar={20} className="motion-safe:animate-spin" />
      ) : ikona ? (
        <Ikona nazwa={ikona} rozmiar={20} />
      ) : null}
      {children}
      {ikonaPo ? <Ikona nazwa={ikonaPo} rozmiar={20} /> : null}
    </button>
  );
}

export function PrzyciskLink({
  href,
  wariant,
  szerokosc = 'auto',
  ikona,
  ikonaPo,
  nowaKarta = false,
  children,
  className,
  onClick,
  id,
}: PrzyciskLinkProps) {
  const atrybutyNowejKarty = nowaKarta ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <Link
      href={href}
      id={id}
      onClick={onClick}
      className={klasyPrzycisku(wariant, szerokosc, className)}
      {...atrybutyNowejKarty}
    >
      {ikona ? <Ikona nazwa={ikona} rozmiar={20} /> : null}
      {children}
      {ikonaPo ? <Ikona nazwa={ikonaPo} rozmiar={20} /> : null}
      {nowaKarta ? (
        <>
          {ikonaPo ? null : <Ikona nazwa="zewnetrzny" rozmiar={20} />}
          <span className="sr-only">{teksty.wspolne.otwieraSieWNowejKarcie}</span>
        </>
      ) : null}
    </Link>
  );
}
