// Stan zgody na dane dotyczące zdrowia (kontrakt, sekcja 5.2 i 7.1; analiza 3.1.1, reguły R7–R10).
// Stan zgody to rodzaj ostatniej decyzji; brak decyzji oznacza, że konto jeszcze jej nie podjęło.
import { porownajZnaczniki } from '@/domena/daty';
import type { DecyzjaOZgodzie, RodzajDecyzjiOZgodzie, StanZgody } from '@/domena/typy';

export const WERSJA_TRESCI_ZGODY = '1.0';
export const DNI_DO_USUNIECIA_DANYCH = 30;

const STAN_PO_DECYZJI: Record<RodzajDecyzjiOZgodzie, StanZgody> = {
  udzielenie: 'udzielona',
  odmowa: 'odmowa',
  wycofanie: 'wycofana',
};

// Decyzja z najpóźniejszym czasem; przy równym czasie decyzja zapisana później w historii.
export function ostatniaDecyzja(decyzje: readonly DecyzjaOZgodzie[]): DecyzjaOZgodzie | null {
  let wynik: DecyzjaOZgodzie | null = null;
  for (const decyzja of decyzje) {
    if (wynik === null || porownajZnaczniki(decyzja.czas, wynik.czas) >= 0) wynik = decyzja;
  }
  return wynik;
}

export function stanZgody(decyzje: readonly DecyzjaOZgodzie[]): StanZgody {
  const decyzja = ostatniaDecyzja(decyzje);
  return decyzja === null ? 'brak-decyzji' : STAN_PO_DECYZJI[decyzja.rodzaj];
}

// Filtr zgody: Dane ciąży i dziecka wolno zapisać i użyć wyłącznie przy udzielonej zgodzie.
export function czyMaZgode(decyzje: readonly DecyzjaOZgodzie[]): boolean {
  return stanZgody(decyzje) === 'udzielona';
}
