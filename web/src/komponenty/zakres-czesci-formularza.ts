// Zakres próby wysłania formularza z częściami (useCzesciFormularza) na ostatniej części.
//
// Próba wysłania obejmuje pola części odwiedzonych, pola części z pierwszym błędem i pola z błędem spoza podziału.
// Pola części, których rodzic jeszcze nie widział, pokazują błąd dopiero po opuszczeniu pola albo po „Dalej”
// w swojej części.

export interface ZakresProbyWyslania<P extends string> {
  /** Pola do walidacji na bieżąco po próbie wysłania. */
  pola: P[];
  /** Część z pierwszym błędem (od 1) albo null, gdy formularz nie ma błędów albo pole z błędem leży poza podziałem. */
  czescZBledem: number | null;
}

/** Numer części (od 1) zawierającej pole albo null, gdy pole leży poza podziałem. */
export function czescPola<P extends string>(podzial: readonly (readonly P[])[], pole: P): number | null {
  const indeks = podzial.findIndex((pola) => pola.includes(pole));
  return indeks < 0 ? null : indeks + 1;
}

/**
 * Zakres próby wysłania: pola odwiedzone, pola części z pierwszym błędem i pola z bieżącym błędem spoza podziału.
 * `pierwszeZBledem` to pierwsze w kolejności pole z bieżącym błędem w całym formularzu.
 */
export function zakresProbyWyslania<P extends string>(
  podzial: readonly (readonly P[])[],
  odwiedzone: Iterable<P>,
  pierwszeZBledem: P | null,
  bledyAktualne: Partial<Record<P, unknown>> = {},
): ZakresProbyWyslania<P> {
  const pola = new Set<P>(odwiedzone);
  for (const pole of Object.keys(bledyAktualne) as P[]) {
    if (bledyAktualne[pole] && czescPola(podzial, pole) === null) pola.add(pole);
  }
  const czescZBledem = pierwszeZBledem === null ? null : czescPola(podzial, pierwszeZBledem);
  if (pierwszeZBledem !== null) pola.add(pierwszeZBledem);
  if (czescZBledem !== null) for (const pole of podzial[czescZBledem - 1]) pola.add(pole);
  return { pola: [...pola], czescZBledem };
}
