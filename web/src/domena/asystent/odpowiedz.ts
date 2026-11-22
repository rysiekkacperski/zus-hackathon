// Odpowiedź asystenta AI z faktów (kontrakt, sekcja 10.3, węzły sprawdz i zbudujOdpowiedz). Właściciel: u31.
// Funkcje są czyste: serwer wywołuje je po klasyfikacji i sformułowaniu tekstu przez model, a bez tekstu modelu
// odpowiedź powstaje z szablonów faktów.
import { analizujPytanie, tekstZFaktow, type AnalizaPytania } from '@/domena/asystent/fakty';
import { normalizujTekst } from '@/domena/asystent/intencje';
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

// Data w zapisie cyfrowym, na przykład 21.12.2026 albo 21.12, i data z nazwą miesiąca, na przykład 20 kwietnia.
const DATA_CYFROWO = /(?<![\d.])\d{1,2}\.\d{1,2}(?:\.\d{4})?(?![\d])/g;
const DATA_SLOWNIE = /\d{1,2} (stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|wrzesnia|pazdziernika|listopada|grudnia)\b/g;

/** Daty z tekstu w zapisie cyfrowym i z nazwą miesiąca, po normalizacji tekstu. */
function datyWTekscie(tekst: string): string[] {
  const t = normalizujTekst(tekst);
  return [...(t.match(DATA_CYFROWO) ?? []), ...(t.match(DATA_SLOWNIE) ?? [])];
}

/**
 * Węzeł sprawdz: tekst modelu ma najwyżej 5 zdań, każda liczba w nim występuje w faktach, każda data jest jedną
 * z dat faktów w tym samym zapisie, a każda wymagana liczba, na przykład data z listy najbliższych terminów,
 * występuje w tekście w zapisie z faktów.
 * Liczby porównujemy bez spacji, więc „2 400,00 zł” z faktów pasuje do tego samego zapisu w tekście.
 */
export function czyTekstZgodnyZFaktami(tekst: string, fakty: readonly Fakt[], wymaganeLiczby: readonly string[] = []): boolean {
  if (tekst.trim().length === 0 || liczbaZdan(tekst) > MAKS_ZDAN_ODPOWIEDZI) return false;
  const zrodlaTekst = fakty.map((f) => `${f.tekst} ${f.liczby.join(' ')}`).join(' ');
  const zrodla = bezSpacji(zrodlaTekst);
  if (!liczbyWTekscie(tekst).every((liczba) => zrodla.includes(liczba))) return false;
  const datyFaktow = new Set(datyWTekscie(zrodlaTekst));
  if (!datyWTekscie(tekst).every((data) => datyFaktow.has(data))) return false;
  const tekstBezSpacji = bezSpacji(tekst);
  return wymaganeLiczby.every((liczba) => tekstBezSpacji.includes(bezSpacji(liczba)));
}

/** Węzeł zbudujOdpowiedz: tekst (modelu po sprawdzeniu albo z szablonu), sprawy, propozycja i stopka. */
export function zbudujOdpowiedz(
  intencja: IntencjaAsystenta,
  analiza: AnalizaPytania,
  tekstModelu?: string | null,
): OdpowiedzAsystenta {
  const tekst =
    analiza.kodKomunikatu !== '0148'
      ? tekstZFaktow(analiza.fakty)
      : tekstModelu && czyTekstZgodnyZFaktami(tekstModelu, analiza.fakty, analiza.wymaganeLiczby)
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
