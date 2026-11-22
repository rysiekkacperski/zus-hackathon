// Pomocnicze funkcje losowania na źródle `losuj` dostarczonym przez wywołującego (kontrakt, sekcja 1.2).
// Domena nie wywołuje Math.random() ani crypto; operacja magazynu przekazuje `losuj` z obsługi zdarzenia,
// a test przekazuje źródło deterministyczne.

export type Losuj = () => number;               // liczba z przedziału [0, 1)

export const ZNAKI_A_Z_0_9 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export const CYFRY = '0123456789';

// Liczba całkowita z przedziału [min, max] włącznie.
export function losowaLiczbaCalkowita(losuj: Losuj, min: number, max: number): number {
  const zakres = max - min + 1;
  const indeks = Math.min(zakres - 1, Math.max(0, Math.floor(losuj() * zakres)));
  return min + indeks;
}

export function losowyCiag(losuj: Losuj, dlugosc: number, alfabet: string = ZNAKI_A_Z_0_9): string {
  let wynik = '';
  for (let i = 0; i < dlugosc; i++) wynik += alfabet[losowaLiczbaCalkowita(losuj, 0, alfabet.length - 1)];
  return wynik;
}

export function losoweCyfry(losuj: Losuj, dlugosc: number): string {
  return losowyCiag(losuj, dlugosc, CYFRY);
}

// Źródło deterministyczne (generator mulberry32) do testów, scenariuszy i danych powtarzalnych.
export function losujZZiarna(ziarno: number): Losuj {
  let stan = ziarno >>> 0;
  return () => {
    stan = (stan + 0x6d2b79f5) >>> 0;
    let t = stan;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
