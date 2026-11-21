'use client';

// ModalStatementsText (kontrakt, tabela 2.3): okno modalne na ViewZamStatements. Właściciel: u27.
// Teksty: teksty.ModalStatementsText.
// Zaślepka fundamentu: właściciel zastępuje treść z zachowaniem nazwy eksportu i może rozszerzyć propsy.
export interface OknoTresciOswiadczenProps {
  otwarte: boolean;
  onZamknij: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- zaślepka: propsy wykorzystuje właściciel
export function OknoTresciOswiadczen(props: OknoTresciOswiadczenProps) {
  return null;
}
