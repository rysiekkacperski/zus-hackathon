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
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoSettings.scenariusze.pozycje;

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
    nazwa: tekst['u19-anna-przed-porodem'].nazwa,
    opis: tekst['u19-anna-przed-porodem'].opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({ konto: kontoScenariusza(ctx), rodzina: rodzinaAnny(ctx, daneCiazyAnny()) }),
  },
  {
    // 3.3.2.1.4 KA-01: potwierdzenie daty porodu 19.11.2026 daje sprawę K12 z terminem 19.02.2027.
    id: 'u19-anna-termin-26-11-2026',
    nazwa: tekst['u19-anna-termin-26-11-2026'].nazwa,
    opis: tekst['u19-anna-termin-26-11-2026'].opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      konto: kontoScenariusza(ctx),
      rodzina: rodzinaAnny(ctx, daneCiazyAnny({ przewidywanyTerminPorodu: '2026-11-26', dataPierwszejWizyty: '2026-04-20' })),
    }),
  },
  {
    id: 'u19-anna-nowe-dziecko-w-zus',
    nazwa: tekst['u19-anna-nowe-dziecko-w-zus'].nazwa,
    opis: tekst['u19-anna-nowe-dziecko-w-zus'].opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      konto: kontoScenariusza(ctx),
      rodzina: rodzinaAnny(ctx, daneCiazyAnny()),
      zus: { dzieckoZSymulacji: ZOFIA },
    }),
  },
  {
    id: 'u19-anna-blizneta-w-zus',
    nazwa: tekst['u19-anna-blizneta-w-zus'].nazwa,
    opis: tekst['u19-anna-blizneta-w-zus'].opis,
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
    nazwa: tekst['u19-anna-po-porodzie'].nazwa,
    opis: tekst['u19-anna-po-porodzie'].opis,
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
    nazwa: tekst['u19-anna-rozna-data-porodu'].nazwa,
    opis: tekst['u19-anna-rozna-data-porodu'].opis,
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
