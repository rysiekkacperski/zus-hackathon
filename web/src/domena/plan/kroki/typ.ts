// Podpis kroku planu (kontrakt, sekcja 7.2): krok dostaje pozycje z poprzednich kroków i wejście planu,
// zwraca nową listę pozycji. Kroki są czyste i nie zmieniają przekazanych obiektów.
import type { WejsciePlanu } from '@/domena/przeliczenie';
import type { PozycjaPlanu } from '@/domena/typy';

export type KrokPlanu = (pozycje: PozycjaPlanu[], w: WejsciePlanu) => PozycjaPlanu[];
