// Dane ciąży w Profilu na start (kontrakt, sekcja 7.2). Właściciel: u10 (Profil na start: ciąża, zmiana zatrudnienia, rodzina).
// Wymagania 3.3.1.2.1: przewidywany termin porodu od dziś − 14 dni do dziś + 280 dni, liczba dzieci 1–5 (domyślnie jedno),
// data pierwszej wizyty od terminu − 280 dni do dziś albo „wizyta jeszcze się nie odbyła”.
import { dodajDni, porownajDaty } from '@/domena/daty';
import type { BledyPol, DaneCiazyIDziecka, DataISO, Katalog, KodKomunikatu, LiczbaDzieci, Okres } from '@/domena/typy';
import { walidujDateWZakresie } from '@/domena/walidacje';

/** Długość okresu ciąży w dniach liczona wstecz od terminu porodu albo daty porodu. */
export const DNI_OKRESU_CIAZY = 280;
/** Tolerancja przewidywanego terminu porodu w przeszłości. */
export const DNI_TOLERANCJI_TERMINU_W_PRZESZLOSCI = 14;
/** Najdalszy przewidywany termin porodu liczony od dziś. */
export const DNI_HORYZONTU_TERMINU = 280;

export const LICZBY_DZIECI: readonly LiczbaDzieci[] = [1, 2, 3, 4, 5];

/** Pola formularza ViewProfilePregnancy. Daty jako tekst wpisany przez użytkownika. */
export interface FormularzDanychCiazy {
  termin: string;
  liczbaDzieci: LiczbaDzieci | null;
  wizyta: string;
  brakWizyty: boolean;
}

export type PoleDanychCiazy = 'termin' | 'liczbaDzieci' | 'wizyta';

/** Okres ciąży: od dnia odniesienia − 280 dni do dnia odniesienia. */
export function okresCiazy(odniesienie: DataISO): Okres {
  return { od: dodajDni(odniesienie, -DNI_OKRESU_CIAZY), do: odniesienie };
}

/** Zakres dozwolonego przewidywanego terminu porodu względem dnia dzisiejszego. */
export function zakresTerminuPorodu(dzis: DataISO): Okres {
  return { od: dodajDni(dzis, -DNI_TOLERANCJI_TERMINU_W_PRZESZLOSCI), do: dodajDni(dzis, DNI_HORYZONTU_TERMINU) };
}

function walidujTermin(tekst: string, dzis: DataISO): { data: DataISO } | { kod: KodKomunikatu } {
  return walidujDateWZakresie(tekst, zakresTerminuPorodu(dzis), {
    pusta: '0007',
    format: '0010',
    zaWczesnie: '0008',
    zaPozno: '0009',
  });
}

/** Błędy danych ciąży: 0007, 0008, 0009, 0010, 0011, 0012, 0006. */
export function walidujDaneCiazy(f: FormularzDanychCiazy, dzis: DataISO): BledyPol<PoleDanychCiazy> {
  const bledy: BledyPol<PoleDanychCiazy> = {};
  const termin = walidujTermin(f.termin, dzis);
  if ('kod' in termin) bledy.termin = termin.kod;
  if (f.liczbaDzieci === null) bledy.liczbaDzieci = '0006';
  if (!f.brakWizyty) {
    const wizyta = walidujDateWZakresie(f.wizyta, { do: dzis }, { pusta: '0006', format: '0010', zaPozno: '0011' });
    if ('kod' in wizyta) bledy.wizyta = wizyta.kod;
    else if ('data' in termin && porownajDaty(wizyta.data, okresCiazy(termin.data).od) < 0) bledy.wizyta = '0012';
  }
  return bledy;
}

/** Dane ciąży do szkicu profilu z poprawnego formularza; null, gdy formularz ma błędy. */
export function daneCiazyZFormularza(
  f: FormularzDanychCiazy,
  dzis: DataISO,
): Pick<DaneCiazyIDziecka, 'przewidywanyTerminPorodu' | 'liczbaDzieciZCiazy' | 'dataPierwszejWizyty'> | null {
  if (Object.keys(walidujDaneCiazy(f, dzis)).length > 0 || f.liczbaDzieci === null) return null;
  const termin = walidujTermin(f.termin, dzis);
  if (!('data' in termin)) return null;
  let dataPierwszejWizyty: DataISO | 'brak-wizyty' = 'brak-wizyty';
  if (!f.brakWizyty) {
    const wizyta = walidujDateWZakresie(f.wizyta, { do: dzis }, { format: '0010' });
    if (!('data' in wizyta)) return null;
    dataPierwszejWizyty = wizyta.data;
  }
  return { przewidywanyTerminPorodu: termin.data, liczbaDzieciZCiazy: f.liczbaDzieci, dataPierwszejWizyty };
}

/** Wymiary urlopów w tygodniach według liczby dzieci (podpowiedź pola liczby dzieci). */
export interface WymiaryUrlopow {
  macierzynskiTygodni: number;
  rodzicielskiTygodni: number;
}

// Wartości wymagania Liczba dzieci z chwili pisania Story; stosowane, gdy katalog nie ma wpisu albo wersji na dany dzień.
const WYMIARY_ZE_STORY: Record<LiczbaDzieci, WymiaryUrlopow> = {
  1: { macierzynskiTygodni: 20, rodzicielskiTygodni: 41 },
  2: { macierzynskiTygodni: 31, rodzicielskiTygodni: 43 },
  3: { macierzynskiTygodni: 33, rodzicielskiTygodni: 43 },
  4: { macierzynskiTygodni: 35, rodzicielskiTygodni: 43 },
  5: { macierzynskiTygodni: 37, rodzicielskiTygodni: 43 },
};

function wartoscWpisu(katalog: Katalog, idWpisu: string, indeksWariantu: number, dzien: DataISO): number | null {
  const wpis = katalog.slowniki.find((w) => w.id === idWpisu);
  const wariant = wpis?.warianty[indeksWariantu];
  if (!wpis || !wariant) return null;
  const wersja = wpis.wersje.find(
    (v) => porownajDaty(v.od, dzien) <= 0 && (v.do === undefined || porownajDaty(dzien, v.do) <= 0),
  );
  const wartosc = wersja?.wartosci[wariant.klucz];
  return typeof wartosc === 'number' ? wartosc : null;
}

/**
 * Wymiar urlopu macierzyńskiego i rodzicielskiego dla liczby dzieci ze słownika wymiarów i okresów katalogu, obowiązujący
 * w dniu `dzien`. Wariant urlopu macierzyńskiego odpowiada liczbie dzieci (1–5), a urlopu rodzicielskiego: pierwszy przy
 * jednym dziecku, drugi przy więcej niż jednym.
 */
export function wymiaryUrlopowDlaLiczbyDzieci(katalog: Katalog, liczba: LiczbaDzieci, dzien: DataISO): WymiaryUrlopow {
  const zeStory = WYMIARY_ZE_STORY[liczba];
  return {
    macierzynskiTygodni: wartoscWpisu(katalog, 'urlop-macierzynski', liczba - 1, dzien) ?? zeStory.macierzynskiTygodni,
    rodzicielskiTygodni:
      wartoscWpisu(katalog, 'urlop-rodzicielski', liczba === 1 ? 0 : 1, dzien) ?? zeStory.rodzicielskiTygodni,
  };
}
