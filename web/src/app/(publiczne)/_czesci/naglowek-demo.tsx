'use client';

// Nagłówek ekranów trybu demonstracyjnego przed zalogowaniem (wzory P01-03, P01-05, P01-08, P01-11,
// P02-01): opcjonalny link powrotu, znacznik pr-demo-flag nad tytułem, tytuł i wstęp.
// Komunikaty po przejściu renderuje NaglowekStrony pod nagłówkiem. Właściciel: u01.
import type React from 'react';
import { FlagaDemo } from '@/komponenty/flaga-demo';
import { LinkPowrotu } from '@/komponenty/link-powrotu';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';

export interface NaglowekDemoProps {
  flaga: string;
  tytul: string;
  wstep?: React.ReactNode;
  // Etykieta linku powrotu do widoku rodzica z mapy tras; bez niej ekran nie ma linku powrotu.
  powrot?: string;
}

export function NaglowekDemo({ flaga, tytul, wstep, powrot }: NaglowekDemoProps) {
  return (
    <>
      <div className="flex flex-col items-start gap-4 pt-4 md:pt-10">
        {powrot ? <LinkPowrotu>{powrot}</LinkPowrotu> : null}
        <FlagaDemo>{flaga}</FlagaDemo>
      </div>
      <NaglowekStrony tytul={tytul} wstep={wstep} powrot={false} className="pt-4! md:pt-4!" />
    </>
  );
}
