'use client';

// Synchronizacja rodziny zalogowanego konta (kontrakt, sekcje 3.1 i 6.7): przeliczenie, gdy zmienił się
// dzień, wersja katalogu albo data odczytu kopii ZUS któregoś rodzica, oraz leniwe usunięcie danych po
// terminie 30 dni. Operacja sama sprawdza, czy przeliczenie jest potrzebne, więc efekt po zapisie
// przeliczonego planu kończy się bez zmian.
import { useEffect } from 'react';
import { useDzis, useKatalog, useRodzina, useStanKonta } from '@/dane/magazyn/hooki';
import { synchronizujRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';

export function SynchronizacjaRodziny() {
  const dzis = useDzis();
  const wersjaKatalogu = useKatalog().wersja;
  const stanKonta = useStanKonta();
  const rodzina = useRodzina();
  const idRodziny = stanKonta?.konto.idRodziny ?? null;
  const odczytZus = stanKonta?.kopiaDanychZus?.odczytano ?? null;

  useEffect(() => {
    if (idRodziny === null) return;
    synchronizujRodzine(pobierzKontekstOperacji());
  }, [dzis, wersjaKatalogu, idRodziny, odczytZus, rodzina]);

  return null;
}
