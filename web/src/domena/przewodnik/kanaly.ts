// Wybór kanału załatwienia sprawy (kontrakt, sekcja 7.2). Właściciel: u17 (Instrukcje spraw i przejścia do kanałów).
// Zaślepka fundamentu: implementuje u17. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { DaneRodziny, IdWidoku, KanalPozycji, Katalog, PozycjaPlanu, RodzajPozycji } from '@/domena/typy';

export type KanalZewnetrzny = Extract<KanalPozycji, { typ: 'zewnetrzny' }>['kanal'];

export type WyborKanalu =
  | { typ: 'kreator'; idWidoku: IdWidoku }
  | { typ: 'zewnetrzny'; adres: string; kanal: KanalZewnetrzny }
  | { typ: 'brak-akcji' }
  | { typ: 'u-pracodawcy' };

/** Kanał sprawy według formy zatrudnienia i trybu demonstracyjnego. */
export function wybierzKanal(
  sprawa: PozycjaPlanu,
  daneRodziny: DaneRodziny,
  katalog: Katalog,
  tryb: { demonstracyjny: boolean; mobywatelZainstalowany: boolean },
): WyborKanalu {
  return { typ: 'brak-akcji' };
}

/** Oznaczenie sprawy po powrocie z kanału: świadczenie złożone, pozostałe załatwione. */
export function rodzajOznaczenia(rodzaj: RodzajPozycji): 'zlozona' | 'zalatwiona' {
  return 'zalatwiona';
}
