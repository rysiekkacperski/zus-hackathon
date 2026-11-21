// Przejścia do kanałów i oznaczanie spraw jako załatwionych (kontrakt, sekcja 6.5). Właściciel: u17 (Instrukcje spraw i przejścia do kanałów).
// Zaślepka fundamentu: implementuje u17. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { KanalProdukcyjny } from '@/dane/parametry-produkcyjne';
import type { IdSprawy, KontekstOperacji, WynikOperacji } from '@/domena/typy';

/** Adres kanału (symulowany w trybie demonstracyjnym) i zapis oczekującego powrotu z kanału (0035 przy kanalNiedostepny). */
export function przejdzDoKanalu(
  idSprawy: IdSprawy,
  kanal: KanalProdukcyjny,
  ctx: KontekstOperacji,
): WynikOperacji<{ adres: string }> {
  return { ok: false, kod: '0003' };
}

/** Oznaczenie sprawy jako załatwionej albo złożonej (rodzajOznaczenia) przez ustawStatusSprawy. */
export function oznaczSpraweJakoZalatwiona(idSprawy: IdSprawy, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}

export function cofnijOznaczenie(idSprawy: IdSprawy, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}
