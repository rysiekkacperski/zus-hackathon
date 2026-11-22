'use client';

// Weryfikacja i wyliczenia przykładowej sprawy przez POST /api/v1/przykladowe-sprawy/weryfikacja. Właściciel: u21.
// Serwer weryfikuje ubezpieczenie chorobowe funkcją weryfikujUbezpieczenieChorobowe, liczy każde przysługujące
// świadczenie funkcją wyliczSwiadczeniaSprawy i porównuje je z rozstrzygnięciem funkcją porownajWyliczenieSprawy,
// z katalogiem świadczeń serwera. Ekran weryfikacji i wynik kalkulatora w trybie przykładowej sprawy pokazują
// odpowiedź tego samego żądania, więc obie strony mają te same kwoty.
import { zweryfikujPrzykladowaSprawe } from '@/dane/api/klient';
import { useWyliczenieApi, type WyliczenieApi } from '@/dane/api/wyliczenie';
import type { DataISO, Grosze, SprawaPrzykladowa, ZnacznikCzasu } from '@/domena/typy';
import type { OdpowiedzWeryfikacjiSprawyApi, ZadanieWeryfikacjiSprawyApi } from '@/domena/typy/api-v1';

/** Żądanie weryfikacji z danymi, dokumentami i rozstrzygnięciem sprawy z sesji. */
export function zadanieWeryfikacjiSprawy(sprawa: SprawaPrzykladowa, tolerancja: Grosze, czas: { dzis: DataISO } | { teraz: ZnacznikCzasu }): ZadanieWeryfikacjiSprawyApi {
  return {
    ...czas,
    dane: sprawa.dane,
    dokumenty: sprawa.dokumenty,
    rozstrzygniecie: sprawa.rozstrzygniecie,
    tolerancjaPorownaniaKwotyGrosze: tolerancja,
  };
}

/** Wyliczenia świadczeń sprawy z REST API; `sprawa` równa null pomija wyliczenie. */
export function useWyliczeniaSprawyApi(
  sprawa: SprawaPrzykladowa | null,
  tolerancja: Grosze,
  dzis: DataISO,
): WyliczenieApi<OdpowiedzWeryfikacjiSprawyApi> {
  return useWyliczenieApi(sprawa === null ? null : zadanieWeryfikacjiSprawy(sprawa, tolerancja, { dzis }), zweryfikujPrzykladowaSprawe);
}
