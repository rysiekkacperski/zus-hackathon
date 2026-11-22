// Numery potwierdzeń i identyfikatory symulowanego ZUS w REST API. Licznik dzienny prefiksu żyje w pamięci procesu
// serwera (obiekt globalny przetrwa przeładowanie modułu w serwerze deweloperskim), więc po restarcie serwera numeracja
// dnia zaczyna się od 0001. Format numeru jest ten sam co w przeglądarce: 'ZAM-DEMO-20261121-0001'.
import { losowyCiag } from '@/dane/magazyn/losowanie';
import { idZLosowych, kluczLicznikaPotwierdzen, numerPotwierdzenia, type PrefiksPotwierdzenia } from '@/domena/numery';
import type { DataISO, ZnacznikCzasu } from '@/domena/typy';

const globalny = globalThis as typeof globalThis & { __licznikiPotwierdzenApi?: Map<string, number> };
const liczniki = (globalny.__licznikiPotwierdzenApi ??= new Map<string, number>());

export function nastepnyNumerPotwierdzenia(prefiks: PrefiksPotwierdzenia, dzis: DataISO): string {
  const klucz = kluczLicznikaPotwierdzen(prefiks, dzis);
  const kolejny = (liczniki.get(klucz) ?? 0) + 1;
  liczniki.set(klucz, kolejny > 9999 ? 1 : kolejny);
  return numerPotwierdzenia(prefiks, dzis, kolejny > 9999 ? 1 : kolejny);
}

/** Identyfikator rekordu z chwili i 6 losowych znaków, na przykład 'PYT-20261121101500-K7Q2AB'. */
export function identyfikator(prefiks: string, teraz: ZnacznikCzasu): string {
  return idZLosowych(prefiks, teraz, losowyCiag(6));
}
