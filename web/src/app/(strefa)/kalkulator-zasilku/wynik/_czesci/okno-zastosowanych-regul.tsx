'use client';

// ModalCalcAppliedRules (kontrakt, tabela 2.3): okno modalne na ViewCalcMaternityResult. Właściciel: u15.
// Teksty: teksty.ModalCalcAppliedRules.
// Zaślepka fundamentu: właściciel zastępuje treść z zachowaniem nazwy eksportu i może rozszerzyć propsy.
export interface OknoZastosowanychRegulProps {
  otwarte: boolean;
  onZamknij: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- zaślepka: propsy wykorzystuje właściciel
export function OknoZastosowanychRegul(props: OknoZastosowanychRegulProps) {
  return null;
}
