'use client';

// SheetZas53ManualCertificate (kontrakt, tabela 2.3): arkusz na ViewZas53Certificate. Właściciel: u30.
// Teksty: teksty.SheetZas53ManualCertificate.
// Zaślepka fundamentu: właściciel zastępuje treść z zachowaniem nazwy eksportu i może rozszerzyć propsy.
export interface ArkuszZaswiadczeniaSpozaListyProps {
  otwarte: boolean;
  onZamknij: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- zaślepka: propsy wykorzystuje właściciel
export function ArkuszZaswiadczeniaSpozaListy(props: ArkuszZaswiadczeniaSpozaListyProps) {
  return null;
}
