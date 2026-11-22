// Sesja gościa: kalkulator zasiłku i przykładowe sprawy bez logowania (tryb gościa).
//
// Sesja gościa żyje w sessionStorage karty pod ppm:v1:gosc (SesjaGoscia), stan sesji gościa (StanSesji) pod
// ppm:v1:gosc-sesja:<idSesjiGoscia>, a wyniki kalkulacji gościa (WynikiKalkulacji) pod
// ppm:v1:gosc-kalkulacje:<idSesjiGoscia>. Kształty danych są te same co w sesji konta i w Wynikach kalkulacji konta.
//
// Pliki gościa w IndexedDB mają właściciela 'gosc:<idSesjiGoscia>' i idSesji = idSesjiGoscia. Pliki znikają:
// - po zamknięciu karty gościa: zdarzenie pagehide zapisuje znacznik w localStorage (ppm:v1:goscie-zamknieci),
//   a sprzatnijPoGosciach w dowolnej karcie usuwa pliki sesji oznaczonej co najmniej minutę wcześniej;
//   ponowne wczytanie albo powrót do karty (pageshow) zdejmuje znacznik, więc pliki zostają;
// - po 24 godzinach od wgrania (pole wygasa rekordu pliku);
// - przy zalogowaniu przechodzą do konta i sesji konta (operacje/gosc.ts).
import type { KontekstOperacji, StanSesji, WynikiKalkulacji, ZnacznikCzasu } from '@/domena/typy';
import {
  KLUCZ_GOSC,
  KLUCZ_GOSCIE_ZAMKNIECI,
  PRZEDROSTEK_KALKULACJI_GOSCIA,
  PRZEDROSTEK_STANU_SESJI_GOSCIA,
  kluczKalkulacjiGoscia,
  kluczStanuSesjiGoscia,
} from '@/dane/magazyn/klucze';
import { losowyUuid } from '@/dane/magazyn/losowanie';
import { usunPlikiSesji, usunPlikiWygasle } from '@/dane/magazyn/pliki';
import {
  czyPrzegladarka,
  kluczeZPrzedrostkiem,
  odczytaj,
  usunSystemowe,
  zapisz,
  zapiszSystemowe,
} from '@/dane/magazyn/rdzen';
import { stanSesjiPoczatkowy, wynikiKalkulacjiPuste } from '@/dane/magazyn/stan-poczatkowy';
import { chwilaRzeczywistaMs } from '@/dane/magazyn/zegar';

/** Sesja gościa tej karty (sessionStorage ppm:v1:gosc). */
export interface SesjaGoscia {
  idSesjiGoscia: string;
  poczatek: ZnacznikCzasu;
}

/** Stan gościa do przeniesienia przy zalogowaniu. */
export interface StanGoscia {
  sesja: SesjaGoscia;
  stanSesji: StanSesji | null;
  wynikiKalkulacji: WynikiKalkulacji | null;
}

// --- Sesja gościa ------------------------------------------------------------------------------

export function odczytajSesjeGoscia(): SesjaGoscia | null {
  return odczytaj<SesjaGoscia>(KLUCZ_GOSC, 'sessionStorage');
}

/** Usuwa dane gościa z sessionStorage tej karty (sesja, stan sesji i wyniki kalkulacji). */
export function usunSesjeGoscia(): void {
  usunSystemowe(KLUCZ_GOSC, 'sessionStorage');
  for (const przedrostek of [PRZEDROSTEK_STANU_SESJI_GOSCIA, PRZEDROSTEK_KALKULACJI_GOSCIA]) {
    for (const klucz of kluczeZPrzedrostkiem(przedrostek, 'sessionStorage')) usunSystemowe(klucz, 'sessionStorage');
  }
}

/**
 * Sesja gościa tej karty. Bez niej zakłada nową sesję ze stanem początkowym (zapis systemowy), więc wywołuj ją
 * w operacji, w obsłudze zdarzenia.
 */
export function zapewnijSesjeGoscia(ctx: KontekstOperacji): SesjaGoscia {
  const istniejaca = odczytajSesjeGoscia();
  if (istniejaca !== null) return istniejaca;
  usunSesjeGoscia();
  const sesja: SesjaGoscia = { idSesjiGoscia: losowyUuid(), poczatek: ctx.teraz };
  zapiszSystemowe(KLUCZ_GOSC, sesja, 'sessionStorage');
  zapiszSystemowe(kluczStanuSesjiGoscia(sesja.idSesjiGoscia), stanSesjiPoczatkowy(), 'sessionStorage');
  return sesja;
}

/** Stan gościa tej karty albo null bez sesji gościa. */
export function odczytajStanGoscia(): StanGoscia | null {
  const sesja = odczytajSesjeGoscia();
  if (sesja === null) return null;
  return {
    sesja,
    stanSesji: odczytajStanSesjiGoscia(sesja.idSesjiGoscia),
    wynikiKalkulacji: odczytajWynikiKalkulacjiGoscia(sesja.idSesjiGoscia),
  };
}

// --- Stan sesji i wyniki kalkulacji gościa ------------------------------------------------------

export function odczytajStanSesjiGoscia(idSesjiGoscia: string): StanSesji | null {
  return odczytaj<StanSesji>(kluczStanuSesjiGoscia(idSesjiGoscia), 'sessionStorage');
}

