// Edycje Katalogu świadczeń przez Administratora (kontrakt, sekcja 6.5). Właściciel: u06 (Panel Administratora katalogu).
// Edycje żyją w StanGlobalny.edycjeKatalogu, więc są wspólne dla wszystkich kont. Każdy zapis zwiększa
// wersję katalogu, a SynchronizacjaRodziny przelicza plany rodzin przy najbliższym otwarciu przewodnika.
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
import type {
  IdPozycji,
  IdWpisuSlownika,
  KodKomunikatu,
  KontekstOperacji,
  StanGlobalny,
  WynikOperacji,
} from '@/domena/typy';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { odczytajKatalog, odczytajZalogowanego, wykonajOperacjeZWynikiem, zmienGlobalne } from '@/dane/magazyn/stan';
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

function zwiekszWersje(stan: StanGlobalny, zmiana: Partial<StanGlobalny['edycjeKatalogu']>): StanGlobalny {
  return {
    ...stan,
    edycjeKatalogu: { ...stan.edycjeKatalogu, ...zmiana, wersja: stan.edycjeKatalogu.wersja + 1 },
  };
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
  return wykonajOperacjeZWynikiem<void>(() => {
    const pesel = peselAdministratora();
    if (pesel === null) return { ok: false, kod: '0047' };
    const wpis = odczytajKatalog().slowniki.find((w) => w.id === idWpisu);
    if (wpis === undefined || !czyWpisEdytowalny(wpis)) return { ok: false, kod: '0047' };

    const bledy = walidujNowaWersje(wpis, wartosci, od, ctx.dzis);
    const kod = pierwszyBlad(bledy);
    if (kod !== null) return { ok: false, kod, bledyPol: bledy as Record<string, KodKomunikatu> };

    const { nowa } = nowaWersja(wpis, wartosci, od, pesel, ctx.teraz);
    zmienGlobalne(
      (stan) =>
        zwiekszWersje(stan, {
          noweWersje: [...stan.edycjeKatalogu.noweWersje, { idWpisu, wersja: nowa }],
        }),
      'domenowe',
    );
    ustawKomunikatPoPrzejsciu({
      kod: '0051',
      dlaWidoku: 'ViewCatalogList',
      parametry: { [PARAMETR_KOTWICY]: kotwicaWpisu(idWpisu), [PARAMETR_RODZAJU_ZMIANY]: idWpisu },
    });
    return { ok: true, wartosc: undefined };
  });
}

/**
 * Nowa pozycja katalogu z kolejnym wolnym identyfikatorem i warunkiem etapu wyprowadzonym z etapu.
 * Zwiększa edycjeKatalogu.wersja, więc plany rodzin uwzględnią pozycję przy najbliższym wyliczeniu,
 * i ustawia komunikat 0082 dla ViewCatalogList.
 */
export function dodajPozycje(formularz: FormularzNowejPozycji, ctx: KontekstOperacji): WynikOperacji<{ id: IdPozycji }> {
  return wykonajOperacjeZWynikiem<{ id: IdPozycji }>(() => {
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
    zmienGlobalne(
      (stan) => zwiekszWersje(stan, { nowePozycje: [...stan.edycjeKatalogu.nowePozycje, pozycja] }),
      'domenowe',
    );
    ustawKomunikatPoPrzejsciu({
      kod: '0082',
      dlaWidoku: 'ViewCatalogList',
      parametry: { [PARAMETR_KOTWICY]: kotwicaPozycji(id), [PARAMETR_RODZAJU_ZMIANY]: id },
    });
    return { ok: true, wartosc: { id } };
  });
}

