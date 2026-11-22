'use client';

// Slot nad planem ViewFamilyPlan: informacja po symulacji uzupełnienia profilu z ViewDemoAccountPicker
// z przewidywanym terminem porodu. Informacja dotyczy konta, dla którego trwała symulacja, i znika po
// opuszczeniu planu. Sprzątanie z opóźnieniem chroni ją przed podwójnym uruchomieniem efektu w trybie
// deweloperskim. Właściciel: u01.
import { useEffect, useSyncExternalStore } from 'react';
import {
  informacjaOSymulacjiProfilu,
  subskrybujInformacjeOSymulacjiProfilu,
  zamknijInformacjeOSymulacjiProfilu,
} from '@/dane/magazyn/operacje/profil-demo';
import { formatujDate } from '@/komponenty/format';
import { Komunikat } from '@/komponenty/komunikat';
import { teksty } from '@/teksty';
import type { PropsSlotuPlanu } from './typy';

let zaplanowaneZamkniecie: ReturnType<typeof setTimeout> | null = null;

function brak() {
  return null;
}

export function SlotInformacjaSymulacjiProfilu({ kontekst }: PropsSlotuPlanu) {
  const informacja = useSyncExternalStore(subskrybujInformacjeOSymulacjiProfilu, informacjaOSymulacjiProfilu, brak);
  const widoczna = informacja !== null && informacja.pesel === kontekst.konto.pesel;

  useEffect(() => {
    if (!widoczna) return;
    if (zaplanowaneZamkniecie !== null) clearTimeout(zaplanowaneZamkniecie);
    zaplanowaneZamkniecie = null;
    return () => {
      zaplanowaneZamkniecie = setTimeout(() => {
        zaplanowaneZamkniecie = null;
        zamknijInformacjeOSymulacjiProfilu();
      }, 0);
    };
  }, [widoczna]);

  if (!widoczna) return null;
  return (
    <Komunikat typ="SUCCESS" tresc={teksty.ViewFamilyPlan.profilZSymulacji({ data: formatujDate(informacja.terminPorodu) })} />
  );
}
