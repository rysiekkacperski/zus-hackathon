// Złożenie Katalogu świadczeń z seedu i edycji Administratora (kontrakt, sekcje 5.8, 6.4 i 7.2).
// Właściciel: u04 (Katalog świadczeń: zawartość). Wersja fundamentu nakłada edycje wprost: dopisuje nowe pozycje,
// dopisuje nowe wersje wpisów słownika i zamyka poprzednią wersję dzień przed początkiem następnej,
// dodaje i podmienia podmioty wsparcia. Właściciel rozwija treść z zachowaniem nazwy eksportu i podpisu.
import { dodajDni, porownajDaty } from '@/domena/daty';
import type { EdycjeKatalogu, Katalog, PodmiotWsparcia, WersjaWpisu, WpisSlownika } from '@/domena/typy';

// Wersje uporządkowane według daty początku; wersja bez daty końca kończy się dzień przed początkiem następnej.
function uporzadkujWersje(wersje: readonly WersjaWpisu[]): WersjaWpisu[] {
  const posortowane = [...wersje].sort((a, b) => porownajDaty(a.od, b.od));
  return posortowane.map((wersja, i) => {
    const nastepna = posortowane[i + 1];
    if (wersja.do !== undefined || nastepna === undefined) return wersja;
    return { ...wersja, do: dodajDni(nastepna.od, -1) };
  });
}

function zlozSlowniki(slowniki: readonly WpisSlownika[], edycje: EdycjeKatalogu): WpisSlownika[] {
  return slowniki.map((wpis) => {
    const nowe = edycje.noweWersje.filter((n) => n.idWpisu === wpis.id).map((n) => n.wersja);
    return nowe.length === 0 ? wpis : { ...wpis, wersje: uporzadkujWersje([...wpis.wersje, ...nowe]) };
  });
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
  const idPozycji = new Set(seed.pozycje.map((p) => p.id));
  return {
    ...seed,
    wersja: edycje.wersja,
    pozycje: [...seed.pozycje, ...edycje.nowePozycje.filter((p) => !idPozycji.has(p.id))],
    slowniki: zlozSlowniki(seed.slowniki, edycje),
    podmiotyWsparcia: zlozPodmioty(seed.podmiotyWsparcia, edycje),
  };
}
