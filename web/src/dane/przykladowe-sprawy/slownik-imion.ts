// Słownik imion i nazwisk zastępczych według płci (kontrakt, sekcja 8). Właściciel: u05.
// Dane zastępcze zastępują imię i nazwisko odczytane z dokumentu przykładowej sprawy.
import type { SlownikImion } from '@/domena/przykladowe-sprawy/dane-zastepcze';

export const slownikImion: SlownikImion = {
  kobieta: {
    imiona: ['Ewelina', 'Halina', 'Beata', 'Dorota', 'Iwona', 'Jolanta', 'Lucyna', 'Marzena', 'Renata', 'Sylwia', 'Urszula', 'Wioletta'],
    nazwiska: ['Mróz', 'Sowa', 'Wróbel', 'Kowal', 'Cichoń', 'Bąk', 'Kruk', 'Sikora', 'Żuk', 'Gil', 'Szpak', 'Dzik'],
  },
  mezczyzna: {
    imiona: ['Bogdan', 'Cezary', 'Damian', 'Edward', 'Grzegorz', 'Henryk', 'Leszek', 'Mirosław', 'Robert', 'Sławomir', 'Wiesław', 'Zbigniew'],
    nazwiska: ['Mróz', 'Sowa', 'Wróbel', 'Kowal', 'Cichoń', 'Bąk', 'Kruk', 'Sikora', 'Żuk', 'Gil', 'Szpak', 'Dzik'],
  },
};
