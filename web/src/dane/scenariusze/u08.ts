// Scenariusze demonstracyjne jednostki u08 (kontrakt, sekcja 6.6). Właściciel: u08.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek 3.6.1.1.1 i 3.6.1.1.2: konto z rolą Rodzic,
// zapisany profil rodziny i datę demonstracyjną 21.11.2026. Plan wylicza przeliczenie po wczytaniu scenariusza.
import { kontaPrzykladowe } from '@/dane/konta-demo';
import { gminy } from '@/dane/gminy';
import { odczytajKatalog } from '@/dane/magazyn/stan';
import { kontoPrzewodnikaZKontaDemo, stanKontaPoczatkowy, wynikiKalkulacjiPuste } from '@/dane/magazyn/stan-poczatkowy';
import { WERSJA_TRESCI_ZGODY } from '@/domena/konto/zgoda';
import { wyliczPlan } from '@/domena/plan/wylicz-plan';
import type {
  DaneCiazyIDziecka,
  DaneRodzica,
  DaneRodziny,
  DrugiRodzic,
  Grosze,
  Pesel,
  RodzajDecyzjiOZgodzie,
  ScenariuszDemo,
  StanKonta,
  StanRodziny,
} from '@/domena/typy';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoSettings.scenariusze.pozycje;

const DZIS = '2026-11-21';
const TERAZ = '2026-11-21T09:00:00';
const PESEL_ANNY = '93041231085';
const PESEL_MAGDALENY = '90072551267';
const PESEL_JOANNY = '91113040407';
const PESEL_EWY = '92051401244';

function kontoRodzica(pesel: Pesel, zgoda: RodzajDecyzjiOZgodzie): Partial<StanKonta> {
  const demo = kontaPrzykladowe.find((k) => k.pesel === pesel);
  if (demo === undefined) return {};
  const konto = {
    ...kontoPrzewodnikaZKontaDemo(demo, TERAZ),
    rola: 'rodzic' as const,
    idRodziny: pesel,
    decyzjeOZgodzie: [{ rodzaj: zgoda, wersjaTresci: WERSJA_TRESCI_ZGODY, czas: TERAZ }],
  };
  return stanKontaPoczatkowy(konto);
}

function matka(forma: DaneRodzica['formaZatrudnienia'], duch: boolean | null, dodatkowe: Partial<DaneRodzica> = {}): DaneRodzica {
  return {
    formaZatrudnienia: forma,
    dobrowolneChorobowe: duch === null ? null : { wartosc: duch, zrodlo: 'konto-zus' },
    platnikZasilku: null,
    potwierdzeniaSkladek: [],
    ...dodatkowe,
  };
}

function drugiRodzic(forma: DrugiRodzic['formaZatrudnienia'], imie?: string, nazwisko?: string): DrugiRodzic {
  const dane: DrugiRodzic = { formaZatrudnienia: forma, dobrowolneChorobowe: null, platnikZasilku: null, potwierdzeniaSkladek: [] };
  if (imie !== undefined && nazwisko !== undefined) Object.assign(dane, { imie, nazwisko });
  return dane;
}

function daneRodziny(pesel: Pesel, z: Pick<DaneRodziny, 'matka' | 'drugiRodzic' | 'stanCywilny'> & Partial<DaneRodziny> & { dochod: Grosze | 'nieznany'; nazwaGminy?: string }): DaneRodziny {
  const { dochod, nazwaGminy, ...reszta } = z;
  const znaleziona = nazwaGminy ? gminy.find((g) => g.nazwa === nazwaGminy) : undefined;
  return {
    idRodziny: pesel,
    sytuacja: { wartosc: 'oczekiwanie', zrodlo: 'odpowiedz-rodzica' },
    rodzicKonta: 'matka',
    gmina: znaleziona ? { wartosc: znaleziona, zrodlo: 'odpowiedz-rodzica' } : null,
    dochodNaOsobe: { wartosc: dochod, zrodlo: 'odpowiedz-rodzica' },
    dostepKont: [{ pesel, rola: 'rodzic', dolaczono: DZIS, stan: 'aktywny' }],
    zapisano: TERAZ,
    ...reszta,
  };
}

