'use client';

import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

const CZAS_WYSWIETLANIA_MS = 5000;

interface KontekstKomunikatuChwilowego {
  pokaz: (tresc: string) => void;
}

const Kontekst = createContext<KontekstKomunikatuChwilowego | null>(null);

const bezDostawcy: KontekstKomunikatuChwilowego = { pokaz: () => {} };

export function DostawcaKomunikatowChwilowych({ children }: { children: ReactNode }) {
  const [tresc, ustawTresc] = useState<string | null>(null);
  const [numer, ustawNumer] = useState(0);
  const licznik = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pokaz = useCallback((nowa: string) => {
    ustawTresc(nowa);
    ustawNumer((n) => n + 1);
  }, []);

  useEffect(() => {
    if (tresc === null) return;
    licznik.current = setTimeout(() => ustawTresc(null), CZAS_WYSWIETLANIA_MS);
    return () => {
      if (licznik.current) clearTimeout(licznik.current);
    };
  }, [tresc, numer]);

  const wartosc = useMemo(() => ({ pokaz }), [pokaz]);

  return (
    <Kontekst value={wartosc}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-4 bottom-24 z-50 flex justify-center print:hidden"
      >
        {tresc ? (
          <p
            key={numer}
            className="pointer-events-auto m-0 max-w-okno rounded-sm bg-brand-deep px-5 py-3 text-body text-on-brand shadow-header"
          >
            {tresc}
          </p>
        ) : null}
      </div>
    </Kontekst>
  );
}

export function useKomunikatChwilowy(): { pokaz: (tresc: string) => void } {
  return use(Kontekst) ?? bezDostawcy;
}
