'use client';

// SheetContributionPaidConfirm (kontrakt, tabela 2.3): arkusz na ViewFamilyPlan. Właściciel: u12.
// Teksty: teksty.SheetContributionPaidConfirm.
// Zaślepka fundamentu: właściciel zastępuje treść z zachowaniem nazwy eksportu i może rozszerzyć propsy.
export interface ArkuszPotwierdzeniaSkladekProps {
  otwarte: boolean;
  onZamknij: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- zaślepka: propsy wykorzystuje właściciel
export function ArkuszPotwierdzeniaSkladek(props: ArkuszPotwierdzeniaSkladekProps) {
  return null;
}
