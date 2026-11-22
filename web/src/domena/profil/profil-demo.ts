// Szkic Profilu na start z danymi przykładowymi dla symulacji uzupełnienia profilu w trybie demonstracyjnym
// (ViewDemoAccountPicker). Szkic odpowiada odpowiedziom rodzica, który przeszedł cały kreator profilu: forma
// zatrudnienia, dobrowolne ubezpieczenie chorobowe i płatnik zasiłku z kopii Danych z konta ZUS, sytuacja
// „spodziewam się dziecka”, termin porodu za 120 dni, jedno dziecko, zatrudnienie bez zmian w ciąży, małżeństwo,
// gmina i dochód przykładowy oraz drugi rodzic na umowie o pracę. Konto kobiety jest matką dziecka, a konto
// mężczyzny drugim rodzicem. Funkcje są czyste: datę, czas i gminę dostają od wywołującego. Właściciel: u01.
import { dodajDni } from '@/domena/daty';
import {
  czyPytacODobrowolne,
  formaPoWyborze,
  proponujFormeZatrudnienia,
  tytulDlaFormy,
} from '@/domena/profil/forma-zatrudnienia';
import { platnikZOdpowiedzi, ustalPlatnikaZasilku } from '@/domena/profil/platnik';
import type {
  DaneRodzica,
  DaneZKontaZus,
  DataISO,
  DrugiRodzic,
  Gmina,
  Grosze,
  Plec,
  SzkicProfilu,
  ZnacznikCzasu,
} from '@/domena/typy';

/** Przewidywany termin porodu w symulacji: 120 dni po dniu demonstracyjnym. */
export const DNI_DO_TERMINU_PORODU_W_SYMULACJI = 120;
/** Pierwsza wizyta u lekarza w 8. tygodniu ciąży: 224 dni przed terminem porodu. */
const DNI_OD_PIERWSZEJ_WIZYTY_DO_TERMINU = 224;
/** Przykładowy dochód rodziny na osobę: 2500 zł. */
const DOCHOD_NA_OSOBE: Grosze = 250_000;

const ODPOWIEDZ = 'odpowiedz-rodzica' as const;

/**
 * Dane rodzica konta z kopii Danych z konta ZUS tak, jak zapisuje je kreator po zaakceptowaniu propozycji:
 * forma i dobrowolne ubezpieczenie chorobowe ze źródłem konto ZUS, płatnik zasiłku z tytułu ubezpieczenia,
 * a przy płatniku, o którego kreator pyta, odpowiedź „tak” (zasiłek wypłaca płatnik składek).
 */
export function daneRodzicaZKopii(kopia: DaneZKontaZus | null): DaneRodzica {
  const propozycja = kopia === null ? null : proponujFormeZatrudnienia(kopia);
  const wybrana = propozycja?.forma ?? 'brak-tytulu';
  const forma = formaPoWyborze(wybrana, propozycja);
  const dobrowolne = czyPytacODobrowolne(wybrana)
    ? propozycja?.dobrowolne != null
      ? { wartosc: propozycja.dobrowolne, zrodlo: forma.zrodlo }
      : { wartosc: false, zrodlo: ODPOWIEDZ }
    : null;
  const ustalenie = ustalPlatnikaZasilku(
    wybrana,
    tytulDlaFormy(kopia, wybrana),
    forma.zrodlo,
    propozycja?.tytulyZakonczone ?? [],
  );
  const platnikZasilku =
    'pytaj' in ustalenie
      ? {
          wartosc: platnikZOdpowiedzi('tak'),
          zrodlo: ODPOWIEDZ,
          ...(ustalenie.nazwaPlatnika ? { nazwaPlatnika: ustalenie.nazwaPlatnika } : {}),
        }
      : { wartosc: ustalenie.platnik, zrodlo: ustalenie.zrodlo, ...(ustalenie.nazwa ? { nazwaPlatnika: ustalenie.nazwa } : {}) };
  return {
    formaZatrudnienia: forma,
    dobrowolneChorobowe: dobrowolne,
    platnikZasilku,
    zmianaZatrudnienia: { rodzaj: { wartosc: 'bez-zmian', zrodlo: ODPOWIEDZ } },
    potwierdzeniaSkladek: [],
  };
}

/** Przykładowy rodzic spoza konta: umowa o pracę, zasiłek wypłaca płatnik składek. */
function rodzicPrzykladowy(): DaneRodzica {
  return {
    formaZatrudnienia: { wartosc: 'umowa-o-prace', zrodlo: ODPOWIEDZ },
    dobrowolneChorobowe: null,
    platnikZasilku: { wartosc: 'platnik-skladek', zrodlo: ODPOWIEDZ },
    potwierdzeniaSkladek: [],
  };
}

export interface WejscieSzkicuDemo {
  kopia: DaneZKontaZus | null;
  plec: Plec;
  gmina: Gmina;
  dzis: DataISO;
  teraz: ZnacznikCzasu;
}

/** Szkic Profilu na start z danymi przykładowymi, gotowy do zapisu przez zbudujProfilZeSzkicu. */
export function szkicProfiluDemo({ kopia, plec, gmina, dzis, teraz }: WejscieSzkicuDemo): SzkicProfilu {
  const termin = dodajDni(dzis, DNI_DO_TERMINU_PORODU_W_SYMULACJI);
  const rodzicKonta = daneRodzicaZKopii(kopia);
  const matka = plec === 'kobieta' ? rodzicKonta : rodzicPrzykladowy();
  const drugiRodzic: DrugiRodzic = plec === 'kobieta' ? rodzicPrzykladowy() : rodzicKonta;
  return {
    kontekst: 'start',
    powrotNaPodsumowanie: false,
    ostatniEkran: 'ViewProfileSummary',
    daneRodziny: {
      sytuacja: { wartosc: 'oczekiwanie', zrodlo: ODPOWIEDZ },
      rodzicKonta: plec === 'kobieta' ? 'matka' : 'drugi-rodzic',
      matka,
      drugiRodzic,
      stanCywilny: { wartosc: 'malzenstwo', zrodlo: ODPOWIEDZ },
      gmina: { wartosc: gmina, zrodlo: ODPOWIEDZ },
      dochodNaOsobe: { wartosc: DOCHOD_NA_OSOBE, zrodlo: ODPOWIEDZ },
    },
    daneCiazy: {
      przewidywanyTerminPorodu: termin,
      liczbaDzieciZCiazy: 1,
      dataPierwszejWizyty: dodajDni(termin, -DNI_OD_PIERWSZEJ_WIZYTY_DO_TERMINU),
    },
    zmienionePola: [],
    utworzono: teraz,
    zaktualizowano: teraz,
  };
}
