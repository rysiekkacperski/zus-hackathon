// Wyliczenie planu rodziny (kontrakt, sekcja 7.2; historyjki 3.6.1.1.1 i 3.6.1.1.2). Właściciel: u08 (Silnik planu rodziny).
//
// wyliczPlan wykonuje krokiPlanu w kolejności rejestru, a potem uzgadnia wynik z poprzednim planem:
// sprawy złożone i załatwione zachowują status zawsze, także gdy ich warunek przestał być spełniony;
// pozostałe sprawy bez spełnionego warunku znikają, a nowe trafiają do planu ze statusem do zrobienia.
// Sprawa powtarzalna załatwiona w poprzednim cyklu wraca do statusu do zrobienia w dniu powrotu z reguły
// terminu (kontrakt, sekcja 6.7). Po potwierdzeniu daty porodu żadna sprawa nie ma oznaczenia po porodzie.
// Na końcu powstaje lista zmian, oznaczenie „nowa w planie” i bieżący etap.
import { dataZeZnacznika } from '@/domena/daty';
import { ETAPY, indeksEtapu, wyznaczBiezacyEtap } from '@/domena/plan/etap';
import { krokiPlanu } from '@/domena/plan/kroki';
import { czyStatusZachowywany } from '@/domena/plan/statusy';
import { faktyRodziny } from '@/domena/plan/warunki';
import { dodaneSprawy, porownajPlany } from '@/domena/plan/zmiany';
import type { WejsciePlanu } from '@/domena/przeliczenie';
import { czyWracaDoZrobienia } from '@/domena/terminy/wylicz-terminy';
import type { DataISO, IdSprawy, PlanRodziny, PozycjaPlanu } from '@/domena/typy';

/** Jedna sprawa na identyfikator: treść z ostatniego kroku, który ją zwrócił, miejsce z pierwszego. */
function bezPowtorzen(pozycje: readonly PozycjaPlanu[]): PozycjaPlanu[] {
  const kolejnosc: IdSprawy[] = [];
  const wedlugId = new Map<IdSprawy, PozycjaPlanu>();
  for (const p of pozycje) {
    if (!wedlugId.has(p.idSprawy)) kolejnosc.push(p.idSprawy);
    wedlugId.set(p.idSprawy, p);
  }
  return kolejnosc.map((id) => wedlugId.get(id) as PozycjaPlanu);
}

/**
 * Uzgodnienie z poprzednim planem. Sprawa złożona albo załatwiona, którą krok utworzył na nowo ze statusem
 * z wyliczenia planu, odzyskuje poprzedni status; status ustawiony przez krok z innego źródła (dane ZUS,
 * strażnik) zostaje. Sprawa złożona albo załatwiona, której żaden krok nie zwrócił, wraca do planu
 * z oznaczeniem zachowania bez spełnionego warunku.
 */
function uzgodnijZPoprzednim(pozycje: PozycjaPlanu[], poprzedni: PlanRodziny | null): PozycjaPlanu[] {
  if (poprzedni === null) return pozycje;
  const poprzednie = new Map<IdSprawy, PozycjaPlanu>(poprzedni.pozycje.map((p) => [p.idSprawy, p]));
  const obecne = new Set(pozycje.map((p) => p.idSprawy));

  const uzgodnione = pozycje.map((p) => {
    const przed = poprzednie.get(p.idSprawy);
    const bezFlagi: PozycjaPlanu = { ...p };
    delete bezFlagi.zachowanaBezWarunku;
    if (!przed || !czyStatusZachowywany(przed.status)) return bezFlagi;
    if (czyStatusZachowywany(p.status) || p.zrodloStatusu !== 'wyliczenie-planu') return bezFlagi;
    const odzyskana: PozycjaPlanu = { ...bezFlagi, status: przed.status, zrodloStatusu: przed.zrodloStatusu };
    if (przed.dataOznaczenia) odzyskana.dataOznaczenia = przed.dataOznaczenia;
    return odzyskana;
  });

  const zachowane = poprzedni.pozycje
    .filter((p) => czyStatusZachowywany(p.status) && !obecne.has(p.idSprawy))
    .map((p): PozycjaPlanu => ({
      ...p,
      zachowanaBezWarunku: true,
      ostrzezenia: [],
      oznaczenia: p.oznaczenia.filter((o) => o !== 'nowa-w-planie'),
    }));
  return [...uzgodnione, ...zachowane];
}

