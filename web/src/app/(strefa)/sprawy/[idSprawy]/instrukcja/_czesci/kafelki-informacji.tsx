import type React from 'react';

export interface KafelekInformacji {
  etykieta: string;
  wartosc: React.ReactNode;
  podpis?: React.ReactNode;
}

// Lista dl z kafelkami Termin, Instytucja, Kanał i Status ze wzoru instrukcji sprawy (cz1/P08-01).
export function KafelkiInformacji({ kafelki }: { kafelki: KafelekInformacji[] }) {
  return (
    <dl className="m-0 flex flex-wrap gap-4">
      {kafelki.map((k) => (
        <div key={k.etykieta} className="box-border min-w-0 grow basis-50 rounded-sm bg-surface-page px-5 py-4">
          <dt className="text-body">{k.etykieta}</dt>
          <dd className="m-0 mt-1 text-body-strong break-words text-ink-strong">{k.wartosc}</dd>
          {k.podpis ? <dd className="m-0 mt-1 text-body break-words">{k.podpis}</dd> : null}
        </div>
      ))}
    </dl>
  );
}
