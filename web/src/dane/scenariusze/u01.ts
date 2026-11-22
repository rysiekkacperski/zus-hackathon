// Scenariusze demonstracyjne jednostki u01 (kontrakt, sekcja 6.6). Właściciel: u01.
// Scenariusz odtwarza stan po symulacji uzupełnienia profilu z ViewDemoAccountPicker (symulujUzupelnienieProfilu).
import { gminy } from '@/dane/gminy';
import { kontoPrzykladowe } from '@/dane/konta-demo';
import { zrodloweDaneKonta } from '@/dane/konta-zus';
import { kontoPrzewodnikaZKontaDemo, wynikiKalkulacjiPuste } from '@/dane/magazyn/stan-poczatkowy';
import { przygotujKopie } from '@/domena/dane-zus/odczyt';
import { WERSJA_TRESCI_ZGODY } from '@/domena/konto';
import { szkicProfiluDemo } from '@/domena/profil/profil-demo';
import { zbudujProfilZeSzkicu } from '@/domena/profil/zapis';
import type { KontekstOperacji, Pesel, ScenariuszDemo, StanKonta, StanRodziny } from '@/domena/typy';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoSettings.scenariusze;

const PESEL_ANNY: Pesel = '93041231085';

/** Konto Anny Nowak i jej rodzina po symulacji uzupełnienia profilu w dniu demonstracyjnym. */
function stanAnnyPoSymulacji(ctx: KontekstOperacji): { konto: Partial<StanKonta>; rodzina: StanRodziny } {
  const demo = kontoPrzykladowe(PESEL_ANNY);
  const gmina = gminy[0];
  if (demo === undefined || gmina === undefined) throw new Error('Brak konta demonstracyjnego Anny Nowak albo gminy.');
  const zrodlo = zrodloweDaneKonta(PESEL_ANNY, null, demo);
  const kopia = zrodlo === null ? null : przygotujKopie({ zrodlo, poprzednia: null, teraz: ctx.teraz, zgodaNaDaneZdrowia: true });
  const szkic = szkicProfiluDemo({ kopia, plec: demo.plec, gmina, dzis: ctx.dzis, teraz: ctx.teraz });
  const { daneRodziny, daneCiazy } = zbudujProfilZeSzkicu(szkic, true, PESEL_ANNY, PESEL_ANNY, ctx.teraz);
  return {
    konto: {
      konto: {
        ...kontoPrzewodnikaZKontaDemo(demo, ctx.teraz),
        rola: 'rodzic',
        idRodziny: PESEL_ANNY,
        decyzjeOZgodzie: [{ rodzaj: 'udzielenie', wersjaTresci: WERSJA_TRESCI_ZGODY, czas: ctx.teraz }],
      },
      kopiaDanychZus: kopia,
      stanOdczytuZus: kopia === null ? { stan: 'brak' } : { stan: 'udany', czas: ctx.teraz },
    },
    rodzina: {
      idRodziny: PESEL_ANNY,
      daneRodziny,
      daneCiazy,
      plan: null,
      kalendarz: null,
      wnioski: [],
      wynikiKalkulacji: wynikiKalkulacjiPuste(),
    },
  };
}

export const scenariuszeU01: readonly ScenariuszDemo[] = [
  {
    // Rodzina Anny Nowak po symulacji uzupełnienia profilu: termin porodu za 120 dni, plan w etapie Ciąża.
    id: 'u01-anna-nowak-profil-demo',
    nazwa: tekst.u01AnnaProfilDemo.nazwa,
    opis: tekst.u01AnnaProfilDemo.opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => stanAnnyPoSymulacji(ctx),
  },
];
