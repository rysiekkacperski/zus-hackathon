'use client';

// ModalSickLeaveDetails (kontrakt, tabela 2.3): okno modalne na ViewSickLeaveList; gospodarz rejestru zaswiadczenia-e-zla/_sloty/index.ts. Właściciel: u14.
// Teksty: teksty.ModalSickLeaveDetails.
// Zaślepka fundamentu: właściciel zastępuje treść z zachowaniem nazwy eksportu i może rozszerzyć propsy.
export interface OknoSzczegolowZaswiadczeniaProps {
  otwarte: boolean;
  onZamknij: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- zaślepka: propsy wykorzystuje właściciel
export function OknoSzczegolowZaswiadczenia(props: OknoSzczegolowZaswiadczeniaProps) {
  return null;
}
