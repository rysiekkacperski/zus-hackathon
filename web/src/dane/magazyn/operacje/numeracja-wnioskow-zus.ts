// Wysyłka wniosku ZAM, ZAS-53 i Z-15 do REST API symulowanego ZUS z numeracją potwierdzeń tej przeglądarki.
// Przeglądarka podaje w żądaniu ostatni numer dnia, który dostała dla rodzaju wniosku (StanGlobalny.licznikiPotwierdzen),
// a po przyjęciu wniosku zapamiętuje numer z odpowiedzi. Serwer nadaje numer wyższy od podanego, więc kolejne wnioski
// tej przeglądarki mają różne numery także po restarcie serwera i na innej instancji usługi.
import { wyslijWniosekDoZus, type OpcjeWywolania } from '@/dane/api/klient';
import { odczytajGlobalne, wykonajOperacje, zmienGlobalne } from '@/dane/magazyn/stan';
import { kluczLicznikaPotwierdzen, type PrefiksPotwierdzenia } from '@/domena/numery';
import type { WniosekDoZusApi, ZadanieWnioskuDoZusApi } from '@/domena/typy/api-v1';

const PREFIKSY: Record<WniosekDoZusApi['rodzaj'], PrefiksPotwierdzenia> = { zam: 'ZAM-DEMO', 'zas-53': 'ZAS53-DEMO', 'z-15': 'Z15-DEMO' };

/** Ostatni numer dnia z licznika przeglądarki dla rodzaju wniosku; 0, gdy dnia nie podano albo numeru jeszcze nie było. */
function ostatniNumerDnia(z: ZadanieWnioskuDoZusApi): number {
  const dzis = z.dzis ?? z.teraz?.slice(0, 10);
  if (dzis === undefined) return 0;
  return odczytajGlobalne().licznikiPotwierdzen[kluczLicznikaPotwierdzen(PREFIKSY[z.wniosek.rodzaj], dzis)] ?? 0;
}

/** Zapamiętuje numer potwierdzenia 'PREFIKS-RRRRMMDD-NNNN' w liczniku dziennym, gdy jest wyższy od zapamiętanego. */
export function zapamietajNumerPotwierdzenia(potwierdzenie: string): void {
  const m = /^(.+)-(\d{4})$/.exec(potwierdzenie);
  if (m === null) return;
  const [, klucz, numer] = m;
  const kolejny = Number(numer);
  if ((odczytajGlobalne().licznikiPotwierdzen[klucz] ?? 0) >= kolejny) return;
  zmienGlobalne((g) => ({ ...g, licznikiPotwierdzen: { ...g.licznikiPotwierdzen, [klucz]: kolejny } }), 'systemowe');
}

/** POST /api/v1/zus/wnioski z ostatnim numerem dnia tej przeglądarki; numer z odpowiedzi trafia do licznika dziennego. */
export async function wyslijWniosekDoZusZNumeracja(z: ZadanieWnioskuDoZusApi, o?: OpcjeWywolania) {
  const odpowiedz = await wyslijWniosekDoZus({ ...z, ostatniNumerPotwierdzenia: ostatniNumerDnia(z) }, o);
  if (odpowiedz.ok) wykonajOperacje(() => zapamietajNumerPotwierdzenia(odpowiedz.wartosc.potwierdzenie));
  return odpowiedz;
}
