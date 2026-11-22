// Sprawy wzorcowe S01–S11 z danymi i rozstrzygnięciem (kontrakt, sekcja 8; ANALIZY/13 sekcja 11).
// Właściciel: u05 (Przykładowe sprawy: lista, dokumenty i odczyt AI).
// Wartości mają źródło sprawa zespołu. Konto, czas wyboru i czas wgrania dokumentów ustawia operacja
// wybierzSpraweZespolu w chwili wyboru sprawy.
import { dodajMiesiaceDoMiesiaca } from '@/domena/daty';
import { pusteDaneSprawy } from '@/domena/przykladowe-sprawy/scalanie';
import type {
  DaneSprawy,
  DataISO,
  DokumentSprawy,
  Grosze,
  MiesiacISO,
  OkresOtwarty,
  RodzajDokumentuSprawy,
  RodzajUrlopu,
  RozstrzygniecieSprawy,
  SprawaPrzykladowa,
  WartoscSprawy,
} from '@/domena/typy';

const ZESPOL = { rodzaj: 'sprawa-zespolu' } as const;

function z<T>(wartosc: T): WartoscSprawy<T> {
  return { wartosc, zrodlo: ZESPOL };
}

type RodzajKwoty = 'wynagrodzenie' | 'przychod' | 'podstawa-skladek';

function miesiace(od: MiesiacISO, liczba: number, kwota: Grosze, rodzaj: RodzajKwoty) {
  return Array.from({ length: liczba }, (_, i) => ({ miesiac: dodajMiesiaceDoMiesiaca(od, i), kwota, rodzaj }));
}

interface OpisSprawy {
  id: string;
  sytuacja: string;
  dokumenty: RodzajDokumentuSprawy[];
  imie: string;
  nazwisko: string;
  pesel: string;
  rola?: 'matka' | 'ojciec-przejmujacy';
  tytul: 'pracownik' | 'zleceniobiorca' | 'dzialalnosc';
  tytulOd: DataISO;
  tytulDo?: DataISO;
  etat?: 'pelny-etat' | 'niepelny-etat';
  chorobowe: 'obowiazkowe' | 'dobrowolne' | 'brak';
  okresyChorobowe: OkresOtwarty[];
  liczbaUb?: 'do-20' | 'powyzej-20';
  przyczyna?: 'likwidacja';
  inneZatrudnienie?: boolean;
  kwoty: { miesiac: MiesiacISO; kwota: Grosze; rodzaj: RodzajKwoty }[];
  porod?: DataISO;
  niezdolnosc?: { od: DataISO; do: DataISO; kod?: string };
  swiadczenia: ('zasilek-macierzynski' | 'zwzm' | 'zasilek-chorobowy')[];
  okresy: { rodzajUrlopu: RodzajUrlopu; od: DataISO; do: DataISO }[];
  oswiadczenie?: boolean;
  zlozenie?: DataISO;
  okresMatki?: { od: DataISO; do: DataISO };
  zadluzenie?: { kwota: Grosze; dzien: DataISO };
  rozstrzygniecie: Omit<RozstrzygniecieSprawy, 'zrodlo'>[];
  /** Dokumenty przykładowe z public/przyklady z tymi samymi danymi, pokazywane w podglądzie dokumentu sprawy. */
  pliki?: Partial<Record<RodzajDokumentuSprawy, string>>;
}

