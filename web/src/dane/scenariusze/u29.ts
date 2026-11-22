// Scenariusze demonstracyjne jednostki u29 (kontrakt, sekcja 6.6). Właściciel: u29.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek jednostki: pytanie Anny Nowak w sprawie K08
// wysłane 21.11.2026 o 10:15 bez odpowiedzi (KA-04, KA-05, KA-16) i z odpowiedzią ZUS z 25.11.2026 (KA-11 do KA-15)
// oraz nieaktualną kopię danych konta z 20.11.2026, 18:30 przy niedostępnym PUE/eZUS (3.8.2.2.1 KA-11).
// Każdy scenariusz startuje od zapisanego profilu rodziny Anny Nowak z planem (scenariusz u08), więc po
// zalogowaniu przewodnik pomija uzupełnianie danych i od razu pokazuje plan rodziny.
import { zrodloweDaneKonta } from '@/dane/konta-zus';
import { odpowiedziZus } from '@/dane/konta-zus/odpowiedzi-zus';
import { utworzParametryPoczatkowe } from '@/dane/parametry-systemu';
import { kontaPrzykladowe } from '@/dane/konta-demo';
import { gminy } from '@/dane/gminy';
import { kontoPrzewodnikaZKontaDemo } from '@/dane/magazyn/stan-poczatkowy';
import { scenariuszeU08 } from '@/dane/scenariusze/u08';
import { scenariuszeU19 } from '@/dane/scenariusze/u19';
import { przygotujKopie } from '@/domena/dane-zus/odczyt';
import { trescSymulowanejOdpowiedzi } from '@/domena/pytania-zus/odpowiedzi';
import type {
  KontekstOperacji,
  ParametrySystemu,
  PytanieDoZus,
  ScenariuszDemo,
  StanKonta,
  Ustawienia,
} from '@/domena/typy';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoSettings.scenariusze.pozycje;

const PESEL_ANNY = '93041231085';
const PESEL_TOMASZA = '90011555532';

const pytanieK08: PytanieDoZus = {
  idPytania: 'PYT-20261121101500-DEMO01',
  idSprawy: 'K08',
  tresc: 'Czy po porodzie muszę zawiesić działalność, żeby otrzymać zasiłek macierzyński?',
  kontekst: {
    sprawa: {
      idSprawy: 'K08',
      tytul: 'Wniosek o zasiłek macierzyński',
      etap: 'urlopy-i-zasilek',
      status: 'do-zrobienia',
      termin: '2027-04-05',
      terminSzacowany: true,
    },
    profil: {
      formaZatrudnienia: 'jdg',
      ubezpieczenieChorobowe: true,
      platnikZasilku: 'zus',
      przewidywanyTerminPorodu: '2027-03-15',
      liczbaDzieci: 1,
    },
    rodzajUbezpieczeniaChorobowego: 'dobrowolne',
  },
  wyslano: '2026-11-21T10:15:00',
  status: 'wyslane',
  peselNadawcy: PESEL_ANNY,
};

/** Zapisany profil i plan rodziny Anny Nowak przed porodem (JDG z dobrowolnym chorobowym, termin 15.03.2027). */
function profilAnny(ctx: KontekstOperacji): ReturnType<ScenariuszDemo['zastosuj']> {
  const baza = scenariuszeU08.find((s) => s.id === 'u08-anna-plan-przed-porodem');
  return baza ? baza.zastosuj(ctx) : {};
}

function parametry(
  dataDemo: string,
  symulacje: Partial<ParametrySystemu['symulacje']> = {},
): Partial<ParametrySystemu> {
  return {
    dataDemo,
    symulacje: { ...utworzParametryPoczatkowe().symulacje, ...symulacje },
  };
}

const POPRZEDNI_ODCZYT = '2026-11-20T18:30:00';

/** Konto z kopią danych konta ZUS z poprzedniego odczytu 20.11.2026, 18:30. */
function kontoZKopia(konto: Partial<StanKonta> | undefined): Partial<StanKonta> | undefined {
  const zrodlo = zrodloweDaneKonta(PESEL_ANNY, null);
  if (zrodlo === null) return konto;
  const kopia = przygotujKopie({
    zrodlo,
    poprzednia: null,
    teraz: POPRZEDNI_ODCZYT,
  });
  return {
    ...konto,
    kopiaDanychZus: kopia,
    stanOdczytuZus: { stan: 'udany', czas: POPRZEDNI_ODCZYT },
  };
}

/**
 * Rodzina Anny Nowak po porodzie 19.11.2026 (scenariusz u19) z dzieckiem Zofią Nowak w profilu i gminą
 * Bydgoszcz; bez miejsca urodzenia, gdy `zMiejscem` jest fałszem (3.9.7.1.1 KA-01, 3.9.7.1.2 KA-01).
 */
function rodzinaPoPorodzie(ctx: KontekstOperacji, zMiejscem: boolean): ReturnType<ScenariuszDemo['zastosuj']> {
  const baza = scenariuszeU19.find((s) => s.id === 'u19-anna-po-porodzie')?.zastosuj(ctx) ?? {};
  const rodzina = baza.rodzina;
  const bydgoszcz = gminy.find((g) => g.nazwa === 'Bydgoszcz');
  if (rodzina === undefined || rodzina.daneCiazy === null) return baza;
  return {
    ...baza,
    rodzina: {
      ...rodzina,
      daneRodziny: {
        ...rodzina.daneRodziny,
        gmina: bydgoszcz ? { wartosc: bydgoszcz, zrodlo: 'odpowiedz-rodzica' } : rodzina.daneRodziny.gmina,
      },
      daneCiazy: {
        ...rodzina.daneCiazy,
        dzieci: [
          {
            imie: 'Zofia',
            nazwisko: 'Nowak',
            pesel: '26311907825',
            dataUrodzenia: '2026-11-19',
            ...(zMiejscem ? { miejsceUrodzenia: 'Bydgoszcz' } : {}),
            zrodlo: 'odpowiedz-rodzica',
          },
        ],
      },
    },
    parametry: parametry('2026-11-21'),
  };
}

