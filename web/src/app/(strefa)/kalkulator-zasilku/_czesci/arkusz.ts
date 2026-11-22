// Klasy arkuszy z formularzem na ViewCalcMaternityResult: stopka z przyciskami (ostatni element okna) przykleja się
// do dolnej krawędzi arkusza, więc przy przewijaniu treści wewnątrz arkusza przyciski zostają widoczne.
// Przekazuj je tylko arkuszom ze `stopka`, bo selektor wskazuje ostatni element potomny okna.
export const KLASY_ARKUSZA_Z_PRZYKLEJONA_STOPKA = [
  '[&>*:last-child]:sticky [&>*:last-child]:-bottom-5 [&>*:last-child]:z-10',
  '[&>*:last-child]:-mx-5 [&>*:last-child]:-mb-5 [&>*:last-child]:px-5 [&>*:last-child]:pt-4 [&>*:last-child]:pb-5',
  '[&>*:last-child]:border-t [&>*:last-child]:border-line-soft [&>*:last-child]:bg-surface-card',
].join(' ');
