import type { ReactNode } from 'react';
import { Ikona, type NazwaIkony } from '@/komponenty/ikona';

export interface PierscienProps {
  etykieta: string;
  ikona?: NazwaIkony;
  procent?: number;
  children?: ReactNode;
  id?: string;
  className?: string;
}

export interface WykresDwudzielnyProps {
  a: { wartosc: number; etykieta: string };
  b: { wartosc: number; etykieta: string };
  metryka: string;
  wartoscSrodka: string;
  id?: string;
  className?: string;
}

// Okrąg w polu 224 x 224 z obrysem 24 px: promień 100, obwód 2 * PI * 100.
const SRODEK = 112;
const PROMIEN = 100;
const OBWOD = 2 * Math.PI * PROMIEN;

function Luk({ udzial, klasa }: { udzial: number; klasa: string }) {
  const dlugosc = Math.min(1, Math.max(0, udzial)) * OBWOD;
  return (
    <circle
      cx={SRODEK}
      cy={SRODEK}
      r={PROMIEN}
      className={klasa}
      strokeDasharray={`${dlugosc} ${OBWOD}`}
      transform={`rotate(-90 ${SRODEK} ${SRODEK})`}
    />
  );
}

export function Pierscien({ etykieta, ikona, procent, children, id, className }: PierscienProps) {
  return (
    <div id={id} className={['relative size-ring flex-none', className].filter(Boolean).join(' ')}>
      <svg viewBox="0 0 224 224" aria-hidden="true" focusable="false" className="absolute inset-0 size-full fill-none stroke-24">
        {procent === undefined ? (
          <circle cx={SRODEK} cy={SRODEK} r={PROMIEN} className="stroke-success" />
        ) : (
          <>
            <circle cx={SRODEK} cy={SRODEK} r={PROMIEN} className="stroke-line-soft" />
            <Luk udzial={procent / 100} klasa="stroke-success" />
          </>
        )}
      </svg>
      <div className="absolute inset-6 flex flex-col items-center justify-center gap-2 text-center">
        {ikona ? <Ikona nazwa={ikona} className="size-16 text-success" /> : null}
        <span className="font-semibold text-success-strong">{etykieta}</span>
        {children}
      </div>
    </div>
  );
}

export function WykresDwudzielny({ a, b, metryka, wartoscSrodka, id, className }: WykresDwudzielnyProps) {
  const suma = a.wartosc + b.wartosc;
  const udzialA = suma > 0 ? a.wartosc / suma : 0;
  return (
    <figure id={id} className={['m-0 flex flex-wrap items-center gap-6', className].filter(Boolean).join(' ')}>
      <div className="relative size-ring flex-none">
        <svg viewBox="0 0 224 224" aria-hidden="true" focusable="false" className="absolute inset-0 size-full fill-none stroke-24">
          <circle cx={SRODEK} cy={SRODEK} r={PROMIEN} className="stroke-brand" />
          <Luk udzial={udzialA} klasa="stroke-brand-chart" />
        </svg>
        <div className="absolute inset-6 flex flex-col items-center justify-center gap-2 text-center">
          <span className="mx-auto block max-w-30 text-ink">{metryka}</span>
          <span className="block text-amount text-ink-strong">{wartoscSrodka}</span>
        </div>
      </div>
      <figcaption className="min-w-0">
        <ul role="list" className="m-0 grid list-none gap-3 p-0">
          <li className="flex items-center gap-3">
            <span aria-hidden="true" className="size-4 flex-none rounded-xs bg-brand-chart" />
            <span className="min-w-0">{a.etykieta}</span>
          </li>
          <li className="flex items-center gap-3">
            <span aria-hidden="true" className="size-4 flex-none rounded-xs bg-brand" />
            <span className="min-w-0">{b.etykieta}</span>
          </li>
        </ul>
      </figcaption>
    </figure>
  );
}
