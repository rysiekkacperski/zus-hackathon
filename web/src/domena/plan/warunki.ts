// Warunki spraw planu według pozycji katalogu (kontrakt, sekcja 7.2). Właściciel: u08 (Silnik planu rodziny).
// Zaślepka fundamentu: implementuje u08. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
import type { WejsciePlanu } from '@/domena/przeliczenie';
import type { IdPozycji, RodzicSprawy } from '@/domena/typy';

export type WarunekSprawy = (w: WejsciePlanu) => { spelniony: boolean; rodzic: RodzicSprawy; wymagaUzupelnienia?: boolean };

/** Warunek każdej pozycji katalogu K01–K37. */
export const warunkiSpraw: Record<IdPozycji, WarunekSprawy> = {};
