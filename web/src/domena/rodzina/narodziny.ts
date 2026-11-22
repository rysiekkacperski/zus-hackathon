// Narodziny dziecka: data porodu, dane dziecka, wymiar urlopów i pakiet narodzin (kontrakt, sekcja 7.2).
// Właściciel: u19 (Pakiet narodzin). Czyste funkcje bez zegara: datę „dzisiaj” dostają jako argument.
import { dodajMiesiace, porownajDaty } from '@/domena/daty';
import type { ProgiUzupelniajacego } from '@/domena/kalkulatory/okresy';
import type {
  BledyPol,
  CzlonekRodzinyZus,
  DaneCiazyIDziecka,
  DaneRodzica,
  DataISO,
  FormaZatrudnienia,
  IdSprawy,
  KalendarzTerminow,
  Katalog,
  LiczbaDzieci,
  PlanRodziny,
  PozycjaPlanu,
} from '@/domena/typy';
import { walidujDateWZakresie, walidujLiczbeCalkowita } from '@/domena/walidacje';

/** Źródło potwierdzenia daty porodu na ViewBirthDate. */
export type ZrodloPotwierdzeniaDaty = 'plan' | 'rozna-data' | 'profil';

/** Pola formularza ViewBirthDate. */
export interface FormularzDatyPorodu {
  dataPorodu: string;
  liczbaDzieci: string;                 // '' = „Wybierz”, '1' … '5'
  zrodlo?: ZrodloPotwierdzeniaDaty;     // domyślnie 'plan'
}

/** Pola formularza ViewBirthDetails. */
export interface FormularzDanychDziecka {
  tydzienCiazy: string;
  masaUrodzeniowa: string;
  dniHospitalizacji: string;
  pobytWSzpitalu?: '' | 'tak' | 'nie';  // '' = brak wyboru; pole widoczne przy tygodniu do 36 albo masie do 1000 g
  ciezkaChoroba: boolean;
  zaswiadczenieZaZyciem: boolean;
  tryb?: 'pakiet' | 'zmiana';           // domyślnie 'pakiet'
}

export type PoleDatyPorodu = 'dataPorodu' | 'liczbaDzieci';
export type PoleDanychDziecka = 'tydzienCiazy' | 'masaUrodzeniowa' | 'pobytWSzpitalu' | 'dniHospitalizacji';

/** Ostatni ukończony tydzień ciąży, od którego poród liczy się jako przed ukończeniem 37. tygodnia. */
export const TYDZIEN_PRZEDWCZESNEGO_PORODU = 36;
/** Masa urodzeniowa w gramach, do której dziecko uprawnia do uzupełniającego urlopu do 15 tygodni. */
export const MASA_NISKA_URODZENIOWA = 1000;
/** Najwyższa liczba kolejnych dni pobytu dziecka w szpitalu od 5. dnia po porodzie do upływu 8. tygodnia. */
export const DNI_HOSPITALIZACJI_MAKS = 52;

/** Czy pole pobytu dziecka w szpitalu po porodzie jest widoczne i obowiązkowe: tydzień do 36 albo masa do 1000 g. */
export function czyPytacOPobytWSzpitalu(tydzienCiazy: string, masaUrodzeniowa: string): boolean {
  const tydzien = walidujLiczbeCalkowita(tydzienCiazy, 22, 44, '0021');
  const masa = walidujLiczbeCalkowita(masaUrodzeniowa, 300, 7000, '0022');
  return (!('kod' in tydzien) && tydzien.liczba <= TYDZIEN_PRZEDWCZESNEGO_PORODU)
    || (!('kod' in masa) && masa.liczba <= MASA_NISKA_URODZENIOWA);
}

export type WymiarUzupelniajacegoUrlopu = NonNullable<DaneCiazyIDziecka['wymiarUzupelniajacegoUrlopu']>;

/** Zakres daty porodu: 36 miesięcy wstecz od dziś (włącznie) do dziś. */
export const MIESIACE_WSTECZ_DATY_PORODU = 36;
/** Okno pakietu narodzin: sprawy z terminem do daty porodu + 3 miesiące. */
export const MIESIACE_OKNA_PAKIETU = 3;
/** Nieprzenoszalna część urlopu rodzicielskiego dla każdego z rodziców. */
export const TYGODNIE_WYLACZNE_RODZICA = 9;

