// Osie zadłużenia kont prowadzących jednoosobową działalność gospodarczą w symulowanym ZUS
// (kontrakt, sekcja 8; ANALIZY/17 sekcja 11). Właściciel: u14. Dane kont nie mają układów, odroczeń ani spłat.
import type { OsZadluzenia, Pesel } from '@/domena/typy';

/** Oś zadłużenia według numeru PESEL płatnika składek na własne ubezpieczenia. */
export const osieZadluzeniaKontZus: Readonly<Partial<Record<Pesel, OsZadluzenia>>> = {
  // Anna Nowak: 0,00 zł każdego dnia od 01.03.2024
  '93041231085': { zmiany: [{ od: '2024-03-01', kwota: 0 }] },
  // Paulina Wrona: 0,00 zł od 01.10.2026, 25,40 zł od 21.11.2026
  '95082103460': {
    zmiany: [
      { od: '2026-10-01', kwota: 0 },
      { od: '2026-11-21', kwota: 2540, opis: 'Niedopłata składek za październik 2026' },
    ],
  },
  // Joanna Mazur: 0,00 zł od 01.06.2023, 1250,00 zł od 21.10.2026
  '91113040407': {
    zmiany: [
      { od: '2023-06-01', kwota: 0 },
      { od: '2026-10-21', kwota: 125000 },
    ],
  },
  // Marcin Lis: 0,00 zł każdego dnia od 01.05.2022
  '94062103737': { zmiany: [{ od: '2022-05-01', kwota: 0 }] },
};
