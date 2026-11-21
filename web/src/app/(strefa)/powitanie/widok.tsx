'use client';

// ViewGuideWelcome (kontrakt, tabela 2.2). Właściciel: u02. Wzór: cz1/Powitanie.dc.html.
// Historyjka 3.1.1.1.1 (zadanie 3, KA-03, KA-06, KA-10, KA-12) i 3.1.1.2.1 (KA-12).
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Ikona, type NazwaIkony } from '@/komponenty/ikona';
import { Karta } from '@/komponenty/karta';
import { ListaKrokow } from '@/komponenty/kroki';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
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
  const router = useRouter();
  const [arkuszOtwarty, ustawArkuszOtwarty] = useState(false);

  function poDecyzji(rodzaj: RodzajDecyzjiOZgodzie) {
    // Nowy użytkownik z decyzją o zgodzie przechodzi do profilu na start; po odmowie z komunikatem 0004.
    if (rodzaj === 'odmowa') ustawKomunikatPoPrzejsciu({ kod: '0004', dlaWidoku: 'ViewProfileZusData' });
    ustawArkuszOtwarty(false);
    router.push(trasy.ViewProfileZusData());
  }

  return (
    <>
      <NaglowekStrony tytul={t.naglowek} wstep={t.wstep} powrot={false} />
      <Stos odstep={7.5} className="max-w-tresc">
        <Karta tytul={t.coZrobisz.tytul} bezLinii>
          <ul className="m-0 flex list-none flex-wrap gap-4 p-0">
            {POZYCJE.map(({ klucz, ikona }) => (
              <li key={klucz} className="box-border min-w-0 flex-[1_1_200px] rounded-md bg-surface-page p-5">
                <Ikona nazwa={ikona} className="text-brand" />
                <h3 className="mt-3 mb-1 text-body-strong text-ink">{t.coZrobisz[klucz].tytul}</h3>
                <p className="m-0 text-body">{t.coZrobisz[klucz].opis}</p>
              </li>
            ))}
          </ul>
        </Karta>
        <Karta tytul={t.jakZaczniesz.tytul} bezLinii>
          <div className="flex flex-wrap items-start gap-7.5">
            <div className="min-w-0 flex-[1_1_420px]">
              <ListaKrokow kroki={[...t.jakZaczniesz.kroki]} />
            </div>
            <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-3">
              <h3 className="m-0 mb-1 text-body-strong text-ink">{t.jakZaczniesz.twojeDane}</h3>
              {t.jakZaczniesz.notatki.map((notatka) => (
                <Notatka key={notatka}>
                  <p>{notatka}</p>
                </Notatka>
              ))}
            </div>
          </div>
          <div className="mt-7.5">
            <Przycisk wariant="glowny" szerokosc="szeroka" onClick={() => ustawArkuszOtwarty(true)}>
              {t.rozpocznij}
            </Przycisk>
          </div>
        </Karta>
      </Stos>
      <ArkuszZgody
        otwarte={arkuszOtwarty}
        onZamknij={() => ustawArkuszOtwarty(false)}
        kontekst="powitanie"
        onZapisano={poDecyzji}
      />
    </>
  );
}
