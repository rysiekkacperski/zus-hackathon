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
  'forma' | 'dataPrzyjecia' | 'dataUrodzeniaDziecka' | 'liczbaPrzyjetychDzieci' | 'odroczenieObowiazkuSzkolnego' | 'datyUrodzeniaDzieci'
>;

/** Daty urodzenia jednocześnie przyjętych dzieci: z profilu albo data jednego dziecka powtórzona dla liczby dzieci. */
export function datyUrodzeniaPrzyjetych(p: DanePrzyjecia): DataISO[] {
  if (p.datyUrodzeniaDzieci && p.datyUrodzeniaDzieci.length > 0) return p.datyUrodzeniaDzieci;
  return Array.from({ length: Math.max(1, p.liczbaPrzyjetychDzieci) }, () => p.dataUrodzeniaDziecka);
}

export interface DzieciWliczone {
  wiek: number;
  /** Liczba wszystkich przyjętych dzieci. */
  wszystkie: number;
  /** Daty urodzenia dzieci, które w dniu przyjęcia nie ukończyły wieku granicznego, od najstarszego. */
  wliczone: DataISO[];
  /** Dni ukończenia wieku granicznego przez wliczone dzieci, rosnąco. */
  urodzinyGraniczne: DataISO[];
}

/** Dzieci wliczone do liczby dzieci (wymaganie „Okres urlopu na warunkach urlopu macierzyńskiego”); null bez prawa. */
export function dzieciWliczone(p: DanePrzyjecia, katalog: Katalog | null = null): DzieciWliczone | null {
  const wiek = wiekGranicznyPrzyjecia(p.forma, p.odroczenieObowiazkuSzkolnego, katalog, p.dataPrzyjecia);
  if (wiek === null) return null;
  const daty = datyUrodzeniaPrzyjetych(p);
  const wliczone = daty.filter((d) => porownajDaty(p.dataPrzyjecia, dodajLata(d, wiek)) < 0).sort(porownajDaty);
  return { wiek, wszystkie: daty.length, wliczone, urodzinyGraniczne: wliczone.map((d) => dodajLata(d, wiek)) };
}

/** Identyfikatory wpisów słownika wymiarów i okresów używanych przez reguły przyjęcia dziecka. */
export const WPISY_PRZYJECIA = {
  wymiarWum: ID_WYMIAROW.urlopNaWarunkachMacierzynskiego,
  wiekGraniczny: ID_WYMIAROW.wiekDzieckaUrlopNaWarunkach,
  rodzicielski: ID_WYMIAROW.urlopRodzicielski,
} as const;

// Wartości domyślne z historyjki 3.9.8.1.1, gdy katalog nie zawiera wpisu albo wywołanie nie przekazuje katalogu.
const WYMIAR_WUM_TYGODNI: Record<LiczbaDzieci, number> = { 1: 20, 2: 31, 3: 33, 4: 35, 5: 37 };
const NAJKROTSZY_WUM_TYGODNI = 9;
const TERMIN_WARIANTU_DNI = 21;
const TYGODNIE_DRUGIEGO_RODZICA = 9;

/** Termin wniosku w wariancie 81,5% w dniach od przyjęcia dziecka z Katalogu świadczeń w dniu przyjęcia. */
function dniTerminuWariantu(katalog: Katalog | null, dataPrzyjecia: DataISO): number {
  return zKatalogu(katalog, ID_WYMIAROW.terminWnioskuWariant815, dataPrzyjecia, 'dni', TERMIN_WARIANTU_DNI);
}

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
  const d = dzieciWliczone(p, katalog);
  if (d === null) return { kod: '0092' };
  if (d.wliczone.length === 0) return { kod: '0091', parametry: { wiek: String(d.wiek) } };
  return null;
}

function tygodnieWum(liczba: number, katalog: Katalog | null, dzien: DataISO): number {
  const klucz = liczbaDoKlucza(liczba);
  return zKatalogu(katalog, WPISY_PRZYJECIA.wymiarWum, dzien, KLUCZ_LICZBY_DZIECI[klucz], WYMIAR_WUM_TYGODNI[klucz]);
}

/** Zakres daty początku urlopu na warunkach urlopu macierzyńskiego: od dnia przyjęcia do 21. dnia po nim. */
export function zakresPoczatkuWum(dataPrzyjecia: DataISO, katalog: Katalog | null = null): Okres {
  return { od: dataPrzyjecia, do: dodajDni(dataPrzyjecia, dniTerminuWariantu(katalog, dataPrzyjecia)) };
}

