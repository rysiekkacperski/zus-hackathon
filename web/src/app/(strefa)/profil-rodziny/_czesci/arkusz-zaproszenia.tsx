'use client';

// SheetInviteSecondParent (kontrakt, tabela 2.3): arkusz na ViewProfileSummary (slot drugiego rodzica). Właściciel: u23.
// Teksty: teksty.SheetInviteSecondParent.
// Zaślepka fundamentu: właściciel zastępuje treść z zachowaniem nazwy eksportu i może rozszerzyć propsy.
export interface ArkuszZaproszeniaProps {
  otwarte: boolean;
  onZamknij: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- zaślepka: propsy wykorzystuje właściciel
export function ArkuszZaproszenia(props: ArkuszZaproszeniaProps) {
  return null;
}