/** Zmienia stan sesji gościa (zapis systemowy, jak dane sesji konta). */
export function zmienStanSesjiGoscia(idSesjiGoscia: string, fn: (stan: StanSesji) => StanSesji): StanSesji {
  const nowy = fn(odczytajStanSesjiGoscia(idSesjiGoscia) ?? stanSesjiPoczatkowy());
  zapiszSystemowe(kluczStanuSesjiGoscia(idSesjiGoscia), nowy, 'sessionStorage');
  return nowy;
}

export function odczytajWynikiKalkulacjiGoscia(idSesjiGoscia: string): WynikiKalkulacji | null {
  return odczytaj<WynikiKalkulacji>(kluczKalkulacjiGoscia(idSesjiGoscia), 'sessionStorage');
}

/** Zmienia wyniki kalkulacji gościa (zapis domenowy: podlega symulacji błędu zapisu, kod 0003). */
export function zmienWynikiKalkulacjiGoscia(
  idSesjiGoscia: string,
  fn: (wyniki: WynikiKalkulacji) => WynikiKalkulacji,
): WynikiKalkulacji {
  const nowe = fn(odczytajWynikiKalkulacjiGoscia(idSesjiGoscia) ?? wynikiKalkulacjiPuste());
  zapisz(kluczKalkulacjiGoscia(idSesjiGoscia), nowe, 'domenowe', 'sessionStorage');
  return nowe;
}

// --- Zamknięcie karty gościa i sprzątanie plików ---------------------------------------------------

/** Minimalny czas od zamknięcia karty do usunięcia plików: ponowne wczytanie karty zdąży zdjąć znacznik. */
const CZAS_DO_SPRZATANIA_MS = 60_000;

type ZamknieteKarty = Readonly<Record<string, number>>;

function odczytajZamkniete(): ZamknieteKarty {
  return odczytaj<ZamknieteKarty>(KLUCZ_GOSCIE_ZAMKNIECI) ?? {};
}

function zapiszZamkniete(zamkniete: ZamknieteKarty): void {
  if (Object.keys(zamkniete).length === 0) usunSystemowe(KLUCZ_GOSCIE_ZAMKNIECI);
  else zapiszSystemowe(KLUCZ_GOSCIE_ZAMKNIECI, zamkniete);
}

function oznaczZamkniecieKarty(): void {
  const sesja = odczytajSesjeGoscia();
  if (sesja === null) return;
  try {
    zapiszZamkniete({ ...odczytajZamkniete(), [sesja.idSesjiGoscia]: chwilaRzeczywistaMs() });
  } catch {
    // Zamykana karta nie pokazuje błędu; pliki usunie termin 24 godzin.
  }
}

function odznaczZamkniecieKarty(): void {
  const sesja = odczytajSesjeGoscia();
  if (sesja === null) return;
  const zamkniete = odczytajZamkniete();
  if (!(sesja.idSesjiGoscia in zamkniete)) return;
  try {
    zapiszZamkniete(Object.fromEntries(Object.entries(zamkniete).filter(([id]) => id !== sesja.idSesjiGoscia)));
  } catch {
    // Znacznik zostaje; pliki tej karty mogą zniknąć wcześniej, dane w sessionStorage zostają.
  }
}

let obslugaKartyZainstalowana = false;

/**
 * Obsługa zamknięcia karty gościa: pagehide oznacza sesję gościa jako zamkniętą, a wczytanie i pageshow zdejmują
 * znacznik tej karty. Hooki magazynu instalują ją przy pierwszej subskrypcji.
 */
export function zainstalujObslugeKartyGoscia(): void {
  if (obslugaKartyZainstalowana || !czyPrzegladarka()) return;
  obslugaKartyZainstalowana = true;
  odznaczZamkniecieKarty();
  window.addEventListener('pagehide', oznaczZamkniecieKarty);
  window.addEventListener('pageshow', odznaczZamkniecieKarty);
}

/**
 * Sprzątanie po gościach: usuwa pliki sesji gościa kart zamkniętych co najmniej minutę temu i pliki po terminie
 * ważności (24 godziny od wgrania). Rama wywołuje je po otwarciu, a logowanie po zalogowaniu.
 */
export async function sprzatnijPoGosciach(ctx: KontekstOperacji): Promise<void> {
  const teraz = chwilaRzeczywistaMs();
  const wlasna = odczytajSesjeGoscia()?.idSesjiGoscia;
  const zamkniete = odczytajZamkniete();
  const doUsuniecia = Object.entries(zamkniete)
    .filter(([id, chwila]) => id !== wlasna && teraz - chwila >= CZAS_DO_SPRZATANIA_MS)
    .map(([id]) => id);
  if (doUsuniecia.length > 0) {
    try {
      zapiszZamkniete(Object.fromEntries(Object.entries(zamkniete).filter(([id]) => !doUsuniecia.includes(id))));
    } catch {
      // Znaczniki zostaną usunięte przy kolejnym sprzątaniu.
    }
    await Promise.all(doUsuniecia.map((id) => usunPlikiSesji(id)));
  }
  await usunPlikiWygasle(ctx.teraz);
}
