// Operacje kont demonstracyjnych: nowe konto i symulacja zgłoszenia dziecka (kontrakt, sekcja 6.5).
// Właściciel: u01 (Logowanie i konta demonstracyjne).
// Zaślepka fundamentu: implementuje u01. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { DaneNowegoKonta } from '@/domena/konto/nowe-konto';
import type { Losuj } from '@/domena/losowanie';
import type { KontekstOperacji, KontoDemo, Pesel, WynikOperacji } from '@/domena/typy';

/** Walidacja pól (bledyPol), PESEL nowego konta i wpis w rejestrze kont demonstracyjnych (utworzNoweKontoDemo). */
export function zalozNoweKonto(dane: DaneNowegoKonta, losuj: Losuj, ctx: KontekstOperacji): WynikOperacji<KontoDemo> {
  return { ok: false, kod: '0003' };
}

/** Dziecko z symulacji (dzieckoZSymulacji) w symulowanym ZUS konta `pesel`. */
export function symulujZgloszenieDziecka(pesel: Pesel, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}
