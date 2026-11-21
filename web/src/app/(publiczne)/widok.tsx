'use client';

// ViewGuideStart: strona startowa przed zalogowaniem (Story 3.1.1.1.1, KA-01, KA-04; Story 3.1.1.1.2,
// KA-01, KA-02, KA-05, KA-06, KA-11, KA-12; wzory Main, P01-01, P01-02, P01-04, P01-07, P01-10).
// Akcja logowania zapisuje logowanie w toku ({ sposob, powrot }) i prowadzi do makiety, a przy
// wyłączonym trybie demonstracyjnym pod adres produkcyjny sposobu logowania (R15). Komunikaty 0072,
// 0212, 0250 i 0251 pokazuje NaglowekStrony jako komunikaty po przejściu. Właściciel: u01.
import { useSearchParams } from 'next/navigation';
import { use } from 'react';
import { adresProdukcyjnyLogowania } from '@/dane/parametry-produkcyjne';
import { useLogowanieWToku, useParametry } from '@/dane/magazyn/hooki';
import { rozpocznijLogowanie } from '@/dane/magazyn/operacje/konto';
import type { IdWidoku, SposobZalogowania } from '@/domena/typy';
import type { NazwaIkony } from '@/komponenty/ikona';
import { KafelekMetody } from '@/komponenty/kafelki';
import { Karta } from '@/komponenty/karta';
import { KontekstKomunikatowPoPrzejsciu, NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { bezpiecznyPowrot, sciezkaWidoku } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';
import { KartaCoZrobisz } from './_czesci/karta-co-zrobisz';

const tekst = teksty.ViewGuideStart;

const sposoby: { sposob: SposobZalogowania; ikona: NazwaIkony; makieta: IdWidoku }[] = [
  { sposob: 'mobywatel', ikona: 'mobywatel', makieta: 'ViewMobywatelLogin' },
  { sposob: 'ezus', ikona: 'ezus', makieta: 'ViewEzusLogin' },
  { sposob: 'mzus', ikona: 'mzus', makieta: 'ViewMzusCodeLogin' },
];

export function WidokStartuPrzewodnika() {
  const parametry = useParametry();
  const logowanie = useLogowanieWToku();
  const powrot = bezpiecznyPowrot(useSearchParams().get('powrot')) ?? undefined;
  const komunikaty = use(KontekstKomunikatowPoPrzejsciu);
  const tryb = parametry.trybDemonstracyjny;
  const poWygasnieciu = komunikaty.some((k) => k.kod === '0212');

  return (
    <>
      <NaglowekStrony tytul={tekst.naglowek} wstep={tekst.wstep} powrot={false} stronaGlowna />
      <div className="flex max-w-tresc flex-wrap items-start gap-7.5">
        <Karta tytul={tekst.logowanie.tytul} bezLinii className="min-w-0 grow-999 basis-140">
          <p className="mt-0 mb-6 max-w-190">{poWygasnieciu ? tekst.logowanie.opisPoWygasnieciu : tekst.logowanie.opis}</p>
          <ul className="m-0 grid max-w-170 list-none gap-4 p-0">
            {sposoby.map(({ sposob, ikona, makieta }) => (
              <li key={sposob} className="min-w-0">
                <KafelekMetody
                  href={(!tryb && adresProdukcyjnyLogowania(sposob)) || sciezkaWidoku(makieta)}
                  ikona={ikona}
                  tytul={tekst.logowanie.sposoby[sposob].tytul}
                  opis={tekst.logowanie.sposoby[sposob].opis}
                  className="max-md:gap-x-4 max-md:p-4"
                  onClick={() =>
                    rozpocznijLogowanie({ sposob, powrot, poprzedniKodMobywatel: logowanie?.poprzedniKodMobywatel })
                  }
                />
              </li>
            ))}
          </ul>
          {tryb ? (
            <div className="mt-6 flex flex-col items-start gap-3">
              <Notatka>
                <p>{tekst.logowanie.notatkaDemo}</p>
              </Notatka>
              <Odnosnik href={sciezkaWidoku('ViewDemoSettings')} ikonaPo="w-prawo">
                {tekst.logowanie.ustawieniaDemo}
              </Odnosnik>
            </div>
          ) : null}
        </Karta>
        <KartaCoZrobisz className="min-w-0 max-w-130 grow basis-105" />
      </div>
    </>
  );
}
