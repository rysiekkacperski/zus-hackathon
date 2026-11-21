// Złożenie Katalogu świadczeń z seedu i edycji Administratora (kontrakt, sekcje 5.8, 6.4 i 7.2).
// Właściciel: u04 (Katalog świadczeń: zawartość).
//
// Złożenie dopisuje nowe pozycje w kolejności identyfikatorów, dopisuje nowe wersje wpisów słownika i kończy
// każdą wersję dniem poprzedzającym początek następnej, dzięki czemu okresy obowiązywania wersji jednego wpisu
// nie nakładają się, a historia zachowuje wszystkie poprzednie wartości. Nowa wersja z tą samą datą początku
// co wersja istniejąca zastępuje ją. Podmioty wsparcia dodane przez Administratora trafiają na koniec listy,
// a zmienione zastępują podmiot o tym samym identyfikatorze.
import { dodajDni, porownajDaty } from '@/domena/daty';
import type { EdycjeKatalogu, Katalog, PodmiotWsparcia, PozycjaKatalogu, WersjaWpisu, WpisSlownika } from '@/domena/typy';

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

function zlozSlowniki(slowniki: readonly WpisSlownika[], edycje: EdycjeKatalogu): WpisSlownika[] {
  return slowniki.map((wpis) => {
    const nowe = edycje.noweWersje.filter((n) => n.idWpisu === wpis.id).map((n) => n.wersja);
    return nowe.length === 0 ? wpis : { ...wpis, wersje: uporzadkujWersje([...wpis.wersje, ...nowe]) };
  });
}

function numerPozycji(p: PozycjaKatalogu): number {
  const numer = Number.parseInt(p.id.replace(/^K/, ''), 10);
  return Number.isNaN(numer) ? Number.MAX_SAFE_INTEGER : numer;
}

function zlozPozycje(pozycje: readonly PozycjaKatalogu[], edycje: EdycjeKatalogu): PozycjaKatalogu[] {
  const istniejace = new Set(pozycje.map((p) => p.id));
  const nowe = edycje.nowePozycje.filter((p) => !istniejace.has(p.id)).sort((a, b) => numerPozycji(a) - numerPozycji(b));
  return [...pozycje, ...nowe];
}

function zlozPodmioty(podmioty: readonly PodmiotWsparcia[], edycje: EdycjeKatalogu): PodmiotWsparcia[] {
  const zmienione = new Map(edycje.podmioty.zmienione.map((p) => [p.id, p]));
  const istniejace = new Set(podmioty.map((p) => p.id));
  return [
    ...podmioty.map((p) => zmienione.get(p.id) ?? p),
    ...edycje.podmioty.dodane.filter((p) => !istniejace.has(p.id)).map((p) => zmienione.get(p.id) ?? p),
  ];
}

export function zlozKatalog(seed: Omit<Katalog, 'wersja'>, edycje: EdycjeKatalogu): Katalog {
  return {
    ...seed,
    wersja: edycje.wersja,
    pozycje: zlozPozycje(seed.pozycje, edycje),
    slowniki: zlozSlowniki(seed.slowniki, edycje),
    podmiotyWsparcia: zlozPodmioty(seed.podmiotyWsparcia, edycje),
  };
}
