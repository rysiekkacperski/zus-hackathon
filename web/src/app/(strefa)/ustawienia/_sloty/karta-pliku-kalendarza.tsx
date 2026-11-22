'use client';

// Slot ViewGuideSettings „karta-pliku-kalendarza” w liście slotyUstawien (kontrakt, sekcja 12.4). Właściciel: u18.
// Historyjka 3.2.1.2.1: karta „Terminy w Twoim kalendarzu” otwiera SheetCalendarDownload
// z terminy/_czesci/arkusz-pliku-kalendarza.tsx. Teksty: teksty.ViewGuideSettings.kartaPlikuKalendarza.
import { useState } from 'react';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { Przycisk } from '@/komponenty/przycisk';
import { teksty } from '@/teksty';
import { ArkuszPlikuKalendarza, useTerminyPlikuKalendarza } from '../../terminy/_czesci/arkusz-pliku-kalendarza';
import type { PropsSlotu } from './typy';

const t = teksty.ViewGuideSettings.kartaPlikuKalendarza;

export function SlotKartaPlikuKalendarza({ konto }: PropsSlotu<'sekcja'>) {
  const [otwarte, ustawOtwarte] = useState(false);
  const [komunikat, ustawKomunikat] = useState<'0055' | '0216' | null>(null);
  const terminy = useTerminyPlikuKalendarza();

  // Plik kalendarza zawiera terminy planu rodziny, więc karta dotyczy kont z rolą Rodzic i Drugi rodzic.
  if (konto.rola !== 'rodzic' && konto.rola !== 'drugi-rodzic') return null;

  function otworz() {
    if (terminy.length === 0) {
      ustawKomunikat('0216');
      return;
    }
    ustawKomunikat(null);
    ustawOtwarte(true);
  }

  return (
    <Karta tytul={t.tytul} bezLinii>
      <div className="flex flex-col gap-6">
        {komunikat ? <Komunikat kod={komunikat} /> : null}
        <p className="m-0 text-body">{t.wstep}</p>
        <Przycisk wariant="drugorzedny" ikona="kalendarz-pobierz" onClick={otworz} className="self-start">
          {t.przycisk}
        </Przycisk>
      </div>
      <ArkuszPlikuKalendarza
        otwarte={otwarte}
        onZamknij={() => ustawOtwarte(false)}
        onPobrano={() => ustawKomunikat('0055')}
      />
    </Karta>
  );
}
