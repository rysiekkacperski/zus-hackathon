// Wniosek o odpis aktu urodzenia (kontrakt, sekcja 7.2). Właściciel: u29 (Pytanie do ZUS, dane konta i odpis aktu urodzenia).
// Zaślepka fundamentu: implementuje u29. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type {
  BledyPol,
  DaneCiazyIDziecka,
  DaneRodziny,
  DataISO,
  Grosze,
  Katalog,
  WniosekOOdpis,
} from '@/domena/typy';

export type RodzajOdpisu = NonNullable<WniosekOOdpis['rodzajOdpisu']>;
export type CelOdpisu = NonNullable<WniosekOOdpis['cel']>;
export type SposobOdbioruOdpisu = NonNullable<WniosekOOdpis['sposobOdbioru']>;

/** Pola formularza ViewBirthCertificateRequest; kształt ustala właściciel (u29). */
export type FormularzOdpisu = Record<string, unknown>;

/** Profil rodziny potrzebny symulowanemu rejestrowi; kształt ustala właściciel (u29). */
export interface ProfilDoRejestru {
  daneRodziny: DaneRodziny;
  daneCiazy: DaneCiazyIDziecka | null;
}

/** Opłata skarbowa za odpis w dniu `dzien`. */
export function oplataSkarbowa(rodzaj: RodzajOdpisu, cel: CelOdpisu, dzien: DataISO, katalog: Katalog): Grosze {
  return 0;
}

/** Sposoby odbioru dostępne dla rodzaju odpisu (0198). */
export function opcjeOdbioru(rodzaj: RodzajOdpisu): SposobOdbioruOdpisu[] {
  return [];
}

/** Błędy wniosku o odpis: 0006, 0010, 0025–0031, 0163, 0191, 0195, 0196. */
export function walidujWniosekOOdpis(f: FormularzOdpisu, dzis: DataISO): BledyPol<string> {
  return {};
}

/** Odpowiedź symulowanego rejestru stanu cywilnego (0145, 0146). */
export function symulujRejestr(
  wniosek: WniosekOOdpis,
  profil: ProfilDoRejestru,
): { kod: '0145' | '0146' } | { urzadStanuCywilnego: string; przewidywanyDzienWydania: DataISO } {
  throw new Error('Zaślepka: u29');
}
