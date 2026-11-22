// Katalog świadczeń dla REST API w wersji 1. Jedyne miejsce wpięcia magazynu katalogu: wyliczenia API czytają
// katalog złożony z seedu i edycji Administratora z serwerowego magazynu (src/serwer/katalog/magazyn.ts), który
// zapisuje usługa /api/katalog. Zmiana źródła katalogu, na przykład na bazę danych ZUS, dotyczy wyłącznie tej funkcji.
import type { Katalog } from '@/domena/typy';
import { odczytajKatalogZlozony } from '@/serwer/katalog/magazyn';

export function katalogSerwera(): Promise<Katalog> {
  return odczytajKatalogZlozony();
}
