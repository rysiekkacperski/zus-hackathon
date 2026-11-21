'use client';

// Symulowany eZUS (ViewEzusHome, ViewEzus800Application, ViewEzusActiveParentApplication, ViewEzusApplicationDetails).
// Przewodnik otwiera te ekrany w nowej karcie w trybie demonstracyjnym (KA-06, KA-07 3.8.1.1.1). Właściciel: u17.
import { notFound } from 'next/navigation';
import { use } from 'react';
import { Karta } from '@/komponenty/karta';
import { ListaKrokow } from '@/komponenty/kroki';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { dopasujTrase } from '@/komponenty/rama/mapa-tras';
import { trasy } from '@/komponenty/rama/trasy';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';
import { PrzyciskZamknieciaKarty } from '../../kanal/[kanal]/_czesci/przycisk-zamkniecia-karty';

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

export function WidokEzus({ params }: { params: PageProps<'/ezus/[[...sciezka]]'>['params'] }) {
  const { sciezka } = use(params);
  const trasa = dopasujTrase(['', 'ezus', ...(sciezka ?? []).map(encodeURIComponent)].join('/'));
  if (trasa === null || trasa.grupa !== 'symulacje') notFound();

  switch (trasa.widok) {
    case 'ViewEzus800Application':
      return <StronaWniosku grupa={teksty.ViewEzus800Application} />;
    case 'ViewEzusActiveParentApplication':
      return <StronaWniosku grupa={teksty.ViewEzusActiveParentApplication} />;
    case 'ViewEzusApplicationDetails': {
      const t = teksty.ViewEzusApplicationDetails;
      return (
        <>
          <NaglowekStrony tytul={t.naglowek} powrot={false} bezKomunikatowPoPrzejsciu />
          <Karta>
            <dl className="m-0 flex flex-col gap-4">
              <div>
                <dt className="text-body">{t.numerWniosku}</dt>
                <dd className="m-0 mt-1 text-body-strong break-all text-ink-strong">{trasa.parametry.idWniosku}</dd>
              </div>
              <div>
                <dt className="text-body">{t.status}</dt>
                <dd className="m-0 mt-1 text-body-strong text-ink-strong">{t.statusWartosc}</dd>
              </div>
            </dl>
          </Karta>
        </>
      );
    }
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
        </>
      );
    }
  }
}
