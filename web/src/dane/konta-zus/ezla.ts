// Zaświadczenia lekarskie e-ZLA kont w symulowanym ZUS (kontrakt, sekcja 8; ANALIZY/16 sekcja 11).
// Właściciel: u14. Konta Joanna Mazur i Paulina Wrona mają pustą listę zaświadczeń.
import type { Pesel, ZaswiadczenieEzla } from '@/domena/typy';

const ZIELONY_OGROD = 'Zielony Ogród sp. z o.o.';

/** Zaświadczenia e-ZLA według numeru PESEL ubezpieczonego. */
export const zaswiadczeniaEzlaKontZus: Readonly<Partial<Record<Pesel, readonly ZaswiadczenieEzla[]>>> = {
  // Magdalena Wójcik
  '90072551267': [
    { seriaINumer: 'ZY 2603118', dataWystawienia: '2026-03-03', od: '2026-03-03', do: '2026-03-16', kodyLiterowe: [], platnik: ZIELONY_OGROD, rodzaj: 'choroba' },
    { seriaINumer: 'ZY 2609402', dataWystawienia: '2026-09-01', od: '2026-09-01', do: '2026-09-30', kodyLiterowe: ['B'], platnik: ZIELONY_OGROD, rodzaj: 'choroba' },
    { seriaINumer: 'ZY 2610077', dataWystawienia: '2026-09-30', od: '2026-10-01', do: '2026-11-15', kodyLiterowe: ['B'], platnik: ZIELONY_OGROD, rodzaj: 'choroba' },
  ],
  // Karolina Lis
  '96020377745': [
    { seriaINumer: 'ZY 2610533', dataWystawienia: '2026-10-26', od: '2026-10-26', do: '2026-11-08', kodyLiterowe: ['B'], platnik: 'Studio Kreska sp. z o.o.', rodzaj: 'choroba' },
  ],
  // Tomasz Nowak
  '90011555532': [
    { seriaINumer: 'ZY 2605210', dataWystawienia: '2026-05-12', od: '2026-05-12', do: '2026-05-16', kodyLiterowe: [], platnik: 'Transport Wiśniewski sp. z o.o.', rodzaj: 'opieka' },
  ],
  // Anna Nowak
  '93041231085': [
    { seriaINumer: 'ZY 2611021', dataWystawienia: '2026-11-02', od: '2026-11-02', do: '2026-11-20', kodyLiterowe: ['B'], platnik: 'Anna Nowak', rodzaj: 'choroba' },
  ],
  // Ewa Kamińska
  '92051401244': [
    { seriaINumer: 'ZY 2611093', dataWystawienia: '2026-11-09', od: '2026-11-09', do: '2026-12-18', kodyLiterowe: ['B'], platnik: 'Hurtownia Bałtyk sp. z o.o. w likwidacji', rodzaj: 'choroba' },
  ],
  // Joanna Mazur
  '91113040407': [],
  // Paulina Wrona
  '95082103460': [],
};
