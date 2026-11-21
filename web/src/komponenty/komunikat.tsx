import type React from 'react';
import { Ikona, type NazwaIkony } from '@/komponenty/ikona';
import {
  trescKomunikatu,
  typKomunikatu,
  type ParametryKomunikatu,
  type TypKomunikatu,
} from '@/komponenty/typy-komunikatow';
import type { KodKomunikatu } from '@/domena/typy/komunikaty';
import { teksty } from '@/teksty';

export type { ParametryKomunikatu, TypKomunikatu };
export { typKomunikatu };

export interface KomunikatProps<K extends KodKomunikatu = KodKomunikatu> {
  kod?: K;
  parametry?: ParametryKomunikatu<K>;
  tresc?: React.ReactNode;
  // domyślnie typ z tablicy komunikatów, a bez kodu INFO
  typ?: TypKomunikatu;
  akcje?: React.ReactNode;
  bezPrefiksu?: boolean;
  id?: string;
  className?: string;
}

const wyglad: Record<TypKomunikatu, { ikona: NazwaIkony; prefiks: string }> = {
  ERROR: { ikona: 'blad', prefiks: teksty.wspolne.prefiksy.ERROR },
  WARNING: { ikona: 'uwaga', prefiks: teksty.wspolne.prefiksy.WARNING },
  INFO: { ikona: 'info', prefiks: teksty.wspolne.prefiksy.INFO },
  SUCCESS: { ikona: 'sukces', prefiks: teksty.wspolne.prefiksy.SUCCESS },
};

// Baner komunikatu ze wzorów: tło brand-wash, ramka line, ikona brand, pogrubiony prefiks.
export function Komunikat<K extends KodKomunikatu = KodKomunikatu>({
  kod,
  parametry,
  tresc,
  typ,
  akcje,
  bezPrefiksu = false,
  id,
  className,
}: KomunikatProps<K>) {
  const typBiezacy: TypKomunikatu = typ ?? (kod ? typKomunikatu[kod] : 'INFO');
  const { ikona, prefiks } = wyglad[typBiezacy];
  const zawartosc = tresc ?? (kod ? trescKomunikatu(kod, parametry) : null);
  const naglowekTresci = bezPrefiksu ? null : <strong className="font-semibold text-ink-strong">{prefiks}</strong>;

  return (
    <div
      id={id}
      role={typBiezacy === 'ERROR' ? 'alert' : 'status'}
      className={[
        'box-border flex min-w-0 items-start gap-3 rounded-sm border border-line bg-brand-wash px-5 py-4 text-ink',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Ikona nazwa={ikona} className="text-brand" />
      <div className="min-w-0 flex-1">
        {typeof zawartosc === 'string' ? (
          <p className="m-0">
            {naglowekTresci}
            {naglowekTresci ? ' ' : null}
            {zawartosc}
          </p>
        ) : (
          <div className="[&_p]:m-0">
            {naglowekTresci}
            {naglowekTresci ? ' ' : null}
            {zawartosc}
          </div>
        )}
        {akcje ? <div className="mt-3 flex flex-wrap items-center gap-4">{akcje}</div> : null}
      </div>
    </div>
  );
}
