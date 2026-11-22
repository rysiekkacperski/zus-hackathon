// Edycje Katalogu świadczeń przez Administratora (kontrakt, sekcja 6.5). Właściciel: u06 (Panel Administratora katalogu).
// Każda operacja zapisuje jedną zmianę katalogu (ZmianaKatalogu) w kopii lokalnej StanGlobalny.edycjeKatalogu
// i w kolejce wysyłki, a po zakończeniu operacji kolejka trafia do usługi REST /api/katalog, która przechowuje
// edycje wspólne dla wszystkich użytkowników (dane/magazyn/katalog-serwer.ts). Każdy zapis zwiększa wersję
// katalogu, a SynchronizacjaRodziny przelicza plany rodzin przy najbliższym otwarciu przewodnika.
import {
  FORMY_ZATRUDNIENIA,
  czyWpisEdytowalny,
  nastepnyIdentyfikator,
  nowaWersja,
  walidujNowaPozycje,
  walidujNowaWersje,
  zbudujPozycje,
  type FormularzNowejPozycji,
} from '@/domena/katalog/edycja';
import {
  dokumentZFormularza,
  nowyWpisSlownika,
  walidujDokument,
  walidujNowyWpis,
  walidujZmianePozycji,
  zmianyPolPozycji,
  type FormularzDokumentu,
  type FormularzNowegoWpisu,
  type FormularzZmianyPozycji,
} from '@/domena/katalog/edycja-panelu';
import type {
  IdPozycji,
  IdWpisuSlownika,
  KodKomunikatu,
  KontekstOperacji,
  WynikOperacji,
} from '@/domena/typy';
import { zapiszZmianeKatalogu, zaplanujWysylkeKatalogu } from '@/dane/magazyn/katalog-serwer';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { odczytajKatalog, odczytajZalogowanego, wykonajOperacjeZWynikiem } from '@/dane/magazyn/stan';
import { teksty } from '@/teksty';

/** Parametry komunikatu po przejściu 0051 i 0082: kotwica wiersza zmienionego wpisu albo nowej pozycji. */
export const PARAMETR_KOTWICY = 'kotwica';
export const PARAMETR_RODZAJU_ZMIANY = 'rodzajZmiany';

export function kotwicaWpisu(idWpisu: IdWpisuSlownika): string {
  return `w-${idWpisu}`;
}

export function kotwicaPozycji(id: IdPozycji): string {
  return id.toLowerCase();
}

export function kotwicaDokumentu(id: string): string {
  return `d-${id}`;
}

/** Opis warunku nowej pozycji w kolumnie Warunek katalogu, złożony z pól strukturalnych. */
function opisWarunku(formularz: FormularzNowejPozycji): string {
  const t = teksty.ViewCatalogItemAdd.opisWarunku;
  const etykiety = teksty.ViewCatalogList.etykiety;
  const formy = FORMY_ZATRUDNIENIA.filter((f) => formularz.formyZatrudnienia.includes(f)).map(
    (f) => etykiety.formyZatrudnienia[f],
  );
  return [
    t.formy({ lista: formy.join(', ') }),
    t.ubezpieczenie[formularz.ubezpieczenieChorobowe],
    formularz.etap === 'ciaza' ? t.dzieckoNieUrodzilo : t.dzieckoUrodzilo,
  ].join(' ');
}

function pierwszyBlad(bledy: Record<string, KodKomunikatu | undefined>): KodKomunikatu | null {
  for (const kod of Object.values(bledy)) if (kod) return kod;
  return null;
}

/** Zapisuje w katalogu wyłącznie konto z rolą Administrator (0047). */
function peselAdministratora(): string | null {
  const zalogowany = odczytajZalogowanego();
  return zalogowany?.stanKonta.konto.rola === 'administrator' ? zalogowany.stanKonta.konto.pesel : null;
}

/** Wykonuje operację zapisu zmiany katalogu, a po udanym zapisie wysyła kolejkę zmian do usługi /api/katalog. */
function wykonajZmianeKatalogu<T>(fn: () => WynikOperacji<T>): WynikOperacji<T> {
  const wynik = wykonajOperacjeZWynikiem<T>(fn);
  if (wynik.ok) zaplanujWysylkeKatalogu();
  return wynik;
}

