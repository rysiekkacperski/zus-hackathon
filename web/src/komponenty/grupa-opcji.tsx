'use client';

import type { ReactNode } from 'react';
import {
  BladPola,
  PodpowiedzPola,
  idBledu,
  idPodpowiedzi,
  polaczOpisy,
  trescBledu,
  type BladPolaWartosc,
} from '@/komponenty/pole';

export interface OpcjaGrupy<W extends string = string> {
  wartosc: W;
  etykieta: string;
  opis?: ReactNode;
  znacznik?: string;
  wylaczona?: boolean;
}

export interface GrupaOpcjiProps<W extends string = string> {
  nazwa: string;
  legenda: string;
  legendaUkryta?: boolean;
  opcje: OpcjaGrupy<W>[];
  wartosc: W | null;
  onZmiana: (w: W) => void;
  podpowiedz?: ReactNode;
  blad?: BladPolaWartosc;
  parametryBledu?: Record<string, string>;
  uklad?: 'karty' | 'proste' | 'poziomo';
  id?: string;
  className?: string;
}

// Identyfikator pierwszej opcji grupy, do ustawienia fokusu po nieudanym wysłaniu formularza.
export function idOpcjiGrupy(nazwa: string, wartosc: string) {
  return `${nazwa}-${wartosc}`;
}

const klasyListy = {
  karty: 'flex flex-col gap-3',
  poziomo: 'flex flex-wrap gap-3',
  proste: 'flex flex-col gap-3',
} as const;

const klasyKarty = {
  zaznaczona:
    'flex min-w-0 cursor-pointer items-center gap-3 box-border min-h-control rounded-sm border-2 border-brand bg-brand-wash px-[15px] py-[7px] font-semibold',
  niezaznaczona:
    'flex min-w-0 cursor-pointer items-center gap-3 box-border min-h-control rounded-sm border border-brand bg-surface-card px-4 py-2 transition-colors duration-150 hover:bg-brand-wash motion-reduce:transition-none',
  wylaczona:
    'flex min-w-0 cursor-not-allowed items-center gap-3 box-border min-h-control rounded-sm border border-line bg-surface-sunken px-4 py-2 text-ink-muted',
} as const;

const klasyPoziomo = 'grow-0 shrink basis-66';

const klasyProstej = {
  aktywna: 'inline-flex min-w-0 cursor-pointer items-start gap-3',
  wylaczona: 'inline-flex min-w-0 cursor-not-allowed items-start gap-3 text-ink-muted',
} as const;

export function GrupaOpcji<W extends string = string>({
  nazwa,
  legenda,
  legendaUkryta,
  opcje,
  wartosc,
  onZmiana,
  podpowiedz,
  blad,
  parametryBledu,
  uklad = 'karty',
  id,
  className,
}: GrupaOpcjiProps<W>) {
  const idGrupy = id ?? nazwa;
  const maBlad = Boolean(blad);

  return (
    <fieldset
      id={id}
      aria-describedby={polaczOpisy(podpowiedz ? idPodpowiedzi(idGrupy) : null, maBlad ? idBledu(idGrupy) : null)}
      className={['m-0 min-w-0 border-0 p-0', className].filter(Boolean).join(' ')}
    >
      <legend className={legendaUkryta ? 'sr-only' : 'm-0 mb-3 p-0 text-body-strong'}>{legenda}</legend>
      {podpowiedz ? <PodpowiedzPola id={idPodpowiedzi(idGrupy)}>{podpowiedz}</PodpowiedzPola> : null}
      <div className={klasyListy[uklad]}>
        {opcje.map((opcja) => {
          const idOpcji = idOpcjiGrupy(nazwa, opcja.wartosc);
          const idOpisu = `${idOpcji}-opis`;
          const zaznaczona = opcja.wartosc === wartosc;
          const klasyEtykiety =
            uklad === 'proste'
              ? klasyProstej[opcja.wylaczona ? 'wylaczona' : 'aktywna']
              : `${klasyKarty[opcja.wylaczona ? 'wylaczona' : zaznaczona ? 'zaznaczona' : 'niezaznaczona']}${uklad === 'poziomo' ? ` ${klasyPoziomo}` : ''}`;
          return (
            <label key={opcja.wartosc} htmlFor={idOpcji} className={klasyEtykiety}>
              <input
                id={idOpcji}
                type="radio"
                name={nazwa}
                value={opcja.wartosc}
                checked={zaznaczona}
                disabled={opcja.wylaczona}
                aria-describedby={opcja.opis ? idOpisu : undefined}
                onChange={() => onZmiana(opcja.wartosc)}
                className={uklad === 'proste' ? 'm-0 mt-0.5 size-5 flex-none accent-brand' : 'm-0 size-5 flex-none accent-brand'}
              />
              <span className="min-w-0 flex-1">
                <span className="block">{opcja.etykieta}</span>
                {opcja.opis ? (
                  <span id={idOpisu} className="block text-small font-normal">
                    {opcja.opis}
                  </span>
                ) : null}
              </span>
              {opcja.znacznik ? <span className="shrink-0 text-small-strong">{opcja.znacznik}</span> : null}
            </label>
          );
        })}
      </div>
      {blad ? <BladPola id={idBledu(idGrupy)} tresc={trescBledu(blad, parametryBledu)} /> : null}
    </fieldset>
  );
}
