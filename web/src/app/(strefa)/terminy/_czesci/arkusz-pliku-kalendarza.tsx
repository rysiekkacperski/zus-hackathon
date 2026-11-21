'use client';

// SheetCalendarDownload (kontrakt, tabela 2.3): arkusz na ViewDeadlines (slot terminy/_sloty/akcja-pliku-kalendarza.tsx)
// i ViewGuideSettings (slot ustawienia/_sloty/karta-pliku-kalendarza.tsx). Właściciel: u18.
// Historyjka 3.2.1.2.1. Teksty: teksty.SheetCalendarDownload.
import { useMemo } from 'react';
import { formatujDate } from '@/komponenty/format';
import { Notatka } from '@/komponenty/notatka';
import { Arkusz } from '@/komponenty/okno';
import { pobierzPlik } from '@/komponenty/pobieranie';
import { Przycisk } from '@/komponenty/przycisk';
import { Tabela } from '@/komponenty/tabela';
import { useDzis, useKatalog, useRodzina } from '@/dane/magazyn/hooki';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import {
  nazwaPlikuKalendarza,
  terminyDoKalendarza,
  zbudujIcs,
  type TerminDoKalendarza,
} from '@/domena/przypomnienia/plik-kalendarza';
import { teksty } from '@/teksty';

const t = teksty.SheetCalendarDownload;

/** Terminy spraw do zrobienia rodziny zalogowanego konta według bieżącego stanu planu. */
export function useTerminyPlikuKalendarza(): TerminDoKalendarza[] {
  const rodzina = useRodzina();
  const katalog = useKatalog();
  return useMemo(
    () => terminyDoKalendarza(rodzina?.plan ?? null, rodzina?.kalendarz ?? null, katalog),
    [rodzina, katalog],
  );
}

/** Pobiera plik .ics z terminami w chwili wywołania (obsługa zdarzenia). */
export function pobierzPlikKalendarza(terminy: TerminDoKalendarza[]): void {
  const ctx = pobierzKontekstOperacji();
  pobierzPlik(nazwaPlikuKalendarza(ctx.dzis), 'text/calendar;charset=utf-8', zbudujIcs(terminy, ctx.teraz));
}

export interface ArkuszPlikuKalendarzaProps {
  otwarte: boolean;
  onZamknij: () => void;
  /** Po pobraniu pliku gospodarz pokazuje komunikat 0055. */
  onPobrano?: () => void;
}

export function ArkuszPlikuKalendarza({ otwarte, onZamknij, onPobrano }: ArkuszPlikuKalendarzaProps) {
  const terminy = useTerminyPlikuKalendarza();
  const dzis = useDzis();

  function pobierz() {
    pobierzPlikKalendarza(terminy);
    onZamknij();
    onPobrano?.();
  }

  return (
    <Arkusz
      otwarte={otwarte}
      onZamknij={onZamknij}
      tytul={t.tytul}
      opis={<p className="m-0">{t.opis}</p>}
      stopka={
        <>
          <Przycisk wariant="glowny" ikona="pobierz" onClick={pobierz} disabled={terminy.length === 0}>
            {t.pobierz}
          </Przycisk>
          <Przycisk wariant="drugorzedny" onClick={onZamknij}>
            {t.anuluj}
          </Przycisk>
        </>
      }
    >
      <p className="m-0 text-body">{teksty.wspolne.stanNa({ data: formatujDate(dzis) })}</p>
      <p className="m-0 text-body-strong">{t.liczbaTerminow({ liczba: terminy.length })}</p>
      <Tabela
        podpis={t.podpisTabeli}
        etykietaPrzewijania={t.przewijanie}
        kolumny={[
          { klucz: 'sprawa', naglowek: t.kolumny.sprawa, tytulowa: true },
          { klucz: 'termin', naglowek: t.kolumny.termin },
        ]}
        wiersze={terminy.map((termin, indeks) => ({
          id: `${termin.idSprawy ?? indeks}-${termin.data}`,
          sprawa: termin.tytul,
          termin: (
            <span className="whitespace-nowrap">
              {formatujDate(termin.data)}
              {termin.szacowany ? <span className="block text-small text-ink-muted">{t.szacowany}</span> : null}
            </span>
          ),
        }))}
      />
      <Notatka>
        <p>{t.notatka}</p>
      </Notatka>
    </Arkusz>
  );
}
