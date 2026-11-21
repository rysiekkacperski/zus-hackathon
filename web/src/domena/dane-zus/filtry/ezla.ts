// Filtr odczytu danych z konta ZUS `ezla` (kontrakt, sekcja 7.2; ANALIZY/16 R1). Właściciel: u14.
// Kopia zawiera zaświadczenia e-ZLA wystawione nie wcześniej niż 12 miesięcy przed dniem odczytu
// i zastępuje nimi zaświadczenia z poprzedniego odczytu.
import { dataZeZnacznika, dodajMiesiace } from '@/domena/daty';
import type { FiltrOdczytu } from '@/domena/dane-zus/filtry/typ';
import type { DataISO } from '@/domena/typy';
import { zaswiadczeniaOdNajnowszych } from '@/domena/zasilki/okres-zasilkowy';

/** Pierwszy dzień okna odczytu zaświadczeń: dzień odczytu minus 12 miesięcy, granica włącznie. */
export function poczatekOknaEzla(dzienOdczytu: DataISO): DataISO {
  return dodajMiesiace(dzienOdczytu, -12);
}

export const ezla: FiltrOdczytu = (kopia, w) => {
  const poczatek = poczatekOknaEzla(dataZeZnacznika(w.teraz));
  const zrodlo = w.zrodlo.zaswiadczeniaEzla ?? kopia.zaswiadczeniaEzla;
  return {
    ...kopia,
    zaswiadczeniaEzla: zaswiadczeniaOdNajnowszych(zrodlo.filter((z) => z.dataWystawienia >= poczatek)),
  };
};
