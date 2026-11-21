// Dokumenty przykładowej sprawy: wybór sprawy, wgranie i odczyt dokumentu, korekty (kontrakt, sekcja 6.5).
// Właściciel: u05 (Przykładowe sprawy: lista, dokumenty i odczyt AI).
// Zaślepka fundamentu: implementuje u05. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { KontekstOperacji, WartoscOdczytana, WynikOperacji } from '@/domena/typy';

/** Tryb wgrania: nowa sprawa albo dokument dodany do bieżącej sprawy. */
export type TrybWgraniaDokumentu = 'nowa' | 'dodaj';

/** Sprawa z zestawu ZUS albo sprawa wzorcowa jako bieżąca przykładowa sprawa sesji. */
export function wybierzSpraweZespolu(id: string, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}

/** Walidacja pliku, odczyt przez API (albo fikstura), scalenie z danymi sprawy. */
export async function wgrajDokument(plik: File, tryb: TrybWgraniaDokumentu, ctx: KontekstOperacji): Promise<WynikOperacji> {
  return { ok: false, kod: '0003' };
}

/** Korekta wartości pola (ścieżka w DaneSprawy) z zachowaniem wartości pierwotnej. */
export function zapiszKorekte(pole: string, wartosc: WartoscOdczytana['wartosc'], ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}

/** Usunięcie sprawy, jej plików i powiązań danych zastępczych. */
export async function usunSprawe(ctx: KontekstOperacji): Promise<WynikOperacji> {
  return { ok: false, kod: '0003' };
}
