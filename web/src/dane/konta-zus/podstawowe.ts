// Dane podstawowe kont przykładowych w symulowanym ZUS (kontrakt, sekcja 8; ANALIZY/02 sekcja 11;
// historyjki 3.4.1.2.1 i 3.4.1.2.2). Właściciel: u03. Plik zawiera dane konta ZUS: tytuły ubezpieczenia
// z ubezpieczeniem chorobowym, podstawami składek i płatnikami z NIP i REGON, członków rodziny, zasiłki
// z okresem i kwotą brutto, adresy i e-maile `@example.com`.
// Podstawy składek obejmują 12 miesięcy od listopada 2025 do października 2026. Magdalena Wójcik ma 4373,33 zł
// w marcu 2026 i 0,00 zł we wrześniu i październiku 2026, a Paulina Wrona podstawę za październik 2026
// (działalność od 01.10.2026). Informację, czy płatnik wypłaca zasiłki, ZUS ustala według stanu na 30.11.2025.
import type { Grosze, MiesiacISO, Pesel, PodstawaSkladek, ZrodloweDaneKontaZus } from '@/domena/typy';

export type DanePodstawoweKontaZus = Pick<
  ZrodloweDaneKontaZus,
  'tytuly' | 'czlonkowieRodziny' | 'zasilki' | 'emailEzus' | 'adres'
>;

/** Kolejne miesiące od `od` do `do_` włącznie, w formacie 'RRRR-MM'. */
function miesiace(od: MiesiacISO, do_: MiesiacISO): MiesiacISO[] {
  const wynik: MiesiacISO[] = [];
  let [rok, miesiac] = od.split('-').map(Number) as [number, number];
  const [rokDo, miesiacDo] = do_.split('-').map(Number) as [number, number];
  while (rok < rokDo || (rok === rokDo && miesiac <= miesiacDo)) {
    wynik.push(`${rok}-${String(miesiac).padStart(2, '0')}`);
    miesiac += 1;
    if (miesiac > 12) {
      miesiac = 1;
      rok += 1;
    }
  }
  return wynik;
}

/** Ta sama podstawa składek w każdym miesiącu okresu. */
function podstawy(kwota: Grosze, od: MiesiacISO, do_: MiesiacISO): PodstawaSkladek[] {
  return miesiace(od, do_).map((miesiac) => ({ miesiac, kwota }));
}

const OSTATNIE_12_OD: MiesiacISO = '2025-11';
const OSTATNIE_12_DO: MiesiacISO = '2026-10';

/** Data stanu, na który ZUS ustalił informację, czy płatnik składek wypłaca zasiłki (30 listopada poprzedniego roku). */
const STAN_WYPLATY_ZASILKOW = '2025-11-30';

