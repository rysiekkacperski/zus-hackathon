// Stan rozliczeń składek JDG i skutek zadłużenia (kontrakt, sekcja 7.2).
// Właściciel: u14 (Dane ZUS: e-ZLA, rozliczenia składek, statusy wniosków).
// Zaślepka fundamentu: implementuje u14. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type {
  DaneCiazyIDziecka,
  DataISO,
  Grosze,
  KodKomunikatu,
  OsZadluzenia,
  StanRozliczenSkladek,
  ZaswiadczenieEzla,
  ZaswiadczenieOStanieRozliczen,
  ZnacznikCzasu,
} from '@/domena/typy';

/** Stan rozliczeń na dzień `dzien` z osi zadłużenia. Zaślepka zwraca stan bez zadłużenia. */
export function stanNaDzien(os: OsZadluzenia, dzien: DataISO, teraz: ZnacznikCzasu): StanRozliczenSkladek {
  return { dzien, kwotaZadluzenia: 0, odczytano: teraz };
}

/** Dni powstania prawa do świadczeń z danych ciąży i zaświadczeń e-ZLA. */
export function dniPowstaniaPrawa(daneCiazy: DaneCiazyIDziecka | null, ezla: ZaswiadczenieEzla[]): DataISO[] {
  return [];
}

/** Skutek zadłużenia dla prawa do świadczenia: 0083, 0116, 0117, 0182–0187. */
export function skutekZadluzenia(
  stan: StanRozliczenSkladek,
  dzienPowstania: DataISO,
  prog: Grosze,
  okresSplaty: number,
  dzis: DataISO,
  maChorobowe: boolean,
): { kod: KodKomunikatu; parametry: Record<string, string> } {
  throw new Error('Zaślepka: u14');
}

/** Domyślny dzień stanu w zaświadczeniu o stanie rozliczeń. */
export function domyslnyDzienZaswiadczenia(daneCiazy: DaneCiazyIDziecka | null, dzis: DataISO): DataISO {
  return dzis;
}

/** Rodzaj zaświadczenia według kwoty zadłużenia. */
export function rodzajZaswiadczenia(stan: StanRozliczenSkladek): ZaswiadczenieOStanieRozliczen['rodzaj'] {
  return 'o-niezaleganiu';
}
