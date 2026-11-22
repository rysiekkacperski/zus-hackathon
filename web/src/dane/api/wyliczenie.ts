'use client';

// Wyliczenie przez REST API w wersji 1 dla widoków: hook wysyła żądanie po każdej zmianie jego treści, przerywa
// poprzednie żądanie i zwraca stan ładowania, błąd z kodem komunikatu albo odpowiedź. Podczas przeliczania widok
// dostaje ostatnią poprawną odpowiedź, więc wynik nie znika przy każdej zmianie danych. Treść żądania jest kluczem:
// dwa żądania o tej samej treści JSON dają jedno wywołanie API.
import { useEffect, useRef, useState } from 'react';
import type { OpcjeWywolania } from '@/dane/api/klient';
import type { KodKomunikatu, WynikOperacji } from '@/domena/typy';

export interface BladWyliczeniaApi {
  kod: KodKomunikatu;
  bledyPol?: Record<string, KodKomunikatu>;
  /** Parametry treści komunikatu z odpowiedzi błędu. */
  parametry?: Record<string, string>;
}

export interface WyliczenieApi<T> {
  /** Odpowiedź bieżącego żądania, a podczas jego wykonywania ostatnia poprawna odpowiedź; null po błędzie. */
  wartosc: T | null;
  /** Żądanie jest w toku. */
  laduje: boolean;
  /** Odpowiedź dotyczy bieżącej treści żądania. */
  aktualne: boolean;
  /** Błąd bieżącego żądania: kod z tablicy komunikatów i kody pól. */
  blad: BladWyliczeniaApi | null;
  /** Ponawia bieżące żądanie, na przykład po błędzie 0335. */
  ponow: () => void;
}

interface StanOdpowiedzi<T> {
  klucz: string;
  proba: number;
  wynik: WynikOperacji<T>;
  /** Ostatnia poprawna odpowiedź, także dla wcześniejszej treści żądania; null po błędzie. */
  ostatnia: T | null;
}

export interface OpcjeWyliczeniaApi {
  /** Opóźnienie wysłania w milisekundach, dla podglądów liczonych w trakcie wpisywania. */
  opoznienieMs?: number;
}

/**
 * Wyliczenie przez funkcję klienta API (`@/dane/api/klient`). `zadanie` równe null oznacza brak wyliczenia.
 * Funkcję `wywolaj` hook odczytuje przy wysłaniu, więc może zmieniać się między renderami.
 */
export function useWyliczenieApi<Z extends object, T>(
  zadanie: Z | null,
  wywolaj: (z: Z, o?: OpcjeWywolania) => Promise<WynikOperacji<T>>,
  opcje: OpcjeWyliczeniaApi = {},
): WyliczenieApi<T> {
  const klucz = zadanie === null ? null : JSON.stringify(zadanie);
  const opoznienie = opcje.opoznienieMs ?? 0;
  const [proba, ustawProbe] = useState(0);
  const [stan, ustawStan] = useState<StanOdpowiedzi<T> | null>(null);
  const funkcja = useRef(wywolaj);

  useEffect(() => {
    funkcja.current = wywolaj;
  }, [wywolaj]);

  useEffect(() => {
    if (klucz === null) return;
    const przerwanie = new AbortController();
    const zegar = setTimeout(() => {
      void funkcja.current(JSON.parse(klucz) as Z, { sygnal: przerwanie.signal }).then((wynik) => {
        if (przerwanie.signal.aborted) return;
        // Po błędzie ostatnia odpowiedź przepada, żeby ponowienie nie pokazywało wyniku innych danych.
        ustawStan({ klucz, proba, wynik, ostatnia: wynik.ok ? wynik.wartosc : null });
      });
    }, opoznienie);
    return () => {
      clearTimeout(zegar);
      przerwanie.abort();
    };
  }, [klucz, proba, opoznienie]);

  const aktualne = klucz !== null && stan !== null && stan.klucz === klucz && stan.proba === proba;
  const wynik = aktualne ? stan.wynik : null;
  return {
    wartosc: klucz === null ? null : wynik ? (wynik.ok ? wynik.wartosc : null) : (stan?.ostatnia ?? null),
    laduje: klucz !== null && !aktualne,
    aktualne,
    blad:
      wynik && !wynik.ok
        ? {
            kod: wynik.kod,
            ...(wynik.bledyPol ? { bledyPol: wynik.bledyPol } : {}),
            ...(wynik.parametry ? { parametry: wynik.parametry } : {}),
          }
        : null,
    ponow: () => ustawProbe((p) => p + 1),
  };
}
