// Prawo rodzica do zasiłku macierzyńskiego w kalkulatorze (kontrakt, sekcja 7.2). Właściciel: u09 (Silnik kalkulatora zasiłku macierzyńskiego).
// Prawo ma rodzic, który w dniu porodu albo przyjęcia dziecka pracuje na umowie o pracę, wykonuje umowę zlecenia
// z dobrowolnym ubezpieczeniem chorobowym albo prowadzi jednoosobową działalność gospodarczą z dobrowolnym ubezpieczeniem
// chorobowym. Zasiłek przysługuje bez okresu wyczekiwania. Rodzic bez tytułu do ubezpieczenia, na umowie zlecenia
// albo w działalności bez dobrowolnego ubezpieczenia chorobowego nie ma prawa (0064).
import type { DaneWejscioweKalkulatora, FormaZatrudnienia, FormaZatrudnieniaDrugiegoRodzica, KodKomunikatu, RodzicWRodzinie } from '@/domena/typy';

export interface PrawoDoZasilku {
  przysluguje: boolean;
  kod?: KodKomunikatu;
  parametry?: Record<string, string>;
}

/** Prawo z formy zatrudnienia i opłacania dobrowolnego ubezpieczenia chorobowego. */
export function prawoZFormy(forma: FormaZatrudnieniaDrugiegoRodzica, dobrowolne: boolean): PrawoDoZasilku {
  switch (forma) {
    case 'umowa-o-prace':
      return { przysluguje: true };
    case 'umowa-zlecenia':
    case 'jdg':
      return dobrowolne ? { przysluguje: true } : { przysluguje: false, kod: '0064' };
    case 'brak-tytulu':
      return { przysluguje: false, kod: '0064' };
    case 'brak-drugiego-rodzica':
      return { przysluguje: false };
  }
}

/** Prawo rodzica do zasiłku z formy zatrudnienia i ubezpieczenia chorobowego w dniu porodu albo przyjęcia dziecka. */
export function ustalPrawoDoZasilku(d: DaneWejscioweKalkulatora, rodzic: RodzicWRodzinie): PrawoDoZasilku {
  const f = rodzic === 'matka' ? d.formaMatki.wartosc : d.formaDrugiegoRodzica.wartosc;
  return prawoZFormy(f.forma, f.dobrowolne);
}

/** Forma zatrudnienia rodzica w danych wejściowych; null przy rodzinie bez drugiego rodzica. */
export function formaRodzica(d: DaneWejscioweKalkulatora, rodzic: RodzicWRodzinie): FormaZatrudnienia | null {
  const f = rodzic === 'matka' ? d.formaMatki.wartosc.forma : d.formaDrugiegoRodzica.wartosc.forma;
  return f === 'brak-drugiego-rodzica' ? null : f;
}

/** Łączenie urlopu rodzicielskiego z pracą przysługuje wyłącznie pracownikowi (inaczej 0099). */
export function czyMozeLaczycZPraca(forma: FormaZatrudnienia | null): boolean {
  return forma === 'umowa-o-prace';
}
