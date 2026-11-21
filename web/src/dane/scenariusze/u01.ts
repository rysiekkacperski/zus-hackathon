// Scenariusze demonstracyjne jednostki u01 (kontrakt, sekcja 6.6). Właściciel: u01.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek jednostki.
import { kontoPrzykladowe } from '@/dane/konta-demo';
import { kontoPrzewodnikaZKontaDemo, wynikiKalkulacjiPuste } from '@/dane/magazyn/stan-poczatkowy';
import { dodajDni } from '@/domena/daty';
import { dzieckoZSymulacji } from '@/domena/dane-zus/symulacja-dziecka';
import type { KontekstOperacji, Pesel, ScenariuszDemo, StanKonta, StanRodziny } from '@/domena/typy';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoSettings.scenariusze;

const PESEL_ANNY: Pesel = '93041231085';

/** Przewidywany termin porodu w scenariuszu: 7 dni po dniu demonstracyjnym. */
const DNI_DO_TERMINU_PORODU = 7;
/** Pierwsza wizyta u lekarza w 8. tygodniu ciąży: 224 dni przed terminem porodu. */
const DNI_OD_PIERWSZEJ_WIZYTY_DO_TERMINU = 224;

/** Konto Anny Nowak z rolą Rodzic, rodziną i zgodą na dane dotyczące zdrowia. */
function kontoAnny(ctx: KontekstOperacji): Partial<StanKonta> {
  const demo = kontoPrzykladowe(PESEL_ANNY);
  if (demo === undefined) throw new Error('Brak konta demonstracyjnego Anny Nowak.');
  return {
    konto: {
      ...kontoPrzewodnikaZKontaDemo(demo, ctx.teraz),
      rola: 'rodzic',
      idRodziny: PESEL_ANNY,
      decyzjeOZgodzie: [{ rodzaj: 'udzielenie', wersjaTresci: '1.0', czas: ctx.teraz }],
    },
  };
}

/** Rodzina Anny Nowak przed porodem: JDG z dobrowolnym ubezpieczeniem chorobowym, termin porodu za 7 dni. */
function rodzinaAnnyPrzedPorodem(ctx: KontekstOperacji): StanRodziny {
  const termin = dodajDni(ctx.dzis, DNI_DO_TERMINU_PORODU);
  return {
    idRodziny: PESEL_ANNY,
    daneRodziny: {
      idRodziny: PESEL_ANNY,
      sytuacja: { wartosc: 'oczekiwanie', zrodlo: 'odpowiedz-rodzica' },
      rodzicKonta: 'matka',
      matka: {
        formaZatrudnienia: { wartosc: 'jdg', zrodlo: 'konto-zus' },
        dobrowolneChorobowe: { wartosc: true, zrodlo: 'konto-zus' },
        platnikZasilku: { wartosc: 'zus', zrodlo: 'konto-zus' },
        potwierdzeniaSkladek: [],
      },
      drugiRodzic: { formaZatrudnienia: null, dobrowolneChorobowe: null, platnikZasilku: null, potwierdzeniaSkladek: [] },
      stanCywilny: null,
      gmina: null,
      dochodNaOsobe: null,
      dostepKont: [{ pesel: PESEL_ANNY, rola: 'rodzic', dolaczono: ctx.dzis, stan: 'aktywny' }],
      zapisano: ctx.teraz,
    },
    daneCiazy: {
      przewidywanyTerminPorodu: termin,
      liczbaDzieciZCiazy: 1,
      dataPierwszejWizyty: dodajDni(termin, -DNI_OD_PIERWSZEJ_WIZYTY_DO_TERMINU),
      dataPoroduPotwierdzona: false,
      dzieci: [],
      sytuacjeSzczegolne: [],
      spokojnyTryb: { wlaczony: false },
    },
    plan: null,
    kalendarz: null,
    wnioski: [],
    wynikiKalkulacji: wynikiKalkulacjiPuste(),
  };
}

export const scenariuszeU01: readonly ScenariuszDemo[] = [
  {
    // KA-03 i KA-04 Story 3.4.1.2.1: rodzina Anny Nowak z terminem porodu po symulacji narodzin dziecka w dniu demonstracyjnym.
    id: 'u01-anna-nowak-narodziny-z-symulacji',
    nazwa: tekst.u01AnnaNarodziny.nazwa,
    opis: tekst.u01AnnaNarodziny.opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      konto: kontoAnny(ctx),
      rodzina: rodzinaAnnyPrzedPorodem(ctx),
      zus: { dzieckoZSymulacji: dzieckoZSymulacji({ nazwisko: 'Nowak' }, ctx.dzis) },
    }),
  },
];
