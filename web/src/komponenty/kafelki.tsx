import Link from 'next/link';
import { useId } from 'react';
import { Ikona, type NazwaIkony } from '@/komponenty/ikona';
import { Znaczek } from '@/komponenty/znaczek';
import { teksty } from '@/teksty';

export interface KafelkiProps {
  tytul?: string;
  kafelki: { href: string; etykieta: string; ikona?: NazwaIkony; nowaKarta?: boolean }[];
  kolumny?: 1 | 2 | 3;
  id?: string;
  className?: string;
}

export interface KafelekMetodyProps {
  href: string;
  ikona: NazwaIkony;
  tytul: string;
  opis: string;
  znaczek?: string;
  onClick?: () => void;
  id?: string;
  className?: string;
}

export interface StatystykiProps {
  pozycje: { etykieta: string; wartosc: string | number }[];
  id?: string;
  className?: string;
}

const klasyKolumn = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
} as const;

const klasyKafelka =
  'flex min-h-tile items-center justify-between gap-4 rounded-md bg-surface-page pr-5 pl-4 text-body text-brand no-underline hover:text-brand-deep hover:underline';

export function Kafelki({ tytul, kafelki, kolumny = 1, id, className }: KafelkiProps) {
  const idTytulu = useId();
  return (
    <div id={id} className={['min-w-0', className].filter(Boolean).join(' ')}>
      {tytul ? (
        <p id={idTytulu} className="m-0 mb-4 text-body-strong text-ink">
          {tytul}
        </p>
      ) : null}
      <ul
        role="list"
        aria-labelledby={tytul ? idTytulu : undefined}
        className={['m-0 grid list-none gap-3 p-0', klasyKolumn[kolumny]].join(' ')}
      >
        {kafelki.map((k) => {
          const tresc = (
            <>
              <span className="flex min-w-0 items-center gap-3">
                {k.ikona ? <Ikona nazwa={k.ikona} /> : null}
                <span className="min-w-0">{k.etykieta}</span>
              </span>
              <Ikona nazwa={k.nowaKarta ? 'zewnetrzny' : 'w-prawo'} />
            </>
          );
          return (
            <li key={k.href} className="min-w-0">
              {k.nowaKarta ? (
                <a href={k.href} target="_blank" rel="noopener noreferrer" className={klasyKafelka}>
                  {tresc}
                  <span className="sr-only">{teksty.wspolne.otwieraSieWNowejKarcie}</span>
                </a>
              ) : (
                <Link href={k.href} className={klasyKafelka}>
                  {tresc}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function KafelekMetody({ href, ikona, tytul, opis, znaczek, onClick, id, className }: KafelekMetodyProps) {
  return (
    <Link
      href={href}
      id={id}
      onClick={onClick}
      className={[
        'group grid grid-cols-[2.5rem_minmax(0,1fr)_1.5rem] items-center gap-x-6 rounded-md bg-surface-method py-5 pr-4 pl-6 text-ink no-underline hover:text-ink',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Ikona nazwa={ikona} className="size-method-icon text-brand" />
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-3 text-tile-title text-ink-max group-hover:underline">
          {tytul}
          {znaczek ? <Znaczek>{znaczek}</Znaczek> : null}
        </span>
        <span className="block">{opis}</span>
      </span>
      <Ikona nazwa="w-prawo" className="text-brand" />
    </Link>
  );
}

export function Statystyki({ pozycje, id, className }: StatystykiProps) {
  return (
    <dl id={id} className={['m-0 flex flex-wrap gap-3', className].filter(Boolean).join(' ')}>
      {pozycje.map((p) => (
        <div key={p.etykieta} className="min-w-0 flex-[1_1_7.5rem] rounded-md bg-surface-page p-4">
          <dt className="text-body text-ink">{p.etykieta}</dt>
          <dd className="m-0 mt-1 text-amount text-ink-strong">{p.wartosc}</dd>
        </div>
      ))}
    </dl>
  );
}
