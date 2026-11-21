// Przyjęcie dziecka na wychowanie (kontrakt, sekcja 7.2). Właściciel: u24 (Przyjęcie dziecka na wychowanie).
// Zaślepka fundamentu: implementuje u24. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { BledyPol, DataISO, FormaPrzyjecia, Katalog, Pesel } from '@/domena/typy';

/** Pola formularza ViewProfileChildAdoption; kształt ustala właściciel (u24). */
export type FormularzPrzyjecia = Record<string, unknown>;

/** Rola rodzica przyjmującego z płci zakodowanej w numerze PESEL. */
export function proponujRoleZPesel(p: Pesel): 'matka' | 'ojciec' {
  return 'matka';
}

/** Błędy danych przyjęcia: 0006, 0010, 0088, 0089, 0090, 0163, 0191, 0125. */
export function walidujDanePrzyjecia(f: FormularzPrzyjecia, dzis: DataISO): BledyPol<string> {
  return {};
}

/** Wiek dziecka w latach, do którego przysługuje urlop na warunkach urlopu macierzyńskiego. */
export function wiekGraniczny(forma: FormaPrzyjecia, odroczenie: boolean, katalog: Katalog): number {
  throw new Error('Zaślepka: u24');
}
