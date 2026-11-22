// Hooki magazynu (kontrakt, sekcje 1.1 pkt 3, 1.2 i 6.4).
//
// Każdy hook wywołuje use(browser()) z react-dom 19.3: podczas prerenderu i renderowania na serwerze
// komponent zawiesza się do najbliższej granicy <Suspense>, której zastępstwo trafia do HTML,
// a w przeglądarce browser() nie zawiesza i komponent renderuje się od razu z danymi magazynu.
// Dzięki temu HTML z serwera zawiera wyłącznie szkielet i nie powstaje rozjazd hydracji.
// Hooki czasu dodatkowo wywołują use(io()) z next/cache przed odczytem zegara.
//
// Dane czytamy przez useSyncExternalStore z pamięci podręcznej rdzenia, więc migawki mają stabilne
// referencje. Hooki zwracają całe obiekty; widok wylicza pochodne przez useMemo.
import { io } from 'next/cache';
import { use, useCallback, useMemo, useSyncExternalStore } from 'react';
import { browser } from 'react-dom';
import { stanZgody } from '@/domena/konto/kierowanie';
import type {
  DaneDrugiegoRodzicaZKonta,
  DaneZKontaZus,
  DataISO,
  Katalog,
  KontoDemo,
  KontoPrzewodnika,
  LogowanieWToku,
  ParametrySystemu,
  Pesel,
  Rola,
  Sesja,
  StanGlobalny,
  StanInterfejsu,
  StanKonta,
  StanRodziny,
  StanSesji,
  StanSymulowanegoZus,
  StanZgody,
  WynikiKalkulacji,
  ZnacznikCzasu,
} from '@/domena/typy';
import { zainstalujObslugeKartyGoscia } from '@/dane/magazyn/gosc';
import { KLUCZ_LOGOWANIE } from '@/dane/magazyn/klucze';
import { odczytaj, subskrybuj } from '@/dane/magazyn/rdzen';
import {
  czyKontoMaDostep,
  daneZusDrugiegoRodzica,
  katalogZEdycji,
  odczytajGlobalne,
  odczytajKatalog,
  odczytajSesje,
  odczytajStanInterfejsu,
  odczytajStanKonta,
  odczytajStanZus,
  odczytajZalogowanego,
  osobyRodziny,
  rodzinaKonta,
  stanGlobalnyNaSerwer,
  stanInterfejsuNaSerwer,
  wszystkieKontaDemo,
} from '@/dane/magazyn/stan';
import {
  czyGosc,
  odczytajStanSesjiWlasciciela,
  odczytajWlasciciela,
  odczytajWynikiKalkulacjiWlasciciela,
  odczytajZakresWynikowKalkulacji,
  wynikiKalkulacjiBrak,
  type WlascicielDanych,
  type ZakresWynikowKalkulacji,
} from '@/dane/magazyn/wlasciciel';
import { migawkaZegara, subskrybujZegar, type DokladnoscZegara } from '@/dane/magazyn/zegar';

export type { DokladnoscZegara } from '@/dane/magazyn/zegar';
export type { WlascicielDanych, ZakresWynikowKalkulacji } from '@/dane/magazyn/wlasciciel';

export interface KontekstRodziny {
  konto: KontoPrzewodnika;
  rola: Rola;
  stanZgody: StanZgody;
  rodzina: StanRodziny;
  katalog: Katalog;
  daneZusKonta: DaneZKontaZus | null;
  daneZusMatki: DaneZKontaZus | null;
  daneZusDrugiegoRodzica: DaneZKontaZus | DaneDrugiegoRodzicaZKonta | null;
  dzis: DataISO;
  teraz: ZnacznikCzasu;
}

const POWOD_PRZEGLADARKI = 'Dane przewodnika żyją w magazynie przeglądarki, więc widok renderuje się w przeglądarce.';

function brak(): null {
  return null;
}

