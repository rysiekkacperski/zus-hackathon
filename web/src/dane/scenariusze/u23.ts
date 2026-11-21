// Scenariusze demonstracyjne jednostki u23 (kontrakt, sekcja 6.6). Właściciel: u23.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek jednostki: profil rodziny z drugim rodzicem,
// który nie dołączył do planu, oraz warianty pełnomocnictwa PEL Tomasza Nowaka dla Anny Nowak.
import { kontaPrzykladowe } from '@/dane/konta-demo';
import { kontaMocodawcowZus, pelnomocnictwoTomaszaDlaAnny } from '@/dane/konta-zus/pelnomocnictwa';
import { kontoPrzewodnikaZKontaDemo, wynikiKalkulacjiPuste } from '@/dane/magazyn/stan-poczatkowy';
import { daneZPelnomocnictwa, zastosujDaneZPelnomocnictwa } from '@/domena/rodzina/pelnomocnictwo';
import type {
  DaneRodzica,
  DataISO,
  DrugiRodzic,
  FormaZatrudnienia,
  Gmina,
  KontekstOperacji,
  PelnomocnictwoPel,
  Pesel,
  ScenariuszDemo,
  StanKonta,
  StanRodziny,
  ZnacznikCzasu,
} from '@/domena/typy';

const ANNA: Pesel = '93041231085';
const MAGDALENA: Pesel = '90072551267';
const KAROLINA: Pesel = '96020377745';
const JOANNA: Pesel = '91113040407';
const TOMASZ: Pesel = '90011555532';

const GMINY: Record<string, Gmina> = {
  bydgoszcz: { idTeryt: '0461011', nazwa: 'Bydgoszcz', powiat: 'Bydgoszcz', wojewodztwo: 'kujawsko-pomorskie' },
  poznan: { idTeryt: '3064011', nazwa: 'Poznań', powiat: 'Poznań', wojewodztwo: 'wielkopolskie' },
  lodz: { idTeryt: '1061011', nazwa: 'Łódź', powiat: 'Łódź', wojewodztwo: 'łódzkie' },
  gdansk: { idTeryt: '2261011', nazwa: 'Gdańsk', powiat: 'Gdańsk', wojewodztwo: 'pomorskie' },
};

function rodzicZKontaZus(forma: FormaZatrudnienia, dobrowolne: boolean | null): DaneRodzica {
  return {
    formaZatrudnienia: { wartosc: forma, zrodlo: 'konto-zus' },
    dobrowolneChorobowe: dobrowolne === null ? null : { wartosc: dobrowolne, zrodlo: 'konto-zus' },
    platnikZasilku: { wartosc: forma === 'umowa-o-prace' ? 'platnik-skladek' : 'zus', zrodlo: 'konto-zus' },
    potwierdzeniaSkladek: [],
  };
}

function drugiZOdpowiedzi(
  osoba: { imie: string; nazwisko: string; dopelniacz: string },
  forma: FormaZatrudnienia,
  dobrowolne: boolean | null,
): DrugiRodzic {
  return {
    imie: osoba.imie,
    nazwisko: osoba.nazwisko,
    imieINazwiskoDopelniacz: osoba.dopelniacz,
    formaZatrudnienia: { wartosc: forma, zrodlo: 'odpowiedz-rodzica' },
    dobrowolneChorobowe: dobrowolne === null ? null : { wartosc: dobrowolne, zrodlo: 'odpowiedz-rodzica' },
    platnikZasilku: { wartosc: 'zus', zrodlo: 'odpowiedz-rodzica' },
    potwierdzeniaSkladek: [],
  };
}

function kontoRodzica(pesel: Pesel, teraz: ZnacznikCzasu): StanKonta['konto'] {
  const demo = kontaPrzykladowe.find((k) => k.pesel === pesel);
  if (demo === undefined) throw new Error(`Brak konta przykładowego ${pesel}`);
  return {
    ...kontoPrzewodnikaZKontaDemo(demo, teraz),
    rola: 'rodzic',
    idRodziny: pesel,
    decyzjeOZgodzie: [{ rodzaj: 'udzielenie', wersjaTresci: '1.0', czas: teraz }],
  };
}

