'use client';

import { useState, type ChangeEvent, type ReactNode } from 'react';
import { Ikona } from '@/komponenty/ikona';
import {
  Pole,
  klasyOdstepuPolaWpisu,
  klasyPolaWpisu,
  klasyRamkiPolaWpisu,
  klasySzerokosciPola,
  opuszczonoKontener,
  polaczOpisy,
  type AtrybutyPola,
  type BladPolaWartosc,
  type SzerokoscPola,
} from '@/komponenty/pole';
import { teksty } from '@/teksty';

interface WspolnePolaWpisu {
  id: string;
  etykieta: string;
  podpowiedz?: ReactNode;
  blad?: BladPolaWartosc;
  parametryBledu?: Record<string, string>;
  wartosc: string;
  onZmiana: (wartosc: string) => void;
  onOpuszczenie?: () => void;
  szerokosc?: SzerokoscPola;
  wylaczone?: boolean;
  tylkoDoOdczytu?: boolean;
  autoComplete?: string;
  maksDlugosc?: number;
  nazwa?: string;
  wymagane?: boolean;
  zwykla?: boolean;
  pomoc?: ReactNode;
  dodatek?: ReactNode;
  placeholder?: string;
  className?: string;
}

export interface PoleTekstoweProps extends WspolnePolaWpisu {
  inputMode?: 'text' | 'numeric' | 'decimal' | 'email' | 'tel';
  typ?: 'text' | 'email' | 'tel';
}
export type PoleDatyProps = WspolnePolaWpisu;
export interface PoleKwotyProps extends WspolnePolaWpisu {
  jednostka?: string;
}
export interface PoleLiczbyProps extends WspolnePolaWpisu {
  jednostka?: string;
}
export type PoleHaslaProps = WspolnePolaWpisu;
export interface PoleTekstuDlugiegoProps extends WspolnePolaWpisu {
  wiersze?: number;
  licznik?: { maks: number };
}

type PrzekazanePola = Omit<WspolnePolaWpisu, 'szerokosc' | 'wartosc' | 'onZmiana'>;

function OprawaPola({
  props,
  children,
}: {
  props: PrzekazanePola;
  children: (aria: AtrybutyPola) => ReactNode;
}) {
  return (
    <Pole
      id={props.id}
      etykieta={props.etykieta}
      podpowiedz={props.podpowiedz}
      blad={props.blad}
      parametryBledu={props.parametryBledu}
      wymagane={props.wymagane}
      zwykla={props.zwykla}
      pomoc={props.pomoc}
      dodatek={props.dodatek}
      className={props.className}
    >
      {children}
    </Pole>
  );
}

function atrybutyWpisu(props: WspolnePolaWpisu) {
  return {
    name: props.nazwa,
    value: props.wartosc,
    onChange: (e: ChangeEvent<HTMLInputElement>) => props.onZmiana(e.target.value),
    onBlur: props.onOpuszczenie,
    disabled: props.wylaczone,
    readOnly: props.tylkoDoOdczytu,
    maxLength: props.maksDlugosc,
    placeholder: props.placeholder,
  };
}

export function PoleTekstowe(props: PoleTekstoweProps) {
  const { szerokosc = 'pelna', typ = 'text', inputMode, autoComplete } = props;
  return (
    <OprawaPola props={props}>
      {(aria) => (
        <input
          {...aria}
          {...atrybutyWpisu(props)}
          type={typ}
          inputMode={inputMode}
          autoComplete={autoComplete}
          className={`${klasyPolaWpisu} ${klasyOdstepuPolaWpisu} ${klasySzerokosciPola[szerokosc]}`}
        />
      )}
    </OprawaPola>
  );
}

export function PoleDaty(props: PoleDatyProps) {
  const { szerokosc = 'srednia', autoComplete = 'off', podpowiedz = teksty.wspolne.pola.podpowiedzDaty } = props;
  return (
    <OprawaPola props={{ ...props, podpowiedz }}>
      {(aria) => (
        <input
          {...aria}
          {...atrybutyWpisu(props)}
          type="text"
          inputMode="numeric"
          autoComplete={autoComplete}
          className={`${klasyPolaWpisu} ${klasyOdstepuPolaWpisu} ${klasySzerokosciPola[szerokosc]}`}
        />
      )}
    </OprawaPola>
  );
}

