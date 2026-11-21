// Scenariusze demonstracyjne jednostki u11 (kontrakt, sekcja 6.6). Właściciel: u11.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek jednostki.
// - Anna Nowak przed zapisem profilu: szkic z KA-01 3.3.1.3.1 na ekranie ViewProfileSummary.
// - Anna Nowak przed zapisem profilu na ekranie ViewProfileFamily z gminą Bydgoszcz (KA-07 3.3.1.3.1).
// - Anna Nowak z zapisanym profilem, rola Rodzic (KA-08 i KA-09 3.3.1.3.1).
import { kontoPrzykladowe } from '@/dane/konta-demo';
import { kontoPrzewodnikaZKontaDemo } from '@/dane/magazyn/stan-poczatkowy';
import { WERSJA_TRESCI_ZGODY } from '@/domena/konto/zgoda';
import { zbudujProfilZeSzkicu } from '@/domena/profil/zapis';
import type {
  Gmina,
  IdWidoku,
  KontekstOperacji,
  KontoPrzewodnika,
  ScenariuszDemo,
  StanRodziny,
  SzkicProfilu,
} from '@/domena/typy';
import { wynikiKalkulacjiPuste } from '@/dane/magazyn/stan-poczatkowy';

const PESEL_ANNY = '93041231085';

const BYDGOSZCZ: Gmina = {
  idTeryt: '0461011',
  nazwa: 'Bydgoszcz',
  powiat: 'Bydgoszcz',
  wojewodztwo: 'kujawsko-pomorskie',
};

function kontoAnny(ctx: KontekstOperacji, rola: KontoPrzewodnika['rola']): KontoPrzewodnika {
  const demo = kontoPrzykladowe(PESEL_ANNY);
  if (demo === undefined) throw new Error('Brak przykładowego konta Anny Nowak.');
  return {
    ...kontoPrzewodnikaZKontaDemo(demo, ctx.teraz),
    rola,
    idRodziny: rola === 'rodzic' ? PESEL_ANNY : null,
    decyzjeOZgodzie: [{ rodzaj: 'udzielenie', wersjaTresci: WERSJA_TRESCI_ZGODY, czas: ctx.teraz }],
  };
}

/** Szkic Anny Nowak z KA-01 3.3.1.3.1: JDG z konta ZUS, termin porodu 15.03.2027, Bydgoszcz, drugi rodzic na umowie o pracę. */
function szkicAnny(ctx: KontekstOperacji, ostatniEkran: IdWidoku, zDrugimRodzicem: boolean): SzkicProfilu {
  return {
    kontekst: 'start',
    powrotNaPodsumowanie: false,
    ostatniEkran,
    daneRodziny: {
      sytuacja: { wartosc: 'oczekiwanie', zrodlo: 'odpowiedz-rodzica' },
      rodzicKonta: 'matka',
      matka: {
        formaZatrudnienia: { wartosc: 'jdg', zrodlo: 'konto-zus' },
        dobrowolneChorobowe: { wartosc: true, zrodlo: 'konto-zus' },
        platnikZasilku: { wartosc: 'zus', zrodlo: 'konto-zus' },
        dataPoczatkuZatrudnienia: { wartosc: '2024-03-01', zrodlo: 'konto-zus' },
        zmianaZatrudnienia: { rodzaj: { wartosc: 'bez-zmian', zrodlo: 'konto-zus' } },
        potwierdzeniaSkladek: [],
      },
      stanCywilny: { wartosc: 'malzenstwo', zrodlo: 'odpowiedz-rodzica' },
      gmina: { wartosc: BYDGOSZCZ, zrodlo: 'odpowiedz-rodzica' },
      dochodNaOsobe: { wartosc: 185050, zrodlo: 'odpowiedz-rodzica' },
      ...(zDrugimRodzicem
        ? {
            drugiRodzic: {
              formaZatrudnienia: { wartosc: 'umowa-o-prace', zrodlo: 'odpowiedz-rodzica' },
              dobrowolneChorobowe: null,
              platnikZasilku: null,
              potwierdzeniaSkladek: [],
            },
          }
        : {}),
    },
    daneCiazy: {
      przewidywanyTerminPorodu: '2027-03-15',
      liczbaDzieciZCiazy: 1,
      dataPierwszejWizyty: '2026-07-20',
    },
    zmienionePola: [],
    utworzono: ctx.teraz,
    zaktualizowano: ctx.teraz,
  };
}

function rodzinaAnny(ctx: KontekstOperacji): StanRodziny {
  const { daneRodziny, daneCiazy } = zbudujProfilZeSzkicu(
    szkicAnny(ctx, 'ViewProfileSummary', true),
    true,
    PESEL_ANNY,
    PESEL_ANNY,
    ctx.teraz,
  );
  return {
    idRodziny: PESEL_ANNY,
    daneRodziny,
    daneCiazy,
    plan: null,
    kalendarz: null,
    wnioski: [],
    wynikiKalkulacji: wynikiKalkulacjiPuste(),
  };
}

export const scenariuszeU11: readonly ScenariuszDemo[] = [
  {
    id: 'u11-anna-podsumowanie-profilu',
    nazwa: 'Anna Nowak: podsumowanie profilu przed zapisem',
    opis: 'Nowy użytkownik ze zgodą na dane dotyczące zdrowia i szkicem profilu na ekranie podsumowania: jednoosobowa działalność z konta ZUS, termin porodu 15.03.2027, gmina Bydgoszcz, drugi rodzic na umowie o pracę.',
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      konto: { konto: kontoAnny(ctx, 'nowy-uzytkownik'), szkicProfilu: szkicAnny(ctx, 'ViewProfileSummary', true) },
    }),
  },
  {
    id: 'u11-anna-dane-rodziny',
    nazwa: 'Anna Nowak: przerwany profil na ekranie danych rodziny',
    opis: 'Nowy użytkownik, który zamknął przewodnik na ekranie danych rodziny z wybraną gminą Bydgoszcz.',
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      konto: { konto: kontoAnny(ctx, 'nowy-uzytkownik'), szkicProfilu: szkicAnny(ctx, 'ViewProfileFamily', false) },
    }),
  },
  {
    id: 'u11-anna-profil-zapisany',
    nazwa: 'Anna Nowak: zapisany profil rodziny',
    opis: 'Rodzic z zapisanym profilem: jednoosobowa działalność z konta ZUS, termin porodu 15.03.2027, gmina Bydgoszcz, drugi rodzic na umowie o pracę.',
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      konto: { konto: kontoAnny(ctx, 'rodzic'), szkicProfilu: null },
      rodzina: rodzinaAnny(ctx),
    }),
  },
];
