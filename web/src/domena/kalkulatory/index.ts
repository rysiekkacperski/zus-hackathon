// Silnik kalkulatora zasiłku macierzyńskiego (kontrakt, sekcja 7.2, domena/kalkulatory/*.ts).
// Właściciel: u09. Moduł zbiera eksporty plików u09; wariant.ts i podzial.ts (u26) importuje się wprost.
// Zaślepka fundamentu: implementuje u09. Właściciel zachowuje ścieżkę importu `@/domena/kalkulatory`.
export * from '@/domena/kalkulatory/podstawa';
export * from '@/domena/kalkulatory/dane-wejsciowe';
export * from '@/domena/kalkulatory/prawo';
export * from '@/domena/kalkulatory/scenariusz';
export * from '@/domena/kalkulatory/okresy';
export * from '@/domena/kalkulatory/harmonogram';