/** Subskrypcja magazynu; pierwsza subskrypcja w karcie instaluje też obsługę zamknięcia karty gościa. */
function subskrybujMagazyn(sluchacz: () => void): () => void {
  zainstalujObslugeKartyGoscia();
  return subskrybuj(sluchacz);
}

/** Wspólny początek hooków: zawieszenie podczas prerenderu i subskrypcja magazynu. */
function useMigawkaMagazynu<T>(migawka: () => T, migawkaSerwera: () => T): T {
  use(browser(POWOD_PRZEGLADARKI));
  return useSyncExternalStore(subskrybujMagazyn, migawka, migawkaSerwera);
}

// --- Migawki -----------------------------------------------------------------------------------

function migawkaParametrow(): ParametrySystemu {
  return odczytajGlobalne().parametry;
}

function migawkaParametrowSerwera(): ParametrySystemu {
  return stanGlobalnyNaSerwer().parametry;
}

/** Stan sesji konta albo stan sesji gościa (tryb gościa). */
function migawkaStanuSesji(): StanSesji | null {
  return odczytajStanSesjiWlasciciela();
}

function migawkaStanuKonta(): StanKonta | null {
  return odczytajZalogowanego()?.stanKonta ?? null;
}

function migawkaKonta(): KontoPrzewodnika | null {
  return migawkaStanuKonta()?.konto ?? null;
}

function migawkaRodziny(): StanRodziny | null {
  return rodzinaKonta(migawkaKonta());
}

function migawkaKatalogu(): Katalog {
  return odczytajKatalog();
}

function migawkaKataloguSerwera(): Katalog {
  return katalogZEdycji(stanGlobalnyNaSerwer().edycjeKatalogu);
}

/** Konto osoby z rodziny zalogowanego konta (izolacja: wyłącznie konta z aktywnym dostępem). */
function migawkaKontaOsoby(pesel: Pesel | undefined): StanKonta | null {
  if (pesel === undefined) return null;
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return null;
  if (zalogowany.sesja.pesel === pesel) return zalogowany.stanKonta;
  const rodzina = rodzinaKonta(zalogowany.stanKonta.konto);
  if (rodzina === null || !czyKontoMaDostep(rodzina.daneRodziny, pesel)) return null;
  return odczytajStanKonta(pesel);
}

function czyTrybDemo(): boolean {
  return odczytajGlobalne().parametry.trybDemonstracyjny;
}

/** Stan symulowanego ZUS: własne konto, konto z rodziny albo dowolne konto w trybie demonstracyjnym. */
function migawkaStanuZus(pesel: Pesel | undefined): StanSymulowanegoZus | null {
  if (pesel === undefined) return null;
  if (czyTrybDemo() || migawkaKontaOsoby(pesel) !== null) return odczytajStanZus(pesel);
  return null;
}

let ostatnieNoweKonta: StanGlobalny['noweKontaDemo'] | null = null;
let ostatnieKontaDemo: KontoDemo[] = [];

function migawkaKontDemo(): KontoDemo[] {
  const globalne = odczytajGlobalne();
  if (ostatnieNoweKonta !== globalne.noweKontaDemo) {
    ostatnieNoweKonta = globalne.noweKontaDemo;
    ostatnieKontaDemo = wszystkieKontaDemo(globalne);
  }
  return ostatnieKontaDemo;
}

const KONTA_DEMO_SERWERA: KontoDemo[] = wszystkieKontaDemo(stanGlobalnyNaSerwer());

function migawkaKontDemoSerwera(): KontoDemo[] {
  return KONTA_DEMO_SERWERA;
}

function migawkaLogowania(): LogowanieWToku | null {
  return odczytaj<LogowanieWToku>(KLUCZ_LOGOWANIE, 'sessionStorage');
}

// --- Hooki z sekcji 6.4 ------------------------------------------------------------------------

export function useGlobalne(): StanGlobalny {
  return useMigawkaMagazynu(odczytajGlobalne, stanGlobalnyNaSerwer);
}

export function useParametry(): ParametrySystemu {
  return useMigawkaMagazynu(migawkaParametrow, migawkaParametrowSerwera);
}

