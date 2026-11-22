// Pozycje wniosku o urlop wychowawczy i o obniżenie wymiaru czasu pracy na ViewLeaveRequestSummary i ViewLeaveRequestSent.
import { formatujDate } from '@/domena/daty';
import type { Okres, WniosekOUrlop } from '@/domena/typy';
import { teksty } from '@/teksty';

const tw = teksty.ViewLeaveRequestForm.wychowawczy;

export interface PozycjaWychowawczego {
  etykieta: string;
  wartosc: string;
}

function okres(o: Okres): string {
  return `${formatujDate(o.od)} – ${formatujDate(o.do)}`;
}

/** Okres, wymiar i część urlopu (zakładka Okres). */
export function pozycjeOkresuWychowawczego(wniosek: Pick<WniosekOUrlop, 'podrodzaj' | 'wychowawczy'>): PozycjaWychowawczego[] {
  const w = wniosek.wychowawczy;
  if (!w) return [];
  const pozycje: PozycjaWychowawczego[] = [
    { etykieta: tw.rodzajUrlopu, wartosc: w.rodzaj === 'niepelnosprawnosc' ? tw.rodzajNiepelnosprawnosc : tw.rodzajDo6Lat },
    { etykieta: wniosek.podrodzaj === 'obnizenie-wymiaru' ? tw.dataPoczatkuPracy : tw.okresCzesci, wartosc: okres(w.okres) },
  ];
  if (wniosek.podrodzaj === 'obnizenie-wymiaru' && w.wymiarPracy !== undefined) {
    pozycje.push({ etykieta: tw.wymiarPracy, wartosc: `${w.wymiarPracy}${tw.procent}` });
  } else {
    pozycje.push({ etykieta: tw.okresTytul, wartosc: tw.miesiaceIDni({ miesiace: w.miesiace, dni: w.dni }) });
    pozycje.push({ etykieta: tw.czesc, wartosc: tw.numerCzesci({ numer: w.numerCzesci }) });
  }
  pozycje.push({ etykieta: tw.pozostaly, wartosc: tw.miesiaceIDni({ miesiace: w.pozostaloMiesiace, dni: w.pozostaloDni }) });
  return pozycje;
}

/** Oświadczenia o drugim rodzicu, przyczynie wymiaru 36 miesięcy i dotychczasowej pracy w obniżonym wymiarze. */
export function pozycjeOswiadczenWychowawczego(wniosek: Pick<WniosekOUrlop, 'podrodzaj' | 'wychowawczy'>): PozycjaWychowawczego[] {
  const w = wniosek.wychowawczy;
  if (!w) return [];
  const pozycje: PozycjaWychowawczego[] = [
    { etykieta: tw.zamiar, wartosc: w.okresDrugiegoRodzica ? `${tw.zamiarTak}: ${okres(w.okresDrugiegoRodzica)}` : tw.zamiarNie },
  ];
  if (w.przyczyna36) {
    const przyczyny = tw.przyczyny as Record<string, string>;
    pozycje.push({ etykieta: tw.przyczyna36, wartosc: przyczyny[w.przyczyna36] ?? w.przyczyna36 });
  }
  if (wniosek.podrodzaj === 'obnizenie-wymiaru') {
    pozycje.push({
      etykieta: tw.dotychczasowa,
      wartosc: w.dotychczasowaPraca ? `${tw.dotychczasowaTak}: ${okres(w.dotychczasowaPraca)}` : tw.dotychczasowaNie,
    });
  }
  return pozycje;
}
