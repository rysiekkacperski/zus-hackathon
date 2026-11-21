// Weryfikacja przykładowej sprawy i zapis wyniku kalkulacji (kontrakt, sekcja 6.5).
// Właściciel: u21 (Przykładowe sprawy: weryfikacja i sprawdzenie wyliczeń).
// Zaślepka fundamentu: implementuje u21. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { KontekstOperacji, WynikOperacji, WynikScenariusza } from '@/domena/typy';

/** Walidacja danych sprawy i zapis wyniku weryfikacji. */
export function zatwierdzDaneSprawy(ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}

/** Zapis wyniku kalkulatora wyliczonego w trybie przykładowej sprawy. */
export function zapiszWynikKalkulacjiSprawy(wynik: WynikScenariusza, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}
