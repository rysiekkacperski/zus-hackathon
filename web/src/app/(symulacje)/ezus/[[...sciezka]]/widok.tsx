'use client';

// Symulowany eZUS (ViewEzusHome, ViewEzus800Application, ViewEzusActiveParentApplication, ViewEzusApplicationDetails).
// Przewodnik otwiera te ekrany w nowej karcie w trybie demonstracyjnym (KA-06, KA-07 3.8.1.1.1). Właściciel: u17.
import { notFound } from 'next/navigation';
import { use, useMemo } from 'react';
import { useKontekstRodziny } from '@/dane/magazyn/hooki';
import type { DaneDrugiegoRodzicaZKonta, DaneZKontaZus } from '@/domena/typy';
import { formatujDate } from '@/komponenty/format';
import { ODNOSNIKI } from '@/dane/katalog/pozycje';
import { Karta } from '@/komponenty/karta';
import { KartaWiecejInformacji } from '@/komponenty/karta-wiecej-informacji';
import { ListaKrokow } from '@/komponenty/kroki';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { dopasujTrase } from '@/komponenty/rama/mapa-tras';
import { trasy } from '@/komponenty/rama/trasy';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';
import { PrzyciskZamknieciaKarty } from '../../kanal/[kanal]/_czesci/przycisk-zamkniecia-karty';
import { WniosekZas23 } from './_czesci/wniosek-zas-23';

function StronaWniosku({ grupa }: { grupa: (typeof teksty)['ViewEzus800Application' | 'ViewEzusActiveParentApplication'] }) {
  return (
    <>
      <NaglowekStrony tytul={grupa.naglowek} powrot={false} bezKomunikatowPoPrzejsciu />
      <Stos odstep={7.5}>
        <Karta>
          <Stos odstep={6}>
            <p className="m-0 text-body">{grupa.opis}</p>
            <ListaKrokow kroki={[...grupa.kroki]} />
            <Notatka>{teksty.ViewEzusHome.notatka}</Notatka>
            <div>
              <PrzyciskZamknieciaKarty />
            </div>
          </Stos>
        </Karta>
      </Stos>
    </>
  );
}

function czyKopiaZWnioskami(d: DaneZKontaZus | DaneDrugiegoRodzicaZKonta | null): d is DaneZKontaZus {
  return d !== null && 'wnioski' in d;
}

/** Szczegóły wniosku z danych konta ZUS rodziny wraz z odpowiedzią ZUS (KA-03 i KA-04 3.4.2.1.1). */
function SzczegolyWniosku({ idWniosku }: { idWniosku: string }) {
  const t = teksty.ViewEzusApplicationDetails;
  const ts = teksty.ViewCaseDetails.sekcjaStatusWnioskuZus;
  const kontekst = useKontekstRodziny();
  const wniosek = useMemo(() => {
    if (!kontekst) return null;
    const kopie = [kontekst.daneZusKonta, kontekst.daneZusMatki, kontekst.daneZusDrugiegoRodzica].filter(czyKopiaZWnioskami);
    for (const kopia of kopie) {
      const w = kopia.wnioski.find((x) => x.idWniosku === idWniosku);
      if (w) return w;
    }
    return null;
  }, [kontekst, idWniosku]);
  const wiersz = (etykieta: string, wartosc: string) => (
    <div key={etykieta}>
      <dt className="text-body">{etykieta}</dt>
      <dd className="m-0 mt-1 text-body-strong break-all text-ink-strong">{wartosc}</dd>
    </div>
  );
  const zakonczony = wniosek?.status === 'przyznanie' || wniosek?.status === 'odmowa';
  return (
    <>
      <NaglowekStrony tytul={t.naglowek} powrot={false} bezKomunikatowPoPrzejsciu />
      <Stos odstep={7.5}>
        <Karta>
          <dl className="m-0 flex flex-col gap-4">
            {wiersz(t.numerWniosku, idWniosku)}
            {wniosek ? wiersz(t.rodzajWniosku, t.rodzaje[wniosek.rodzaj]) : null}
            {wniosek ? wiersz(t.dataZlozenia, formatujDate(wniosek.dataZlozenia)) : null}
            {wniosek ? wiersz(t.kanal, ts.kanaly[wniosek.kanal]) : null}
            {wiersz(t.status, wniosek ? ts.statusy[wniosek.status] : t.statusWartosc)}
            {wniosek && !zakonczony && wniosek.planowyTerminZalatwienia
              ? wiersz(t.planowyTermin, formatujDate(wniosek.planowyTerminZalatwienia))
              : null}
          </dl>
        </Karta>
        {wniosek ? (
          <Karta tytul={t.odpowiedzZus}>
            <Stos odstep={6}>
              <p className="m-0 text-body">{t.odpowiedzi[wniosek.status]}</p>
              <div>
                <PrzyciskZamknieciaKarty />
              </div>
            </Stos>
          </Karta>
        ) : null}
      </Stos>
    </>
  );
}