function daneSprawy(o: OpisSprawy): DaneSprawy {
  const d = pusteDaneSprawy();
  d.ubezpieczony = { imie: z(o.imie), nazwisko: z(o.nazwisko), pesel: z(o.pesel), rola: z(o.rola ?? 'matka') };
  d.tytul = { rodzaj: z(o.tytul), od: z(o.tytulOd), dataUstania: o.tytulDo ? z(o.tytulDo) : d.tytul.dataUstania };
  if (o.etat) d.wymiarCzasuPracy = z(o.etat);
  d.ubezpieczenieChorobowe = {
    rodzaj: z(o.chorobowe),
    okresy: o.okresyChorobowe.length > 0 ? z(o.okresyChorobowe) : d.ubezpieczenieChorobowe.okresy,
    dataUstaniaPrzyTrwajacymTytule: d.ubezpieczenieChorobowe.dataUstaniaPrzyTrwajacymTytule,
  };
  if (o.liczbaUb) d.liczbaUbezpieczonychPlatnika = z(o.liczbaUb);
  if (o.przyczyna) d.ustanieZatrudnienia = { przyczyna: z(o.przyczyna), inneZatrudnienie: z(o.inneZatrudnienie ?? false) };
  d.pracaPoUstaniu = z(false);
  if (o.porod) {
    d.zdarzenie.rodzaj = z('porod');
    d.zdarzenie.dataPorodu = z(o.porod);
    d.zdarzenie.liczbaDzieci = z(1);
  }
  if (o.niezdolnosc) {
    d.zdarzenie.rodzaj = z('niezdolnosc');
    d.zdarzenie.niezdolnosc = z(o.niezdolnosc);
  }
  d.wniosek = {
    swiadczenia: z(o.swiadczenia),
    okresy: o.okresy.length > 0 ? z(o.okresy) : d.wniosek.okresy,
    oswiadczeniePelnyWymiar: o.porod ? z(o.oswiadczenie ?? false) : d.wniosek.oswiadczeniePelnyWymiar,
    dataZlozenia: o.zlozenie ? z(o.zlozenie) : d.wniosek.dataZlozenia,
    okresMatki: o.okresMatki ? z(o.okresMatki) : d.wniosek.okresMatki,
  };
  d.kwotyMiesieczne = z(o.kwoty);
  if (o.zadluzenie) d.zadluzenieJdg = z(o.zadluzenie);
  return d;
}

function sprawa(o: OpisSprawy): SprawaPrzykladowa {
  const numery = new Map<RodzajDokumentuSprawy, number>();
  const dokumenty: DokumentSprawy[] = o.dokumenty.map((rodzaj) => {
    const numer = (numery.get(rodzaj) ?? 0) + 1;
    numery.set(rodzaj, numer);
    return { id: `${o.id}-${rodzaj}-${numer}`, rodzaj, numer, wgrano: '', plikZespolu: o.pliki?.[rodzaj] ?? `${o.id}-${rodzaj}.pdf`, konto: '' };
  });
  return {
    idSprawy: o.id,
    zrodlo: 'sprawa-wzorcowa',
    sytuacja: o.sytuacja,
    konto: '',
    rozpoczeto: '',
    dokumenty,
    dane: daneSprawy(o),
    rozstrzygniecie: o.rozstrzygniecie.map((r) => ({ ...r, zrodlo: ZESPOL })),
  };
}

