// Scenariusze demonstracyjne jednostki u14 (kontrakt, sekcja 6.6). Właściciel: u14.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek 3.4.4.1.2, 3.4.5.1.1, 3.4.5.1.2, 3.4.2.1.1
// i 3.4.2.1.2 nadpisaniami danych symulowanego ZUS i datą demonstracyjną. Wpisy w polach `nazwa` i `opis`
// są danymi panelu demonstracyjnego, a nie tekstami widoków przewodnika.
import {
  wniosek800Plus,
  wniosekZasilkuMacierzynskiego,
  wyplata800Plus,
  wyplataZasilkuMacierzynskiego,
} from '@/dane/konta-zus/wnioski-zus';
import { kontaPrzykladowe } from '@/dane/konta-demo';
import { odczytajKatalog } from '@/dane/magazyn/stan';
import { kontoPrzewodnikaZKontaDemo, wynikiKalkulacjiPuste } from '@/dane/magazyn/stan-poczatkowy';
import { wyliczPlan } from '@/domena/plan/wylicz-plan';
import type {
  DataISO,
  KontekstOperacji,
  OsZadluzenia,
  ScenariuszDemo,
  StanKonta,
  StanRodziny,
  ZaswiadczenieEzla,
} from '@/domena/typy';
import '@/domena/zasilki/rozszerzenia-typow';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoSettings.scenariusze.pozycje;

const MAGDALENA = '90072551267';
const ANNA = '93041231085';
const JOANNA = '91113040407';
const PLATNIK_MAGDALENY = 'Zielony Ogród sp. z o.o.';

function zaswiadczenieB(seriaINumer: string, od: string, do_: string): ZaswiadczenieEzla {
  return { seriaINumer, dataWystawienia: od, od, do: do_, kodyLiterowe: ['B'], platnik: PLATNIK_MAGDALENY, rodzaj: 'choroba' };
}

/** Dziecko Anny Nowak urodzone 19.11.2026 (data porodu w danych członków rodziny). */
const dzieckoAnny = { imie: 'Zofia', nazwisko: 'Nowak', pesel: '26311907825', dataUrodzenia: '2026-11-19' };

/** Konto przewodnika Anny Nowak z rolą Rodzic i zgodą na przetwarzanie danych. */
function kontoAnny(ctx: KontekstOperacji): Partial<StanKonta> {
  const demo = kontaPrzykladowe.find((k) => k.pesel === ANNA);
  if (demo === undefined) throw new Error('Brak konta demonstracyjnego Anny Nowak.');
  return {
    konto: {
      ...kontoPrzewodnikaZKontaDemo(demo, ctx.teraz),
      rola: 'rodzic',
      idRodziny: ANNA,
      decyzjeOZgodzie: [{ rodzaj: 'udzielenie', wersjaTresci: '1.0', czas: ctx.teraz }],
    },
  };
}

/**
 * Profil rodziny Anny Nowak (JDG z dobrowolnym ubezpieczeniem chorobowym, termin porodu 15.03.2027).
 * Z `dataPorodu` profil ma potwierdzoną datę porodu, która jest dniem powstania prawa do zasiłku macierzyńskiego.
 */
function rodzinaAnny(ctx: KontekstOperacji, dataPorodu?: DataISO): StanRodziny {
  return {
    idRodziny: ANNA,
    daneRodziny: {
      idRodziny: ANNA,
      sytuacja: { wartosc: dataPorodu ? 'narodziny' : 'oczekiwanie', zrodlo: 'odpowiedz-rodzica' },
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
      dostepKont: [{ pesel: ANNA, rola: 'rodzic', dolaczono: ctx.dzis, stan: 'aktywny' }],
      zapisano: ctx.teraz,
    },
    daneCiazy: {
      przewidywanyTerminPorodu: dataPorodu && dataPorodu < '2026-11-01' ? '2026-04-15' : '2027-03-15',
      liczbaDzieciZCiazy: 1,
      dataPierwszejWizyty: dataPorodu && dataPorodu < '2026-11-01' ? '2025-09-10' : '2026-07-20',
      dataPoroduPotwierdzona: dataPorodu !== undefined,
      ...(dataPorodu ? { dataPorodu, zrodloDatyPorodu: 'odpowiedz-rodzica' as const, liczbaUrodzonychDzieci: 1 } : {}),
      dzieci: [],
      sytuacjeSzczegolne: [],
      spokojnyTryb: { wlaczony: false },
    },
    plan: null,
    kalendarz: null,
    wnioski: [],
    wynikiKalkulacji: { scenariusze: [], porownaniaWariantow: [], podzialyUrlopu: [], nastepnyNumer: 1 },
  };
}