function ciaza(z: Partial<DaneCiazyIDziecka> = {}): DaneCiazyIDziecka {
  return {
    przewidywanyTerminPorodu: '2027-03-15',
    liczbaDzieciZCiazy: 1,
    dataPierwszejWizyty: '2026-07-20',
    dataPoroduPotwierdzona: false,
    dzieci: [],
    sytuacjeSzczegolne: [],
    spokojnyTryb: { wlaczony: false },
    ...z,
  };
}

function stanRodziny(dane: DaneRodziny, daneCiazy: DaneCiazyIDziecka | null): StanRodziny {
  return { idRodziny: dane.idRodziny, daneRodziny: dane, daneCiazy, plan: null, kalendarz: null, wnioski: [], wynikiKalkulacji: wynikiKalkulacjiPuste() };
}

function rodzinaAnny(): DaneRodziny {
  return daneRodziny(PESEL_ANNY, {
    matka: matka({ wartosc: 'jdg', zrodlo: 'konto-zus' }, true, { platnikZasilku: { wartosc: 'zus', zrodlo: 'konto-zus' } }),
    drugiRodzic: drugiRodzic({ wartosc: 'umowa-o-prace', zrodlo: 'odpowiedz-rodzica' }, 'Tomasz', 'Nowak'),
    stanCywilny: { wartosc: 'malzenstwo', zrodlo: 'odpowiedz-rodzica' },
    dochod: 350000,
    nazwaGminy: 'Bydgoszcz',
  });
}

const PARAMETRY = { dataDemo: DZIS };

