'use client';

import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';
import {
  Pole,
  klasyOdstepuPolaWpisu,
  klasyPolaWpisu,
  polaczOpisy,
  type BladPolaWartosc,
} from '@/komponenty/pole';
import { teksty } from '@/teksty';

export interface PoleZPodpowiedziamiProps<T> {
  id: string;
  etykieta: string;
  podpowiedz?: ReactNode;
  tekst: string;
  onZmianaTekstu: (t: string) => void;
  podpowiedzi: T[];
  kluczPodpowiedzi: (p: T) => string;
  etykietaPodpowiedzi: (p: T) => string;
  wybrana: T | null;
  onWybor: (p: T | null) => void;
  /** Opuszczenie pola i wybór podpowiedzi: walidacja po opuszczeniu (useWalidacjaNaBiezaco). */
  onOpuszczenie?: () => void;
  opisWybranej?: (p: T) => string;
  blad?: BladPolaWartosc;
  parametryBledu?: Record<string, string>;
  minZnakow?: number;
  nazwa?: string;
  wymagane?: boolean;
  className?: string;
}

// Combobox z listą podpowiedzi według wzoru ARIA 1.2 (fokus zostaje w polu, aktywną opcję wskazuje aria-activedescendant).
export function PoleZPodpowiedziami<T>({
  id,
  etykieta,
  podpowiedz,
  tekst,
  onZmianaTekstu,
  podpowiedzi,
  kluczPodpowiedzi,
  etykietaPodpowiedzi,
  wybrana,
  onWybor,
  onOpuszczenie,
  opisWybranej,
  blad,
  parametryBledu,
  minZnakow = 1,
  nazwa,
  wymagane,
  className,
}: PoleZPodpowiedziamiProps<T>) {
  const [otwarta, setOtwarta] = useState(false);
  const [aktywny, setAktywny] = useState(-1);

  const idListy = `${id}-lista`;
  const idWybranej = `${id}-wybrana`;
  const idStanu = `${id}-stan`;
  const idOpcji = (indeks: number) => `${id}-opcja-${indeks}`;

  const wystarczajacoZnakow = tekst.trim().length >= minZnakow;
  const listaWidoczna = otwarta && wystarczajacoZnakow && podpowiedzi.length > 0;
  const brakWynikow = otwarta && wystarczajacoZnakow && podpowiedzi.length === 0;
  const aktywnyIndeks = listaWidoczna && aktywny < podpowiedzi.length ? aktywny : -1;
  const kluczWybranej = wybrana === null ? null : kluczPodpowiedzi(wybrana);

  useEffect(() => {
    if (aktywnyIndeks < 0) return;
    document.getElementById(`${id}-opcja-${aktywnyIndeks}`)?.scrollIntoView({ block: 'nearest' });
  }, [id, aktywnyIndeks]);

  function wybierz(p: T) {
    onWybor(p);
    onZmianaTekstu(etykietaPodpowiedzi(p));
    setOtwarta(false);
    setAktywny(-1);
    onOpuszczenie?.();
  }

  function zmienTekst(nowy: string) {
    onZmianaTekstu(nowy);
    if (wybrana !== null && nowy !== etykietaPodpowiedzi(wybrana)) onWybor(null);
    setOtwarta(true);
    setAktywny(-1);
  }

  function obsluzKlawisz(e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        if (!listaWidoczna) {
          setOtwarta(true);
          setAktywny(0);
          return;
        }
        setAktywny((a) => (a + 1 >= podpowiedzi.length ? 0 : a + 1));
        return;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (!listaWidoczna) {
          setOtwarta(true);
          setAktywny(podpowiedzi.length - 1);
          return;
        }
        setAktywny((a) => (a <= 0 ? podpowiedzi.length - 1 : a - 1));
        return;
      }
      case 'Enter': {
        if (aktywnyIndeks >= 0) {
          e.preventDefault();
          wybierz(podpowiedzi[aktywnyIndeks]);
        }
        return;
      }
      case 'Escape': {
        if (otwarta) {
          e.preventDefault();
          setOtwarta(false);
          setAktywny(-1);
        }
        return;
      }
      default:
        return;
    }
  }

  return (
    <Pole
      id={id}
      etykieta={etykieta}
      podpowiedz={podpowiedz}
      blad={blad}
      parametryBledu={parametryBledu}
      wymagane={wymagane}
      className={className}
    >
      {(aria) => (
        <div className="grid min-w-0 gap-1">
          <div className="relative min-w-0">
            <input
              {...aria}
              aria-describedby={polaczOpisy(
                aria['aria-describedby'],
                wybrana !== null && opisWybranej ? idWybranej : null,
              )}
              type="text"
              name={nazwa}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={listaWidoczna}
              aria-controls={idListy}
              aria-activedescendant={aktywnyIndeks >= 0 ? idOpcji(aktywnyIndeks) : undefined}
              autoComplete="off"
              value={tekst}
              onChange={(e) => zmienTekst(e.target.value)}
              onKeyDown={obsluzKlawisz}
              onBlur={() => {
                setOtwarta(false);
                setAktywny(-1);
                onOpuszczenie?.();
              }}
              className={`${klasyPolaWpisu} ${klasyOdstepuPolaWpisu}`}
            />
            <ul
              id={idListy}
              role="listbox"
              aria-label={etykieta}
              hidden={!listaWidoczna}
              className="absolute top-full right-0 left-0 z-20 m-0 mt-1 max-h-60 list-none overflow-y-auto rounded-sm border border-brand bg-surface-card p-0 py-1"
            >
              {podpowiedzi.map((p, indeks) => {
                const klucz = kluczPodpowiedzi(p);
                const zaznaczona = klucz === kluczWybranej;
                const aktywna = indeks === aktywnyIndeks;
                return (
                  <li
                    key={klucz}
                    id={idOpcji(indeks)}
                    role="option"
                    aria-selected={zaznaczona}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => wybierz(p)}
                    onMouseEnter={() => setAktywny(indeks)}
                    className={
                      aktywna
                        ? 'cursor-pointer bg-brand-tint px-3 py-2 text-brand-deep aria-selected:font-semibold'
                        : 'cursor-pointer px-3 py-2 text-ink aria-selected:font-semibold'
                    }
                  >
                    {etykietaPodpowiedzi(p)}
                  </li>
                );
              })}
            </ul>
          </div>
          <p id={idStanu} role="status" className="sr-only">
            {listaWidoczna
              ? teksty.wspolne.pola.liczbaPodpowiedzi({ liczba: String(podpowiedzi.length) })
              : brakWynikow
                ? teksty.wspolne.pola.brakPodpowiedzi
                : ''}
          </p>
          {brakWynikow ? <p className="m-0">{teksty.wspolne.pola.brakPodpowiedzi}</p> : null}
          {wybrana !== null && opisWybranej ? (
            <p id={idWybranej} className="m-0">
              {opisWybranej(wybrana)}
            </p>
          ) : null}
        </div>
      )}
    </Pole>
  );
}
