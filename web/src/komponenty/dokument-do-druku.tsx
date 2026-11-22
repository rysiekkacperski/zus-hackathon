'use client';

import type { ReactNode } from 'react';
import { Przycisk } from '@/komponenty/przycisk';
import { teksty } from '@/teksty';

export interface DokumentDoDrukuProps {
  tytul: string;
  children: ReactNode;
  nazwaPliku: string;
  id?: string;
  className?: string;
}

// Otwiera okno drukowania przeglądarki. Tytuł strony staje się domyślną nazwą pliku PDF.
export function drukujDokument(nazwaPliku?: string): void {
  if (typeof window === 'undefined') return;
  const poprzedniTytul = document.title;
  if (nazwaPliku) {
    document.title = nazwaPliku.replace(/\.pdf$/i, '');
    window.addEventListener(
      'afterprint',
      () => {
        document.title = poprzedniTytul;
      },
      { once: true },
    );
  }
  window.print();
}

export function DokumentDoDruku({ tytul, children, nazwaPliku, id, className }: DokumentDoDrukuProps) {
  return (
    <article
      id={id}
      data-dokument-do-druku=""
      className={[
        'min-w-0 rounded-sm bg-surface-card p-5 text-ink print:rounded-none print:p-0 print:text-ink-max',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mb-6 flex justify-end print:hidden">
        <Przycisk wariant="drugorzedny" ikona="drukuj" onClick={() => drukujDokument(nazwaPliku)}>
          {teksty.wspolne.zlozone.drukujLubZapiszPdf}
        </Przycisk>
      </div>
      <h2 className="m-0 mb-6 text-section-title text-ink-strong">{tytul}</h2>
      <div className="flex min-w-0 flex-col gap-4">{children}</div>
    </article>
  );
}
