// Kafle wartości ze wzorów P16 i P17 (etykieta nad wartością). Właściciel: u14.
import type { ReactNode } from 'react';

export interface KafelWartosci {
  etykieta: string;
  wartosc: ReactNode;
  dopisek?: ReactNode;
}

export function KafleWartosci({ kafle }: { kafle: KafelWartosci[] }) {
  return (
    <dl className="m-0 flex flex-wrap gap-x-7.5 gap-y-4">
      {kafle.map((k) => (
        <div key={k.etykieta} className="flex min-w-0 flex-col gap-1">
          <dt className="text-small text-ink-muted">{k.etykieta}</dt>
          <dd className="m-0 text-amount text-ink-strong">{k.wartosc}</dd>
          {k.dopisek ? <dd className="m-0 text-small text-ink">{k.dopisek}</dd> : null}
        </div>
      ))}
    </dl>
  );
}
