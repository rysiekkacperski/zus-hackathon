// Dane przykładowej sprawy z żądania REST API nałożone na puste dane sprawy, grupa po grupie, żeby każde pole miało
// wartość i źródło (WartoscSprawy), tak jak dane sprawy w przeglądarce po scaleniu odczytów dokumentów.
import { pusteDaneSprawy } from '@/domena/przykladowe-sprawy/scalanie';
import type { DaneSprawy } from '@/domena/typy';
import { czyObiekt, sciezka, type BledyWejscia, type Obiekt } from '@/serwer/api/walidacja';

export function daneSprawyZZadania(o: Obiekt, bledy: BledyWejscia, pole = 'dane'): DaneSprawy {
  const puste = pusteDaneSprawy() as unknown as Obiekt;
  const wynik: Obiekt = { ...puste };
  for (const [klucz, wartosc] of Object.entries(o)) {
    if (!(klucz in puste)) continue;
    const pusta = puste[klucz];
    if (!czyObiekt(wartosc)) {
      bledy[sciezka(pole, klucz)] = '0006';
      continue;
    }
    // Grupa pól (na przykład `tytul`) albo pojedyncze pole WartoscSprawy (na przykład `wymiarCzasuPracy`).
    wynik[klucz] = czyObiekt(pusta) && !('wartosc' in pusta) ? { ...pusta, ...wartosc } : wartosc;
  }
  return wynik as unknown as DaneSprawy;
}
