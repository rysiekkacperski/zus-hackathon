// Scenariusze demonstracyjne jednostki u03 (kontrakt, sekcja 6.6). Właściciel: u03.
// Scenariusze odtwarzają stany z kryteriów akceptacji historyjki 3.4.1.1.1 w dniu 21.11.2026: poprzednią kopię
// Danych z konta ZUS z 20.11.2026, 18:30, dziecko w danych konta ZUS i niedostępność danych ZUS. Po wczytaniu
// scenariusza zaloguj się kontem scenariusza na ekranie wyboru konta, żeby uruchomić odczyt.
import { utworzParametryPoczatkowe } from '@/dane/parametry-systemu';
import { zrodloweDaneKonta } from '@/dane/konta-zus';
import { przygotujKopie } from '@/domena/dane-zus/odczyt';
import { zbudujPesel } from '@/domena/pesel';
import type {
  CzlonekRodzinyZus,
  ParametrySystemu,
  Pesel,
  ScenariuszDemo,
  StanKonta,
  StanSymulowanegoZus,
} from '@/domena/typy';

const PESEL_ANNY: Pesel = '93041231085';
const PESEL_MAGDALENY: Pesel = '90072551267';
const PESEL_KAROLINY: Pesel = '96020377745';
const PESEL_JOANNY: Pesel = '91113040407';

const DZIEN_KRYTERIOW = '2026-11-21';
const POPRZEDNI_ODCZYT = '2026-11-20T18:30:00';

const ZOFIA_NOWAK: Omit<CzlonekRodzinyZus, 'noweDziecko'> = {
  imie: 'Zofia',
  nazwisko: 'Nowak',
  pesel: '26311907825',
  dataUrodzenia: '2026-11-19',
};

/** Parametry scenariusza: data demonstracyjna 21.11.2026 i przełączniki symulacji z wartości początkowych. */
function parametryScenariusza(daneZusNiedostepne: boolean): Partial<ParametrySystemu> {
  const { symulacje } = utworzParametryPoczatkowe();
  return { dataDemo: DZIEN_KRYTERIOW, symulacje: { ...symulacje, daneZusNiedostepne } };
}

/** Stan konta z kopią Danych z konta ZUS z poprzedniego odczytu 20.11.2026, 18:30. */
function kontoZKopia(pesel: Pesel, zus: StanSymulowanegoZus | null): Partial<StanKonta> {
  const zrodlo = zrodloweDaneKonta(pesel, zus);
  if (zrodlo === null) return {};
  const kopia = przygotujKopie({ zrodlo, poprzednia: null, teraz: POPRZEDNI_ODCZYT });
  return { kopiaDanychZus: kopia, stanOdczytuZus: { stan: 'udany', czas: POPRZEDNI_ODCZYT } };
}

function stanZus(pesel: Pesel, zmiana: Partial<StanSymulowanegoZus>): StanSymulowanegoZus {
  return {
    pesel,
    korespondencja: [],
    wnioskiZPrzewodnika: [],
    zaswiadczeniaORozliczeniach: [],
    ...zmiana,
  };
}

export const scenariuszeU03: readonly ScenariuszDemo[] = [
  {
    id: 'u03-anna-nowe-dziecko',
    nazwa: 'Anna Nowak: nowe dziecko w danych z konta ZUS',
    opis:
      'Konto Anna Nowak ma kopię z 20.11.2026, 18:30 bez członków rodziny, a dane konta ZUS pokazują Zofię Nowak urodzoną 19.11.2026. Odczyt 21.11.2026 oznacza ją jako nowe dziecko.',
    pesel: PESEL_ANNY,
    zastosuj: () => ({
      konto: kontoZKopia(PESEL_ANNY, null),
      zus: { dzieckoZSymulacji: ZOFIA_NOWAK },
      parametry: parametryScenariusza(false),
    }),
  },
  {
    id: 'u03-anna-dziecko-w-kopii',
    nazwa: 'Anna Nowak: dziecko obecne w poprzednim odczycie',
    opis:
      'Konto Anna Nowak ma kopię z 20.11.2026, 18:30 z Zofią Nowak. Odczyt 21.11.2026 zapisuje Zofię Nowak bez oznaczenia nowego dziecka.',
    pesel: PESEL_ANNY,
    zastosuj: () => ({
      konto: kontoZKopia(PESEL_ANNY, stanZus(PESEL_ANNY, { dzieckoZSymulacji: ZOFIA_NOWAK })),
      zus: { dzieckoZSymulacji: ZOFIA_NOWAK },
      parametry: parametryScenariusza(false),
    }),
  },
  {
    id: 'u03-anna-nieaktualne-dane',
    nazwa: 'Anna Nowak: dane konta ZUS niedostępne, kopia z 20.11.2026',
    opis:
      'Konto Anna Nowak ma kopię z 20.11.2026, 18:30, a dane konta ZUS są niedostępne. Odczyt 21.11.2026 korzysta z kopii i pokazuje komunikat 0002.',
    pesel: PESEL_ANNY,
    zastosuj: () => ({
      konto: kontoZKopia(PESEL_ANNY, null),
      parametry: parametryScenariusza(true),
    }),
  },
  {
    id: 'u03-joanna-brak-polaczenia',
    nazwa: 'Joanna Mazur: dane konta ZUS niedostępne, brak kopii',
    opis:
      'Konto Joanna Mazur nie ma kopii, a dane konta ZUS są niedostępne. Odczyt pokazuje komunikat 0001 z ponowieniem. Wyłącz symulację niedostępności danych ZUS i pobierz dane ponownie.',
    pesel: PESEL_JOANNY,
    zastosuj: () => ({
      parametry: parametryScenariusza(true),
    }),
  },
  {
    id: 'u03-pierwszy-odczyt-dziecko-z-2025',
    nazwa: 'Magdalena Wójcik: pierwszy odczyt z dzieckiem urodzonym 05.05.2025',
    opis:
      'Konto Magdalena Wójcik otwiera przewodnik po raz pierwszy, a dane konta ZUS pokazują członka rodziny urodzonego 05.05.2025. Odczyt zapisuje go bez oznaczenia nowego dziecka.',
    pesel: PESEL_MAGDALENY,
    zastosuj: () => ({
      zus: {
        nadpisania: {
          czlonkowieRodziny: [
            { imie: 'Jan', nazwisko: 'Wójcik', pesel: zbudujPesel('2025-05-05', 'mezczyzna', '078', 1), dataUrodzenia: '2025-05-05' },
          ],
        },
      },
      parametry: parametryScenariusza(false),
    }),
  },
  {
    id: 'u03-pierwszy-odczyt-dziecko-z-listopada',
    nazwa: 'Karolina Lis: pierwszy odczyt z dzieckiem urodzonym 02.11.2026',
    opis:
      'Konto Karolina Lis otwiera przewodnik po raz pierwszy, a dane konta ZUS pokazują członka rodziny urodzonego 02.11.2026. Odczyt oznacza go jako nowe dziecko.',
    pesel: PESEL_KAROLINY,
    zastosuj: () => ({
      zus: {
        nadpisania: {
          czlonkowieRodziny: [
            { imie: 'Maja', nazwisko: 'Lis', pesel: zbudujPesel('2026-11-02', 'kobieta', '078', 2), dataUrodzenia: '2026-11-02' },
          ],
        },
      },
      parametry: parametryScenariusza(false),
    }),
  },
];
