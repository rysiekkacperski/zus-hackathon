// Podział formularza ViewCalcMaternityInput na części (?czesc=N), tak aby każda część mieściła się w oknie
// 1440×800 bez przewijania. Lista części zależy od zdarzenia: pola porodu, przyjęcia dziecka i przewidywanego porodu
// mają własne części, a w trybie ?zrodlo=przykladowa-sprawa pierwszą częścią są dane przykładowej sprawy.
import type { PoleFormularza, Zdarzenie } from './formularz';

export type CzescKalkulatora =
  | 'sprawa'
  | 'zdarzenie'
  | 'przyjecie'
  | 'datyPrzyjecia'
  | 'dziecko'
  | 'wczesniactwo'
  | 'strata'
  | 'formy';

/** Pola każdej części w kolejności na ekranie; „Przejdź dalej” sprawdza pola bieżącej części. */
export const POLA_CZESCI: Record<CzescKalkulatora, readonly PoleFormularza[]> = {
  sprawa: [],
  zdarzenie: ['zdarzenie', 'dataPorodu', 'przewidywanyTermin'],
  przyjecie: ['formaPrzyjecia', 'odroczenie'],
  datyPrzyjecia: ['dataPrzyjecia', 'dataUrodzeniaDziecka'],
  dziecko: ['liczbaDzieci', 'zaZyciem'],
  wczesniactwo: ['wczesniactwo', 'tydzienCiazy', 'masaG', 'dniPobytu'],
  strata: ['strata', 'rodzajStraty', 'dataZgonu', 'liczbaDzieciStraty'],
  formy: ['formaMatki', 'formaDrugiego'],
};

/** Części formularza dla zdarzenia; bez wybranego zdarzenia lista ma postać listy przewidywanego porodu. */
export function czesciKalkulatora(zdarzenie: Zdarzenie | null, zPrzykladowejSprawy: boolean): CzescKalkulatora[] {
  const zalezne: CzescKalkulatora[] =
    zdarzenie === 'porod'
      ? ['dziecko', 'wczesniactwo', 'strata']
      : zdarzenie === 'przyjecie'
        ? ['przyjecie', 'datyPrzyjecia', 'dziecko']
        : ['dziecko'];
  return [...(zPrzykladowejSprawy ? (['sprawa'] as const) : []), 'zdarzenie', ...zalezne, 'formy'];
}