/** Najwcześniejsza dopuszczalna data porodu. */
export function najwczesniejszaDataPorodu(dzis: DataISO): DataISO {
  return dodajMiesiace(dzis, -MIESIACE_WSTECZ_DATY_PORODU);
}

/** Liczba dzieci z pola wyboru albo null, gdy nie wybrano wartości 1 … 5. */
export function liczbaDzieciZPola(tekst: string): LiczbaDzieci | null {
  const liczba = Number(tekst);
  return Number.isInteger(liczba) && liczba >= 1 && liczba <= 5 && tekst.trim() !== '' ? (liczba as LiczbaDzieci) : null;
}

/** Błędy daty porodu: 0018, 0010, 0019, 0020, 0006. */
export function walidujDatePorodu(f: FormularzDatyPorodu, dzis: DataISO): BledyPol<PoleDatyPorodu> {
  const bledy: BledyPol<PoleDatyPorodu> = {};
  const data = walidujDateWZakresie(
    f.dataPorodu,
    { od: najwczesniejszaDataPorodu(dzis), do: dzis },
    { pusta: '0018', format: '0010', zaPozno: '0019', zaWczesnie: '0020' },
  );
  if ('kod' in data) bledy.dataPorodu = data.kod;
  if (liczbaDzieciZPola(f.liczbaDzieci) === null) bledy.liczbaDzieci = '0006';
  return bledy;
}

/** Wartości liczbowe poprawnego formularza danych dziecka. */
export interface DaneDzieckaPoPorodzie {
  tydzien: number;
  masa: number;
  dni: number;
  /** Pobyt dziecka w szpitalu po porodzie; undefined, gdy pole nie jest widoczne. */
  pobyt?: boolean;
}

/** Odczyt liczb z formularza danych dziecka; null przy dowolnym błędzie. */
export function odczytajDaneDziecka(f: FormularzDanychDziecka): DaneDzieckaPoPorodzie | null {
  const tydzien = walidujLiczbeCalkowita(f.tydzienCiazy, 22, 44, '0021');
  const masa = walidujLiczbeCalkowita(f.masaUrodzeniowa, 300, 7000, '0022');
  const dni = walidujLiczbeCalkowita(f.dniHospitalizacji, 0, DNI_HOSPITALIZACJI_MAKS, '0289');
  if ('kod' in tydzien || 'kod' in masa || 'kod' in dni) return null;
  const pytac = czyPytacOPobytWSzpitalu(f.tydzienCiazy, f.masaUrodzeniowa);
  if (pytac && !f.pobytWSzpitalu) return null;
  return {
    tydzien: tydzien.liczba,
    masa: masa.liczba,
    dni: dni.liczba,
    ...(pytac ? { pobyt: f.pobytWSzpitalu === 'tak' } : {}),
  };
}

/** Błędy danych dziecka: 0021, 0022, 0006 (pobyt w szpitalu), 0289. */
export function walidujDaneDziecka(f: FormularzDanychDziecka): BledyPol<PoleDanychDziecka> {
  const bledy: BledyPol<PoleDanychDziecka> = {};
  const tydzien = walidujLiczbeCalkowita(f.tydzienCiazy, 22, 44, '0021');
  const masa = walidujLiczbeCalkowita(f.masaUrodzeniowa, 300, 7000, '0022');
  const dni = walidujLiczbeCalkowita(f.dniHospitalizacji, 0, DNI_HOSPITALIZACJI_MAKS, '0289');
  if ('kod' in tydzien) bledy.tydzienCiazy = tydzien.kod;
  if ('kod' in masa) bledy.masaUrodzeniowa = masa.kod;
  if (czyPytacOPobytWSzpitalu(f.tydzienCiazy, f.masaUrodzeniowa) && !f.pobytWSzpitalu) bledy.pobytWSzpitalu = '0006';
  if ('kod' in dni) bledy.dniHospitalizacji = dni.kod;
  return bledy;
}

/** Czy matka może mieć uzupełniający urlop macierzyński: umowa o pracę albo dobrowolne ubezpieczenie chorobowe. */
export function czyUzupelniajacyUrlopMozliwy(forma: FormaZatrudnienia | null, chorobowe: boolean): boolean {
  if (forma === 'umowa-o-prace') return true;
  if (forma === 'umowa-zlecenia' || forma === 'jdg') return chorobowe;
  return false;
}

