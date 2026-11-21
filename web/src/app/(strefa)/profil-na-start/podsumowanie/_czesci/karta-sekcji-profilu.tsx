'use client';

// Część ViewProfileSummary: karta jednej sekcji profilu z akcją „Zmień”, źródłem danych z konta ZUS
// i oznaczeniem „Zmienione, przed zmianą” (wzory cz1/P03-24 i cz1/P03-26). Właściciel: u11.
import type { ReactNode } from 'react';
import type { IdWidoku } from '@/domena/typy';
import { Ikona } from '@/komponenty/ikona';
import { Karta } from '@/komponenty/karta';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { teksty } from '@/teksty';
import type { SekcjaProfilu } from './sekcje-profilu';

const t = teksty.ViewProfileSummary;

export interface KartaSekcjiProfiluProps {
  sekcja: SekcjaProfilu;
  /** Adres ekranu sekcji, albo null, gdy rola nie zmienia tej sekcji. */
  adresEkranu: (ekran: IdWidoku) => string | null;
  /** Przygotowanie szkicu przed przejściem do ekranu sekcji. */
  onZmien: (ekran: IdWidoku) => void;
  /** Wartości wierszy przed zmianą według klucza wiersza, gdy wartość się zmieniła. */
  przedZmiana?: ReadonlyMap<string, string>;
  /** Treść pod sekcją, np. „Stan na” w sekcji danych z konta ZUS. */
  naglowekTresci?: ReactNode;
}

export function KartaSekcjiProfilu({ sekcja, adresEkranu, onZmien, przedZmiana, naglowekTresci }: KartaSekcjiProfiluProps) {
  const adresSekcji = adresEkranu(sekcja.ekran);
  return (
    <Karta
      tytul={sekcja.tytul}
      bezLinii
      akcje={
        adresSekcji ? (
          <Odnosnik href={adresSekcji} aria-label={sekcja.etykietaZmiany} onClick={() => onZmien(sekcja.ekran)}>
            {teksty.wspolne.przyciski.zmien}
          </Odnosnik>
        ) : undefined
      }
    >
      {naglowekTresci}
      <dl className="m-0 min-w-0">
        {sekcja.wiersze.map((w) => {
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
    </Karta>
  );
}