/** Scenariusz stanu rozliczeń Anny Nowak z osią zadłużenia, datą porodu w profilu i datą demonstracyjną. */
function scenariuszRozliczenAnny(
  id: string,
  nazwa: string,
  opis: string,
  os: OsZadluzenia,
  dataPorodu: DataISO,
  dataDemo: DataISO,
  zDzieckiem = true,
): ScenariuszDemo {
  return {
    id,
    nazwa,
    opis,
    pesel: ANNA,
    zastosuj: (ctx) => ({
      konto: kontoAnny(ctx),
      rodzina: rodzinaAnny(ctx, dataPorodu),
      zus: { ...(zDzieckiem ? { dzieckoZSymulacji: dzieckoAnny } : {}), nadpisania: { osZadluzenia: os } },
      parametry: { dataDemo },
    }),
  };
}

export const scenariuszeU14: readonly ScenariuszDemo[] = [
  {
    id: 'u14-ezla-koniec-okresu-blisko',
    nazwa: tekst['u14-ezla-koniec-okresu-blisko'].nazwa,
    opis: tekst['u14-ezla-koniec-okresu-blisko'].opis,
    pesel: MAGDALENA,
    zastosuj: () => ({
      zus: { nadpisania: { zaswiadczeniaEzla: [zaswiadczenieB('ZY 2603160', '2026-03-16', '2026-11-15')] } },
      parametry: { dataDemo: '2026-11-21' },
    }),
  },
  {
    id: 'u14-ezla-okres-wyczerpany',
    nazwa: tekst['u14-ezla-okres-wyczerpany'].nazwa,
    opis: tekst['u14-ezla-okres-wyczerpany'].opis,
    pesel: MAGDALENA,
    zastosuj: () => ({
      zus: { nadpisania: { zaswiadczeniaEzla: [zaswiadczenieB('ZY 2603020', '2026-03-02', '2026-11-26')] } },
      parametry: { dataDemo: '2026-11-21' },
    }),
  },
  {
    id: 'u14-ezla-przerwa-65-dni',
    nazwa: tekst['u14-ezla-przerwa-65-dni'].nazwa,
    opis: tekst['u14-ezla-przerwa-65-dni'].opis,
    pesel: MAGDALENA,
    zastosuj: () => ({
      zus: {
        nadpisania: {
          zaswiadczeniaEzla: [
            zaswiadczenieB('ZY 2608250', '2026-08-25', '2026-09-14'),
            zaswiadczenieB('ZY 2606010', '2026-06-01', '2026-06-20'),
          ],
        },
      },
      parametry: { dataDemo: '2026-11-21' },
    }),
  },
  {
    id: 'u14-ezla-przerwa-56-dni',
    nazwa: tekst['u14-ezla-przerwa-56-dni'].nazwa,
    opis: tekst['u14-ezla-przerwa-56-dni'].opis,
    pesel: MAGDALENA,
    zastosuj: () => ({
      zus: {
        nadpisania: {
          zaswiadczeniaEzla: [
            zaswiadczenieB('ZY 2609150', '2026-09-15', '2026-09-30'),
            zaswiadczenieB('ZY 2607010', '2026-07-01', '2026-07-20'),
          ],
        },
      },
      parametry: { dataDemo: '2026-11-21' },
    }),
  },
  {
    id: 'u14-ezla-nowy-rok-wynagrodzenia',
    nazwa: tekst['u14-ezla-nowy-rok-wynagrodzenia'].nazwa,
    opis: tekst['u14-ezla-nowy-rok-wynagrodzenia'].opis,
    pesel: MAGDALENA,
    zastosuj: () => ({
      zus: { nadpisania: { zaswiadczeniaEzla: [zaswiadczenieB('ZY 2612200', '2026-12-20', '2027-01-10')] } },
      parametry: { dataDemo: '2027-01-15' },
    }),
  },
  {
    id: 'u14-ezla-jdg-bez-chorobowego',
    nazwa: tekst['u14-ezla-jdg-bez-chorobowego'].nazwa,
    opis: tekst['u14-ezla-jdg-bez-chorobowego'].opis,
    pesel: JOANNA,
    zastosuj: () => ({
      zus: {
        nadpisania: {
          zaswiadczeniaEzla: [{ ...zaswiadczenieB('ZY 2611020', '2026-11-02', '2026-11-15'), platnik: 'Joanna Mazur' }],
        },
      },
      parametry: { dataDemo: '2026-11-21' },
    }),
  },
  {
    id: 'u14-rozliczenia-niedostepne',
    nazwa: tekst['u14-rozliczenia-niedostepne'].nazwa,
    opis: tekst['u14-rozliczenia-niedostepne'].opis,
    pesel: ANNA,
    zastosuj: () => ({ zus: { nadpisania: { stanRozliczenNiedostepny: true } } }),
  },
  scenariuszRozliczenAnny(
    'u14-rozliczenia-na-progu',
    tekst['u14-rozliczenia-na-progu'].nazwa,
    tekst['u14-rozliczenia-na-progu'].opis,
    { zmiany: [{ od: '2024-03-01', kwota: 0 }, { od: '2026-11-19', kwota: 4806 }] },
    '2026-11-19',
    '2026-11-21',
  ),
  scenariuszRozliczenAnny(
    'u14-rozliczenia-ponad-prog',
    tekst['u14-rozliczenia-ponad-prog'].nazwa,
    tekst['u14-rozliczenia-ponad-prog'].opis,
    { zmiany: [{ od: '2024-03-01', kwota: 0 }, { od: '2026-11-19', kwota: 4807 }] },
    '2026-11-19',
    '2026-11-21',
  ),
  scenariuszRozliczenAnny(
    'u14-rozliczenia-uklad-ratalny',
    tekst['u14-rozliczenia-uklad-ratalny'].nazwa,
    tekst['u14-rozliczenia-uklad-ratalny'].opis,
    {
      zmiany: [{ od: '2024-03-01', kwota: 0 }, { od: '2026-11-01', kwota: 90000 }],
      umowa: {
        rodzaj: 'uklad-ratalny',
        kwotaObjeta: 90000,
        splacanaZgodnieZUmowa: true,
        caleZadluzenieObjete: true,
        od: '2026-11-01',
      },
    },
    '2026-11-19',
    '2026-11-21',
  ),
  scenariuszRozliczenAnny(
    'u14-rozliczenia-splata-w-6-miesiacach',
    tekst['u14-rozliczenia-splata-w-6-miesiacach'].nazwa,
    tekst['u14-rozliczenia-splata-w-6-miesiacach'].opis,
    {
      zmiany: [{ od: '2024-03-01', kwota: 0 }, { od: '2026-11-01', kwota: 12000 }, { od: '2026-12-10', kwota: 0 }],
      splaty: [{ dzien: '2026-12-10', kwota: 12000 }],
    },
    '2026-11-19',
    '2026-12-15',
  ),
  scenariuszRozliczenAnny(
    'u14-rozliczenia-bez-splaty-6-miesiecy',
    tekst['u14-rozliczenia-bez-splaty-6-miesiecy'].nazwa,
    tekst['u14-rozliczenia-bez-splaty-6-miesiecy'].opis,
    { zmiany: [{ od: '2024-03-01', kwota: 0 }, { od: '2026-03-21', kwota: 12000 }] },
    '2026-04-10',
    '2026-11-21',
    false,
  ),
  {
    id: 'u14-rozliczenia-dzien-e-zla',
    nazwa: tekst['u14-rozliczenia-dzien-e-zla'].nazwa,
    opis: tekst['u14-rozliczenia-dzien-e-zla'].opis,
    pesel: ANNA,
    zastosuj: (ctx) => ({
      konto: kontoAnny(ctx),
      rodzina: rodzinaAnny(ctx),
      zus: {
        nadpisania: {
          zaswiadczeniaEzla: [
            {
              seriaINumer: 'ZY 2611020',
              dataWystawienia: '2026-11-02',
              od: '2026-11-02',
              do: '2026-11-20',
              kodyLiterowe: ['B'],
              platnik: 'Anna Nowak',
              rodzaj: 'choroba',
            },
          ],
        },
      },
      parametry: { dataDemo: '2026-11-21' },
    }),
  },
  {
    id: 'u14-800-plus-w-trakcie',
    nazwa: tekst['u14-800-plus-w-trakcie'].nazwa,
    opis: tekst['u14-800-plus-w-trakcie'].opis,
    pesel: ANNA,
    zastosuj: () => ({
      zus: {
        dzieckoZSymulacji: dzieckoAnny,
        nadpisania: {
          wnioski: [wniosek800Plus('w-trakcie'), wniosekZasilkuMacierzynskiego],
          zasilki: [wyplataZasilkuMacierzynskiego],
        },
      },
      parametry: { dataDemo: '2026-12-16' },
    }),
  },
  {
    id: 'u14-800-plus-przyznane',
    nazwa: tekst['u14-800-plus-przyznane'].nazwa,
    opis: tekst['u14-800-plus-przyznane'].opis,
    pesel: ANNA,
    zastosuj: () => ({
      zus: {
        dzieckoZSymulacji: dzieckoAnny,
        nadpisania: {
          wnioski: [wniosek800Plus('przyznanie'), wniosekZasilkuMacierzynskiego],
          zasilki: [wyplataZasilkuMacierzynskiego],
          swiadczeniaRodzinne: [wyplata800Plus],
        },
      },
      parametry: { dataDemo: '2027-01-05' },
    }),
  },
  {
    id: 'u14-800-plus-odmowa',
    nazwa: tekst['u14-800-plus-odmowa'].nazwa,
    opis: tekst['u14-800-plus-odmowa'].opis,
    pesel: ANNA,
    zastosuj: () => ({
      zus: {
        dzieckoZSymulacji: dzieckoAnny,
        nadpisania: { wnioski: [wniosek800Plus('odmowa')] },
      },
      parametry: { dataDemo: '2027-01-05' },
    }),
  },
  {
    id: 'u14-aktywny-rodzic-zlozona-przez-rodzica',
    nazwa: tekst['u14-aktywny-rodzic-zlozona-przez-rodzica'].nazwa,
    opis: tekst['u14-aktywny-rodzic-zlozona-przez-rodzica'].opis,
    pesel: ANNA,
    zastosuj: (ctx) => {
      const dzis = '2027-11-25';
      const rodzina = rodzinaAnny(ctx, '2026-11-19');
      const plan = wyliczPlan({
        daneRodziny: rodzina.daneRodziny,
        daneCiazy: rodzina.daneCiazy,
        zgoda: true,
        katalog: odczytajKatalog(),
        daneZusMatki: null,
        daneZusDrugiegoRodzica: null,
        wnioski: [],
        wynikiKalkulacji: wynikiKalkulacjiPuste(),
        poprzedniPlan: null,
        dzis,
        teraz: `${dzis}T08:00:00`,
        parametry: { progPodwyzszeniaPodstawyProcent: 50, progOstrzezeniaOkresuZasilkowegoDni: 30 },
      });
      const pozycje = plan.pozycje.map((p) =>
        (p.idPozycji ?? p.idSprawy) === 'K18'
          ? { ...p, status: 'zlozona' as const, zrodloStatusu: 'odpowiedz-rodzica' as const, dataOznaczenia: '2027-11-22' }
          : p,
      );
      return {
        konto: kontoAnny(ctx),
        rodzina: { ...rodzina, plan: { ...plan, pozycje } },
        zus: {
          dzieckoZSymulacji: dzieckoAnny,
          nadpisania: { wnioski: [wniosek800Plus('przyznanie'), wniosekZasilkuMacierzynskiego] },
        },
        parametry: { dataDemo: dzis },
      };
    },
  },
];