/**
 * Wymiar uzupełniającego urlopu macierzyńskiego z liczby ukończonych tygodni ciąży w dniu porodu, masy,
 * pobytu dziecka w szpitalu po porodzie i liczby kolejnych dni pobytu od 5. dnia po porodzie:
 * - do 15 tygodni: tydzień do 27 albo masa do 1000 g i pobyt w szpitalu po porodzie;
 * - do 8 tygodni: tydzień od 28 do 36, masa powyżej 1000 g i pobyt w szpitalu po porodzie;
 * - do 8 tygodni: tydzień od 37, masa powyżej 1000 g i co najmniej 2 kolejne dni pobytu od 5. do 28. dnia.
 * Bez odpowiedzi o pobycie (dane sprzed pola) pobyt wynika z liczby dni hospitalizacji większej od 0.
 * Progi `progi` pochodzą ze słownika wymiarów (progiUzupelniajacego z katalogu w dniu porodu).
 */
export function wyznaczUzupelniajacyUrlop(
  forma: FormaZatrudnienia | null,
  chorobowe: boolean,
  tydzien: number | undefined,
  masa: number | undefined,
  dni: number | undefined,
  pobytWSzpitalu?: boolean,
  progi?: Pick<ProgiUzupelniajacego, 'tydzienCiazy' | 'masaG' | 'tydzienWTerminie' | 'najkrotszyPobyt'>,
): WymiarUzupelniajacegoUrlopu {
  if (tydzien === undefined || masa === undefined) return 'nie-sprawdzono';
  const p = progi ?? { tydzienCiazy: 28, masaG: MASA_NISKA_URODZENIOWA, tydzienWTerminie: TYDZIEN_PRZEDWCZESNEGO_PORODU + 1, najkrotszyPobyt: 2 };
  if (!czyUzupelniajacyUrlopMozliwy(forma, chorobowe)) return 'brak';
  const pobyt = pobytWSzpitalu ?? (dni ?? 0) > 0;
  if (tydzien < p.tydzienCiazy || masa <= p.masaG) return pobyt ? 'do-15' : 'brak';
  if (tydzien < p.tydzienWTerminie) return pobyt ? 'do-8' : 'brak';
  if ((dni ?? 0) >= p.najkrotszyPobyt) return 'do-8';
  return 'brak';
}

/** Tygodnie uzupełniającego urlopu macierzyńskiego zapisywane przy sprawie K11. */
export function tygodnieUzupelniajacegoUrlopu(w: WymiarUzupelniajacegoUrlopu | undefined): number | null {
  if (w === 'do-15') return 15;
  if (w === 'do-8') return 8;
  return null;
}

const ID_WPISU_URLOPU_RODZICIELSKIEGO = 'urlop-rodzicielski';
// Kolejność wariantów wpisu ze wzoru P04-06: 1 dziecko, więcej niż 1, 1 z „Za życiem”, więcej niż 1 z „Za życiem”.
const DOMYSLNE_WYMIARY_RODZICIELSKIEGO = [41, 43, 65, 67] as const;

function indeksWariantuRodzicielskiego(liczbaDzieci: number, zaZyciem: boolean): 0 | 1 | 2 | 3 {
  const wiecej = liczbaDzieci > 1;
  if (zaZyciem) return wiecej ? 3 : 2;
  return wiecej ? 1 : 0;
}

/** Wymiar urlopu rodzicielskiego w tygodniach ze słownika obowiązującego w dniu porodu (41, 43, 65, 67). */
export function wyznaczWymiarUrlopuRodzicielskiego(
  liczbaDzieci: number,
  zaZyciem: boolean,
  dataPorodu: DataISO,
  katalog: Katalog,
): number {
  const indeks = indeksWariantuRodzicielskiego(liczbaDzieci, zaZyciem);
  const wpis = katalog.slowniki.find((s) => s.id === ID_WPISU_URLOPU_RODZICIELSKIEGO);
  const wariant = wpis?.warianty[indeks];
  if (wpis && wariant) {
    const wersja = wpis.wersje.find(
      (v) => porownajDaty(v.od, dataPorodu) <= 0 && (v.do === undefined || porownajDaty(dataPorodu, v.do) <= 0),
    );
    const wartosc = wersja?.wartosci[wariant.klucz];
    if (typeof wartosc === 'number' && wartosc > 0) return wartosc;
  }
  return DOMYSLNE_WYMIARY_RODZICIELSKIEGO[indeks];
}

