// Wspólny początek obsługi żądania REST API w wersji 1: treść JSON (dla POST), czas żądania i katalog świadczeń.
import type { KontekstOperacji, Katalog } from '@/domena/typy';
import type { CzasOdpowiedziApi } from '@/domena/typy/api-v1';
import { czasZadania } from '@/serwer/api/czas';
import { katalogSerwera } from '@/serwer/api/katalog';
import { odpowiedzBledowPol } from '@/serwer/api/odpowiedzi';
import { odczytajTresc, type Obiekt } from '@/serwer/api/walidacja';

export interface KontekstZadania { tresc: Obiekt; czas: KontekstOperacji; katalog: Katalog }

/** Treść, czas i katalog żądania POST albo gotowa odpowiedź błędu (0006 przy treści innej niż obiekt JSON, 0010 przy dacie). */
export async function przygotujPost(zadanie: Request): Promise<KontekstZadania | Response> {
  const odczyt = await odczytajTresc(zadanie);
  if (!odczyt.ok) return odczyt.odpowiedz;
  const czas = await czasZadania(zadanie, odczyt.tresc);
  if (!czas.ok) return odpowiedzBledowPol(czas.bledy) as Response;
  return { tresc: odczyt.tresc, czas: czas.czas, katalog: await katalogSerwera() };
}

/** Czas i katalog żądania GET z parametrów adresu albo gotowa odpowiedź błędu. */
export async function przygotujGet(zadanie: Request): Promise<KontekstZadania | Response> {
  const czas = await czasZadania(zadanie);
  if (!czas.ok) return odpowiedzBledowPol(czas.bledy) as Response;
  return { tresc: {}, czas: czas.czas, katalog: await katalogSerwera() };
}

export function czasOdpowiedzi(k: KontekstZadania): CzasOdpowiedziApi {
  return { dzis: k.czas.dzis, teraz: k.czas.teraz, wersjaKatalogu: k.katalog.wersja };
}
