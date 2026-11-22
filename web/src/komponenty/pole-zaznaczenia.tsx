'use client';

import { useId, type ReactNode } from 'react';
import type { OpcjaGrupy } from '@/komponenty/grupa-opcji';
import {
  BladPola,
  idBledu,
  opuszczonoKontener,
  polaczOpisy,
  trescBledu,
  type BladPolaWartosc,
} from '@/komponenty/pole';

export interface PoleZaznaczeniaProps {
  id: string;
  etykieta: ReactNode;
  zaznaczone: boolean;
  onZmiana: (z: boolean) => void;
  /** Opuszczenie pola i zmiana zaznaczenia: walidacja po opuszczeniu (useWalidacjaNaBiezaco). */
  onOpuszczenie?: () => void;
  opis?: ReactNode;
  blad?: BladPolaWartosc;
  parametryBledu?: Record<string, string>;
  /** aria-invalid bez własnego komunikatu, gdy błąd pokazuje grupa (GrupaZaznaczen). */
  nieprawidlowe?: boolean;
  wylaczone?: boolean;
  nazwa?: string;
  className?: string;
}

export interface GrupaZaznaczenProps<W extends string = string> {
  legenda: string;
  opcje: OpcjaGrupy<W>[];
  wartosci: W[];
  onZmiana: (w: W[]) => void;
  /** Wyjście fokusu poza grupę i zmiana zaznaczenia: walidacja po opuszczeniu (useWalidacjaNaBiezaco). */
  onOpuszczenie?: () => void;
  blad?: BladPolaWartosc;
  parametryBledu?: Record<string, string>;
  legendaUkryta?: boolean;
  id?: string;
  className?: string;
}

// Kwadrat ez-check: 20 px, ramka brand, po zaznaczeniu tło brand i znacznik rysowany pseudoelementem.
export const klasyKwadratuZaznaczenia =
  "m-0 mt-0.5 grid size-5 flex-none cursor-pointer appearance-none place-items-center rounded-xs border border-brand bg-surface-card checked:bg-brand checked:after:h-[0.3125rem] checked:after:w-2.5 checked:after:-translate-y-px checked:after:-rotate-45 checked:after:border-0 checked:after:border-b-2 checked:after:border-l-2 checked:after:border-solid checked:after:border-on-brand checked:after:content-[''] aria-invalid:border-2 aria-invalid:border-ink-strong aria-invalid:checked:bg-ink-strong disabled:cursor-not-allowed disabled:border-line disabled:bg-surface-sunken";

export const klasyEtykietyZaznaczenia = {
  aktywna: 'inline-flex min-w-0 cursor-pointer items-start gap-3',
  wylaczona: 'inline-flex min-w-0 cursor-not-allowed items-start gap-3 text-ink-muted',
} as const;

export function PoleZaznaczenia({
  id,
  etykieta,
  zaznaczone,
  onZmiana,
  onOpuszczenie,
  opis,
  blad,
  parametryBledu,
  nieprawidlowe,
  wylaczone,
  nazwa,
  className,
}: PoleZaznaczeniaProps) {
  const idOpisu = `${id}-opis`;
  const maBlad = Boolean(blad);
  return (
    <div className={['min-w-0', className].filter(Boolean).join(' ')}>
      <label htmlFor={id} className={klasyEtykietyZaznaczenia[wylaczone ? 'wylaczona' : 'aktywna']}>
        <input
          id={id}
          type="checkbox"
          name={nazwa}
          checked={zaznaczone}
          disabled={wylaczone}
          aria-invalid={maBlad || nieprawidlowe ? true : undefined}
          aria-describedby={polaczOpisy(opis ? idOpisu : null, maBlad ? idBledu(id) : null)}
          onChange={(e) => {
            onZmiana(e.target.checked);
            onOpuszczenie?.();
          }}
          onBlur={onOpuszczenie}
          className={klasyKwadratuZaznaczenia}
        />
        <span className="min-w-0">{etykieta}</span>
      </label>
      {opis ? (
        <div id={idOpisu} className="mt-1 ml-8 min-w-0">
          {opis}
        </div>
      ) : null}
      {blad ? <BladPola id={idBledu(id)} tresc={trescBledu(blad, parametryBledu)} /> : null}
    </div>
  );
}

export function GrupaZaznaczen<W extends string = string>({
  legenda,
  opcje,
  wartosci,
  onZmiana,
  onOpuszczenie,
  blad,
  parametryBledu,
  legendaUkryta,
  id,
  className,
}: GrupaZaznaczenProps<W>) {
  const idZapasowy = useId();
  const idGrupy = id ?? idZapasowy;
  const maBlad = Boolean(blad);

  function przelacz(wartosc: W, zaznaczone: boolean) {
    const zbior = new Set(wartosci);
    if (zaznaczone) zbior.add(wartosc);
    else zbior.delete(wartosc);
    onZmiana(opcje.map((o) => o.wartosc).filter((w) => zbior.has(w)));
    onOpuszczenie?.();
  }

  return (
    <fieldset
      id={id}
      onBlur={(e) => {
        if (onOpuszczenie && opuszczonoKontener(e)) onOpuszczenie();
      }}
      aria-describedby={maBlad ? idBledu(idGrupy) : undefined}
      className={['m-0 min-w-0 border-0 p-0', className].filter(Boolean).join(' ')}
    >
      <legend className={legendaUkryta ? 'sr-only' : 'm-0 mb-3 p-0 text-body-strong'}>{legenda}</legend>
      <div className="flex flex-col gap-3">
        {opcje.map((opcja) => (
          <PoleZaznaczenia
            key={opcja.wartosc}
            id={`${idGrupy}-${opcja.wartosc}`}
            etykieta={
              opcja.znacznik ? (
                <>
                  {opcja.etykieta} <span className="text-small-strong">{opcja.znacznik}</span>
                </>
              ) : (
                opcja.etykieta
              )
            }
            opis={opcja.opis}
            zaznaczone={wartosci.includes(opcja.wartosc)}
            wylaczone={opcja.wylaczona}
            nieprawidlowe={maBlad}
            onZmiana={(z) => przelacz(opcja.wartosc, z)}
          />
        ))}
      </div>
      {blad ? <BladPola id={idBledu(idGrupy)} tresc={trescBledu(blad, parametryBledu)} /> : null}
    </fieldset>
  );
}
