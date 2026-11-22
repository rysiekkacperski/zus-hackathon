// Scenariusze demonstracyjne jednostki u25 (kontrakt, sekcja 6.6). Właściciel: u25.
// Scenariusze odtwarzają stan z kryteriów akceptacji historyjek 3.3.5.1.1 i 3.3.5.1.2 na koncie Anny Nowak
// (JDG z dobrowolnym ubezpieczeniem chorobowym, poród 19.11.2026): urodzenie martwego dziecka w spokojnym trybie,
// zgon jednego z bliźniąt i przedwczesny poród.
import { kontaPrzykladowe } from '@/dane/konta-demo';
import { kontoPrzewodnikaZKontaDemo } from '@/dane/magazyn/stan-poczatkowy';
import type {
  DaneCiazyIDziecka,
  DaneRodziny,
  KontekstOperacji,
  KontoPrzewodnika,
  ScenariuszDemo,
  StanKonta,
  StanRodziny,
  SytuacjaSzczegolna,
} from '@/domena/typy';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoSettings.scenariusze.pozycje;

const PESEL_ANNY = '93041231085';
const DATA_PORODU = '2026-11-19';

function kontoAnny(ctx: KontekstOperacji): KontoPrzewodnika {
  const demo = kontaPrzykladowe.find((k) => k.pesel === PESEL_ANNY);
  if (demo === undefined) throw new Error('Brak konta demonstracyjnego Anny Nowak.');
  return {
    ...kontoPrzewodnikaZKontaDemo(demo, ctx.teraz),
    rola: 'rodzic',
    idRodziny: PESEL_ANNY,
    decyzjeOZgodzie: [{ rodzaj: 'udzielenie', wersjaTresci: '1.0', czas: ctx.teraz }],
  };
}

function daneRodzinyAnny(ctx: KontekstOperacji): DaneRodziny {
  return {
    idRodziny: PESEL_ANNY,
    sytuacja: { wartosc: 'narodziny', zrodlo: 'odpowiedz-rodzica' },
    rodzicKonta: 'matka',
    matka: {
      formaZatrudnienia: { wartosc: 'jdg', zrodlo: 'konto-zus' },
      dobrowolneChorobowe: { wartosc: true, zrodlo: 'konto-zus' },
      platnikZasilku: { wartosc: 'zus', zrodlo: 'konto-zus' },
      potwierdzeniaSkladek: [],
    },
    drugiRodzic: { formaZatrudnienia: null, dobrowolneChorobowe: null, platnikZasilku: null, potwierdzeniaSkladek: [] },
    stanCywilny: null,
    gmina: null,
    dochodNaOsobe: null,
    dostepKont: [{ pesel: PESEL_ANNY, rola: 'rodzic', dolaczono: ctx.dzis, stan: 'aktywny' }],
    zapisano: ctx.teraz,
  };
}

function sytuacja(ctx: KontekstOperacji, rodzaj: SytuacjaSzczegolna['rodzaj'], dataZdarzenia: string, liczbaDzieci?: number): SytuacjaSzczegolna {
  return {
    id: `u25-${rodzaj}`,
    rodzaj,
    dataZdarzenia,
    ...(liczbaDzieci === undefined ? {} : { liczbaDzieci }),
    zrodlo: 'odpowiedz-rodzica',
    kontoZapisujace: PESEL_ANNY,
    zapisano: ctx.teraz,
  };
}

function daneCiazyAnny(zmiana: Partial<DaneCiazyIDziecka>): DaneCiazyIDziecka {
  return {
    przewidywanyTerminPorodu: '2026-12-10',
    liczbaDzieciZCiazy: 1,
    dataPierwszejWizyty: '2026-05-20',
    dataPorodu: DATA_PORODU,
    dataPoroduPotwierdzona: true,
    zrodloDatyPorodu: 'odpowiedz-rodzica',
    liczbaUrodzonychDzieci: 1,
    dzieci: [],
    sytuacjeSzczegolne: [],
    spokojnyTryb: { wlaczony: false },
    ...zmiana,
  };
}

function rodzinaAnny(ctx: KontekstOperacji, daneCiazy: DaneCiazyIDziecka): StanRodziny {
  return {
    idRodziny: PESEL_ANNY,
    daneRodziny: daneRodzinyAnny(ctx),
    daneCiazy,
    plan: null,
    kalendarz: null,
    wnioski: [],
    wynikiKalkulacji: { scenariusze: [], porownaniaWariantow: [], podzialyUrlopu: [], nastepnyNumer: 1 },
  };
}

function kontoScenariusza(ctx: KontekstOperacji): Partial<StanKonta> {
  return { konto: kontoAnny(ctx) };
}

export const scenariuszeU25: readonly ScenariuszDemo[] = [
  {
    id: 'u25-anna-martwe-urodzenie',
    nazwa: tekst['u25-anna-martwe-urodzenie'].nazwa,
    opis: tekst['u25-anna-martwe-urodzenie'].opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      konto: kontoScenariusza(ctx),
      rodzina: rodzinaAnny(
        ctx,
        daneCiazyAnny({
          liczbaDzieciUrodzonychZywo: 0,
          sytuacjeSzczegolne: [sytuacja(ctx, 'martwe-urodzenie', DATA_PORODU, 1)],
          spokojnyTryb: { wlaczony: true, od: ctx.dzis },
        }),
      ),
    }),
  },
  {
    id: 'u25-anna-zgon-jednego-z-blizniat',
    nazwa: tekst['u25-anna-zgon-jednego-z-blizniat'].nazwa,
    opis: tekst['u25-anna-zgon-jednego-z-blizniat'].opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      konto: kontoScenariusza(ctx),
      rodzina: rodzinaAnny(
        ctx,
        daneCiazyAnny({
          liczbaDzieciZCiazy: 2,
          liczbaUrodzonychDzieci: 2,
          liczbaDzieciUrodzonychZywo: 2,
          sytuacjeSzczegolne: [sytuacja(ctx, 'zgon-dziecka', '2026-11-20', 1)],
          spokojnyTryb: { wlaczony: true, od: ctx.dzis },
        }),
      ),
    }),
  },
  {
    id: 'u25-anna-przedwczesny-porod',
    nazwa: tekst['u25-anna-przedwczesny-porod'].nazwa,
    opis: tekst['u25-anna-przedwczesny-porod'].opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      konto: kontoScenariusza(ctx),
      rodzina: rodzinaAnny(
        ctx,
        daneCiazyAnny({
          liczbaDzieciUrodzonychZywo: 1,
          sytuacjeSzczegolne: [sytuacja(ctx, 'przedwczesny-porod', DATA_PORODU)],
          spokojnyTryb: { wlaczony: true, od: ctx.dzis },
        }),
      ),
    }),
  },
];
