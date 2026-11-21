'use client';

// ViewGuideStart: strona startowa przed zalogowaniem (Story 3.1.1.1.1, KA-01, KA-04; Story 3.1.1.1.2,
// KA-01, KA-02, KA-05, KA-06, KA-11, KA-12; wzory Main, P01-01, P01-02, P01-04, P01-07, P01-10 oraz LoginPage
// i LoginForm systemu eZUS). Wyśrodkowany układ: nagłówek strony, karta logowania (login i hasło eZUS, pod nimi
// mObywatel i kod z aplikacji mZUS) oraz kolumna boczna z kartą „Bez logowania” i kartą „Co zrobisz
// w przewodniku”. Komunikaty 0072, 0212, 0250 i 0251 pokazuje NaglowekStrony jako komunikaty po przejściu.
// Właściciel: u01.
import { useSearchParams } from 'next/navigation';
import { use } from 'react';
import { useLogowanieWToku, useParametry } from '@/dane/magazyn/hooki';
import { KontekstKomunikatowPoPrzejsciu, NaglowekStrony } from '@/komponenty/naglowek-strony';
import { bezpiecznyPowrot } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';
import { KartaBezLogowania } from './_czesci/karta-bez-logowania';
import { KartaCoZrobisz } from './_czesci/karta-co-zrobisz';
import { KartaLogowania } from './_czesci/karta-logowania';

const tekst = teksty.ViewGuideStart;

export function WidokStartuPrzewodnika() {
  const parametry = useParametry();
  const logowanie = useLogowanieWToku();
  const powrot = bezpiecznyPowrot(useSearchParams().get('powrot')) ?? undefined;
  const komunikaty = use(KontekstKomunikatowPoPrzejsciu);
  const poWygasnieciu = komunikaty.some((k) => k.kod === '0212');

  return (
    <div className="mx-auto w-full max-w-300">
      <NaglowekStrony tytul={tekst.naglowek} wstep={tekst.wstep} powrot={false} stronaGlowna />
      <div className="grid items-start gap-7.5 md:grid-cols-2 lg:grid-cols-[40rem_minmax(0,1fr)]">
        <KartaLogowania
          powrot={powrot}
          poprzedniKodMobywatel={logowanie?.poprzedniKodMobywatel}
          trybDemonstracyjny={parametry.trybDemonstracyjny}
          poWygasnieciu={poWygasnieciu}
        />
        <div className="flex min-w-0 flex-col gap-7.5">
          <KartaBezLogowania />
          <KartaCoZrobisz />
        </div>
      </div>
    </div>
  );
}
