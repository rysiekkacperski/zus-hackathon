'use client';

// Wspólne części kreatora wniosku o urlop do pracodawcy (u28): rama kroku, dane kreatora i karty boczne.
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, type ReactNode } from 'react';
import { formatujDate } from '@/domena/daty';
import type { WniosekOUrlop } from '@/domena/typy';
import { zbierzDaneKreatora, type DaneKreatora } from '@/domena/wnioski/urlopy';
import { useKontekstRodziny, type KontekstRodziny } from '@/dane/magazyn/hooki';
import { znajdzWniosekOUrlop } from '@/dane/magazyn/operacje/wnioski-urlop';
import { Ikona } from '@/komponenty/ikona';
import { Karta } from '@/komponenty/karta';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Postep } from '@/komponenty/postep';
import { trasy } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';

const t = teksty.ViewLeaveRequestType;

export interface StanKreatora {
  kontekst: KontekstRodziny;
  dane: DaneKreatora;
  wniosek: WniosekOUrlop | null;
}

/** Kontekst rodziny, dane kreatora i wniosek z parametru ?wniosek=. */
export function useKreatorUrlopu(): StanKreatora | null {
  const kontekst = useKontekstRodziny();
  const parametry = useSearchParams();
  const idWniosku = parametry.get('wniosek');
  return useMemo(() => {
    if (kontekst === null) return null;
    const dane = zbierzDaneKreatora({ konto: kontekst.konto, rodzina: kontekst.rodzina, daneZus: kontekst.daneZusKonta });
    const wniosek = znajdzWniosekOUrlop(kontekst.rodzina, kontekst.konto.pesel, idWniosku);
    return { kontekst, dane, wniosek };
  }, [kontekst, idWniosku]);
}

/** Nagłówek z powrotem do instrukcji sprawy, karta postępu i układ formularza z kolumną boczną. */
export function RamaKreatora({
  krok,
  nazwaKroku,
  idSprawy,
  idWniosku,
  boczna,
  children,
}: {
  krok: 1 | 2 | 3;
  nazwaKroku: string;
  idSprawy: string | null;
  idWniosku?: string;
  boczna?: ReactNode;
  children: ReactNode;
}) {
  const idTytulu = 'kreator-urlopu-krok';
  const hrefKroku = [
    trasy.ViewLeaveRequestType({ wniosek: idWniosku }),
    trasy.ViewLeaveRequestForm({ wniosek: idWniosku }),
    trasy.ViewLeaveRequestSummary({ wniosek: idWniosku }),
  ];
  return (
    <>
      <NaglowekStrony
        tytul={t.naglowek}
        powrot={idSprawy ? { href: trasy.ViewCaseGuide({ idSprawy }), etykieta: t.powrot } : undefined}
      />
      <section aria-labelledby={idTytulu} className="mt-7.5 rounded-sm bg-surface-card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 id={idTytulu} className="m-0 text-body-strong text-ink-strong">
            {t.krok({ krok, nazwa: nazwaKroku })}
          </h2>
          <p className="m-0 text-small">{t.zapisujemy}</p>
        </div>
        <Postep wartosc={krok} maks={3} min={0} etykieta={t.krok({ krok, nazwa: nazwaKroku })} idEtykiety={idTytulu} className="mt-3" />
        <ol aria-label={t.etykietaKrokow} className="m-0 mt-4 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 text-small">
          {t.kroki.map((etykieta, i) => {
            const numer = i + 1;
            if (numer === krok) {
              return (
                <li key={etykieta} aria-current="step" className="font-semibold text-ink-strong">
                  {etykieta}
                </li>
              );
            }
            if (numer < krok && idWniosku) {
              return (
                <li key={etykieta}>
                  <Link href={hrefKroku[i]} className="inline-flex items-center gap-1">
                    <Ikona nazwa="zaznaczenie" rozmiar={16} />
                    {etykieta}
                  </Link>
                </li>
              );
            }
            return <li key={etykieta}>{etykieta}</li>;
          })}
        </ol>
      </section>
      <div className="mt-7.5 flex flex-wrap items-start gap-7.5">
        <div className="flex min-w-0 grow-999 basis-140 flex-col gap-7.5">{children}</div>
        {boczna ? (
          <aside aria-label={t.etykietaBocznej} className="flex min-w-0 max-w-84 grow basis-84 flex-col gap-7.5">
            {boczna}
          </aside>
        ) : null}
      </div>
    </>
  );
}

/** Karta „Dane z profilu rodziny” w kolumnie bocznej. */
export function KartaDanychZProfilu({ dane }: { dane: DaneKreatora }) {
  const pozycje: { etykieta: string; wartosc: string }[] = [{ etykieta: t.formaZatrudnienia, wartosc: t.umowaOPrace }];
  if (dane.pracodawca) pozycje.push({ etykieta: t.pracodawca, wartosc: dane.pracodawca });
  if (dane.przyjecie) pozycje.push({ etykieta: t.dataPrzyjecia, wartosc: formatujDate(dane.przyjecie.dataPrzyjecia) });
  else if (dane.dataPoroduPotwierdzona && dane.dataPorodu) pozycje.push({ etykieta: t.dataPorodu, wartosc: formatujDate(dane.dataPorodu) });
  else if (dane.przewidywanyTerminPorodu) {
    pozycje.push({ etykieta: t.przewidywanyTermin, wartosc: `${formatujDate(dane.przewidywanyTerminPorodu)} (${t.niepotwierdzona})` });
  }
  pozycje.push({ etykieta: t.liczbaDzieci, wartosc: String(dane.przyjecie?.liczbaPrzyjetychDzieci ?? dane.liczbaDzieci) });
  if (dane.wymiarK11) pozycje.push({ etykieta: t.uzupelniajacy, wartosc: t.doTygodni({ tygodnie: dane.wymiarK11 }) });
  return (
    <Karta tytul={t.daneZProfilu} bezLinii>
      <dl className="m-0 flex flex-col gap-3">
        {pozycje.map((p) => (
          <div key={p.etykieta}>
            <dt className="text-body-strong">{p.etykieta}</dt>
            <dd className="m-0 text-ink-strong">{p.wartosc}</dd>
          </div>
        ))}
      </dl>
    </Karta>
  );
}

/** Lista definicji na tle strony, jak w karcie „Dane we wniosku” wzorów. */
export function DaneNaTle({ pozycje, poziomo = true }: { pozycje: { etykieta: string; wartosc: ReactNode }[]; poziomo?: boolean }) {
  return (
    <dl
      className={[
        'm-0 rounded-sm bg-surface-page px-5 py-4',
        poziomo ? 'flex flex-wrap gap-x-7.5 gap-y-4' : 'flex flex-col gap-3',
      ].join(' ')}
    >
      {pozycje.map((p) => (
        <div key={p.etykieta} className="min-w-0">
          <dt className="text-body-strong">{p.etykieta}</dt>
          <dd className="m-0 text-ink-strong">{p.wartosc}</dd>
        </div>
      ))}
    </dl>
  );
}
