// Scenariusze demonstracyjne jednostki u30 (kontrakt, sekcja 6.6). Właściciel: u30.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek jednostki: profil rodziny w ciąży gotowy na wejście
// do kreatora ZAS-53 ze sprawy K24, z zaświadczeniami e-ZLA z bazowych danych konta ZUS.
import { kontoPrzykladowe } from '@/dane/konta-demo';
import { kontoPrzewodnikaZKontaDemo, wynikiKalkulacjiPuste } from '@/dane/magazyn/stan-poczatkowy';
import type {
  DaneCiazyIDziecka,
  DaneRodzica,
  DataISO,
  KontekstOperacji,
  KontoPrzewodnika,
  Pesel,
  ScenariuszDemo,
  StanRodziny,
} from '@/domena/typy';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoSettings.scenariusze.pozycje;

const ANNA: Pesel = '93041231085';
const EWA: Pesel = '92051401244';

function odpowiedz<T>(wartosc: T) {
  return { wartosc, zrodlo: 'odpowiedz-rodzica' as const };
}

function kontoRodzica(pesel: Pesel, ctx: KontekstOperacji): KontoPrzewodnika {
  const demo = kontoPrzykladowe(pesel);
  if (demo === undefined) throw new Error(`Brak konta przykładowego ${pesel}`);
  return {
    ...kontoPrzewodnikaZKontaDemo(demo, ctx.teraz),
    rola: 'rodzic',
    idRodziny: pesel,
    decyzjeOZgodzie: [{ rodzaj: 'udzielenie', wersjaTresci: '1.0', czas: ctx.teraz }],
  };
}

function daneCiazy(ptp: DataISO): DaneCiazyIDziecka {
  return {
    przewidywanyTerminPorodu: ptp,
    liczbaDzieciZCiazy: 1,
    dataPierwszejWizyty: '2026-07-10',
    dataPoroduPotwierdzona: false,
    dzieci: [],
    sytuacjeSzczegolne: [],
    spokojnyTryb: { wlaczony: false },
  };
}

function rodzina(pesel: Pesel, matka: DaneRodzica, ptp: DataISO, ctx: KontekstOperacji): StanRodziny {
  return {
    idRodziny: pesel,
    daneRodziny: {
      idRodziny: pesel,
      sytuacja: odpowiedz('oczekiwanie'),
      rodzicKonta: 'matka',
      matka,
      drugiRodzic: {
        formaZatrudnienia: odpowiedz('brak-drugiego-rodzica'),
        dobrowolneChorobowe: null,
        platnikZasilku: null,
        potwierdzeniaSkladek: [],
      },
      stanCywilny: odpowiedz('nie-malzenstwo'),
      gmina: null,
      dochodNaOsobe: odpowiedz('nieznany'),
      dostepKont: [{ pesel, rola: 'rodzic', dolaczono: ctx.dzis, stan: 'aktywny' }],
      zapisano: ctx.teraz,
    },
    daneCiazy: daneCiazy(ptp),
    plan: null,
    kalendarz: null,
    wnioski: [],
    wynikiKalkulacji: wynikiKalkulacjiPuste(),
  };
}

export const scenariuszeU30: readonly ScenariuszDemo[] = [
  {
    id: 'u30-anna-zas53-w-ubezpieczeniu',
    nazwa: tekst['u30-anna-zas53-w-ubezpieczeniu'].nazwa,
    opis: tekst['u30-anna-zas53-w-ubezpieczeniu'].opis,
    pesel: ANNA,
    zastosuj: (ctx) => ({
      konto: { konto: kontoRodzica(ANNA, ctx) },
      rodzina: rodzina(
        ANNA,
        {
          formaZatrudnienia: { wartosc: 'jdg', zrodlo: 'konto-zus' },
          dobrowolneChorobowe: { wartosc: true, zrodlo: 'konto-zus' },
          platnikZasilku: { wartosc: 'zus', zrodlo: 'konto-zus' },
          potwierdzeniaSkladek: [],
        },
        '2027-03-15',
        ctx,
      ),
      parametry: { dataDemo: '2026-11-21' },
    }),
  },
  {
    id: 'u30-ewa-zas53-po-ustaniu',
    nazwa: tekst['u30-ewa-zas53-po-ustaniu'].nazwa,
    opis: tekst['u30-ewa-zas53-po-ustaniu'].opis,
    pesel: EWA,
    zastosuj: (ctx) => ({
      konto: { konto: kontoRodzica(EWA, ctx) },
      rodzina: rodzina(
        EWA,
        {
          formaZatrudnienia: { wartosc: 'umowa-o-prace', zrodlo: 'konto-zus' },
          dobrowolneChorobowe: null,
          platnikZasilku: null,
          potwierdzeniaSkladek: [],
          zmianaZatrudnienia: {
            rodzaj: odpowiedz('ustanie'),
            forma: odpowiedz('umowa-o-prace'),
            data: odpowiedz('2026-10-31'),
            przyczyna: odpowiedz('likwidacja'),
          },
        },
        '2027-03-20',
        ctx,
      ),
      parametry: { dataDemo: '2026-11-21' },
    }),
  },
];
