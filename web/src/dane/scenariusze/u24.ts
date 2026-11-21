// Scenariusze demonstracyjne jednostki u24 (kontrakt, sekcja 6.6). Właściciel: u24.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek 3.3.4.1.1 i 3.3.4.1.2 przy dniu 21.11.2026.
import { kontaPrzykladowe } from '@/dane/konta-demo';
import { kontoPrzewodnikaZKontaDemo, wynikiKalkulacjiPuste } from '@/dane/magazyn/stan-poczatkowy';
import { WERSJA_TRESCI_ZGODY } from '@/domena/konto/zgoda';
import type {
  DaneCiazyIDziecka,
  DaneRodzica,
  DrugiRodzic,
  FormaZatrudnienia,
  KontekstOperacji,
  KontoPrzewodnika,
  Pesel,
  PozycjaPlanu,
  PrzyjecieDziecka,
  RodzajDecyzjiOZgodzie,
  ScenariuszDemo,
  StanRodziny,
} from '@/domena/typy';

const ANNA: Pesel = '93041231085';
const MAGDALENA: Pesel = '90072551267';
const TOMASZ: Pesel = '90011555532';
const DZIEN_DEMO = '2026-11-21';

function konto(pesel: Pesel, ctx: KontekstOperacji, rola: KontoPrzewodnika['rola'], decyzja: RodzajDecyzjiOZgodzie): KontoPrzewodnika {
  const demo = kontaPrzykladowe.find((k) => k.pesel === pesel);
  if (demo === undefined) throw new Error(`Brak konta demonstracyjnego ${pesel}`);
  return {
    ...kontoPrzewodnikaZKontaDemo(demo, ctx.teraz),
    rola,
    idRodziny: rola === 'nowy-uzytkownik' ? null : pesel,
    decyzjeOZgodzie: [{ rodzaj: decyzja, wersjaTresci: WERSJA_TRESCI_ZGODY, czas: ctx.teraz }],
  };
}

function rodzic(forma: FormaZatrudnienia, dobrowolne: boolean | null): DaneRodzica {
  return {
    formaZatrudnienia: { wartosc: forma, zrodlo: 'konto-zus' },
    dobrowolneChorobowe: dobrowolne === null ? null : { wartosc: dobrowolne, zrodlo: 'konto-zus' },
    platnikZasilku: null,
    potwierdzeniaSkladek: [],
  };
}

const TOMASZ_DRUGI_RODZIC: DrugiRodzic = {
  formaZatrudnienia: { wartosc: 'umowa-o-prace', zrodlo: 'odpowiedz-rodzica' },
  dobrowolneChorobowe: null,
  platnikZasilku: null,
  potwierdzeniaSkladek: [],
  imie: 'Tomasz',
  nazwisko: 'Nowak',
};

const BEZ_DRUGIEGO_RODZICA: DrugiRodzic = {
  formaZatrudnienia: { wartosc: 'brak-drugiego-rodzica', zrodlo: 'odpowiedz-rodzica' },
  dobrowolneChorobowe: null,
  platnikZasilku: null,
  potwierdzeniaSkladek: [],
};

function przyjecie(zmiana: Partial<PrzyjecieDziecka>): PrzyjecieDziecka {
  return {
    rolaRodzicaPrzyjmujacego: 'matka',
    forma: 'przysposobienie',
    dataPrzyjecia: '2026-11-16',
    dataUrodzeniaDziecka: '2024-03-14',
    liczbaPrzyjetychDzieci: 1,
    zrodlo: 'odpowiedz-rodzica',
    ...zmiana,
  };
}

function daneCiazy(p: PrzyjecieDziecka | undefined): DaneCiazyIDziecka {
  return {
    dataPoroduPotwierdzona: false,
    dzieci: [],
    sytuacjeSzczegolne: [],
    spokojnyTryb: { wlaczony: false },
    ...(p ? { przyjecie: p } : {}),
  };
}

function pozycja(id: string, status: PozycjaPlanu['status'], etap: PozycjaPlanu['etap']): PozycjaPlanu {
  return {
    idSprawy: id,
    idPozycji: id,
    rodzaj: 'obowiazek',
    etap,
    rodzic: 'matka',
    status,
    zrodloStatusu: status === 'do-zrobienia' ? 'wyliczenie-planu' : 'odpowiedz-rodzica',
    ...(status === 'zalatwiona' ? { dataOznaczenia: '2026-09-10' } : {}),
    liczbaDzieci: 1,
    ostrzezenia: [],
    oznaczenia: [],
  };
}

