// Prawo do wniosku ZAM, rodzaje urlopu i walidacja danych wniosku (kontrakt, sekcja 7.2).
// Właściciel: u27 (Kreator wniosku ZAM do ZUS).
// Zaślepka fundamentu: implementuje u27. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type {
  BledyPol,
  DataISO,
  IdSprawy,
  IdWidoku,
  KodKomunikatu,
  KontoPrzewodnika,
  PlanRodziny,
  RodzajUrlopu,
  Rola,
  StanRodziny,
} from '@/domena/typy';

export type TrybWnioskuZam = 'przed-porodem' | 'po-porodzie' | 'przyjecie' | 'przejecie';

/** Wejście sprawdzenia prawa do wniosku ZAM; kształt ustala właściciel (u27). */
export interface WejsciePrawaDoWnioskuZam {
  konto: KontoPrzewodnika;
  rodzina: StanRodziny | null;
  idSprawy: IdSprawy;
  dzis: DataISO;
}

/** Pola formularza ViewZamData; kształt ustala właściciel (u27). */
export type FormularzDanychZam = Record<string, unknown>;

/** Ekran startowy kreatora ZAM z komunikatem i trybem (0036, 0064, 0037, ViewProfilePayer). */
export function sprawdzPrawoDoWnioskuZam(w: WejsciePrawaDoWnioskuZam): {
  cel: IdWidoku;
  kod?: KodKomunikatu;
  tryb?: TrybWnioskuZam;
} {
  return { cel: 'ViewZamLeaveType' };
}

/** Rodzaje urlopu dostępne we wniosku ZAM dla roli i trybu. */
export function dostepneRodzajeUrlopu(rola: Rola, plan: PlanRodziny | null, tryb: TrybWnioskuZam): RodzajUrlopu[] {
  return [];
}

/** Błędy danych wniosku ZAM: 0062, 0024–0031, 0039–0041. */
export function walidujDaneZam(f: FormularzDanychZam): BledyPol<string> {
  return {};
}
