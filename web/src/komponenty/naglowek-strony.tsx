'use client';

import { createContext, use } from 'react';
import type React from 'react';
import { Komunikat } from '@/komponenty/komunikat';
import { LinkPowrotu } from '@/komponenty/link-powrotu';
import { formatujDate } from '@/komponenty/format';
import { trescKomunikatu } from '@/komponenty/typy-komunikatow';
import type { DataISO } from '@/domena/typy/wspolne';
import type { KodKomunikatu } from '@/domena/typy/komunikaty';
import { teksty } from '@/teksty';

export interface NaglowekStronyProps {
  tytul: string;
  wstep?: React.ReactNode;
  // „Stan na DD.MM.RRRR”
  stanNa?: DataISO;
  akcje?: React.ReactNode;
  // false ukrywa link powrotu; bez href cel wyznacza LinkPowrotu
  powrot?: { href?: string; etykieta?: string } | false;
  // page-title-home
  stronaGlowna?: boolean;
  bezKomunikatowPoPrzejsciu?: boolean;
  id?: string;
  className?: string;
}

// Komunikat po przejściu do pokazania pod nagłówkiem bieżącego widoku (sekcja 6.8 kontraktu).
export interface KomunikatDoPokazania {
  kod: KodKomunikatu;
  parametry?: Record<string, string>;
}

// Dostawca w ramie aplikacji przekazuje komunikaty po przejściu przeznaczone dla bieżącego widoku.
export const KontekstKomunikatowPoPrzejsciu = createContext<readonly KomunikatDoPokazania[]>([]);

const klasyTytulu = {
  zwykly: 'm-0 min-w-0 break-words text-page-title text-ink',
  glowny: 'm-0 min-w-0 break-words text-page-title-home text-ink',
} as const;

// ez-pagehead: link powrotu, tytuł h1, wstęp i akcje wyrównane do dołu po prawej.
export function NaglowekStrony({
  tytul,
  wstep,
  stanNa,
  akcje,
  powrot,
  stronaGlowna = false,
  bezKomunikatowPoPrzejsciu = false,
  id,
  className,
}: NaglowekStronyProps) {
  const komunikaty = use(KontekstKomunikatowPoPrzejsciu);
  const pokazKomunikaty = !bezKomunikatowPoPrzejsciu && komunikaty.length > 0;

  return (
    <div id={id} className={['box-border max-w-tresc pt-4 pb-7.5 md:pt-10', className].filter(Boolean).join(' ')}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex min-w-0 flex-col items-start gap-4">
          {powrot === false ? null : <LinkPowrotu href={powrot?.href}>{powrot?.etykieta}</LinkPowrotu>}
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className={stronaGlowna ? klasyTytulu.glowny : klasyTytulu.zwykly}>{tytul}</h1>
            {stanNa ? <p className="m-0 text-body">{teksty.wspolne.stanNa({ data: formatujDate(stanNa) })}</p> : null}
            {wstep === undefined || wstep === null ? null : typeof wstep === 'string' ? (
              <p className="m-0 text-body">{wstep}</p>
            ) : (
              <div className="text-body [&_p]:m-0">{wstep}</div>
            )}
          </div>
        </div>
        {akcje ? <div className="flex flex-wrap items-center gap-4">{akcje}</div> : null}
      </div>
      {pokazKomunikaty ? (
        <div className="mt-7.5 flex flex-col gap-4">
          {komunikaty.map((komunikat) => (
            <Komunikat
              key={komunikat.kod}
              kod={komunikat.kod}
              tresc={trescKomunikatu(komunikat.kod, komunikat.parametry)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
