// Scenariusze demonstracyjne jednostki u02 (kontrakt, sekcja 6.6). Właściciel: u02.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek jednostki.
// Historyjki 3.1.1.1.1 (KA-13) i 3.1.1.2.1 (KA-01 do KA-13): konto Anny Nowak, PESEL 93041231085.
import { kontoPrzykladowe } from '@/dane/konta-demo';
import { kontoPrzewodnikaZKontaDemo, wynikiKalkulacjiPuste } from '@/dane/magazyn/stan-poczatkowy';
import { WERSJA_TRESCI_ZGODY } from '@/domena/konto';
import type {
  DaneCiazyIDziecka,
  DaneRodziny,
  DecyzjaOZgodzie,
  KontekstOperacji,
  KontoPrzewodnika,
  Pesel,
  ScenariuszDemo,
  StanRodziny,
  WniosekZam,
  ZnacznikCzasu,
} from '@/domena/typy';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoSettings.scenariusze.pozycje;

const PESEL_ANNY: Pesel = '93041231085';
const CZAS_DECYZJI: ZnacznikCzasu = '2026-11-21T10:15:00';
const DZIEN_USTAWIEN = '2026-11-24';

function decyzja(rodzaj: DecyzjaOZgodzie['rodzaj']): DecyzjaOZgodzie {
  return { rodzaj, wersjaTresci: WERSJA_TRESCI_ZGODY, czas: CZAS_DECYZJI };
}

function kontoAnny(ctx: KontekstOperacji, zmiana: Partial<KontoPrzewodnika>): KontoPrzewodnika {
  const demo = kontoPrzykladowe(PESEL_ANNY);
  if (demo === undefined) throw new Error('Brak przykładowego konta Anny Nowak w rejestrze kont demonstracyjnych.');
  return { ...kontoPrzewodnikaZKontaDemo(demo, ctx.teraz), ...zmiana };
}

function daneRodzinyAnny(): DaneRodziny {
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
    dostepKont: [{ pesel: PESEL_ANNY, rola: 'rodzic', dolaczono: '2026-11-21', stan: 'aktywny' }],
    zapisano: CZAS_DECYZJI,
  };
}

function daneCiazyAnny(): DaneCiazyIDziecka {
  return {
    przewidywanyTerminPorodu: '2027-03-15',
    liczbaDzieciZCiazy: 1,
    dataPierwszejWizyty: '2026-07-10',
    dataPoroduPotwierdzona: false,
    dzieci: [],
    sytuacjeSzczegolne: [],
    spokojnyTryb: { wlaczony: false },
  };
}

function wniosekZamAnny(stan: 'szkic' | 'wyslany'): WniosekZam {
  return {
    idWniosku: 'W-20261121101500-U02A',
    rodzaj: 'zam',
    idSprawy: 'K08',
    konto: PESEL_ANNY,
    rola: 'rodzic',
    stan,
    utworzono: CZAS_DECYZJI,
    zaktualizowano: CZAS_DECYZJI,
    zalaczniki: [],
    okresy: [],
    daneDzieci: [],
    oswiadczeniaPotwierdzone: stan === 'wyslany',
    ...(stan === 'wyslany'
      ? { adresat: 'zus' as const, dataZlozenia: '2026-11-21', potwierdzenie: 'ZAM-DEMO-20261121-0001' }
      : {}),
  };
}

function rodzinaAnny(wniosek: WniosekZam): StanRodziny {
  return {
    idRodziny: PESEL_ANNY,
    daneRodziny: daneRodzinyAnny(),
    daneCiazy: daneCiazyAnny(),
    plan: null,
    kalendarz: null,
    wnioski: [wniosek],
    wynikiKalkulacji: wynikiKalkulacjiPuste(),
  };
}

export const scenariuszeU02: readonly ScenariuszDemo[] = [
  {
    id: 'u02-anna-zgoda-udzielona-bez-profilu',
    nazwa: tekst['u02-anna-zgoda-udzielona-bez-profilu'].nazwa,
    opis: tekst['u02-anna-zgoda-udzielona-bez-profilu'].opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      konto: { konto: kontoAnny(ctx, { decyzjeOZgodzie: [decyzja('udzielenie')] }) },
    }),
  },
  {
    id: 'u02-anna-odmowa-zgody',
    nazwa: tekst['u02-anna-odmowa-zgody'].nazwa,
    opis: tekst['u02-anna-odmowa-zgody'].opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      konto: { konto: kontoAnny(ctx, { decyzjeOZgodzie: [decyzja('odmowa')] }) },
      parametry: { dataDemo: DZIEN_USTAWIEN },
    }),
  },
  {
    id: 'u02-anna-rodzic-z-planem',
    nazwa: tekst['u02-anna-rodzic-z-planem'].nazwa,
    opis: tekst['u02-anna-rodzic-z-planem'].opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      konto: {
        konto: kontoAnny(ctx, { rola: 'rodzic', idRodziny: PESEL_ANNY, decyzjeOZgodzie: [decyzja('udzielenie')] }),
      },
      rodzina: rodzinaAnny(wniosekZamAnny('szkic')),
      parametry: { dataDemo: DZIEN_USTAWIEN },
    }),
  },
  {
    id: 'u02-anna-rodzic-z-wyslanym-zam',
    nazwa: tekst['u02-anna-rodzic-z-wyslanym-zam'].nazwa,
    opis: tekst['u02-anna-rodzic-z-wyslanym-zam'].opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      konto: {
        konto: kontoAnny(ctx, { rola: 'rodzic', idRodziny: PESEL_ANNY, decyzjeOZgodzie: [decyzja('udzielenie')] }),
      },
      rodzina: rodzinaAnny(wniosekZamAnny('wyslany')),
      zus: {
        wnioskiZPrzewodnika: [
          {
            idWniosku: 'ZAM-DEMO-20261121-0001',
            rodzaj: 'zasilek-macierzynski',
            kanal: 'przewodnik',
            dataZlozenia: '2026-11-21',
            status: 'zlozony',
            idWnioskuPrzewodnika: 'W-20261121101500-U02A',
          },
        ],
      },
      parametry: { dataDemo: DZIEN_USTAWIEN },
    }),
  },
];
