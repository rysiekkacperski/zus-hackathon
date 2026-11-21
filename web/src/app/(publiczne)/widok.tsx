'use client';

// Ekran zastępczy ViewGuideStart z podstawowym działaniem (kontrakt 2.4 i 3.5). Właściciel: u01.
// Kafelek sposobu logowania zapisuje logowanie w toku ({ sposob, powrot }) i prowadzi do makiety,
// a w trybie demonstracyjnym link prowadzi wprost do wyboru konta.
import { useSearchParams } from 'next/navigation';
import { adresProdukcyjnyLogowania } from '@/dane/parametry-produkcyjne';
import { useParametry } from '@/dane/magazyn/hooki';
import { rozpocznijLogowanie } from '@/dane/magazyn/operacje/konto';
import type { IdWidoku, SposobZalogowania } from '@/domena/typy';
import { KafelekMetody } from '@/komponenty/kafelki';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import type { NazwaIkony } from '@/komponenty/ikona';
import { Odnosnik } from '@/komponenty/odnosnik';
import { bezpiecznyPowrot, sciezkaWidoku } from '@/komponenty/rama/trasy';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';

const tekst = teksty.wspolne.ekranZastepczy;

const sposoby: { sposob: SposobZalogowania; ikona: NazwaIkony; makieta: IdWidoku }[] = [
  { sposob: 'mobywatel', ikona: 'mobywatel', makieta: 'ViewMobywatelLogin' },
  { sposob: 'ezus', ikona: 'ezus', makieta: 'ViewEzusLogin' },
  { sposob: 'mzus', ikona: 'mzus', makieta: 'ViewMzusCodeLogin' },
];

export function WidokStartuPrzewodnika() {
  const parametry = useParametry();
  const powrot = bezpiecznyPowrot(useSearchParams().get('powrot')) ?? undefined;
  const tryb = parametry.trybDemonstracyjny;

  return (
    <>
      <NaglowekStrony tytul={teksty.ViewGuideStart.naglowek} wstep={tekst.start.wstep} powrot={false} stronaGlowna />
      <Stos odstep={6} className="max-w-190">
        <Notatka>
          <p>{tekst.dzialajacy({ jednostka: 'u01' })}</p>
        </Notatka>
        <h2 className="m-0 text-section-title text-ink">{tekst.start.sposobyLogowania}</h2>
        <Stos odstep={4} as="ul" className="m-0 list-none p-0">
          {sposoby.map(({ sposob, ikona, makieta }) => (
            <li key={sposob}>
              <KafelekMetody
                href={(!tryb && adresProdukcyjnyLogowania(sposob)) || sciezkaWidoku(makieta)}
                ikona={ikona}
                tytul={tekst.start.sposoby[sposob].tytul}
                opis={tekst.start.sposoby[sposob].opis}
                onClick={() => rozpocznijLogowanie({ sposob, powrot })}
              />
            </li>
          ))}
        </Stos>
        {tryb ? (
          <p className="m-0">
            <Odnosnik
              href={sciezkaWidoku('ViewDemoAccountPicker')}
              ikonaPo="w-prawo"
              onClick={() => rozpocznijLogowanie({ sposob: 'mobywatel', powrot })}
            >
              {tekst.start.wyborKonta}
            </Odnosnik>
          </p>
        ) : null}
      </Stos>
    </>
  );
}
