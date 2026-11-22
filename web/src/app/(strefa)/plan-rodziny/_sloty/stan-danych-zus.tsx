'use client';

// Slot ViewFamilyPlan „stan-danych-zus” w liście slotyNadPlanem (kontrakt, sekcja 12.4). Właściciel: u03.
// Wynik odczytu Danych z konta ZUS przy otwarciu przewodnika dla Rodzica i Drugiego rodzica (Story 3.4.1.1.1,
// reguła R6): odczyt nieudany z kopią daje komunikat 0002 z datą kopii, a odczyt nieudany bez kopii daje
// komunikat 0001 z akcją ponowienia odczytu. Udany odczyt i odczyt w toku nie pokazują niczego.
import { useState } from 'react';
import { useStanKonta } from '@/dane/magazyn/hooki';
import { odczytajIObsluzDaneZus } from '@/dane/magazyn/operacje/sesja';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { formatujDate } from '@/komponenty/format';
import { Komunikat } from '@/komponenty/komunikat';
import { Przycisk } from '@/komponenty/przycisk';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const tekst = teksty.ViewProfileZusData.stanOdczytuZus;

export function SlotStanDanychZus({ kontekst }: PropsSlotu<'nadPlanem'>) {
  const stanKonta = useStanKonta();
  const [wToku, ustawWToku] = useState(false);
  if (stanKonta === null || (kontekst.rola !== 'rodzic' && kontekst.rola !== 'drugi-rodzic')) return null;

  const { stanOdczytuZus: stan, kopiaDanychZus: kopia } = stanKonta;
  const pesel = stanKonta.konto.pesel;

  const ponow = async () => {
    ustawWToku(true);
    try {
      await odczytajIObsluzDaneZus(pesel, pobierzKontekstOperacji());
    } finally {
      ustawWToku(false);
    }
  };

  if (kopia !== null && stan.stan === 'nieudany-z-kopia') {
    return <Komunikat kod="0002" parametry={{ dataOdczytu: formatujDate(kopia.odczytano) }} />;
  }
  if (kopia === null && (stan.stan === 'nieudany-bez-kopii' || stan.stan === 'nieudany-z-kopia')) {
    return (
      <Komunikat
        kod="0001"
        akcje={
          <Przycisk wariant="drugorzedny" ikona="odswiez" zajety={wToku} onClick={() => void ponow()}>
            {tekst.pobierzPonownie}
          </Przycisk>
        }
      />
    );
  }
  return null;
}
