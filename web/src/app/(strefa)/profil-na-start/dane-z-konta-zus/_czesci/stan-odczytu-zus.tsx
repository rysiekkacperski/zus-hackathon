'use client';

// Część ViewProfileZusData: stan odczytu Danych z konta ZUS (kontrakt 11.2, u03): odczyt w toku (wzór P02-03)
// jako jedna karta z obracającym się kółkiem i paskiem postępu wypełnianym przez cały czas odczytu, komunikat 0001
// z ponowieniem odczytu (P02-11), komunikat 0002 z datą kopii (P02-10). Gospodarz: widok ViewProfileZusData (u07).
// Kartę odczytu i ogłoszenie odczytu wykorzystuje także ViewZusAccountData. Teksty:
// teksty.ViewProfileZusData.stanOdczytuZus.
//
// Gospodarz renderuje tę część pod nagłówkiem strony, a sekcje danych (SekcjeDanychZus) wyłącznie wtedy, gdy
// czyPokazacSekcjeDanychZus(stan, kopia) zwraca prawdę. Wstęp nagłówka strony daje wstepNaglowkaDanychZus.
import { useEffect, useId, useRef, useState } from 'react';
import { useParametry, useStanKonta } from '@/dane/magazyn/hooki';
import {
  czasOdczytuDanychZusMs,
  czyOdczytDanychZusWToku,
  przebiegOdczytuDanychZus,
} from '@/dane/magazyn/operacje/odczyt-zus';
import { odczytajIObsluzDaneZus } from '@/dane/magazyn/operacje/sesja';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import type { DaneZKontaZus, Pesel, StanOdczytuZus } from '@/domena/typy';
import { formatujDate, formatujDateICzas } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { Notatka } from '@/komponenty/notatka';
import { Przycisk } from '@/komponenty/przycisk';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';

const tekst = teksty.ViewProfileZusData.stanOdczytuZus;

export interface StanOdczytuDanychZusProps {
  stan: StanOdczytuZus;
  kopia: DaneZKontaZus | null;
}

/** Czy gospodarz pokazuje sekcje danych: kopia istnieje, a odczyt nie trwa. */
export function czyPokazacSekcjeDanychZus(stan: StanOdczytuZus, kopia: DaneZKontaZus | null): kopia is DaneZKontaZus {
  return kopia !== null && stan.stan !== 'trwa';
}

/** Wstęp nagłówka strony: „Stan na” z datą i godziną kopii albo zdanie wstępne, gdy kopii brak albo odczyt trwa. */
export function wstepNaglowkaDanychZus(stan: StanOdczytuZus, kopia: DaneZKontaZus | null): string {
  return czyPokazacSekcjeDanychZus(stan, kopia)
    ? tekst.stanNa({ dataICzas: formatujDateICzas(kopia.odczytano) })
    : tekst.wstepBezKopii;
}

/** Czas odczytu z parametrów systemu i tekst o nim: pełne sekundy albo „chwilę”, gdy odczyt nie ma opóźnienia. */
function useCzasOdczytu(): { czasMs: number; tekstCzasu: string } {
  const czasMs = czasOdczytuDanychZusMs(useParametry());
  const tekstCzasu =
    czasMs > 0
      ? tekst.czasOdczytu({ liczbaSekund: Math.max(1, Math.round(czasMs / 1000)) })
      : tekst.czasOdczytuChwila;
  return { czasMs, tekstCzasu };
}

/** Obracające się kółko w kolorze brand; przy ograniczeniu ruchu kółko stoi jako statyczny wskaźnik. */
function KolkoOdczytu() {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      className="size-14 shrink-0 motion-safe:animate-spin"
    >
      <circle cx="24" cy="24" r="20" fill="none" strokeWidth="5" className="stroke-brand-tint" />
      <path d="M24 4a20 20 0 0 1 20 20" fill="none" strokeWidth="5" strokeLinecap="round" className="stroke-brand" />
    </svg>
  );
}

