// Scenariusze demonstracyjne jednostki u12 (kontrakt, sekcja 6.6). Właściciel: u12.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek jednostki: stan rozliczeń składek Anny Nowak
// (JDG z dobrowolnym ubezpieczeniem chorobowym) dla strażnika ubezpieczenia chorobowego (3.6.1.3.1 KA-14, KA-15).
// Scenariusz zmienia dane źródłowe symulowanego ZUS; plan rodziny powstaje po zapisaniu profilu na start.
// Scenariusze 3.6.1.3.1 KA-05, KA-06, KA-10 i KA-12 wczytują od razu profil rodziny, więc plan powstaje bez kreatora profilu.
import { kontoPrzykladowe } from '@/dane/konta-demo';
import { kontoPrzewodnikaZKontaDemo } from '@/dane/magazyn/stan-poczatkowy';
import { scenariuszeU08 } from '@/dane/scenariusze/u08';
import type {
  DataISO,
  Grosze,
  KontekstOperacji,
  KontoPrzewodnika,
  MiesiacISO,
  PodstawaSkladek,
  ScenariuszDemo,
  StanRodziny,
  TytulUbezpieczenia,
} from '@/domena/typy';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoSettings.scenariusze.pozycje;

const PESEL_ANNY = '93041231085';
const PESEL_KAROLINY = '96020377745';
const MIESIACE_12: MiesiacISO[] = Array.from({ length: 12 }, (_, i) => {
  const numer = 11 + i; // od 2025-12 do 2026-11
  const rok = 2025 + Math.floor(numer / 12);
  return `${rok}-${String((numer % 12) + 1).padStart(2, '0')}`;
});

/** Podstawa `zwykla` w 11 miesiącach i podstawa `ostatnia` w ostatnim miesiącu. */
function podstawy(zwykla: Grosze, ostatnia: Grosze): PodstawaSkladek[] {
  return MIESIACE_12.map((miesiac, i) => ({ miesiac, kwota: i === MIESIACE_12.length - 1 ? ostatnia : zwykla }));
}

function tytulAnny(z: { duchDo?: DataISO; podstawy?: PodstawaSkladek[] }): TytulUbezpieczenia {
  return {
    id: 'T-93041231085-1',
    rodzaj: 'dzialalnosc',
    od: '2024-03-01',
    ubezpieczenieChorobowe: { rodzaj: 'dobrowolne', od: '2024-03-01', ...(z.duchDo ? { do: z.duchDo } : {}) },
    podstawySkladek: z.podstawy ?? podstawy(600000, 600000),
    platnik: { nazwa: 'Anna Nowak', nip: '5542103785', regon: '382519074', wyplacaZasilki: 'nie-dotyczy' },
  };
}

function tytulKaroliny(z: { duchDo?: DataISO; podstawy?: PodstawaSkladek[] }): TytulUbezpieczenia {
  return {
    id: 'T-96020377745-1',
    rodzaj: 'zleceniobiorca',
    od: '2025-02-01',
    ubezpieczenieChorobowe: { rodzaj: 'dobrowolne', od: '2025-02-01', ...(z.duchDo ? { do: z.duchDo } : {}) },
    podstawySkladek: z.podstawy ?? podstawy(480600, 480600),
    platnik: { nazwa: 'Studio Kreska sp. z o.o.', nip: '1996030822', regon: '562819489', wyplacaZasilki: 'brak-informacji' },
  };
}

/** Profil Anny Nowak przed porodem ze scenariusza u08 (JDG z dobrowolnym ubezpieczeniem chorobowym). */
type StanScenariusza = ReturnType<ScenariuszDemo['zastosuj']>;

function profilAnny(ctx: KontekstOperacji): StanScenariusza {
  const bazowy = scenariuszeU08.find((s) => s.id === 'u08-anna-plan-przed-porodem');
  return bazowy ? bazowy.zastosuj(ctx) : {};
}

function kontoKaroliny(ctx: KontekstOperacji): KontoPrzewodnika | undefined {
  const demo = kontoPrzykladowe(PESEL_KAROLINY);
  if (demo === undefined) return undefined;
  return {
    ...kontoPrzewodnikaZKontaDemo(demo, ctx.teraz),
    rola: 'rodzic',
    idRodziny: PESEL_KAROLINY,
    decyzjeOZgodzie: [{ rodzaj: 'udzielenie', wersjaTresci: '1.0', czas: ctx.teraz }],
  };
}

