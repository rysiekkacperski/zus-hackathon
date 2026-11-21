// Bieżący etap ścieżki rodzica (kontrakt, sekcja 7.2; historyjka 3.6.1.2.1, wymaganie bieżącego etapu).
// Właściciel: u08 (Silnik planu rodziny).
import { dodajDni } from '@/domena/daty';
import type { DaneCiazyIDziecka, DataISO, Etap } from '@/domena/typy';

/** Etapy ścieżki rodzica w stałej kolejności planu. */
export const ETAPY: readonly Etap[] = ['ciaza', 'pierwsze-tygodnie', 'urlopy-i-zasilek', 'pieniadze-na-dziecko', 'powrot-do-pracy'];

/** Liczba dni po porodzie, przez które bieżącym etapem są Pierwsze tygodnie po porodzie (6 tygodni). */
export const DNI_PIERWSZYCH_TYGODNI = 42;

/** Ostatni dzień etapu Pierwsze tygodnie po porodzie: data porodu powiększona o 42 dni. */
export function koniecPierwszychTygodni(dataPorodu: DataISO): DataISO {
  return dodajDni(dataPorodu, DNI_PIERWSZYCH_TYGODNI);
}

/**
 * Etap rodziny w dniu `dzis`. Przed potwierdzeniem daty porodu: Ciąża. Od porodu do 42. dnia po porodzie
 * włącznie: Pierwsze tygodnie po porodzie, potem Urlopy i zasiłek macierzyński. Przy przyjęciu dziecka bez
 * ciąży od dnia przyjęcia: Urlopy i zasiłek macierzyński.
 */
export function wyznaczBiezacyEtap(daneCiazy: DaneCiazyIDziecka | null, dzis: DataISO): Etap {
  if (daneCiazy === null) return 'ciaza';
  const { dataPorodu, dataPoroduPotwierdzona, przyjecie, przewidywanyTerminPorodu } = daneCiazy;
  if (dataPoroduPotwierdzona && dataPorodu !== undefined) {
    return dzis <= koniecPierwszychTygodni(dataPorodu) ? 'pierwsze-tygodnie' : 'urlopy-i-zasilek';
  }
  if (przyjecie !== undefined && przewidywanyTerminPorodu === undefined && dzis >= przyjecie.dataPrzyjecia) {
    return 'urlopy-i-zasilek';
  }
  return 'ciaza';
}

/** Indeks etapu w kolejności planu. */
export function indeksEtapu(etap: Etap): number {
  return ETAPY.indexOf(etap);
}
