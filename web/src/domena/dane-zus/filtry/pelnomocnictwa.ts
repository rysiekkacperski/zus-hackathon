// Filtr odczytu danych z konta ZUS `pelnomocnictwa` (kontrakt, sekcja 7.2). Właściciel: u23 (Dołączenie drugiego rodzica i pełnomocnictwo PEL).
// Kopia konta zawiera wyłącznie pełnomocnictwa PEL do roli Ubezpieczony udzielone temu kontu. Dane mocodawcy
// odczytane na podstawie pełnomocnictwa żyją w Danych rodziny, więc kopia ich nie przechowuje.
import type { FiltrOdczytu } from '@/domena/dane-zus/filtry/typ';

export const pelnomocnictwa: FiltrOdczytu = (kopia) => {
  const { daneDrugiegoRodzicaZPel, ...reszta } = kopia;
  void daneDrugiegoRodzicaZPel;
  return {
    ...reszta,
    pelnomocnictwa: kopia.pelnomocnictwa.filter((p) => p.peselPelnomocnika === kopia.pesel && p.rola === 'ubezpieczony'),
  };
};