export function WidokEzus({ params }: { params: PageProps<'/ezus/[[...sciezka]]'>['params'] }) {
  const { sciezka } = use(params);
  const trasa = dopasujTrase(['', 'ezus', ...(sciezka ?? []).map(encodeURIComponent)].join('/'));
  if (trasa === null || trasa.grupa !== 'symulacje') notFound();

  switch (trasa.widok) {
    case 'ViewEzus800Application':
      return <StronaWniosku grupa={teksty.ViewEzus800Application} />;
    case 'ViewEzusActiveParentApplication':
      return <StronaWniosku grupa={teksty.ViewEzusActiveParentApplication} />;
    case 'ViewEzusApplicationDetails':
      return <SzczegolyWniosku idWniosku={trasa.parametry.idWniosku} />;
    case 'ViewEzusZas23':
      return <WniosekZas23 />;
    default: {
      const t = teksty.ViewEzusHome;
      return (
        <>
          <NaglowekStrony tytul={t.naglowek} wstep={t.wstep} powrot={false} bezKomunikatowPoPrzejsciu />
          <Karta tytul={t.kartaWnioski} bezLinii>
            <Stos>
              <ul className="m-0 flex list-none flex-col gap-4 p-0">
                <li>
                  <Odnosnik href={trasy.ViewEzus800Application()} ikonaPo="w-prawo">
                    {t.wniosek800}
                  </Odnosnik>
                </li>
                <li>
                  <Odnosnik href={trasy.ViewEzusActiveParentApplication()} ikonaPo="w-prawo">
                    {t.wniosekAktywnyRodzic}
                  </Odnosnik>
                </li>
              </ul>
              <Notatka>{t.notatka}</Notatka>
              <div>
                <PrzyciskZamknieciaKarty />
              </div>
            </Stos>
          </Karta>
          <Karta tytul={t.kartaZasilki} bezLinii className="mt-7.5">
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              <li>
                <Odnosnik href={trasy.ViewEzusZas23()} ikonaPo="w-prawo">
                  {t.wniosekZas23}
                </Odnosnik>
              </li>
            </ul>
          </Karta>
          {/* Konto ubezpieczonego: dane zgromadzone na koncie w ZUS i pytanie do ZUS (PUE/eZUS, ekrany przewodnika). */}
          <Karta tytul={t.kartaKonta} bezLinii className="mt-7.5">
            <p className="m-0 mb-4">{t.kontoWstep}</p>
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {[
                { href: trasy.ViewZusAccountData(), etykieta: t.daneKonta },
                { href: trasy.ViewSickLeaveList(), etykieta: t.zaswiadczeniaEzla },
                { href: trasy.ViewContributionBalance(), etykieta: t.stanRozliczen },
                { href: trasy.ViewZusQuestion(), etykieta: t.pytanieDoZus },
              ].map((o) => (
                <li key={o.href}>
                  <Odnosnik href={o.href} ikonaPo="w-prawo">
                    {o.etykieta}
                  </Odnosnik>
                </li>
              ))}
            </ul>
          </Karta>
          <KartaWiecejInformacji odnosniki={[ODNOSNIKI.zus]} className="mt-7.5" />
        </>
      );
    }
  }
}
