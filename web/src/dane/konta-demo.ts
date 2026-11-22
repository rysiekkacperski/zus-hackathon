// Rejestr kont demonstracyjnych prototypu (kontrakt, sekcja 8; historyjka 3.1.1.1.3).
// Element systemu: Konto i uwierzytelnianie. Etykiety form zatrudnienia z `kluczOpisuFormy` leżą w `teksty.ts`.
import { kontaMocodawcowZus, pelnomocnictwaKontZus } from '@/dane/konta-zus/pelnomocnictwa';
import type { KontoDemo, Pesel } from '@/domena/typy';

/** Numer PESEL przykładowego konta Administrator ZUS. */
export const PESEL_ADMINISTRATORA_ZUS: Pesel = '88031407319';

/**
 * Dziewięć przykładowych kont rodziców i konto Administrator ZUS w kolejności listy na ViewDemoAccountPicker.
 * Każdy PESEL ma poprawną cyfrę kontrolną, a data urodzenia i płeć odpowiadają cyfrom numeru.
 */
export const kontaPrzykladowe: KontoDemo[] = [
  {
    pesel: '93041231085',
    imie: 'Anna',
    nazwisko: 'Nowak',
    imieINazwiskoDopelniacz: 'Anny Nowak',
    dataUrodzenia: '1993-04-12',
    plec: 'kobieta',
    rodzaj: 'przykladowe-konto-rodzica',
    kluczOpisuFormy: 'jdg-z-dobrowolnym',
    kolejnosc: 1,
  },
  {
    pesel: '90072551267',
    imie: 'Magdalena',
    nazwisko: 'Wójcik',
    imieINazwiskoDopelniacz: 'Magdaleny Wójcik',
    dataUrodzenia: '1990-07-25',
    plec: 'kobieta',
    rodzaj: 'przykladowe-konto-rodzica',
    kluczOpisuFormy: 'umowa-o-prace',
    kolejnosc: 2,
  },
  {
    pesel: '96020377745',
    imie: 'Karolina',
    nazwisko: 'Lis',
    imieINazwiskoDopelniacz: 'Karoliny Lis',
    dataUrodzenia: '1996-02-03',
    plec: 'kobieta',
    rodzaj: 'przykladowe-konto-rodzica',
    kluczOpisuFormy: 'umowa-zlecenia-z-dobrowolnym',
    kolejnosc: 3,
  },
  {
    pesel: '91113040407',
    imie: 'Joanna',
    nazwisko: 'Mazur',
    imieINazwiskoDopelniacz: 'Joanny Mazur',
    dataUrodzenia: '1991-11-30',
    plec: 'kobieta',
    rodzaj: 'przykladowe-konto-rodzica',
    kluczOpisuFormy: 'jdg-bez-dobrowolnego',
    kolejnosc: 4,
  },
  {
    pesel: '90011555532',
    imie: 'Tomasz',
    nazwisko: 'Nowak',
    imieINazwiskoDopelniacz: 'Tomasza Nowaka',
    dataUrodzenia: '1990-01-15',
    plec: 'mezczyzna',
    rodzaj: 'przykladowe-konto-rodzica',
    kluczOpisuFormy: 'umowa-o-prace',
    kolejnosc: 5,
  },
  {
    pesel: '92051401244',
    imie: 'Ewa',
    nazwisko: 'Kamińska',
    imieINazwiskoDopelniacz: 'Ewy Kamińskiej',
    dataUrodzenia: '1992-05-14',
    plec: 'kobieta',
    rodzaj: 'przykladowe-konto-rodzica',
    kluczOpisuFormy: 'umowa-o-prace-ustala-w-ciazy',
    kolejnosc: 6,
  },
  {
    pesel: '95082103460',
    imie: 'Paulina',
    nazwisko: 'Wrona',
    imieINazwiskoDopelniacz: 'Pauliny Wrony',
    dataUrodzenia: '1995-08-21',
    plec: 'kobieta',
    rodzaj: 'przykladowe-konto-rodzica',
    kluczOpisuFormy: 'jdg-rozpoczeta-w-ciazy',
    kolejnosc: 7,
  },
  // Piotr Wójcik dołącza jako drugi rodzic do planu rodziny Magdaleny Wójcik (Story 3.1.1.1.6).
  {
    pesel: '89031405734',
    imie: 'Piotr',
    nazwisko: 'Wójcik',
    imieINazwiskoDopelniacz: 'Piotra Wójcika',
    dataUrodzenia: '1989-03-14',
    plec: 'mezczyzna',
    rodzaj: 'przykladowe-konto-rodzica',
    kluczOpisuFormy: 'umowa-o-prace',
    kolejnosc: 8,
  },
  // Marcin Lis dołącza jako drugi rodzic do planu rodziny Karoliny Lis (Story 3.1.1.1.6).
  {
    pesel: '91080204172',
    imie: 'Marcin',
    nazwisko: 'Lis',
    imieINazwiskoDopelniacz: 'Marcina Lisa',
    dataUrodzenia: '1991-08-02',
    plec: 'mezczyzna',
    rodzaj: 'przykladowe-konto-rodzica',
    kluczOpisuFormy: 'jdg-z-dobrowolnym',
    kolejnosc: 9,
  },
  {
    pesel: PESEL_ADMINISTRATORA_ZUS,
    imie: 'Administrator',
    nazwisko: 'ZUS',
    imieINazwiskoDopelniacz: 'Administratora ZUS',
    dataUrodzenia: '1988-03-14',
    plec: 'mezczyzna',
    rodzaj: 'konto-administratora',
    kluczOpisuFormy: 'administrator',
    kolejnosc: 10,
  },
];

