// Rejestr danych źródłowych kont w symulowanym ZUS (kontrakt, sekcje 5.5, 5.15 i 8).
// Rejestr składa pliki właścicieli w dane źródłowe jednego konta i nakłada na nie stan symulowanego ZUS
// z klucza `ppm:v1:zus:<PESEL>`: nadpisania scenariuszy demonstracyjnych, dziecko z symulacji narodzin,
// wnioski wysłane z przewodnika, wystawione zaświadczenia o stanie rozliczeń i korespondencję.
import { kontoPrzykladowe } from '@/dane/konta-demo';
import { zaswiadczeniaEzlaKontZus } from '@/dane/konta-zus/ezla';
import { kontaMocodawcowZus, pelnomocnictwaKontZus } from '@/dane/konta-zus/pelnomocnictwa';
import { danePodstawoweKontZus } from '@/dane/konta-zus/podstawowe';
import { osieZadluzeniaKontZus } from '@/dane/konta-zus/stan-rozliczen';
import { wnioskiKontZus } from '@/dane/konta-zus/wnioski-zus';
import type { KontoDemo, Pesel, StanSymulowanegoZus, ZrodloweDaneKontaZus } from '@/domena/typy';

export { odpowiedziZus } from '@/dane/konta-zus/odpowiedzi-zus';
export type { OdpowiedziZus } from '@/dane/konta-zus/odpowiedzi-zus';

/** Imię i nazwisko konta, które nie ma danych w plikach rejestru, na przykład nowego konta demonstracyjnego. */
export type OsobaKontaZus = Pick<KontoDemo, 'imie' | 'nazwisko'>;

/** Dane źródłowe konta bez tytułów ubezpieczenia, członków rodziny, zasiłków, wniosków i korespondencji. */
export function pusteDaneKontaZus(pesel: Pesel, osoba: OsobaKontaZus): ZrodloweDaneKontaZus {
  return {
    pesel,
    imie: osoba.imie,
    nazwisko: osoba.nazwisko,
    tytuly: [],
    czlonkowieRodziny: [],
    zasilki: [],
    swiadczeniaRodzinne: [],
    wnioski: [],
    zaswiadczeniaEzla: [],
    zaswiadczeniaORozliczeniach: [],
    korespondencja: [],
    pelnomocnictwa: [],
  };
}

function daneZPlikowRejestru(pesel: Pesel, osoba: OsobaKontaZus): ZrodloweDaneKontaZus {
  const baza = kontaMocodawcowZus[pesel] ?? pusteDaneKontaZus(pesel, osoba);
  const dane: ZrodloweDaneKontaZus = { ...baza, pesel };

  const podstawowe = danePodstawoweKontZus[pesel];
  if (podstawowe) {
    dane.tytuly = [...podstawowe.tytuly];
    dane.czlonkowieRodziny = [...podstawowe.czlonkowieRodziny];
    dane.zasilki = [...podstawowe.zasilki];
    if (podstawowe.emailEzus !== undefined) dane.emailEzus = podstawowe.emailEzus;
    if (podstawowe.adres !== undefined) dane.adres = podstawowe.adres;
  }

  const ezla = zaswiadczeniaEzlaKontZus[pesel];
  if (ezla) dane.zaswiadczeniaEzla = [...ezla];

  const osZadluzenia = osieZadluzeniaKontZus[pesel];
  if (osZadluzenia) dane.osZadluzenia = osZadluzenia;

  const wnioski = wnioskiKontZus[pesel];
  if (wnioski?.wnioski) dane.wnioski = [...wnioski.wnioski];
  if (wnioski?.swiadczeniaRodzinne) dane.swiadczeniaRodzinne = [...wnioski.swiadczeniaRodzinne];

  const pelnomocnictwa = pelnomocnictwaKontZus[pesel];
  if (pelnomocnictwa) dane.pelnomocnictwa = [...pelnomocnictwa];

  return dane;
}

/** Łączy dwie listy według klucza; element z listy `nowe` zastępuje element o tym samym kluczu z listy `bazowe`. */
function scalWedlugKlucza<T>(bazowe: readonly T[], nowe: readonly T[], klucz: (element: T) => string): T[] {
  const klucze = new Set(nowe.map(klucz));
  return [...bazowe.filter((element) => !klucze.has(klucz(element))), ...nowe];
}

/**
 * Nadpisania bez pól o wartości `undefined`. Stan symulowanego ZUS przechodzi przez JSON w magazynie, który usuwa
 * takie pola, więc pominięcie ich daje ten sam wynik dla stanu z pamięci i stanu odczytanego z magazynu.
 */
