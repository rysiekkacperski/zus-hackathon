// Wniosek ZAM przy przyjęciu dziecka na wychowanie (kontrakt, sekcja 7.2).
// Właściciel: u33 (ZAM: wniosek dla płatnika, przed porodem i przy przyjęciu dziecka).
// Funkcje są czyste: datę „dzisiaj” dostają jako argument, wymiary czytają ze słownika wymiarów
// i okresów z wartością domyślną z historyjki 3.9.8.1.1, gdy słownik nie zawiera wpisu.
import { ID_WYMIAROW } from '@/dane/katalog/slownik-wymiarow';
import { dodajDni, dodajLata, maxData, minData, porownajDaty, roznicaDni } from '@/domena/daty';
import { wartoscObowiazujaca } from '@/domena/katalog/odczyt';
import { czyPeselZgodnyZData, walidujPesel } from '@/domena/pesel';
import { walidujDateWZakresie, walidujLiczbeCalkowita } from '@/domena/walidacje';
import { KLUCZ_LICZBY_DZIECI } from '@/domena/wnioski/zam-przed-porodem';
import type {
  BledyPol,
  DataISO,
  FormaPrzyjecia,
  Katalog,
  KodKomunikatu,
  LiczbaDzieci,
  Okres,
  OkresWniosku,
  PrzyjecieDziecka,
} from '@/domena/typy';

/** Dane przyjęcia potrzebne regułom wniosku (podzbiór PrzyjecieDziecka). */
export type DanePrzyjecia = Pick<
  PrzyjecieDziecka,
  'forma' | 'dataPrzyjecia' | 'dataUrodzeniaDziecka' | 'liczbaPrzyjetychDzieci' | 'odroczenieObowiazkuSzkolnego'
>;

/** Identyfikatory wpisów słownika wymiarów i okresów używanych przez reguły przyjęcia dziecka. */
export const WPISY_PRZYJECIA = {
  wymiarWum: ID_WYMIAROW.urlopNaWarunkachMacierzynskiego,
  wiekGraniczny: ID_WYMIAROW.wiekDzieckaUrlopNaWarunkach,
  rodzicielski: ID_WYMIAROW.urlopRodzicielski,
} as const;

const WYMIAR_WUM_TYGODNI: Record<LiczbaDzieci, number> = { 1: 20, 2: 31, 3: 33, 4: 35, 5: 37 };
const NAJKROTSZY_WUM_TYGODNI = 9;
const TERMIN_WARIANTU_DNI = 21;
const TYGODNIE_DRUGIEGO_RODZICA = 9;

function liczbaDoKlucza(liczba: number): LiczbaDzieci {
  if (liczba >= 5) return 5;
  if (liczba <= 1) return 1;
  return liczba as LiczbaDzieci;
}

function zKatalogu(katalog: Katalog | null, idWpisu: string, dzien: DataISO, wariant: string, domyslna: number): number {
  if (katalog === null) return domyslna;
  const wartosc = wartoscObowiazujaca(katalog, idWpisu, dzien, wariant);
  return wartosc !== null && wartosc.wartosc > 0 ? wartosc.wartosc : domyslna;
}

/**
 * Wiek graniczny dziecka w latach: 7 w rodzinie zastępczej niezawodowej, 10 przy odroczonym obowiązku
 * szkolnym, 14 przy przysposobieniu; null dla rodziny zastępczej zawodowej (bez prawa do zasiłku).
 */
export function wiekGranicznyPrzyjecia(
  forma: FormaPrzyjecia,
  odroczenie: boolean | undefined,
  katalog: Katalog | null = null,
  dzien: DataISO = '2026-01-01',
): number | null {
  if (forma === 'rodzina-zastepcza-zawodowa') return null;
  if (forma === 'przysposobienie') return zKatalogu(katalog, WPISY_PRZYJECIA.wiekGraniczny, dzien, 'przysposobienie', 14);
  return odroczenie
    ? zKatalogu(katalog, WPISY_PRZYJECIA.wiekGraniczny, dzien, 'odroczonyObowiazekSzkolny', 10)
    : zKatalogu(katalog, WPISY_PRZYJECIA.wiekGraniczny, dzien, 'rodzinaZastepczaNiezawodowa', 7);
}

/** Dzień poprzedzający ukończenie przez dziecko wieku granicznego. */
export function granicaWieku(dataUrodzenia: DataISO, wiek: number): DataISO {
  return dodajDni(dodajLata(dataUrodzenia, wiek), -1);
}

