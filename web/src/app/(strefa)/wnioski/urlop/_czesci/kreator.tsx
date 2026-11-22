'use client';

// Wspólne części kreatora wniosku o urlop do pracodawcy (u28): rama kroku, części formularza, dane kreatora
// i karty boczne. Krok formularza ma części (?czesc=N) według rodzaju wniosku; części liczą się jako kroki.
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, type ReactNode } from 'react';
import { formatujDate } from '@/domena/daty';
import type { PodrodzajWnioskuOUrlop, WniosekOUrlop } from '@/domena/typy';
import { zbierzDaneKreatora, type DaneKreatora } from '@/domena/wnioski/urlopy';
import { useKontekstRodziny, type KontekstRodziny } from '@/dane/magazyn/hooki';
import { znajdzWniosekOUrlop } from '@/dane/magazyn/operacje/wnioski-urlop';
import { Ikona } from '@/komponenty/ikona';
import { adresCzesci } from '@/komponenty/czesci-formularza';
import { Karta } from '@/komponenty/karta';
import { liczbaKrokow, numerKroku, type KrokZCzesciami } from '@/komponenty/kroki';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Postep } from '@/komponenty/postep';
import { trasy } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';

const t = teksty.ViewLeaveRequestType;

/** Sekcja kroku formularza: dane, pola okresu, wyniki okresu, części rodzicielskiego, oświadczenie, łączenie, wydłużenie, załączniki. */
export type SekcjaFormularzaUrlopu =
  | 'dane'
  | 'okres'
  | 'wyniki'
  | 'czesci'
  | 'oswiadczenie'
  | 'laczenie'
  | 'wydluzenie'
  | 'zalaczniki';

/** Części kroku formularza według rodzaju wniosku; każda część mieści się w oknie z polami warunkowymi. */
const CZESCI_FORMULARZA: Record<PodrodzajWnioskuOUrlop, SekcjaFormularzaUrlopu[][]> = {
  'czesc-przed-porodem': [['dane'], ['okres', 'zalaczniki']],
  'macierzynski-z-rodzicielskim': [['dane'], ['okres'], ['wyniki'], ['oswiadczenie', 'zalaczniki']],
  rodzicielski: [['dane'], ['czesci'], ['okres'], ['oswiadczenie', 'zalaczniki']],
  ojcowski: [['dane', 'oswiadczenie'], ['okres'], ['zalaczniki']],
  uzupelniajacy: [['dane'], ['okres'], ['oswiadczenie', 'zalaczniki']],
  'na-warunkach-macierzynskiego': [['dane'], ['okres'], ['wyniki'], ['zalaczniki']],
  'laczenie-z-praca': [['dane'], ['okres'], ['laczenie'], ['wydluzenie', 'zalaczniki']],
  'rezygnacja-matki': [['dane'], ['okres', 'zalaczniki']],
  'pozostala-czesc-macierzynskiego': [['dane'], ['okres', 'zalaczniki']],
  wychowawczy: [['dane', 'okres'], ['oswiadczenie', 'zalaczniki']],
  'obnizenie-wymiaru': [['dane', 'okres'], ['oswiadczenie', 'zalaczniki']],
};

export function czesciFormularzaUrlopu(podrodzaj: PodrodzajWnioskuOUrlop | null | undefined): SekcjaFormularzaUrlopu[][] {
  return podrodzaj ? CZESCI_FORMULARZA[podrodzaj] : [['dane']];
}

/** Numer pierwszej części z sekcją (od 1); sekcja spoza rodzaju wniosku daje część 1. */
export function czescSekcjiUrlopu(podrodzaj: PodrodzajWnioskuOUrlop | null | undefined, sekcja: SekcjaFormularzaUrlopu): number {
  const indeks = czesciFormularzaUrlopu(podrodzaj).findIndex((sekcje) => sekcje.includes(sekcja));
  return indeks < 0 ? 1 : indeks + 1;
}

/** Adres części formularza, np. „Zmień” w podsumowaniu albo Wstecz na ostatnią część. */
export function adresCzesciFormularzaUrlopu(idWniosku: string, czesc: number): string {
  return adresCzesci(trasy.ViewLeaveRequestForm({ wniosek: idWniosku }), czesc);
}

function krokiKreatora(podrodzaj: PodrodzajWnioskuOUrlop | null | undefined): KrokZCzesciami<'rodzaj' | 'formularz' | 'podsumowanie'>[] {
  return [{ id: 'rodzaj' }, { id: 'formularz', czesci: czesciFormularzaUrlopu(podrodzaj).length }, { id: 'podsumowanie' }];
}

const ID_KROKOW = ['rodzaj', 'formularz', 'podsumowanie'] as const;

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
    const wniosek = znajdzWniosekOUrlop(kontekst.rodzina, kontekst.konto.pesel, idWniosku);
    const dane = zbierzDaneKreatora({
      konto: kontekst.konto,
      rodzina: kontekst.rodzina,
      daneZus: kontekst.daneZusKonta,
      numerScenariusza: wniosek?.numerScenariusza,
    });
    return { kontekst, dane, wniosek };
  }, [kontekst, idWniosku]);
}

/** Nagłówek z powrotem do instrukcji sprawy, karta postępu i układ formularza z kolumną boczną. */
export function RamaKreatora({
  krok,
  czesc = 1,
  podrodzaj,
  nazwaKroku,
  idSprawy,
  idWniosku,
  boczna,
  children,
}: {
  krok: 1 | 2 | 3;
  /** Część kroku formularza (od 1). */
  czesc?: number;
  /** Rodzaj wniosku, od którego zależy liczba części kroku formularza. */
  podrodzaj?: PodrodzajWnioskuOUrlop | null;
  nazwaKroku: string;
  idSprawy: string | null;
  idWniosku?: string;
  boczna?: ReactNode;
  children: ReactNode;
}) {
  const idTytulu = 'kreator-urlopu-krok';
  const kroki = krokiKreatora(podrodzaj);
  const liczba = liczbaKrokow(kroki);
  const numer = numerKroku(kroki, ID_KROKOW[krok - 1], czesc);
  const naglowekKroku = t.krok({ krok: numer, liczbaKrokow: liczba, nazwa: nazwaKroku });
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
      <section aria-labelledby={idTytulu} className="rounded-sm bg-surface-card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 id={idTytulu} className="m-0 text-body-strong text-ink-strong">
            {naglowekKroku}
          </h2>
          <p className="m-0 text-small">{t.zapisujemy}</p>
        </div>
        <Postep wartosc={numer} maks={liczba} min={0} etykieta={naglowekKroku} idEtykiety={idTytulu} className="mt-3" />
        <ol aria-label={t.etykietaKrokow} className="m-0 mt-3 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 text-small">
          {t.nazwyKrokow.map((nazwa, i) => {
            const numerKrokuListy = i + 1;
            const od = numerKroku(kroki, ID_KROKOW[i], 1);
            const czesciKroku = kroki[i].czesci ?? 1;
            const etykieta =
              czesciKroku > 1 ? t.zakresKrokow({ od, do: od + czesciKroku - 1, nazwa }) : t.numerKroku({ numer: od, nazwa });
            if (numerKrokuListy === krok) {
              return (
                <li key={etykieta} aria-current="step" className="font-semibold text-ink-strong">
                  {etykieta}
                </li>
              );
            }
            if (numerKrokuListy < krok && idWniosku) {
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
