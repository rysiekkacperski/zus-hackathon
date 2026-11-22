// Scenariusze demonstracyjne jednostki u07 (kontrakt, sekcja 6.6). Właściciel: u07.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek jednostki (3.3.1.1.1, 3.3.1.1.2, 3.3.1.4.1),
// które wymagają danych spoza przykładowych kont albo decyzji o zgodzie zapisanej na koncie.
import { kontoPrzykladowe } from '@/dane/konta-demo';
import { kontoPrzewodnikaZKontaDemo } from '@/dane/magazyn/stan-poczatkowy';
import { WERSJA_TRESCI_ZGODY } from '@/domena/konto';
import type {
  KontekstOperacji,
  KontoPrzewodnika,
  ParametrySystemu,
  Pesel,
  PodstawaSkladek,
  RodzajDecyzjiOZgodzie,
  ScenariuszDemo,
  SzkicProfilu,
} from '@/domena/typy';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoSettings.scenariusze.pozycje;

const PESEL_ANNY_NOWAK: Pesel = '93041231085';
const PESEL_MAGDALENY_WOJCIK: Pesel = '90072551267';
const PESEL_JOANNY_MAZUR: Pesel = '91113040407';

/** Konto przewodnika konta przykładowego z jedną decyzją o zgodzie na dane dotyczące zdrowia. */
function kontoZDecyzja(pesel: Pesel, rodzaj: RodzajDecyzjiOZgodzie, ctx: KontekstOperacji): KontoPrzewodnika {
  const demo = kontoPrzykladowe(pesel);
  if (demo === undefined) throw new Error(`Brak konta przykładowego ${pesel}`);
  return {
    ...kontoPrzewodnikaZKontaDemo(demo, ctx.teraz),
    decyzjeOZgodzie: [{ rodzaj, wersjaTresci: WERSJA_TRESCI_ZGODY, czas: ctx.teraz }],
  };
}

/** Podstawy składek z 12 miesięcy kończących się listopadem 2026. */
function podstawy(kwota: number): PodstawaSkladek[] {
  return Array.from({ length: 12 }, (_, i) => {
    const miesiac = ((i + 11) % 12) + 1;
    const rok = i === 0 ? 2025 : 2026;
    return { miesiac: `${rok}-${String(miesiac).padStart(2, '0')}`, kwota };
  });
}

export const scenariuszeU07: readonly ScenariuszDemo[] = [
  {
    id: 'u07-kilka-tytulow',
    nazwa: tekst['u07-kilka-tytulow'].nazwa,
    opis: tekst['u07-kilka-tytulow'].opis,
    pesel: PESEL_MAGDALENY_WOJCIK,
    zastosuj: (ctx) => ({
      konto: { konto: kontoZDecyzja(PESEL_MAGDALENY_WOJCIK, 'udzielenie', ctx) },
      zus: {
        nadpisania: {
          tytuly: [
            {
              id: 'u07-pracownik',
              rodzaj: 'pracownik',
              od: '2023-09-01',
              ubezpieczenieChorobowe: { rodzaj: 'obowiazkowe', od: '2023-09-01' },
              podstawySkladek: podstawy(720000),
              platnik: {
                nazwa: 'Biuro Rachunkowe Bilans sp. z o.o.',
                nip: '1234563218',
                regon: '123456785',
                wyplacaZasilki: 'tak',
              },
            },
            {
              id: 'u07-zleceniobiorca',
              rodzaj: 'zleceniobiorca',
              od: '2025-02-01',
              ubezpieczenieChorobowe: { rodzaj: 'dobrowolne', od: '2025-02-01' },
              podstawySkladek: podstawy(150000),
              platnik: {
                nazwa: 'Agencja Pod Chmurką sp. z o.o.',
                nip: '9876543210',
                regon: '987654325',
                wyplacaZasilki: 'nie',
              },
            },
          ],
          czlonkowieRodziny: [
            { imie: 'Jan', nazwisko: 'Wiśniewski', pesel: '24231203452', dataUrodzenia: '2024-03-12' },
          ],
        },
      },
    }),
  },
  {
    id: 'u07-dane-zus-niedostepne',
    nazwa: tekst['u07-dane-zus-niedostepne'].nazwa,
    opis: tekst['u07-dane-zus-niedostepne'].opis,
    pesel: PESEL_JOANNY_MAZUR,
    zastosuj: (ctx) => ({
      konto: { konto: kontoZDecyzja(PESEL_JOANNY_MAZUR, 'udzielenie', ctx) },
      parametry: {
        symulacje: { daneZusNiedostepne: true } as Partial<ParametrySystemu['symulacje']> as ParametrySystemu['symulacje'],
      },
    }),
  },
  {
    id: 'u07-odmowa-zgody',
    nazwa: tekst['u07-odmowa-zgody'].nazwa,
    opis: tekst['u07-odmowa-zgody'].opis,
    pesel: PESEL_ANNY_NOWAK,
    zastosuj: (ctx) => ({ konto: { konto: kontoZDecyzja(PESEL_ANNY_NOWAK, 'odmowa', ctx) } }),
  },
  {
    id: 'u07-planowanie-rodzicielstwa',
    nazwa: tekst['u07-planowanie-rodzicielstwa'].nazwa,
    opis: tekst['u07-planowanie-rodzicielstwa'].opis,
    pesel: PESEL_ANNY_NOWAK,
    zastosuj: (ctx) => {
      const szkic: SzkicProfilu = {
        kontekst: 'start',
        powrotNaPodsumowanie: false,
        ostatniEkran: 'ViewProfileSituation',
        daneRodziny: {
          sytuacja: { wartosc: 'planowanie', zrodlo: 'odpowiedz-rodzica' },
          matka: {
            formaZatrudnienia: { wartosc: 'jdg', zrodlo: 'konto-zus' },
            dobrowolneChorobowe: { wartosc: true, zrodlo: 'konto-zus' },
            platnikZasilku: { wartosc: 'zus', zrodlo: 'konto-zus' },
            potwierdzeniaSkladek: [],
          },
        },
        daneCiazy: {},
        zmienionePola: [],
        utworzono: ctx.teraz,
        zaktualizowano: ctx.teraz,
      };
      return { konto: { konto: kontoZDecyzja(PESEL_ANNY_NOWAK, 'udzielenie', ctx), szkicProfilu: szkic } };
    },
  },
];
