// Numery potwierdzeń i identyfikatory symulowanego ZUS w REST API. Licznik dzienny prefiksu żyje w pamięci procesu
// serwera (obiekt globalny przetrwa przeładowanie modułu w serwerze deweloperskim). Przeglądarka podaje w żądaniu
// ostatni numer dnia, który od usługi dostała, więc po restarcie serwera i na innej instancji numer kolejnego wniosku
// tej przeglądarki jest wyższy od poprzednich. Format numeru jest ten sam co w przeglądarce: 'ZAM-DEMO-20261121-0001'.
import { losowyCiag } from '@/dane/magazyn/losowanie';
import { idZLosowych, kluczLicznikaPotwierdzen, numerPotwierdzenia, type PrefiksPotwierdzenia } from '@/domena/numery';
import type { DataISO, ZnacznikCzasu } from '@/domena/typy';

const globalny = globalThis as typeof globalThis & { __licznikiPotwierdzenApi?: Map<string, number> };
const liczniki = (globalny.__licznikiPotwierdzenApi ??= new Map<string, number>());

/** Kolejny numer dnia po wyższym z licznika serwera i z `ostatniZnany`, czyli ostatniego numeru podanego przez klienta. */
export function nastepnyNumerPotwierdzenia(prefiks: PrefiksPotwierdzenia, dzis: DataISO, ostatniZnany = 0): string {
  const klucz = kluczLicznikaPotwierdzen(prefiks, dzis);
  const kolejny = Math.max(liczniki.get(klucz) ?? 0, ostatniZnany) + 1;
  liczniki.set(klucz, kolejny > 9999 ? 1 : kolejny);
  return numerPotwierdzenia(prefiks, dzis, kolejny > 9999 ? 1 : kolejny);
}

/** Identyfikator rekordu z chwili i 6 losowych znaków, na przykład 'PYT-20261121101500-K7Q2AB'. */
export function identyfikator(prefiks: string, teraz: ZnacznikCzasu): string {
  return idZLosowych(prefiks, teraz, losowyCiag(6));
}
