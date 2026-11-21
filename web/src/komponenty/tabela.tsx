import type { ReactNode } from 'react';

export interface KolumnaTabeli<K extends string> {
  klucz: K;
  naglowek: ReactNode;
  liczbowa?: boolean;
  tytulowa?: boolean;
  ukryjNaglowek?: boolean;
}

export interface TabelaProps<K extends string> {
  podpis: string;
  podpisWidoczny?: boolean;
  kolumny: KolumnaTabeli<K>[];
  wiersze: ({ id: string } & Partial<Record<K, ReactNode>>)[];
  kwoty?: boolean;
  suma?: Partial<Record<K, ReactNode>>;
  pustaTresc?: ReactNode;
  etykietaPrzewijania: string;
  id?: string;
  className?: string;
}

function klasyKomorki(kolumna: { liczbowa?: boolean }, kwoty: boolean): string {
  if (kolumna.liczbowa) {
    return kwoty ? 'text-right whitespace-nowrap text-success-text' : 'text-right whitespace-nowrap';
  }
  return kwoty ? 'text-left text-ink-strong' : 'text-left';
}

export function Tabela<K extends string>({
  podpis,
  podpisWidoczny = false,
  kolumny,
  wiersze,
  kwoty = false,
  suma,
  pustaTresc,
  etykietaPrzewijania,
  id,
  className,
}: TabelaProps<K>) {
  return (
    <div
      role="region"
      aria-label={etykietaPrzewijania}
      tabIndex={0}
      id={id}
      className={['w-full min-w-0 overflow-x-auto', className].filter(Boolean).join(' ')}
    >
      <table className="w-full border-collapse text-body">
        <caption className={podpisWidoczny ? 'mb-3 text-left text-body-strong text-ink' : 'sr-only'}>
          {podpis}
        </caption>
        <thead>
          <tr>
            {kolumny.map((k) => (
              <th
                key={k.klucz}
                scope="col"
                className={[
                  'h-[3.875rem] bg-surface-page px-5 py-2 align-middle font-semibold text-ink',
                  k.liczbowa ? 'text-right whitespace-nowrap' : 'text-left',
                ].join(' ')}
              >
                {k.ukryjNaglowek ? <span className="sr-only">{k.naglowek}</span> : k.naglowek}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {wiersze.length === 0 && pustaTresc ? (
            <tr>
              <td colSpan={kolumny.length} className="h-[3.875rem] border-b border-line-row px-5 py-3 align-middle">
                {pustaTresc}
              </td>
            </tr>
          ) : null}
          {wiersze.map((w) => (
            <tr key={w.id}>
              {kolumny.map((k) => {
                const tresc = w[k.klucz] as ReactNode;
                const klasy = [
                  'h-[3.875rem] border-b border-line-row px-5 py-3 align-middle',
                  klasyKomorki(k, kwoty),
                ].join(' ');
                return k.tytulowa ? (
                  <th key={k.klucz} scope="row" className={`${klasy} font-normal`}>
                    <span className="flex items-center gap-2">{tresc}</span>
                  </th>
                ) : (
                  <td key={k.klucz} className={klasy}>
                    {tresc}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        {suma ? (
          <tfoot>
            <tr>
              {kolumny.map((k) => (
                <td
                  key={k.klucz}
                  className={[
                    'h-[4.875rem] border-b border-line-row px-5 py-3 align-middle',
                    klasyKomorki(k, kwoty),
                    k.liczbowa ? 'text-amount' : 'font-semibold',
                  ].join(' ')}
                >
                  {suma[k.klucz] as ReactNode}
                </td>
              ))}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
