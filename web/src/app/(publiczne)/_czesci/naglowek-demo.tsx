'use client';

// Nagłówek ekranów trybu demonstracyjnego przed zalogowaniem (wzory P01-03, P01-05, P01-08, P01-11,
// P02-01): opcjonalny link powrotu, tytuł i wstęp.
// Komunikaty po przejściu renderuje NaglowekStrony pod nagłówkiem. Właściciel: u01.
import type React from 'react';
import { LinkPowrotu } from '@/komponenty/link-powrotu';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';

export interface NaglowekDemoProps {
  tytul: string;
  wstep?: React.ReactNode;
  // Etykieta linku powrotu do widoku rodzica z mapy tras; bez niej ekran nie ma linku powrotu.
  powrot?: string;
}

export function NaglowekDemo({ tytul, wstep, powrot }: NaglowekDemoProps) {
  return (
    <>
      <div className="flex flex-col items-start pt-4 md:pt-10">
        {powrot ? <LinkPowrotu>{powrot}</LinkPowrotu> : null}
      </div>
      <NaglowekStrony tytul={tytul} wstep={wstep} powrot={false} className="pt-4! md:pt-4!" />
    </>
  );
}
