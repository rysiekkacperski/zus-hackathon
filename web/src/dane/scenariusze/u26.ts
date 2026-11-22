// Scenariusze demonstracyjne jednostki u26 (kontrakt, sekcja 6.6). Właściciel: u26.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek jednostki (3.10.1.1.1 i 3.10.2.1.1):
// Anna Nowak po porodzie 19.11.2026 z podstawą wymiaru 5 177,40 zł z konta ZUS i Tomasz Nowak na umowie
// o pracę z podstawą wymiaru 8 197,55 zł z konta ZUS. Plan rodziny wylicza przeliczenie po wczytaniu scenariusza.
import { kontaPrzykladowe } from '@/dane/konta-demo';
import { zrodloweDaneKonta } from '@/dane/konta-zus';
import { kontoPrzewodnikaZKontaDemo, stanKontaPoczatkowy, wynikiKalkulacjiPuste } from '@/dane/magazyn/stan-poczatkowy';
import { przygotujKopie } from '@/domena/dane-zus/odczyt';
import { WERSJA_TRESCI_ZGODY } from '@/domena/konto/zgoda';
import type {
  DaneCiazyIDziecka,
  DaneDrugiegoRodzicaZKonta,
  DaneRodziny,
  DrugiRodzic,
  Pesel,
  ScenariuszDemo,
  StanKonta,
  StanRodziny,
} from '@/domena/typy';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoSettings.scenariusze.pozycje;

const PESEL_ANNY: Pesel = '93041231085';
const PESEL_TOMASZA: Pesel = '90011555532';
const DZIS = '2026-11-21';
const TERAZ = '2026-11-21T08:00:00';
const PARAMETRY = { dataDemo: DZIS };

/** Konto Anny Nowak ze zgodą i kopią Danych z konta ZUS. */
function kontoAnny(): Partial<StanKonta> {
  const demo = kontaPrzykladowe.find((k) => k.pesel === PESEL_ANNY);
  if (demo === undefined) return {};
  const stan = stanKontaPoczatkowy({
    ...kontoPrzewodnikaZKontaDemo(demo, TERAZ),
    rola: 'rodzic',
    idRodziny: PESEL_ANNY,
    decyzjeOZgodzie: [{ rodzaj: 'udzielenie', wersjaTresci: WERSJA_TRESCI_ZGODY, czas: TERAZ }],
  });
  const zrodlo = zrodloweDaneKonta(PESEL_ANNY, null);
  if (zrodlo === null) return stan;
  return { ...stan, kopiaDanychZus: przygotujKopie({ zrodlo, poprzednia: null, teraz: TERAZ }), stanOdczytuZus: { stan: 'udany', czas: TERAZ } };
}

/** Dane z konta ZUS Tomasza Nowaka: tytuły z podstawami składek 9 500,00 zł. */
function daneZusTomasza(): DaneDrugiegoRodzicaZKonta | undefined {
  const zrodlo = zrodloweDaneKonta(PESEL_TOMASZA, null);
  if (zrodlo === null) return undefined;
  return { zrodlo: 'konto-zus', tytuly: zrodlo.tytuly, zasilki: zrodlo.zasilki, odczytano: TERAZ };
}

function drugiRodzic(forma: 'umowa-o-prace' | 'jdg', zDanymiZus: boolean): DrugiRodzic {
  return {
    formaZatrudnienia: { wartosc: forma, zrodlo: 'odpowiedz-rodzica' },
    dobrowolneChorobowe: forma === 'jdg' ? { wartosc: false, zrodlo: 'odpowiedz-rodzica' } : null,
    platnikZasilku: null,
    potwierdzeniaSkladek: [],
    imie: 'Tomasz',
    nazwisko: 'Nowak',
    imieINazwiskoDopelniacz: 'Tomasza Nowaka',
    pesel: PESEL_TOMASZA,
    ...(zDanymiZus ? { daneZKontaZus: daneZusTomasza() } : {}),
  };
}