/** Profil Karoliny Lis: umowa zlecenia z dobrowolnym ubezpieczeniem chorobowym, termin porodu 15.03.2027. */
function profilKaroliny(ctx: KontekstOperacji): StanScenariusza {
  const anna = profilAnny(ctx);
  const konto = kontoKaroliny(ctx);
  const rodzinaAnny = anna.rodzina;
  if (!rodzinaAnny || !konto) return {};
  const rodzina: StanRodziny = {
    ...rodzinaAnny,
    idRodziny: PESEL_KAROLINY,
    daneRodziny: {
      ...rodzinaAnny.daneRodziny,
      idRodziny: PESEL_KAROLINY,
      gmina: null,
      drugiRodzic: { formaZatrudnienia: { wartosc: 'umowa-o-prace', zrodlo: 'odpowiedz-rodzica' }, dobrowolneChorobowe: null, platnikZasilku: null, potwierdzeniaSkladek: [] },
      dostepKont: [{ pesel: PESEL_KAROLINY, rola: 'rodzic', dolaczono: '2026-11-21', stan: 'aktywny' }],
      matka: {
        formaZatrudnienia: { wartosc: 'umowa-zlecenia', zrodlo: 'konto-zus' },
        dobrowolneChorobowe: { wartosc: true, zrodlo: 'odpowiedz-rodzica' },
        platnikZasilku: null,
        potwierdzeniaSkladek: [],
      },
    },
  };
  return { konto: { konto }, rodzina, parametry: anna.parametry };
}

export const scenariuszeU12: readonly ScenariuszDemo[] = [
  {
    id: 'u12-anna-zadluzenie-120',
    nazwa: tekst['u12-anna-zadluzenie-120'].nazwa,
    opis: tekst['u12-anna-zadluzenie-120'].opis,
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
    nazwa: tekst['u12-anna-zadluzenie-30'].nazwa,
    opis: tekst['u12-anna-zadluzenie-30'].opis,
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
  {
    id: 'u12-anna-bez-duch',
    nazwa: tekst['u12-anna-bez-duch'].nazwa,
    opis: tekst['u12-anna-bez-duch'].opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      ...profilAnny(ctx),
      zus: { nadpisania: { tytuly: [tytulAnny({ duchDo: '2026-10-31' })] } },
    }),
  },
  {
    id: 'u12-anna-podwyzszenie-podstawy',
    nazwa: tekst['u12-anna-podwyzszenie-podstawy'].nazwa,
    opis: tekst['u12-anna-podwyzszenie-podstawy'].opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      ...profilAnny(ctx),
      zus: { nadpisania: { tytuly: [tytulAnny({ podstawy: podstawy(600000, 1200000) })] } },
    }),
  },
  {
    id: 'u12-anna-podstawa-7000',
    nazwa: tekst['u12-anna-podstawa-7000'].nazwa,
    opis: tekst['u12-anna-podstawa-7000'].opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      ...profilAnny(ctx),
      zus: { nadpisania: { tytuly: [tytulAnny({ podstawy: podstawy(600000, 700000) })] } },
    }),
  },
  {
    id: 'u12-karolina-bez-duch',
    nazwa: tekst['u12-karolina-bez-duch'].nazwa,
    opis: tekst['u12-karolina-bez-duch'].opis,
    pesel: PESEL_KAROLINY,
    zastosuj: (ctx) => ({
      ...profilKaroliny(ctx),
      zus: { nadpisania: { tytuly: [tytulKaroliny({ duchDo: '2026-10-31' })] } },
    }),
  },
  {
    id: 'u12-karolina-podwyzszenie-podstawy',
    nazwa: tekst['u12-karolina-podwyzszenie-podstawy'].nazwa,
    opis: tekst['u12-karolina-podwyzszenie-podstawy'].opis,
    pesel: PESEL_KAROLINY,
    zastosuj: (ctx) => ({
      ...profilKaroliny(ctx),
      zus: { nadpisania: { tytuly: [tytulKaroliny({ podstawy: podstawy(480600, 900000) })] } },
    }),
  },
];
