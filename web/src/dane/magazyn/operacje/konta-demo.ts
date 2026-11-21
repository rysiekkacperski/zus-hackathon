// Operacje kont demonstracyjnych: nowe konto i symulacja narodzin dziecka (kontrakt, sekcja 6.5;
// analiza 3.1.1, reguła R18; analiza 3.4.1, reguła R8). Właściciel: u01 (Logowanie i konta demonstracyjne).
// Usunięcie dziecka z symulacji wykonuje przywrocStanPoczatkowy (u00), które usuwa stan symulowanego ZUS konta.
import { czyRodzinaCzekaNaDziecko, dzieckoZSymulacji } from '@/domena/dane-zus/symulacja-dziecka';
import {
  peselNowegoKonta,
  POLA_NOWEGO_KONTA,
  walidujNoweKonto,
  type DaneNowegoKonta,
} from '@/domena/konto/nowe-konto';
import { parsujDate } from '@/domena/daty';
import type { Losuj } from '@/domena/losowanie';
import type {
  CzlonekRodzinyZus,
  KodKomunikatu,
  KontekstOperacji,
  KontoDemo,
  Pesel,
  StanRodziny,
  WynikOperacji,
} from '@/domena/typy';
import { utworzNoweKontoDemo } from '@/dane/magazyn/operacje/konto';
import {
  czyTrybDemonstracyjny,
  kontoDemo,
  odczytajStanKonta,
  odczytajStanZus,
  osobyRodziny,
  rodzinaKonta,
  wykonajOperacjeZWynikiem,
  zajetePesele,
  zmienStanZus,
} from '@/dane/magazyn/stan';

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

/**
 * Dostępność symulacji narodzin dziecka na ViewDemoAccountPicker:
 * - 'dostepna': rodzina konta czeka na narodziny dziecka (czyRodzinaCzekaNaDziecko), a symulowany ZUS konta
 *   nie ma dziecka z symulacji;
 * - 'zasymulowano': symulowany ZUS konta ma dziecko z symulacji;
 * - 'bez-terminu-porodu': konto nie ma rodziny z terminem porodu dziecka, które jeszcze się nie urodziło;
 * - 'niedostepna': tryb demonstracyjny wyłączony, konto Administrator ZUS albo konto spoza rejestru.
 */
export type DostepnoscSymulacjiNarodzin = 'dostepna' | 'zasymulowano' | 'bez-terminu-porodu' | 'niedostepna';

/** Widoczna rodzina konta `pesel`, która czeka na narodziny dziecka, albo null. */
function rodzinaCzekajacaNaDziecko(pesel: Pesel): StanRodziny | null {
  const rodzina = rodzinaKonta(odczytajStanKonta(pesel)?.konto ?? null);
  return rodzina !== null && czyRodzinaCzekaNaDziecko(rodzina) ? rodzina : null;
}

export function dostepnoscSymulacjiNarodzin(pesel: Pesel): DostepnoscSymulacjiNarodzin {
  const konto = kontoDemo(pesel);
  if (!czyTrybDemonstracyjny() || konto === null || konto.rodzaj === 'konto-administratora') return 'niedostepna';
  if (odczytajStanZus(pesel)?.dzieckoZSymulacji !== undefined) return 'zasymulowano';
  return rodzinaCzekajacaNaDziecko(pesel) === null ? 'bez-terminu-porodu' : 'dostepna';
}

/**
 * Narodziny oczekiwanego dziecka w dniu demonstracyjnym `ctx.dzis`. Dziecko z symulacji (Zofia z nazwiskiem konta,
 * urodzona dziś, PESEL zgodny z tą datą) trafia do symulowanego ZUS konta `pesel` i pozostałych kont rodziców
 * w rodzinie: Rodzica, który zapisał profil, i dołączonego Drugiego rodzica. Akcja działa w trybie
 * demonstracyjnym, raz na konto do czasu przywrócenia stanu początkowego. Przewodnik oznacza dziecko jako nowe
 * przy najbliższym odczycie Danych z konta ZUS, a konto matki dostaje okno nowego dziecka w planie rodziny.
 * Typ StanSymulowanegoZus przechowuje jedno dziecko, więc ciąża mnoga daje w symulacji jedno dziecko.
 */
export function symulujNarodzinyDziecka(
  pesel: Pesel,
  ctx: KontekstOperacji,
): WynikOperacji<Omit<CzlonekRodzinyZus, 'noweDziecko'>> {
  return wykonajOperacjeZWynikiem(() => {
    const konto = kontoDemo(pesel);
    const rodzina = rodzinaCzekajacaNaDziecko(pesel);
    if (konto === null || rodzina === null || dostepnoscSymulacjiNarodzin(pesel) !== 'dostepna') {
      return { ok: false, kod: '0003' };
    }
    const dziecko = dzieckoZSymulacji(konto, ctx.dzis);
    const { peselRodzica, peselDolaczonego } = osobyRodziny(rodzina.daneRodziny);
    const rodzice = new Set<Pesel>([pesel, peselRodzica]);
    if (peselDolaczonego !== undefined) rodzice.add(peselDolaczonego);
    for (const peselRodzicaWRodzinie of rodzice) {
      zmienStanZus(
        peselRodzicaWRodzinie,
        (stan) => ({ ...stan, pesel: peselRodzicaWRodzinie, dzieckoZSymulacji: dziecko }),
        'systemowe',
      );
    }
    return { ok: true, wartosc: dziecko };
  });
}
