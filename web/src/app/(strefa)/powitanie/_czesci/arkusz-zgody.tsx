'use client';

// SheetHealthDataConsent (kontrakt, tabela 2.3): arkusz na ViewGuideWelcome i ViewGuideSettings. Właściciel: u02.
// Teksty: teksty.SheetHealthDataConsent.
// Zaślepka fundamentu: właściciel zastępuje treść z zachowaniem nazwy eksportu i może rozszerzyć propsy.
export interface ArkuszZgodyProps {
  otwarte: boolean;
  onZamknij: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- zaślepka: propsy wykorzystuje właściciel
export function ArkuszZgody(props: ArkuszZgodyProps) {
  return null;
}
