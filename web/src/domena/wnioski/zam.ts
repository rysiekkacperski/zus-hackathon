// Prawo do wniosku ZAM, rodzaje urlopu i walidacja danych wniosku (kontrakt, sekcja 7.2).
// Właściciel: u27 (Kreator wniosku ZAM do ZUS). Reguły R1, R2, R11, R15–R17 z analizy 3.9.1.
import { porownajDaty } from '@/domena/daty';
import { czyPeselZgodnyZData, walidujPesel } from '@/domena/pesel';
import type {
  AdresatWniosku,
  BledyPol,
  DaneRodzica,
  DataISO,
  FormaZatrudnienia,
  IdSprawy,
  IdWidoku,
  KodKomunikatu,
  KontoPrzewodnika,
  PlanRodziny,
  PlatnikZasilku,
  RodzajUrlopu,
  RodzicWRodzinie,
  Rola,
  StanRodziny,
  WniosekZam,
} from '@/domena/typy';
import { normalizujRachunek, walidujImieNazwisko, walidujRachunek } from '@/domena/walidacje';

export type TrybWnioskuZam = 'przed-porodem' | 'po-porodzie' | 'przyjecie' | 'przejecie';

/** Wejście sprawdzenia prawa do wniosku ZAM. */
export interface WejsciePrawaDoWnioskuZam {
  konto: KontoPrzewodnika;
  rodzina: StanRodziny | null;
  idSprawy: IdSprawy;
  dzis: DataISO;
}

/** Pola formularza ViewZamData w postaci wpisanej przez użytkownika. */
export interface FormularzDanychZam {
  /** Formularz zawiera sekcję danych dziecka (wniosek po porodzie). */
  zDanymiDziecka: boolean;
  imieDziecka: string;
  nazwiskoDziecka: string;
  peselDziecka: string;
  miejsceUrodzenia: string;
  numerRachunku: string;
  /** Data porodu z profilu rodziny do zgodności z numerem PESEL dziecka. */
  dataPorodu?: DataISO;
}

export type PoleDanychZam = 'imieDziecka' | 'nazwiskoDziecka' | 'peselDziecka' | 'miejsceUrodzenia' | 'numerRachunku';

export const MAKS_DLUGOSC_MIEJSCOWOSCI = 60;

/** Rodzic, którym jest konto w rodzinie: konto zakładające według Danych rodziny, konto dołączone odwrotnie. */
export function rodzicKontaWRodzinie(konto: KontoPrzewodnika, rodzina: StanRodziny): RodzicWRodzinie {
  const zakladajacy = rodzina.daneRodziny.rodzicKonta;
  if (konto.rola === 'drugi-rodzic') return zakladajacy === 'matka' ? 'drugi-rodzic' : 'matka';
  return zakladajacy;
}

/** Dane rodzica wnioskodawcy w Danych rodziny. */
export function daneRodzicaWniosku(rodzina: StanRodziny, rodzic: RodzicWRodzinie): Pick<DaneRodzica, 'dobrowolneChorobowe' | 'platnikZasilku'> & { forma: FormaZatrudnienia | null } {
  const d = rodzic === 'matka' ? rodzina.daneRodziny.matka : rodzina.daneRodziny.drugiRodzic;
  const forma = d.formaZatrudnienia?.wartosc ?? null;
  return {
    forma: forma === 'brak-drugiego-rodzica' ? null : forma,
    dobrowolneChorobowe: d.dobrowolneChorobowe,
    platnikZasilku: d.platnikZasilku,
  };
}

/** Płatnik zasiłku wnioskodawcy: przy JDG zawsze ZUS, przy umowie zlecenia z profilu rodziny. */
export function platnikZasilkuWniosku(rodzina: StanRodziny, rodzic: RodzicWRodzinie): PlatnikZasilku {
  const d = daneRodzicaWniosku(rodzina, rodzic);
  if (d.forma === 'jdg') return 'zus';
  return d.platnikZasilku?.wartosc ?? 'nieustalony';
}

/** Adresat wniosku według płatnika zasiłku. */
export function adresatWniosku(platnik: PlatnikZasilku): AdresatWniosku {
  return platnik === 'platnik-skladek' ? 'platnik-skladek' : 'zus';
}

