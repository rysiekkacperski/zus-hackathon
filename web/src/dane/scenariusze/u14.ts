// Scenariusze demonstracyjne jednostki u14 (kontrakt, sekcja 6.6). Właściciel: u14.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek 3.4.4.1.2, 3.4.5.1.1, 3.4.5.1.2 i 3.4.2.1.1
// nadpisaniami danych symulowanego ZUS i datą demonstracyjną. Wpisy w polach `nazwa` i `opis` są danymi
// panelu demonstracyjnego, a nie tekstami widoków przewodnika.
import {
  wniosek800Plus,
  wniosekZasilkuMacierzynskiego,
  wyplata800Plus,
  wyplataZasilkuMacierzynskiego,
} from '@/dane/konta-zus/wnioski-zus';
import type { ScenariuszDemo, ZaswiadczenieEzla } from '@/domena/typy';
import '@/domena/zasilki/rozszerzenia-typow';

const MAGDALENA = '90072551267';
const ANNA = '93041231085';
const PLATNIK_MAGDALENY = 'Zielony Ogród sp. z o.o.';

function zaswiadczenieB(seriaINumer: string, od: string, do_: string): ZaswiadczenieEzla {
  return { seriaINumer, dataWystawienia: od, od, do: do_, kodyLiterowe: ['B'], platnik: PLATNIK_MAGDALENY, rodzaj: 'choroba' };
}

/** Dziecko Anny Nowak urodzone 19.11.2026 (data porodu w danych członków rodziny). */
const dzieckoAnny = { imie: 'Zofia', nazwisko: 'Nowak', pesel: '26311907825', dataUrodzenia: '2026-11-19' };

