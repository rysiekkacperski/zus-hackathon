// Rachunek kwot kalkulatora na liczbach całkowitych w groszach (kontrakt, sekcja 1.3).
// Właściciel: u09 (Silnik kalkulatora zasiłku macierzyńskiego).
// Dzienna stawka to podstawa wymiaru podzielona przez 30 bez zaokrąglenia pośredniego, więc kwoty liczymy
// jako jeden ułamek i zaokrąglamy połowę grosza w górę.
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

/** Kwota za dni: podstawa / 30 × stawka × liczba dni, zaokrąglona do grosza. */
export function kwotaZaDni(podstawa: Grosze, stawka: Procent, dni: number): Grosze {
  return podzielZaokraglij(Math.round(podstawa) * stawkaWSetnych(stawka) * dni, 300000);
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
