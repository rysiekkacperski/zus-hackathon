import type { FocusEvent, ReactNode } from 'react';
import { Ikona } from '@/komponenty/ikona';
import { teksty } from '@/teksty';

type KodKomunikatu = keyof typeof teksty.komunikaty;

export type BladPolaWartosc = KodKomunikatu | string | null;

export interface AtrybutyPola {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
}

export interface PoleProps {
  id: string;
  etykieta: string;
  podpowiedz?: ReactNode;
  blad?: BladPolaWartosc;
  parametryBledu?: Record<string, string>;
  zwykla?: boolean;
  pomoc?: ReactNode;
  dodatek?: ReactNode;
  wymagane?: boolean;
  className?: string;
  children: (aria: AtrybutyPola) => ReactNode;
}

export interface BladPolaProps {
  id: string;
  kod?: KodKomunikatu;
  parametry?: Record<string, string>;
  tresc?: string;
  className?: string;
}

export interface PodpowiedzPolaProps {
  id: string;
  children: ReactNode;
  className?: string;
}

// Klasy pola wpisu ez-input. Ramka 2 px przy fokusie, a odstęp 11 px zatrzymuje tekst w miejscu.
// Pole z błędem (aria-invalid) ma ramkę 2 px w kolorze ink-strong i tło surface-sunken. Drugi piksel ramki
// rysuje cień wewnętrzny, więc tekst stoi w miejscu, a przy fokusie ramkę 2 px daje już focus:border-2.
export const klasyRamkiPolaWpisu =
  'block w-full min-w-0 box-border m-0 border border-brand rounded-sm bg-surface-card text-ink font-sans text-body placeholder:text-ink-muted focus:outline-none focus:border-2 aria-invalid:border-ink-strong aria-invalid:bg-surface-sunken aria-invalid:shadow-[inset_0_0_0_1px_var(--color-ink-strong)] aria-invalid:focus:shadow-none disabled:cursor-not-allowed disabled:border-line disabled:bg-surface-sunken disabled:text-ink-muted read-only:bg-surface-sunken';

export const klasyPolaWpisu = `h-control ${klasyRamkiPolaWpisu}`;

export const klasyOdstepuPolaWpisu = 'px-3 focus:px-[0.6875rem]';

export const klasySzerokosciPola = {
  pelna: 'w-full',
  srednia: 'w-full max-w-79',
  waska: 'w-full max-w-40',
} as const;

export type SzerokoscPola = keyof typeof klasySzerokosciPola;

function jestKodem(wartosc: string): wartosc is KodKomunikatu {
  return Object.prototype.hasOwnProperty.call(teksty.komunikaty, wartosc);
}

export function trescBledu(blad: string, parametry?: Record<string, string>): string {
  if (!jestKodem(blad)) return blad;
  const wpis: unknown = teksty.komunikaty[blad];
  return typeof wpis === 'function'
    ? (wpis as (p: Record<string, string>) => string)(parametry ?? {})
    : String(wpis);
}

export function idPodpowiedzi(id: string) {
  return `${id}-podpowiedz`;
}

export function idBledu(id: string) {
  return `${id}-blad`;
}

// Wyjście fokusu poza kontener (focusout z celem spoza kontenera), np. poza fieldset grupy wyboru.
export function opuszczonoKontener(e: FocusEvent<HTMLElement>): boolean {
  const cel = e.relatedTarget;
  return !(cel instanceof Node && e.currentTarget.contains(cel));
}

export function polaczOpisy(...ids: (string | false | null | undefined)[]) {
  const wynik = ids.filter(Boolean).join(' ');
  return wynik === '' ? undefined : wynik;
}

export function BladPola({ id, kod, parametry, tresc, className }: BladPolaProps) {
  const tekst = kod ? trescBledu(kod, parametry) : (tresc ?? '');
  return (
    <p
      id={id}
      className={['mt-1 mb-0 flex items-start gap-2 font-semibold text-ink-strong', className]
        .filter(Boolean)
        .join(' ')}
    >
      <Ikona nazwa="blad" rozmiar={20} className="mt-0.5" />
      <span className="min-w-0">
        {teksty.wspolne.prefiksBledu} {tekst}
      </span>
    </p>
  );
}

export function PodpowiedzPola({ id, children, className }: PodpowiedzPolaProps) {
  return (
    <div id={id} className={['m-0 mb-2 min-w-0', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

export function Pole({
  id,
  etykieta,
  podpowiedz,
  blad,
  parametryBledu,
  zwykla,
  pomoc,
  dodatek,
  wymagane,
  className,
  children,
}: PoleProps) {
  const maBlad = Boolean(blad);
  const aria: AtrybutyPola = {
    id,
    'aria-describedby': polaczOpisy(podpowiedz ? idPodpowiedzi(id) : null, maBlad ? idBledu(id) : null),
    ...(maBlad ? { 'aria-invalid': true as const } : {}),
    ...(wymagane ? { 'aria-required': true as const } : {}),
  };

  return (
    <div className={['grid min-w-0 gap-1', className].filter(Boolean).join(' ')}>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <label
          htmlFor={id}
          className={zwykla ? 'min-w-0 font-normal text-ink' : 'min-w-0 font-semibold text-ink'}
        >
          {etykieta}
        </label>
        {pomoc ? <span className="inline-flex text-brand">{pomoc}</span> : null}
      </div>
      {podpowiedz ? <PodpowiedzPola id={idPodpowiedzi(id)}>{podpowiedz}</PodpowiedzPola> : null}
      {children(aria)}
      {blad ? <BladPola id={idBledu(id)} tresc={trescBledu(blad, parametryBledu)} /> : null}
      {dodatek ? <div className="mt-2 min-w-0 justify-self-end">{dodatek}</div> : null}
    </div>
  );
}