/**
 * Okres urlopu na warunkach urlopu macierzyńskiego: od wskazanej daty początku (domyślnie dnia przyjęcia),
 * wymiar dla liczby wliczonych dzieci, a od urodzin dziecka kończącego wiek graniczny w trakcie urlopu
 * wymiar dla pozostałych dzieci; najpóźniej do dnia poprzedzającego ukończenie wieku granicznego przez
 * najmłodsze wliczone dziecko, co najmniej 9 tygodni (63 dni).
 */
export function okresWum(p: DanePrzyjecia, katalog: Katalog | null = null, poczatek?: DataISO): Okres | null {
  const d = dzieciWliczone(p, katalog);
  if (d === null || d.wliczone.length === 0) return null;
  const n = d.wliczone.length;
  const minimum = zKatalogu(katalog, WPISY_PRZYJECIA.wymiarWum, p.dataPrzyjecia, 'minimum', NAJKROTSZY_WUM_TYGODNI);
  const od = poczatek ?? p.dataPrzyjecia;
  let koniec = dodajDni(od, tygodnieWum(n, katalog, p.dataPrzyjecia) * 7 - 1);
  for (let i = 0; i < n - 1; i++) {
    const urodziny = d.urodzinyGraniczne[i];
    if (porownajDaty(urodziny, koniec) > 0) break;
    koniec = maxData(dodajDni(od, tygodnieWum(n - i - 1, katalog, p.dataPrzyjecia) * 7 - 1), dodajDni(urodziny, -1));
  }
  const granica = dodajDni(d.urodzinyGraniczne[n - 1], -1);
  return { od, do: maxData(dodajDni(od, minimum * 7 - 1), minData(koniec, granica)) };
}

/**
 * Komunikat 0263 na ekranie ViewZamPeriod, gdy wiek graniczny ukończyła w dniu przyjęcia część przyjętych
 * dzieci; null w pozostałych przypadkach.
 */
export function komunikatDzieciPoWieku(
  p: DanePrzyjecia,
  katalog: Katalog | null = null,
): { kod: '0263'; parametry: { liczbaDzieci: string; wiek: string } } | null {
  const d = dzieciWliczone(p, katalog);
  if (d === null || d.wliczone.length === 0 || d.wliczone.length === d.wszystkie) return null;
  return { kod: '0263', parametry: { liczbaDzieci: String(d.wliczone.length), wiek: String(d.wiek) } };
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
  /** Najpóźniejszy koniec każdej części urlopu: dzień przed wiekiem granicznym albo koniec okresu 38 albo 62 tygodni. */
  koniecCzesciNajpozniej?: DataISO;
  /** Zmiana wymiaru na jedno dziecko od urodzin, po których wieku granicznego nie ukończyło tylko jedno dziecko (0296). */
  zmianaWymiaru?: { data: DataISO; wiek: number; wymiar: number };
  /** Pierwsze urodziny najmłodszego wliczonego dziecka (stawka 81,5% albo 70% i wyrównanie, 0267). */
  pierwszeUrodziny: DataISO;
}

