// Scenariusze demonstracyjne jednostki u28 (kontrakt, sekcja 6.6). Właściciel: u28.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek jednostki.
// Kreator wniosków o urlop do pracodawcy: Magdalena Wójcik na umowie o pracę przed porodem i po porodzie (3.9.6.1.1).
import { kontaPrzykladowe } from '@/dane/konta-demo';
import { kontoPrzewodnikaZKontaDemo, wynikiKalkulacjiPuste } from '@/dane/magazyn/stan-poczatkowy';
import type {
  DaneCiazyIDziecka,
  DaneRodzica,
  DataISO,
  DrugiRodzic,
  KontekstOperacji,
  ScenariuszDemo,
  StanKonta,
  StanRodziny,
  Wniosek,
} from '@/domena/typy';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoSettings.scenariusze.pozycje;

export const PESEL_MAGDALENY = '90072551267';
const DATA_PORODU: DataISO = '2026-11-19';

function matka(): DaneRodzica {
  return {
    formaZatrudnienia: { wartosc: 'umowa-o-prace', zrodlo: 'konto-zus' },
    dobrowolneChorobowe: null,
    platnikZasilku: { wartosc: 'platnik-skladek', zrodlo: 'konto-zus' },
    potwierdzeniaSkladek: [],
  };
}

function drugiRodzic(): DrugiRodzic {
  return {
    formaZatrudnienia: { wartosc: 'umowa-o-prace', zrodlo: 'odpowiedz-rodzica' },
    dobrowolneChorobowe: null,
    platnikZasilku: { wartosc: 'zus', zrodlo: 'konto-zus' },
    potwierdzeniaSkladek: [],
    imie: 'Piotr',
    nazwisko: 'Wójcik',
    pesel: '89031405734',
    imieINazwiskoDopelniacz: 'Piotra Wójcika',
  };
}

function ciazaPrzedPorodem(): DaneCiazyIDziecka {
  return {
    przewidywanyTerminPorodu: '2027-03-15',
    liczbaDzieciZCiazy: 1,
    dataPoroduPotwierdzona: false,
    dzieci: [],
    sytuacjeSzczegolne: [],
    spokojnyTryb: { wlaczony: false },
  };
}

function ciazaPoPorodzie(): DaneCiazyIDziecka {
  return {
    przewidywanyTerminPorodu: DATA_PORODU,
    liczbaDzieciZCiazy: 1,
    dataPorodu: DATA_PORODU,
    dataPoroduPotwierdzona: true,
    zrodloDatyPorodu: 'odpowiedz-rodzica',
    liczbaUrodzonychDzieci: 1,
    dzieci: [{ imie: 'Jan', nazwisko: 'Wójcik', dataUrodzenia: DATA_PORODU, zrodlo: 'odpowiedz-rodzica' }],
    sytuacjeSzczegolne: [],
    spokojnyTryb: { wlaczony: false },
  };
}

/** Stan konta i rodziny Magdaleny Wójcik z podanymi danymi ciąży i wnioskami. */
export function stanMagdaleny(
  daneCiazy: DaneCiazyIDziecka,
  wnioski: Wniosek[],
  ctx: KontekstOperacji,
): { konto: Partial<StanKonta>; rodzina: StanRodziny } {
  const demo = kontaPrzykladowe.find((k) => k.pesel === PESEL_MAGDALENY);
  if (!demo) throw new Error(`Brak konta przykładowego ${PESEL_MAGDALENY}`);
  const konto = {
    ...kontoPrzewodnikaZKontaDemo(demo, ctx.teraz),
    rola: 'rodzic' as const,
    idRodziny: PESEL_MAGDALENY,
    decyzjeOZgodzie: [{ rodzaj: 'udzielenie' as const, wersjaTresci: '1.0', czas: ctx.teraz }],
  };
  const rodzina: StanRodziny = {
    idRodziny: PESEL_MAGDALENY,
    daneRodziny: {
      idRodziny: PESEL_MAGDALENY,
      sytuacja: { wartosc: 'narodziny', zrodlo: 'odpowiedz-rodzica' },
      rodzicKonta: 'matka',
      matka: matka(),
      drugiRodzic: drugiRodzic(),
      stanCywilny: { wartosc: 'malzenstwo', zrodlo: 'odpowiedz-rodzica' },
      gmina: null,
      dochodNaOsobe: null,
      dostepKont: [],
      zapisano: ctx.teraz,
    },
    daneCiazy,
    plan: null,
    kalendarz: null,
    wnioski,
    wynikiKalkulacji: wynikiKalkulacjiPuste(),
  };
  return { konto: { konto }, rodzina };
}

export const scenariuszeU28: readonly ScenariuszDemo[] = [
  {
    id: 'u28-urlop-przed-porodem',
    nazwa: tekst['u28-urlop-przed-porodem'].nazwa,
    opis: tekst['u28-urlop-przed-porodem'].opis,
    pesel: PESEL_MAGDALENY,
    zastosuj: (ctx) => ({ ...stanMagdaleny(ciazaPrzedPorodem(), [], ctx), parametry: { dataDemo: '2027-02-01' } }),
  },
  {
    id: 'u28-urlop-po-porodzie',
    nazwa: tekst['u28-urlop-po-porodzie'].nazwa,
    opis: tekst['u28-urlop-po-porodzie'].opis,
    pesel: PESEL_MAGDALENY,
    zastosuj: (ctx) => ({ ...stanMagdaleny(ciazaPoPorodzie(), [], ctx), parametry: { dataDemo: '2026-11-21' } }),
  },
];

export { ciazaPoPorodzie };
