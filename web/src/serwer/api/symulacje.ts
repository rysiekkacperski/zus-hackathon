// Przełączniki symulacji z ustawień demo w żądaniach REST API (ParametrySystemu.symulacje). Przeglądarka trzyma
// ustawienia demo u siebie, więc przekazuje włączone przełączniki w polu `symulacje` albo w nagłówku X-Symulacje.
import type { SymulacjaApi } from '@/domena/typy/api-v1';
import { czyObiekt, type Obiekt } from '@/serwer/api/walidacja';

export const NAGLOWEK_SYMULACJI = 'x-symulacje';

export const SYMULACJE_API: readonly SymulacjaApi[] = [
  'daneZusNiedostepne',
  'stanRozliczenNiedostepny',
  'wysylkaDoZusNiedostepna',
  'pueEzusNiedostepne',
];

function czySymulacjaApi(w: unknown): w is SymulacjaApi {
  return typeof w === 'string' && (SYMULACJE_API as readonly string[]).includes(w);
}

/** Włączone przełączniki z nagłówka, parametru adresu `symulacje` i pola `symulacje` treści żądania. */
export function symulacjeZadania(zadanie: Request, tresc?: Obiekt): ReadonlySet<SymulacjaApi> {
  const wlaczone = new Set<SymulacjaApi>();
  const zTekstu = (tekst: string | null) => {
    for (const nazwa of (tekst ?? '').split(',').map((n) => n.trim())) if (czySymulacjaApi(nazwa)) wlaczone.add(nazwa);
  };
  zTekstu(zadanie.headers.get(NAGLOWEK_SYMULACJI));
  zTekstu(new URL(zadanie.url).searchParams.get('symulacje'));
  const pole = tresc?.symulacje;
  if (Array.isArray(pole)) for (const nazwa of pole) if (czySymulacjaApi(nazwa)) wlaczone.add(nazwa);
  if (czyObiekt(pole)) for (const [nazwa, wartosc] of Object.entries(pole)) if (wartosc === true && czySymulacjaApi(nazwa)) wlaczone.add(nazwa);
  return wlaczone;
}
