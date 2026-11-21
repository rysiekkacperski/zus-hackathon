'use client';

// SheetConsentWithdrawConfirm (kontrakt, tabela 2.3): arkusz na ViewGuideSettings. Właściciel: u02.
// Teksty: teksty.SheetConsentWithdrawConfirm.
// Zaślepka fundamentu: właściciel zastępuje treść z zachowaniem nazwy eksportu i może rozszerzyć propsy.
export interface ArkuszWycofaniaZgodyProps {
  otwarte: boolean;
  onZamknij: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- zaślepka: propsy wykorzystuje właściciel
export function ArkuszWycofaniaZgody(props: ArkuszWycofaniaZgodyProps) {
  return null;
}
