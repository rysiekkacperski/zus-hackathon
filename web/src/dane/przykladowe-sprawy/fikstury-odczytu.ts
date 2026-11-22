// Wyniki odczytu dokumentów demonstracyjnych przy symulacji odczytDokumentu = 'fikstura' (kontrakt, sekcje 6.6 i 8).
// Właściciel: u05 (Przykładowe sprawy: lista, dokumenty i odczyt AI).
// Kluczem jest nazwa pliku z kryteriów akceptacji, a zarazem nazwa dokumentu przykładowego z web/public/przyklady/.
// Serwer wybiera fiksturę po identyfikatorze „PPM-<nazwa>” zapisanym w treści pliku, a bez identyfikatora po nazwie
// pliku (src/serwer/odczyt-dokumentow/fikstury.ts). Wartości odpowiadają treści dokumentów przykładowych i zawierają
// dane osobowe w postaci odczytanej; serwer zastępuje je danymi losowymi przed odpowiedzią, tak jak przy odczycie modelem.
import type { WartoscOdczytana, WynikOdczytuDokumentu, RodzajDokumentuSprawy } from '@/domena/typy';

function json(w: unknown): string {
  return JSON.stringify(w);
}

function miesiace(od: [number, number], liczba: number, kwota: number, rodzaj: string) {
  return Array.from({ length: liczba }, (_, i) => {
    const indeks = od[0] * 12 + (od[1] - 1) + i;
    const miesiac = `${Math.floor(indeks / 12)}-${String((indeks % 12) + 1).padStart(2, '0')}`;
    return { miesiac, kwota, rodzaj };
  });
}

function odczyt(rodzajDokumentu: RodzajDokumentuSprawy, wartosci: Record<string, WartoscOdczytana['wartosc']>): WynikOdczytuDokumentu {
  return {
    status: 'odczytany',
    rodzajDokumentu,
    wartosci: Object.entries(wartosci).map(([pole, wartosc]) => ({ pole, wartosc })),
    nowePowiazania: [],
    czasMs: 1800,
  };
}

const KOWALCZYK = { 'ubezpieczony.imie': 'Agnieszka', 'ubezpieczony.nazwisko': 'Kowalczyk', 'ubezpieczony.pesel': '94051243149', 'ubezpieczony.rola': 'matka' };

const z3Kowalczyk = odczyt('z-3', {
  ...KOWALCZYK,
  'tytul.rodzaj': 'pracownik',
  'tytul.od': '2019-04-01',
  'wymiarCzasuPracy': 'pelny-etat',
  'ubezpieczenieChorobowe.rodzaj': 'obowiazkowe',
  'ubezpieczenieChorobowe.okresy': json([{ od: '2019-04-01' }]),
  'liczbaUbezpieczonychPlatnika': 'do-20',
  'kwotyMiesieczne': json(miesiace([2025, 9], 12, 700000, 'wynagrodzenie')),
});

