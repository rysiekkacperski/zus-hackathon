// JSON Schema pól dokumentu dla modelu odczytu (kontrakt, sekcje 7.2 i 10.3).
// Właściciel: u05 (Przykładowe sprawy: lista, dokumenty i odczyt AI).
// Model zwraca listę par { pole, wartosc }: pole jest ścieżką w Danych sprawy, a wartość tekstem
// (daty RRRR-MM-DD, kwoty w groszach jako liczba, wartości złożone jako tekst JSON).
import type { SciezkaDanychSprawy } from '@/domena/przykladowe-sprawy/scalanie';
import type { RodzajDokumentuSprawy } from '@/domena/typy';

const OSOBA: SciezkaDanychSprawy[] = ['ubezpieczony.imie', 'ubezpieczony.nazwisko', 'ubezpieczony.pesel', 'ubezpieczony.rola'];

/** Dane sprawy, które zawiera dokument danego rodzaju. */
export const POLA_DOKUMENTU: Readonly<Record<RodzajDokumentuSprawy, readonly SciezkaDanychSprawy[]>> = {
  zam: [...OSOBA, 'ubezpieczenieChorobowe.rodzaj', 'ustanieZatrudnienia.przyczyna', 'zdarzenie.rodzaj', 'zdarzenie.dataPorodu',
    'zdarzenie.przewidywanyTermin', 'zdarzenie.liczbaDzieci', 'wniosek.swiadczenia', 'wniosek.okresy',
    'wniosek.oswiadczeniePelnyWymiar', 'wniosek.dataZlozenia', 'wniosek.okresMatki'],
  'z-3': [...OSOBA, 'tytul.rodzaj', 'tytul.od', 'tytul.dataUstania', 'wymiarCzasuPracy', 'wymiarEtatu', 'ubezpieczenieChorobowe.rodzaj',
    'ubezpieczenieChorobowe.okresy', 'liczbaUbezpieczonychPlatnika', 'zdarzenie.rodzaj', 'zdarzenie.niezdolnosc',
    'zdarzenie.liczbaDzieci', 'wniosek.swiadczenia', 'wniosek.okresy', 'kwotyMiesieczne'],
  'z-3a': [...OSOBA, 'tytul.rodzaj', 'tytul.od', 'tytul.dataUstania', 'ubezpieczenieChorobowe.rodzaj', 'ubezpieczenieChorobowe.okresy',
    'liczbaUbezpieczonychPlatnika', 'zdarzenie.rodzaj', 'zdarzenie.niezdolnosc', 'wniosek.swiadczenia', 'wniosek.okresy', 'kwotyMiesieczne'],
  'z-3b': [...OSOBA, 'tytul.rodzaj', 'ubezpieczenieChorobowe.rodzaj', 'wniosek.swiadczenia', 'wniosek.okresy'],
  'zas-12': [...OSOBA, 'tytul.dataUstania', 'ubezpieczenieChorobowe.dataUstaniaPrzyTrwajacymTytule', 'zdarzenie.niezdolnosc', 'wniosek.swiadczenia'],
  poswiadczenie: [...OSOBA, 'tytul.rodzaj', 'tytul.od', 'tytul.dataUstania', 'ubezpieczenieChorobowe.rodzaj', 'ubezpieczenieChorobowe.okresy',
    'kwotyMiesieczne', 'zadluzenieJdg'],
  'zrzut-zus': [...OSOBA, 'tytul.rodzaj', 'tytul.od', 'tytul.dataUstania', 'ubezpieczenieChorobowe.rodzaj', 'ubezpieczenieChorobowe.okresy',
    'swiadczeniaPrzyznane', 'swiadczeniaOdmowione'],
  'e-zla': [...OSOBA, 'zdarzenie.rodzaj', 'zdarzenie.niezdolnosc'],
  'zaswiadczenie-o-terminie-porodu': [...OSOBA, 'zdarzenie.przewidywanyTermin', 'zdarzenie.liczbaDzieci'],
  'zaswiadczenie-szpitala': [...OSOBA, 'dziecko.tydzienCiazy', 'dziecko.masaG', 'dziecko.pobyt'],
  'zaswiadczenie-o-martwym-urodzeniu': [...OSOBA, 'zdarzenie.rodzaj', 'zdarzenie.dataPorodu', 'zdarzenie.liczbaMartwych'],
  'zaswiadczenie-za-zyciem': [...OSOBA, 'dziecko.zaZyciem'],
};

/** Rodzaje dokumentów do rozpoznania przez model. */
export const RODZAJE_DOKUMENTOW = Object.keys(POLA_DOKUMENTU) as RodzajDokumentuSprawy[];

/** Schemat odpowiedzi kroku rozpoznania rodzaju dokumentu. */
export function schematRozpoznania(): Record<string, unknown> {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['rodzaj', 'czytelny'],
    properties: {
      rodzaj: { type: 'string', enum: [...RODZAJE_DOKUMENTOW, 'nierozpoznany'] },
      czytelny: { type: 'boolean' },
    },
  };
}

/** Schemat JSON pól dokumentu danego rodzaju (typ zgodny z OpcjeWywolaniaZeSchematem.schemat w serwer/model.ts). */
export function schematPol(rodzaj: RodzajDokumentuSprawy): Record<string, unknown> {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['wartosci'],
    properties: {
      wartosci: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['pole', 'wartosc'],
          properties: {
            pole: { type: 'string', enum: [...POLA_DOKUMENTU[rodzaj]] },
            wartosc: { type: ['string', 'number', 'boolean', 'null'] },
          },
        },
      },
    },
  };
}
