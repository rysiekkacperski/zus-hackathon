'use client';

// SheetEmploymentChoice (kontrakt, tabela 2.3): arkusz na ViewProfileZusData. Właściciel: u07.
// Teksty: teksty.SheetEmploymentChoice.
// Zaślepka fundamentu: właściciel zastępuje treść z zachowaniem nazwy eksportu i może rozszerzyć propsy.
export interface ArkuszFormyZatrudnieniaProps {
  otwarte: boolean;
  onZamknij: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- zaślepka: propsy wykorzystuje właściciel
export function ArkuszFormyZatrudnienia(props: ArkuszFormyZatrudnieniaProps) {
  return null;
}
