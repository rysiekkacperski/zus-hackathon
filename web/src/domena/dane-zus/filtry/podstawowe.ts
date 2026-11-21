// Filtr odczytu danych z konta ZUS `podstawowe` (kontrakt, sekcja 7.2). Właściciel: u03 (Odczyt danych z konta ZUS).
// Zostawia przy każdym tytule podstawy składek z ostatnich 12 miesięcy tytułu i zasiłki wypłacone w ostatnich 6 miesiącach.
//
// Okno podstaw składek tytułu kończy się miesiącem odczytu, a przy tytule, który ustał, miesiącem końca tytułu,
// i obejmuje 12 miesięcy wstecz włącznie. Okno zasiłków obejmuje dni od dnia odczytu minus 6 miesięcy do dnia odczytu.
import { dataZeZnacznika, dodajMiesiace, dodajMiesiaceDoMiesiaca, miesiacZDaty, porownajDaty } from '@/domena/daty';
import type { FiltrOdczytu } from '@/domena/dane-zus/filtry/typ';
import type { DataISO, MiesiacISO, TytulUbezpieczenia, ZasilekWyplacony } from '@/domena/typy';

/** Liczba miesięcy podstaw składek w kopii. */
export const OKNO_PODSTAW_MIESIACE = 12;
/** Liczba miesięcy zasiłków w kopii. */
export const OKNO_ZASILKOW_MIESIACE = 6;

/** Ostatni miesiąc okna podstaw składek tytułu przy odczycie w dniu `dzien`. */
export function koniecOknaPodstaw(tytul: Pick<TytulUbezpieczenia, 'do'>, dzien: DataISO): MiesiacISO {
  const miesiacOdczytu = miesiacZDaty(dzien);
  if (tytul.do === undefined) return miesiacOdczytu;
  const miesiacKonca = miesiacZDaty(tytul.do);
  return miesiacKonca < miesiacOdczytu ? miesiacKonca : miesiacOdczytu;
}

/** Podstawy składek tytułu z ostatnich 12 miesięcy tytułu, posortowane według miesiąca. */
export function podstawyZOkna(tytul: TytulUbezpieczenia, dzien: DataISO): TytulUbezpieczenia['podstawySkladek'] {
  const koniec = koniecOknaPodstaw(tytul, dzien);
  const poczatek = dodajMiesiaceDoMiesiaca(koniec, -(OKNO_PODSTAW_MIESIACE - 1));
  return tytul.podstawySkladek
    .filter((p) => p.miesiac >= poczatek && p.miesiac <= koniec)
    .map((p) => ({ ...p }))
    .sort((a, b) => (a.miesiac < b.miesiac ? -1 : a.miesiac > b.miesiac ? 1 : 0));
}

/** Zasiłki wypłacone w ostatnich 6 miesiącach przed dniem odczytu, od najnowszego. */
export function zasilkiZOkna(zasilki: ZasilekWyplacony[], dzien: DataISO): ZasilekWyplacony[] {
  const poczatek = dodajMiesiace(dzien, -OKNO_ZASILKOW_MIESIACE);
  return zasilki
    .filter((z) => porownajDaty(z.dataWyplaty, poczatek) >= 0 && porownajDaty(z.dataWyplaty, dzien) <= 0)
    .map((z) => ({ ...z }))
    .sort((a, b) => porownajDaty(b.dataWyplaty, a.dataWyplaty));
}

export const podstawowe: FiltrOdczytu = (kopia, w) => {
  const dzien = dataZeZnacznika(w.teraz);
  return {
    ...kopia,
    tytuly: kopia.tytuly.map((tytul) => ({ ...tytul, podstawySkladek: podstawyZOkna(tytul, dzien) })),
    zasilki: zasilkiZOkna(kopia.zasilki, dzien),
  };
};
