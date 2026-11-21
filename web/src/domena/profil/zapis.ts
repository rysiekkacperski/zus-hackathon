// Zapis Profilu rodziny ze szkicu (kontrakt, sekcja 7.2). Właściciel: u11 (Profil na start: drugi rodzic, podsumowanie i zapis).
// Zaślepka fundamentu: implementuje u11. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type {
  BledyPol,
  DaneCiazyIDziecka,
  DaneRodziny,
  IdRodziny,
  Pesel,
  SzkicProfilu,
  ZnacznikCzasu,
} from '@/domena/typy';

/** Pola formularza ViewProfileSecondParent; kształt ustala właściciel (u11). */
export type FormularzDrugiegoRodzica = Record<string, unknown>;

/** Dane rodziny i Dane ciąży i dziecka zbudowane ze szkicu z filtrem zgody. */
export function zbudujProfilZeSzkicu(
  szkic: SzkicProfilu,
  zgoda: boolean,
  idRodziny: IdRodziny,
  pesel: Pesel,
  teraz: ZnacznikCzasu,
): { daneRodziny: DaneRodziny; daneCiazy: DaneCiazyIDziecka | null } {
  throw new Error('Zaślepka: u11');
}

/** Ścieżki pól, które różnią się między `przed` a `po`. */
export function zmienionePola(przed: object, po: object): string[] {
  return [];
}

/** Błędy danych drugiego rodzica. */
export function walidujDrugiegoRodzica(f: FormularzDrugiegoRodzica): BledyPol<string> {
  return {};
}
