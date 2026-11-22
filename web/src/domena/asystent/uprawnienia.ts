// Działania asystenta AI dozwolone dla roli (kontrakt, sekcje 7.2 i 10.3). Właściciel: u31 (Asystent AI).
// R-AS-DZIAL: sprawę przypisaną matce zmienia konto matki (rola Rodzic), sprawę drugiego rodzica konto
// drugiego rodzica, a sprawę „matka albo ojciec” i „oboje rodzice” każde konto rodziny. Przejścia do kreatora
// wniosku i kalkulatora wariantu sprawy matki proponujemy kontu matki.
import type { IdSprawy, PlanRodziny, PropozycjaDzialania, RodzicSprawy, Rola, StatusSprawy } from '@/domena/typy';

export interface SprawaDoUprawnien {
  idSprawy: IdSprawy;
  rodzic: RodzicSprawy;
  status: StatusSprawy;
}

const RODZICE_ROLI: Record<Rola, readonly RodzicSprawy[]> = {
  rodzic: ['matka', 'oboje-rodzice', 'matka-albo-ojciec', 'rodzic-przyjmujacy'],
  'drugi-rodzic': ['drugi-rodzic', 'oboje-rodzice', 'matka-albo-ojciec'],
  'nowy-uzytkownik': [],
  administrator: [],
};

/** Czy rola może zmienić sprawę przypisaną rodzicowi `rodzic`. */
export function czyRolaZmieniaSprawe(rola: Rola, rodzic: RodzicSprawy): boolean {
  return RODZICE_ROLI[rola].includes(rodzic);
}

const WIDOKI_SPRAWY_MATKI = new Set(['ViewZamLeaveType', 'ViewCalcMaternityVariant']);

/** Uprawnienie na podstawie listy spraw (plan albo kontekst asystenta). */
export function dozwoloneDzialanieDlaSpraw(
  rola: Rola,
  propozycja: PropozycjaDzialania,
  sprawy: readonly SprawaDoUprawnien[],
): boolean {
  if (rola === 'administrator') return false;
  if (propozycja.rodzaj === 'przejdz') {
    if (rola === 'nowy-uzytkownik') {
      return propozycja.idWidoku === 'ViewProfileZusData' || propozycja.idWidoku === 'ViewCalcMaternityInput';
    }
    const idSprawy = propozycja.parametry?.sprawa ?? propozycja.parametry?.idSprawy;
    if (idSprawy === undefined || !WIDOKI_SPRAWY_MATKI.has(propozycja.idWidoku)) return true;
    const sprawa = sprawy.find((s) => s.idSprawy === idSprawy);
    return sprawa !== undefined && czyRolaZmieniaSprawe(rola, sprawa.rodzic);
  }
  const sprawa = sprawy.find((s) => s.idSprawy === propozycja.idSprawy);
  if (sprawa === undefined) return false;
  if (sprawa.status === propozycja.status || sprawa.status === 'zalatwiona') return false;
  return czyRolaZmieniaSprawe(rola, sprawa.rodzic);
}

/** Czy rola może zatwierdzić proponowane działanie. */
export function dozwoloneDzialanie(rola: Rola, propozycja: PropozycjaDzialania, plan: PlanRodziny | null): boolean {
  if (propozycja.rodzaj === 'oznacz-sprawe' && plan === null) return false;
  return dozwoloneDzialanieDlaSpraw(rola, propozycja, plan?.pozycje ?? []);
}
