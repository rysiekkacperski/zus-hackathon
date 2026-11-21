'use client';

// Stan chwilowy formularzy i nawigacja z ładowaniem pod Cache Components.
//
// Przy włączonym `cacheComponents` Next.js nie odmontowuje strony po nawigacji. Ukrywa ją w React <Activity>
// i zachowuje jej stan, a po powrocie (przyciskiem Wróć w widoku albo Wstecz przeglądarki) pokazuje stronę z tym
// samym stanem (node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md). Stan „zajęty” ustawiony
// przed `router.push` zostaje więc `true` i po powrocie przycisk Dalej pokazuje ładowanie i blokuje kliknięcie,
// a arkusz otwarty w chwili przejścia otwiera się ponownie.
//
// Hooki z tego pliku przywracają stan początkowy w sprzątaniu `useLayoutEffect`. React wywołuje je, gdy Activity
// ukrywa trasę po nawigacji, więc po powrocie widok ma stan początkowy bez mignięcia starego stanu.
// `useNawigacjaZLadowaniem` dodatkowo prowadzi nawigację w `startTransition`, więc ładowanie gaśnie także przy
// przejściu, które zmienia wyłącznie parametry zapytania i zostawia tę samą trasę widoczną.
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
  type Dispatch,
  type SetStateAction,
} from 'react';

/**
 * Stan, który wraca do wartości początkowej, gdy trasa zostaje ukryta po nawigacji. Stosuj go zamiast `useState`
 * dla stanu chwilowego: zajętości przycisku przejścia, wybranej pozycji w trakcie przejścia, otwartego arkusza
 * albo okna, z którego użytkownik przechodzi na inny ekran.
 */
export function useStanChwilowy<T>(poczatkowy: T): [T, Dispatch<SetStateAction<T>>] {
  const [stan, ustawStan] = useState(poczatkowy);
  const wartoscPoczatkowa = useRef(poczatkowy);
  useLayoutEffect(() => {
    const poczatek = wartoscPoczatkowa.current;
    return () => ustawStan(poczatek);
  }, []);
  return [stan, ustawStan];
}

/** Zajętość przycisku przejścia: `useState(false)`, które wraca do `false` po ukryciu trasy. */
export function useStanZajetosci(): [boolean, Dispatch<SetStateAction<boolean>>] {
  return useStanChwilowy(false);
}

export interface OpcjePrzejscia {
  /** `router.replace` zamiast `router.push`. */
  zastap?: boolean;
  /** Przewinięcie nowej strony na górę; domyślnie `true`. */
  przewin?: boolean;
}

export interface NawigacjaZLadowaniem {
  /** `true` od `ustawZajety(true)` albo `przejdz()` do pokazania nowej trasy; przekaż do `<Przycisk zajety>`. */
  zajety: boolean;
  /** Włącza ładowanie przed zapisem albo pracą asynchroniczną i wyłącza je po błędzie. */
  ustawZajety: Dispatch<SetStateAction<boolean>>;
  /** Przejście na adres z ładowaniem do chwili pokazania nowej trasy. */
  przejdz: (href: string, opcje?: OpcjePrzejscia) => void;
}

/**
 * Nawigacja z ładowaniem dla przycisków Dalej, Wyślij i Zapisz w formularzach i kreatorach. Ładowanie trwa od
 * kliknięcia do pokazania nowej trasy i nie wraca po powrocie na ekran.
 */
export function useNawigacjaZLadowaniem(): NawigacjaZLadowaniem {
  const router = useRouter();
  const [zajetyRecznie, ustawZajety] = useStanZajetosci();
  const [nawigacjaTrwa, startTransition] = useTransition();

  const przejdz = useCallback(
    (href: string, opcje: OpcjePrzejscia = {}) => {
      const scroll = opcje.przewin ?? true;
      startTransition(() => {
        // Zerowanie w tym samym przejściu co nawigacja: do jego końca ładowanie pokazuje `nawigacjaTrwa`.
        ustawZajety(false);
        if (opcje.zastap) router.replace(href, { scroll });
        else router.push(href, { scroll });
      });
    },
    [router, ustawZajety],
  );

  return { zajety: zajetyRecznie || nawigacjaTrwa, ustawZajety, przejdz };
}
