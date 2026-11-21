// Scenariusze demonstracyjne jednostki u12 (kontrakt, sekcja 6.6). Właściciel: u12.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek jednostki: stan rozliczeń składek Anny Nowak
// (JDG z dobrowolnym ubezpieczeniem chorobowym) dla strażnika ubezpieczenia chorobowego (3.6.1.3.1 KA-14, KA-15).
// Scenariusz zmienia dane źródłowe symulowanego ZUS; plan rodziny powstaje po zapisaniu profilu na start.
import type { ScenariuszDemo } from '@/domena/typy';

const PESEL_ANNY = '93041231085';

export const scenariuszeU12: readonly ScenariuszDemo[] = [
  {
    id: 'u12-anna-zadluzenie-120',
    nazwa: 'Anna Nowak: zadłużenie z tytułu składek 120,00 zł',
    opis: 'Stan rozliczeń składek z 21.11.2026 pokazuje zadłużenie 120,00 zł, wyższe niż próg 48,06 zł. Strażnik ostrzega przy sprawie Opłacenie składek.',
    pesel: PESEL_ANNY,
    zastosuj: () => ({
      zus: {
        nadpisania: {
          osZadluzenia: {
            zmiany: [
              { od: '2024-03-01', kwota: 0 },
              { od: '2026-11-21', kwota: 12000, opis: 'Nieopłacona składka za październik 2026' },
            ],
          },
        },
      },
    }),
  },
  {
    id: 'u12-anna-zadluzenie-30',
    nazwa: 'Anna Nowak: zadłużenie z tytułu składek 30,00 zł',
    opis: 'Stan rozliczeń składek z 21.11.2026 pokazuje zadłużenie 30,00 zł, nie wyższe niż próg 48,06 zł. Sprawa Opłacenie składek ma status załatwiona ze źródłem konto ZUS.',
    pesel: PESEL_ANNY,
    zastosuj: () => ({
      zus: {
        nadpisania: {
          osZadluzenia: {
            zmiany: [
              { od: '2024-03-01', kwota: 0 },
              { od: '2026-11-21', kwota: 3000 },
            ],
          },
        },
      },
    }),
  },
];