/** Wymiar i zakresy urlopu rodzicielskiego po przyjęciu dziecka (wymaganie „Urlop rodzicielski po przyjęciu dziecka”). */
export function parametryRodzicielskiegoPoPrzyjeciu(
  p: DanePrzyjecia,
  zaZyciem: boolean,
  katalog: Katalog | null = null,
  opcje: { poczatekWum?: DataISO; dzis?: DataISO } = {},
): ParametryRodzicielskiegoPoPrzyjeciu | null {
  const wum = okresWum(p, katalog, opcje.poczatekWum);
  const d = dzieciWliczone(p, katalog);
  if (wum === null || d === null || d.wliczone.length === 0) return null;
  const n = d.wliczone.length;
  const granica = dodajDni(d.urodzinyGraniczne[n - 1], -1);
  const wymiarPelny = (wiecej: boolean) =>
    zKatalogu(
      katalog,
      WPISY_PRZYJECIA.rodzicielski,
      p.dataPrzyjecia,
      zaZyciem ? (wiecej ? 'wiecejDzieciZaZyciem' : 'jednoDzieckoZaZyciem') : wiecej ? 'wiecejDzieci' : 'jednoDziecko',
      zaZyciem ? (wiecej ? 67 : 65) : wiecej ? 43 : 41,
    );
  const poczatekBezposrednio = dodajDni(wum.do, 1);
  let pelny = wymiarPelny(n > 1);
  let zmianaWymiaru: ParametryRodzicielskiegoPoPrzyjeciu['zmianaWymiaru'];
  if (n > 1) {
    const urodzinyJednego = d.urodzinyGraniczne[n - 2];
    if (porownajDaty(urodzinyJednego, dodajDni(poczatekBezposrednio, pelny * 7 - 1)) <= 0) {
      pelny = wymiarPelny(false);
      zmianaWymiaru = { data: urodzinyJednego, wiek: d.wiek, wymiar: pelny };
    }
  }
  const wykracza = porownajDaty(dodajDni(poczatekBezposrednio, pelny * 7 - 1), granica) > 0;
  const wariantPoWum = zaZyciem ? 'poUrlopieNaWarunkachZaZyciem' : 'poUrlopieNaWarunkach';
  const wymiar = wykracza
    ? zKatalogu(katalog, WPISY_PRZYJECIA.rodzicielski, p.dataPrzyjecia, wariantPoWum, zaZyciem ? 62 : 38)
    : pelny;
  const koniecCzesci = wykracza ? dodajDni(poczatekBezposrednio, wymiar * 7 - 1) : maxData(poczatekBezposrednio, granica);
  const najwczesniej = opcje.dzis ? maxData(poczatekBezposrednio, dodajDni(opcje.dzis, 1)) : poczatekBezposrednio;
  return {
    wymiar,
    maksWnioskodawcy: wymiar - zKatalogu(katalog, ID_WYMIAROW.nieprzenoszalnaCzescUrlopuRodzicielskiego, p.dataPrzyjecia, 'tygodnie', TYGODNIE_DRUGIEGO_RODZICA),
    poczatekBezposrednio,
    zakresPoczatku: { od: najwczesniej, do: koniecCzesci },
    koniecCzesciNajpozniej: koniecCzesci,
    ...(zmianaWymiaru && !wykracza ? { zmianaWymiaru } : {}),
    pierwszeUrodziny: dodajLata(d.wliczone[n - 1], 1),
  };
}

/** Czy urlop rodzicielski od danego dnia zaczyna się po pierwszych urodzinach dziecka (stawka 70%, wyrównanie, 0267). */
export function czyWyrownaniePoPrzyjeciu(parametry: ParametryRodzicielskiegoPoPrzyjeciu, poczatekRodzicielskiego: DataISO): boolean {
  return porownajDaty(poczatekRodzicielskiego, parametry.pierwszeUrodziny) >= 0;
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
export function wariantPoPrzyjeciu(dataPrzyjecia: DataISO, dzis: DataISO, katalog: Katalog | null = null): WariantPoPrzyjeciu {
  const termin = dodajDni(dataPrzyjecia, dniTerminuWariantu(katalog, dataPrzyjecia));
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
  w: { przyjecie: DanePrzyjecia; zaZyciem: boolean; wariant: 'caly-rodzicielski' | 'tylko-wum'; poczatekWum?: DataISO },
  katalog: Katalog | null = null,
): OkresWniosku[] {
  const wum = okresWum(w.przyjecie, katalog, w.poczatekWum);
  if (wum === null) return [];
  const dniWum = roznicaDni(wum.od, wum.do) + 1;
  if (w.wariant === 'tylko-wum') {
    return [{ rodzajUrlopu: 'na-warunkach-macierzynskiego', ...wum, dni: dniWum, tygodnie: Math.floor(dniWum / 7), stawka: 100 }];
  }
  const parametry = parametryRodzicielskiegoPoPrzyjeciu(w.przyjecie, w.zaZyciem, katalog, { poczatekWum: w.poczatekWum });
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
      stawka: czyWyrownaniePoPrzyjeciu(parametry, od) ? 70 : 81.5,
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
 * Dokumenty do wniosku przy przyjęciu dziecka (0149): przy przysposobieniu zaświadczenie sądu opiekuńczego
 * o dacie wystąpienia albo kopia wniosku z poświadczeniem sądu, w rodzinie zastępczej niezawodowej
 * orzeczenie sądu albo umowa ze starostą oraz dokument potwierdzający wiek dziecka, a przy odroczonym
 * obowiązku szkolnym decyzja o odroczeniu.
 */
export function listaDokumentowPrzyjecia(p: Pick<DanePrzyjecia, 'forma' | 'odroczenieObowiazkuSzkolnego'>): DokumentPrzyjecia[] {
  if (p.forma === 'rodzina-zastepcza-zawodowa') return [];
  const dokumenty: DokumentPrzyjecia[] =
    p.forma === 'przysposobienie'
      ? ['zaswiadczenie-sadu-przysposobienie']
      : ['orzeczenie-albo-umowa-ze-starosta', 'dokument-wieku-dziecka'];
  if (p.odroczenieObowiazkuSzkolnego) dokumenty.push('decyzja-odroczenia-obowiazku-szkolnego');
  return dokumenty;
}
