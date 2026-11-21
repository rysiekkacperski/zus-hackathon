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
    nazwa: 'Anna Nowak: zgoda udzielona, bez profilu rodziny',
    opis: 'Konto z rolą Nowy użytkownik z udzieleniem zgody w wersji 1.0 z 21.11.2026, godz. 10:15. Logowanie otwiera profil na start.',
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      konto: { konto: kontoAnny(ctx, { decyzjeOZgodzie: [decyzja('udzielenie')] }) },
    }),
  },
  {
    id: 'u02-anna-odmowa-zgody',
    nazwa: 'Anna Nowak: odmowa zgody, ustawienia 24.11.2026',
    opis: 'Konto z rolą Nowy użytkownik z odmową zgody z 21.11.2026. Data demonstracyjna 24.11.2026 pozwala udzielić zgody w ustawieniach.',
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      konto: { konto: kontoAnny(ctx, { decyzjeOZgodzie: [decyzja('odmowa')] }) },
      parametry: { dataDemo: DZIEN_USTAWIEN },
    }),
  },
  {
    id: 'u02-anna-rodzic-z-planem',
    nazwa: 'Anna Nowak: Rodzic z profilem, terminem porodu 15.03.2027 i nieukończonym wnioskiem ZAM',
    opis: 'Konto z rolą Rodzic ze zgodą z 21.11.2026, przewidywanym terminem porodu 15.03.2027, planem rodziny i nieukończonym wnioskiem o zasiłek macierzyński. Data demonstracyjna 24.11.2026.',
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
    nazwa: 'Anna Nowak: Rodzic z wnioskiem ZAM wysłanym do ZUS',
    opis: 'Konto z rolą Rodzic ze zgodą z 21.11.2026 i wnioskiem o zasiłek macierzyński wysłanym do ZUS 21.11.2026. Data demonstracyjna 24.11.2026.',
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