export function useSesja(): Sesja | null {
  return useMigawkaMagazynu(odczytajSesje, brak);
}

/**
 * Stan sesji: dane sesji zalogowanego konta albo stan sesji gościa. Null przed pierwszym zapisem gościa
 * i bez sesji.
 */
export function useStanSesji(): StanSesji | null {
  return useMigawkaMagazynu(migawkaStanuSesji, brak);
}

/** Stan zalogowanego konta. */
export function useStanKonta(): StanKonta | null {
  return useMigawkaMagazynu(migawkaStanuKonta, brak);
}

export function useKonto(): KontoPrzewodnika | null {
  return useMigawkaMagazynu(migawkaKonta, brak);
}

/** Rodzina zalogowanego konta; null bez rodziny, przy ukrytej rodzinie i bez aktywnego dostępu. */
export function useRodzina(): StanRodziny | null {
  return useMigawkaMagazynu(migawkaRodziny, brak);
}

/** Konto osoby z rodziny zalogowanego konta (np. drugiego rodzica); null dla kont spoza rodziny. */
export function useStanKontaOsoby(pesel: Pesel | undefined): StanKonta | null {
  const migawka = useCallback(() => migawkaKontaOsoby(pesel), [pesel]);
  return useMigawkaMagazynu(migawka, brak);
}

/** Katalog świadczeń: seed z dane/katalog złożony z edycjami Administratora. */
export function useKatalog(): Katalog {
  return useMigawkaMagazynu(migawkaKatalogu, migawkaKataloguSerwera);
}

export function useStanSymulowanegoZus(pesel: Pesel | undefined): StanSymulowanegoZus | null {
  const migawka = useCallback(() => migawkaStanuZus(pesel), [pesel]);
  return useMigawkaMagazynu(migawka, brak);
}

const subskrypcjeZegara: Record<DokladnoscZegara, (sluchacz: () => void) => () => void> = {
  minuta: (sluchacz) => subskrybujZegar('minuta', sluchacz),
  sekunda: (sluchacz) => subskrybujZegar('sekunda', sluchacz),
};

const migawkiDnia: Record<DokladnoscZegara, () => DataISO> = {
  minuta: () => migawkaZegara('minuta').dzis,
  sekunda: () => migawkaZegara('sekunda').dzis,
};

const migawkiChwili: Record<DokladnoscZegara, () => ZnacznikCzasu> = {
  minuta: () => migawkaZegara('minuta').teraz,
  sekunda: () => migawkaZegara('sekunda').teraz,
};

/** Dzisiejsza data (Europe/Warsaw albo dataDemo); zmienia się o północy i po zmianie dataDemo. */
export function useDzis(): DataISO {
  use(browser(POWOD_PRZEGLADARKI));
  use(io());
  return useSyncExternalStore(subskrypcjeZegara.minuta, migawkiDnia.minuta, migawkiDnia.minuta);
}

/**
 * Bieżąca chwila (Europe/Warsaw, z dataDemo). Domyślnie odświeża się co minutę; odliczanie
 * (np. ważność kodu mZUS) przekazuje dokładność 'sekunda'.
 */
export function useTeraz(dokladnosc: DokladnoscZegara = 'minuta'): ZnacznikCzasu {
  use(browser(POWOD_PRZEGLADARKI));
  use(io());
  return useSyncExternalStore(subskrypcjeZegara[dokladnosc], migawkiChwili[dokladnosc], migawkiChwili[dokladnosc]);
}

