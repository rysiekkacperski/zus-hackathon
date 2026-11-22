// Strona /api-docs: lista punktów końcowych REST API w wersji 1 z przykładami żądań i odpowiedzi.
// Strona powstaje z rejestru punktów końcowych (src/serwer/api/endpointy.ts) i nie czyta danych żądania,
// więc przy Cache Components renderuje się z góry podczas budowania aplikacji.
import type { Metadata } from 'next';
import { Karta } from '@/komponenty/karta';
import { endpointy, type Endpoint, type GrupaEndpointu } from '@/serwer/api/endpointy';
import { statusBledu } from '@/serwer/api/odpowiedzi';
import { teksty } from '@/teksty';

const T = teksty.ViewApiDocs;

export const metadata: Metadata = { title: T.tytulStrony, description: T.opisStrony };

const KOLEJNOSC_GRUP: readonly GrupaEndpointu[] = ['kalkulatory', 'plan', 'sprawy', 'zus', 'walidacje', 'opis'];

const klasyMetody = {
  GET: 'bg-success text-on-brand',
  POST: 'bg-brand text-on-brand',
} as const;

function Json({ dane }: { dane: unknown }) {
  return (
    <pre className="m-0 max-h-96 overflow-auto rounded-sm border border-line bg-surface-sunken p-3 text-small whitespace-pre text-ink-strong">
      {JSON.stringify(dane, null, 2)}
    </pre>
  );
}

function PunktKoncowy({ e }: { e: Endpoint }) {
  const opis = T.endpointy[e.klucz];
  return (
    <Karta as="article" tytul={opis.tytul} poziomTytulu={3} id={e.klucz}>
      <p className="m-0 mb-3 flex flex-wrap items-center gap-2 text-body-strong">
        <span className={`rounded-sm px-2 py-0.5 text-small ${klasyMetody[e.metoda]}`}>{e.metoda}</span>
        <code className="break-all text-ink-strong">{e.sciezka}</code>
      </p>
      <p className="m-0 mb-4 text-body">{opis.opis}</p>
      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <div className="min-w-0">
          <h4 className="m-0 mb-2 text-body-strong">{T.etykiety.zadanie}</h4>
          <p className="m-0 mb-2 text-small break-all text-ink-muted">
            <code>{`${e.metoda} ${e.przykladAdresu}`}</code>
          </p>
          {e.przykladZadania ? <Json dane={e.przykladZadania} /> : <p className="m-0 text-small text-ink-muted">{T.etykiety.bezTresci}</p>}
        </div>
        <div className="min-w-0">
          <h4 className="m-0 mb-2 text-body-strong">{T.etykiety.odpowiedz}</h4>
          <p className="m-0 mb-2 text-small text-ink-muted">{T.etykiety.status({ status: String(e.statusSukcesu) })}</p>
          <Json dane={e.przykladOdpowiedzi} />
        </div>
      </div>
      {e.bledy.length > 0 ? (
        <div className="mt-4">
          <h4 className="m-0 mb-2 text-body-strong">{T.etykiety.bledy}</h4>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {e.bledy.map((kod) => (
              <li key={kod} className="rounded-sm border border-line px-2 py-0.5 text-small">
                <code>{`${kod} · ${statusBledu(kod)}`}</code>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Karta>
  );
}

export default function Strona() {
  return (
    <main id="tresc" className="mx-auto box-border w-full max-w-300 min-w-0 px-4 pt-6 pb-16 lg:px-16">
      <h1 className="m-0 mb-4 text-page-title text-ink-strong">{T.naglowek}</h1>
      <p className="m-0 mb-6 max-w-200 text-lead">{T.wstep}</p>

      <div className="mb-6 grid min-w-0 gap-4 lg:grid-cols-2">
        <Karta tytul={T.zasadyNaglowek}>
          <ul className="m-0 flex flex-col gap-2 pl-5 text-body">
            {T.zasady.map((zasada) => (
              <li key={zasada}>{zasada}</li>
            ))}
          </ul>
        </Karta>
        <Karta tytul={T.spisTresci}>
          <h3 className="m-0 mb-1 text-body-strong">{T.openApiNaglowek}</h3>
          <p className="m-0 mb-3 text-body">
            {T.openApiOpis}{' '}
            <a className="break-all text-brand underline" href="/api/v1/openapi.json">
              /api/v1/openapi.json
            </a>
          </p>
          <ul className="m-0 flex flex-col gap-1 pl-5 text-body">
            {endpointy.map((e) => (
              <li key={e.klucz}>
                <a className="text-brand underline" href={`#${e.klucz}`}>
                  {T.endpointy[e.klucz].tytul}
                </a>
              </li>
            ))}
          </ul>
        </Karta>
      </div>

      {KOLEJNOSC_GRUP.map((grupa) => (
        <section key={grupa} aria-labelledby={`grupa-${grupa}`} className="mb-8">
          <h2 id={`grupa-${grupa}`} className="m-0 mb-3 text-section-title text-ink-strong">
            {T.grupy[grupa]}
          </h2>
          <div className="flex flex-col gap-4">
            {endpointy.filter((e) => e.grupa === grupa).map((e) => (
              <PunktKoncowy key={e.klucz} e={e} />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
