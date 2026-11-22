'use client';

// Tryb gościa: notatka przy funkcji, która wymaga konta, z odnośnikiem „Zaloguj się, żeby …”. Odnośnik prowadzi na stronę
// startową z parametrem ?powrot= na bieżący ekran z zapytaniem albo na podaną ścieżkę. Renderuj w <Suspense>,
// bo adres bieżącego ekranu pochodzi z useSearchParams.
import type { ReactNode } from 'react';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { useSciezkaLogowania } from '@/komponenty/rama/konto-w-naglowku';
import { sciezkaLogowaniaZPowrotem } from '@/komponenty/rama/trasy';

export interface NotatkaLogowaniaProps {
  // Tekst odnośnika, np. „Zaloguj się, żeby zapisać scenariusz w planie rodziny”.
  odnosnik: string;
  opis?: ReactNode;
  // Ścieżka, na którą logowanie wraca; domyślnie bieżący ekran.
  powrot?: string;
  className?: string;
}

/** Adres logowania z powrotem na podaną ścieżkę albo na bieżący ekran. */
export function useAdresLogowania(powrot?: string): string {
  const biezacy = useSciezkaLogowania();
  return powrot === undefined ? biezacy : sciezkaLogowaniaZPowrotem(powrot);
}

export function NotatkaLogowania({ odnosnik, opis, powrot, className }: NotatkaLogowaniaProps) {
  const href = useAdresLogowania(powrot);
  return (
    <Notatka ikona="konto" className={className}>
      <div className="flex flex-col items-start gap-1">
        {opis ? <p>{opis}</p> : null}
        <Odnosnik href={href}>{odnosnik}</Odnosnik>
      </div>
    </Notatka>
  );
}
