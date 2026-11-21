'use client';

// ViewGuideWelcome (kontrakt, tabela 2.2). Właściciel: u02. Wzór: cz1/Powitanie.dc.html.
// Historyjka 3.1.1.1.1 (zadanie 3, KA-03, KA-06, KA-10, KA-12) i 3.1.1.2.1 (KA-12).
import { Ikona, type NazwaIkony } from '@/komponenty/ikona';
import { Karta } from '@/komponenty/karta';
import { ListaKrokow } from '@/komponenty/kroki';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { useNawigacjaZLadowaniem, useStanChwilowy } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { Przycisk } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { Stos } from '@/komponenty/uklad';
import type { RodzajDecyzjiOZgodzie } from '@/domena/typy';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { teksty } from '@/teksty';
import { ArkuszZgody } from './_czesci/arkusz-zgody';

const t = teksty.ViewGuideWelcome;

const POZYCJE: readonly { klucz: 'plan' | 'terminy' | 'wnioski' | 'kalkulator'; ikona: NazwaIkony }[] = [
  { klucz: 'plan', ikona: 'plan' },
  { klucz: 'terminy', ikona: 'kalendarz' },
  { klucz: 'wnioski', ikona: 'wnioski' },
  { klucz: 'kalkulator', ikona: 'kalkulator' },
];

export function WidokPowitania() {
  // Ładowanie na „Rozpocznij” trwa do pokazania profilu na start; arkusz i ładowanie nie wracają po powrocie.
  const { zajety, przejdz } = useNawigacjaZLadowaniem();
  const [arkuszOtwarty, ustawArkuszOtwarty] = useStanChwilowy(false);

  function poDecyzji(rodzaj: RodzajDecyzjiOZgodzie) {
    // Nowy użytkownik z decyzją o zgodzie przechodzi do profilu na start; po odmowie z komunikatem 0004.
    if (rodzaj === 'odmowa') ustawKomunikatPoPrzejsciu({ kod: '0004', dlaWidoku: 'ViewProfileZusData' });
    ustawArkuszOtwarty(false);
    przejdz(trasy.ViewProfileZusData());
  }

  return (
    <>
      {/* Kolumna wyśrodkowana w obszarze treści; od lg także w pionie, gdy treść jest niższa niż okno
          (wysokość okna minus nagłówek ramy 5rem i odstępy main pt-6 i pb-16). */}
      <div className="mx-auto flex w-full max-w-[66rem] min-w-0 flex-col lg:min-h-[calc(100dvh-var(--spacing-header)-5.5rem)] lg:justify-center">
        <NaglowekStrony
          tytul={t.naglowek}
          wstep={t.wstep}
          powrot={false}
          className="[&>div:first-child]:justify-center [&>div:first-child]:text-center [&>div:first-child>div]:items-center"
        />
        <Stos odstep={7.5}>
          <Karta tytul={t.coZrobisz.tytul} bezLinii>
            <ul className="m-0 flex list-none flex-wrap gap-4 p-0">
              {POZYCJE.map(({ klucz, ikona }) => (
                <li key={klucz} className="box-border min-w-0 flex-[1_1_12.5rem] rounded-md bg-surface-page p-5">
                  <Ikona nazwa={ikona} className="text-brand" />
                  <h3 className="mt-3 mb-1 text-body-strong text-ink">{t.coZrobisz[klucz].tytul}</h3>
                  <p className="m-0 text-body">{t.coZrobisz[klucz].opis}</p>
                </li>
              ))}
            </ul>
          </Karta>
          <Karta tytul={t.jakZaczniesz.tytul} bezLinii>
            <div className="flex flex-wrap items-start gap-7.5">
              <div className="min-w-0 flex-[1_1_26.25rem]">
                <ListaKrokow kroki={[...t.jakZaczniesz.kroki]} />
              </div>
              <div className="flex min-w-0 flex-[1_1_18.75rem] flex-col gap-3">
                <h3 className="m-0 mb-1 text-body-strong text-ink">{t.jakZaczniesz.twojeDane}</h3>
                {t.jakZaczniesz.notatki.map((notatka) => (
                  <Notatka key={notatka}>
                    <p>{notatka}</p>
                  </Notatka>
                ))}
              </div>
            </div>
            <div className="mt-7.5 flex justify-center">
              <Przycisk wariant="glowny" szerokosc="szeroka" zajety={zajety} onClick={() => ustawArkuszOtwarty(true)}>
                {t.rozpocznij}
              </Przycisk>
            </div>
          </Karta>
        </Stos>
      </div>
      <ArkuszZgody
        otwarte={arkuszOtwarty}
        onZamknij={() => ustawArkuszOtwarty(false)}
        kontekst="powitanie"
        onZapisano={poDecyzji}
      />
    </>
  );
}
