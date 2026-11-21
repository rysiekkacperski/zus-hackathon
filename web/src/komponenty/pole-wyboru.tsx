'use client';

import type { ReactNode } from 'react';
import { Ikona } from '@/komponenty/ikona';
import { Pole, klasyPolaWpisu, klasySzerokosciPola, type BladPolaWartosc } from '@/komponenty/pole';
import { teksty } from '@/teksty';

export interface OpcjaWyboru<W extends string = string> {
  wartosc: W;
  etykieta: string;
  wylaczona?: boolean;
}

export interface PoleWyboruProps<W extends string = string> {
  id: string;
  etykieta: string;
  opcje: OpcjaWyboru<W>[];
  wartosc: W | '';
  onZmiana: (w: W | '') => void;
  /** Opuszczenie pola i wybór opcji: walidacja po opuszczeniu (useWalidacjaNaBiezaco). */
  onOpuszczenie?: () => void;
  pustaOpcja?: string;
  podpowiedz?: ReactNode;
  blad?: BladPolaWartosc;
  parametryBledu?: Record<string, string>;
  szerokosc?: 'pelna' | 'srednia';
  wylaczone?: boolean;
  nazwa?: string;
  wymagane?: boolean;
  zwykla?: boolean;
  className?: string;
}

export function PoleWyboru<W extends string = string>({
  id,
  etykieta,
  opcje,
  wartosc,
  onZmiana,
  onOpuszczenie,
  pustaOpcja,
  podpowiedz,
  blad,
  parametryBledu,
  szerokosc = 'pelna',
  wylaczone,
  nazwa,
  wymagane,
  zwykla,
  className,
}: PoleWyboruProps<W>) {
  const pokazPusta = pustaOpcja !== undefined || wartosc === '';
  return (
    <Pole
      id={id}
      etykieta={etykieta}
      podpowiedz={podpowiedz}
      blad={blad}
      parametryBledu={parametryBledu}
      wymagane={wymagane}
      zwykla={zwykla}
      className={className}
    >
      {(aria) => (
        <span className={`relative block ${klasySzerokosciPola[szerokosc]}`}>
          <select
            {...aria}
            name={nazwa}
            value={wartosc}
            disabled={wylaczone}
            onChange={(e) => {
              onZmiana(e.target.value as W | '');
              onOpuszczenie?.();
            }}
            onBlur={onOpuszczenie}
            className={`${klasyPolaWpisu} cursor-pointer appearance-none pr-12 pl-3 focus:pr-[2.9375rem] focus:pl-[0.6875rem]`}
          >
            {pokazPusta ? <option value="">{pustaOpcja ?? teksty.wspolne.pola.wybierzZListy}</option> : null}
            {opcje.map((opcja) => (
              <option key={opcja.wartosc} value={opcja.wartosc} disabled={opcja.wylaczona}>
                {opcja.etykieta}
              </option>
            ))}
          </select>
          <Ikona
            nazwa="w-dol"
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-brand"
          />
        </span>
      )}
    </Pole>
  );
}
