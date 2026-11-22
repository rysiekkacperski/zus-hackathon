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
  Wniosek,
  WniosekZam,
} from '@/domena/typy';
import { normalizujRachunek, normalizujTelefon, walidujImieNazwisko, walidujRachunek, walidujTelefon } from '@/domena/walidacje';
import { sprawdzPrzyjecieDoWniosku } from '@/domena/wnioski/zam-przyjecie';

export type TrybWnioskuZam = 'przed-porodem' | 'po-porodzie' | 'przyjecie' | 'przejecie';

// 3.9.1.1.7 i 3.9.1.1.8: numer telefonu, dane płatnika składek i objęcie ubezpieczeniem chorobowym we wniosku ZAM.
declare module '@/domena/typy/wnioski' {
  interface WniosekZam {
    numerTelefonu?: string;
    platnikSkladek?: { nazwa: string; nip: string; regon: string; adres?: string };
    objecieChorobowym?: boolean;
    /** Numer części urlopu rodzicielskiego albo ojcowskiego wyliczony z wniosków obojga rodziców. */
    numerCzesci?: number;
  }
}

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
  /** Numer telefonu wnioskodawcy, pole opcjonalne (3.9.1.1.7). */
  numerTelefonu?: string;
  /** Data porodu z profilu rodziny do zgodności z numerem PESEL dziecka. */
  dataPorodu?: DataISO;
}

