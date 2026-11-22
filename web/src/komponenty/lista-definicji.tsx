import type { ReactNode } from 'react';
import type { ZrodloDanej } from '@/domena/typy';
import { Znaczek, ZnacznikZrodla, type ZnacznikZrodlaProps } from '@/komponenty/znaczek';
import { teksty } from '@/teksty';

export interface PozycjaListyDefinicji {
  etykieta: string;
  wartosc: ReactNode;
  zrodlo?: ZrodloDanej | string;
  zmieniona?: boolean;
}

export interface ListaDefinicjiProps {
  pozycje: PozycjaListyDefinicji[];
  szerokoscEtykiety?: 'waska' | 'szeroka';
  id?: string;
  className?: string;
}

const znaneZrodla: readonly string[] = [
  'konto-zus',
  'pelnomocnictwo-pel',
  'odpowiedz-rodzica',
  'profil-rodziny',
  'przykladowa-sprawa',
  'wartosc-w-kalkulatorze',
  'wartosc-domyslna',
];

const klasyEtykiety = {
  waska: 'basis-40',
  szeroka: 'basis-60',
} as const;

function Zrodlo({ zrodlo }: { zrodlo: string }) {
  if (znaneZrodla.includes(zrodlo)) {
    return <ZnacznikZrodla zrodlo={zrodlo as ZnacznikZrodlaProps['zrodlo']} />;
  }
  return <Znaczek>{zrodlo}</Znaczek>;
}

export function ListaDefinicji({ pozycje, szerokoscEtykiety = 'szeroka', id, className }: ListaDefinicjiProps) {
  return (
    <dl id={id} className={['m-0 min-w-0', className].filter(Boolean).join(' ')}>
      {pozycje.map((p, i) => (
        <div
          key={`${p.etykieta}-${i}`}
          className="flex flex-wrap gap-x-4 gap-y-1 border-b border-line-row py-3 last:border-b-0"
        >
          <dt className={['min-w-0 shrink-0 grow-0 font-semibold text-ink', klasyEtykiety[szerokoscEtykiety]].join(' ')}>
            {p.etykieta}
          </dt>
          <dd className="m-0 flex min-w-0 grow basis-48 flex-wrap items-center gap-x-3 gap-y-1 text-ink-strong">
            <span className="min-w-0 break-words">{p.wartosc}</span>
            {p.zrodlo ? <Zrodlo zrodlo={p.zrodlo} /> : null}
            {p.zmieniona ? <Znaczek>{teksty.wspolne.zlozone.zmieniono}</Znaczek> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