function PoleZJednostka({
  props,
  jednostka,
  inputMode,
}: {
  props: WspolnePolaWpisu;
  jednostka?: string;
  inputMode: 'decimal' | 'numeric';
}) {
  const { szerokosc = 'srednia', autoComplete = 'off' } = props;
  const idJednostki = `${props.id}-jednostka`;
  return (
    <OprawaPola props={props}>
      {(aria) => (
        <div className="flex min-w-0 items-center gap-3">
          <input
            {...aria}
            {...atrybutyWpisu(props)}
            aria-describedby={polaczOpisy(aria['aria-describedby'], jednostka ? idJednostki : null)}
            type="text"
            inputMode={inputMode}
            autoComplete={autoComplete}
            className={`${klasyPolaWpisu} ${klasyOdstepuPolaWpisu} ${klasySzerokosciPola[szerokosc]}`}
          />
          {jednostka ? (
            <span id={idJednostki} className="shrink-0">
              {jednostka}
            </span>
          ) : null}
        </div>
      )}
    </OprawaPola>
  );
}

export function PoleKwoty({ jednostka = teksty.wspolne.zl, ...props }: PoleKwotyProps) {
  return <PoleZJednostka props={props} jednostka={jednostka} inputMode="decimal" />;
}

export function PoleLiczby({ jednostka, ...props }: PoleLiczbyProps) {
  return <PoleZJednostka props={props} jednostka={jednostka} inputMode="numeric" />;
}

export function PoleHasla(props: PoleHaslaProps) {
  const { szerokosc = 'pelna', autoComplete = 'off' } = props;
  const [widoczne, setWidoczne] = useState(false);
  return (
    <OprawaPola props={props}>
      {(aria) => (
        <span
          className={`relative block ${klasySzerokosciPola[szerokosc]}`}
          onBlur={(e) => {
            // Przejście fokusu z pola na przycisk pokaż hasło nie jest opuszczeniem pola.
            if (props.onOpuszczenie && opuszczonoKontener(e)) props.onOpuszczenie();
          }}
        >
          <input
            {...aria}
            {...atrybutyWpisu(props)}
            onBlur={undefined}
            type={widoczne ? 'text' : 'password'}
            autoComplete={autoComplete}
            className={`${klasyPolaWpisu} pl-3 pr-13 focus:pl-[0.6875rem]`}
          />
          <button
            type="button"
            aria-label={teksty.wspolne.pola.pokazHaslo}
            aria-pressed={widoczne}
            aria-controls={props.id}
            disabled={props.wylaczone}
            onClick={() => setWidoczne((v) => !v)}
            className="absolute top-1/2 right-2 grid size-day -translate-y-1/2 cursor-pointer place-items-center rounded-sm border-0 bg-transparent p-0 text-brand transition-colors duration-150 hover:bg-brand-tint hover:text-brand-deep aria-pressed:bg-brand-tint motion-reduce:transition-none disabled:cursor-not-allowed disabled:text-ink-muted"
          >
            <Ikona nazwa="podglad" />
          </button>
        </span>
      )}
    </OprawaPola>
  );
}

export function PoleTekstuDlugiego(props: PoleTekstuDlugiegoProps) {
  const { szerokosc = 'pelna', wiersze = 4, licznik, autoComplete = 'off' } = props;
  const maks = licznik?.maks ?? props.maksDlugosc;
  const idLicznika = `${props.id}-licznik`;
  const dodatek = licznik ? (
    <p id={idLicznika} aria-live="polite" className="m-0 text-small text-ink-muted">
      {teksty.wspolne.pola.liczbaZnakow({
        liczba: String(props.wartosc.length),
        maks: String(licznik.maks),
      })}
    </p>
  ) : (
    props.dodatek
  );
  return (
    <OprawaPola props={{ ...props, dodatek }}>
      {(aria) => (
        <textarea
          {...aria}
          name={props.nazwa}
          value={props.wartosc}
          onChange={(e) => props.onZmiana(e.target.value)}
          onBlur={props.onOpuszczenie}
          disabled={props.wylaczone}
          readOnly={props.tylkoDoOdczytu}
          maxLength={maks}
          placeholder={props.placeholder}
          rows={wiersze}
          autoComplete={autoComplete}
          className={`${klasyRamkiPolaWpisu} min-h-control resize-y px-3 py-2.5 focus:px-[0.6875rem] focus:py-[0.5625rem] ${klasySzerokosciPola[szerokosc]}`}
        />
      )}
    </OprawaPola>
  );
}
