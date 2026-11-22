'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type React from 'react';
import { Ikona } from '@/komponenty/ikona';
import { bezpiecznyPowrot, sciezkaOdwolania } from '@/komponenty/rama/trasy';
import { dopasujTrase } from '@/komponenty/rama/mapa-tras';
import type { IdWidoku } from '@/domena/typy/widoki';
import { teksty } from '@/teksty';

export interface LinkPowrotuProps {
  // bez href cel wyznacza bezpieczny parametr ?powrot=, a bez niego widok rodzica z mapy tras
  href?: string;
  children?: React.ReactNode;
  id?: string;
  className?: string;
}

const etykietyPowrotu: Partial<Record<IdWidoku, string>> = teksty.rama.powrotDo;

function etykietaDlaSciezki(sciezka: string): string {
  const dopasowanie = dopasujTrase(sciezka);
  return (dopasowanie && etykietyPowrotu?.[dopasowanie.wpis.widok]) || teksty.wspolne.wroc;
}

export function useCelPowrotu(): { href: string; etykieta: string } | null {
  const sciezka = usePathname();
  const parametry = useSearchParams();
  const powrot = bezpiecznyPowrot(parametry.get('powrot'));
  if (powrot) {
    return { href: powrot, etykieta: etykietaDlaSciezki(powrot) };
  }
  const dopasowanie = dopasujTrase(sciezka);
  const rodzic = dopasowanie?.wpis.rodzic;
  if (!dopasowanie || !rodzic) return null;
  return {
    href: sciezkaOdwolania(rodzic, dopasowanie.parametry),
    etykieta: etykietyPowrotu?.[rodzic.widok] ?? teksty.wspolne.wroc,
  };
}

// ez-back: link 14/20 pogrubiony z ikoną strzałki 16 px.
const klasyLinku =
  'inline-flex items-center gap-1 text-small-strong text-brand no-underline hover:underline hover:text-brand-deep';

export function LinkPowrotu({ href, children, id, className }: LinkPowrotuProps) {
  const cel = useCelPowrotu();
  const docelowy = href ?? cel?.href;
  if (!docelowy) return null;
  const etykieta = children ?? (href ? teksty.wspolne.wroc : cel?.etykieta);
  return (
    <Link href={docelowy} id={id} className={[klasyLinku, className].filter(Boolean).join(' ')}>
      <Ikona nazwa="strzalka-w-lewo" rozmiar={16} />
      {etykieta}
    </Link>
  );
}