/** Komunikat 0051 dla ViewCatalogList z odnośnikiem do zmienionego wiersza. */
function komunikatZmiany(kotwica: string, rodzajZmiany: string): void {
  ustawKomunikatPoPrzejsciu({
    kod: '0051',
    dlaWidoku: 'ViewCatalogList',
    parametry: { [PARAMETR_KOTWICY]: kotwica, [PARAMETR_RODZAJU_ZMIANY]: rodzajZmiany },
  });
}

/**
 * Nowa wersja wartości wpisu od dnia `od` (format DD.MM.RRRR); poprzednia wersja przestaje obowiązywać
 * dzień wcześniej i zostaje w historii. Zwiększa edycjeKatalogu.wersja i ustawia komunikat 0051 dla ViewCatalogList.
 */
export function dopiszWartosc(
  idWpisu: IdWpisuSlownika,
  wartosci: Record<string, string>,
  od: string,
  ctx: KontekstOperacji,
): WynikOperacji {
  return wykonajZmianeKatalogu<void>(() => {
    const pesel = peselAdministratora();
    if (pesel === null) return { ok: false, kod: '0047' };
    const wpis = odczytajKatalog().slowniki.find((w) => w.id === idWpisu);
    if (wpis === undefined || !czyWpisEdytowalny(wpis)) return { ok: false, kod: '0047' };

    const bledy = walidujNowaWersje(wpis, wartosci, od, ctx.dzis);
    const kod = pierwszyBlad(bledy);
    if (kod !== null) return { ok: false, kod, bledyPol: bledy as Record<string, KodKomunikatu> };

    const { nowa } = nowaWersja(wpis, wartosci, od, pesel, ctx.teraz);
    zapiszZmianeKatalogu({ rodzaj: 'nowa-wersja', idWpisu, wersja: nowa });
    komunikatZmiany(kotwicaWpisu(idWpisu), idWpisu);
    return { ok: true, wartosc: undefined };
  });
}

/**
 * Nowa pozycja katalogu z kolejnym wolnym identyfikatorem i warunkiem etapu wyprowadzonym z etapu.
 * Zwiększa edycjeKatalogu.wersja, więc plany rodzin uwzględnią pozycję przy najbliższym wyliczeniu,
 * i ustawia komunikat 0082 dla ViewCatalogList.
 */
export function dodajPozycje(formularz: FormularzNowejPozycji, ctx: KontekstOperacji): WynikOperacji<{ id: IdPozycji }> {
  return wykonajZmianeKatalogu<{ id: IdPozycji }>(() => {
    const pesel = peselAdministratora();
    if (pesel === null) return { ok: false, kod: '0047' };
    const katalog = odczytajKatalog();

    const bledy = walidujNowaPozycje(formularz, katalog);
    const kod = pierwszyBlad(bledy);
    if (kod !== null) return { ok: false, kod, bledyPol: bledy as Record<string, KodKomunikatu> };

    const id = nastepnyIdentyfikator(katalog);
    const pozycja = zbudujPozycje(formularz, {
      id,
      warunekOpis: opisWarunku(formularz),
      konto: pesel,
      teraz: ctx.teraz,
    });
    zapiszZmianeKatalogu({ rodzaj: 'nowa-pozycja', pozycja });
    ustawKomunikatPoPrzejsciu({
      kod: '0082',
      dlaWidoku: 'ViewCatalogList',
      parametry: { [PARAMETR_KOTWICY]: kotwicaPozycji(id), [PARAMETR_RODZAJU_ZMIANY]: id },
    });
    return { ok: true, wartosc: { id } };
  });
}

/**
 * Zmiana pól pozycji katalogu (tytuł, opis warunku, instytucja i kanał, dane i dokumenty, kroki, reguła terminu).
 * Formularz bez zmian kończy się bez zapisu i bez komunikatu. Po zapisie komunikat 0051 dla ViewCatalogList.
 */
