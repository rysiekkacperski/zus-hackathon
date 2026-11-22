// Scenariusze demonstracyjne jednostki u22 (kontrakt, sekcja 6.6). Właściciel: u22.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek 3.5.3.1.1 i 3.5.3.1.2 na przykładowych kontach.
import { kontoPrzykladowe } from '@/dane/konta-demo';
import { kontoPrzewodnikaZKontaDemo, wynikiKalkulacjiPuste } from '@/dane/magazyn/stan-poczatkowy';
import type {
  DaneCiazyIDziecka,
  DaneRodzica,
  DataISO,
  KontekstOperacji,
  KontoPrzewodnika,
  Pesel,
  ScenariuszDemo,
  StanRodziny,
  TytulUbezpieczenia,
  WniosekOUrlop,
  ZmianaZatrudnieniaWCiazy,
} from '@/domena/typy';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoSettings.scenariusze.pozycje;

const PAULINA: Pesel = '95082103460';
const KAROLINA: Pesel = '96020377745';
const MAGDALENA: Pesel = '90072551267';
const EWA: Pesel = '92051401244';

function odpowiedz<T>(wartosc: T) {
  return { wartosc, zrodlo: 'odpowiedz-rodzica' as const };
}

function kontoRodzica(pesel: Pesel, ctx: KontekstOperacji): KontoPrzewodnika {
  const demo = kontoPrzykladowe(pesel);
  if (demo === undefined) throw new Error(`Brak konta przykładowego ${pesel}`);
  return {
    ...kontoPrzewodnikaZKontaDemo(demo, ctx.teraz),
    rola: 'rodzic',
    idRodziny: pesel,
    decyzjeOZgodzie: [{ rodzaj: 'udzielenie', wersjaTresci: '1.0', czas: ctx.teraz }],
  };
}

function matka(forma: DaneRodzica['formaZatrudnienia'], zmiana?: ZmianaZatrudnieniaWCiazy): DaneRodzica {
  return {
    formaZatrudnienia: forma,
    dobrowolneChorobowe: forma?.wartosc === 'umowa-zlecenia' || forma?.wartosc === 'jdg' ? odpowiedz(true) : null,
    platnikZasilku: null,
    potwierdzeniaSkladek: [],
    ...(zmiana === undefined ? {} : { zmianaZatrudnienia: zmiana }),
  };
}

function daneCiazy(ptp: DataISO): DaneCiazyIDziecka {
  return {
    przewidywanyTerminPorodu: ptp,
    liczbaDzieciZCiazy: 1,
    dataPierwszejWizyty: '2026-07-10',
    dataPoroduPotwierdzona: false,
    dzieci: [],
    sytuacjeSzczegolne: [],
    spokojnyTryb: { wlaczony: false },
  };
}

function rodzina(pesel: Pesel, m: DaneRodzica, ciaza: DaneCiazyIDziecka, ctx: KontekstOperacji, wnioski: WniosekOUrlop[] = []): StanRodziny {
  return {
    idRodziny: pesel,
    daneRodziny: {
      idRodziny: pesel,
      sytuacja: odpowiedz('oczekiwanie'),
      rodzicKonta: 'matka',
      matka: m,
      drugiRodzic: {
        formaZatrudnienia: odpowiedz('brak-drugiego-rodzica'),
        dobrowolneChorobowe: null,
        platnikZasilku: null,
        potwierdzeniaSkladek: [],
      },
      stanCywilny: odpowiedz('nie-malzenstwo'),
      gmina: null,
      dochodNaOsobe: odpowiedz('nieznany'),
      dostepKont: [{ pesel, rola: 'rodzic', dolaczono: ctx.dzis, stan: 'aktywny' }],
      zapisano: ctx.teraz,
    },
    daneCiazy: ciaza,
    plan: null,
    kalendarz: null,
    wnioski,
    wynikiKalkulacji: wynikiKalkulacjiPuste(),
  };
}

function poPorodzie(r: StanRodziny): StanRodziny {
  return { ...r, daneRodziny: { ...r.daneRodziny, sytuacja: { wartosc: 'narodziny', zrodlo: 'odpowiedz-rodzica' } } };
}

function tytul(rodzaj: TytulUbezpieczenia['rodzaj'], od: DataISO, chorobowe: 'obowiazkowe' | 'dobrowolne'): TytulUbezpieczenia {
  return {
    id: `${rodzaj}-${od}`,
    rodzaj,
    od,
    ubezpieczenieChorobowe: { rodzaj: chorobowe, od },
    podstawySkladek: [],
    platnik: { nazwa: 'Płatnik demonstracyjny', nip: '0000000000', regon: '000000000', wyplacaZasilki: 'nie' },
  };
}

