'use client';

// SheetSecondParentRemoveConfirm (kontrakt, tabela 2.3): arkusz na ViewProfileSummary (slot drugiego rodzica). Właściciel: u23.
// Teksty: teksty.SheetSecondParentRemoveConfirm.
// Zaślepka fundamentu: właściciel zastępuje treść z zachowaniem nazwy eksportu i może rozszerzyć propsy.
export interface ArkuszOdlaczeniaProps {
  otwarte: boolean;
  onZamknij: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- zaślepka: propsy wykorzystuje właściciel
export function ArkuszOdlaczenia(props: ArkuszOdlaczeniaProps) {
  return null;
}
