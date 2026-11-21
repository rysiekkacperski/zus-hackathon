'use client';

// SheetCalendarDownload (kontrakt, tabela 2.3): arkusz na ViewDeadlines (slot terminy/_sloty/akcja-pliku-kalendarza.tsx) i ViewGuideSettings (slot ustawienia/_sloty/karta-pliku-kalendarza.tsx). Właściciel: u18.
// Teksty: teksty.SheetCalendarDownload.
// Zaślepka fundamentu: właściciel zastępuje treść z zachowaniem nazwy eksportu i może rozszerzyć propsy.
export interface ArkuszPlikuKalendarzaProps {
  otwarte: boolean;
  onZamknij: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- zaślepka: propsy wykorzystuje właściciel
export function ArkuszPlikuKalendarza(props: ArkuszPlikuKalendarzaProps) {
  return null;
}
