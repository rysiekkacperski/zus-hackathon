// Dane podstawowe kont przykładowych w symulowanym ZUS (kontrakt, sekcja 8; ANALIZY/02 sekcja 11).
// Właściciel: u03. Plik zawiera tytuły ubezpieczenia z ubezpieczeniem chorobowym, podstawami składek
// i płatnikami z NIP i REGON, członków rodziny, zasiłki, adresy i e-maile `@example.com`.
// Podstawy składek obejmują 12 miesięcy kończących się listopadem 2026; Ewa Kamińska ma podstawy od listopada 2025
// do października 2026 (koniec tytułu 31.10.2026), a Paulina Wrona za październik i listopad 2026 (działalność od 01.10.2026).
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

const OSTATNIE_12_OD: MiesiacISO = '2025-12';
const OSTATNIE_12_DO: MiesiacISO = '2026-11';

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
  // Magdalena Wójcik: pracownik od 01.09.2019, płatnik nie wypłaca zasiłków, zasiłek chorobowy z 14.10.2026.
  '90072551267': {
    tytuly: [
      {
        id: 'T-90072551267-1',
        rodzaj: 'pracownik',
        od: '2019-09-01',
        ubezpieczenieChorobowe: { rodzaj: 'obowiazkowe' },
        podstawySkladek: podstawy(820000, OSTATNIE_12_OD, OSTATNIE_12_DO),
        platnik: { nazwa: 'Zielony Ogród sp. z o.o.', nip: '6260181591', regon: '183016619', wyplacaZasilki: 'nie' },
      },
    ],
    czlonkowieRodziny: [],
    zasilki: [{ rodzaj: 'zasilek-chorobowy', dataWyplaty: '2026-10-14', kwota: 152040, sposobWyplaty: 'przelew' }],
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
  // Tomasz Nowak: pracownik od 01.04.2015, płatnik wypłaca zasiłki.
  '90011555532': {
    tytuly: [
      {
        id: 'T-90011555532-1',
        rodzaj: 'pracownik',
        od: '2015-04-01',
        ubezpieczenieChorobowe: { rodzaj: 'obowiazkowe' },
        podstawySkladek: podstawy(950000, OSTATNIE_12_OD, OSTATNIE_12_DO),
        platnik: { nazwa: 'Transport Wiśniewski sp. z o.o.', nip: '3199351816', regon: '193786574', wyplacaZasilki: 'tak' },
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
        podstawySkladek: podstawy(565200, '2026-10', '2026-11'),
        platnik: { nazwa: 'Paulina Wrona', nip: '6793045123', regon: '356410920', wyplacaZasilki: 'nie-dotyczy' },
      },
    ],
    czlonkowieRodziny: [],
    zasilki: [],
    adres: 'ul. Polna 7, 30-001 Kraków',
    emailEzus: 'paulina.wrona@example.com',
  },
};
