import Link from 'next/link';
import type React from 'react';
import { Ikona, type NazwaIkony } from '@/komponenty/ikona';
import type { Pochodzenie } from '@/domena/typy/widoki';
import { teksty } from '@/teksty';

export interface OdnosnikProps {
  href: string;
  wTekscie?: boolean;
  ikonaPo?: NazwaIkony;
  children: React.ReactNode;
  // dopisuje ?z=<pochodzenie>, z którego ViewCaseDetails i ViewCaseGuide wyznaczają link powrotu i pozycję menu
  pochodzenie?: Pochodzenie;
  onClick?: () => void;
  'aria-label'?: string;
  id?: string;
  className?: string;
}

export interface OdnosnikZewnetrznyProps {
  href: string;
  children: React.ReactNode;
  onOtwarcie?: () => void;
  id?: string;
  className?: string;
}

export interface OdnosnikTelefonuProps {
  numer: string;
  id?: string;
  className?: string;
}

export interface OdnosnikEmailProps {
  adres: string;
  id?: string;
  className?: string;
}

// ez-link i ez-link--inline
const klasyOdnosnika = 'inline-flex items-center gap-2 font-semibold text-brand no-underline hover:underline';
const klasyOdnosnikaWTekscie = 'inline font-semibold text-brand underline';
// ez-extlink
const klasyOdnosnikaZewnetrznego = 'inline-flex items-center gap-2 font-semibold text-ink no-underline hover:underline';

function polacz(...klasy: (string | undefined | false)[]) {
  return klasy.filter(Boolean).join(' ');
}

export function dopiszPochodzenie(href: string, pochodzenie?: Pochodzenie): string {
  if (!pochodzenie) return href;
  const [bezKotwicy, kotwica] = href.split('#');
  const separator = bezKotwicy.includes('?') ? '&' : '?';
  return `${bezKotwicy}${separator}z=${pochodzenie}${kotwica !== undefined ? `#${kotwica}` : ''}`;
}

export function Odnosnik({
  href,
  wTekscie = false,
  ikonaPo,
  children,
  pochodzenie,
  onClick,
  'aria-label': etykietaAria,
  id,
  className,
}: OdnosnikProps) {
  return (
    <Link
      href={dopiszPochodzenie(href, pochodzenie)}
      id={id}
      aria-label={etykietaAria}
      onClick={onClick}
      className={polacz(wTekscie ? klasyOdnosnikaWTekscie : klasyOdnosnika, className)}
    >
      {children}
      {ikonaPo ? <Ikona nazwa={ikonaPo} rozmiar={20} /> : null}
    </Link>
  );
}

export function OdnosnikZewnetrzny({ href, children, onOtwarcie, id, className }: OdnosnikZewnetrznyProps) {
  return (
    <a
      href={href}
      id={id}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onOtwarcie}
      className={polacz(klasyOdnosnikaZewnetrznego, className)}
    >
      {children}
      <Ikona nazwa="zewnetrzny" rozmiar={20} className="text-ink-muted" />
      <span className="sr-only">{teksty.wspolne.otwieraSieWNowejKarcie}</span>
    </a>
  );
}

export function OdnosnikTelefonu({ numer, id, className }: OdnosnikTelefonuProps) {
  return (
    <a href={`tel:${numer.replace(/\s/g, '')}`} id={id} className={polacz(klasyOdnosnika, className)}>
      <Ikona nazwa="telefon" rozmiar={20} />
      {numer}
    </a>
  );
}

export function OdnosnikEmail({ adres, id, className }: OdnosnikEmailProps) {
  return (
    <a href={`mailto:${adres}`} id={id} className={polacz(klasyOdnosnika, 'break-all', className)}>
      <Ikona nazwa="email" rozmiar={20} />
      {adres}
    </a>
  );
}
