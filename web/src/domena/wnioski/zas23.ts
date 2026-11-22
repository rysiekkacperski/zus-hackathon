// Rezygnacja matki z dalszej części zasiłku macierzyńskiego przy umowie zlecenia i jednoosobowej działalności
// gospodarczej (u34, Story 3.9.2.1.1, komunikaty 0207 i 0261): wniosek ZAS-23 w eZUS, gdy zasiłek wypłaca ZUS,
// albo pisemny wniosek do zleceniodawcy, gdy zasiłek wypłaca płatnik składek, oba z oświadczeniem ojca dziecka.
// Funkcje są czyste: dzień dzisiejszy dostają w argumencie.
//
// Podstawa: zus.pl, „Jak matka dziecka może skrócić po 14 tygodniach okres wypłaty zasiłku macierzyńskiego,
// a ojciec dziecka z tego powodu uzyskać zasiłek macierzyński”: ubezpieczona matka po wykorzystaniu zasiłku
// macierzyńskiego przez co najmniej 14 tygodni po porodzie może zrezygnować z zasiłku za pozostały okres,
// dołącza oświadczenie, od kiedy ojciec dziecka będzie korzystał z zasiłku, a ubezpieczona niebędąca pracownicą
// składa wniosek najpóźniej przed datą planowanego zakończenia korzystania z zasiłku. Wzór ZAS-23 (zus.pl,
// wzory formularzy, zasiłek macierzyński): wniosek o skrócenie lub wstrzymanie okresu wypłaty zasiłku macierzyńskiego.
import { dodajDni, porownajDaty } from '@/domena/daty';
import type { DataISO, KodKomunikatu, Okres, WniosekOUrlop } from '@/domena/typy';
import { najwczesniejszyPowrot, walidujDatePowrotu, type UrlopMacierzynski } from '@/domena/wnioski/rezygnacja';

export type PoleRezygnacjiZZasilku = 'data' | 'ojciec' | 'oswiadczenie';

/**
 * Zakres daty, od której matka rezygnuje z zasiłku: od dnia po 14 tygodniach po porodzie (przy orzeczeniu
 * o niezdolności do samodzielnej egzystencji po 8 tygodniach), nie wcześniej niż jutro, do ostatniego dnia
 * zasiłku za okres urlopu macierzyńskiego.
 */
export function zakresRezygnacjiZZasilku(urlop: UrlopMacierzynski, zOrzeczeniem: boolean, dzis: DataISO): Okres {
  const najwczesniej = najwczesniejszyPowrot(urlop, zOrzeczeniem);
  const jutro = dodajDni(dzis, 1);
  return { od: porownajDaty(najwczesniej, jutro) < 0 ? jutro : najwczesniej, do: urlop.okres.do };
}

/**
 * Walidacja daty rezygnacji z zasiłku: obowiązkowa (0201), DD.MM.RRRR (0010), po 14 tygodniach (0141)
 * albo po 8 tygodniach przy orzeczeniu (0209), najpóźniej w ostatnim dniu zasiłku (0042) i późniejsza niż
 * dzisiejsza (0336), bo wniosek składa się przed dniem, od którego matka rezygnuje.
 */
export function walidujDateRezygnacjiZZasilku(
  tekst: string,
  urlop: UrlopMacierzynski,
  zOrzeczeniem: boolean,
  dzis: DataISO,
): { data: DataISO } | { kod: KodKomunikatu } {
  const wynik = walidujDatePowrotu(tekst, urlop, zOrzeczeniem);
  if ('kod' in wynik) return wynik;
  if (porownajDaty(wynik.data, dzis) <= 0) return { kod: '0336' };
  return wynik;
}

/**
 * Imię i nazwisko ojca dziecka do oświadczenia zapisanej rezygnacji: imię wpisane przez matkę w formularzu i zapisane
 * we wniosku, a dla wniosku zapisanego bez tego pola imię ojca dziecka z profilu rodziny.
 */
export function ojciecZRezygnacji(wniosek: Pick<WniosekOUrlop, 'rezygnacja'>, ojciecZProfilu: string): string {
  return wniosek.rezygnacja?.ojciec?.trim() || ojciecZProfilu;
}

export interface FormularzRezygnacjiZZasilku {
  data: string;
  ojciec: string;
  oswiadczenie: boolean;
}

/** Błędy pól formularza: data rezygnacji, imię i nazwisko ojca dziecka (0028) i potwierdzenie oświadczenia ojca (0043). */
export function walidujRezygnacjeZZasilku(
  f: FormularzRezygnacjiZZasilku,
  urlop: UrlopMacierzynski,
  zOrzeczeniem: boolean,
  dzis: DataISO,
): Partial<Record<PoleRezygnacjiZZasilku, KodKomunikatu>> {
  const bledy: Partial<Record<PoleRezygnacjiZZasilku, KodKomunikatu>> = {};
  const data = walidujDateRezygnacjiZZasilku(f.data, urlop, zOrzeczeniem, dzis);
  if ('kod' in data) bledy.data = data.kod;
  if (f.ojciec.trim() === '') bledy.ojciec = '0028';
  else if (!/^[\p{L}][\p{L} '-]*$/u.test(f.ojciec.trim())) bledy.ojciec = '0030';
  if (!f.oswiadczenie) bledy.oswiadczenie = '0043';
  return bledy;
}
