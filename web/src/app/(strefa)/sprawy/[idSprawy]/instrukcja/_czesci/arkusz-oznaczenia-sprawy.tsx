'use client';

// SheetCaseDoneConfirm (kontrakt, tabela 2.3): arkusz na ViewCaseGuide, otwierany automatycznie po powrocie z kanału. Właściciel: u17.
// Teksty: teksty.SheetCaseDoneConfirm.
// Zaślepka fundamentu: właściciel zastępuje treść z zachowaniem nazwy eksportu i może rozszerzyć propsy.
export interface ArkuszOznaczeniaSprawyProps {
  otwarte: boolean;
  onZamknij: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- zaślepka: propsy wykorzystuje właściciel
export function ArkuszOznaczeniaSprawy(props: ArkuszOznaczeniaSprawyProps) {
  return null;
}
