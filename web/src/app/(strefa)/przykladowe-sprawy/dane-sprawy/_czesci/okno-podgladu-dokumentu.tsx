'use client';

// ModalSampleCaseDocument (kontrakt, tabela 2.3): okno modalne na ViewSampleCaseData. Właściciel: u05.
// Teksty: teksty.ModalSampleCaseDocument.
// Zaślepka fundamentu: właściciel zastępuje treść z zachowaniem nazwy eksportu i może rozszerzyć propsy.
export interface OknoPodgladuDokumentuProps {
  otwarte: boolean;
  onZamknij: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- zaślepka: propsy wykorzystuje właściciel
export function OknoPodgladuDokumentu(props: OknoPodgladuDokumentuProps) {
  return null;
}
