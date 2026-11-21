// Zaślepka fundamentu: plan bez pozycji. Właściciel: u08 (Silnik planu rodziny).
// Docelowo wykonuje krokiPlanu w kolejności, zachowuje statusy złożona i załatwiona,
// liczy ostatnieZmiany i biezacyEtap (kontrakt, sekcja 7.2).
import { krokiPlanu } from '@/domena/plan/kroki';
import type { WejsciePlanu } from '@/domena/przeliczenie';
import type { PlanRodziny, PozycjaPlanu } from '@/domena/typy';

export function wyliczPlan(w: WejsciePlanu): PlanRodziny {
  const pozycje = krokiPlanu.reduce<PozycjaPlanu[]>((biezace, krok) => krok(biezace, w), []);
  return {
    pozycje,
    biezacyEtap: 'ciaza',
    wyliczono: w.teraz,
    dlaKataloguWersja: w.katalog.wersja,
    ostatnieZmiany: [],
  };
}
