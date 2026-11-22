// Scenariusze demonstracyjne jednostki u16 (kontrakt, sekcja 6.6). Właściciel: u16.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek 3.5.2.1.1 i 3.5.2.1.2 nadpisaniami danych
// symulowanego ZUS, decyzją o zgodzie i datą demonstracyjną. Wpisy w polach `nazwa` i `opis` są danymi
// panelu demonstracyjnego, a nie tekstami widoków przewodnika.
import { kontoPrzykladowe } from '@/dane/konta-demo';
import { kontoPrzewodnikaZKontaDemo } from '@/dane/magazyn/stan-poczatkowy';
import { WERSJA_TRESCI_ZGODY } from '@/domena/konto';
import type { KontekstOperacji, KontoPrzewodnika, Pesel, ScenariuszDemo, ZaswiadczenieEzla } from '@/domena/typy';
import '@/domena/zasilki/rozszerzenia-typow';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoSettings.scenariusze.pozycje;

const MAGDALENA: Pesel = '90072551267';
const ANNA: Pesel = '93041231085';
const PAULINA: Pesel = '95082103460';
const KAROLINA: Pesel = '96020377745';
const EWA: Pesel = '92051401244';
const DZIS = '2026-11-21';

function zaswiadczenieB(seriaINumer: string, od: string, do_: string, platnik: string): ZaswiadczenieEzla {
  return { seriaINumer, dataWystawienia: od, od, do: do_, kodyLiterowe: ['B'], platnik, rodzaj: 'choroba' };
}

/** Konto przykładowe z odmową zgody na dane dotyczące zdrowia. */
function kontoZOdmowaZgody(pesel: Pesel, ctx: KontekstOperacji): KontoPrzewodnika {
  const demo = kontoPrzykladowe(pesel);
  if (demo === undefined) throw new Error('Brak przykładowego konta w rejestrze kont demonstracyjnych.');
  const konto = kontoPrzewodnikaZKontaDemo(demo, ctx.teraz);
  return { ...konto, decyzjeOZgodzie: [{ rodzaj: 'odmowa', wersjaTresci: WERSJA_TRESCI_ZGODY, czas: ctx.teraz }] };
}