/** Ekran startowy kreatora ZAM z komunikatem i trybem (R1: 0036, 0064, 0037, ViewProfilePayer). */
export function sprawdzPrawoDoWnioskuZam(w: WejsciePrawaDoWnioskuZam): {
  cel: IdWidoku;
  kod?: KodKomunikatu;
  tryb?: TrybWnioskuZam;
  /** Sprawa celu ViewCaseGuide (K07 przy 0036). */
  idSprawy?: IdSprawy;
} {
  const { konto, rodzina } = w;
  if (rodzina === null) return { cel: 'ViewFamilyPlan', kod: '0064' };
  const rodzic = rodzicKontaWRodzinie(konto, rodzina);
  const d = daneRodzicaWniosku(rodzina, rodzic);
  if (d.forma === 'umowa-o-prace') return { cel: 'ViewCaseGuide', kod: '0036', idSprawy: 'K07' };
  if (d.forma === null || d.forma === 'brak-tytulu' || d.dobrowolneChorobowe?.wartosc !== true) {
    return { cel: 'ViewFamilyPlan', kod: '0064' };
  }
  const ciaza = rodzina.daneCiazy;
  if (ciaza?.przyjecie) return { cel: 'ViewZamLeaveType', tryb: 'przyjecie' };
  const porodPotwierdzony = ciaza?.dataPoroduPotwierdzona === true && ciaza.dataPorodu !== undefined;
  if (!porodPotwierdzony) {
    if (rodzic === 'matka' && ciaza?.przewidywanyTerminPorodu) {
      if (d.forma === 'umowa-zlecenia' && platnikZasilkuWniosku(rodzina, rodzic) === 'nieustalony') {
        return { cel: 'ViewProfilePayer', tryb: 'przed-porodem' };
      }
      return { cel: 'ViewZamLeaveType', tryb: 'przed-porodem' };
    }
    return { cel: 'ViewFamilyPlan', kod: '0037' };
  }
  if (d.forma === 'umowa-zlecenia' && platnikZasilkuWniosku(rodzina, rodzic) === 'nieustalony') {
    return { cel: 'ViewProfilePayer', tryb: 'po-porodzie' };
  }
  return { cel: 'ViewZamLeaveType', tryb: 'po-porodzie' };
}

/** Rodzaje urlopu dostępne we wniosku ZAM dla roli i trybu (R2). */
export function dostepneRodzajeUrlopu(rola: Rola, plan: PlanRodziny | null, tryb: TrybWnioskuZam): RodzajUrlopu[] {
  if (tryb === 'przed-porodem') return ['macierzynski'];
  if (tryb === 'przyjecie') return ['na-warunkach-macierzynskiego', 'rodzicielski'];
  if (rola === 'drugi-rodzic') return ['ojcowski', 'rodzicielski'];
  const rodzaje: RodzajUrlopu[] = ['macierzynski', 'rodzicielski'];
  if (plan?.pozycje.some((p) => p.idPozycji === 'K11')) rodzaje.push('uzupelniajacy');
  return rodzaje;
}

/** Błędy danych wniosku ZAM: 0024–0031, 0039–0041 (R15–R17). Pierwsze pole z błędem wyznacza kolejność pól. */
export function walidujDaneZam(f: FormularzDanychZam): BledyPol<string> {
  const bledy: BledyPol<PoleDanychZam> = {};
  if (f.zDanymiDziecka) {
    const imie = walidujImieNazwisko(f.imieDziecka, 'imie');
    if (imie) bledy.imieDziecka = imie;
    const nazwisko = walidujImieNazwisko(f.nazwiskoDziecka, 'nazwisko');
    if (nazwisko) bledy.nazwiskoDziecka = nazwisko;
    const pesel = walidujPesel(f.peselDziecka);
    if (!pesel.ok) bledy.peselDziecka = pesel.kod;
    else if (f.dataPorodu && !czyPeselZgodnyZData(pesel.pesel, f.dataPorodu)) bledy.peselDziecka = '0027';
    const miejsce = f.miejsceUrodzenia.trim();
    if (miejsce === '' || miejsce.length > MAKS_DLUGOSC_MIEJSCOWOSCI) bledy.miejsceUrodzenia = '0031';
  }
  const rachunek = walidujRachunek(f.numerRachunku, true);
  if (rachunek) bledy.numerRachunku = rachunek;
  return bledy;
}

/** Numer rachunku do zapisu: 26 cyfr bez spacji. */
export function rachunekDoZapisu(tekst: string): string {
  return normalizujRachunek(tekst);
}

/** Załączniki wniosku dla komunikatu 0149 (R11). */
export function zalacznikiZam(w: { wniosek: WniosekZam; adresat: AdresatWniosku }): ('zaswiadczenie-szpitala' | 'zaswiadczenie-lekarskie' | 'odpis-skrocony')[] {
  const lista: ('zaswiadczenie-szpitala' | 'zaswiadczenie-lekarskie' | 'odpis-skrocony')[] = [];
  if (w.wniosek.rodzajUrlopu === 'uzupelniajacy') lista.push('zaswiadczenie-szpitala');
  if (w.wniosek.przedPorodem) lista.push('zaswiadczenie-lekarskie');
  else if (w.adresat === 'platnik-skladek') lista.push('odpis-skrocony');
  return lista;
}

/** Komunikat 0260 przy umowie zlecenia i płatniku ZUS. */
export function czyPotrzebneZ3a(forma: FormaZatrudnienia | null, adresat: AdresatWniosku): boolean {
  return forma === 'umowa-zlecenia' && adresat === 'zus';
}

/** Najwcześniejsza data z listy okresów wniosku i najpóźniejsza data końca. */
export function zakresOkresow(okresy: WniosekZam['okresy']): { od: DataISO; do: DataISO } | null {
  if (okresy.length === 0) return null;
  let od = okresy[0].od;
  let doD = okresy[0].do;
  for (const o of okresy) {
    if (porownajDaty(o.od, od) < 0) od = o.od;
    if (porownajDaty(o.do, doD) > 0) doD = o.do;
  }
  return { od, do: doD };
}