export const fiksturyOdczytu: Readonly<Record<string, WynikOdczytuDokumentu>> = {
  'z3-kowalczyk.pdf': z3Kowalczyk,
  'z3-kowalczyk-korekta.pdf': z3Kowalczyk,
  'zam-kowalczyk.pdf': odczyt('zam', {
    ...KOWALCZYK,
    'zdarzenie.rodzaj': 'porod',
    'zdarzenie.dataPorodu': '2026-09-02',
    'zdarzenie.liczbaDzieci': 1,
    'wniosek.swiadczenia': json(['zasilek-macierzynski']),
    'wniosek.okresy': json([{ rodzajUrlopu: 'macierzynski', od: '2026-09-02', do: '2027-01-19' }]),
  }),
  'zur-sadowska.jpg': odczyt('zam', {
    'ubezpieczony.imie': 'Oliwia', 'ubezpieczony.nazwisko': 'Sadowska', 'ubezpieczony.pesel': '95012760842', 'ubezpieczony.rola': 'matka',
    'zdarzenie.rodzaj': 'porod',
    'zdarzenie.dataPorodu': '2026-08-20',
    'wniosek.swiadczenia': json(['zasilek-macierzynski']),
    'wniosek.okresy': json([{ rodzajUrlopu: 'rodzicielski', od: '2027-01-07', do: '2027-08-18' }]),
  }),
  'z3a-sadowska.pdf': odczyt('z-3a', {
    'ubezpieczony.imie': 'Oliwia', 'ubezpieczony.nazwisko': 'Sadowska', 'ubezpieczony.pesel': '95012760842', 'ubezpieczony.rola': 'matka',
    'tytul.rodzaj': 'zleceniobiorca',
    'tytul.od': '2025-03-01',
    'ubezpieczenieChorobowe.rodzaj': 'dobrowolne',
    'ubezpieczenieChorobowe.okresy': json([{ od: '2025-03-01' }]),
    'liczbaUbezpieczonychPlatnika': 'do-20',
    'kwotyMiesieczne': json(miesiace([2025, 8], 12, 520000, 'przychod')),
  }),
  'poswiadczenie.png': odczyt('poswiadczenie', {
    'ubezpieczony.imie': 'Oliwia', 'ubezpieczony.nazwisko': 'Sadowska', 'ubezpieczony.pesel': '95012760842',
    'tytul.rodzaj': 'zleceniobiorca',
    'ubezpieczenieChorobowe.rodzaj': 'dobrowolne',
    'ubezpieczenieChorobowe.okresy': json([{ od: '2025-04-01' }]),
  }),
  'umowa-najmu.pdf': { status: 'nierozpoznany', wartosci: [], nowePowiazania: [], czasMs: 900 },
  'pit-11.pdf': { status: 'nierozpoznany', wartosci: [], nowePowiazania: [], czasMs: 900 },
  'z3-zdjecie.jpg': { status: 'nieczytelny', wartosci: [], nowePowiazania: [], czasMs: 900 },
  'z3b-baran.pdf': odczyt('z-3b', {
    'ubezpieczony.imie': 'Weronika', 'ubezpieczony.nazwisko': 'Baran', 'ubezpieczony.pesel': '97040252944', 'ubezpieczony.rola': 'matka',
    'tytul.rodzaj': 'dzialalnosc',
    'ubezpieczenieChorobowe.rodzaj': 'dobrowolne',
    'wniosek.swiadczenia': json(['zasilek-macierzynski']),
    'wniosek.okresy': json([{ rodzajUrlopu: 'macierzynski', od: '2026-10-14', do: '2027-03-02' }]),
  }),
  'zam-baran.pdf': odczyt('zam', {
    'ubezpieczony.imie': 'Weronika', 'ubezpieczony.nazwisko': 'Baran', 'ubezpieczony.pesel': '97040252944', 'ubezpieczony.rola': 'matka',
    'zdarzenie.rodzaj': 'porod',
    'zdarzenie.dataPorodu': '2026-10-14',
    'zdarzenie.liczbaDzieci': 1,
  }),
  'z3a-gorska.pdf': odczyt('z-3a', {
    'ubezpieczony.imie': 'Zuzanna', 'ubezpieczony.nazwisko': 'Górska', 'ubezpieczony.pesel': '99070745243', 'ubezpieczony.rola': 'matka',
    'tytul.rodzaj': 'zleceniobiorca',
    'tytul.od': '2026-09-01',
    'ubezpieczenieChorobowe.rodzaj': 'dobrowolne',
    'ubezpieczenieChorobowe.okresy': json([{ od: '2026-09-01' }]),
    'zdarzenie.rodzaj': 'niezdolnosc',
    'zdarzenie.niezdolnosc': json({ od: '2026-10-15', do: '2026-11-14', kod: 'B' }),
    'kwotyMiesieczne': json(miesiace([2026, 9], 1, 480600, 'przychod')),
  }),
  'zas12-gorska.pdf': odczyt('zas-12', {
    'ubezpieczony.imie': 'Zuzanna', 'ubezpieczony.nazwisko': 'Górska', 'ubezpieczony.pesel': '99070745243',
    'zdarzenie.niezdolnosc': json({ od: '2026-11-15', do: '2026-12-05' }),
    'wniosek.swiadczenia': json(['zasilek-chorobowy']),
  }),
  'zas12-gorska-ustanie.pdf': odczyt('zas-12', {
    'ubezpieczony.imie': 'Zuzanna', 'ubezpieczony.nazwisko': 'Górska', 'ubezpieczony.pesel': '99070745243',
    'ubezpieczenieChorobowe.dataUstaniaPrzyTrwajacymTytule': '2026-11-30',
  }),
  'ezla-gorska.pdf': odczyt('e-zla', {
    'ubezpieczony.imie': 'Zuzanna', 'ubezpieczony.nazwisko': 'Górska', 'ubezpieczony.pesel': '99070745243',
    'zdarzenie.rodzaj': 'niezdolnosc',
    'zdarzenie.niezdolnosc': json({ od: '2026-10-15', do: '2026-11-14', kod: 'B' }),
  }),
  'zam-pawlak.pdf': odczyt('zam', {
    'ubezpieczony.imie': 'Marta', 'ubezpieczony.nazwisko': 'Pawlak', 'ubezpieczony.pesel': '91110912444', 'ubezpieczony.rola': 'matka',
    'zdarzenie.rodzaj': 'porod',
    'zdarzenie.dataPorodu': '2026-11-03',
    'zdarzenie.liczbaDzieci': 1,
    'wniosek.swiadczenia': json(['zasilek-macierzynski']),
    'wniosek.dataZlozenia': '2026-11-05',
    'wniosek.oswiadczeniePelnyWymiar': false,
    'wniosek.okresy': json([{ rodzajUrlopu: 'macierzynski', od: '2026-11-03', do: '2027-03-22' }]),
  }),
  'zrzut-pawlak.png': odczyt('zrzut-zus', {
    'ubezpieczony.imie': 'Marta', 'ubezpieczony.nazwisko': 'Pawlak', 'ubezpieczony.pesel': '91110912444',
    'tytul.rodzaj': 'dzialalnosc',
    'tytul.od': '2024-09-01',
    'ubezpieczenieChorobowe.rodzaj': 'dobrowolne',
    'ubezpieczenieChorobowe.okresy': json([{ od: '2024-09-01' }]),
    'swiadczeniaPrzyznane': json([{ rodzaj: 'zasilek-macierzynski', od: '2026-11-03', do: '2027-03-22', kwota: 560885 }]),
  }),
  'termin-porodu.pdf': odczyt('zaswiadczenie-o-terminie-porodu', {
    'zdarzenie.przewidywanyTermin': '2026-12-15',
  }),
  'szpital.pdf': odczyt('zaswiadczenie-szpitala', {
    'ubezpieczony.imie': 'Agnieszka', 'ubezpieczony.nazwisko': 'Kowalczyk',
    'dziecko.tydzienCiazy': 30,
    'dziecko.masaG': 1450,
    'dziecko.pobyt': json({ od: '2026-10-02', do: '2026-10-30' }),
  }),
  // Czas trwania ciąży w dniu porodu 27 tygodni i 4 dni: odczyt przyjmuje liczbę ukończonych tygodni.
  'szpital-27.pdf': odczyt('zaswiadczenie-szpitala', {
    'ubezpieczony.imie': 'Agnieszka', 'ubezpieczony.nazwisko': 'Kowalczyk',
    'dziecko.tydzienCiazy': 27,
    'dziecko.masaG': 1150,
    'dziecko.pobyt': json({ od: '2026-10-02', do: '2026-10-30' }),
  }),
  'zrzut-kowalczyk.png': odczyt('zrzut-zus', {
    ...KOWALCZYK,
    'tytul.rodzaj': 'pracownik',
    'tytul.od': '2019-04-01',
    'ubezpieczenieChorobowe.rodzaj': 'obowiazkowe',
    'ubezpieczenieChorobowe.okresy': json([{ od: '2019-04-01' }]),
    'swiadczeniaPrzyznane': json([{ rodzaj: 'zasilek-macierzynski', od: '2026-09-02', do: '2027-01-19', kwota: 604030 }]),
  }),
  'zam-ojca-michalski.pdf': odczyt('zam', {
    'ubezpieczony.imie': 'Piotr', 'ubezpieczony.nazwisko': 'Michalski', 'ubezpieczony.pesel': '89120530653', 'ubezpieczony.rola': 'ojciec-przejmujacy',
    'zdarzenie.rodzaj': 'porod',
    'zdarzenie.dataPorodu': '2026-07-01',
    'wniosek.okresMatki': json({ od: '2026-07-01', do: '2026-10-06' }),
    'wniosek.okresy': json([{ rodzajUrlopu: 'macierzynski', od: '2026-10-07', do: '2026-11-17' }]),
  }),
  // Kolejne dokumenty przykładowe z web/public/przyklady/ (skrypty/generuj-dokumenty-przykladowe.mjs).
  'zam-sadowska.pdf': odczyt('zam', {
    'ubezpieczony.imie': 'Oliwia', 'ubezpieczony.nazwisko': 'Sadowska', 'ubezpieczony.pesel': '95012760842', 'ubezpieczony.rola': 'matka',
    'zdarzenie.rodzaj': 'porod',
    'zdarzenie.dataPorodu': '2026-08-20',
    'zdarzenie.liczbaDzieci': 1,
    'wniosek.swiadczenia': json(['zasilek-macierzynski']),
    'wniosek.dataZlozenia': '2026-08-25',
    'wniosek.oswiadczeniePelnyWymiar': true,
    'wniosek.okresy': json([
      { rodzajUrlopu: 'macierzynski', od: '2026-08-20', do: '2027-01-06' },
      { rodzajUrlopu: 'rodzicielski', od: '2027-01-07', do: '2027-08-18' },
    ]),
  }),
  'poswiadczenie-pawlak.pdf': odczyt('poswiadczenie', {
    'ubezpieczony.imie': 'Marta', 'ubezpieczony.nazwisko': 'Pawlak', 'ubezpieczony.pesel': '91110912444',
    'tytul.rodzaj': 'dzialalnosc',
    'tytul.od': '2024-09-01',
    'ubezpieczenieChorobowe.rodzaj': 'dobrowolne',
    'ubezpieczenieChorobowe.okresy': json([{ od: '2024-09-01' }]),
    'zadluzenieJdg': json({ kwota: 0, dzien: '2026-11-03' }),
    'kwotyMiesieczne': json(miesiace([2025, 11], 12, 650000, 'podstawa-skladek')),
  }),
  'z3-zajac.pdf': odczyt('z-3', {
    'ubezpieczony.imie': 'Monika', 'ubezpieczony.nazwisko': 'Zając', 'ubezpieczony.pesel': '90092186241', 'ubezpieczony.rola': 'matka',
    'tytul.rodzaj': 'pracownik',
    'tytul.od': '2020-03-01',
    'tytul.dataUstania': '2026-09-30',
    'wymiarCzasuPracy': 'pelny-etat',
    'ubezpieczenieChorobowe.rodzaj': 'obowiazkowe',
    'ubezpieczenieChorobowe.okresy': json([{ od: '2020-03-01', do: '2026-09-30' }]),
    'liczbaUbezpieczonychPlatnika': 'do-20',
    'kwotyMiesieczne': json(miesiace([2025, 10], 12, 620000, 'wynagrodzenie')),
  }),
  'zam-zajac.pdf': odczyt('zam', {
    'ubezpieczony.imie': 'Monika', 'ubezpieczony.nazwisko': 'Zając', 'ubezpieczony.pesel': '90092186241', 'ubezpieczony.rola': 'matka',
    'ustanieZatrudnienia.przyczyna': 'likwidacja',
    'zdarzenie.rodzaj': 'porod',
    'zdarzenie.dataPorodu': '2026-11-10',
    'zdarzenie.liczbaDzieci': 1,
    'wniosek.swiadczenia': json(['zwzm', 'zasilek-macierzynski']),
    'wniosek.dataZlozenia': '2026-11-12',
    'wniosek.okresy': json([{ rodzajUrlopu: 'macierzynski', od: '2026-11-10', do: '2027-03-29' }]),
  }),
  'zam-krawczyk.pdf': odczyt('zam', {
    'ubezpieczony.imie': 'Julia', 'ubezpieczony.nazwisko': 'Krawczyk', 'ubezpieczony.pesel': '93061837542', 'ubezpieczony.rola': 'matka',
    'zdarzenie.rodzaj': 'porod',
    'zdarzenie.dataPorodu': '2026-08-12',
    'zdarzenie.liczbaDzieci': 1,
    'wniosek.swiadczenia': json(['zasilek-macierzynski']),
    'wniosek.dataZlozenia': '2026-08-20',
    'wniosek.okresy': json([{ rodzajUrlopu: 'macierzynski', od: '2026-08-12', do: '2026-12-29' }]),
  }),
  'zrzut-krawczyk.png': odczyt('zrzut-zus', {
    'ubezpieczony.imie': 'Julia', 'ubezpieczony.nazwisko': 'Krawczyk', 'ubezpieczony.pesel': '93061837542',
    'tytul.rodzaj': 'dzialalnosc',
    'tytul.od': '2022-06-01',
    'ubezpieczenieChorobowe.rodzaj': 'brak',
    'swiadczeniaOdmowione': json([
      { rodzaj: 'zasilek-macierzynski', od: '2026-08-12', przyczyna: 'brak ubezpieczenia chorobowego w dniu porodu' },
    ]),
  }),
  'z3a-mazur.pdf': odczyt('z-3a', {
    'ubezpieczony.imie': 'Karolina', 'ubezpieczony.nazwisko': 'Mazur', 'ubezpieczony.pesel': '96031512340', 'ubezpieczony.rola': 'matka',
    'tytul.rodzaj': 'zleceniobiorca',
    'tytul.od': '2024-02-01',
    'ubezpieczenieChorobowe.rodzaj': 'dobrowolne',
    'ubezpieczenieChorobowe.okresy': json([{ od: '2024-02-01' }]),
    'liczbaUbezpieczonychPlatnika': 'do-20',
    'zdarzenie.rodzaj': 'niezdolnosc',
    'zdarzenie.niezdolnosc': json({ od: '2026-09-14', do: '2026-10-13', kod: 'B' }),
    'wniosek.swiadczenia': json(['zasilek-chorobowy']),
    'kwotyMiesieczne': json(miesiace([2025, 9], 12, 580000, 'przychod')),
  }),
  'ezla-mazur.pdf': odczyt('e-zla', {
    'ubezpieczony.imie': 'Karolina', 'ubezpieczony.nazwisko': 'Mazur', 'ubezpieczony.pesel': '96031512340',
    'zdarzenie.rodzaj': 'niezdolnosc',
    'zdarzenie.niezdolnosc': json({ od: '2026-09-14', do: '2026-10-13', kod: 'B' }),
  }),
  'zrzut-mazur.png': odczyt('zrzut-zus', {
    'ubezpieczony.imie': 'Karolina', 'ubezpieczony.nazwisko': 'Mazur', 'ubezpieczony.pesel': '96031512340',
    'tytul.rodzaj': 'zleceniobiorca',
    'tytul.od': '2024-02-01',
    'ubezpieczenieChorobowe.rodzaj': 'dobrowolne',
    'ubezpieczenieChorobowe.okresy': json([{ od: '2024-02-01' }]),
    'swiadczeniaPrzyznane': json([{ rodzaj: 'zasilek-chorobowy', od: '2026-09-14', do: '2026-10-13', kwota: 500482 }]),
  }),
};

/** Wynik odczytu dla nazwy pliku demonstracyjnego albo null. */
export function fiksturaOdczytu(nazwaPliku: string): WynikOdczytuDokumentu | null {
  return fiksturyOdczytu[nazwaPliku.trim().toLowerCase()] ?? null;
}
