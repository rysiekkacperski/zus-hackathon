// Odpowiedź asystenta AI z faktów (kontrakt, sekcja 10.3, węzły sprawdz i zbudujOdpowiedz). Właściciel: u31.
// Funkcje są czyste: serwer wywołuje je po klasyfikacji i sformułowaniu tekstu przez model, a bez tekstu modelu
// odpowiedź powstaje z szablonów faktów.
import { analizujPytanie, tekstZFaktow, type AnalizaPytania } from '@/domena/asystent/fakty';
import type { Fakt, IdSprawy, IntencjaAsystenta, KontekstAsystenta, OdpowiedzAsystenta } from '@/domena/typy';

/** Najwięcej zdań w odpowiedzi asystenta (R-AS-ZRODLA). */
export const MAKS_ZDAN_ODPOWIEDZI = 5;

export function liczbaZdan(tekst: string): number {
  return tekst
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter((z) => z.trim().length > 0).length;
}

function bezSpacji(t: string): string {
  return t.replace(/[\s ]+/g, '');
}

/** Liczby w tekście (cyfry ze spacjami tysięcy, przecinkiem i kropką), bez spacji. */
export function liczbyWTekscie(tekst: string): string[] {
  const dopasowania = tekst.match(/\d(?:[\d  .,]*\d)?/g) ?? [];
  return dopasowania.map(bezSpacji);
}

/**
 * Węzeł sprawdz: tekst modelu ma najwyżej 5 zdań, a każda liczba w nim występuje w faktach.
 * Liczby porównujemy bez spacji, więc „2 400,00 zł” z faktów pasuje do tego samego zapisu w tekście.
 */
export function czyTekstZgodnyZFaktami(tekst: string, fakty: readonly Fakt[]): boolean {
  if (tekst.trim().length === 0 || liczbaZdan(tekst) > MAKS_ZDAN_ODPOWIEDZI) return false;
  const zrodla = bezSpacji(fakty.map((f) => `${f.tekst} ${f.liczby.join(' ')}`).join(' '));
  return liczbyWTekscie(tekst).every((liczba) => zrodla.includes(liczba));
}

/** Węzeł zbudujOdpowiedz: tekst (modelu po sprawdzeniu albo z szablonu), sprawy, propozycja i stopka. */
export function zbudujOdpowiedz(
  intencja: IntencjaAsystenta,
  analiza: AnalizaPytania,
  tekstModelu?: string | null,
): OdpowiedzAsystenta {
  const tekst =
    analiza.kodKomunikatu === '0070'
      ? tekstZFaktow(analiza.fakty)
      : tekstModelu && czyTekstZgodnyZFaktami(tekstModelu, analiza.fakty)
        ? tekstModelu.trim()
        : tekstZFaktow(analiza.fakty);
  return {
    tekst,
    intencja,
    sprawy: analiza.sprawy,
    ...(analiza.propozycja ? { propozycja: analiza.propozycja } : {}),
    ...(analiza.akcjeKanalow ? { akcjeKanalow: analiza.akcjeKanalow } : {}),
    kodKomunikatu: analiza.kodKomunikatu,
    oznaczenieAI: true,
  };
}

/** Odpowiedź bez modelu: klasyfikacja i tekst z szablonów (deterministyczna ścieżka grafu). */
export function odpowiedzDeterministyczna(
  wiadomosc: string,
  intencja: IntencjaAsystenta,
  sprawy: IdSprawy[],
  kontekst: KontekstAsystenta,
): OdpowiedzAsystenta {
  return zbudujOdpowiedz(intencja, analizujPytanie(intencja, kontekst, { wiadomosc, sprawy }));
}
