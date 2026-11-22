// Zmiany Katalogu świadczeń jako dane: jedna funkcja stosuje zmianę Administratora do edycji katalogu w przeglądarce
// i w usłudze REST /api/katalog, więc przeglądarka i serwer dochodzą do tych samych edycji. Właściciel: u06.
// Każda zmiana zwiększa wersję edycji o jeden, dzięki czemu plany rodzin przeliczają się po każdej zmianie katalogu.
// Funkcje są czyste i nie znają magazynu, sieci ani zegara.
import type {
  EdycjeKatalogu,
  PodmiotWsparcia,
  WpisSlownikaDokumentow,
  ZmianaKatalogu,
} from '@/domena/typy';

/** Wersja edycji katalogu bez zmian Administratora. */
export const WERSJA_EDYCJI_POCZATKOWA = 1;

/** Edycje bez zmian Administratora z podaną wersją. */
export function edycjePuste(wersja: number = WERSJA_EDYCJI_POCZATKOWA): EdycjeKatalogu {
  return { wersja, noweWersje: [], nowePozycje: [], podmioty: { dodane: [], zmienione: [] } };
}

/** Edycje z wszystkimi polami układu; zapis z pierwszej wersji układu dostaje puste listy nowych pól. */
export function pelneEdycje(e: EdycjeKatalogu): Required<EdycjeKatalogu> {
  return {
    wersja: e.wersja,
    noweWersje: e.noweWersje,
    nowePozycje: e.nowePozycje,
    podmioty: e.podmioty,
    zmienionePozycje: e.zmienionePozycje ?? [],
    dokumenty: e.dokumenty ?? { dodane: [], zmienione: [] },
    noweWpisy: e.noweWpisy ?? [],
  };
}

type ElementZId = { id: string };

/**
 * Wolny identyfikator dla elementu z identyfikatorem `id` zajętym w `zajete`: ten sam przedrostek i kolejny numer
 * po najwyższym numerze z tym przedrostkiem, z tą samą liczbą cyfr, na przykład 'K40' przy zajętych K40 i K41 daje 'K42'.
 */
export function wolnyIdentyfikator(id: string, zajete: readonly string[]): string {
  const m = /^(.*?)(\d+)$/.exec(id);
  const przedrostek = m ? m[1] : `${id}-`;
  const cyfry = m ? m[2].length : 1;
  const numery = [id, ...zajete]
    .filter((z) => z.startsWith(przedrostek))
    .map((z) => /^\d+$/.exec(z.slice(przedrostek.length)))
    .filter((d): d is RegExpExecArray => d !== null)
    .map((d) => Number(d[0]));
  const nastepny = (numery.length === 0 ? 1 : Math.max(...numery)) + 1;
  return `${przedrostek}${String(nastepny).padStart(cyfry, '0')}`;
}

/**
 * Dodaje nowy element do listy. Element równy już zapisanemu elementowi (poza identyfikatorem) jest powtórzeniem
 * tej samej zmiany i lista zostaje bez zmian. Inny element z zajętym identyfikatorem, na przykład pozycja dodana
 * w tym samym czasie przez drugiego Administratora, dostaje kolejny wolny identyfikator.
 */
function dodajNowy<T extends ElementZId>(lista: readonly T[], element: T): T[] {
  const zajety = lista.some((p) => p.id === element.id);
  if (!zajety) return [...lista, element];
  if (lista.some((p) => JSON.stringify({ ...element, id: p.id }) === JSON.stringify(p))) return [...lista];
  return [...lista, { ...element, id: wolnyIdentyfikator(element.id, lista.map((p) => p.id)) }];
}

