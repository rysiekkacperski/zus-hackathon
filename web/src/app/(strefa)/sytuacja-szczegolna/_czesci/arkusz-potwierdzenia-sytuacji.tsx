'use client';

// SheetSpecialSituationConfirm (kontrakt, tabela 2.3): arkusz na ViewSpecialSituation. Właściciel: u25.
// Teksty: teksty.SheetSpecialSituationConfirm.
// Zaślepka fundamentu: właściciel zastępuje treść z zachowaniem nazwy eksportu i może rozszerzyć propsy.
export interface ArkuszPotwierdzeniaSytuacjiProps {
  otwarte: boolean;
  onZamknij: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- zaślepka: propsy wykorzystuje właściciel
export function ArkuszPotwierdzeniaSytuacji(props: ArkuszPotwierdzeniaSytuacjiProps) {
  return null;
}
