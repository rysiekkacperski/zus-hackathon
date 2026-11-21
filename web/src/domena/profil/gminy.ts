// Wyszukiwanie gminy w Profilu na start (kontrakt, sekcja 7.2). Właściciel: u10 (Profil na start: ciąża, zmiana zatrudnienia, rodzina).
// Wymaganie Słownik gmin: pole gminy podpowiada gminy, których nazwa zawiera wpisany tekst, z powiatem i województwem.
import type { Gmina } from '@/domena/typy';

function normalizuj(tekst: string): string {
  return tekst.trim().toLocaleLowerCase('pl-PL');
}

/** Gminy, których nazwa zawiera fragment `tekst`, bez rozróżniania wielkości liter, w kolejności alfabetycznej. */
export function wyszukajGminy(tekst: string, gminy: readonly Gmina[]): Gmina[] {
  const fragment = normalizuj(tekst);
  if (fragment === '') return [];
  return gminy
    .filter((g) => normalizuj(g.nazwa).includes(fragment))
    .sort((a, b) => a.nazwa.localeCompare(b.nazwa, 'pl-PL'));
}

/** Gmina słownika o nazwie dokładnie równej wpisanemu tekstowi (bez rozróżniania wielkości liter); null przy braku albo kilku. */
export function gminaODokladnejNazwie(tekst: string, gminy: readonly Gmina[]): Gmina | null {
  const nazwa = normalizuj(tekst);
  if (nazwa === '') return null;
  const pasujace = gminy.filter((g) => normalizuj(g.nazwa) === nazwa);
  return pasujace.length === 1 ? pasujace[0] : null;
}
