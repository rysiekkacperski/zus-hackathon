// Krok planu `ryzykaCiazy` (kontrakt, sekcja 7.2). Właściciel: u22 (Ryzyka, szczególna ochrona i podmioty wsparcia).
// Krok przypina do spraw K28 i K29 ostrzeżenia ciąży (0119, 0120) i usuwa je po potwierdzeniu daty porodu.
// Gdy ostrzeżenie dotyczy matki, a plan nie ma sprawy, krok dodaje sprawę w etapie Ciąża.
import type { KrokPlanu } from '@/domena/plan/kroki/typ';
import { wyliczOstrzezeniaCiazy } from '@/domena/przewodnik/ryzyka';
import type { IdPozycji, OstrzezenieSprawy, PozycjaPlanu } from '@/domena/typy';
import type { WejsciePlanu } from '@/domena/przeliczenie';

const RODZAJE_OSTRZEZEN_CIAZY: readonly OstrzezenieSprawy['rodzaj'][] = ['tytul-w-ciazy', 'ustanie-przed-porodem'];

function bezOstrzezenCiazy(p: PozycjaPlanu): PozycjaPlanu {
  if (!p.ostrzezenia.some((o) => RODZAJE_OSTRZEZEN_CIAZY.includes(o.rodzaj))) return p;
  return { ...p, ostrzezenia: p.ostrzezenia.filter((o) => !RODZAJE_OSTRZEZEN_CIAZY.includes(o.rodzaj)) };
}

function nowaSprawa(idPozycji: IdPozycji, ostrzezenie: OstrzezenieSprawy, w: WejsciePlanu): PozycjaPlanu {
  const pozycja = w.katalog.pozycje.find((p) => p.id === idPozycji);
  const poprzednia = w.poprzedniPlan?.pozycje.find((p) => p.idSprawy === idPozycji);
  const zachowajStatus = poprzednia !== undefined && (poprzednia.status === 'zalatwiona' || poprzednia.status === 'zlozona');
  return {
    idSprawy: idPozycji,
    idPozycji,
    rodzaj: pozycja?.rodzaj ?? 'informacja',
    etap: pozycja?.etap ?? 'ciaza',
    rodzic: 'matka',
    status: zachowajStatus ? poprzednia.status : 'do-zrobienia',
    zrodloStatusu: zachowajStatus ? poprzednia.zrodloStatusu : 'wyliczenie-planu',
    ...(zachowajStatus && poprzednia.dataOznaczenia !== undefined ? { dataOznaczenia: poprzednia.dataOznaczenia } : {}),
    liczbaDzieci: w.daneCiazy?.liczbaDzieciZCiazy ?? 1,
    ostrzezenia: [ostrzezenie],
    oznaczenia: [],
  };
}

function przypnij(pozycje: PozycjaPlanu[], idPozycji: IdPozycji, ostrzezenie: OstrzezenieSprawy | undefined, w: WejsciePlanu) {
  if (ostrzezenie === undefined) return pozycje;
  const istnieje = pozycje.some((p) => p.idPozycji === idPozycji);
  if (!istnieje) return [...pozycje, nowaSprawa(idPozycji, ostrzezenie, w)];
  return pozycje.map((p) => (p.idPozycji === idPozycji ? { ...p, ostrzezenia: [...p.ostrzezenia, ostrzezenie] } : p));
}

export const ryzykaCiazy: KrokPlanu = (pozycje, w) => {
  const czyste = pozycje.map(bezOstrzezenCiazy);
  const { k28, k29 } = wyliczOstrzezeniaCiazy({
    matka: w.daneRodziny.matka,
    daneCiazy: w.daneCiazy,
    daneZusMatki: w.daneZusMatki,
  });
  return przypnij(przypnij(czyste, 'K28', k28, w), 'K29', k29, w);
};