export const scenariuszeU16: readonly ScenariuszDemo[] = [
  {
    id: 'u16-magdalena-dwa-zaswiadczenia',
    nazwa: tekst['u16-magdalena-dwa-zaswiadczenia'].nazwa,
    opis: tekst['u16-magdalena-dwa-zaswiadczenia'].opis,
    pesel: MAGDALENA,
    zastosuj: () => ({
      zus: {
        nadpisania: {
          zaswiadczeniaEzla: [
            zaswiadczenieB('ZY 2609402', '2026-09-01', '2026-09-30', 'Zielony Ogród sp. z o.o.'),
            zaswiadczenieB('ZY 2610077', '2026-10-01', '2026-10-31', 'Zielony Ogród sp. z o.o.'),
          ],
        },
      },
      parametry: { dataDemo: DZIS },
    }),
  },
  {
    id: 'u16-magdalena-bez-ezla',
    nazwa: tekst['u16-magdalena-bez-ezla'].nazwa,
    opis: tekst['u16-magdalena-bez-ezla'].opis,
    pesel: MAGDALENA,
    zastosuj: () => ({ zus: { nadpisania: { zaswiadczeniaEzla: [] } }, parametry: { dataDemo: DZIS } }),
  },
  {
    id: 'u16-anna-zadluzenie-120',
    nazwa: tekst['u16-anna-zadluzenie-120'].nazwa,
    opis: tekst['u16-anna-zadluzenie-120'].opis,
    pesel: ANNA,
    zastosuj: () => ({
      zus: { nadpisania: { osZadluzenia: { zmiany: [{ od: '2024-03-01', kwota: 0 }, { od: '2026-11-01', kwota: 12000 }] } } },
      parametry: { dataDemo: DZIS },
    }),
  },
  {
    id: 'u16-anna-zadluzenie-progowe',
    nazwa: tekst['u16-anna-zadluzenie-progowe'].nazwa,
    opis: tekst['u16-anna-zadluzenie-progowe'].opis,
    pesel: ANNA,
    zastosuj: () => ({
      zus: {
        nadpisania: {
          zaswiadczeniaEzla: [],
          osZadluzenia: { zmiany: [{ od: '2024-03-01', kwota: 0 }, { od: '2026-11-01', kwota: 4806 }] },
        },
      },
      parametry: { dataDemo: DZIS },
    }),
  },
  {
    id: 'u16-anna-bez-stanu-rozliczen',
    nazwa: tekst['u16-anna-bez-stanu-rozliczen'].nazwa,
    opis: tekst['u16-anna-bez-stanu-rozliczen'].opis,
    pesel: ANNA,
    zastosuj: () => ({ zus: { nadpisania: { stanRozliczenNiedostepny: true } }, parametry: { dataDemo: DZIS } }),
  },
  {
    id: 'u16-anna-okres-wyczerpany',
    nazwa: tekst['u16-anna-okres-wyczerpany'].nazwa,
    opis: tekst['u16-anna-okres-wyczerpany'].opis,
    pesel: ANNA,
    zastosuj: () => ({
      zus: {
        nadpisania: {
          zaswiadczeniaEzla: [
            zaswiadczenieB('ZY 2606081', '2026-06-08', '2026-09-30', 'Anna Nowak'),
            zaswiadczenieB('ZY 2610012', '2026-10-01', '2027-01-15', 'Anna Nowak'),
            zaswiadczenieB('ZY 2701163', '2027-01-16', '2027-03-14', 'Anna Nowak'),
          ],
          osZadluzenia: { zmiany: [{ od: '2024-03-01', kwota: 0 }] },
        },
      },
      parametry: { dataDemo: '2027-03-05' },
    }),
  },
  {
    id: 'u16-paulina-okres-wyczekiwania',
    nazwa: tekst['u16-paulina-okres-wyczekiwania'].nazwa,
    opis: tekst['u16-paulina-okres-wyczekiwania'].opis,
    pesel: PAULINA,
    zastosuj: () => ({
      zus: { nadpisania: { zaswiadczeniaEzla: [], osZadluzenia: { zmiany: [{ od: '2026-10-01', kwota: 0 }] } } },
      parametry: { dataDemo: DZIS },
    }),
  },
  {
    id: 'u16-paulina-ezla-styczen',
    nazwa: tekst['u16-paulina-ezla-styczen'].nazwa,
    opis: tekst['u16-paulina-ezla-styczen'].opis,
    pesel: PAULINA,
    zastosuj: () => ({
      zus: {
        nadpisania: {
          zaswiadczeniaEzla: [zaswiadczenieB('ZY 2701044', '2027-01-04', '2027-01-31', 'Paulina Wrona')],
          osZadluzenia: { zmiany: [{ od: '2026-10-01', kwota: 0 }] },
        },
      },
      parametry: { dataDemo: '2027-01-04' },
    }),
  },
  {
    id: 'u16-ewa-ustanie-umowy',
    nazwa: tekst['u16-ewa-ustanie-umowy'].nazwa,
    opis: tekst['u16-ewa-ustanie-umowy'].opis,
    pesel: EWA,
    zastosuj: () => ({ zus: { nadpisania: { zaswiadczeniaEzla: [] } }, parametry: { dataDemo: DZIS } }),
  },
  {
    id: 'u16-karolina-odmowa-zgody',
    nazwa: tekst['u16-karolina-odmowa-zgody'].nazwa,
    opis: tekst['u16-karolina-odmowa-zgody'].opis,
    pesel: KAROLINA,
    zastosuj: (ctx) => ({
      konto: { konto: kontoZOdmowaZgody(KAROLINA, ctx) },
      zus: {
        nadpisania: {
          zaswiadczeniaEzla: [zaswiadczenieB('ZY 2610105', '2026-10-10', '2026-10-23', 'Studio Kreska sp. z o.o.')],
        },
      },
      parametry: { dataDemo: DZIS },
    }),
  },
];
