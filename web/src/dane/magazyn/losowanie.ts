// Źródło losowości operacji magazynu (kontrakt, sekcja 1.2). Funkcje domeny dostają losowość jako
// argument `losuj: () => number`; operacje wywołują te funkcje wyłącznie w obsłudze zdarzeń.

const ZAKRES_UINT32 = 0x1_0000_0000;

function losoweSlowa(liczba: number): Uint32Array {
  const slowa = new Uint32Array(liczba);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(slowa);
  } else {
    for (let i = 0; i < liczba; i += 1) slowa[i] = Math.floor(Math.random() * ZAKRES_UINT32);
  }
  return slowa;
}

/** Liczba z przedziału [0, 1) do przekazania funkcjom domeny jako `losuj`. */
export function losuj(): number {
  return losoweSlowa(1)[0] / ZAKRES_UINT32;
}

const ALFANUMERYCZNE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/** Ciąg znaków z alfabetu (domyślnie A-Z0-9) o podanej długości. */
export function losowyCiag(dlugosc: number, alfabet: string = ALFANUMERYCZNE): string {
  let wynik = '';
  for (const slowo of losoweSlowa(dlugosc)) wynik += alfabet[slowo % alfabet.length];
  return wynik;
}

/** Identyfikator UUID w wersji 4. */
export function losowyUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bajty = new Uint8Array(16);
  const slowa = losoweSlowa(4);
  for (let i = 0; i < 16; i += 1) bajty[i] = (slowa[i >> 2] >>> ((i & 3) * 8)) & 0xff;
  bajty[6] = (bajty[6] & 0x0f) | 0x40;
  bajty[8] = (bajty[8] & 0x3f) | 0x80;
  const hex = [...bajty].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
