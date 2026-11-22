// Operacje kont demonstracyjnych: nowe konto (kontrakt, sekcja 6.5; analiza 3.1.1, reguła R18).
// Właściciel: u01 (Logowanie i konta demonstracyjne). Symulację uzupełnienia profilu prowadzi profil-demo.ts.
import {
  peselNowegoKonta,
  POLA_NOWEGO_KONTA,
  walidujNoweKonto,
  type DaneNowegoKonta,
} from '@/domena/konto/nowe-konto';
import { parsujDate } from '@/domena/daty';
import type { Losuj } from '@/domena/losowanie';
import type { KodKomunikatu, KontekstOperacji, KontoDemo, WynikOperacji } from '@/domena/typy';
import { utworzNoweKontoDemo } from '@/dane/magazyn/operacje/konto';
import { wykonajOperacjeZWynikiem, zajetePesele } from '@/dane/magazyn/stan';

/**
 * Założenie nowego konta demonstracyjnego: walidacja pól (bledyPol z kodami 0028, 0029, 0030, 0253,
 * 0010, 0254, 0006), numer PESEL zgodny z datą urodzenia i płcią, różny od numerów pozostałych kont,
 * i wpis w rejestrze kont demonstracyjnych (utworzNoweKontoDemo). Konto ma puste dane konta ZUS.
 * Zalogowanie nowym kontem wykonuje wywołujący operacją zalogujKontem.
 */
export function zalozNoweKonto(dane: DaneNowegoKonta, losuj: Losuj, ctx: KontekstOperacji): WynikOperacji<KontoDemo> {
  const bledy = walidujNoweKonto(dane, ctx.dzis);
  const pierwszy = POLA_NOWEGO_KONTA.find((pole) => bledy[pole] !== undefined);
  if (pierwszy !== undefined) {
    const bledyPol: Record<string, KodKomunikatu> = {};
    for (const pole of POLA_NOWEGO_KONTA) {
      const kod = bledy[pole];
      if (kod !== undefined) bledyPol[pole] = kod;
    }
    return { ok: false, kod: bledyPol[pierwszy], bledyPol };
  }

  const dataUrodzenia = parsujDate(dane.dataUrodzenia);
  if (dataUrodzenia === null || dane.plec === null) return { ok: false, kod: '0003' };
  const plec = dane.plec;

  return wykonajOperacjeZWynikiem(() =>
    utworzNoweKontoDemo(
      {
        pesel: peselNowegoKonta(dataUrodzenia, plec, losuj, zajetePesele()),
        imie: dane.imie.trim().normalize('NFC'),
        nazwisko: dane.nazwisko.trim().normalize('NFC'),
        dataUrodzenia,
        plec,
      },
      ctx,
    ),
  );
}
