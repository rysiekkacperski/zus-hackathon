import type React from 'react';
import { Ikona, type NazwaIkony } from '@/komponenty/ikona';
import { etykieta, formatujDate } from '@/komponenty/format';
import type { DataISO, ZrodloDanej } from '@/domena/typy/wspolne';
import type { StatusSprawy as WartoscStatusuSprawy, ZrodloStatusu } from '@/domena/typy/plan';
import { teksty } from '@/teksty';

export interface ZnaczekProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export interface StatusSprawyProps {
  status: WartoscStatusuSprawy;
  zrodlo?: ZrodloStatusu;
  data?: DataISO;
  id?: string;
  className?: string;
}

export interface ZnacznikZrodlaProps {
  zrodlo: ZrodloDanej | 'profil-rodziny' | 'przykladowa-sprawa' | 'wartosc-w-kalkulatorze' | 'wartosc-domyslna';
  id?: string;
  className?: string;
}

// oznaczenie treści z mechanizmu AI
export interface ZnacznikAIProps {
  children?: React.ReactNode;
  id?: string;
  className?: string;
}

function polacz(...klasy: (string | undefined)[]) {
  return klasy.filter(Boolean).join(' ');
}

// ez-badge: pigułka 28 px w kolorze brand z tekstem 14/20.
export function Znaczek({ children, id, className }: ZnaczekProps) {
  return (
    <span
      id={id}
      className={polacz(
        'inline-flex min-h-7 max-w-full items-center rounded-full bg-brand px-3 text-small text-on-brand',
        className,
      )}
    >
      {children}
    </span>
  );
}

const ikonyStatusu: Record<WartoscStatusuSprawy, NazwaIkony> = {
  'do-zrobienia': 'kolo',
  zlozona: 'plik-zlozony',
  zalatwiona: 'sukces',
  'wymaga-uzupelnienia-profilu': 'uwaga',
};

// Wiersz statusu ze wzorów: ikona 20 px w kolorze brand i pogrubiona nazwa statusu, pod nią źródło i data.
export function StatusSprawy({ status, zrodlo, data, id, className }: StatusSprawyProps) {
  return (
    <span id={id} className={polacz('inline-flex min-w-0 flex-col gap-1', className)}>
      <span className="inline-flex items-center gap-2 font-semibold text-ink-strong">
        <Ikona nazwa={ikonyStatusu[status]} rozmiar={20} className="text-brand" />
        {etykieta(teksty.wspolne.etykiety.statusySpraw, status)}
      </span>
      {zrodlo || data ? (
        <span className="text-small text-ink">
          {zrodlo ? etykieta(teksty.wspolne.etykiety.zrodlaStatusu, zrodlo) : null}
          {zrodlo && data ? ' ' : null}
          {data ? teksty.wspolne.zDnia({ data: formatujDate(data) }) : null}
        </span>
      ) : null}
    </span>
  );
}

// „Z konta ZUS” i pozostałe oznaczenia pochodzenia wartości, tekst 14/20 pogrubiony.
export function ZnacznikZrodla({ zrodlo, id, className }: ZnacznikZrodlaProps) {
  return (
    <span id={id} className={polacz('text-small-strong text-ink', className)}>
      {etykieta(teksty.wspolne.etykiety.zrodlaDanych, zrodlo)}
    </span>
  );
}

export function ZnacznikAI({ children, id, className }: ZnacznikAIProps) {
  return (
    <span id={id} className={polacz('inline-flex items-center gap-1 text-small text-ink-muted', className)}>
      <Ikona nazwa="iskry-ai" rozmiar={16} className="text-brand" />
      {children ?? teksty.wspolne.trescAI}
    </span>
  );
}