export const scenariuszeU08: readonly ScenariuszDemo[] = [
  {
    id: 'u08-anna-plan-przed-porodem',
    nazwa: tekst['u08-anna-plan-przed-porodem'].nazwa,
    opis: tekst['u08-anna-plan-przed-porodem'].opis,
    pesel: PESEL_ANNY,
    zastosuj: () => ({
      konto: kontoRodzica(PESEL_ANNY, 'udzielenie'),
      rodzina: stanRodziny(rodzinaAnny(), ciaza()),
      parametry: PARAMETRY,
    }),
  },
  {
    id: 'u08-anna-po-porodzie',
    nazwa: tekst['u08-anna-po-porodzie'].nazwa,
    opis: tekst['u08-anna-po-porodzie'].opis,
    pesel: PESEL_ANNY,
    zastosuj: () => {
      const dane = rodzinaAnny();
      const przed = stanRodziny(dane, ciaza());
      const planPrzed = wyliczPlan({
        daneRodziny: dane,
        daneCiazy: przed.daneCiazy,
        zgoda: true,
        katalog: odczytajKatalog(),
        daneZusMatki: null,
        daneZusDrugiegoRodzica: null,
        wnioski: [],
        wynikiKalkulacji: wynikiKalkulacjiPuste(),
        poprzedniPlan: null,
        dzis: DZIS,
        teraz: '2026-11-21T08:00:00',
        parametry: { progPodwyzszeniaPodstawyProcent: 50, progOstrzezeniaOkresuZasilkowegoDni: 30 },
      });
      const poPorodzie = ciaza({ dataPorodu: '2026-11-19', dataPoroduPotwierdzona: true, zrodloDatyPorodu: 'odpowiedz-rodzica', liczbaUrodzonychDzieci: 1 });
      return {
        konto: kontoRodzica(PESEL_ANNY, 'udzielenie'),
        rodzina: { ...stanRodziny(dane, poPorodzie), plan: planPrzed },
        parametry: PARAMETRY,
      };
    },
  },
  {
    id: 'u08-joanna-jdg-bez-chorobowego',
    nazwa: tekst['u08-joanna-jdg-bez-chorobowego'].nazwa,
    opis: tekst['u08-joanna-jdg-bez-chorobowego'].opis,
    pesel: PESEL_JOANNY,
    zastosuj: () => ({
      konto: kontoRodzica(PESEL_JOANNY, 'udzielenie'),
      rodzina: stanRodziny(
        daneRodziny(PESEL_JOANNY, {
          matka: matka({ wartosc: 'jdg', zrodlo: 'konto-zus' }, false),
          drugiRodzic: drugiRodzic({ wartosc: 'umowa-o-prace', zrodlo: 'odpowiedz-rodzica' }),
          stanCywilny: { wartosc: 'nie-malzenstwo', zrodlo: 'odpowiedz-rodzica' },
          uznanieOjcostwa: { wartosc: 'nieuznane', zrodlo: 'odpowiedz-rodzica' },
          dochod: 'nieznany',
        }),
        ciaza(),
      ),
      parametry: PARAMETRY,
    }),
  },
  {
    id: 'u08-magdalena-bliznieta',
    nazwa: tekst['u08-magdalena-bliznieta'].nazwa,
    opis: tekst['u08-magdalena-bliznieta'].opis,
    pesel: PESEL_MAGDALENY,
    zastosuj: () => ({
      konto: kontoRodzica(PESEL_MAGDALENY, 'udzielenie'),
      rodzina: stanRodziny(
        daneRodziny(PESEL_MAGDALENY, {
          matka: matka({ wartosc: 'umowa-o-prace', zrodlo: 'konto-zus' }, null),
          drugiRodzic: drugiRodzic({ wartosc: 'umowa-o-prace', zrodlo: 'odpowiedz-rodzica' }, 'Piotr', 'Wójcik'),
          stanCywilny: { wartosc: 'malzenstwo', zrodlo: 'odpowiedz-rodzica' },
          dochod: 60000,
        }),
        ciaza({ liczbaDzieciZCiazy: 2 }),
      ),
      parametry: PARAMETRY,
    }),
  },
  {
    id: 'u08-magdalena-bez-zgody',
    nazwa: tekst['u08-magdalena-bez-zgody'].nazwa,
    opis: tekst['u08-magdalena-bez-zgody'].opis,
    pesel: PESEL_MAGDALENY,
    zastosuj: () => ({
      konto: kontoRodzica(PESEL_MAGDALENY, 'odmowa'),
      rodzina: stanRodziny(
        daneRodziny(PESEL_MAGDALENY, {
          sytuacja: null,
          matka: matka({ wartosc: 'umowa-o-prace', zrodlo: 'konto-zus' }, null),
          drugiRodzic: drugiRodzic({ wartosc: 'umowa-o-prace', zrodlo: 'odpowiedz-rodzica' }, 'Piotr', 'Wójcik'),
          stanCywilny: { wartosc: 'malzenstwo', zrodlo: 'odpowiedz-rodzica' },
          dochod: 60000,
        }),
        null,
      ),
      parametry: PARAMETRY,
    }),
  },
  {
    id: 'u08-ewa-utrata-pracy',
    nazwa: tekst['u08-ewa-utrata-pracy'].nazwa,
    opis: tekst['u08-ewa-utrata-pracy'].opis,
    pesel: PESEL_EWY,
    zastosuj: () => ({
      konto: kontoRodzica(PESEL_EWY, 'udzielenie'),
      rodzina: stanRodziny(
        daneRodziny(PESEL_EWY, {
          matka: matka({ wartosc: 'brak-tytulu', zrodlo: 'konto-zus' }, null, {
            zmianaZatrudnienia: {
              rodzaj: { wartosc: 'ustanie', zrodlo: 'konto-zus' },
              forma: { wartosc: 'umowa-o-prace', zrodlo: 'konto-zus' },
              data: { wartosc: '2026-10-31', zrodlo: 'konto-zus' },
              przyczyna: { wartosc: 'likwidacja', zrodlo: 'odpowiedz-rodzica' },
              inneZatrudnienie: { wartosc: false, zrodlo: 'odpowiedz-rodzica' },
            },
          }),
          drugiRodzic: drugiRodzic({ wartosc: 'umowa-o-prace', zrodlo: 'odpowiedz-rodzica' }),
          stanCywilny: { wartosc: 'malzenstwo', zrodlo: 'odpowiedz-rodzica' },
          dochod: 195000,
        }),
        ciaza(),
      ),
      parametry: PARAMETRY,
    }),
  },
];
