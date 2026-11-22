// Rachunek kwot kalkulatora na liczbach całkowitych w groszach (kontrakt, sekcja 1.3).
// Właściciel: u09 (Silnik kalkulatora zasiłku macierzyńskiego).
// Stawka dzienna to podstawa wymiaru podzielona przez 30 i zaokrąglona do grosza, pomnożona przez stawkę i ponownie
// zaokrąglona do grosza, a kwota za okres to stawka dzienna pomnożona przez liczbę dni. Połowę grosza zaokrąglamy w górę.
import type { Grosze, Procent } from '@/domena/typy';

// Dzielenie z zaokrągleniem połowy w górę dla licznika ≥ 0 i mianownika > 0.
function podzielZaokraglij(licznik: number, mianownik: number): number {
  if (licznik < 0) return -podzielZaokraglij(-licznik, mianownik);
  return Math.floor((2 * licznik + mianownik) / (2 * mianownik));
}

// Stawka w setnych częściach procenta, np. 81,5% → 8150, 40,75% → 4075.
function stawkaWSetnych(stawka: Procent): number {
  return Math.round(stawka * 100);
}

/** Miesięczna wypłata: podstawa × stawka, zaokrąglona do grosza. */
export function kwotaMiesieczna(podstawa: Grosze, stawka: Procent): Grosze {
  return podzielZaokraglij(Math.round(podstawa) * stawkaWSetnych(stawka), 10000);
}

/** Stawka dzienna: podstawa / 30 zaokrąglona do grosza, pomnożona przez stawkę i ponownie zaokrąglona do grosza. */
export function stawkaDzienna(podstawa: Grosze, stawka: Procent): Grosze {
  const dzienna = podzielZaokraglij(Math.round(podstawa), 30);
  return podzielZaokraglij(dzienna * stawkaWSetnych(stawka), 10000);
}

/** Kwota za dni: stawka dzienna × liczba dni. */
export function kwotaZaDni(podstawa: Grosze, stawka: Procent, dni: number): Grosze {
  return stawkaDzienna(podstawa, stawka) * dni;
}

/**
 * Stawka dzienna za okres łączenia urlopu z pracą: stawka dzienna okresu pomniejszona o iloczyn tej stawki
 * i wymiaru pracy zaokrąglony do grosza, z iloczynem kończącym się połową grosza zaokrąglonym w dół.
 */
export function stawkaDziennaLaczenia(podstawa: Grosze, stawkaOkresu: Procent, wymiarPracy: Procent): Grosze {
  const pelna = stawkaDzienna(podstawa, stawkaOkresu);
  const licznik = pelna * Math.round(wymiarPracy * 100);
  const iloczyn = Math.ceil((2 * licznik - 10000) / 20000);
  return pelna - Math.max(0, iloczyn);
}

/** Procent kwoty zaokrąglony do grosza, np. pomniejszenie 13,71% podstawy. */
export function procentZaokraglony(kwota: number, procent: Procent): Grosze {
  return podzielZaokraglij(Math.round(kwota * 100) * stawkaWSetnych(procent), 1000000);
}

/** Zaokrąglenie w górę do pełnych 10 groszy. */
export function wGoreDo10Groszy(g: Grosze): Grosze {
  return Math.ceil(g / 10) * 10;
}

/** Kwota podzielona i zaokrąglona do grosza. */
export function podzielKwote(kwota: number, przez: number): Grosze {
  return podzielZaokraglij(Math.round(kwota * 1000), przez * 1000);
}