/** Ostatni dzień okna pakietu narodzin. */
export function koniecOknaPakietu(dataPorodu: DataISO): DataISO {
  return dodajMiesiace(dataPorodu, MIESIACE_OKNA_PAKIETU);
}

function numerSprawy(idSprawy: IdSprawy): number {
  const dopasowanie = /^K(\d+)/.exec(idSprawy);
  return dopasowanie ? Number(dopasowanie[1]) : Number.MAX_SAFE_INTEGER;
}

/**
 * Czy umowa o pracę matki trwa po dniu porodu (3.3.2.2.3): forma umowa o pracę bez ustania tej umowy
 * przed porodem ani w dniu porodu, także przez przedłużenie do dnia porodu.
 */
export function czyUmowaOPraceTrwaPoPorodzie(matka: DaneRodzica | null, dataPorodu: DataISO): boolean {
  if (matka?.formaZatrudnienia?.wartosc !== 'umowa-o-prace') return false;
  const zmiana = matka.zmianaZatrudnienia;
  if (zmiana?.rodzaj.wartosc !== 'ustanie') return true;
  if (zmiana.forma !== undefined && zmiana.forma.wartosc !== 'umowa-o-prace') return true;
  // Umowa przedłużona do dnia porodu (art. 177 § 3 Kodeksu pracy) kończy się w dniu porodu, a przy porodzie przed
  // dniem jej rozwiązania przedłużenie nie następuje i umowa trwa do tego dnia, więc rozstrzyga sama data ustania.
  const dataUstania = zmiana.data?.wartosc;
  return dataUstania !== undefined && porownajDaty(dataUstania, dataPorodu) > 0;
}

/**
 * Sprawy proponowane w pakiecie narodzin: do zrobienia, z terminem do daty porodu + 3 miesiące, rosnąco
 * po terminie, a przy równych terminach po identyfikatorze katalogu. Instrukcję wniosku o urlopy
 * u pracodawcy (K07) pakiet podsuwa pracownikowi, którego umowa o pracę trwa po dniu porodu, i wtedy
 * wniosek o zasiłek macierzyński K08 pakiet pokazuje pozostałym formom.
 */
export function dobierzPropozycjePakietu(
  plan: PlanRodziny,
  kalendarz: KalendarzTerminow | null,
  forma: FormaZatrudnienia | null,
  dataPorodu: DataISO,
  umowaTrwaPoPorodzie: boolean = forma === 'umowa-o-prace',
): PozycjaPlanu[] {
  const koniec = koniecOknaPakietu(dataPorodu);
  const termin = (id: IdSprawy) => kalendarz?.terminy.find((t) => t.idSprawy === id)?.termin ?? null;
  const zK07 = umowaTrwaPoPorodzie && plan.pozycje.some((q) => q.idPozycji === 'K07');
  const zTerminem = plan.pozycje
    .filter((p) => p.status === 'do-zrobienia')
    .filter((p) => p.idPozycji !== 'K07' || umowaTrwaPoPorodzie)
    .filter((p) => !(forma === 'umowa-o-prace' && p.idPozycji === 'K08' && zK07))
    .map((p) => ({ p, t: termin(p.idSprawy) }))
    .filter((x): x is { p: PozycjaPlanu; t: DataISO } => x.t !== null && porownajDaty(x.t, koniec) <= 0);
  zTerminem.sort((a, b) => porownajDaty(a.t, b.t) || numerSprawy(a.p.idSprawy) - numerSprawy(b.p.idSprawy) || a.p.idSprawy.localeCompare(b.p.idSprawy));
  return zTerminem.map((x) => x.p);
}

/** Dzieci z danych ZUS o tej samej dacie urodzenia co pierwsze z nich. */
export function dzieciZTaSamaData(dzieci: readonly CzlonekRodzinyZus[]): CzlonekRodzinyZus[] {
  const pierwsze = dzieci[0];
  if (pierwsze === undefined) return [];
  return dzieci.filter((d) => d.dataUrodzenia === pierwsze.dataUrodzenia);
}

/** Rozbieżność daty porodu z dziećmi z konta ZUS: 0063; null, gdy dane są zgodne. */
export function porownajZDanymiZus(dataPorodu: DataISO, noweDzieci: CzlonekRodzinyZus[]): '0063' | null {
  if (noweDzieci.length === 0) return null;
  return noweDzieci.some((d) => d.dataUrodzenia === dataPorodu) ? null : '0063';
}
