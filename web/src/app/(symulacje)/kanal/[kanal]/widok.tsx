'use client';

// Symulowane serwisy instytucji (ViewSimulatedChannel: Emp@tia, mObywatel, usługi gov.pl, PUE/eZUS) i e-wizyta w ZUS
// (ViewZusEVisit), otwierane przez przewodnik w nowej karcie w trybie demonstracyjnym. Właściciel: u17.
import { notFound } from 'next/navigation';
import { use } from 'react';
import { Karta } from '@/komponenty/karta';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { dopasujTrase, kanalySymulowane, type KanalSymulowany } from '@/komponenty/rama/mapa-tras';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';
import { PrzyciskZamknieciaKarty } from './_czesci/przycisk-zamkniecia-karty';

function czyKanalSymulowany(kanal: string | undefined): kanal is KanalSymulowany {
  return (kanalySymulowane as readonly string[]).includes(kanal ?? '');
}

export function WidokKanalu({ params }: { params: PageProps<'/kanal/[kanal]'>['params'] }) {
  const { kanal } = use(params);
  const trasa = dopasujTrase(`/kanal/${encodeURIComponent(kanal)}`);
  if (trasa === null || trasa.grupa !== 'symulacje') notFound();

  let naglowek: string;
  let opis: string;
  if (trasa.widok === 'ViewZusEVisit') {
    naglowek = teksty.ViewZusEVisit.naglowek;
    opis = teksty.ViewZusEVisit.opis;
  } else if (czyKanalSymulowany(trasa.parametry.kanal)) {
    const serwis = teksty.ViewSimulatedChannel.serwisy[trasa.parametry.kanal];
    naglowek = serwis.naglowek;
    opis = serwis.opis;
  } else {
    notFound();
  }

  return (
    <>
      <NaglowekStrony tytul={naglowek} wstep={teksty.ViewSimulatedChannel.wstep} powrot={false} bezKomunikatowPoPrzejsciu />
      <Karta>
        <Stos odstep={6}>
          <p className="m-0 text-body">{opis}</p>
          <Notatka>{teksty.ViewSimulatedChannel.notatka}</Notatka>
          <div>
            <PrzyciskZamknieciaKarty />
          </div>
        </Stos>
      </Karta>
    </>
  );
}
