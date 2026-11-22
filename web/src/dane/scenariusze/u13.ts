// Scenariusze demonstracyjne jednostki u13 (kontrakt, sekcja 6.6). Właściciel: u13.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek jednostki (3.7.1.1.1, 3.7.1.2.1, 3.7.1.3.1):
// Anna Nowak (JDG z dobrowolnym ubezpieczeniem chorobowym) po porodzie, w ciąży przed i po terminie K01
// oraz kilka miesięcy po porodzie ze świadczeniem 800+ po terminie.
import { kontaPrzykladowe } from '@/dane/konta-demo';
import { kontoPrzewodnikaZKontaDemo } from '@/dane/magazyn/stan-poczatkowy';
import type { DaneCiazyIDziecka, DaneRodziny, KontekstOperacji, ScenariuszDemo, StanKonta, StanRodziny } from '@/domena/typy';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoSettings.scenariusze.pozycje;

const PESEL_ANNY = '93041231085';

function kontoAnny(ctx: KontekstOperacji): Partial<StanKonta> {
  const demo = kontaPrzykladowe.find((k) => k.pesel === PESEL_ANNY);
  if (demo === undefined) throw new Error('Brak konta demonstracyjnego Anny Nowak.');
  return {
    konto: {
      ...kontoPrzewodnikaZKontaDemo(demo, ctx.teraz),
      rola: 'rodzic',
      idRodziny: PESEL_ANNY,
      decyzjeOZgodzie: [{ rodzaj: 'udzielenie', wersjaTresci: '1.0', czas: ctx.teraz }],
    },
  };
}

function daneRodzinyAnny(ctx: KontekstOperacji, poPorodzie: boolean): DaneRodziny {
  return {
    idRodziny: PESEL_ANNY,
    sytuacja: { wartosc: poPorodzie ? 'narodziny' : 'oczekiwanie', zrodlo: 'odpowiedz-rodzica' },
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

function daneCiazy(zmiana: Partial<DaneCiazyIDziecka>): DaneCiazyIDziecka {
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

function rodzina(ctx: KontekstOperacji, dane: DaneCiazyIDziecka, poPorodzie: boolean): StanRodziny {
  return {
    idRodziny: PESEL_ANNY,
    daneRodziny: daneRodzinyAnny(ctx, poPorodzie),
    daneCiazy: dane,
    plan: null,
    kalendarz: null,
    wnioski: [],
    wynikiKalkulacji: { scenariusze: [], porownaniaWariantow: [], podzialyUrlopu: [], nastepnyNumer: 1 },
  };
}

const PO_PORODZIE: Partial<DaneCiazyIDziecka> = {
  dataPorodu: '2026-11-19',
  dataPoroduPotwierdzona: true,
  zrodloDatyPorodu: 'odpowiedz-rodzica',
  liczbaUrodzonychDzieci: 1,
};

export const scenariuszeU13: readonly ScenariuszDemo[] = [
  {
    id: 'u13-anna-terminy-po-porodzie',
    nazwa: tekst['u13-anna-terminy-po-porodzie'].nazwa,
    opis: tekst['u13-anna-terminy-po-porodzie'].opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      konto: kontoAnny(ctx),
      rodzina: rodzina(ctx, daneCiazy(PO_PORODZIE), true),
      parametry: { dataDemo: '2026-11-21' },
    }),
  },
  {
    id: 'u13-anna-wizyta-przed-terminem',
    nazwa: tekst['u13-anna-wizyta-przed-terminem'].nazwa,
    opis: tekst['u13-anna-wizyta-przed-terminem'].opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      konto: kontoAnny(ctx),
      rodzina: rodzina(ctx, daneCiazy({ przewidywanyTerminPorodu: '2027-06-30', dataPierwszejWizyty: undefined }), false),
      parametry: { dataDemo: '2026-11-21' },
    }),
  },
  {
    id: 'u13-anna-wizyta-po-terminie',
    nazwa: tekst['u13-anna-wizyta-po-terminie'].nazwa,
    opis: tekst['u13-anna-wizyta-po-terminie'].opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      konto: kontoAnny(ctx),
      rodzina: rodzina(ctx, daneCiazy({ przewidywanyTerminPorodu: '2027-06-30', dataPierwszejWizyty: undefined }), false),
      parametry: { dataDemo: '2026-12-05' },
    }),
  },
  {
    id: 'u13-anna-800-po-terminie',
    nazwa: tekst['u13-anna-800-po-terminie'].nazwa,
    opis: tekst['u13-anna-800-po-terminie'].opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      konto: kontoAnny(ctx),
      rodzina: rodzina(ctx, daneCiazy(PO_PORODZIE), true),
      parametry: { dataDemo: '2027-04-10' },
    }),
  },
];
