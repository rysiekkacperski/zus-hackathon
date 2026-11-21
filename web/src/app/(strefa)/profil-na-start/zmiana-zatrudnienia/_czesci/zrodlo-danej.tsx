// Część ViewProfileEmploymentChange (u10): oznaczenie źródła danej ze wzorów P03-14…P03-17 („Źródło: konto ZUS”,
// „Źródło: Twoja odpowiedź”) z ikoną bazy danych.
import type { ZrodloDanej } from '@/domena/typy';
import { Ikona } from '@/komponenty/ikona';
import { teksty } from '@/teksty';

export function ZrodloDanejPola({ zrodlo }: { zrodlo: ZrodloDanej }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2 text-small-strong text-ink">
      <Ikona nazwa="baza-danych" rozmiar={20} className="text-brand" />
      {teksty.ViewProfileEmploymentChange.zrodla[zrodlo]}
    </span>
  );
}
