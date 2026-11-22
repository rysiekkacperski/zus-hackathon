'use client';

// Odczyt Danych z konta ZUS raz na kartę i sesję (kontrakt, sekcje 3.1 i 6.5). Operacja zapisuje znacznik
// ppm:v1:odczytano:<idSesji> przed odczytem, więc kolejne otwarcia ramy w tej karcie niczego nie odczytują,
// a po udanym odczycie uruchamia rejestr poOdczycieDanychZus.
import { useEffect } from 'react';
import { useSesja } from '@/dane/magazyn/hooki';
import { odczytajDaneZusPrzyOtwarciu } from '@/dane/magazyn/operacje/sesja';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';

export function OdczytPrzyOtwarciu() {
  const idSesji = useSesja()?.idSesji;

  useEffect(() => {
    if (idSesji === undefined) return;
    void odczytajDaneZusPrzyOtwarciu(pobierzKontekstOperacji());
  }, [idSesji]);

  return null;
}
