import { formatujKwote } from '@/komponenty/format';
import type { Grosze } from '@/domena/typy/wspolne';

export interface KwotaProps {
  etykieta: string;
  kwota: Grosze;
  dopisek?: string;
  id?: string;
  className?: string;
}

// ez-amount: pogrubiona etykieta i kwota 24/32 w kolorze success-text.
export function Kwota({ etykieta, kwota, dopisek, id, className }: KwotaProps) {
  return (
    <div id={id} className={['min-w-0', className].filter(Boolean).join(' ')}>
      <p className="m-0 font-semibold text-ink">{etykieta}</p>
      <p className="mt-1 mb-0 text-amount text-success-text">{formatujKwote(kwota)}</p>
      {dopisek ? <p className="mt-1 mb-0 text-small text-ink">{dopisek}</p> : null}
    </div>
  );
}
