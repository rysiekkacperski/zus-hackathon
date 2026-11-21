'use client';

// Slot ViewGuideSettings „sekcja-danych-rodziny” w liście slotyUstawien (kontrakt, sekcja 12.4). Właściciel: u02.
// Teksty: teksty.ViewGuideSettings.sekcjaDanychRodziny. Wzór: karta „Dane rodziny” w cz1/Ustawienia.dc.html.
// Historyjka 3.1.1.2.1 (zadania 1, 5 i 6; KA-09 do KA-12).
import { useState } from 'react';
import { Karta } from '@/komponenty/karta';
import { Przycisk } from '@/komponenty/przycisk';
import { ArkuszUsunieciaDanychRodziny } from '../_czesci/arkusz-usuniecia-danych-rodziny';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewGuideSettings.sekcjaDanychRodziny;

export function SlotSekcjaDanychRodziny({ konto }: PropsSlotu<'sekcja'>) {
  const [otwarte, ustawOtwarte] = useState(false);

  // Konto administratora nie prowadzi danych rodziny.
  if (konto.rola === 'administrator') return null;

  return (
    <>
      <Karta tytul={t.tytul} bezLinii>
        <div className="flex flex-wrap items-start gap-7.5">
          <div className="flex min-w-0 grow-999 basis-130 flex-col gap-3">
            <p className="m-0 text-body">{t.wstep}</p>
            <ul className="m-0 pl-6 text-body">
              {t.zakres.map((pozycja) => (
                <li key={pozycja}>{pozycja}</li>
              ))}
            </ul>
            <p className="m-0 text-body">{t.termin}</p>
          </div>
          <div className="flex min-w-0 max-w-84 grow basis-70 flex-col gap-4">
            <Przycisk wariant="drugorzedny" szerokosc="pelna" ikona="usun" onClick={() => ustawOtwarte(true)}>
              {t.usun}
            </Przycisk>
          </div>
        </div>
      </Karta>
      <ArkuszUsunieciaDanychRodziny otwarte={otwarte} onZamknij={() => ustawOtwarte(false)} />
    </>
  );
}
