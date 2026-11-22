// Opcje wywołań REST API symulowanego ZUS z ustawień demo przeglądarki. Serwer jest „systemem ZUS” i nie zna ustawień demo,
// więc przeglądarka przekazuje w nagłówku X-Symulacje włączone przełączniki symulacji ZUS: daneZusNiedostepne (0001),
// stanRozliczenNiedostepny (0150), wysylkaDoZusNiedostepna (0044) i pueEzusNiedostepne (0133). Poza trybem demonstracyjnym
// przełączniki nie działają, tak jak czySymulacja w magazynie.
import type { OpcjeWywolania } from '@/dane/api/klient';
import { odczytajParametry } from '@/dane/magazyn/stan';
import type { ParametrySystemu } from '@/domena/typy';
import type { SymulacjaApi } from '@/domena/typy/api-v1';

const SYMULACJE_ZUS: readonly SymulacjaApi[] = [
  'daneZusNiedostepne',
  'stanRozliczenNiedostepny',
  'wysylkaDoZusNiedostepna',
  'pueEzusNiedostepne',
];

/** Włączone przełączniki symulacji ZUS; lista pusta poza trybem demonstracyjnym. */
export function wlaczoneSymulacjeZus(parametry: ParametrySystemu = odczytajParametry()): SymulacjaApi[] {
  if (!parametry.trybDemonstracyjny) return [];
  return SYMULACJE_ZUS.filter((nazwa) => parametry.symulacje[nazwa]);
}

/** Opcje wywołania klienta API z przełącznikami symulacji ZUS z ustawień demo. */
export function opcjeSymulowanegoZus(): OpcjeWywolania {
  const symulacje = wlaczoneSymulacjeZus();
  return symulacje.length > 0 ? { symulacje } : {};
}
