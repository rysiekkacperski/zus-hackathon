// Krok planu `warunkiKatalogu` (kontrakt, sekcja 7.2; historyjka 3.6.1.1.1). Właściciel: u08 (Silnik planu rodziny).
//
// Krok dodaje sprawę dla każdej pozycji katalogu, której warunek spełnia rodzina, z etapem i rodzajem pozycji,
// rodzicem z warunku, statusem, oznaczeniami po porodzie i zależności od dochodu, liczbą dzieci z ciąży i kwotą
// świadczenia. Pozycje „każdy rodzic na umowie o pracę” dostają osobną sprawę na rodzica. Sprawy obecne
// w poprzednim planie zachowują status złożona i załatwiona oraz oznaczenia i warianty zapisane operacjami planu.
import '@/domena/plan/zmiany';
import type { KrokPlanu } from '@/domena/plan/kroki/typ';
import { czyStatusZachowywany, idSprawyDlaRodzica } from '@/domena/plan/statusy';
import {
  METADANE_POZYCJI,
  czySprawaNaRodzica,
  faktyRodziny,
  kwotaSprawy,
  warunekStrukturalny,
  warunkiSpraw,
  type WynikWarunku,
} from '@/domena/plan/warunki';
import type { WejsciePlanu } from '@/domena/przeliczenie';
import type { Etap, IdPozycji, IdSprawy, PozycjaPlanu, RodzajPozycji, RodzicPozycji, RodzicSprawy, RodzicWRodzinie } from '@/domena/typy';

interface PozycjaDoOceny {
  id: IdPozycji;
  etap: Etap;
  rodzaj: RodzajPozycji;
  rodzic: RodzicPozycji;
  warunek: ((w: WejsciePlanu) => WynikWarunku) | undefined;
}

/** Pozycje katalogu w kolejności katalogu; bez pozycji w katalogu metadane K01–K37 z tabeli katalogu. */
export function pozycjeDoOceny(w: WejsciePlanu): PozycjaDoOceny[] {
  if (w.katalog.pozycje.length > 0) {
    return w.katalog.pozycje.map((p) => ({
      id: p.id,
      etap: p.etap,
      rodzaj: p.rodzaj,
      rodzic: p.rodzic,
      warunek: warunkiSpraw[p.id] ?? warunekStrukturalny(p),
    }));
  }
  return Object.entries(METADANE_POZYCJI).map(([id, meta]) => ({ id, ...meta, warunek: warunkiSpraw[id] }));
}

/** Pola, które ustawiają operacje planu i które sprawa zachowuje po przeliczeniu. */
export function przeniesZPoprzedniej(nowa: PozycjaPlanu, przed: PozycjaPlanu | undefined): PozycjaPlanu {
  if (!przed) return nowa;
  const wynik: PozycjaPlanu = {
    ...nowa,
    oznaczenia: [...new Set([...nowa.oznaczenia, ...przed.oznaczenia.filter((o) => o !== 'nowa-w-planie')])],
  };
  if (przed.wybranyWariant) wynik.wybranyWariant = przed.wybranyWariant;
  if (przed.poprzedniStatus) wynik.poprzedniStatus = przed.poprzedniStatus;
  // Złożona i załatwiona zachowują status; status załatwiona z profilu zastępuje status złożona.
  const zachowaj = czyStatusZachowywany(przed.status) && !(przed.status === 'zlozona' && nowa.status === 'zalatwiona');
  if (zachowaj) {
    wynik.status = przed.status;
    wynik.zrodloStatusu = przed.zrodloStatusu;
    if (przed.dataOznaczenia) wynik.dataOznaczenia = przed.dataOznaczenia;
    else delete wynik.dataOznaczenia;
  }
  return wynik;
}

function nowaSprawa(
  w: WejsciePlanu,
  p: PozycjaDoOceny,
  idSprawy: IdSprawy,
  rodzic: RodzicSprawy,
  r: WynikWarunku,
  liczbaDzieci: number,
): PozycjaPlanu {
  const sprawa: PozycjaPlanu = {
    idSprawy,
    idPozycji: p.id,
    rodzaj: p.rodzaj,
    etap: p.etap,
    rodzic,
    status: r.wymagaUzupelnienia ? 'wymaga-uzupelnienia-profilu' : r.zalatwiona ? 'zalatwiona' : 'do-zrobienia',
    zrodloStatusu: r.zalatwiona && !r.wymagaUzupelnienia ? 'odpowiedz-rodzica' : 'wyliczenie-planu',
    liczbaDzieci,
    ostrzezenia: [],
    oznaczenia: [],
  };
  if (r.poPorodzie && !r.wymagaUzupelnienia) sprawa.poPorodzie = true;
  if (r.zalezyOdDochodu) sprawa.zalezyOdDochodu = true;
  const kwota = kwotaSprawy(w.katalog, p.id, liczbaDzieci, w.dzis);
  if (kwota) sprawa.kwota = kwota;
  return sprawa;
}

export const warunkiKatalogu: KrokPlanu = (pozycje, w) => {
  const f = faktyRodziny(w);
  const poprzednie = new Map<IdSprawy, PozycjaPlanu>((w.poprzedniPlan?.pozycje ?? []).map((p) => [p.idSprawy, p]));
  const istniejace = new Set(pozycje.map((p) => p.idSprawy));
  const nowe: PozycjaPlanu[] = [];

  for (const p of pozycjeDoOceny(w)) {
    if (!p.warunek) continue;
    const r = p.warunek(w);
    if (!r.spelniony) continue;
    const sprawy: { idSprawy: IdSprawy; rodzic: RodzicSprawy }[] = czySprawaNaRodzica(p)
      ? (r.rodzice ?? rodziceZWyniku(r.rodzic)).map((rodzic) => ({ idSprawy: idSprawyDlaRodzica(p.id, rodzic), rodzic }))
      : [{ idSprawy: p.id, rodzic: r.rodzic }];
    for (const { idSprawy, rodzic } of sprawy) {
      if (istniejace.has(idSprawy)) continue;
      nowe.push(przeniesZPoprzedniej(nowaSprawa(w, p, idSprawy, rodzic, r, f.liczbaDzieci), poprzednie.get(idSprawy)));
    }
  }
  return [...pozycje, ...nowe];
};

function rodziceZWyniku(rodzic: RodzicSprawy): RodzicWRodzinie[] {
  if (rodzic === 'matka' || rodzic === 'drugi-rodzic') return [rodzic];
  return rodzic === 'oboje-rodzice' ? ['matka', 'drugi-rodzic'] : [];
}