/** Nowy element trafia na koniec dodanych; zmieniony zastępuje element dodany albo wcześniejszą zmianę o tym samym id. */
function dodajAlboZmien<T extends ElementZId>(
  lista: { dodane: T[]; zmienione: T[] },
  element: T,
  nowy: boolean,
): { dodane: T[]; zmienione: T[] } {
  const { dodane, zmienione } = lista;
  if (nowy) return { dodane: dodajNowy(dodane, element), zmienione };
  if (dodane.some((p) => p.id === element.id)) {
    return { dodane: dodane.map((p) => (p.id === element.id ? element : p)), zmienione };
  }
  return { dodane, zmienione: [...zmienione.filter((p) => p.id !== element.id), element] };
}

/** Edycje po zastosowaniu zmiany `z`; wersja rośnie o jeden. */
export function zastosujZmiane(edycje: EdycjeKatalogu, z: ZmianaKatalogu): EdycjeKatalogu {
  const e = pelneEdycje(edycje);
  const wersja = e.wersja + 1;
  switch (z.rodzaj) {
    case 'nowa-wersja':
      return { ...e, wersja, noweWersje: [...e.noweWersje, { idWpisu: z.idWpisu, wersja: z.wersja }] };
    case 'nowa-pozycja':
      return { ...e, wersja, nowePozycje: dodajNowy(e.nowePozycje, z.pozycja) };
    case 'zmiana-pozycji':
      return { ...e, wersja, zmienionePozycje: [...e.zmienionePozycje, z.zmiana] };
    case 'podmiot':
      return { ...e, wersja, podmioty: dodajAlboZmien<PodmiotWsparcia>(e.podmioty, z.podmiot, z.nowy) };
    case 'dokument':
      return { ...e, wersja, dokumenty: dodajAlboZmien<WpisSlownikaDokumentow>(e.dokumenty, z.dokument, z.nowy) };
    case 'nowy-wpis':
      return { ...e, wersja, noweWpisy: dodajNowy(e.noweWpisy, z.wpis) };
    case 'przywrocenie':
      return edycjePuste(wersja);
  }
}

/**
 * Zmiany, które odtwarzają edycje `edycje` na edycjach bez zmian Administratora. Przeglądarka wysyła je do usługi,
 * gdy przechowuje edycje zapisane przed synchronizacją z usługą katalogu.
 */
export function zmianyOdtwarzajaceEdycje(edycje: EdycjeKatalogu): ZmianaKatalogu[] {
  const e = pelneEdycje(edycje);
  return [
    ...e.nowePozycje.map((pozycja): ZmianaKatalogu => ({ rodzaj: 'nowa-pozycja', pozycja })),
    ...e.noweWpisy.map((wpis): ZmianaKatalogu => ({ rodzaj: 'nowy-wpis', wpis })),
    ...e.noweWersje.map((n): ZmianaKatalogu => ({ rodzaj: 'nowa-wersja', idWpisu: n.idWpisu, wersja: n.wersja })),
    ...e.zmienionePozycje.map((zmiana): ZmianaKatalogu => ({ rodzaj: 'zmiana-pozycji', zmiana })),
    ...e.podmioty.dodane.map((podmiot): ZmianaKatalogu => ({ rodzaj: 'podmiot', podmiot, nowy: true })),
    ...e.podmioty.zmienione.map((podmiot): ZmianaKatalogu => ({ rodzaj: 'podmiot', podmiot, nowy: false })),
    ...e.dokumenty.dodane.map((dokument): ZmianaKatalogu => ({ rodzaj: 'dokument', dokument, nowy: true })),
    ...e.dokumenty.zmienione.map((dokument): ZmianaKatalogu => ({ rodzaj: 'dokument', dokument, nowy: false })),
  ];
}

// --- Sprawdzenie danych z sieci ------------------------------------------------------------------