function daneRodziny(drugi: DrugiRodzic): DaneRodziny {
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
    drugiRodzic: drugi,
    stanCywilny: { wartosc: 'malzenstwo', zrodlo: 'odpowiedz-rodzica' },
    gmina: null,
    dochodNaOsobe: null,
    dostepKont: [{ pesel: PESEL_ANNY, rola: 'rodzic', dolaczono: DZIS, stan: 'aktywny' }],
    zapisano: TERAZ,
  };
}

function daneCiazy(zaZyciem: boolean): DaneCiazyIDziecka {
  return {
    przewidywanyTerminPorodu: '2026-11-25',
    liczbaDzieciZCiazy: 1,
    dataPierwszejWizyty: '2026-04-10',
    dataPorodu: '2026-11-19',
    dataPoroduPotwierdzona: true,
    zrodloDatyPorodu: 'odpowiedz-rodzica',
    liczbaUrodzonychDzieci: 1,
    dzieci: [],
    sytuacjeSzczegolne: [],
    spokojnyTryb: { wlaczony: false },
    ...(zaZyciem ? { zaswiadczenieZaZyciem: true } : {}),
  };
}

function rodzina(drugi: DrugiRodzic, zaZyciem = false): StanRodziny {
  return {
    idRodziny: PESEL_ANNY,
    daneRodziny: daneRodziny(drugi),
    daneCiazy: daneCiazy(zaZyciem),
    plan: null,
    kalendarz: null,
    wnioski: [],
    wynikiKalkulacji: wynikiKalkulacjiPuste(),
  };
}

export const scenariuszeU26: readonly ScenariuszDemo[] = [
  {
    id: 'u26-anna-tomasz-podzial',
    nazwa: tekst['u26-anna-tomasz-podzial'].nazwa,
    opis: tekst['u26-anna-tomasz-podzial'].opis,
    pesel: PESEL_ANNY,
    zastosuj: () => ({ konto: kontoAnny(), rodzina: rodzina(drugiRodzic('umowa-o-prace', true)), parametry: PARAMETRY }),
  },
  {
    id: 'u26-anna-tomasz-bez-danych-zus',
    nazwa: tekst['u26-anna-tomasz-bez-danych-zus'].nazwa,
    opis: tekst['u26-anna-tomasz-bez-danych-zus'].opis,
    pesel: PESEL_ANNY,
    zastosuj: () => ({ konto: kontoAnny(), rodzina: rodzina(drugiRodzic('umowa-o-prace', false)), parametry: PARAMETRY }),
  },
  {
    id: 'u26-anna-tomasz-za-zyciem',
    nazwa: tekst['u26-anna-tomasz-za-zyciem'].nazwa,
    opis: tekst['u26-anna-tomasz-za-zyciem'].opis,
    pesel: PESEL_ANNY,
    zastosuj: () => ({ konto: kontoAnny(), rodzina: rodzina(drugiRodzic('umowa-o-prace', true), true), parametry: PARAMETRY }),
  },
  {
    id: 'u26-anna-tomasz-jdg-bez-chorobowego',
    nazwa: tekst['u26-anna-tomasz-jdg-bez-chorobowego'].nazwa,
    opis: tekst['u26-anna-tomasz-jdg-bez-chorobowego'].opis,
    pesel: PESEL_ANNY,
    zastosuj: () => ({ konto: kontoAnny(), rodzina: rodzina(drugiRodzic('jdg', false)), parametry: PARAMETRY }),
  },
  {
    id: 'u26-anna-wariant-po-terminie',
    nazwa: tekst['u26-anna-wariant-po-terminie'].nazwa,
    opis: tekst['u26-anna-wariant-po-terminie'].opis,
    pesel: PESEL_ANNY,
    zastosuj: () => ({ konto: kontoAnny(), rodzina: rodzina(drugiRodzic('umowa-o-prace', true)), parametry: { dataDemo: '2026-12-11' } }),
  },
];