export type PoleDanychZam = 'imieDziecka' | 'nazwiskoDziecka' | 'peselDziecka' | 'miejsceUrodzenia' | 'numerRachunku' | 'numerTelefonu';

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
  /** Sprawa celu ViewCaseGuide (K07 przy 0036, K31 po przyjęciu dziecka). */
  idSprawy?: IdSprawy;
  /** Parametry komunikatu, na przykład wiek przy 0091. */
  parametry?: Record<string, string>;
} {
  const { konto, rodzina } = w;
  if (rodzina === null) return { cel: 'ViewFamilyPlan', kod: '0064' };
  const rodzic = rodzicKontaWRodzinie(konto, rodzina);
  const d = daneRodzicaWniosku(rodzina, rodzic);
  const ciaza = rodzina.daneCiazy;
  if (d.forma === 'umowa-o-prace') return { cel: 'ViewCaseGuide', kod: '0036', idSprawy: ciaza?.przyjecie ? 'K31' : 'K07' };
  if (d.forma === null || d.forma === 'brak-tytulu' || d.dobrowolneChorobowe?.wartosc !== true) {
    return { cel: 'ViewFamilyPlan', kod: '0064' };
  }
  if (ciaza?.przyjecie) {
    const brakPrawa = sprawdzPrzyjecieDoWniosku(ciaza.przyjecie);
    if (brakPrawa) return { cel: 'ViewFamilyPlan', kod: brakPrawa.kod, ...('parametry' in brakPrawa ? { parametry: brakPrawa.parametry } : {}) };
    if (d.forma === 'umowa-zlecenia' && platnikZasilkuWniosku(rodzina, rodzic) === 'nieustalony') {
      return { cel: 'ViewProfilePayer', tryb: 'przyjecie' };
    }
    return { cel: 'ViewZamLeaveType', tryb: 'przyjecie' };
  }
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

/** Wniosek drugiej roli o uzupełniający urlop macierzyński wysłany albo przygotowany (3.9.1.1.5). */
export function czyDrugaRolaWnioskowalaOUzupelniajacy(rola: Rola, wnioski: Wniosek[]): boolean {
  return wnioski.some(
    (w) =>
      w.rola !== rola &&
      w.stan !== 'szkic' &&
      ((w.rodzaj === 'zam' && w.rodzajUrlopu === 'uzupelniajacy') ||
        ((w.rodzaj === 'urlop-do-pracodawcy' || w.rodzaj === 'wniosek-ojca-o-urlop') && w.podrodzaj === 'uzupelniajacy')),
  );
}

/** Termin wniosku o zasiłek za uzupełniający urlop macierzyński minął (0269): dziś przypada po końcu urlopu macierzyńskiego. */
export function czyMinalTerminUzupelniajacego(koniecMacierzynskiego: DataISO | null | undefined, dzis: DataISO): boolean {
  return Boolean(koniecMacierzynskiego) && porownajDaty(dzis, koniecMacierzynskiego as DataISO) > 0;
}

/** Kontekst dostępności uzupełniającego urlopu macierzyńskiego (3.9.1.1.5). */
export interface KontekstRodzajowUrlopu {
  wnioski: Wniosek[];
  koniecMacierzynskiego?: DataISO | null;
  dzis: DataISO;
}

/** Rodzaje urlopu dostępne we wniosku ZAM dla roli i trybu (R2, 3.9.1.1.5). */
export function dostepneRodzajeUrlopu(
  rola: Rola,
  plan: PlanRodziny | null,
  tryb: TrybWnioskuZam,
  kontekst?: KontekstRodzajowUrlopu,
): RodzajUrlopu[] {
  if (tryb === 'przed-porodem') return ['macierzynski'];
  if (tryb === 'przyjecie') return ['na-warunkach-macierzynskiego', 'rodzicielski'];
  const rodzaje: RodzajUrlopu[] = rola === 'drugi-rodzic' ? ['ojcowski', 'rodzicielski'] : ['macierzynski', 'rodzicielski'];
  const zK11 = plan?.pozycje.some((p) => p.idPozycji === 'K11') ?? false;
  const wnioskowalaDrugaRola = kontekst ? czyDrugaRolaWnioskowalaOUzupelniajacy(rola, kontekst.wnioski) : false;
  const poTerminie = kontekst ? czyMinalTerminUzupelniajacego(kontekst.koniecMacierzynskiego, kontekst.dzis) : false;
  if (zK11 && !wnioskowalaDrugaRola && !poTerminie) rodzaje.push('uzupelniajacy');
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
  // 3.9.1.1.7: numer rachunku jest opcjonalny, pusty rachunek przy płatniku ZUS oznacza przekaz pocztowy (0241).
  const rachunek = walidujRachunek(f.numerRachunku, false);
  if (rachunek) bledy.numerRachunku = rachunek;
  if (f.numerTelefonu !== undefined && f.numerTelefonu.trim() !== '') {
    const telefon = walidujTelefon(f.numerTelefonu);
    if (telefon) bledy.numerTelefonu = telefon;
  }
  return bledy;
}

/** Numer telefonu do zapisu: 9 cyfr bez prefiksu i spacji albo brak. */
export function telefonDoZapisu(tekst: string): string | undefined {
  const numer = normalizujTelefon(tekst);
  return numer === '' ? undefined : numer;
}

/** Numer rachunku do zapisu: 26 cyfr bez spacji. */
export function rachunekDoZapisu(tekst: string): string {
  return normalizujRachunek(tekst);
}

/** Załączniki wniosku dla komunikatu 0149 (R11). */
export function zalacznikiZam(w: { wniosek: WniosekZam; adresat: AdresatWniosku }): ('zaswiadczenie-szpitala' | 'zaswiadczenie-lekarskie' | 'odpis-skrocony')[] {
  const lista: ('zaswiadczenie-szpitala' | 'zaswiadczenie-lekarskie' | 'odpis-skrocony')[] = [];
  if (w.wniosek.rodzajUrlopu === 'uzupelniajacy') lista.push('zaswiadczenie-szpitala');
  // Zaświadczenie lekarskie dołączone plikiem w kroku początku zasiłku wysyłamy razem z wnioskiem.
  if (w.wniosek.przedPorodem && !w.wniosek.przedPorodem.zaswiadczenie?.plik) lista.push('zaswiadczenie-lekarskie');
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