export const sprawyWzorcowe: readonly SprawaPrzykladowa[] = [
  sprawa({
    id: 'S01', sytuacja: 'Pracownica u płatnika zgłaszającego do 20 osób', dokumenty: ['z-3'],
    imie: 'Agnieszka', nazwisko: 'Kowalczyk', pesel: '94051243149',
    tytul: 'pracownik', tytulOd: '2019-04-01', etat: 'pelny-etat', chorobowe: 'obowiazkowe', okresyChorobowe: [{ od: '2019-04-01' }],
    liczbaUb: 'do-20', kwoty: miesiace('2025-09', 12, 700000, 'wynagrodzenie'), porod: '2026-09-02',
    swiadczenia: ['zasilek-macierzynski'], okresy: [{ rodzajUrlopu: 'macierzynski', od: '2026-09-02', do: '2027-01-19' }],
    rozstrzygniecie: [{ swiadczenie: 'zasilek-macierzynski', prawo: 'przysluguje', platnik: 'zus', okres: { od: '2026-09-02', do: '2027-01-19' }, stawka: 100, miesiecznaKwota: 604030 }],
    pliki: { 'z-3': 'z3-kowalczyk.pdf' },
  }),
  sprawa({
    id: 'S02', sytuacja: 'Pracownica u płatnika uprawnionego z wynagrodzeniem poniżej minimalnej podstawy', dokumenty: ['z-3'],
    imie: 'Natalia', nazwisko: 'Zielińska', pesel: '96080321740',
    tytul: 'pracownik', tytulOd: '2023-02-01', etat: 'pelny-etat', chorobowe: 'obowiazkowe', okresyChorobowe: [{ od: '2023-02-01' }],
    liczbaUb: 'powyzej-20', kwoty: [...miesiace('2025-07', 6, 466600, 'wynagrodzenie'), ...miesiace('2026-01', 6, 480600, 'wynagrodzenie')],
    porod: '2026-07-15', swiadczenia: ['zasilek-macierzynski'], okresy: [{ rodzajUrlopu: 'macierzynski', od: '2026-07-15', do: '2026-12-01' }],
    rozstrzygniecie: [{ swiadczenie: 'zasilek-macierzynski', prawo: 'przysluguje', platnik: 'platnik-skladek', okres: { od: '2026-07-15', do: '2026-12-01' }, stawka: 100, miesiecznaKwota: 414710 }],
  }),
  sprawa({
    id: 'S03', sytuacja: 'Zleceniobiorczyni z wnioskiem o wariant 81,5%', dokumenty: ['z-3a', 'zam'],
    imie: 'Oliwia', nazwisko: 'Sadowska', pesel: '95012760842',
    tytul: 'zleceniobiorca', tytulOd: '2025-03-01', chorobowe: 'dobrowolne', okresyChorobowe: [{ od: '2025-03-01' }],
    liczbaUb: 'do-20', kwoty: miesiace('2025-08', 12, 520000, 'przychod'), porod: '2026-08-20', zlozenie: '2026-08-25', oswiadczenie: true,
    swiadczenia: ['zasilek-macierzynski'],
    okresy: [{ rodzajUrlopu: 'macierzynski', od: '2026-08-20', do: '2027-01-06' }, { rodzajUrlopu: 'rodzicielski', od: '2027-01-07', do: '2027-08-18' }],
    rozstrzygniecie: [{ swiadczenie: 'zasilek-macierzynski', prawo: 'przysluguje', platnik: 'zus', okres: { od: '2026-08-20', do: '2027-08-18' }, stawka: 81.5, miesiecznaKwota: 365697 }],
    pliki: { 'z-3a': 'z3a-sadowska.pdf', zam: 'zam-sadowska.pdf' },
  }),
  sprawa({
    id: 'S04', sytuacja: 'Osoba prowadząca działalność z dobrowolnym ubezpieczeniem chorobowym od 2 lat', dokumenty: ['poswiadczenie', 'zam'],
    imie: 'Marta', nazwisko: 'Pawlak', pesel: '91110912444',
    tytul: 'dzialalnosc', tytulOd: '2024-09-01', chorobowe: 'dobrowolne', okresyChorobowe: [{ od: '2024-09-01' }],
    kwoty: miesiace('2025-11', 12, 650000, 'podstawa-skladek'), zadluzenie: { kwota: 0, dzien: '2026-11-03' },
    porod: '2026-11-03', zlozenie: '2026-11-05', swiadczenia: ['zasilek-macierzynski'],
    okresy: [{ rodzajUrlopu: 'macierzynski', od: '2026-11-03', do: '2027-03-22' }],
    rozstrzygniecie: [{ swiadczenie: 'zasilek-macierzynski', prawo: 'przysluguje', platnik: 'zus', okres: { od: '2026-11-03', do: '2027-03-22' }, stawka: 100, miesiecznaKwota: 560885 }],
    pliki: { poswiadczenie: 'poswiadczenie-pawlak.pdf', zam: 'zam-pawlak.pdf' },
  }),
  sprawa({
    id: 'S05', sytuacja: 'Osoba prowadząca działalność bez dobrowolnego ubezpieczenia chorobowego', dokumenty: ['poswiadczenie', 'zam'],
    imie: 'Julia', nazwisko: 'Krawczyk', pesel: '93061837542',
    tytul: 'dzialalnosc', tytulOd: '2022-06-01', chorobowe: 'brak', okresyChorobowe: [],
    kwoty: miesiace('2025-08', 12, 565200, 'podstawa-skladek'), porod: '2026-08-12', zlozenie: '2026-08-20',
    swiadczenia: ['zasilek-macierzynski'], okresy: [{ rodzajUrlopu: 'macierzynski', od: '2026-08-12', do: '2026-12-29' }],
    rozstrzygniecie: [{ swiadczenie: 'zasilek-macierzynski', prawo: 'nie-przysluguje' }],
    pliki: { zam: 'zam-krawczyk.pdf' },
  }),
  sprawa({
    id: 'S06', sytuacja: 'Osoba prowadząca działalność ubezpieczona od 2 miesięcy', dokumenty: ['poswiadczenie', 'zam'],
    imie: 'Weronika', nazwisko: 'Baran', pesel: '97040252944',
    tytul: 'dzialalnosc', tytulOd: '2026-08-01', chorobowe: 'dobrowolne', okresyChorobowe: [{ od: '2026-08-01' }],
    kwoty: [...miesiace('2026-08', 1, 565200, 'podstawa-skladek'), ...miesiace('2026-09', 1, 765200, 'podstawa-skladek')],
    zadluzenie: { kwota: 0, dzien: '2026-10-14' }, porod: '2026-10-14', zlozenie: '2026-10-16', swiadczenia: ['zasilek-macierzynski'],
    okresy: [{ rodzajUrlopu: 'macierzynski', od: '2026-10-14', do: '2027-03-02' }],
    rozstrzygniecie: [{ swiadczenie: 'zasilek-macierzynski', prawo: 'przysluguje', platnik: 'zus', okres: { od: '2026-10-14', do: '2027-03-02' }, stawka: 100, miesiecznaKwota: 502093 }],
  }),
  sprawa({
    id: 'S07', sytuacja: 'Pracownica po likwidacji pracodawcy w ciąży', dokumenty: ['z-3', 'zam'],
    imie: 'Monika', nazwisko: 'Zając', pesel: '90092186241',
    tytul: 'pracownik', tytulOd: '2020-03-01', tytulDo: '2026-09-30', etat: 'pelny-etat', chorobowe: 'obowiazkowe',
    okresyChorobowe: [{ od: '2020-03-01', do: '2026-09-30' }], liczbaUb: 'do-20', przyczyna: 'likwidacja', inneZatrudnienie: false,
    kwoty: miesiace('2025-10', 12, 620000, 'wynagrodzenie'), porod: '2026-11-10', zlozenie: '2026-11-12',
    swiadczenia: ['zwzm', 'zasilek-macierzynski'], okresy: [{ rodzajUrlopu: 'macierzynski', od: '2026-11-10', do: '2027-03-29' }],
    rozstrzygniecie: [
      { swiadczenie: 'zwzm', prawo: 'przysluguje', platnik: 'zus', okres: { od: '2026-10-01', do: '2026-11-09' }, stawka: 100, miesiecznaKwota: 534998 },
      { swiadczenie: 'zasilek-macierzynski', prawo: 'przysluguje', platnik: 'zus', okres: { od: '2026-11-10', do: '2027-03-29' }, stawka: 100, miesiecznaKwota: 534998 },
    ],
    pliki: { 'z-3': 'z3-zajac.pdf', zam: 'zam-zajac.pdf' },
  }),
  sprawa({
    id: 'S08', sytuacja: 'Zleceniobiorczyni z umową zakończoną przed porodem', dokumenty: ['z-3a', 'zam'],
    imie: 'Aleksandra', nazwisko: 'Duda', pesel: '98021474346',
    tytul: 'zleceniobiorca', tytulOd: '2025-02-01', tytulDo: '2026-08-31', chorobowe: 'dobrowolne',
    okresyChorobowe: [{ od: '2025-02-01', do: '2026-08-31' }], liczbaUb: 'do-20',
    kwoty: miesiace('2025-09', 12, 490000, 'przychod'), porod: '2026-10-05', zlozenie: '2026-10-08',
    swiadczenia: ['zasilek-macierzynski'], okresy: [{ rodzajUrlopu: 'macierzynski', od: '2026-10-05', do: '2027-02-21' }],
    rozstrzygniecie: [{ swiadczenie: 'zasilek-macierzynski', prawo: 'nie-przysluguje' }],
  }),
  sprawa({
    id: 'S09', sytuacja: 'Ojciec przejmujący urlop macierzyński po 14 tygodniach', dokumenty: ['poswiadczenie', 'zam'],
    imie: 'Piotr', nazwisko: 'Michalski', pesel: '89120530653', rola: 'ojciec-przejmujacy',
    tytul: 'dzialalnosc', tytulOd: '2022-05-01', chorobowe: 'dobrowolne', okresyChorobowe: [{ od: '2022-05-01' }],
    kwoty: miesiace('2025-10', 12, 800000, 'podstawa-skladek'), zadluzenie: { kwota: 0, dzien: '2026-10-07' },
    porod: '2026-07-01', zlozenie: '2026-09-30', okresMatki: { od: '2026-07-01', do: '2026-10-06' }, swiadczenia: ['zasilek-macierzynski'],
    okresy: [{ rodzajUrlopu: 'macierzynski', od: '2026-10-07', do: '2026-11-17' }],
    rozstrzygniecie: [{ swiadczenie: 'zasilek-macierzynski', prawo: 'przysluguje', platnik: 'zus', okres: { od: '2026-10-07', do: '2026-11-17' }, stawka: 100, miesiecznaKwota: 690320 }],
  }),
  sprawa({
    id: 'S10', sytuacja: 'Osoba prowadząca działalność z zadłużeniem ponad próg', dokumenty: ['poswiadczenie', 'zam'],
    imie: 'Katarzyna', nazwisko: 'Wilk', pesel: '92033018549',
    tytul: 'dzialalnosc', tytulOd: '2024-01-01', chorobowe: 'dobrowolne', okresyChorobowe: [{ od: '2024-01-01' }],
    kwoty: miesiace('2025-09', 12, 565200, 'podstawa-skladek'), zadluzenie: { kwota: 15000, dzien: '2026-09-09' },
    porod: '2026-09-09', zlozenie: '2026-09-11', swiadczenia: ['zasilek-macierzynski'],
    okresy: [{ rodzajUrlopu: 'macierzynski', od: '2026-09-09', do: '2027-01-26' }],
    rozstrzygniecie: [{ swiadczenie: 'zasilek-macierzynski', prawo: 'nie-przysluguje', platnik: 'zus' }],
  }),
  sprawa({
    id: 'S11', sytuacja: 'Zleceniobiorczyni niezdolna do pracy w okresie wyczekiwania', dokumenty: ['z-3a'],
    imie: 'Zuzanna', nazwisko: 'Górska', pesel: '99070745243',
    tytul: 'zleceniobiorca', tytulOd: '2026-09-01', chorobowe: 'dobrowolne', okresyChorobowe: [{ od: '2026-09-01' }], liczbaUb: 'do-20',
    kwoty: miesiace('2026-09', 1, 480600, 'przychod'), niezdolnosc: { od: '2026-10-15', do: '2026-11-14', kod: 'B' },
    swiadczenia: ['zasilek-chorobowy'], okresy: [],
    rozstrzygniecie: [{ swiadczenie: 'zasilek-chorobowy', prawo: 'nie-przysluguje', platnik: 'zus', okres: { od: '2026-10-15', do: '2026-11-14' } }],
    pliki: { 'z-3a': 'z3a-gorska.pdf' },
  }),
];
