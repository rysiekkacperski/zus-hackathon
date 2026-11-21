// Scenariusze demonstracyjne jednostki u27 (kontrakt, sekcja 6.6). Właściciel: u27.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek jednostki: Anna Nowak (JDG z dobrowolnym
// ubezpieczeniem chorobowym, płatnik ZUS) po porodzie 19.11.2026 z córką Zofią. Plan i terminy wylicza
// przeliczenie rodziny po wczytaniu scenariusza (wyliczono puste).
import { wynikiKalkulacjiPuste } from '@/dane/magazyn/stan-poczatkowy';
import type { DaneCiazyIDziecka, DaneRodziny, KontekstOperacji, ScenariuszDemo, StanRodziny, WniosekZam } from '@/domena/typy';

const PESEL_ANNY = '93041231085';
const DATA_PORODU = '2026-11-19';

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
    drugiRodzic: {
      formaZatrudnienia: { wartosc: 'umowa-o-prace', zrodlo: 'odpowiedz-rodzica' },
      dobrowolneChorobowe: null,
      platnikZasilku: null,
      potwierdzeniaSkladek: [],
      imie: 'Tomasz',
      nazwisko: 'Nowak',
    },
    stanCywilny: { wartosc: 'malzenstwo', zrodlo: 'odpowiedz-rodzica' },
    gmina: null,
    dochodNaOsobe: null,
    dostepKont: [{ pesel: PESEL_ANNY, rola: 'rodzic', dolaczono: ctx.dzis, stan: 'aktywny' }],
    zapisano: ctx.teraz,
  };
}

function daneCiazyAnny(zmiana: Partial<DaneCiazyIDziecka> = {}): DaneCiazyIDziecka {
  return {
    przewidywanyTerminPorodu: '2026-11-25',
    liczbaDzieciZCiazy: 1,
    dataPorodu: DATA_PORODU,
    dataPoroduPotwierdzona: true,
    zrodloDatyPorodu: 'odpowiedz-rodzica',
    liczbaUrodzonychDzieci: 1,
    dzieci: [
      { imie: 'Zofia', nazwisko: 'Nowak', pesel: '26311907825', dataUrodzenia: DATA_PORODU, miejsceUrodzenia: 'Bydgoszcz', zrodlo: 'konto-zus' },
    ],
    sytuacjeSzczegolne: [],
    spokojnyTryb: { wlaczony: false },
    ...zmiana,
  };
}

function rodzinaAnny(ctx: KontekstOperacji, daneCiazy: DaneCiazyIDziecka, wnioski: WniosekZam[] = []): StanRodziny {
  return {
    idRodziny: PESEL_ANNY,
    daneRodziny: daneRodzinyAnny(ctx),
    daneCiazy,
    plan: null,
    kalendarz: null,
    wnioski,
    wynikiKalkulacji: wynikiKalkulacjiPuste(),
  };
}

function szkicZ0812(): WniosekZam {
  return {
    idWniosku: 'W-DEMO-ZAM-0812',
    rodzaj: 'zam',
    idSprawy: 'K08',
    konto: PESEL_ANNY,
    rola: 'rodzic',
    stan: 'szkic',
    ostatniEkran: 'ViewZamSummary',
    utworzono: '2026-12-08T10:00:00',
    zaktualizowano: '2026-12-08T10:15:00',
    adresat: 'zus',
    zalaczniki: [],
    rodzajUrlopu: 'macierzynski',
    okresy: [
      { rodzajUrlopu: 'macierzynski', od: '2026-11-19', do: '2027-04-07', tygodnie: 20, stawka: 81.5, rodzic: 'matka' },
      { rodzajUrlopu: 'rodzicielski', od: '2027-04-08', do: '2027-11-17', tygodnie: 32, stawka: 81.5, rodzic: 'matka' },
    ],
    wariant: 'caly-rodzicielski',
    daneRodzica: { imie: 'Anna', nazwisko: 'Nowak', pesel: PESEL_ANNY },
    daneDzieci: [{ imie: 'Zofia', nazwisko: 'Nowak', pesel: '26311907825', dataUrodzenia: DATA_PORODU, miejsceUrodzenia: 'Bydgoszcz' }],
    numerRachunku: '60102010260000123456789012',
    oswiadczeniaPotwierdzone: true,
  };
}

export const scenariuszeU27: readonly ScenariuszDemo[] = [
  {
    id: 'u27-anna-po-porodzie',
    nazwa: 'Wniosek ZAM: Anna Nowak po porodzie',
    opis: 'Anna Nowak, JDG z dobrowolnym ubezpieczeniem chorobowym, poród 19.11.2026, córka Zofia Nowak, dzień demonstracyjny 21.11.2026.',
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      rodzina: rodzinaAnny(ctx, daneCiazyAnny()),
      parametry: { dataDemo: '2026-11-21' },
    }),
  },
  {
    id: 'u27-anna-bez-pesel-dziecka',
    nazwa: 'Wniosek ZAM: brak numeru PESEL dziecka',
    opis: 'Anna Nowak po porodzie 19.11.2026; profil nie zawiera numeru PESEL ani miejscowości urodzenia dziecka.',
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      rodzina: rodzinaAnny(
        ctx,
        daneCiazyAnny({ dzieci: [{ imie: 'Zofia', nazwisko: 'Nowak', dataUrodzenia: DATA_PORODU, zrodlo: 'odpowiedz-rodzica' }] }),
      ),
      parametry: { dataDemo: '2026-11-21' },
    }),
  },
  {
    id: 'u27-anna-za-zyciem',
    nazwa: 'Wniosek ZAM: zaświadczenie „Za życiem”',
    opis: 'Anna Nowak po porodzie 19.11.2026; dziecko ma zaświadczenie „Za życiem”, urlop rodzicielski do 56 tygodni.',
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      rodzina: rodzinaAnny(ctx, daneCiazyAnny({ zaswiadczenieZaZyciem: true })),
      parametry: { dataDemo: '2026-11-21' },
    }),
  },
  {
    id: 'u27-anna-blizneta',
    nazwa: 'Wniosek ZAM: bliźnięta',
    opis: 'Anna Nowak po porodzie 19.11.2026 z bliźniętami; urlop macierzyński do 23.06.2027.',
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      rodzina: rodzinaAnny(
        ctx,
        daneCiazyAnny({
          liczbaDzieciZCiazy: 2,
          liczbaUrodzonychDzieci: 2,
          dzieci: [
            { imie: 'Zofia', nazwisko: 'Nowak', pesel: '26311907825', dataUrodzenia: DATA_PORODU, miejsceUrodzenia: 'Bydgoszcz', zrodlo: 'konto-zus' },
            { imie: 'Hanna', nazwisko: 'Nowak', dataUrodzenia: DATA_PORODU, zrodlo: 'odpowiedz-rodzica' },
          ],
        }),
      ),
      parametry: { dataDemo: '2026-11-21' },
    }),
  },
  {
    id: 'u27-anna-szkic-po-terminie',
    nazwa: 'Wniosek ZAM: szkic z 08.12.2026 po terminie 21 dni',
    opis: 'Szkic wniosku z całym urlopem rodzicielskim i zasiłkiem 81,5% z 08.12.2026; dzień demonstracyjny 11.12.2026.',
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      rodzina: rodzinaAnny(ctx, daneCiazyAnny(), [szkicZ0812()]),
      parametry: { dataDemo: '2026-12-11' },
    }),
  },
];
