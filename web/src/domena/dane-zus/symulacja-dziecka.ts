// Dziecko urodzone w symulacji narodzin w symulowanym ZUS (kontrakt, sekcja 7.2; analiza 3.4.1, reguła R8).
// Właściciel: u01 (Logowanie i konta demonstracyjne).
import { zbudujPesel } from '@/domena/pesel';
import type { CzlonekRodzinyZus, DataISO, StanRodziny } from '@/domena/typy';

/** Imię dziecka z symulacji narodzin. */
export const IMIE_DZIECKA_Z_SYMULACJI = 'Zofia';

/** Stałe cyfry 7–9 numeru PESEL dziecka z symulacji; cyfra 10 to parzysta 2 (kobieta). */
const CYFRY_SERII = '078';
const CYFRA_PLCI = 2;

/**
 * Zofia z nazwiskiem konta, urodzona w dniu symulacji `dzis`, PESEL RRMMDD + '0782' + cyfra kontrolna.
 * Dla dnia 21.11.2026 i konta Anna Nowak: Zofia Nowak, 21.11.2026, PESEL 26312107828.
 */
export function dzieckoZSymulacji(konto: { nazwisko: string }, dzis: DataISO): Omit<CzlonekRodzinyZus, 'noweDziecko'> {
  return {
    imie: IMIE_DZIECKA_Z_SYMULACJI,
    nazwisko: konto.nazwisko,
    pesel: zbudujPesel(dzis, 'kobieta', CYFRY_SERII, CYFRA_PLCI),
    dataUrodzenia: dzis,
  };
}

/**
 * Rodzina czeka na narodziny dziecka: Dane ciąży i dziecka mają przewidywany termin porodu, a nie mają daty
 * porodu, urodzonych dzieci ani nowego dziecka z danych ZUS. Przyjęcie dziecka i dane wyłączone z użycia
 * po wycofaniu zgody zamykają symulację narodzin.
 */
export function czyRodzinaCzekaNaDziecko(rodzina: Pick<StanRodziny, 'daneRodziny' | 'daneCiazy'>): boolean {
  const ciaza = rodzina.daneCiazy;
  if (ciaza === null || ciaza.wylaczoneZUzycia !== undefined) return false;
  if (rodzina.daneRodziny.sytuacja?.wartosc === 'przyjecie') return false;
  return (
    ciaza.przewidywanyTerminPorodu !== undefined &&
    !ciaza.dataPoroduPotwierdzona &&
    ciaza.dataPorodu === undefined &&
    ciaza.liczbaUrodzonychDzieci === undefined &&
    ciaza.dzieci.length === 0 &&
    ciaza.noweDzieckoOczekujace === undefined
  );
}
