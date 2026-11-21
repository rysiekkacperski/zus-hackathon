// Scenariusze demonstracyjne jednostki u19 (kontrakt, sekcja 6.6). Właściciel: u19.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek jednostki (3.3.2.1.1 … 3.3.2.2.2):
// Anna Nowak (JDG z dobrowolnym ubezpieczeniem chorobowym, przewidywany termin porodu 15.03.2027,
// pierwsza wizyta 20.07.2026) przed porodem, z nowym dzieckiem w danych ZUS, z bliźniętami, po porodzie
// i z datą porodu różną od danych ZUS.
import { kontaPrzykladowe } from '@/dane/konta-demo';
import { kontoPrzewodnikaZKontaDemo } from '@/dane/magazyn/stan-poczatkowy';
import { zbudujPesel } from '@/domena/pesel';
import type {
  DaneCiazyIDziecka,
  DaneRodziny,
  KontekstOperacji,
  KontoPrzewodnika,
  ScenariuszDemo,
  StanKonta,
  StanRodziny,
} from '@/domena/typy';

const PESEL_ANNY = '93041231085';
const ZOFIA = { imie: 'Zofia', nazwisko: 'Nowak', pesel: '26311907825', dataUrodzenia: '2026-11-19' };

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
    sytuacja: { wartosc: 'oczekiwanie', zrodlo: 'odpowiedz-rodzica' },
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

function daneCiazyAnny(zmiana: Partial<DaneCiazyIDziecka> = {}): DaneCiazyIDziecka {
  return {
    przewidywanyTerminPorodu: '2027-03-15',
    liczbaDzieciZCiazy: 1,
    dataPierwszejWizyty: '2026-07-20',
    dataPoroduPotwierdzona: false,
    dzieci: [],
    sytuacjeSzczegolne: [],
    spokojnyTryb: { wlaczony: false },
    ...zmiana,
  };
}

function rodzinaAnny(ctx: KontekstOperacji, daneCiazy: DaneCiazyIDziecka, sytuacjaPoPorodzie = false): StanRodziny {
  const daneRodziny = daneRodzinyAnny(ctx);
  return {
    idRodziny: PESEL_ANNY,
    daneRodziny: sytuacjaPoPorodzie
      ? { ...daneRodziny, sytuacja: { wartosc: 'narodziny', zrodlo: 'odpowiedz-rodzica' } }
      : daneRodziny,
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

export const scenariuszeU19: readonly ScenariuszDemo[] = [
  {
    id: 'u19-anna-przed-porodem',
    nazwa: 'Anna Nowak przed porodem',
    opis: 'Profil z przewidywanym terminem porodu 15.03.2027, bez potwierdzonej daty porodu. Plan pokazuje akcję „Zgłoś narodziny”.',
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({ konto: kontoScenariusza(ctx), rodzina: rodzinaAnny(ctx, daneCiazyAnny()) }),
  },
  {
    id: 'u19-anna-nowe-dziecko-w-zus',
    nazwa: 'Anna Nowak: nowe dziecko w danych ZUS',
    opis: 'Bez potwierdzonej daty porodu; w danych ZUS pojawia się Zofia Nowak urodzona 19.11.2026. Po zalogowaniu plan pokazuje okno nowego dziecka.',
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      konto: kontoScenariusza(ctx),
      rodzina: rodzinaAnny(ctx, daneCiazyAnny()),
      zus: { dzieckoZSymulacji: ZOFIA },
    }),
  },
  {
    id: 'u19-anna-blizneta-w-zus',
    nazwa: 'Anna Nowak: bliźnięta w danych ZUS',
    opis: 'Bez potwierdzonej daty porodu; w danych ZUS pojawiają się Zofia i Jan Nowak urodzeni 19.11.2026.',
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      konto: kontoScenariusza(ctx),
      rodzina: rodzinaAnny(ctx, daneCiazyAnny({ liczbaDzieciZCiazy: 2 })),
      zus: {
        nadpisania: {
          czlonkowieRodziny: [
            ZOFIA,
            { imie: 'Jan', nazwisko: 'Nowak', pesel: zbudujPesel('2026-11-19', 'mezczyzna', '078', 1), dataUrodzenia: '2026-11-19' },
          ],
        },
      },
    }),
  },
  {
    id: 'u19-anna-po-porodzie',
    nazwa: 'Anna Nowak po porodzie 19.11.2026',
    opis: 'Potwierdzona data porodu 19.11.2026, jedno dziecko. Pakiet narodzin pokazuje sprawy na pierwsze 3 miesiące.',
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      konto: kontoScenariusza(ctx),
      rodzina: rodzinaAnny(
        ctx,
        daneCiazyAnny({
          dataPorodu: '2026-11-19', dataPoroduPotwierdzona: true, zrodloDatyPorodu: 'odpowiedz-rodzica', liczbaUrodzonychDzieci: 1,
        }),
        true,
      ),
    }),
  },
  {
    id: 'u19-anna-rozna-data-porodu',
    nazwa: 'Anna Nowak: data porodu różna od danych ZUS',
    opis: 'Potwierdzona data porodu 18.11.2026; w danych ZUS pojawia się Zofia Nowak urodzona 19.11.2026. Po zalogowaniu przewodnik prowadzi do daty porodu z komunikatem 0063.',
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      konto: kontoScenariusza(ctx),
      rodzina: rodzinaAnny(
        ctx,
        daneCiazyAnny({
          dataPorodu: '2026-11-18', dataPoroduPotwierdzona: true, zrodloDatyPorodu: 'odpowiedz-rodzica', liczbaUrodzonychDzieci: 1,
        }),
        true,
      ),
      zus: { dzieckoZSymulacji: ZOFIA },
    }),
  },
];