/**
 * Sprawy powtarzalne (K13, K21) załatwione w poprzednim cyklu, których warunek nadal jest spełniony, wracają
 * w dniu powrotu do statusu do zrobienia ze źródłem wyliczenie planu i bez daty oznaczenia poprzedniego cyklu.
 */
function reaktywujPowtarzalne(pozycje: PozycjaPlanu[], dzis: DataISO): PozycjaPlanu[] {
  return pozycje.map((p) => {
    if (p.zachowanaBezWarunku || !czyWracaDoZrobienia(p, dzis)) return p;
    const wraca: PozycjaPlanu = { ...p, status: 'do-zrobienia', zrodloStatusu: 'wyliczenie-planu' };
    delete wraca.dataOznaczenia;
    delete wraca.poprzedniStatus;
    return wraca;
  });
}

/** Kolejność planu: etapy w stałej kolejności, w etapie kolejność kroków. */
function uporzadkuj(pozycje: PozycjaPlanu[]): PozycjaPlanu[] {
  return pozycje
    .map((p, i) => ({ p, i }))
    .sort((a, b) => indeksEtapu(a.p.etap) - indeksEtapu(b.p.etap) || a.i - b.i)
    .map(({ p }) => p);
}

export function wyliczPlan(w: WejsciePlanu): PlanRodziny {
  const poprzedni = w.poprzedniPlan;
  const urodzone = faktyRodziny(w).urodzone;

  const zKrokow = krokiPlanu.reduce<PozycjaPlanu[]>((biezace, krok) => krok(biezace, w), []);
  let pozycje = reaktywujPowtarzalne(uzgodnijZPoprzednim(bezPowtorzen(zKrokow), poprzedni), w.dzis);
  if (urodzone) {
    pozycje = pozycje.map((p) => {
      if (!p.poPorodzie) return p;
      const bez = { ...p };
      delete bez.poPorodzie;
      return bez;
    });
  }
  pozycje = uporzadkuj(pozycje.filter((p) => ETAPY.includes(p.etap)));

  const biezacyEtap = wyznaczBiezacyEtap(w.zgoda ? w.daneCiazy : null, w.dzis);
  const zmiany = porownajPlany(poprzedni, pozycje);
  const zmianaEtapu = poprzedni && poprzedni.biezacyEtap !== biezacyEtap ? { z: poprzedni.biezacyEtap, na: biezacyEtap } : undefined;

  // Lista zmian dotyczy ostatniego przeliczenia, które coś zmieniło: przeliczenie bez zmian tego samego dnia
  // zostawia listę, oznaczenia „nowa w planie” i zmianę etapu z poprzedniego przeliczenia.
  const bezZmian = zmiany.length === 0 && zmianaEtapu === undefined;
  const tegoSamegoDnia = poprzedni !== null && dataZeZnacznika(poprzedni.wyliczono) === w.dzis;
  const zostawPoprzednie = bezZmian && tegoSamegoDnia;

  const nowe = zostawPoprzednie
    ? new Set(poprzedni.pozycje.filter((p) => p.oznaczenia.includes('nowa-w-planie')).map((p) => p.idSprawy))
    : dodaneSprawy(zmiany);
  pozycje = pozycje.map((p) => {
    const bez = p.oznaczenia.filter((o) => o !== 'nowa-w-planie');
    return { ...p, oznaczenia: nowe.has(p.idSprawy) ? [...bez, 'nowa-w-planie'] : bez };
  });

  const plan: PlanRodziny = {
    pozycje,
    biezacyEtap,
    wyliczono: w.teraz,
    dlaKataloguWersja: w.katalog.wersja,
    ostatnieZmiany: zostawPoprzednie ? poprzedni.ostatnieZmiany : zmiany,
  };
  const etap = zostawPoprzednie ? poprzedni.zmianaEtapu : zmianaEtapu;
  if (etap) plan.zmianaEtapu = etap;
  return plan;
}
