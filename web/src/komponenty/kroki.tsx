import type { ReactNode } from 'react';
import { Ikona, type NazwaIkony } from '@/komponenty/ikona';
import { Karta } from '@/komponenty/karta';
import { Postep } from '@/komponenty/postep';
import { teksty } from '@/teksty';

export type StanKroku = 'gotowe' | 'biezacy' | 'pominiety' | 'oczekuje';

export interface PostepKreatoraProps {
  krok: number;
  liczbaKrokow: number;
  nazwaKroku: string;
  id: string;
  className?: string;
}

export interface KrokiKreatoraProps {
  tytul: string;
  kroki: { etykieta: string; stan: StanKroku }[];
  notatka?: ReactNode;
  id?: string;
  className?: string;
}

export interface ListaKrokowProps {
  kroki: ReactNode[];
  id?: string;
  className?: string;
}

const ikonaStanu: Record<StanKroku, NazwaIkony> = {
  gotowe: 'sukces',
  biezacy: 'krok-biezacy',
  pominiety: 'nie-dotyczy',
  oczekuje: 'kolo',
};

export function PostepKreatora({ krok, liczbaKrokow, nazwaKroku, id, className }: PostepKreatoraProps) {
  const idEtykiety = `${id}-etykieta`;
  return (
    <div id={id} className={['max-w-okno min-w-0', className].filter(Boolean).join(' ')}>
      <p id={idEtykiety} className="m-0 mb-2 text-small-strong text-ink">
        {teksty.wspolne.zlozone.krokZNazwa({ krok, liczbaKrokow, nazwa: nazwaKroku })}
      </p>
      <Postep
        wartosc={krok}
        min={0}
        maks={liczbaKrokow}
        etykieta={teksty.wspolne.zlozone.krokZ({ krok, liczbaKrokow })}
        idEtykiety={idEtykiety}
        tekstWartosci={teksty.wspolne.zlozone.krokZ({ krok, liczbaKrokow })}
      />
    </div>
  );
}

export function KrokiKreatora({ tytul, kroki, notatka, id, className }: KrokiKreatoraProps) {
  return (
    <Karta tytul={tytul} bezLinii as="section" id={id} className={className}>
      <ol role="list" className="m-0 flex list-none flex-col gap-4 p-0">
        {kroki.map((k, i) => {
          const biezacy = k.stan === 'biezacy';
          const opisStanu = teksty.wspolne.zlozone.stanKroku[k.stan];
          return (
            <li
              key={`${k.etykieta}-${i}`}
              aria-current={biezacy ? 'step' : undefined}
              className={['flex items-center gap-3', biezacy ? 'font-semibold' : ''].join(' ')}
            >
              <Ikona nazwa={ikonaStanu[k.stan]} className="text-brand" />
              <span className="min-w-0 flex-1">{k.etykieta}</span>
              {k.stan === 'oczekuje' ? (
                <span className="sr-only">{opisStanu}</span>
              ) : (
                <span className="text-small-strong">{opisStanu}</span>
              )}
            </li>
          );
        })}
      </ol>
      {notatka ? <div className="mt-6">{notatka}</div> : null}
    </Karta>
  );
}

export function ListaKrokow({ kroki, id, className }: ListaKrokowProps) {
  return (
    <ol id={id} role="list" className={['m-0 grid list-none gap-6 p-0', className].filter(Boolean).join(' ')}>
      {kroki.map((k, i) => (
        <li key={i} className="grid grid-cols-[36px_minmax(0,1fr)] items-start gap-x-4">
          <span
            aria-hidden="true"
            className="box-border grid size-day place-items-center rounded-full border border-ink-muted text-ink"
          >
            {i + 1}
          </span>
          <span className="pt-1.5">{k}</span>
        </li>
      ))}
    </ol>
  );
}
