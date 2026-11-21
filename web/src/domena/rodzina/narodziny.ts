// Narodziny dziecka: data porodu, dane dziecka, wymiar urlopów i pakiet narodzin (kontrakt, sekcja 7.2).
// Właściciel: u19 (Pakiet narodzin).
// Zaślepka fundamentu: implementuje u19. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type {
  BledyPol,
  CzlonekRodzinyZus,
  DaneCiazyIDziecka,
  DataISO,
  FormaZatrudnienia,
  KalendarzTerminow,
  Katalog,
  PlanRodziny,
  PozycjaPlanu,
} from '@/domena/typy';

/** Pola formularza ViewBirthDate; kształt ustala właściciel (u19). */
export type FormularzDatyPorodu = Record<string, unknown>;
/** Pola formularza ViewBirthDetails; kształt ustala właściciel (u19). */
export type FormularzDanychDziecka = Record<string, unknown>;

export type WymiarUzupelniajacegoUrlopu = NonNullable<DaneCiazyIDziecka['wymiarUzupelniajacegoUrlopu']>;

/** Błędy daty porodu: 0018, 0010, 0019, 0020, 0006. */
export function walidujDatePorodu(f: FormularzDatyPorodu, dzis: DataISO): BledyPol<string> {
  return {};
}

/** Błędy danych dziecka: 0021, 0022, 0023. */
export function walidujDaneDziecka(f: FormularzDanychDziecka): BledyPol<string> {
  return {};
}

/** Wymiar uzupełniającego urlopu macierzyńskiego z tygodnia ciąży, masy i dni hospitalizacji. */
export function wyznaczUzupelniajacyUrlop(
  forma: FormaZatrudnienia | null,
  chorobowe: boolean,
  tydzien: number | undefined,
  masa: number | undefined,
  dni: number | undefined,
): WymiarUzupelniajacegoUrlopu {
  return 'nie-sprawdzono';
}

/** Wymiar urlopu rodzicielskiego w tygodniach (41, 43, 65, 67, 38, 62). */
export function wyznaczWymiarUrlopuRodzicielskiego(
  liczbaDzieci: number,
  zaZyciem: boolean,
  dataPorodu: DataISO,
  katalog: Katalog,
): number {
  throw new Error('Zaślepka: u19');
}

/** Sprawy proponowane w pakiecie narodzin. */
export function dobierzPropozycjePakietu(
  plan: PlanRodziny,
  kalendarz: KalendarzTerminow | null,
  forma: FormaZatrudnienia | null,
  dataPorodu: DataISO,
): PozycjaPlanu[] {
  return [];
}

/** Rozbieżność daty porodu z dziećmi z konta ZUS: 0063; null, gdy dane są zgodne. */
export function porownajZDanymiZus(dataPorodu: DataISO, noweDzieci: CzlonekRodzinyZus[]): '0063' | null {
  return null;
}