/** Skrót dla widoków planu: konto, rola, zgoda, rodzina, katalog, dane ZUS rodziców i czas. */
export function useKontekstRodziny(): KontekstRodziny | null {
  const stanKonta = useStanKonta();
  const rodzina = useRodzina();
  const osoby = useMemo(() => (rodzina === null ? null : osobyRodziny(rodzina.daneRodziny)), [rodzina]);
  const stanMatki = useStanKontaOsoby(osoby?.peselMatki);
  const stanDrugiegoRodzica = useStanKontaOsoby(osoby?.peselDrugiegoRodzica);
  const katalog = useKatalog();
  const dzis = useDzis();
  const teraz = useTeraz();

  return useMemo(() => {
    if (stanKonta === null || rodzina === null) return null;
    const konto = stanKonta.konto;
    return {
      konto,
      rola: konto.rola,
      stanZgody: stanZgody(konto.decyzjeOZgodzie),
      rodzina,
      katalog,
      daneZusKonta: stanKonta.kopiaDanychZus,
      daneZusMatki: stanMatki?.kopiaDanychZus ?? null,
      daneZusDrugiegoRodzica: daneZusDrugiegoRodzica(rodzina, stanDrugiegoRodzica, stanMatki),
      dzis,
      teraz,
    };
  }, [stanKonta, rodzina, stanMatki, stanDrugiegoRodzica, katalog, dzis, teraz]);
}

// --- Tryb gościa ---------------------------------------------------------------------------------

function falsz(): boolean {
  return false;
}

/** Karta bez zalogowanego konta: kalkulator zasiłku i przykładowe sprawy w trybie gościa. */
export function useCzyGosc(): boolean {
  return useMigawkaMagazynu(czyGosc, falsz);
}

/**
 * Właściciel danych sesji i kalkulatora: konto (PESEL, idSesji, rola) albo gość ('gosc:<id>', idSesji gościa).
 * Null dla gościa przed pierwszym zapisem; sesję gościa zakłada pierwsza operacja.
 */
export function useWlascicielDanych(): WlascicielDanych | null {
  return useMigawkaMagazynu(odczytajWlasciciela, brak);
}

/**
 * Wyniki kalkulacji, które pokazuje kalkulator: rodziny (Rodzic i Drugi rodzic z planem), konta (Nowy użytkownik
 * i konto bez rodziny) albo gościa. Bez zapisów puste wyniki.
 */
export function useWynikiKalkulacji(): WynikiKalkulacji {
  return useMigawkaMagazynu(odczytajWynikiKalkulacjiWlasciciela, wynikiKalkulacjiBrak);
}

function zakresGoscia(): ZakresWynikowKalkulacji {
  return 'gosc';
}

/** Zakres wyników z useWynikiKalkulacji: 'rodzina', 'konto' albo 'gosc'. */
export function useZakresWynikowKalkulacji(): ZakresWynikowKalkulacji {
  return useMigawkaMagazynu(odczytajZakresWynikowKalkulacji, zakresGoscia);
}

// --- Hooki uzupełniające -----------------------------------------------------------------------

/** Wygoda widoku zapisana pod ppm:v1:ui (zwinięcie menu bocznego); zapis: ustawStanInterfejsu. */
export function useStanInterfejsu(): StanInterfejsu {
  return useMigawkaMagazynu(odczytajStanInterfejsu, stanInterfejsuNaSerwer);
}

/** Konta przykładowe i nowe konta demonstracyjne w kolejności listy ViewDemoAccountPicker. */
export function useKontaDemo(): KontoDemo[] {
  return useMigawkaMagazynu(migawkaKontDemo, migawkaKontDemoSerwera);
}

/** Logowanie w toku zapisane przez ViewGuideStart w sessionStorage (sekcja 3.5). */
export function useLogowanieWToku(): LogowanieWToku | null {
  return useMigawkaMagazynu(migawkaLogowania, brak);
}

/**
 * Stan dowolnego konta przewodnika na ekranach prototypu (ViewDemoAccountPicker, ViewDemoInbox).
 * Działa wyłącznie przy włączonym trybie demonstracyjnym; poza nim zwraca null.
 */
export function useStanKontaWTrybieDemo(pesel: Pesel | undefined): StanKonta | null {
  const migawka = useCallback(
    () => (pesel !== undefined && czyTrybDemo() ? odczytajStanKonta(pesel) : null),
    [pesel],
  );
  return useMigawkaMagazynu(migawka, brak);
}