export const scenariuszeU14: readonly ScenariuszDemo[] = [
  {
    id: 'u14-ezla-koniec-okresu-blisko',
    nazwa: 'e-ZLA: okres zasiłkowy bliski wyczerpania',
    opis: 'Magdalena Wójcik, zaświadczenie z kodem B od 16.03.2026 do 15.11.2026 (245 dni), ostrzeżenie 0115.',
    pesel: MAGDALENA,
    zastosuj: () => ({
      zus: { nadpisania: { zaswiadczeniaEzla: [zaswiadczenieB('ZY 2603160', '2026-03-16', '2026-11-15')] } },
      parametry: { dataDemo: '2026-11-21' },
    }),
  },
  {
    id: 'u14-ezla-okres-wyczerpany',
    nazwa: 'e-ZLA: okres zasiłkowy wyczerpany',
    opis: 'Magdalena Wójcik, zaświadczenie z kodem B od 02.03.2026 do 26.11.2026 (270 dni), komunikat 0086.',
    pesel: MAGDALENA,
    zastosuj: () => ({
      zus: { nadpisania: { zaswiadczeniaEzla: [zaswiadczenieB('ZY 2603020', '2026-03-02', '2026-11-26')] } },
      parametry: { dataDemo: '2026-11-21' },
    }),
  },
  {
    id: 'u14-rozliczenia-niedostepne',
    nazwa: 'Stan rozliczeń niedostępny',
    opis: 'Anna Nowak, PUE/eZUS nie zwraca stanu rozliczeń składek (0150).',
    pesel: ANNA,
    zastosuj: () => ({ zus: { nadpisania: { stanRozliczenNiedostepny: true } } }),
  },
  {
    id: 'u14-rozliczenia-ponad-prog',
    nazwa: 'Stan rozliczeń: zadłużenie 48,07 zł w dniu porodu',
    opis: 'Anna Nowak, dziecko urodzone 19.11.2026, zadłużenie 48,07 zł od 19.11.2026 (0182 z dniem 19.05.2027).',
    pesel: ANNA,
    zastosuj: () => ({
      zus: {
        dzieckoZSymulacji: dzieckoAnny,
        nadpisania: { osZadluzenia: { zmiany: [{ od: '2024-03-01', kwota: 0 }, { od: '2026-11-19', kwota: 4807 }] } },
      },
      parametry: { dataDemo: '2026-11-21' },
    }),
  },
  {
    id: 'u14-rozliczenia-uklad-ratalny',
    nazwa: 'Stan rozliczeń: układ ratalny 900,00 zł',
    opis: 'Anna Nowak, 900,00 zł objęte układem ratalnym spłacanym zgodnie z umową (0184, zaświadczenie o niezaleganiu).',
    pesel: ANNA,
    zastosuj: () => ({
      zus: {
        dzieckoZSymulacji: dzieckoAnny,
        nadpisania: {
          osZadluzenia: {
            zmiany: [{ od: '2024-03-01', kwota: 0 }, { od: '2026-11-01', kwota: 90000 }],
            umowa: {
              rodzaj: 'uklad-ratalny',
              kwotaObjeta: 90000,
              splacanaZgodnieZUmowa: true,
              caleZadluzenieObjete: true,
              od: '2026-11-01',
            },
          },
        },
      },
      parametry: { dataDemo: '2026-11-21' },
    }),
  },
  {
    id: 'u14-rozliczenia-splata-w-6-miesiacach',
    nazwa: 'Stan rozliczeń: 120,00 zł spłacone 10.12.2026',
    opis: 'Anna Nowak, dzień 15.12.2026, zadłużenie 120,00 zł na 19.11.2026 spłacone 10.12.2026 (0186, wypłata do 08.02.2027).',
    pesel: ANNA,
    zastosuj: () => ({
      zus: {
        dzieckoZSymulacji: dzieckoAnny,
        nadpisania: {
          osZadluzenia: {
            zmiany: [{ od: '2024-03-01', kwota: 0 }, { od: '2026-11-01', kwota: 12000 }, { od: '2026-12-10', kwota: 0 }],
            splaty: [{ dzien: '2026-12-10', kwota: 12000 }],
          },
        },
      },
      parametry: { dataDemo: '2026-12-15' },
    }),
  },
  {
    id: 'u14-800-plus-w-trakcie',
    nazwa: 'Wniosek o 800+ w trakcie rozpatrywania',
    opis: 'Anna Nowak, 16.12.2026: wniosek o 800+ z 25.11.2026 w trakcie, zasiłek macierzyński wypłacony 15.12.2026.',
    pesel: ANNA,
    zastosuj: () => ({
      zus: {
        dzieckoZSymulacji: dzieckoAnny,
        nadpisania: {
          wnioski: [wniosek800Plus('w-trakcie'), wniosekZasilkuMacierzynskiego],
          zasilki: [wyplataZasilkuMacierzynskiego],
        },
      },
      parametry: { dataDemo: '2026-12-16' },
    }),
  },
  {
    id: 'u14-800-plus-przyznane',
    nazwa: 'Wniosek o 800+ przyznany',
    opis: 'Anna Nowak, 05.01.2027: przyznanie 800+ na wniosek z 25.11.2026, najbliższa wypłata 800,00 zł 10.02.2027.',
    pesel: ANNA,
    zastosuj: () => ({
      zus: {
        dzieckoZSymulacji: dzieckoAnny,
        nadpisania: {
          wnioski: [wniosek800Plus('przyznanie'), wniosekZasilkuMacierzynskiego],
          zasilki: [wyplataZasilkuMacierzynskiego],
          swiadczeniaRodzinne: [wyplata800Plus],
        },
      },
      parametry: { dataDemo: '2027-01-05' },
    }),
  },
  {
    id: 'u14-800-plus-odmowa',
    nazwa: 'Wniosek o 800+ z odmową',
    opis: 'Anna Nowak, 05.01.2027: odmowa na wniosek o 800+ z 25.11.2026, akcja przejścia do eZUS.',
    pesel: ANNA,
    zastosuj: () => ({
      zus: {
        dzieckoZSymulacji: dzieckoAnny,
        nadpisania: { wnioski: [wniosek800Plus('odmowa')] },
      },
      parametry: { dataDemo: '2027-01-05' },
    }),
  },
];