/**
 * Pasek postępu wypełniany płynnie przez cały czas odczytu. Wypełnienie startuje od części, która upłynęła od
 * rozpoczęcia odczytu w toku, więc pasek pokazuje właściwy postęp także po przejściu na ekran w trakcie odczytu.
 * Pasek jest ozdobny: czas odczytu podaje tekst pod paskiem i ogłoszenie odczytu.
 */
function PasekOdczytu({ pesel, czasMs }: { pesel: Pesel | undefined; czasMs: number }) {
  const wypelnienie = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = wypelnienie.current;
    if (element === null || typeof element.animate !== 'function') return;
    const przebieg = pesel === undefined ? null : przebiegOdczytuDanychZus(pesel);
    const calosc = przebieg?.czasMs ?? czasMs;
    if (calosc <= 0) return;
    const uplynelo = przebieg === null ? 0 : Math.min(Math.max(performance.now() - przebieg.rozpoczeto, 0), calosc);
    const animacja = element.animate([{ width: `${(uplynelo / calosc) * 100}%` }, { width: '100%' }], {
      duration: calosc - uplynelo,
      easing: 'linear',
      fill: 'forwards',
    });
    return () => animacja.cancel();
  }, [pesel, czasMs]);

  return (
    <div
      aria-hidden="true"
      className="box-content h-progress w-full overflow-hidden rounded-full border border-ink-muted bg-surface-card"
    >
      <div ref={wypelnienie} className="h-full w-0 rounded-full bg-brand" />
    </div>
  );
}

/**
 * Karta odczytu Danych z konta ZUS w toku: kółko, nagłówek, zdanie o pobieranych danych, pasek postępu i czas
 * odczytu. Obszar karty ma aria-busy przez cały czas odczytu; ogłoszenia daje OgloszenieOdczytuDanychZus.
 */
export function KartaOdczytuDanychZus({ pesel }: { pesel: Pesel | undefined }) {
  const idNaglowka = useId();
  const { czasMs, tekstCzasu } = useCzasOdczytu();
  return (
    <section
      aria-labelledby={idNaglowka}
      aria-busy="true"
      className="box-border min-w-0 rounded-sm bg-surface-card p-5"
    >
      <div className="flex items-center gap-5">
        <KolkoOdczytu />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 id={idNaglowka} className="m-0 text-section-title text-ink">
            {tekst.tytulOdczytu}
          </h2>
          <p className="m-0">{tekst.opisOdczytu}</p>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-2">
        {czasMs > 0 ? <PasekOdczytu pesel={pesel} czasMs={czasMs} /> : null}
        <p className="m-0 text-small text-ink">{tekstCzasu}</p>
      </div>
    </section>
  );
}

/**
 * Stały region role="status" odczytu: jedno ogłoszenie na początku odczytu z czasem odczytu i jedno po udanym
 * zakończeniu. Nieudany odczyt ogłaszają komunikaty 0001 i 0002. Region stoi poza kartą odczytu, bo karta
 * znika razem z końcem odczytu, i poza obszarem z aria-busy, który wstrzymuje ogłoszenia.
 */
export function OgloszenieOdczytuDanychZus({ trwa, udany }: { trwa: boolean; udany: boolean }) {
  const { tekstCzasu } = useCzasOdczytu();
  const [tresc, ustawTresc] = useState('');
  const bylOdczytWToku = useRef(false);

  useEffect(() => {
    const nowa = trescOgloszenia();
    if (nowa === null) return;
    // Treść trafia do regionu po jego wyrenderowaniu, żeby czytnik ekranu ogłosił ją także wtedy, gdy region
    // pojawia się na ekranie razem z odczytem w toku.
    const czasomierz = window.setTimeout(() => ustawTresc(nowa), 100);
    return () => window.clearTimeout(czasomierz);

    function trescOgloszenia(): string | null {
      if (trwa) {
        bylOdczytWToku.current = true;
        return tekst.ogloszenieStartu({ czas: tekstCzasu });
      }
      if (!bylOdczytWToku.current) return null;
      bylOdczytWToku.current = false;
      return udany ? tekst.ogloszenieKonca : '';
    }
  }, [trwa, udany, tekstCzasu]);

  return (
    <p role="status" className="sr-only">
      {tresc}
    </p>
  );
}

