import { Ikona } from '@/komponenty/ikona';
import { Postep } from '@/komponenty/postep';
import { teksty } from '@/teksty';

export interface KodQrZastepczyProps {
  opis: string;
  pozostaloSekund?: number;
  waznoscSekund?: number;
  id?: string;
  className?: string;
}

export interface OdliczanieProps {
  doKonca: number;
  razem: number;
  etykieta: string;
  id?: string;
  className?: string;
}

export function formatujOdliczanie(sekundy: number): string {
  const s = Math.max(0, Math.floor(sekundy));
  const minuty = Math.floor(s / 60);
  const reszta = s % 60;
  return `${minuty}:${reszta.toString().padStart(2, '0')}`;
}

export function Odliczanie({ doKonca, razem, etykieta, id, className }: OdliczanieProps) {
  const s = Math.max(0, Math.floor(doKonca));
  return (
    <div id={id} className={['grid w-full gap-4', className].filter(Boolean).join(' ')}>
      <p className="m-0">
        {teksty.wspolne.zlozone.kodWygasnieZa} <strong>{formatujOdliczanie(s)}</strong>
      </p>
      <Postep
        wartosc={s}
        maks={razem}
        etykieta={etykieta}
        tekstWartosci={teksty.wspolne.zlozone.czasSlownie({ minuty: Math.floor(s / 60), sekundy: s % 60 })}
      />
    </div>
  );
}

export function KodQrZastepczy({ opis, pozostaloSekund, waznoscSekund, id, className }: KodQrZastepczyProps) {
  return (
    <div id={id} className={['grid w-qr flex-none justify-items-center gap-4', className].filter(Boolean).join(' ')}>
      <div className="box-border grid size-qr place-items-center rounded-md border border-line bg-surface-card p-5">
        <div
          role="img"
          aria-label={opis}
          className="grid size-full place-items-center content-center gap-2 rounded-sm border border-dashed border-line-dashed text-center text-small text-ink"
        >
          <Ikona nazwa="qr" className="size-12 text-brand" />
          <span aria-hidden="true">{opis}</span>
        </div>
      </div>
      {pozostaloSekund !== undefined && waznoscSekund !== undefined ? (
        <Odliczanie doKonca={pozostaloSekund} razem={waznoscSekund} etykieta={teksty.wspolne.zlozone.czasWaznosciKodu} />
      ) : null}
    </div>
  );
}
