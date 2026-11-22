'use client';

import { usePathname } from 'next/navigation';
import type React from 'react';
import { Karta } from '@/komponenty/karta';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { dopasujTrase } from '@/komponenty/rama/mapa-tras';
import { sciezkaOdwolania } from '@/komponenty/rama/trasy';
import type { IdWidoku } from '@/domena/typy/widoki';
import { teksty } from '@/teksty';

export interface EkranZastepczyProps {
  idWidoku: IdWidoku;
  // jednostka właściciela widoku, na przykład 'u12'
  jednostka: string;
  opis?: React.ReactNode;
}

// Tytuł strony widoku z teksty.<IdWidoku>.tytulStrony, a bez wpisu identyfikator widoku.
export function tytulWidoku(idWidoku: IdWidoku): string {
  const grupa = (teksty as unknown as Partial<Record<string, { tytulStrony?: string }>>)[idWidoku];
  return grupa?.tytulStrony ?? idWidoku;
}

const tekst = teksty.wspolne.ekranZastepczy;

// Ekran zastępczy z sekcji 2.4 kontraktu: tytuł widoku, właściciel, link powrotu i przejście do następnego widoku ścieżki.
export function EkranZastepczy({ idWidoku, jednostka, opis }: EkranZastepczyProps) {
  const dopasowanie = dopasujTrase(usePathname());
  const nastepny = dopasowanie?.wpis.nastepnyZastepczy;

  return (
    <>
      <NaglowekStrony tytul={tytulWidoku(idWidoku)} />
      <Karta tytul={tekst.naglowek} bezLinii className="max-w-tresc">
        <div className="flex flex-col gap-4">
          <p className="m-0">{tekst.opis({ jednostka })}</p>
          <p className="m-0 text-small text-ink-muted">{tekst.identyfikator({ idWidoku })}</p>
          {opis ? <div className="[&_p]:m-0">{opis}</div> : null}
          {nastepny ? (
            <div>
              <PrzyciskLink href={sciezkaOdwolania(nastepny)} wariant="glowny" ikonaPo="w-prawo">
                {tekst.dalej({ tytul: tytulWidoku(nastepny.widok) })}
              </PrzyciskLink>
            </div>
          ) : null}
        </div>
      </Karta>
    </>
  );
}
