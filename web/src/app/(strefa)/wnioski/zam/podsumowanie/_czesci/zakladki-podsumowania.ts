// Zakładki ViewZamSummary: po jednej zakładce na sekcję podsumowania, w kolejności sekcji wniosku, oraz braki
// danych w sekcjach. Brak blokuje wysłanie, a zakładka z brakiem pokazuje wskaźnik błędu.
import type { IdWidoku, KodKomunikatu, WniosekZam } from '@/domena/typy';
import { walidujRachunek } from '@/domena/walidacje';

export const ZAKLADKI_PODSUMOWANIA_ZAM = ['rodzaj', 'okres', 'dane', 'rachunek', 'oswiadczenia', 'adresat'] as const;

export type ZakladkaPodsumowaniaZam = (typeof ZAKLADKI_PODSUMOWANIA_ZAM)[number];

/** Ekran kreatora, do którego prowadzi „Zmień” w zakładce; sekcja adresata nie ma akcji zmiany. */
export const EKRAN_ZMIANY_ZAKLADKI: Record<ZakladkaPodsumowaniaZam, IdWidoku | null> = {
  rodzaj: 'ViewZamLeaveType',
  okres: 'ViewZamPeriod',
  dane: 'ViewZamData',
  rachunek: 'ViewZamData',
  oswiadczenia: 'ViewZamStatements',
  adresat: null,
};

export type BrakiPodsumowaniaZam = Partial<Record<ZakladkaPodsumowaniaZam, KodKomunikatu>>;

/**
 * Braki danych wniosku w sekcjach podsumowania, z kodami komunikatów kroków kreatora: rodzaj urlopu (0006),
 * imię i nazwisko dziecka (0028, 0029), numer rachunku (0039–0041) i potwierdzenie oświadczeń (0043).
 */
export function brakiPodsumowaniaZam(wniosek: WniosekZam): BrakiPodsumowaniaZam {
  const braki: BrakiPodsumowaniaZam = {};
  if (!wniosek.rodzajUrlopu) braki.rodzaj = '0006';
  for (const dziecko of wniosek.daneDzieci) {
    if (!dziecko.imie?.trim()) {
      braki.dane = '0028';
      break;
    }
    if (!dziecko.nazwisko?.trim()) {
      braki.dane = '0029';
      break;
    }
  }
  const rachunek = walidujRachunek(wniosek.numerRachunku ?? '', true);
  if (rachunek) braki.rachunek = rachunek;
  if (!wniosek.oswiadczeniaPotwierdzone) braki.oswiadczenia = '0043';
  return braki;
}

/** Pierwsza zakładka z brakiem danych w kolejności zakładek. */
export function pierwszaZakladkaZBrakiem(braki: BrakiPodsumowaniaZam): ZakladkaPodsumowaniaZam | null {
  return ZAKLADKI_PODSUMOWANIA_ZAM.find((z) => braki[z] !== undefined) ?? null;
}
