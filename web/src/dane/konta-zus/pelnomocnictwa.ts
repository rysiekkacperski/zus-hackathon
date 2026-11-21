// Pełnomocnictwa PEL i dane mocodawców w symulowanym ZUS (kontrakt, sekcja 8; ANALIZY/19).
// Właściciel: u23.
import type { PelnomocnictwoPel, Pesel, PodstawaSkladek, ZrodloweDaneKontaZus } from '@/domena/typy';

const PESEL_ANNY_NOWAK: Pesel = '93041231085';
const PESEL_MAGDALENY_WOJCIK: Pesel = '90072551267';
const PESEL_KAROLINY_LIS: Pesel = '96020377745';
const PESEL_TOMASZA_NOWAKA: Pesel = '90011555532';
const PESEL_PIOTRA_WOJCIKA: Pesel = '89031401570';
const PESEL_MARCINA_LISA: Pesel = '94062103737';

/** Pełnomocnictwo PEL Tomasza Nowaka dla Anny Nowak: rola Ubezpieczony, od 01.10.2026 do odwołania. */
export const pelnomocnictwoTomaszaDlaAnny: PelnomocnictwoPel = {
  idPelnomocnictwa: 'PEL-2026-0001',
  mocodawca: { imie: 'Tomasz', nazwisko: 'Nowak', imieINazwiskoDopelniacz: 'Tomasza Nowaka', pesel: PESEL_TOMASZA_NOWAKA },
  peselPelnomocnika: PESEL_ANNY_NOWAK,
  rola: 'ubezpieczony',
  zakres: 'bez-ograniczen',
  od: '2026-10-01',
  dataDotarcia: '2026-10-01',
};

/** Pełnomocnictwa PEL według numeru PESEL konta, na którym ZUS je pokazuje. */
export const pelnomocnictwaKontZus: Readonly<Partial<Record<Pesel, readonly PelnomocnictwoPel[]>>> = {
  [PESEL_ANNY_NOWAK]: [pelnomocnictwoTomaszaDlaAnny],
  [PESEL_MAGDALENY_WOJCIK]: [
    {
      idPelnomocnictwa: 'PEL-2026-0002',
      mocodawca: { imie: 'Piotr', nazwisko: 'Wójcik', imieINazwiskoDopelniacz: 'Piotra Wójcika', pesel: PESEL_PIOTRA_WOJCIKA },
      peselPelnomocnika: PESEL_MAGDALENY_WOJCIK,
      rola: 'ubezpieczony',
      zakres: 'korespondencja',
      dataDotarcia: '2026-09-15',
    },
  ],
  [PESEL_KAROLINY_LIS]: [
    {
      idPelnomocnictwa: 'PEL-2026-0003',
      mocodawca: { imie: 'Marcin', nazwisko: 'Lis', imieINazwiskoDopelniacz: 'Marcina Lisa', pesel: PESEL_MARCINA_LISA },
      peselPelnomocnika: PESEL_KAROLINY_LIS,
      rola: 'ubezpieczony',
      zakres: 'bez-ograniczen',
      od: '2026-01-01',
      do: '2026-10-31',
      dataDotarcia: '2026-01-01',
    },
  ],
};

/** Podstawa składek w każdym z 12 miesięcy od grudnia 2025 do listopada 2026. */
function podstawyZOstatnich12Miesiecy(kwota: number): PodstawaSkladek[] {
  const miesiace = ['2025-12', ...Array.from({ length: 11 }, (_, i) => `2026-${String(i + 1).padStart(2, '0')}`)];
  return miesiace.map((miesiac) => ({ miesiac, kwota }));
}

function pusteKonto(pesel: Pesel, imie: string, nazwisko: string): ZrodloweDaneKontaZus {
  return {
    pesel,
    imie,
    nazwisko,
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

/**
 * Pełne dane źródłowe mocodawców spoza listy kont przykładowych, czytane przy odczycie danych z pełnomocnictwa PEL.
 * Mocodawca, który ma konto przykładowe, korzysta z danych pozostałych plików rejestru. Wpis Tomasza Nowaka jest
 * bazą jego konta: dane podstawowe z pliku podstawowe.ts zastępują jego tytuły, gdy plik je zawiera.
 */
export const kontaMocodawcowZus: Readonly<Partial<Record<Pesel, ZrodloweDaneKontaZus>>> = {
  [PESEL_TOMASZA_NOWAKA]: {
    ...pusteKonto(PESEL_TOMASZA_NOWAKA, 'Tomasz', 'Nowak'),
    tytuly: [
      {
        id: 'T-90011555532-1',
        rodzaj: 'pracownik',
        od: '2015-04-01',
        ubezpieczenieChorobowe: { rodzaj: 'obowiazkowe', od: '2015-04-01' },
        podstawySkladek: podstawyZOstatnich12Miesiecy(950_000),
        platnik: { nazwa: 'Transport Wiśniewski sp. z o.o.', nip: '3199351816', regon: '193786574', wyplacaZasilki: 'tak' },
      },
    ],
  },
  [PESEL_PIOTRA_WOJCIKA]: pusteKonto(PESEL_PIOTRA_WOJCIKA, 'Piotr', 'Wójcik'),
  [PESEL_MARCINA_LISA]: pusteKonto(PESEL_MARCINA_LISA, 'Marcin', 'Lis'),
};