export const scenariuszeU22: readonly ScenariuszDemo[] = [
  {
    id: 'u22-paulina-k28',
    nazwa: tekst['u22-paulina-k28'].nazwa,
    opis: tekst['u22-paulina-k28'].opis,
    pesel: PAULINA,
    zastosuj: (ctx) => ({
      konto: { konto: kontoRodzica(PAULINA, ctx) },
      rodzina: rodzina(
        PAULINA,
        matka(odpowiedz('jdg'), { rodzaj: odpowiedz('rozpoczecie'), forma: odpowiedz('jdg'), data: odpowiedz('2026-10-01') }),
        daneCiazy('2027-03-15'),
        ctx,
      ),
      zus: { nadpisania: { tytuly: [tytul('dzialalnosc', '2026-10-01', 'dobrowolne')] } },
    }),
  },
  {
    id: 'u22-karolina-k29',
    nazwa: tekst['u22-karolina-k29'].nazwa,
    opis: tekst['u22-karolina-k29'].opis,
    pesel: KAROLINA,
    zastosuj: (ctx) => ({
      konto: { konto: kontoRodzica(KAROLINA, ctx) },
      rodzina: rodzina(
        KAROLINA,
        matka(odpowiedz('umowa-zlecenia'), {
          rodzaj: odpowiedz('ustanie'),
          forma: odpowiedz('umowa-zlecenia'),
          data: odpowiedz('2027-01-31'),
        }),
        daneCiazy('2027-03-15'),
        ctx,
      ),
      zus: { nadpisania: { tytuly: [tytul('zleceniobiorca', '2025-02-01', 'dobrowolne')] } },
    }),
  },
  {
    id: 'u22-zleceniobiorczyni-k29-tytul-pracownika',
    nazwa: tekst['u22-zleceniobiorczyni-k29-tytul-pracownika'].nazwa,
    opis: tekst['u22-zleceniobiorczyni-k29-tytul-pracownika'].opis,
    pesel: KAROLINA,
    zastosuj: (ctx) => ({
      konto: { konto: kontoRodzica(KAROLINA, ctx) },
      rodzina: rodzina(
        KAROLINA,
        matka(odpowiedz('umowa-zlecenia'), {
          rodzaj: odpowiedz('ustanie'),
          forma: odpowiedz('umowa-zlecenia'),
          data: odpowiedz('2027-01-31'),
        }),
        daneCiazy('2027-03-15'),
        ctx,
      ),
      zus: {
        nadpisania: {
          tytuly: [tytul('zleceniobiorca', '2025-02-01', 'dobrowolne'), tytul('pracownik', '2025-06-01', 'obowiazkowe')],
        },
      },
    }),
  },
  {
    id: 'u22-ewa-k30-umowa-terminowa',
    nazwa: tekst['u22-ewa-k30-umowa-terminowa'].nazwa,
    opis: tekst['u22-ewa-k30-umowa-terminowa'].opis,
    pesel: EWA,
    zastosuj: (ctx) => ({
      konto: { konto: kontoRodzica(EWA, ctx) },
      rodzina: rodzina(
        EWA,
        matka(odpowiedz('umowa-o-prace'), {
          rodzaj: odpowiedz('ustanie'),
          forma: odpowiedz('umowa-o-prace'),
          data: odpowiedz('2027-01-31'),
          przyczyna: odpowiedz('koniec-umowy-terminowej'),
        }),
        daneCiazy('2027-06-30'),
        ctx,
      ),
      zus: { nadpisania: { tytuly: [tytul('pracownik', '2022-04-01', 'obowiazkowe')] } },
    }),
  },
  {
    id: 'u22-magdalena-k30-wniosek',
    nazwa: tekst['u22-magdalena-k30-wniosek'].nazwa,
    opis: tekst['u22-magdalena-k30-wniosek'].opis,
    pesel: MAGDALENA,
    zastosuj: (ctx) => ({
      konto: { konto: kontoRodzica(MAGDALENA, ctx) },
      rodzina: rodzina(MAGDALENA, matka(odpowiedz('umowa-o-prace')), daneCiazy('2027-03-15'), ctx, [
        {
          idWniosku: 'W-DEMO-U22-1',
          rodzaj: 'urlop-do-pracodawcy',
          podrodzaj: 'rodzicielski',
          idSprawy: 'K10',
          konto: MAGDALENA,
          rola: 'rodzic',
          stan: 'wyslany',
          utworzono: ctx.teraz,
          zaktualizowano: ctx.teraz,
          adresat: 'pracodawca',
          dataZlozenia: '2026-11-21',
          zalaczniki: [],
          okresy: [{ rodzajUrlopu: 'rodzicielski', od: '2027-08-02', do: '2027-10-31', rodzic: 'matka' }],
          oswiadczenia: {},
        },
      ]),
    }),
  },
  {
    id: 'u22-karolina-k35-przedwczesny-porod',
    nazwa: tekst['u22-karolina-k35-przedwczesny-porod'].nazwa,
    opis: tekst['u22-karolina-k35-przedwczesny-porod'].opis,
    pesel: KAROLINA,
    zastosuj: (ctx) => ({
      konto: { konto: kontoRodzica(KAROLINA, ctx) },
      rodzina: poPorodzie(rodzina(
        KAROLINA,
        matka(odpowiedz('umowa-zlecenia')),
        {
          ...daneCiazy('2027-01-05'),
          dataPorodu: '2026-11-10',
          dataPoroduPotwierdzona: true,
          zrodloDatyPorodu: 'odpowiedz-rodzica',
          liczbaUrodzonychDzieci: 1,
          tydzienCiazyWDniuPorodu: 32,
          sytuacjeSzczegolne: [
            {
              id: 'S-DEMO-U22-1',
              rodzaj: 'przedwczesny-porod',
              dataZdarzenia: '2026-11-10',
              zrodlo: 'odpowiedz-rodzica',
              kontoZapisujace: KAROLINA,
              zapisano: ctx.teraz,
            },
          ],
        },
        ctx,
      )),
      zus: { nadpisania: { tytuly: [tytul('zleceniobiorca', '2025-02-01', 'dobrowolne')] } },
    }),
  },
];