function rodzina(
  pesel: Pesel,
  ctx: KontekstOperacji,
  matka: DaneRodzica,
  drugi: DrugiRodzic,
  p: PrzyjecieDziecka | undefined,
  pozycje: PozycjaPlanu[] = [],
): StanRodziny {
  return {
    idRodziny: pesel,
    daneRodziny: {
      idRodziny: pesel,
      sytuacja: { wartosc: p ? 'przyjecie' : 'planowanie', zrodlo: 'odpowiedz-rodzica' },
      rodzicKonta: 'matka',
      matka,
      drugiRodzic: drugi,
      stanCywilny: { wartosc: 'malzenstwo', zrodlo: 'odpowiedz-rodzica' },
      gmina: null,
      dochodNaOsobe: { wartosc: 'nieznany', zrodlo: 'odpowiedz-rodzica' },
      dostepKont: [{ pesel, rola: 'rodzic', dolaczono: '2026-09-01', stan: 'aktywny' }],
      zapisano: ctx.teraz,
    },
    daneCiazy: daneCiazy(p),
    plan:
      pozycje.length > 0
        ? { pozycje, biezacyEtap: 'ciaza', wyliczono: ctx.teraz, dlaKataloguWersja: 0, ostatnieZmiany: [] }
        : null,
    kalendarz: null,
    wnioski: [],
    wynikiKalkulacji: wynikiKalkulacjiPuste(),
  };
}

const parametry = { dataDemo: DZIEN_DEMO };

