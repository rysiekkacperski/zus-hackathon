import type React from 'react';

export type OdstepUkladu = 2 | 3 | 4 | 6 | 7.5;

export interface UkladDwuKolumnowyProps {
  tresc: React.ReactNode;
  boczna?: React.ReactNode;
  // aria-label kolumny bocznej renderowanej jako aside
  etykietaBocznej?: string;
  id?: string;
  className?: string;
}

export interface KolumnaProps {
  children: React.ReactNode;
  etykieta?: string;
  id?: string;
  className?: string;
}

export interface StosProps {
  odstep?: OdstepUkladu;
  children: React.ReactNode;
  as?: 'div' | 'section' | 'ul' | 'ol';
  id?: string;
  className?: string;
}

export interface WierszProps {
  odstep?: OdstepUkladu;
  children: React.ReactNode;
  as?: 'div' | 'ul';
  // wyrównanie w pionie, domyślnie do środka jak ez-row
  wyrownanie?: 'srodek' | 'gora' | 'dol';
  id?: string;
  className?: string;
}

const klasyOdstepu: Record<OdstepUkladu, string> = {
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  6: 'gap-6',
  7.5: 'gap-7.5',
};

const klasyWyrownania = {
  srodek: 'items-center',
  gora: 'items-start',
  dol: 'items-end',
} as const;

function polacz(...klasy: (string | undefined)[]) {
  return klasy.filter(Boolean).join(' ');
}

const klasyListy = 'm-0 list-none p-0';

// Kolumna treści ze wzorów: flex 999 1 560px.
export function KolumnaTresci({ children, etykieta, id, className }: KolumnaProps) {
  return (
    <div id={id} role={etykieta ? 'region' : undefined} aria-label={etykieta} className={polacz('flex min-w-0 grow-999 basis-140 flex-col gap-7.5', className)}>
      {children}
    </div>
  );
}

// Kolumna boczna ze wzorów: flex 1 1 337px, najwyżej 337 px szerokości.
export function KolumnaBoczna({ children, etykieta, id, className }: KolumnaProps) {
  return (
    <aside
      id={id}
      aria-label={etykieta}
      className={polacz('flex min-w-0 max-w-84 grow basis-84 flex-col gap-7.5', className)}
    >
      {children}
    </aside>
  );
}

export function UkladDwuKolumnowy({ tresc, boczna, etykietaBocznej, id, className }: UkladDwuKolumnowyProps) {
  return (
    <div id={id} className={polacz('flex max-w-tresc flex-wrap items-start gap-7.5', className)}>
      <KolumnaTresci>{tresc}</KolumnaTresci>
      {boczna ? <KolumnaBoczna etykieta={etykietaBocznej}>{boczna}</KolumnaBoczna> : null}
    </div>
  );
}

// ez-stack: kolumna z odstępem, domyślnie 16 px.
export function Stos({ odstep = 4, children, as: Znacznik = 'div', id, className }: StosProps) {
  return (
    <Znacznik
      id={id}
      className={polacz(
        'flex min-w-0 flex-col',
        klasyOdstepu[odstep],
        Znacznik === 'ul' || Znacznik === 'ol' ? klasyListy : undefined,
        className,
      )}
    >
      {children}
    </Znacznik>
  );
}

// ez-row: wiersz zawijany z odstępem, domyślnie 16 px.
export function Wiersz({ odstep = 4, children, as: Znacznik = 'div', wyrownanie = 'srodek', id, className }: WierszProps) {
  return (
    <Znacznik
      id={id}
      className={polacz(
        'flex min-w-0 flex-wrap',
        klasyWyrownania[wyrownanie],
        klasyOdstepu[odstep],
        Znacznik === 'ul' ? klasyListy : undefined,
        className,
      )}
    >
      {children}
    </Znacznik>
  );
}