function rodzina(
  pesel: Pesel,
  w: { matka: DaneRodzica; drugi: DrugiRodzic; gmina: Gmina; terminPorodu: DataISO },
  ctx: KontekstOperacji,
): StanRodziny {
  return {
    idRodziny: pesel,
    daneRodziny: {
      idRodziny: pesel,
      sytuacja: { wartosc: 'oczekiwanie', zrodlo: 'odpowiedz-rodzica' },
      rodzicKonta: 'matka',
      matka: w.matka,
      drugiRodzic: w.drugi,
      stanCywilny: { wartosc: 'malzenstwo', zrodlo: 'odpowiedz-rodzica' },
      gmina: { wartosc: w.gmina, zrodlo: 'odpowiedz-rodzica' },
      dochodNaOsobe: { wartosc: 'nieznany', zrodlo: 'odpowiedz-rodzica' },
      dostepKont: [{ pesel, rola: 'rodzic', dolaczono: ctx.dzis, stan: 'aktywny' }],
      zapisano: ctx.teraz,
    },
    daneCiazy: {
      przewidywanyTerminPorodu: w.terminPorodu,
      liczbaDzieciZCiazy: 1,
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

const TOMASZ_W_PROFILU = { imie: 'Tomasz', nazwisko: 'Nowak', dopelniacz: 'Tomasza Nowaka' };

/** Drugi rodzic Anny Nowak: umowa zlecenia z dobrowolnym ubezpieczeniem chorobowym, odpowiedź rodzica. */
function tomaszWOdpowiedzi(): DrugiRodzic {
  return drugiZOdpowiedzi(TOMASZ_W_PROFILU, 'umowa-zlecenia', true);
}

/** Dane Tomasza Nowaka odczytane na podstawie pełnomocnictwa PEL w dniu `odczytano`. */
function tomaszZPelnomocnictwa(odczytano: ZnacznikCzasu): DrugiRodzic {
  const zrodlo = kontaMocodawcowZus[TOMASZ];
  const dane = daneZPelnomocnictwa({
    odczytano,
    pesel: TOMASZ,
    imie: 'Tomasz',
    nazwisko: 'Nowak',
    tytuly: zrodlo?.tytuly ?? [],
    czlonkowieRodziny: [],
    zasilki: [],
    swiadczeniaRodzinne: [],
    wnioski: [],
    zaswiadczeniaEzla: [],
    stanyRozliczen: [],
    zaswiadczeniaORozliczeniach: [],
    korespondencja: [],
    pelnomocnictwa: [],
  });
  return zastosujDaneZPelnomocnictwa(tomaszWOdpowiedzi(), dane, pelnomocnictwoTomaszaDlaAnny.mocodawca);
}

function rodzinaAnny(drugi: DrugiRodzic, ctx: KontekstOperacji): StanRodziny {
  return rodzina(
    ANNA,
    { matka: rodzicZKontaZus('jdg', true), drugi, gmina: GMINY.bydgoszcz, terminPorodu: '2027-03-15' },
    ctx,
  );
}

function scenariuszAnny(
  id: string,
  nazwa: string,
  opis: string,
  w: { dataDemo: DataISO; drugi: (ctx: KontekstOperacji) => DrugiRodzic; pelnomocnictwo?: PelnomocnictwoPel },
): ScenariuszDemo {
  return {
    id,
    nazwa,
    opis,
    pesel: ANNA,
    zastosuj: (ctx) => ({
      parametry: { dataDemo: w.dataDemo },
      konto: { konto: kontoRodzica(ANNA, ctx.teraz) },
      rodzina: rodzinaAnny(w.drugi(ctx), ctx),
      ...(w.pelnomocnictwo ? { zus: { nadpisania: { pelnomocnictwa: [w.pelnomocnictwo] } } } : {}),
    }),
  };
}

export const scenariuszeU23: readonly ScenariuszDemo[] = [
  scenariuszAnny(
    'u23-anna-drugi-rodzic-nie-dolaczyl',
    'Anna Nowak: drugi rodzic nie dołączył',
    'Profil Anny Nowak z Tomaszem Nowakiem na umowie zlecenia (odpowiedź rodzica), który nie dołączył do planu. Pełnomocnictwo PEL od 01.10.2026 do odwołania. Dzisiaj 21.11.2026.',
    { dataDemo: '2026-11-21', drugi: tomaszWOdpowiedzi },
  ),
  scenariuszAnny(
    'u23-anna-pel-od-przyszlej-daty',
    'Anna Nowak: pełnomocnictwo PEL od 01.12.2026',
    'Tomasz Nowak udzielił Annie Nowak pełnomocnictwa PEL do roli Ubezpieczony od 01.12.2026. Dzisiaj 21.11.2026; po zmianie daty na 01.12.2026 przewodnik odczyta dane przy otwarciu.',
    {
      dataDemo: '2026-11-21',
      drugi: tomaszWOdpowiedzi,
      pelnomocnictwo: { ...pelnomocnictwoTomaszaDlaAnny, od: '2026-12-01', dataDotarcia: '2026-11-20' },
    },
  ),
  scenariuszAnny(
    'u23-anna-pel-odczytane-ponowny-odczyt',
    'Anna Nowak: ponowny odczyt danych z pełnomocnictwa',
    'Dane Tomasza Nowaka odczytane z pełnomocnictwa PEL 21.11.2026. Dzisiaj 05.12.2026; przy otwarciu przewodnik odczyta je ponownie.',
    { dataDemo: '2026-12-05', drugi: () => tomaszZPelnomocnictwa('2026-11-21T10:00:00') },
  ),
  scenariuszAnny(
    'u23-anna-pel-odwolane',
    'Anna Nowak: pełnomocnictwo PEL odwołane',
    'Dane Tomasza Nowaka odczytane z pełnomocnictwa PEL 21.11.2026, odwołanego formularzem PEL-O 10.12.2026. Dzisiaj 11.12.2026.',
    {
      dataDemo: '2026-12-11',
      drugi: () => tomaszZPelnomocnictwa('2026-11-21T10:00:00'),
      pelnomocnictwo: { ...pelnomocnictwoTomaszaDlaAnny, dataOdwolania: '2026-12-10' },
    },
  ),
  scenariuszAnny(
    'u23-anna-pel-wygaslo',
    'Anna Nowak: pełnomocnictwo PEL wygasło 31.12.2026',
    'Dane Tomasza Nowaka odczytane z pełnomocnictwa PEL obowiązującego do 31.12.2026. Dzisiaj 02.01.2027.',
    {
      dataDemo: '2027-01-02',
      drugi: () => tomaszZPelnomocnictwa('2026-12-20T10:00:00'),
      pelnomocnictwo: { ...pelnomocnictwoTomaszaDlaAnny, do: '2026-12-31' },
    },
  ),
  {
    id: 'u23-magdalena-pel-korespondencja',
    nazwa: 'Magdalena Wójcik: pełnomocnictwo PEL do korespondencji',
    opis: 'Profil Magdaleny Wójcik z Piotrem Wójcikiem na umowie o pracę (odpowiedź rodzica). Pełnomocnictwo PEL ograniczone do korespondencji.',
    pesel: MAGDALENA,
    zastosuj: (ctx) => ({
      parametry: { dataDemo: '2026-11-21' },
      konto: { konto: kontoRodzica(MAGDALENA, ctx.teraz) },
      rodzina: rodzina(
        MAGDALENA,
        {
          matka: rodzicZKontaZus('umowa-o-prace', null),
          drugi: drugiZOdpowiedzi({ imie: 'Piotr', nazwisko: 'Wójcik', dopelniacz: 'Piotra Wójcika' }, 'umowa-o-prace', null),
          gmina: GMINY.poznan,
          terminPorodu: '2027-04-20',
        },
        ctx,
      ),
    }),
  },
  {
    id: 'u23-karolina-pel-wygasle',
    nazwa: 'Karolina Lis: pełnomocnictwo PEL wygasłe',
    opis: 'Profil Karoliny Lis (Rodzic we własnej rodzinie) z Marcinem Lisem na umowie o pracę. Pełnomocnictwo PEL od 01.01.2026 do 31.10.2026. Dzisiaj 21.11.2026.',
    pesel: KAROLINA,
    zastosuj: (ctx) => ({
      parametry: { dataDemo: '2026-11-21' },
      konto: { konto: kontoRodzica(KAROLINA, ctx.teraz) },
      rodzina: rodzina(
        KAROLINA,
        {
          matka: rodzicZKontaZus('umowa-zlecenia', true),
          drugi: drugiZOdpowiedzi({ imie: 'Marcin', nazwisko: 'Lis', dopelniacz: 'Marcina Lisa' }, 'umowa-o-prace', null),
          gmina: GMINY.lodz,
          terminPorodu: '2027-05-10',
        },
        ctx,
      ),
    }),
  },
  {
    id: 'u23-joanna-bez-pelnomocnictwa',
    nazwa: 'Joanna Mazur: drugi rodzic bez pełnomocnictwa',
    opis: 'Profil Joanny Mazur z drugim rodzicem na umowie o pracę, który nie udzielił pełnomocnictwa PEL. Dzisiaj 21.11.2026.',
    pesel: JOANNA,
    zastosuj: (ctx) => ({
      parametry: { dataDemo: '2026-11-21' },
      konto: { konto: kontoRodzica(JOANNA, ctx.teraz) },
      rodzina: rodzina(
        JOANNA,
        {
          matka: rodzicZKontaZus('jdg', false),
          drugi: drugiZOdpowiedzi({ imie: 'Michał', nazwisko: 'Mazur', dopelniacz: 'Michała Mazura' }, 'umowa-o-prace', null),
          gmina: GMINY.gdansk,
          terminPorodu: '2027-02-28',
        },
        ctx,
      ),
    }),
  },
];
