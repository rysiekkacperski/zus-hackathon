// Symulowany odczyt Danych z konta ZUS w REST API. Serwer czyta dane startowe kont z src/dane/konta-zus i przygotowuje kopię
// tą samą funkcją domeny co odczyt w przeglądarce (`przygotujKopie` z rejestrem filtrów odczytu). Stan symulowanego ZUS
// (wnioski wysłane z przewodnika i nadpisania scenariuszy demo) trzyma przeglądarka: GET zwraca dane startowe, a żądanie
// POST może przekazać ten stan w polu `stanSymulowany`, który serwer nakłada funkcją `zrodloweDaneKonta`.
import { zrodloweDaneKonta, type OsobaKontaZus } from '@/dane/konta-zus';
import { przygotujKopie } from '@/domena/dane-zus/odczyt';
import { walidujPesel } from '@/domena/pesel';
import type {
  DaneZKontaZus,
  KodKomunikatu,
  Pesel,
  StanSymulowanegoZus,
  ZnacznikCzasu,
  ZrodloweDaneKontaZus,
} from '@/domena/typy';
import { czyObiekt, czytajObiekt, czytajTekst, type BledyWejscia } from '@/serwer/api/walidacja';

export type WynikPeselu = { ok: true; pesel: Pesel } | { ok: false; kod: KodKomunikatu };

export function sprawdzPesel(tekst: unknown): WynikPeselu {
  if (typeof tekst !== 'string') return { ok: false, kod: '0024' };
  const wynik = walidujPesel(tekst);
  return wynik.ok ? { ok: true, pesel: wynik.pesel } : { ok: false, kod: wynik.kod };
}

/** Nagłówek żądania z PESEL konta. PESEL nie trafia do adresu, więc nie zapisują go logi serwera ani historia przeglądarki. */
export const NAGLOWEK_PESEL = 'X-Pesel';

/** PESEL konta z nagłówka X-Pesel żądania GET; brak nagłówka daje kod 0024, a błędny PESEL kod z walidacji. */
export function peselZNaglowka(zadanie: Request): WynikPeselu {
  const wartosc = zadanie.headers.get(NAGLOWEK_PESEL);
  return sprawdzPesel(wartosc === null ? undefined : wartosc.trim());
}

/**
 * Dane źródłowe konta; null dla konta Administrator ZUS, które nie ma danych konta ZUS. Stan symulowany z żądania
 * i imię z nazwiskiem konta spoza danych startowych działają tak samo jak w przeglądarce.
 */
export function zrodloKontaZus(
  pesel: Pesel,
  stanSymulowany: StanSymulowanegoZus | null = null,
  osoba?: OsobaKontaZus,
): ZrodloweDaneKontaZus | null {
  return zrodloweDaneKonta(pesel, stanSymulowany, osoba);
}

const LISTY_STANU = ['korespondencja', 'wnioskiZPrzewodnika', 'zaswiadczeniaORozliczeniach'] as const;

/**
 * Stan symulowanego ZUS z pola `stanSymulowany` żądania (StanSymulacjiZusApi): obiekt z numerem PESEL, listami
 * korespondencji, wniosków z przewodnika i zaświadczeń oraz opcjonalnymi nadpisaniami. Inna postać daje kod 0006 pola.
 */
export function czytajStanSymulowany(w: unknown, bledy: BledyWejscia, pole = 'stanSymulowany'): StanSymulowanegoZus | null {
  const o = czytajObiekt(w, pole, bledy);
  if (o === undefined) return null;
  const pesel = czytajTekst(o.pesel, `${pole}.pesel`, bledy, { wymagane: true });
  const listy: Partial<Record<(typeof LISTY_STANU)[number], unknown[]>> = {};
  for (const lista of LISTY_STANU) {
    const wartosc = o[lista] ?? [];
    if (Array.isArray(wartosc)) listy[lista] = wartosc;
    else bledy[`${pole}.${lista}`] = '0006';
  }
  if (o.nadpisania !== undefined && !czyObiekt(o.nadpisania)) bledy[`${pole}.nadpisania`] = '0006';
  if (o.dzieckoZSymulacji !== undefined && !czyObiekt(o.dzieckoZSymulacji)) bledy[`${pole}.dzieckoZSymulacji`] = '0006';
  if (pesel === undefined) return null;
  return { ...(o as unknown as StanSymulowanegoZus), ...(listy as Partial<StanSymulowanegoZus>), pesel };
}

/** Imię i nazwisko z pola żądania (na przykład `wnioskodawca`); inna postać daje kod 0006 pola. */
export function czytajOsobe(w: unknown, pole: string, bledy: BledyWejscia): OsobaKontaZus | undefined {
  const o = czytajObiekt(w, pole, bledy);
  if (o === undefined) return undefined;
  const imie = czytajTekst(o.imie, `${pole}.imie`, bledy, { wymagane: true });
  const nazwisko = czytajTekst(o.nazwisko, `${pole}.nazwisko`, bledy, { wymagane: true });
  return imie === undefined || nazwisko === undefined ? undefined : { imie, nazwisko };
}

/** Kopia Danych z konta ZUS z datą odczytu `teraz`; bez zgody na dane dotyczące zdrowia kopia nie ma zaświadczeń e-ZLA. */
export function odczytajKontoZus(pesel: Pesel, teraz: ZnacznikCzasu, zgodaNaDaneZdrowia = true): DaneZKontaZus | null {
  const zrodlo = zrodloKontaZus(pesel);
  if (zrodlo === null) return null;
  return przygotujKopie({ zrodlo, poprzednia: null, teraz, zgodaNaDaneZdrowia });
}