export const scenariuszeU24: readonly ScenariuszDemo[] = [
  {
    id: 'u24-tomasz-nowy-uzytkownik-przyjecie',
    nazwa: 'Tomasz Nowak: profil na start, przyjęcie dziecka',
    opis: 'Nowy użytkownik ze zgodą na dane zdrowia i sytuacją przyjęcia dziecka w szkicu profilu (3.3.4.1.1 KA-01, KA-03).',
    pesel: TOMASZ,
    zastosuj: (ctx) => ({
      parametry,
      konto: {
        konto: konto(TOMASZ, ctx, 'nowy-uzytkownik', 'udzielenie'),
        szkicProfilu: {
          kontekst: 'start',
          powrotNaPodsumowanie: false,
          ostatniEkran: 'ViewProfileSituation',
          daneRodziny: {
            sytuacja: { wartosc: 'przyjecie', zrodlo: 'odpowiedz-rodzica' },
            matka: rodzic('umowa-o-prace', null),
          },
          daneCiazy: { przewidywanyTerminPorodu: '2027-03-15', dataPoroduPotwierdzona: false },
          zmienionePola: [],
          utworzono: ctx.teraz,
          zaktualizowano: ctx.teraz,
        },
      },
    }),
  },
  {
    id: 'u24-magdalena-przysposobienie',
    nazwa: 'Magdalena Wójcik: przysposobienie 16.11.2026',
    opis: 'Rodzic na umowie o pracę z przysposobieniem bez daty uprawomocnienia, drugi rodzic Tomasz Nowak na umowie o pracę, K01 załatwiona oraz K04 i K24 do zrobienia przed zmianą (3.3.4.1.2 KA-01, KA-04, KA-06, KA-13 do KA-17, KA-19).',
    pesel: MAGDALENA,
    zastosuj: (ctx) => ({
      parametry,
      konto: { konto: konto(MAGDALENA, ctx, 'rodzic', 'udzielenie') },
      rodzina: rodzina(MAGDALENA, ctx, rodzic('umowa-o-prace', null), TOMASZ_DRUGI_RODZIC, przyjecie({}), [
        pozycja('K01', 'zalatwiona', 'ciaza'),
        pozycja('K04', 'do-zrobienia', 'ciaza'),
        pozycja('K24', 'do-zrobienia', 'ciaza'),
      ]),
    }),
  },
  {
    id: 'u24-magdalena-rodzina-zastepcza-zawodowa',
    nazwa: 'Magdalena Wójcik: rodzina zastępcza zawodowa',
    opis: 'Rodzina zastępcza zawodowa z datą przyjęcia 16.11.2026 i drugim rodzicem Tomaszem Nowakiem (3.3.4.1.2 KA-11, KA-18).',
    pesel: MAGDALENA,
    zastosuj: (ctx) => ({
      parametry,
      konto: { konto: konto(MAGDALENA, ctx, 'rodzic', 'udzielenie') },
      rodzina: rodzina(
        MAGDALENA,
        ctx,
        rodzic('umowa-o-prace', null),
        TOMASZ_DRUGI_RODZIC,
        przyjecie({ forma: 'rodzina-zastepcza-zawodowa' }),
      ),
    }),
  },
  {
    id: 'u24-anna-rodzina-zastepcza-odroczenie',
    nazwa: 'Anna Nowak: rodzina zastępcza niezawodowa z odroczeniem',
    opis: 'Działalność z dobrowolnym ubezpieczeniem chorobowym, przyjęcie 16.11.2026, dziecko urodzone 10.05.2019, odroczenie obowiązku szkolnego (3.3.4.1.2 KA-08, KA-09).',
    pesel: ANNA,
    zastosuj: (ctx) => ({
      parametry,
      konto: { konto: konto(ANNA, ctx, 'rodzic', 'udzielenie') },
      rodzina: rodzina(
        ANNA,
        ctx,
        rodzic('jdg', true),
        TOMASZ_DRUGI_RODZIC,
        przyjecie({ forma: 'rodzina-zastepcza-niezawodowa', dataUrodzeniaDziecka: '2019-05-10', odroczenieObowiazkuSzkolnego: true }),
      ),
    }),
  },
  {
    id: 'u24-anna-rodzina-zastepcza-poza-wiekiem',
    nazwa: 'Anna Nowak: dziecko poza wiekiem urlopu',
    opis: 'Rodzina zastępcza niezawodowa bez odroczenia, dziecko urodzone 10.05.2019, komunikat 0091 z wiekiem 7 lat (3.3.4.1.2 KA-07).',
    pesel: ANNA,
    zastosuj: (ctx) => ({
      parametry,
      konto: { konto: konto(ANNA, ctx, 'rodzic', 'udzielenie') },
      rodzina: rodzina(
        ANNA,
        ctx,
        rodzic('jdg', true),
        BEZ_DRUGIEGO_RODZICA,
        przyjecie({ forma: 'rodzina-zastepcza-niezawodowa', dataUrodzeniaDziecka: '2019-05-10', odroczenieObowiazkuSzkolnego: false }),
      ),
    }),
  },
  {
    id: 'u24-anna-odmowa-zgody',
    nazwa: 'Anna Nowak: odmowa zgody na dane zdrowia',
    opis: 'Rodzic z zapisaną odmową zgody; akcja danych przyjęcia na profilu rodziny pokazuje komunikat 0004 (3.3.4.1.1 KA-07).',
    pesel: ANNA,
    zastosuj: (ctx) => ({
      parametry,
      konto: { konto: konto(ANNA, ctx, 'rodzic', 'odmowa') },
      rodzina: { ...rodzina(ANNA, ctx, rodzic('jdg', true), TOMASZ_DRUGI_RODZIC, undefined), daneCiazy: null },
    }),
  },
  {
    id: 'u24-tomasz-ojciec-uprawomocnienie',
    nazwa: 'Tomasz Nowak: ojciec z datą uprawomocnienia',
    opis: 'Ojciec na umowie o pracę, przysposobienie 02.03.2026, uprawomocnienie 15.10.2026 (3.3.4.1.2 KA-03, KA-20).',
    pesel: TOMASZ,
    zastosuj: (ctx) => ({
      parametry,
      konto: { konto: konto(TOMASZ, ctx, 'rodzic', 'udzielenie') },
      rodzina: rodzina(
        TOMASZ,
        ctx,
        rodzic('umowa-o-prace', null),
        BEZ_DRUGIEGO_RODZICA,
        przyjecie({ rolaRodzicaPrzyjmujacego: 'ojciec', dataPrzyjecia: '2026-03-02', dataUprawomocnienia: '2026-10-15' }),
      ),
    }),
  },
];
