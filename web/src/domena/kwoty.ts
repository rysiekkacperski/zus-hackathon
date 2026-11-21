// Kwoty, procenty i liczby (kontrakt, sekcja 1.3 i 7.1).
// Kwoty są w groszach (liczba całkowita), procenty jako liczba (81.5 = 81,5%).
// Grupowanie tysięcy jest ręczne, bo Intl.NumberFormat('pl-PL') nie grupuje liczb czterocyfrowych.
import type { Grosze, Procent } from '@/domena/typy';
import { teksty } from '@/teksty';

// Twarda spacja U+00A0 rozdziela grupy tysięcy oraz kwotę i walutę.
export const TWARDA_SPACJA = '\u00A0';

// Separator tysięcy we wpisie: spacja, twarda spacja U+00A0 albo wąska twarda spacja U+202F.
const SEPARATORY_TYSIECY = /[ \u00A0\u202F]/g;
const WZOR_KWOTY = /^(\d{1,3}(?:[ \u00A0\u202F]\d{3})+|\d+)(?:[.,](\d{1,2}))?$/;
const DOMYSLNE_MIEJSCA_LICZBY = 2;
// Od 1e21 Number.prototype.toFixed zwraca zapis wykładniczy.
const GRANICA_ZAPISU_DZIESIETNEGO = 1e21;

function grupujTysiace(cyfry: string): string {
  let wynik = '';
  for (let i = cyfry.length; i > 0; i -= 3) {
    const grupa = cyfry.slice(Math.max(0, i - 3), i);
    wynik = wynik === '' ? grupa : `${grupa}${TWARDA_SPACJA}${wynik}`;
  }
  return wynik;
}

// Połowa grosza w górę: Math.round na wartości w groszach; -0 zamienia na 0, NaN zostaje NaN.
export function zaokraglijDoGrosza(x: number): Grosze {
  return Math.round(x) + 0;
}

// Część kwoty bez zaokrąglenia, np. procentKwoty(100000, 13.71) = 13710.
export function procentKwoty(g: Grosze, p: Procent): number {
  return (g * p) / 100;
}

// 123456 → '1 234,56', 80000 → '800,00' (grupy rozdziela twarda spacja).
// Kwota spoza liczb skończonych (NaN, Infinity) to błąd wyliczenia, więc funkcja go zgłasza.
export function formatujKwoteBezWaluty(g: Grosze): string {
  if (!Number.isFinite(g)) throw new Error(`Kwota nie jest liczbą skończoną: ${g}`);
  const grosze = zaokraglijDoGrosza(g);
  const znak = grosze < 0 ? '-' : '';
  const bezZnaku = Math.abs(grosze);
  const zlote = Math.floor(bezZnaku / 100);
  const reszta = bezZnaku - zlote * 100;
  return `${znak}${grupujTysiace(String(zlote))},${String(reszta).padStart(2, '0')}`;
}

// 480600 → '4 806,00 zł'.
export function formatujKwote(g: Grosze): string {
  return `${formatujKwoteBezWaluty(g)}${TWARDA_SPACJA}${teksty.wspolne.zl}`;
}

// 12500 → '12 500', 2.5 → '2,5', formatujLiczbe(2.5, 2) → '2,50'.
// Bez `miejsca` pokazuje najwyżej 2 miejsca po przecinku i pomija końcowe zera.
export function formatujLiczbe(n: number, miejsca?: number): string {
  if (!Number.isFinite(n) || Math.abs(n) >= GRANICA_ZAPISU_DZIESIETNEGO) return String(n);
  const zapis = Math.abs(n).toFixed(miejsca ?? DOMYSLNE_MIEJSCA_LICZBY);
  const [calkowite, ulamkowe = ''] = zapis.split('.');
  const ulamek = miejsca === undefined ? ulamkowe.replace(/0+$/, '') : ulamkowe;
  const zero = /^0*$/.test(calkowite) && /^0*$/.test(ulamek);
  const znak = n < 0 && !zero ? '-' : '';
  const czescCalkowita = grupujTysiace(calkowite);
  return ulamek === '' ? `${znak}${czescCalkowita}` : `${znak}${czescCalkowita},${ulamek}`;
}

// 81.5 → '81,5%', 100 → '100%', 13.71 → '13,71%'.
export function formatujProcent(p: Procent): string {
  return `${formatujLiczbe(p)}%`;
}

// Wpis kwoty w polu: cyfry z opcjonalnymi spacjami (także U+00A0) co trzy cyfry jako separatorem tysięcy
// i przecinkiem albo kropką dziesiętną z najwyżej 2 miejscami. '1 850,50' → 185050, '1850.5' → 185050.
// Wartość ujemna, inne znaki i błędne grupowanie dają null (komunikat 0016).
export function parsujKwote(tekst: string): Grosze | null {
  const m = WZOR_KWOTY.exec(tekst.trim());
  if (!m) return null;
  const zlote = Number(m[1].replace(SEPARATORY_TYSIECY, ''));
  const grosze = Number((m[2] ?? '').padEnd(2, '0'));
  const wynik = zlote * 100 + grosze;
  return Number.isSafeInteger(wynik) ? wynik : null;
}