/**
 * Tomasz Nowak z rolą Drugi rodzic w rodzinie Anny Nowak po porodzie (3.9.7.1.3 KA-05, KA-06). Konto nie ma
 * adresu do e-Doręczeń, więc rejestr stanu cywilnego zwraca 0295 przy każdym sposobie odbioru.
 */
function tomaszWRodzinieAnny(ctx: KontekstOperacji): ReturnType<ScenariuszDemo['zastosuj']> {
  const baza = rodzinaPoPorodzie(ctx, true);
  const demo = kontaPrzykladowe.find((k) => k.pesel === PESEL_TOMASZA);
  const rodzina = baza.rodzina;
  if (demo === undefined || rodzina === undefined) return baza;
  return {
    ...baza,
    konto: {
      konto: {
        ...kontoPrzewodnikaZKontaDemo(demo, ctx.teraz),
        rola: 'drugi-rodzic',
        idRodziny: rodzina.idRodziny,
        decyzjeOZgodzie: [{ rodzaj: 'udzielenie', wersjaTresci: '1.0', czas: ctx.teraz }],
      },
    },
    rodzina: {
      ...rodzina,
      daneRodziny: {
        ...rodzina.daneRodziny,
        dostepKont: [
          ...rodzina.daneRodziny.dostepKont.filter((d) => d.pesel !== PESEL_TOMASZA),
          { pesel: PESEL_TOMASZA, rola: 'drugi-rodzic', dolaczono: ctx.dzis, stan: 'aktywny' },
        ],
      },
    },
  };
}

/** Ustawienia przypomnień z KA-12 i KA-13: kanał SMS 500 100 200 i kanał e-mail anna.nowak@example.pl. */
function ustawieniaPowiadomien(ctx: KontekstOperacji): Ustawienia {
  return {
    przypomnieniaWlaczone: true,
    wyprzedzenieDni: 7,
    kanalEmail: true,
    adresEmail: 'anna.nowak@example.pl',
    adresEmailZrodlo: 'uzytkownik',
    kanalSms: true,
    numerTelefonu: '500100200',
    stanNumeru: 'potwierdzony',
    numerPotwierdzony: '500100200',
    zapisano: ctx.teraz,
  };
}

export const scenariuszeU29: readonly ScenariuszDemo[] = [
  {
    id: 'u29-odpis-po-porodzie',
    nazwa: tekst['u29-odpis-po-porodzie'].nazwa,
    opis: tekst['u29-odpis-po-porodzie'].opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => rodzinaPoPorodzie(ctx, true),
  },
  {
    id: 'u29-odpis-bez-miejsca-urodzenia',
    nazwa: tekst['u29-odpis-bez-miejsca-urodzenia'].nazwa,
    opis: tekst['u29-odpis-bez-miejsca-urodzenia'].opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => rodzinaPoPorodzie(ctx, false),
  },
  {
    id: 'u29-odpis-tomasz-bez-e-doreczen',
    nazwa: tekst['u29-odpis-tomasz-bez-e-doreczen'].nazwa,
    opis: tekst['u29-odpis-tomasz-bez-e-doreczen'].opis,
    pesel: PESEL_TOMASZA,
    zastosuj: tomaszWRodzinieAnny,
  },
  {
    id: 'u29-pytanie-k08-wyslane',
    nazwa: tekst['u29-pytanie-k08-wyslane'].nazwa,
    opis: tekst['u29-pytanie-k08-wyslane'].opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => ({
      ...profilAnny(ctx),
      zus: { korespondencja: [pytanieK08] },
      parametry: parametry('2026-11-21'),
    }),
  },
  {
    id: 'u29-pytanie-k08-odpowiedz',
    nazwa: tekst['u29-pytanie-k08-odpowiedz'].nazwa,
    opis: tekst['u29-pytanie-k08-odpowiedz'].opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => {
      const profil = profilAnny(ctx);
      return {
        ...profil,
        konto: { ...profil.konto, ustawienia: ustawieniaPowiadomien(ctx) },
        zus: {
          korespondencja: [
            {
              ...pytanieK08,
              status: 'odpowiedz',
              odpowiedz: {
                tresc: trescSymulowanejOdpowiedzi(pytanieK08, odpowiedziZus),
                czas: '2026-11-25T10:15:00',
                symulowana: true,
              },
            },
          ],
        },
        parametry: parametry('2026-11-25'),
      };
    },
  },
  {
    id: 'u29-dane-konta-kopia-nieaktualna',
    nazwa: tekst['u29-dane-konta-kopia-nieaktualna'].nazwa,
    opis: tekst['u29-dane-konta-kopia-nieaktualna'].opis,
    pesel: PESEL_ANNY,
    zastosuj: (ctx) => {
      const profil = profilAnny(ctx);
      const konto = kontoZKopia(profil.konto);
      return {
        ...profil,
        ...(konto ? { konto } : {}),
        parametry: parametry('2026-11-21', {
          daneZusNiedostepne: true,
          pueEzusNiedostepne: true,
        }),
      };
    },
  },
];
