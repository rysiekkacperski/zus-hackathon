import Link from 'next/link';
import { Suspense } from 'react';
import { Ikona } from '@/komponenty/ikona';
import { PrzyciskIkona } from '@/komponenty/przycisk-ikona';
import { KontoWNaglowku } from '@/komponenty/rama/konto-w-naglowku';
import { teksty } from '@/teksty';

// Plik bez dyrektywy 'use client': NaglowekPubliczny i Logo renderują się na serwerze,
// a Naglowek renderuje wyłącznie kliencka RamaAplikacji, która przekazuje mu obsługę zdarzeń.
// KontoWNaglowku czyta magazyn, więc leży w osobnej granicy <Suspense>.

export interface LogoProps {
  href: string;
}

// pr-logo: znak w kole marki i nazwa przewodnika, poniżej md tekst 16 px.
export function Logo({ href }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label={teksty.rama.logoEtykieta}
      className="inline-flex min-w-0 items-center gap-2 text-brand no-underline hover:text-brand-deep md:gap-3"
    >
      <span className="grid size-10 flex-none place-items-center rounded-full bg-brand text-on-brand">
        <Ikona nazwa="logo" rozmiar={24} />
      </span>
      <span className="truncate text-body font-bold tracking-[0.02em] md:text-logo">{teksty.rama.logo}</span>
    </Link>
  );
}

const klasyNaglowka = 'relative z-20 flex h-header items-stretch bg-surface-card shadow-header';

export function NaglowekPubliczny() {
  return (
    <header className={klasyNaglowka}>
      <div className="flex min-w-0 flex-1 items-center px-3 md:px-7.5">
        <Logo href="/" />
      </div>
    </header>
  );
}

export interface NaglowekProps {
  // Logo prowadzące do ekranu startowego roli; RamaAplikacji podaje je w granicy <Suspense>.
  logo: React.ReactNode;
  menuOtwarte: boolean;
  onPrzelaczMenu: () => void;
  idMenu: string;
  className?: string;
}

// ez-header ramy po zalogowaniu: przycisk menu poniżej lg, logo i konto.
export function Naglowek({ logo, menuOtwarte, onPrzelaczMenu, idMenu, className }: NaglowekProps) {
  return (
    <header className={className ? `${klasyNaglowka} ${className}` : klasyNaglowka}>
      <div className="flex min-w-0 flex-1 items-center gap-2 px-3 md:gap-4 md:px-7.5">
        <PrzyciskIkona
          ksztalt="menu"
          ikona={menuOtwarte ? 'zamknij' : 'menu'}
          etykieta={menuOtwarte ? teksty.rama.zamknijMenu : teksty.rama.otworzMenu}
          aria-expanded={menuOtwarte}
          aria-controls={idMenu}
          onClick={onPrzelaczMenu}
          className="lg:hidden"
        />
        {logo}
      </div>
      <Suspense fallback={null}>
        <KontoWNaglowku />
      </Suspense>
    </header>
  );
}
