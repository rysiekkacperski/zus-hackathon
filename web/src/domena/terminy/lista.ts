// Sekcje listy terminów ViewDeadlines (kontrakt, sekcja 7.2; Story 3.7.1.3.1). Właściciel: u13 (Kalendarz terminów).
// Lista obejmuje sprawy do zrobienia z terminem. Sekcje: po terminie (termin < dziś), najbliższe 30 dni
// (dziś ≤ termin ≤ dziś + 30 dni) i później. W sekcji kolejność rosnąco po dacie, przy remisie po identyfikatorze sprawy.
import { dodajDni, roznicaDni } from '@/domena/daty';
import { REGULY_POZYCJI } from '@/domena/terminy/reguly';
import { statusDlaKalendarza } from '@/domena/terminy/wylicz-terminy';
import type { DataISO, Etap, KalendarzTerminow, PlanRodziny, PozycjaPlanu, RodzicSprawy, TerminSprawy } from '@/domena/typy';

export type RodzajFiltruTerminow = 'wszystkie' | 'z-kosztem' | 'powtarzalne';
export type KogoDotyczyFiltr = 'wszyscy' | 'matka' | 'drugi-rodzic';

/** Filtry listy terminów ze wzoru ViewDeadlines. */
export interface FiltryTerminow {
  rodzaj?: RodzajFiltruTerminow;
  kogo?: KogoDotyczyFiltr;
  rolaRodzicaPrzyjmujacego?: 'matka' | 'ojciec';
  etap?: Etap;
  rodzic?: RodzicSprawy;
}

/** Termin na liście: każdy termin sprawy osobno, drugi termin sprawy z etykietą. */
export interface TerminNaLiscie extends TerminSprawy {
  termin: DataISO;
  drugi?: { kluczEtykiety: string };
}

export interface SekcjeTerminow {
  poTerminie: TerminNaLiscie[];
  najblizsze30Dni: TerminNaLiscie[];
  pozniej: TerminNaLiscie[];
}

export const OKNO_NAJBLIZSZYCH_DNI = 30;

function czyPowtarzalna(sprawa: PozycjaPlanu | undefined): boolean {
  return !!sprawa?.idPozycji && REGULY_POZYCJI[sprawa.idPozycji]?.typ === 'coroczny';
}

function dotyczy(sprawa: PozycjaPlanu, kogo: KogoDotyczyFiltr, rolaPrzyjmujacego?: 'matka' | 'ojciec'): boolean {
  if (kogo === 'wszyscy') return true;
  const wspolne: RodzicSprawy[] = ['matka-albo-ojciec', 'oboje-rodzice'];
  if (wspolne.includes(sprawa.rodzic)) return true;
  if (sprawa.rodzic === 'rodzic-przyjmujacy') return kogo === 'matka' ? rolaPrzyjmujacego !== 'ojciec' : rolaPrzyjmujacego === 'ojciec';
  return sprawa.rodzic === kogo;
}

/** Terminy spraw do zrobienia z terminem, każdy termin osobno, w kolejności dat. */
export function terminyDoZrobienia(kalendarz: KalendarzTerminow, plan: PlanRodziny, dzis: DataISO): { termin: TerminNaLiscie; sprawa: PozycjaPlanu }[] {
  const wynik: { termin: TerminNaLiscie; sprawa: PozycjaPlanu }[] = [];
  for (const t of kalendarz.terminy) {
    const sprawa = plan.pozycje.find((p) => p.idSprawy === t.idSprawy);
    if (!sprawa || statusDlaKalendarza(sprawa, dzis) !== 'do-zrobienia' || t.termin === null) continue;
    const dni = roznicaDni(dzis, t.termin);
    wynik.push({ termin: { ...t, termin: t.termin, dniDoTerminu: dni, poTerminie: t.termin < dzis }, sprawa });
    if (t.drugiTermin) {
      const data = t.drugiTermin.data;
      wynik.push({
        termin: { ...t, termin: data, dniDoTerminu: roznicaDni(dzis, data), poTerminie: data < dzis, drugi: { kluczEtykiety: t.drugiTermin.kluczEtykiety } },
        sprawa,
      });
    }
  }
  return wynik.sort((a, b) => (a.termin.termin < b.termin.termin ? -1 : a.termin.termin > b.termin.termin ? 1 : a.sprawa.idSprawy.localeCompare(b.sprawa.idSprawy)));
}

/** Czy termin spełnia filtry listy. */
export function spelniaFiltry(t: TerminSprawy, sprawa: PozycjaPlanu, filtry: FiltryTerminow): boolean {
  if (filtry.rodzaj === 'z-kosztem' && t.koszt.rodzaj !== 'kwota') return false;
  if (filtry.rodzaj === 'powtarzalne' && !czyPowtarzalna(sprawa)) return false;
  if (filtry.kogo && !dotyczy(sprawa, filtry.kogo, filtry.rolaRodzicaPrzyjmujacego)) return false;
  if (filtry.rodzic && sprawa.rodzic !== filtry.rodzic) return false;
  if (filtry.etap && sprawa.etap !== filtry.etap) return false;
  return true;
}

/** Terminy spraw podzielone na sekcje względem dnia `dzis`. */
export function sekcjeTerminow(kalendarz: KalendarzTerminow, plan: PlanRodziny, dzis: DataISO, filtry: FiltryTerminow): SekcjeTerminow {
  const granica = dodajDni(dzis, OKNO_NAJBLIZSZYCH_DNI);
  const sekcje: SekcjeTerminow = { poTerminie: [], najblizsze30Dni: [], pozniej: [] };
  for (const { termin, sprawa } of terminyDoZrobienia(kalendarz, plan, dzis)) {
    if (!spelniaFiltry(termin, sprawa, filtry)) continue;
    if (termin.termin < dzis) sekcje.poTerminie.push(termin);
    else if (termin.termin <= granica) sekcje.najblizsze30Dni.push(termin);
    else sekcje.pozniej.push(termin);
  }
  return sekcje;
}

/** Liczniki filtrów listy terminów. */
export function licznikiFiltrow(kalendarz: KalendarzTerminow, plan: PlanRodziny, dzis: DataISO, filtry: FiltryTerminow): Record<RodzajFiltruTerminow, number> {
  const wszystkie = terminyDoZrobienia(kalendarz, plan, dzis).filter(({ termin, sprawa }) => spelniaFiltry(termin, sprawa, { ...filtry, rodzaj: 'wszystkie' }));
  return {
    wszystkie: wszystkie.length,
    'z-kosztem': wszystkie.filter(({ termin }) => termin.koszt.rodzaj === 'kwota').length,
    powtarzalne: wszystkie.filter(({ sprawa }) => czyPowtarzalna(sprawa)).length,
  };
}

/** Podsumowanie terminów dla karty Najbliższe terminy na ViewFamilyPlan. */
export function podsumowanieTerminow(kalendarz: KalendarzTerminow, plan: PlanRodziny, dzis: DataISO): {
  najblizszy: TerminNaLiscie | null;
  poTerminie: TerminNaLiscie[];
  w30Dniach: number;
  wszystkie: number;
} {
  const sekcje = sekcjeTerminow(kalendarz, plan, dzis, {});
  return {
    najblizszy: sekcje.najblizsze30Dni[0] ?? sekcje.pozniej[0] ?? null,
    poTerminie: sekcje.poTerminie,
    w30Dniach: sekcje.najblizsze30Dni.length,
    wszystkie: sekcje.poTerminie.length + sekcje.najblizsze30Dni.length + sekcje.pozniej.length,
  };
}
