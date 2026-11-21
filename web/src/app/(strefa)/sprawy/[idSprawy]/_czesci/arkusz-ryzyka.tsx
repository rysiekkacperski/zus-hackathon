'use client';

// SheetRiskDetails (kontrakt, tabela 2.3): arkusz na ViewCaseDetails (K28, K29, ?arkusz=ryzyko) i ViewFamilyPlan (slot ostrzeżeń). Właściciel: u22.
// Teksty: teksty.SheetRiskDetails.
// Zaślepka fundamentu: właściciel zastępuje treść z zachowaniem nazwy eksportu i może rozszerzyć propsy.
export interface ArkuszRyzykaProps {
  otwarte: boolean;
  onZamknij: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- zaślepka: propsy wykorzystuje właściciel
export function ArkuszRyzyka(props: ArkuszRyzykaProps) {
  return null;
}
