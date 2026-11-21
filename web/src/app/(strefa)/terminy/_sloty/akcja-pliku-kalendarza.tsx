'use client';

// Slot ViewDeadlines „akcja-pliku-kalendarza” w liście slotyTerminow (kontrakt, sekcja 12.4). Właściciel: u18.
// Historyjka 3.2.1.2.1: akcja pobrania pliku kalendarza otwiera SheetCalendarDownload, a plan bez spraw
// do zrobienia z terminem zostawia ekran z komunikatem 0216. Teksty: teksty.ViewDeadlines.akcjaPlikuKalendarza.
import { useMemo, useState } from 'react';
import { Komunikat } from '@/komponenty/komunikat';
import { Przycisk } from '@/komponenty/przycisk';
import { terminyDoKalendarza } from '@/domena/przypomnienia/plik-kalendarza';
import { teksty } from '@/teksty';
import { ArkuszPlikuKalendarza } from '../_czesci/arkusz-pliku-kalendarza';
import type { PropsSlotu } from './typy';

export function SlotAkcjaPlikuKalendarza({ kontekst }: PropsSlotu<'akcja'>) {
  const [otwarte, ustawOtwarte] = useState(false);
  const [komunikat, ustawKomunikat] = useState<'0055' | '0216' | null>(null);
  const { rodzina, katalog } = kontekst;
  const liczbaTerminow = useMemo(
    () => terminyDoKalendarza(rodzina.plan, rodzina.kalendarz, katalog).length,
    [rodzina, katalog],
  );

  function otworz() {
    if (liczbaTerminow === 0) {
      ustawKomunikat('0216');
      return;
    }
    ustawKomunikat(null);
    ustawOtwarte(true);
  }

  return (
    <div className="flex min-w-0 flex-col items-start gap-4 md:items-end">
      <Przycisk wariant="drugorzedny" ikona="kalendarz-pobierz" onClick={otworz}>
        {teksty.ViewDeadlines.akcjaPlikuKalendarza.przycisk}
      </Przycisk>
      {komunikat ? <Komunikat kod={komunikat} className="w-full max-w-okno text-left" /> : null}
      <ArkuszPlikuKalendarza
        otwarte={otwarte}
        onZamknij={() => ustawOtwarte(false)}
        onPobrano={() => ustawKomunikat('0055')}
      />
    </div>
  );
}