function okreslone(nadpisania: Partial<ZrodloweDaneKontaZus> | undefined): Partial<ZrodloweDaneKontaZus> {
  if (!nadpisania) return {};
  return Object.fromEntries(Object.entries(nadpisania).filter(([, wartosc]) => wartosc !== undefined));
}

function zastosujStanSymulowany(dane: ZrodloweDaneKontaZus, symulowany: StanSymulowanegoZus): ZrodloweDaneKontaZus {
  const wynik: ZrodloweDaneKontaZus = { ...dane, ...okreslone(symulowany.nadpisania), pesel: dane.pesel };

  if (symulowany.dzieckoZSymulacji) {
    wynik.czlonkowieRodziny = scalWedlugKlucza(
      wynik.czlonkowieRodziny,
      [symulowany.dzieckoZSymulacji],
      (czlonek) => czlonek.pesel,
    );
  }
  wynik.wnioski = scalWedlugKlucza(wynik.wnioski, symulowany.wnioskiZPrzewodnika, (wniosek) => wniosek.idWniosku);
  wynik.zaswiadczeniaORozliczeniach = scalWedlugKlucza(
    wynik.zaswiadczeniaORozliczeniach,
    symulowany.zaswiadczeniaORozliczeniach,
    (zaswiadczenie) => zaswiadczenie.id,
  );
  wynik.korespondencja = scalWedlugKlucza(wynik.korespondencja, symulowany.korespondencja, (pytanie) => pytanie.idPytania);

  return wynik;
}

/**
 * Nakłada stan symulowanego ZUS z przeglądarki na dane źródłowe konta odczytane z REST API symulowanego ZUS
 * (GET /api/v1/zus/konto?postac=zrodlowe z nagłówkiem X-Pesel). Serwer zwraca dane startowe rejestru bez stanu symulacji, więc
 * przeglądarka uzupełnia je tak samo jak zrodloweDaneKonta: konto spoza rejestru dostaje imię i nazwisko z argumentu
 * `osoba` (bez niego z nadpisań stanu symulowanego), a potem nadpisania scenariuszy, dziecko z symulacji, wnioski
 * z przewodnika, zaświadczenia o stanie rozliczeń i korespondencję. Wynik jest głęboką kopią.
 */
export function nalozStanSymulowany(
  dane: ZrodloweDaneKontaZus,
  symulowany: StanSymulowanegoZus | null,
  osoba?: OsobaKontaZus,
): ZrodloweDaneKontaZus {
  const stan = symulowany?.pesel === dane.pesel ? symulowany : null;
  const tozsamosc: OsobaKontaZus | null =
    dane.imie === '' && dane.nazwisko === ''
      ? osoba ?? { imie: stan?.nadpisania?.imie ?? '', nazwisko: stan?.nadpisania?.nazwisko ?? '' }
      : null;
  const zTozsamoscia = tozsamosc ? { ...dane, imie: tozsamosc.imie, nazwisko: tozsamosc.nazwisko } : dane;
  return structuredClone(stan ? zastosujStanSymulowany(zTozsamoscia, stan) : zTozsamoscia);
}

/**
 * Zwraca dane źródłowe konta w symulowanym ZUS.
 *
 * - Konto Administrator ZUS nie ma danych konta ZUS, więc funkcja zwraca `null`.
 * - Konto przykładowe i mocodawca z pliku pełnomocnictw dostają dane z plików rejestru.
 * - Każdy inny numer PESEL, w szczególności nowe konto demonstracyjne, dostaje puste dane konta ZUS
 *   z imieniem i nazwiskiem z argumentu `osoba`, a bez niego z nadpisań stanu symulowanego.
 *
 * Na dane rejestru funkcja nakłada `symulowany`, gdy dotyczy tego samego numeru PESEL: najpierw nadpisania
 * scenariuszy, potem dziecko z symulacji, wnioski z przewodnika, zaświadczenia o stanie rozliczeń i korespondencję.
 * Wynik jest głęboką kopią, więc wywołujący może go zmieniać bez wpływu na dane startowe.
 */
export function zrodloweDaneKonta(
  pesel: Pesel,
  symulowany: StanSymulowanegoZus | null,
  osoba?: OsobaKontaZus,
): ZrodloweDaneKontaZus | null {
  const przykladowe = kontoPrzykladowe(pesel);
  if (przykladowe?.rodzaj === 'konto-administratora') return null;

  const stan = symulowany?.pesel === pesel ? symulowany : null;
  const tozsamosc: OsobaKontaZus = przykladowe ?? kontaMocodawcowZus[pesel] ?? osoba ?? {
    imie: stan?.nadpisania?.imie ?? '',
    nazwisko: stan?.nadpisania?.nazwisko ?? '',
  };

  const dane = daneZPlikowRejestru(pesel, tozsamosc);
  return structuredClone(stan ? zastosujStanSymulowany(dane, stan) : dane);
}