export function zmienPozycje(
  idPozycji: IdPozycji,
  formularz: FormularzZmianyPozycji,
  ctx: KontekstOperacji,
): WynikOperacji<{ zmieniono: boolean }> {
  return wykonajZmianeKatalogu<{ zmieniono: boolean }>(() => {
    const pesel = peselAdministratora();
    if (pesel === null) return { ok: false, kod: '0047' };
    const katalog = odczytajKatalog();
    const pozycja = katalog.pozycje.find((p) => p.id === idPozycji);
    if (pozycja === undefined) return { ok: false, kod: '0003' };

    const bledy = walidujZmianePozycji(formularz, idPozycji, katalog);
    const kod = pierwszyBlad(bledy);
    if (kod !== null) return { ok: false, kod, bledyPol: bledy as Record<string, KodKomunikatu> };

    const zmiany = zmianyPolPozycji(formularz, pozycja);
    if (Object.keys(zmiany).length === 0) return { ok: true, wartosc: { zmieniono: false } };
    zapiszZmianeKatalogu({ rodzaj: 'zmiana-pozycji', zmiana: { id: idPozycji, zmiany, przez: pesel, czas: ctx.teraz } });
    komunikatZmiany(kotwicaPozycji(idPozycji), idPozycji);
    return { ok: true, wartosc: { zmieniono: true } };
  });
}

/** Wyłącza pozycję z planów rodzin albo włącza ją ponownie; komunikat 0051 dla ViewCatalogList. */
export function ustawWylaczeniePozycji(idPozycji: IdPozycji, wylaczona: boolean, ctx: KontekstOperacji): WynikOperacji {
  return wykonajZmianeKatalogu<void>(() => {
    const pesel = peselAdministratora();
    if (pesel === null) return { ok: false, kod: '0047' };
    const pozycja = odczytajKatalog().pozycje.find((p) => p.id === idPozycji);
    if (pozycja === undefined) return { ok: false, kod: '0003' };
    if ((pozycja.wylaczona === true) === wylaczona) return { ok: true, wartosc: undefined };
    zapiszZmianeKatalogu({
      rodzaj: 'zmiana-pozycji',
      zmiana: { id: idPozycji, zmiany: { wylaczona }, przez: pesel, czas: ctx.teraz },
    });
    komunikatZmiany(kotwicaPozycji(idPozycji), idPozycji);
    return { ok: true, wartosc: undefined };
  });
}

/**
 * Nowy albo zmieniony wpis słownika dokumentów i adresatów (`idDokumentu` undefined: nowy wpis).
 * Komunikat 0051 dla ViewCatalogList na zakładce dokumentów.
 */
export function zapiszDokument(
  idDokumentu: string | undefined,
  formularz: FormularzDokumentu,
  ctx: KontekstOperacji,
): WynikOperacji<{ id: string }> {
  void ctx;
  return wykonajZmianeKatalogu<{ id: string }>(() => {
    const pesel = peselAdministratora();
    if (pesel === null) return { ok: false, kod: '0047' };
    const katalog = odczytajKatalog();
    const istniejacy = idDokumentu === undefined ? undefined : katalog.dokumenty.find((d) => d.id === idDokumentu);
    if (idDokumentu !== undefined && istniejacy === undefined) return { ok: false, kod: '0003' };

    const bledy = walidujDokument(formularz);
    const kod = pierwszyBlad(bledy);
    if (kod !== null) return { ok: false, kod, bledyPol: bledy as Record<string, KodKomunikatu> };

    const dokument = dokumentZFormularza(formularz, katalog, istniejacy);
    zapiszZmianeKatalogu({ rodzaj: 'dokument', dokument, nowy: istniejacy === undefined });
    komunikatZmiany(kotwicaDokumentu(dokument.id), dokument.id);
    return { ok: true, wartosc: { id: dokument.id } };
  });
}

/** Nowy wpis słownika kwot i progów albo wymiarów i okresów, czyli nowy parametr z pierwszą wersją wartości. */
export function dodajWpisSlownika(formularz: FormularzNowegoWpisu, ctx: KontekstOperacji): WynikOperacji<{ id: string }> {
  return wykonajZmianeKatalogu<{ id: string }>(() => {
    const pesel = peselAdministratora();
    if (pesel === null) return { ok: false, kod: '0047' };
    const katalog = odczytajKatalog();

    const bledy = walidujNowyWpis(formularz, katalog);
    const kod = pierwszyBlad(bledy);
    if (kod !== null) return { ok: false, kod, bledyPol: bledy as Record<string, KodKomunikatu> };

    const wpis = nowyWpisSlownika(formularz, katalog, { konto: pesel, teraz: ctx.teraz });
    zapiszZmianeKatalogu({ rodzaj: 'nowy-wpis', wpis });
    komunikatZmiany(kotwicaWpisu(wpis.id), wpis.id);
    return { ok: true, wartosc: { id: wpis.id } };
  });
}
