// Okresy zasiłku po stracie dziecka, po przyjęciu dziecka i przy łączeniu z pracą (kontrakt, sekcja 7.2).
// Właściciel: u09 (Silnik kalkulatora zasiłku macierzyńskiego).
// Zaślepka fundamentu: implementuje u09. Kontrakt nie podaje parametrów okresyPoPrzyjeciu; ustala je właściciel.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { DataISO, Katalog, Okres } from '@/domena/typy';

export type RodzajStraty = 'martwe-urodzenie' | 'zgon-dziecka' | 'poronienie';

/** Okres zasiłku macierzyńskiego po stracie dziecka. Zaślepka zwraca dzień porodu. */
export function okresZasilkuPoStracie(
  dataPorodu: DataISO,
  rodzaj: RodzajStraty,
  dataZgonu: DataISO | undefined,
  katalog: Katalog,
): Okres {
  return { od: dataPorodu, do: dataPorodu };
}

/** Okresy urlopów po przyjęciu dziecka na wychowanie. */
export function okresyPoPrzyjeciu(...argumenty: unknown[]): Okres[] {
  return [];
}

/** Dni wydłużenia urlopu rodzicielskiego przy łączeniu z pracą w wymiarze `wymiar` etatu. */
export function wydluzeniePrzyLaczeniu(dni: number, wymiar: number): number {
  return 0;
}
