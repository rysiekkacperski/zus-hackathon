'use client';

// Część ViewProfileSummary: karta jednej sekcji profilu z akcją „Zmień”, źródłem danych z konta ZUS
// i oznaczeniem „Zmienione, przed zmianą” (wzory cz1/P03-24 i cz1/P03-26). Właściciel: u11.
// Slot podsumowania, który uzupełnia zakładkę sekcji, odczytuje propsy karty z KartySekcjiProfilu i dodaje do karty
// własne wiersze, treść pod wierszami i kolumnę akcji obok wierszy, np. sekcja drugiego rodzica w zakładce „Drugi rodzic”.
import { createContext, type ReactNode } from 'react';
import type { IdWidoku } from '@/domena/typy';
import { Ikona } from '@/komponenty/ikona';
import { Karta } from '@/komponenty/karta';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { teksty } from '@/teksty';
import type { SekcjaProfilu, WierszProfilu } from './sekcje-profilu';
import type { IdZakladkiSekcji } from './zakladki-sekcji';

const t = teksty.ViewProfileSummary;

export interface KartaSekcjiProfiluProps {
  sekcja: SekcjaProfilu;
  /** Adres ekranu sekcji, albo null, gdy rola nie zmienia tej sekcji. */
  adresEkranu: (ekran: IdWidoku) => string | null;
  /** Przygotowanie szkicu przed przejściem do ekranu sekcji. */
  onZmien: (ekran: IdWidoku) => void;
  /** Wartości wierszy przed zmianą według klucza wiersza, gdy wartość się zmieniła. */
  przedZmiana?: ReadonlyMap<string, string>;
  /** Treść nad wierszami, np. „Stan na” w sekcji danych z konta ZUS. */
  naglowekTresci?: ReactNode;
  /** Tytuł karty w miejsce tytułu sekcji. */
  tytul?: string;
  /** Wiersze slotu przed wierszami sekcji. */
  wierszePrzed?: WierszProfilu[];
  /** Wiersze slotu za wierszami sekcji. */
  wierszePo?: WierszProfilu[];
  /** Treść pod wierszami, np. notatka slotu. */
  podWierszami?: ReactNode;
  /** Kolumna obok wierszy, np. akcje slotu. */
  boczna?: ReactNode;
}

/** Propsy kart sekcji według zakładki sekcji, dla slotów, które uzupełniają zakładkę sekcji. */
export const KartySekcjiProfilu = createContext<Partial<Record<IdZakladkiSekcji, KartaSekcjiProfiluProps>>>({});

export function KartaSekcjiProfilu({
  sekcja,
  adresEkranu,
  onZmien,
  przedZmiana,
  naglowekTresci,
  tytul,
  wierszePrzed = [],
  wierszePo = [],
  podWierszami,
  boczna,
}: KartaSekcjiProfiluProps) {
  const adresSekcji = adresEkranu(sekcja.ekran);
  const wiersze = [...wierszePrzed, ...sekcja.wiersze, ...wierszePo];

  const dane = (
    <>
      {naglowekTresci}
      <dl className="m-0 min-w-0">
        {wiersze.map((w) => {
          const poprzednio = przedZmiana?.get(`${sekcja.id}.${w.klucz}`);
          const akcja = w.akcja;
          const adresAkcji = akcja ? adresEkranu(akcja.ekran) : null;
          return (
            <div key={w.klucz} className="flex flex-wrap gap-x-4 gap-y-1 border-b border-line-row py-3 last:border-b-0">
              <dt className="min-w-0 shrink-0 grow-0 basis-60 text-body-strong text-ink">{w.etykieta}</dt>
              <dd className="m-0 flex min-w-0 grow basis-48 flex-col items-start gap-1 text-ink-strong">
                <span className="min-w-0 break-words">{w.wartosc}</span>
                {w.zrodlo ? (
                  <span className="inline-flex items-center gap-1 text-small-strong text-ink">
                    <Ikona nazwa="baza-danych" rozmiar={16} className="text-brand" />
                    {t.zrodla[w.zrodlo]}
                  </span>
                ) : null}
                {poprzednio !== undefined ? (
                  <span className="text-small-strong text-ink">{t.zmienione({ poprzednio })}</span>
                ) : null}
                {w.opis ? <span className="text-small text-ink">{w.opis}</span> : null}
                {akcja && adresAkcji ? (
                  <Odnosnik href={adresAkcji} onClick={() => onZmien(akcja.ekran)}>
                    {akcja.etykieta}
                  </Odnosnik>
                ) : null}
              </dd>
            </div>
          );
        })}
      </dl>
      {sekcja.notatka ? (
        <Notatka className="mt-4">
          <p>{sekcja.notatka}</p>
        </Notatka>
      ) : null}
      {podWierszami ? <div className="mt-4 flex flex-col gap-4">{podWierszami}</div> : null}
    </>
  );

  return (
    <Karta
      tytul={tytul ?? sekcja.tytul}
      bezLinii
      akcje={
        adresSekcji ? (
          <Odnosnik href={adresSekcji} aria-label={sekcja.etykietaZmiany} onClick={() => onZmien(sekcja.ekran)}>
            {teksty.wspolne.przyciski.zmien}
          </Odnosnik>
        ) : undefined
      }
    >
      {boczna ? (
        // Wiersze z lewej i kolumna akcji z prawej; w wąskim oknie kolumna akcji schodzi pod wiersze.
        <div className="flex flex-wrap items-start gap-7.5">
          <div className="min-w-0 grow-999 basis-120">{dane}</div>
          <div className="flex min-w-0 grow basis-84 flex-col gap-6">{boczna}</div>
        </div>
      ) : (
        dane
      )}
    </Karta>
  );
}
