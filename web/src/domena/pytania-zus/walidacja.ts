// Walidacja treści pytania do ZUS (kontrakt, sekcja 7.2). Właściciel: u29 (Pytanie do ZUS, dane konta i odpis aktu urodzenia).

/** Największa liczba znaków treści pytania liczonych ze spacjami po usunięciu spacji z początku i końca. */
export const MAKS_DLUGOSC_PYTANIA = 2000;

/** Treść pytania po usunięciu spacji z początku i końca. */
export function przytnijTrescPytania(t: string): string {
  return t.trim();
}

/** Liczba znaków treści pytania pokazywana w liczniku pola. */
export function dlugoscTresciPytania(t: string): number {
  return przytnijTrescPytania(t).length;
}

/** Błąd treści pytania: 0129 (puste pole albo same spacje), 0130 (ponad 2000 znaków); null, gdy treść jest poprawna. */
export function walidujTrescPytania(t: string): '0129' | '0130' | null {
  const tresc = przytnijTrescPytania(t);
  if (tresc.length === 0) return '0129';
  if (tresc.length > MAKS_DLUGOSC_PYTANIA) return '0130';
  return null;
}