/**
 * Prawo do wniosku ZAM po przyjęciu dziecka wynikające z danych przyjęcia: 0092 dla rodziny zastępczej
 * zawodowej, 0091 z wiekiem, gdy dziecko w dniu przyjęcia ukończyło wiek graniczny; null, gdy prawo jest.
 */
export function sprawdzPrzyjecieDoWniosku(
  p: DanePrzyjecia,
  katalog: Katalog | null = null,
): { kod: '0092' } | { kod: '0091'; parametry: { wiek: string } } | null {
  const wiek = wiekGranicznyPrzyjecia(p.forma, p.odroczenieObowiazkuSzkolnego, katalog, p.dataPrzyjecia);
  if (wiek === null) return { kod: '0092' };
  if (porownajDaty(p.dataPrzyjecia, dodajLata(p.dataUrodzeniaDziecka, wiek)) >= 0) {
    return { kod: '0091', parametry: { wiek: String(wiek) } };
  }
  return null;
}

/**
 * Okres urlopu na warunkach urlopu macierzyńskiego: od dnia przyjęcia, wymiar dla liczby przyjętych
 * dzieci, najpóźniej do dnia poprzedzającego ukończenie wieku granicznego, co najmniej 9 tygodni (63 dni).
 */
export function okresWum(p: DanePrzyjecia, katalog: Katalog | null = null): Okres | null {
  const wiek = wiekGranicznyPrzyjecia(p.forma, p.odroczenieObowiazkuSzkolnego, katalog, p.dataPrzyjecia);
  if (wiek === null) return null;
  const klucz = liczbaDoKlucza(p.liczbaPrzyjetychDzieci);
  const tygodnie = zKatalogu(katalog, WPISY_PRZYJECIA.wymiarWum, p.dataPrzyjecia, KLUCZ_LICZBY_DZIECI[klucz], WYMIAR_WUM_TYGODNI[klucz]);
  const minimum = zKatalogu(katalog, WPISY_PRZYJECIA.wymiarWum, p.dataPrzyjecia, 'minimum', NAJKROTSZY_WUM_TYGODNI);
  const od = p.dataPrzyjecia;
  const granica = granicaWieku(p.dataUrodzeniaDziecka, wiek);
  const koniec = maxData(dodajDni(od, minimum * 7 - 1), minData(dodajDni(od, tygodnie * 7 - 1), granica));
  return { od, do: koniec };
}

export interface ParametryRodzicielskiegoPoPrzyjeciu {
  /** Wymiar urlopu rodzicielskiego w tygodniach: 41, 43, 65, 67 albo 38, 62. */
  wymiar: number;
  /** Tygodnie, które może wykorzystać wnioskodawca (wymiar pomniejszony o 9 tygodni drugiego rodzica). */
  maksWnioskodawcy: number;
  /** Pierwszy dzień urlopu rodzicielskiego bezpośrednio po urlopie na warunkach urlopu macierzyńskiego. */
  poczatekBezposrednio: DataISO;
  /** Zakres daty początku urlopu rodzicielskiego w późniejszym terminie. */
  zakresPoczatku: Okres;
  /** Najpóźniejszy koniec części urlopu przy pełnym wymiarze; brak przy wymiarze 38 albo 62 tygodni. */
  koniecCzesciNajpozniej?: DataISO;
}

/** Wymiar i zakresy urlopu rodzicielskiego po przyjęciu dziecka (wymaganie „Urlop rodzicielski po przyjęciu dziecka”). */
export function parametryRodzicielskiegoPoPrzyjeciu(
  p: DanePrzyjecia,
  zaZyciem: boolean,
  katalog: Katalog | null = null,
): ParametryRodzicielskiegoPoPrzyjeciu | null {
  const wum = okresWum(p, katalog);
  const wiek = wiekGranicznyPrzyjecia(p.forma, p.odroczenieObowiazkuSzkolnego, katalog, p.dataPrzyjecia);
  if (wum === null || wiek === null) return null;
  const granica = granicaWieku(p.dataUrodzeniaDziecka, wiek);
  const wiecej = p.liczbaPrzyjetychDzieci > 1;
  const wariantPelny = zaZyciem
    ? wiecej
      ? 'wiecejDzieciZaZyciem'
      : 'jednoDzieckoZaZyciem'
    : wiecej
      ? 'wiecejDzieci'
      : 'jednoDziecko';
  const pelny = zKatalogu(katalog, WPISY_PRZYJECIA.rodzicielski, p.dataPrzyjecia, wariantPelny, zaZyciem ? (wiecej ? 67 : 65) : wiecej ? 43 : 41);
  const poczatekBezposrednio = dodajDni(wum.do, 1);
  const wykracza = porownajDaty(dodajDni(poczatekBezposrednio, pelny * 7 - 1), granica) > 0;
  const wariantPoWum = zaZyciem ? 'poUrlopieNaWarunkachZaZyciem' : 'poUrlopieNaWarunkach';
  const wymiar = wykracza
    ? zKatalogu(katalog, WPISY_PRZYJECIA.rodzicielski, p.dataPrzyjecia, wariantPoWum, zaZyciem ? 62 : 38)
    : pelny;
  return {
    wymiar,
    maksWnioskodawcy: wymiar - TYGODNIE_DRUGIEGO_RODZICA,
    poczatekBezposrednio,
    zakresPoczatku: { od: poczatekBezposrednio, do: maxData(poczatekBezposrednio, granica) },
    ...(wykracza ? {} : { koniecCzesciNajpozniej: granica }),
  };
}

