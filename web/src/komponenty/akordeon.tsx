'use client';

import { useState, type ReactNode } from 'react';
import { Ikona } from '@/komponenty/ikona';

export interface AkordeonProps {
  naglowek: ReactNode;
  domyslnieOtwarty?: boolean;
  children: ReactNode;
  id: string;
  className?: string;
}

export interface ListaAkordeonowaProps {
  elementy: { id: string; naglowek: ReactNode; tresc: ReactNode }[];
  otwarte?: string[];
  id?: string;
  className?: string;
}

interface ElementAkordeonuProps {
  id: string;
  naglowek: ReactNode;
  otwarty: boolean;
  onPrzelacz: () => void;
  children: ReactNode;
  wLiscie: boolean;
}

function ElementAkordeonu({ id, naglowek, otwarty, onPrzelacz, children, wLiscie }: ElementAkordeonuProps) {
  const idPanelu = `${id}-panel`;
  const idPrzycisku = `${id}-przycisk`;
  return (
    <>
      <button
        type="button"
        id={idPrzycisku}
        aria-expanded={otwarty}
        aria-controls={idPanelu}
        onClick={onPrzelacz}
        className={[
          'flex w-full cursor-pointer items-center justify-between gap-4 border-0 bg-transparent text-left text-body font-semibold text-brand hover:text-brand-deep hover:underline',
          wLiscie ? 'min-h-row px-4 py-3' : 'py-3',
        ].join(' ')}
      >
        <span className="min-w-0">{naglowek}</span>
        <Ikona nazwa="w-dol" className={otwarty ? 'rotate-180' : undefined} />
      </button>
      <div id={idPanelu} role="region" aria-labelledby={idPrzycisku} hidden={!otwarty} className="px-5 pt-3 pb-5">
        {children}
      </div>
    </>
  );
}

export function Akordeon({ naglowek, domyslnieOtwarty = false, children, id, className }: AkordeonProps) {
  const [otwarty, ustawOtwarty] = useState(domyslnieOtwarty);
  return (
    <div className={['min-w-0', className].filter(Boolean).join(' ')}>
      <ElementAkordeonu
        id={id}
        naglowek={naglowek}
        otwarty={otwarty}
        onPrzelacz={() => ustawOtwarty((o) => !o)}
        wLiscie={false}
      >
        {children}
      </ElementAkordeonu>
    </div>
  );
}

export function ListaAkordeonowa({ elementy, otwarte = [], id, className }: ListaAkordeonowaProps) {
  const [otwartePozycje, ustawOtwartePozycje] = useState<string[]>(otwarte);
  function przelacz(idElementu: string) {
    ustawOtwartePozycje((obecne) =>
      obecne.includes(idElementu) ? obecne.filter((x) => x !== idElementu) : [...obecne, idElementu],
    );
  }
  return (
    <ul id={id} role="list" className={['m-0 list-none p-0', className].filter(Boolean).join(' ')}>
      {elementy.map((e) => (
        <li key={e.id} className="border-b border-line-row">
          <ElementAkordeonu
            id={e.id}
            naglowek={e.naglowek}
            otwarty={otwartePozycje.includes(e.id)}
            onPrzelacz={() => przelacz(e.id)}
            wLiscie
          >
            {e.tresc}
          </ElementAkordeonu>
        </li>
      ))}
    </ul>
  );
}