function czyObiekt(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function czyListaObiektow(x: unknown): boolean {
  return Array.isArray(x) && x.every(czyObiekt);
}

function czyDodaneIZmienione(x: unknown): boolean {
  return czyObiekt(x) && czyListaObiektow(x.dodane) && czyListaObiektow(x.zmienione);
}

const WZOR_DATY_ISO = /^\d{4}-\d{2}-\d{2}$/;

function czyWersjaWpisu(x: unknown): boolean {
  return (
    czyObiekt(x) &&
    typeof x.od === 'string' &&
    WZOR_DATY_ISO.test(x.od) &&
    (x.do === undefined || (typeof x.do === 'string' && WZOR_DATY_ISO.test(x.do))) &&
    czyObiekt(x.wartosci) &&
    Object.values(x.wartosci).every((v) => typeof v === 'number' && Number.isFinite(v))
  );
}

const KOTWICE_REGULY: readonly string[] = [
  'koniec-10-tygodnia',
  'przewidywany-termin-porodu',
  'data-porodu',
  'data-przyjecia',
  'data-uprawomocnienia',
  'data-urodzenia-dziecka',
];
const JEDNOSTKI_PRZESUNIECIA: readonly string[] = ['dni', 'miesiace'];
const WZOR_DNIA_ROKU = /^\d{2}-\d{2}$/;

function czyLiczbaNieujemna(x: unknown): boolean {
  return typeof x === 'number' && Number.isInteger(x) && x >= 0;
}

function czyPrzesuniecie(x: unknown): boolean {
  return czyObiekt(x) && typeof x.przesuniecie === 'number' && Number.isInteger(x.przesuniecie) && JEDNOSTKI_PRZESUNIECIA.includes(String(x.jednostka));
}

/**
 * Reguła terminu w układzie, który liczą funkcje terminów (domena/terminy/reguly.ts). Usługa katalogu odrzuca regułę
 * w innym układzie, bo taka reguła zatrzymałaby wyliczenie kalendarza terminów każdej rodziny.
 */
function czyRegulaTerminu(x: unknown, glebokosc = 0): boolean {
  if (!czyObiekt(x) || glebokosc > 2) return false;
  switch (x.typ) {
    case 'brak':
      return true;
    case 'przesuniecie':
      return KOTWICE_REGULY.includes(String(x.kotwica)) && czyPrzesuniecie(x) && (x.korekta === undefined || czyPrzesuniecie(x.korekta));
    case 'plus-wymiar':
      return KOTWICE_REGULY.includes(String(x.kotwica)) && typeof x.idWpisu === 'string';
    case 'dzien-przed-urodzinami':
    case 'koniec-roku-urodzin':
      return czyLiczbaNieujemna(x.lata);
    case 'koniec-miesiaca-wieku':
      return czyLiczbaNieujemna(x.miesiace);
    case 'coroczny':
      return (
        typeof x.dzien === 'string' &&
        WZOR_DNIA_ROKU.test(x.dzien) &&
        (x.poczatekSkladania === undefined || (typeof x.poczatekSkladania === 'string' && WZOR_DNIA_ROKU.test(x.poczatekSkladania))) &&
        (x.zalecany === undefined || (typeof x.zalecany === 'string' && WZOR_DNIA_ROKU.test(x.zalecany))) &&
        (x.doRokuUrodzin === undefined || czyLiczbaNieujemna(x.doRokuUrodzin))
      );
    case 'dwa-terminy':
      return czyRegulaTerminu(x.pierwszy, glebokosc + 1) && czyRegulaTerminu(x.drugi, glebokosc + 1) && typeof x.kluczEtykietyDrugiego === 'string';
    case 'specjalna':
      return typeof x.kod === 'string' && typeof x.opis === 'string';
    default:
      return false;
  }
}

function czyListaTekstow(x: unknown): boolean {
  return Array.isArray(x) && x.every((t) => typeof t === 'string');
}

function czyPozycja(x: unknown): boolean {
  return (
    czyObiekt(x) &&
    typeof x.id === 'string' &&
    /^K\d{2,}$/.test(x.id) &&
    typeof x.tytul === 'string' &&
    czyObiekt(x.instrukcja) &&
    czyListaTekstow(x.instrukcja.kroki) &&
    czyListaTekstow(x.instrukcja.daneIDokumenty) &&
    czyObiekt(x.kanaly) &&
    czyRegulaTerminu(x.regulaTerminu)
  );
}

function czyWpis(x: unknown): boolean {
  return (
    czyObiekt(x) &&
    typeof x.id === 'string' &&
    typeof x.nazwa === 'string' &&
    (x.slownik === 'kwoty-i-progi' || x.slownik === 'wymiary-i-okresy') &&
    Array.isArray(x.warianty) &&
    Array.isArray(x.wersje) &&
    x.wersje.every(czyWersjaWpisu)
  );
}

/** Edycje katalogu w poprawnym układzie (dane z pliku magazynu serwera albo z żądania PUT). */
export function czyEdycjeKatalogu(x: unknown): x is EdycjeKatalogu {
  if (!czyObiekt(x)) return false;
  if (typeof x.wersja !== 'number' || !Number.isInteger(x.wersja) || x.wersja < 0) return false;
  if (!Array.isArray(x.noweWersje) || !x.noweWersje.every((n) => czyObiekt(n) && typeof n.idWpisu === 'string' && czyWersjaWpisu(n.wersja))) {
    return false;
  }
  if (!Array.isArray(x.nowePozycje) || !x.nowePozycje.every(czyPozycja)) return false;
  if (!czyDodaneIZmienione(x.podmioty)) return false;
  if (x.zmienionePozycje !== undefined && !(Array.isArray(x.zmienionePozycje) && x.zmienionePozycje.every(czyZmianaPozycji))) return false;
  if (x.dokumenty !== undefined && !czyDodaneIZmienione(x.dokumenty)) return false;
  if (x.noweWpisy !== undefined && !(Array.isArray(x.noweWpisy) && x.noweWpisy.every(czyWpis))) return false;
  return true;
}

/** Zmienione pola pozycji: teksty, listy tekstów, reguła terminu w układzie funkcji terminów i znacznik wyłączenia. */
function czyZmianyPolPozycji(x: unknown): boolean {
  if (!czyObiekt(x)) return false;
  return (
    (x.tytul === undefined || typeof x.tytul === 'string') &&
    (x.warunekOpis === undefined || typeof x.warunekOpis === 'string') &&
    (x.instytucjaIKanal === undefined || typeof x.instytucjaIKanal === 'string') &&
    (x.daneIDokumenty === undefined || czyListaTekstow(x.daneIDokumenty)) &&
    (x.kroki === undefined || czyListaTekstow(x.kroki)) &&
    (x.regulaTerminu === undefined || czyRegulaTerminu(x.regulaTerminu)) &&
    (x.wylaczona === undefined || typeof x.wylaczona === 'boolean')
  );
}

function czyZmianaPozycji(x: unknown): boolean {
  return czyObiekt(x) && typeof x.id === 'string' && czyZmianyPolPozycji(x.zmiany) && typeof x.przez === 'string' && typeof x.czas === 'string';
}

/** Zmiana katalogu w poprawnym układzie (treść żądania POST /api/katalog). */
export function czyZmianaKatalogu(x: unknown): x is ZmianaKatalogu {
  if (!czyObiekt(x)) return false;
  switch (x.rodzaj) {
    case 'nowa-wersja':
      return typeof x.idWpisu === 'string' && czyWersjaWpisu(x.wersja);
    case 'nowa-pozycja':
      return czyPozycja(x.pozycja);
    case 'zmiana-pozycji':
      return czyZmianaPozycji(x.zmiana);
    case 'podmiot':
      return czyObiekt(x.podmiot) && typeof x.podmiot.id === 'string' && typeof x.nowy === 'boolean';
    case 'dokument':
      return (
        czyObiekt(x.dokument) &&
        typeof x.dokument.id === 'string' &&
        Array.isArray(x.dokument.dokumenty) &&
        typeof x.nowy === 'boolean'
      );
    case 'nowy-wpis':
      return czyWpis(x.wpis);
    case 'przywrocenie':
      return true;
    default:
      return false;
  }
}
