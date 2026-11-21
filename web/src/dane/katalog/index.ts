// Rejestr danych startowych katalogu świadczeń (kontrakt, sekcje 5.8, 8 i 13.2 pkt 7).
// Rejestr składa pliki właścicieli w seed katalogu. Funkcja `zlozKatalog(seed, edycje)` z `domena/katalog/zloz.ts`
// nakłada na seed edycje Administratora i nadaje katalogowi wersję.
import { podmiotyWsparcia } from '@/dane/katalog/podmioty-wsparcia';
import { pozycjeKatalogu } from '@/dane/katalog/pozycje';
import { regulySwiadczen } from '@/dane/katalog/reguly-swiadczen';
import { wpisySlownikaDokumentow } from '@/dane/katalog/slownik-dokumentow';
import { wpisySlownikaKwot } from '@/dane/katalog/slownik-kwot';
import { wpisySlownikaWymiarow } from '@/dane/katalog/slownik-wymiarow';
import type { DataISO, Katalog } from '@/domena/typy';

/** Data uruchomienia katalogu świadczeń. */
export const DATA_URUCHOMIENIA_KATALOGU: DataISO = '2026-01-01';

/** Seed katalogu: pozycje, słowniki kwot i progów oraz wymiarów i okresów, reguły świadczeń, dokumenty i podmioty wsparcia. */
export const seedKatalogu: Omit<Katalog, 'wersja'> = {
  pozycje: [...pozycjeKatalogu],
  slowniki: [...wpisySlownikaKwot, ...wpisySlownikaWymiarow],
  reguly: [...regulySwiadczen],
  dokumenty: [...wpisySlownikaDokumentow],
  podmiotyWsparcia: [...podmiotyWsparcia],
  dataUruchomienia: DATA_URUCHOMIENIA_KATALOGU,
};