function BrakDanych({ zBledem }: { zBledem: boolean }) {
  const stanKonta = useStanKonta();
  const [wToku, ustawWToku] = useState(false);
  const pesel = stanKonta?.konto.pesel;

  const pobierz = async () => {
    if (pesel === undefined) return;
    ustawWToku(true);
    try {
      await odczytajIObsluzDaneZus(pesel, pobierzKontekstOperacji());
    } finally {
      ustawWToku(false);
    }
  };

  return (
    <Stos odstep={7.5}>
      {zBledem ? <Komunikat kod="0001" /> : null}
      <Karta tytul={tekst.tytulBrakuDanych} bezLinii>
        <StanPusty
          ikona="brak-polaczenia"
          akcja={
            <Przycisk
              wariant="glowny"
              ikona="odswiez"
              zajety={wToku}
              disabled={pesel === undefined}
              onClick={() => void pobierz()}
            >
              {zBledem ? tekst.pobierzPonownie : tekst.pobierz}
            </Przycisk>
          }
        >
          <p>{tekst.opisBrakuDanych}</p>
        </StanPusty>
        <Notatka className="mt-6">
          <p>{tekst.tylkoOdczyt}</p>
        </Notatka>
      </Karta>
    </Stos>
  );
}

/**
 * Wznawia odczyt, który został w stanie `trwa` bez odczytu w toku w tej karcie (na przykład po odświeżeniu
 * strony w trakcie odczytu), żeby ekran nie pozostał w stanie odczytu w toku.
 */
function useWznowienieOdczytu(stan: StanOdczytuZus) {
  const pesel = useStanKonta()?.konto.pesel;
  const trwa = stan.stan === 'trwa';
  useEffect(() => {
    if (!trwa || pesel === undefined || czyOdczytDanychZusWToku(pesel)) return;
    void odczytajIObsluzDaneZus(pesel, pobierzKontekstOperacji());
  }, [trwa, pesel]);
}

/**
 * Stan odczytu z ogłoszeniem i wznowieniem odczytu. `bezTresci` ukrywa kartę i komunikaty stanu, a zostawia
 * ogłoszenie odczytu, np. na kolejnych częściach ekranu podzielonego na części.
 */
export function StanOdczytuDanychZus({ stan, kopia, bezTresci = false }: StanOdczytuDanychZusProps & { bezTresci?: boolean }) {
  useWznowienieOdczytu(stan);

  return (
    <>
      <OgloszenieOdczytuDanychZus trwa={stan.stan === 'trwa'} udany={stan.stan === 'udany'} />
      {bezTresci ? null : <TrescStanuOdczytu stan={stan} kopia={kopia} />}
    </>
  );
}

function TrescStanuOdczytu({ stan, kopia }: StanOdczytuDanychZusProps) {
  const pesel = useStanKonta()?.konto.pesel;

  switch (stan.stan) {
    case 'trwa':
      return <KartaOdczytuDanychZus pesel={pesel} />;
    case 'nieudany-z-kopia':
      return kopia === null ? (
        <BrakDanych zBledem />
      ) : (
        <Komunikat kod="0002" parametry={{ dataOdczytu: formatujDate(kopia.odczytano) }} />
      );
    case 'nieudany-bez-kopii':
      return kopia === null ? <BrakDanych zBledem /> : null;
    case 'brak':
      return kopia === null ? <BrakDanych zBledem={false} /> : null;
    case 'udany':
      return kopia === null ? <BrakDanych zBledem={false} /> : null;
  }
}
