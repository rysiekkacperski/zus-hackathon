// Scenariusze demonstracyjne jednostki u34 (kontrakt, sekcja 6.6). Właściciel: u34.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek jednostki.
// Rezygnacja matki i wniosek ojca: Magdalena Wójcik (KA-01 3.9.2.1.1) i Anna Nowak (KA-14 3.9.2.1.1).
import { kontaPrzykladowe } from '@/dane/konta-demo';
import { kontoPrzewodnikaZKontaDemo, wynikiKalkulacjiPuste } from '@/dane/magazyn/stan-poczatkowy';
import type {
  DaneRodzica,
  DataISO,
  DrugiRodzic,
  FormaZatrudnienia,
  KontekstOperacji,
  Pesel,
  ScenariuszDemo,
  StanKonta,
  StanRodziny,
} from '@/domena/typy';

const DATA_PORODU: DataISO = '2026-11-19';

function rodzic(forma: FormaZatrudnienia, dobrowolne: boolean | null, platnik: 'zus' | 'platnik-skladek', email?: string): DaneRodzica {
  return {
    formaZatrudnienia: { wartosc: forma, zrodlo: 'konto-zus' },
    dobrowolneChorobowe: dobrowolne === null ? null : { wartosc: dobrowolne, zrodlo: 'konto-zus' },
    platnikZasilku: { wartosc: platnik, zrodlo: 'konto-zus' },
    potwierdzeniaSkladek: [],
    ...(email ? { emailPracodawcy: { wartosc: email, zrodlo: 'odpowiedz-rodzica' as const } } : {}),
  };
}

function drugiRodzic(imie: string, nazwisko: string, pesel: Pesel, forma: FormaZatrudnienia, dopelniacz: string): DrugiRodzic {
  return {
    ...rodzic(forma, forma === 'umowa-o-prace' ? null : true, 'zus'),
    formaZatrudnienia: { wartosc: forma, zrodlo: 'odpowiedz-rodzica' },
    imie,
    nazwisko,
    pesel,
    imieINazwiskoDopelniacz: dopelniacz,
  };
}

function stan(
  pesel: Pesel,
  matka: DaneRodzica,
  drugi: DrugiRodzic,
  ctx: KontekstOperacji,
): { konto: Partial<StanKonta>; rodzina: StanRodziny } {
  const demo = kontaPrzykladowe.find((k) => k.pesel === pesel);
  if (!demo) throw new Error(`Brak konta przykładowego ${pesel}`);
  const konto = {
    ...kontoPrzewodnikaZKontaDemo(demo, ctx.teraz),
    rola: 'rodzic' as const,
    idRodziny: pesel,
    decyzjeOZgodzie: [{ rodzaj: 'udzielenie' as const, wersjaTresci: '1.0', czas: ctx.teraz }],
  };
  const rodzina: StanRodziny = {
    idRodziny: pesel,
    daneRodziny: {
      idRodziny: pesel,
      sytuacja: { wartosc: 'narodziny', zrodlo: 'odpowiedz-rodzica' },
      rodzicKonta: 'matka',
      matka,
      drugiRodzic: drugi,
      stanCywilny: { wartosc: 'malzenstwo', zrodlo: 'odpowiedz-rodzica' },
      gmina: null,
      dochodNaOsobe: null,
      dostepKont: [],
      zapisano: ctx.teraz,
    },
    daneCiazy: {
      przewidywanyTerminPorodu: DATA_PORODU,
      liczbaDzieciZCiazy: 1,
      dataPorodu: DATA_PORODU,
      dataPoroduPotwierdzona: true,
      zrodloDatyPorodu: 'odpowiedz-rodzica',
      liczbaUrodzonychDzieci: 1,
      dzieci: [],
      sytuacjeSzczegolne: [],
      spokojnyTryb: { wlaczony: false },
    },
    plan: null,
    kalendarz: null,
    wnioski: [],
    wynikiKalkulacji: wynikiKalkulacjiPuste(),
  };
  return { konto: { konto }, rodzina };
}

export const scenariuszeU34: readonly ScenariuszDemo[] = [
  {
    id: 'u34-rezygnacja-magdalena',
    nazwa: 'Rezygnacja z dalszej części urlopu macierzyńskiego (Magdalena Wójcik)',
    opis: 'Dzień 10.02.2027, umowa o pracę, poród 19.11.2026, drugi rodzic Piotr Wójcik na umowie o pracę, pracodawca kadry@przyklad.pl.',
    pesel: '90072551267',
    zastosuj: (ctx) => ({
      ...stan(
        '90072551267',
        rodzic('umowa-o-prace', null, 'platnik-skladek', 'kadry@przyklad.pl'),
        drugiRodzic('Piotr', 'Wójcik', '89031405734', 'umowa-o-prace', 'Piotra Wójcika'),
        ctx,
      ),
      parametry: { dataDemo: '2027-02-10' },
    }),
  },
  {
    id: 'u34-zam-14-tygodni-anna',
    nazwa: 'Wniosek ZAM wyłącznie o 14 tygodni (Anna Nowak)',
    opis: 'Dzień 21.11.2026, działalność z dobrowolnym ubezpieczeniem chorobowym, poród 19.11.2026, bez wniosku ZAM.',
    pesel: '93041231085',
    zastosuj: (ctx) => ({
      ...stan(
        '93041231085',
        rodzic('jdg', true, 'zus'),
        drugiRodzic('Tomasz', 'Nowak', '90011555532', 'umowa-o-prace', 'Tomasza Nowaka'),
        ctx,
      ),
      parametry: { dataDemo: '2026-11-21' },
    }),
  },
];