/** Wymiar urlopu rodzicielskiego po przyjęciu dziecka w tygodniach (0, gdy prawa brak). */
export function wymiarRodzicielskiegoPoPrzyjeciu(p: DanePrzyjecia, zaZyciem: boolean, katalog: Katalog | null = null): number {
  return parametryRodzicielskiegoPoPrzyjeciu(p, zaZyciem, katalog)?.wymiar ?? 0;
}

export interface WariantPoPrzyjeciu {
  /** Ostatni dzień terminu 21 dni od przyjęcia dziecka. */
  termin: DataISO;
  /** Liczba dni pozostałych do końca terminu (0 w ostatnim dniu). */
  dniPozostale: number;
  /** Wariant 81,5% dostępny w dniu `dzis`. */
  dostepny: boolean;
  /** 0165, gdy termin minął. */
  kod?: KodKomunikatu;
}

/** Termin 21 dni od przyjęcia dziecka na wybór wariantu 81,5% (0165 po terminie). */
export function wariantPoPrzyjeciu(dataPrzyjecia: DataISO, dzis: DataISO): WariantPoPrzyjeciu {
  const termin = dodajDni(dataPrzyjecia, TERMIN_WARIANTU_DNI);
  const dostepny = porownajDaty(dzis, termin) <= 0;
  return {
    termin,
    dniPozostale: Math.max(0, roznicaDni(dzis, termin)),
    dostepny,
    ...(dostepny ? {} : { kod: '0165' as const }),
  };
}

/**
 * Okresy wniosku po przyjęciu dziecka: urlop na warunkach urlopu macierzyńskiego, a w wariancie
 * z całym urlopem rodzicielskim także urlop rodzicielski wnioskodawcy bezpośrednio po nim, 81,5% za
 * cały okres. W pozostałych przypadkach urlop na warunkach urlopu macierzyńskiego 100%.
 */
export function okresyZamPoPrzyjeciu(
  w: { przyjecie: DanePrzyjecia; zaZyciem: boolean; wariant: 'caly-rodzicielski' | 'tylko-wum' },
  katalog: Katalog | null = null,
): OkresWniosku[] {
  const wum = okresWum(w.przyjecie, katalog);
  if (wum === null) return [];
  const dniWum = roznicaDni(wum.od, wum.do) + 1;
  if (w.wariant === 'tylko-wum') {
    return [{ rodzajUrlopu: 'na-warunkach-macierzynskiego', ...wum, dni: dniWum, tygodnie: Math.floor(dniWum / 7), stawka: 100 }];
  }
  const parametry = parametryRodzicielskiegoPoPrzyjeciu(w.przyjecie, w.zaZyciem, katalog);
  const okresy: OkresWniosku[] = [
    { rodzajUrlopu: 'na-warunkach-macierzynskiego', ...wum, dni: dniWum, tygodnie: Math.floor(dniWum / 7), stawka: 81.5 },
  ];
  if (parametry !== null) {
    const od = parametry.poczatekBezposrednio;
    okresy.push({
      rodzajUrlopu: 'rodzicielski',
      od,
      do: dodajDni(od, parametry.maksWnioskodawcy * 7 - 1),
      tygodnie: parametry.maksWnioskodawcy,
      dni: parametry.maksWnioskodawcy * 7,
      stawka: 81.5,
    });
  }
  return okresy;
}

export type PoleRodzicielskiegoPoPrzyjeciu = 'tryb' | 'dataPoczatku' | 'tygodnie';

