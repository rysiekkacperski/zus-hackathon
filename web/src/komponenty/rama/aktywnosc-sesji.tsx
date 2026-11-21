'use client';

// Wykrywanie wygaśnięcia i odnawianie sesji (kontrakt, sekcja 3.4).
// Działanie użytkownika (pointerdown, keydown, submit) w fazie przechwytywania sprawdza sesję: po 15
// minutach bezczynności blokuje zdarzenie, zapisuje ekran sprzed wygaśnięcia, kończy sesję z komunikatem
// 0212 i przechodzi na `/`; w przeciwnym razie odnawia sesję najwyżej raz na 30 sekund. Powrót do karty
// (pageshow, visibilitychange) bez sesji prowadzi na `/`.
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { sprawdzSesje, zarejestrujDzialanie } from '@/dane/magazyn/operacje/sesja';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';

const ZDARZENIA_DZIALANIA = ['pointerdown', 'keydown', 'submit'] as const;
// Kliknięcie po pointerdown, który ujawnił wygaśnięcie, też się nie wykonuje.
const ZDARZENIA_BLOKOWANE = [...ZDARZENIA_DZIALANIA, 'click'] as const;

export function AktywnoscSesji() {
  const router = useRouter();

  useEffect(() => {
    let wygasla = false;

    const zablokuj = (zdarzenie: Event) => {
      zdarzenie.preventDefault();
      zdarzenie.stopPropagation();
    };

    const naDzialanie = (zdarzenie: Event) => {
      if (wygasla) {
        zablokuj(zdarzenie);
        return;
      }
      if (zdarzenie.type === 'click') return;
      const sciezka = `${window.location.pathname}${window.location.search}`;
      if (zarejestrujDzialanie(sciezka, pobierzKontekstOperacji()) !== 'wygasla') return;
      wygasla = true;
      zablokuj(zdarzenie);
      router.replace('/');
    };

    const sprawdzObecnosc = () => {
      if (sprawdzSesje(pobierzKontekstOperacji()) === 'brak-sesji') router.replace('/');
    };
    const naWidocznosc = () => {
      if (document.visibilityState === 'visible') sprawdzObecnosc();
    };

    for (const typ of ZDARZENIA_BLOKOWANE) document.addEventListener(typ, naDzialanie, true);
    window.addEventListener('pageshow', sprawdzObecnosc);
    document.addEventListener('visibilitychange', naWidocznosc);
    return () => {
      for (const typ of ZDARZENIA_BLOKOWANE) document.removeEventListener(typ, naDzialanie, true);
      window.removeEventListener('pageshow', sprawdzObecnosc);
      document.removeEventListener('visibilitychange', naWidocznosc);
    };
  }, [router]);

  return null;
}