/** Dane podstawowe według numeru PESEL konta. Rejestr `dane/konta-zus/index.ts` łączy je z pozostałymi plikami. */
export const danePodstawoweKontZus: Readonly<Partial<Record<Pesel, DanePodstawoweKontaZus>>> = {
  // Anna Nowak: działalność od 01.03.2024 z dobrowolnym ubezpieczeniem chorobowym.
  '93041231085': {
    tytuly: [
      {
        id: 'T-93041231085-1',
        rodzaj: 'dzialalnosc',
        od: '2024-03-01',
        ubezpieczenieChorobowe: { rodzaj: 'dobrowolne', od: '2024-03-01' },
        podstawySkladek: podstawy(600000, OSTATNIE_12_OD, OSTATNIE_12_DO),
        platnik: { nazwa: 'Anna Nowak', nip: '5542103785', regon: '382519074', wyplacaZasilki: 'nie-dotyczy' },
      },
    ],
    czlonkowieRodziny: [],
    zasilki: [],
    adres: 'ul. Lipowa 12 m. 4, 85-001 Bydgoszcz',
    emailEzus: 'anna.nowak@example.com',
  },
  // Magdalena Wójcik: pracownik od 01.09.2019, płatnik nie wypłaca zasiłków, zasiłek chorobowy od 20.09.2026 do 30.09.2026.
  '90072551267': {
    tytuly: [
      {
        id: 'T-90072551267-1',
        rodzaj: 'pracownik',
        od: '2019-09-01',
        ubezpieczenieChorobowe: { rodzaj: 'obowiazkowe' },
        podstawySkladek: [
          ...podstawy(820000, '2025-11', '2026-02'),
          ...podstawy(437333, '2026-03', '2026-03'),
          ...podstawy(820000, '2026-04', '2026-08'),
          ...podstawy(0, '2026-09', '2026-10'),
        ],
        platnik: {
          nazwa: 'Zielony Ogród sp. z o.o.',
          nip: '6260181591',
          regon: '183016619',
          wyplacaZasilki: 'nie',
          wyplacaZasilkiStanNa: STAN_WYPLATY_ZASILKOW,
        },
      },
    ],
    czlonkowieRodziny: [],
    zasilki: [
      {
        rodzaj: 'zasilek-chorobowy',
        okresOd: '2026-09-20',
        okresDo: '2026-09-30',
        dataWyplaty: '2026-10-14',
        kwota: 259446,
        sposobWyplaty: 'przelew',
      },
    ],
    adres: 'ul. Ogrodowa 5, 60-001 Poznań',
    emailEzus: 'magdalena.wojcik@example.com',
  },
  // Karolina Lis: zleceniobiorca od 01.02.2025 z dobrowolnym ubezpieczeniem chorobowym, płatnik bez informacji o wypłacie zasiłków.
  '96020377745': {
    tytuly: [
      {
        id: 'T-96020377745-1',
        rodzaj: 'zleceniobiorca',
        od: '2025-02-01',
        ubezpieczenieChorobowe: { rodzaj: 'dobrowolne', od: '2025-02-01' },
        podstawySkladek: podstawy(480600, OSTATNIE_12_OD, OSTATNIE_12_DO),
        platnik: { nazwa: 'Studio Kreska sp. z o.o.', nip: '1996030822', regon: '562819489', wyplacaZasilki: 'brak-informacji' },
      },
    ],
    czlonkowieRodziny: [],
    zasilki: [],
    adres: 'ul. Kwiatowa 9 m. 1, 90-001 Łódź',
    emailEzus: 'karolina.lis@example.com',
  },
  // Joanna Mazur: działalność od 01.06.2023 bez ubezpieczenia chorobowego.
  '91113040407': {
    tytuly: [
      {
        id: 'T-91113040407-1',
        rodzaj: 'dzialalnosc',
        od: '2023-06-01',
        ubezpieczenieChorobowe: { rodzaj: 'brak' },
        podstawySkladek: podstawy(565200, OSTATNIE_12_OD, OSTATNIE_12_DO),
        platnik: { nazwa: 'Joanna Mazur', nip: '5842177606', regon: '220716455', wyplacaZasilki: 'nie-dotyczy' },
      },
    ],
    czlonkowieRodziny: [],
    zasilki: [],
    adres: 'ul. Długa 3, 80-001 Gdańsk',
    emailEzus: 'joanna.mazur@example.com',
  },
  // Tomasz Nowak: pracownik od 01.04.2015, płatnik wypłaca zasiłki według stanu na 30.11.2025.
  '90011555532': {
    tytuly: [
      {
        id: 'T-90011555532-1',
        rodzaj: 'pracownik',
        od: '2015-04-01',
        ubezpieczenieChorobowe: { rodzaj: 'obowiazkowe' },
        podstawySkladek: podstawy(950000, OSTATNIE_12_OD, OSTATNIE_12_DO),
        platnik: {
          nazwa: 'Transport Wiśniewski sp. z o.o.',
          nip: '3199351816',
          regon: '193786574',
          wyplacaZasilki: 'tak',
          wyplacaZasilkiStanNa: STAN_WYPLATY_ZASILKOW,
        },
      },
    ],
    czlonkowieRodziny: [],
    zasilki: [],
    adres: 'ul. Lipowa 12 m. 4, 85-001 Bydgoszcz',
    emailEzus: 'tomasz.nowak@example.com',
  },
  // Ewa Kamińska: pracownik od 01.02.2021 do 31.10.2026, od 01.11.2026 brak tytułu ubezpieczenia.
  '92051401244': {
    tytuly: [
      {
        id: 'T-92051401244-1',
        rodzaj: 'pracownik',
        od: '2021-02-01',
        do: '2026-10-31',
        ubezpieczenieChorobowe: { rodzaj: 'obowiazkowe', od: '2021-02-01', do: '2026-10-31' },
        podstawySkladek: podstawy(740000, '2025-11', '2026-10'),
        platnik: {
          nazwa: 'Hurtownia Bałtyk sp. z o.o. w likwidacji',
          nip: '5542103791',
          regon: '382519080',
          wyplacaZasilki: 'nie',
          wyplacaZasilkiStanNa: STAN_WYPLATY_ZASILKOW,
        },
      },
    ],
    czlonkowieRodziny: [],
    zasilki: [],
    adres: 'ul. Morska 15 m. 2, 81-001 Gdynia',
    emailEzus: 'ewa.kaminska@example.com',
  },
  // Paulina Wrona: działalność od 01.10.2026 z dobrowolnym ubezpieczeniem chorobowym od 01.10.2026.
  '95082103460': {
    tytuly: [
      {
        id: 'T-95082103460-1',
        rodzaj: 'dzialalnosc',
        od: '2026-10-01',
        ubezpieczenieChorobowe: { rodzaj: 'dobrowolne', od: '2026-10-01' },
        podstawySkladek: podstawy(565200, '2026-10', '2026-10'),
        platnik: { nazwa: 'Paulina Wrona', nip: '6793045123', regon: '356410920', wyplacaZasilki: 'nie-dotyczy' },
      },
    ],
    czlonkowieRodziny: [],
    zasilki: [],
    adres: 'ul. Polna 7, 30-001 Kraków',
    emailEzus: 'paulina.wrona@example.com',
  },
  // Piotr Wójcik: pracownik od 01.03.2018, płatnik wypłaca zasiłki według stanu na 30.11.2025.
  '89031405734': {
    tytuly: [
      {
        id: 'T-89031405734-1',
        rodzaj: 'pracownik',
        od: '2018-03-01',
        ubezpieczenieChorobowe: { rodzaj: 'obowiazkowe' },
        podstawySkladek: podstawy(780000, OSTATNIE_12_OD, OSTATNIE_12_DO),
        platnik: {
          nazwa: 'Meble Warta sp. z o.o.',
          nip: '7788245914',
          regon: '305102256',
          wyplacaZasilki: 'tak',
          wyplacaZasilkiStanNa: STAN_WYPLATY_ZASILKOW,
        },
      },
    ],
    czlonkowieRodziny: [],
    zasilki: [],
    adres: 'ul. Ogrodowa 5, 60-001 Poznań',
    emailEzus: 'piotr.wojcik@example.com',
  },
  // Marcin Lis: działalność od 01.05.2022 z dobrowolnym ubezpieczeniem chorobowym od 01.05.2022.
  '91080204172': {
    tytuly: [
      {
        id: 'T-91080204172-1',
        rodzaj: 'dzialalnosc',
        od: '2022-05-01',
        ubezpieczenieChorobowe: { rodzaj: 'dobrowolne', od: '2022-05-01' },
        podstawySkladek: podstawy(565200, OSTATNIE_12_OD, OSTATNIE_12_DO),
        platnik: { nazwa: 'Marcin Lis', nip: '7275229560', regon: '105591362', wyplacaZasilki: 'nie-dotyczy' },
      },
    ],
    czlonkowieRodziny: [],
    zasilki: [],
    adres: 'ul. Kwiatowa 9 m. 1, 90-001 Łódź',
    emailEzus: 'marcin.lis@example.com',
  },
};
