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
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoSettings.scenariusze.pozycje;

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

// 3.3.4.1.4, zadanie 8: drugi rodzic w profilu Magdaleny Wójcik.
const PIOTR_DRUGI_RODZIC: DrugiRodzic = { ...TOMASZ_DRUGI_RODZIC, imie: 'Piotr', nazwisko: 'Wójcik' };

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
    nazwa: tekst['u24-tomasz-nowy-uzytkownik-przyjecie'].nazwa,
    opis: tekst['u24-tomasz-nowy-uzytkownik-przyjecie'].opis,
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
    nazwa: tekst['u24-magdalena-przysposobienie'].nazwa,
    opis: tekst['u24-magdalena-przysposobienie'].opis,
    pesel: MAGDALENA,
    zastosuj: (ctx) => ({
      parametry,
      konto: { konto: konto(MAGDALENA, ctx, 'rodzic', 'udzielenie') },
      rodzina: rodzina(MAGDALENA, ctx, rodzic('umowa-o-prace', null), PIOTR_DRUGI_RODZIC, przyjecie({ dataWystapieniaDoSadu: '2026-11-16' }), [
        pozycja('K01', 'zalatwiona', 'ciaza'),
        pozycja('K04', 'do-zrobienia', 'ciaza'),
        pozycja('K24', 'do-zrobienia', 'ciaza'),
      ]),
    }),
  },
  {
    id: 'u24-magdalena-rodzina-zastepcza-zawodowa',
    nazwa: tekst['u24-magdalena-rodzina-zastepcza-zawodowa'].nazwa,
    opis: tekst['u24-magdalena-rodzina-zastepcza-zawodowa'].opis,
    pesel: MAGDALENA,
    zastosuj: (ctx) => ({
      parametry,
      konto: { konto: konto(MAGDALENA, ctx, 'rodzic', 'udzielenie') },
      rodzina: rodzina(
        MAGDALENA,
        ctx,
        rodzic('umowa-o-prace', null),
        PIOTR_DRUGI_RODZIC,
        przyjecie({ forma: 'rodzina-zastepcza-zawodowa' }),
      ),
    }),
  },
  {
    id: 'u24-anna-rodzina-zastepcza-odroczenie',
    nazwa: tekst['u24-anna-rodzina-zastepcza-odroczenie'].nazwa,
    opis: tekst['u24-anna-rodzina-zastepcza-odroczenie'].opis,
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
    nazwa: tekst['u24-anna-rodzina-zastepcza-poza-wiekiem'].nazwa,
    opis: tekst['u24-anna-rodzina-zastepcza-poza-wiekiem'].opis,
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
    nazwa: tekst['u24-anna-odmowa-zgody'].nazwa,
    opis: tekst['u24-anna-odmowa-zgody'].opis,
    pesel: ANNA,
    zastosuj: (ctx) => ({
      parametry,
      konto: { konto: konto(ANNA, ctx, 'rodzic', 'odmowa') },
      rodzina: { ...rodzina(ANNA, ctx, rodzic('jdg', true), TOMASZ_DRUGI_RODZIC, undefined), daneCiazy: null },
    }),
  },
  {
    id: 'u24-tomasz-ojciec-uprawomocnienie',
    nazwa: tekst['u24-tomasz-ojciec-uprawomocnienie'].nazwa,
    opis: tekst['u24-tomasz-ojciec-uprawomocnienie'].opis,
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
  {
    id: 'u24-magdalena-dwoje-dzieci',
    nazwa: tekst['u24-magdalena-dwoje-dzieci'].nazwa,
    opis: tekst['u24-magdalena-dwoje-dzieci'].opis,
    pesel: MAGDALENA,
    zastosuj: (ctx) => ({
      parametry,
      konto: { konto: konto(MAGDALENA, ctx, 'rodzic', 'udzielenie') },
      rodzina: rodzina(
        MAGDALENA,
        ctx,
        rodzic('umowa-o-prace', null),
        PIOTR_DRUGI_RODZIC,
        przyjecie({
          dataWystapieniaDoSadu: '2026-11-16',
          liczbaPrzyjetychDzieci: 2,
          datyUrodzeniaDzieci: ['2024-03-14', '2012-02-01'],
        }),
      ),
    }),
  },
];