/** Zwraca przykładowe konto o podanym numerze PESEL albo `undefined`, gdy numer należy do nowego konta lub do nikogo. */
export function kontoPrzykladowe(pesel: Pesel): KontoDemo | undefined {
  return kontaPrzykladowe.find((konto) => konto.pesel === pesel);
}

/**
 * Składa pełną listę kont demonstracyjnych: przykładowe konta w stałej kolejności, a po nich nowe konta
 * z `StanGlobalny.noweKontaDemo` uporządkowane według kolejności założenia.
 */
export function wszystkieKontaDemo(noweKonta: readonly KontoDemo[]): KontoDemo[] {
  const nowe = noweKonta
    .filter((konto) => kontoPrzykladowe(konto.pesel) === undefined)
    .sort((a, b) => a.kolejnosc - b.kolejnosc);
  return [...kontaPrzykladowe, ...nowe];
}

/** Znajduje konto demonstracyjne, przykładowe albo nowe, o podanym numerze PESEL. */
export function znajdzKontoDemo(pesel: Pesel, noweKonta: readonly KontoDemo[]): KontoDemo | undefined {
  return kontoPrzykladowe(pesel) ?? noweKonta.find((konto) => konto.pesel === pesel);
}

/**
 * Numery PESEL, których nie może dostać nowe konto: konta demonstracyjne oraz mocodawcy z pełnomocnictw PEL,
 * którzy mają dane w symulowanym ZUS. Nowe konto z numerem mocodawcy dostałoby jego dane konta ZUS zamiast
 * pustych danych. Generator PESEL nowego konta losuje numer spoza tej listy.
 */
export function zajetePesele(noweKonta: readonly KontoDemo[]): Pesel[] {
  const zajete = new Set<Pesel>(wszystkieKontaDemo(noweKonta).map((konto) => konto.pesel));
  for (const pesel of Object.keys(kontaMocodawcowZus)) zajete.add(pesel);
  for (const lista of Object.values(pelnomocnictwaKontZus)) {
    for (const pelnomocnictwo of lista ?? []) zajete.add(pelnomocnictwo.mocodawca.pesel);
  }
  return [...zajete];
}