export interface FormularzRodzicielskiegoPoPrzyjeciu {
  tryb: 'bezposrednio' | 'pozniej' | null;
  dataPoczatku: string;
  tygodnie: string;
}

/**
 * Walidacja wniosku o zasiłek za okres urlopu rodzicielskiego po przyjęciu dziecka: 0006 (brak trybu
 * albo pustych pól), 0010 (format daty), 0042 (data albo koniec części poza zakresem), 0061 (tygodnie).
 * Przy poprawnych danych zwraca okres urlopu z zasiłkiem 70%.
 */
export function walidujRodzicielskiPoPrzyjeciu(
  f: FormularzRodzicielskiegoPoPrzyjeciu,
  parametry: ParametryRodzicielskiegoPoPrzyjeciu,
): { bledy: BledyPol<PoleRodzicielskiegoPoPrzyjeciu>; okres?: OkresWniosku } {
  const bledy: BledyPol<PoleRodzicielskiegoPoPrzyjeciu> = {};
  if (f.tryb === null) bledy.tryb = '0006';
  let od: DataISO | null = f.tryb === 'bezposrednio' ? parametry.poczatekBezposrednio : null;
  if (f.tryb === 'pozniej') {
    const data = walidujDateWZakresie(f.dataPoczatku, parametry.zakresPoczatku, {
      pusta: '0006',
      format: '0010',
      zaWczesnie: '0042',
      zaPozno: '0042',
    });
    if ('kod' in data) bledy.dataPoczatku = data.kod;
    else od = data.data;
  }
  let tygodnie: number | null = null;
  if (f.tygodnie.trim() === '') bledy.tygodnie = '0006';
  else {
    const liczba = walidujLiczbeCalkowita(f.tygodnie, 1, parametry.maksWnioskodawcy, '0061');
    if ('kod' in liczba) bledy.tygodnie = liczba.kod;
    else tygodnie = liczba.liczba;
  }
  if (od === null || tygodnie === null || Object.keys(bledy).length > 0) return { bledy };
  const koniec = dodajDni(od, tygodnie * 7 - 1);
  if (parametry.koniecCzesciNajpozniej && porownajDaty(koniec, parametry.koniecCzesciNajpozniej) > 0) {
    if (f.tryb === 'pozniej') bledy.dataPoczatku = '0042';
    else bledy.tygodnie = '0061';
    return { bledy };
  }
  return { bledy, okres: { rodzajUrlopu: 'rodzicielski', od, do: koniec, tygodnie, dni: tygodnie * 7, stawka: 70 } };
}

/** Numer PESEL przyjętego dziecka: 0024–0026 z walidacji numeru, 0211 przy dacie urodzenia innej niż w profilu. */
export function walidujPeselDzieckaPrzyjetego(tekst: string, dataUrodzenia: DataISO): KodKomunikatu | null {
  const wynik = walidujPesel(tekst);
  if (!wynik.ok) return wynik.kod;
  return czyPeselZgodnyZData(wynik.pesel, dataUrodzenia) ? null : '0211';
}

/** Rodzaje dokumentów przyjęcia dziecka dołączanych do wniosku (klucze tekstów widoku). */
export type DokumentPrzyjecia =
  | 'zaswiadczenie-sadu-przysposobienie'
  | 'orzeczenie-albo-umowa-ze-starosta'
  | 'dokument-wieku-dziecka'
  | 'decyzja-odroczenia-obowiazku-szkolnego';

/**
 * Dokumenty do wniosku przy przyjęciu dziecka (0149): przy przysposobieniu zaświadczenie sądu,
 * w rodzinie zastępczej niezawodowej orzeczenie sądu albo umowa ze starostą, w obu formach dokument
 * potwierdzający wiek dziecka, a przy odroczonym obowiązku szkolnym decyzja o odroczeniu.
 */
export function listaDokumentowPrzyjecia(p: Pick<DanePrzyjecia, 'forma' | 'odroczenieObowiazkuSzkolnego'>): DokumentPrzyjecia[] {
  if (p.forma === 'rodzina-zastepcza-zawodowa') return [];
  const dokumenty: DokumentPrzyjecia[] = [
    p.forma === 'przysposobienie' ? 'zaswiadczenie-sadu-przysposobienie' : 'orzeczenie-albo-umowa-ze-starosta',
    'dokument-wieku-dziecka',
  ];
  if (p.odroczenieObowiazkuSzkolnego) dokumenty.push('decyzja-odroczenia-obowiazku-szkolnego');
  return dokumenty;
}
