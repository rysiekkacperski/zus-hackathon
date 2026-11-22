// Złożenie Katalogu świadczeń z seedu i edycji Administratora (kontrakt, sekcje 5.8, 6.4 i 7.2).
// Właściciel: u04 (Katalog świadczeń: zawartość).
//
// Złożenie dopisuje nowe pozycje w kolejności identyfikatorów, dopisuje nowe wpisy słowników i nowe wersje wpisów
// słownika i kończy każdą wersję dniem poprzedzającym początek następnej, dzięki czemu okresy obowiązywania wersji
// jednego wpisu nie nakładają się, a historia zachowuje wszystkie poprzednie wartości. Nowa wersja z tą samą datą
// początku co wersja istniejąca zastępuje ją. Zmiany pól pozycji nakładają się w kolejności zapisu, a pozycja
// wyłączona zostaje w katalogu z oznaczeniem `wylaczona`, żeby panel mógł ją ponownie włączyć. Podmioty wsparcia
// i wpisy słownika dokumentów dodane przez Administratora trafiają na koniec listy, a zmienione zastępują element
// o tym samym identyfikatorze.
import { dodajDni, porownajDaty } from '@/domena/daty';
import { pelneEdycje } from '@/domena/katalog/zmiany';
import type {
  EdycjeKatalogu,
  Katalog,
  PozycjaKatalogu,
  WersjaWpisu,
  WpisSlownika,
  ZmianaPozycjiKatalogu,
} from '@/domena/typy';

function uporzadkujWersje(wersje: readonly WersjaWpisu[]): WersjaWpisu[] {
  const wedlugPoczatku = new Map<string, WersjaWpisu>();
  for (const wersja of wersje) wedlugPoczatku.set(wersja.od, wersja);
  const posortowane = [...wedlugPoczatku.values()].sort((a, b) => porownajDaty(a.od, b.od));
  return posortowane.map((wersja, i) => {
    const nastepna = posortowane[i + 1];
    if (nastepna === undefined) return wersja;
    const koniec = dodajDni(nastepna.od, -1);
    if (wersja.do !== undefined && porownajDaty(wersja.do, koniec) <= 0) return wersja;
    return { ...wersja, do: koniec };
  });
}

function zlozSlowniki(slowniki: readonly WpisSlownika[], e: Required<EdycjeKatalogu>): WpisSlownika[] {
  const istniejace = new Set(slowniki.map((w) => w.id));
  const wszystkie = [...slowniki, ...e.noweWpisy.filter((w) => !istniejace.has(w.id))];
  return wszystkie.map((wpis) => {
    const nowe = e.noweWersje.filter((n) => n.idWpisu === wpis.id).map((n) => n.wersja);
    return nowe.length === 0 ? wpis : { ...wpis, wersje: uporzadkujWersje([...wpis.wersje, ...nowe]) };
  });
}

function numerPozycji(p: PozycjaKatalogu): number {
  const numer = Number.parseInt(p.id.replace(/^K/, ''), 10);
  return Number.isNaN(numer) ? Number.MAX_SAFE_INTEGER : numer;
}

function zastosujZmianePozycji(p: PozycjaKatalogu, z: ZmianaPozycjiKatalogu): PozycjaKatalogu {
  const { daneIDokumenty, kroki, regulaTerminu, wylaczona, ...pola } = z.zmiany;
  const wynik: PozycjaKatalogu = {
    ...p,
    ...pola,
    instrukcja: {
      ...p.instrukcja,
      ...(daneIDokumenty !== undefined ? { daneIDokumenty } : {}),
      ...(kroki !== undefined ? { kroki } : {}),
    },
    zmieniono: {
      przez: z.przez,
      czas: z.czas,
      regulaTerminu: regulaTerminu !== undefined || (p.zmieniono?.regulaTerminu ?? false),
    },
  };
  if (regulaTerminu !== undefined) wynik.regulaTerminu = regulaTerminu;
  if (wylaczona === true) wynik.wylaczona = true;
  if (wylaczona === false) delete wynik.wylaczona;
  return wynik;
}

function zlozPozycje(pozycje: readonly PozycjaKatalogu[], e: Required<EdycjeKatalogu>): PozycjaKatalogu[] {
  const istniejace = new Set(pozycje.map((p) => p.id));
  const nowe = e.nowePozycje.filter((p) => !istniejace.has(p.id)).sort((a, b) => numerPozycji(a) - numerPozycji(b));
  const wszystkie = [...pozycje, ...nowe];
  if (e.zmienionePozycje.length === 0) return wszystkie;
  return wszystkie.map((p) =>
    e.zmienionePozycje.filter((z) => z.id === p.id).reduce<PozycjaKatalogu>(zastosujZmianePozycji, p),
  );
}

function zlozDodaneIZmienione<T extends { id: string }>(
  seed: readonly T[],
  lista: { dodane: readonly T[]; zmienione: readonly T[] },
): T[] {
  const zmienione = new Map(lista.zmienione.map((p) => [p.id, p]));
  const istniejace = new Set(seed.map((p) => p.id));
  return [
    ...seed.map((p) => zmienione.get(p.id) ?? p),
    ...lista.dodane.filter((p) => !istniejace.has(p.id)).map((p) => zmienione.get(p.id) ?? p),
  ];
}

export function zlozKatalog(seed: Omit<Katalog, 'wersja'>, edycje: EdycjeKatalogu): Katalog {
  const e = pelneEdycje(edycje);
  return {
    ...seed,
    wersja: e.wersja,
    pozycje: zlozPozycje(seed.pozycje, e),
    slowniki: zlozSlowniki(seed.slowniki, e),
    dokumenty: zlozDodaneIZmienione(seed.dokumenty, e.dokumenty),
    podmiotyWsparcia: zlozDodaneIZmienione(seed.podmiotyWsparcia, e.podmioty),
  };
}

/** Czy Administrator wyłączył pozycję katalogu o identyfikatorze `id`. */
export function czyPozycjaWylaczona(k: Katalog, id: string | null | undefined): boolean {
  if (id === null || id === undefined) return false;
  return k.pozycje.some((p) => p.id === id && p.wylaczona === true);
}
