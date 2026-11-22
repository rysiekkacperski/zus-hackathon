'use client';

// Pole „Przesunięcie terminu” z jednostką dni albo miesiące obok pola liczby (wzór P04-13).
import { JEDNOSTKI_PRZESUNIECIA, type JednostkaPrzesuniecia } from '@/domena/katalog/edycja';
import type { KodKomunikatu } from '@/domena/typy';
import { Ikona } from '@/komponenty/ikona';
import { Pole, klasyOdstepuPolaWpisu, klasyPolaWpisu, opuszczonoKontener } from '@/komponenty/pole';
import { teksty } from '@/teksty';

export interface PolePrzesunieciaProps {
  id: string;
  wartosc: string;
  jednostka: JednostkaPrzesuniecia;
  onZmianaWartosci: (wartosc: string) => void;
  onZmianaJednostki: (jednostka: JednostkaPrzesuniecia) => void;
  /** Wyjście fokusu poza pole liczby i jednostkę: walidacja po opuszczeniu (useWalidacjaNaBiezaco). */
  onOpuszczenie?: () => void;
  blad?: KodKomunikatu | null;
}

export function PolePrzesuniecia({
  id,
  wartosc,
  jednostka,
  onZmianaWartosci,
  onZmianaJednostki,
  onOpuszczenie,
  blad,
}: PolePrzesunieciaProps) {
  const t = teksty.ViewCatalogItemAdd.kanal;
  return (
    <Pole id={id} etykieta={t.przesuniecie} podpowiedz={t.podpowiedzPrzesuniecia} blad={blad ?? null} wymagane>
      {(aria) => (
        <div
          className="flex min-w-0 flex-wrap items-center gap-3"
          onBlur={(e) => {
            if (onOpuszczenie && opuszczonoKontener(e)) onOpuszczenie();
          }}
        >
          <input
            {...aria}
            type="text"
            inputMode="text"
            autoComplete="off"
            value={wartosc}
            onChange={(e) => onZmianaWartosci(e.target.value)}
            className={`${klasyPolaWpisu} ${klasyOdstepuPolaWpisu} w-full max-w-40`}
          />
          <span className="relative block w-full max-w-45">
            <select
              id={`${id}-jednostka`}
              aria-label={t.jednostkaPrzesuniecia}
              value={jednostka}
              onChange={(e) => onZmianaJednostki(e.target.value as JednostkaPrzesuniecia)}
              className={`${klasyPolaWpisu} cursor-pointer appearance-none pr-12 pl-3 focus:pr-[2.9375rem] focus:pl-[0.6875rem]`}
            >
              {JEDNOSTKI_PRZESUNIECIA.map((j) => (
                <option key={j} value={j}>
                  {t.jednostki[j]}
                </option>
              ))}
            </select>
            <Ikona
              nazwa="w-dol"
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-brand"
            />
          </span>
        </div>
      )}
    </Pole>
  );
}
