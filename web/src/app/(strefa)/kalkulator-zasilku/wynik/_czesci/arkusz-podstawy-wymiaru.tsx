'use client';

// SheetCalcBaseSource (kontrakt, tabela 2.3): arkusz na ViewCalcMaternityResult. Właściciel: u15.
// Teksty: teksty.SheetCalcBaseSource.
// Zaślepka fundamentu: właściciel zastępuje treść z zachowaniem nazwy eksportu i może rozszerzyć propsy.
export interface ArkuszPodstawyWymiaruProps {
  otwarte: boolean;
  onZamknij: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- zaślepka: propsy wykorzystuje właściciel
export function ArkuszPodstawyWymiaru(props: ArkuszPodstawyWymiaruProps) {
  return null;
}
