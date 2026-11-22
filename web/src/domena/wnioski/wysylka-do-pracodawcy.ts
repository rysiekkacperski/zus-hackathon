// Wysyłka wniosku o urlop do pracodawcy (kontrakt, sekcja 7.2). Właściciel: u32 (Wnioski o urlop: warianty formularza i wysyłka).
// Epik 3.9.6, analiza 24, reguły R-13, R-16, R-17 i sekcja 9 (wiadomość do pracodawcy).
import { dodajDni, porownajDaty } from '@/domena/daty';
import { walidujEmail, walidujPlik } from '@/domena/walidacje';
import type { BledyPol, DataISO, KodKomunikatu, OkresWniosku, WniosekOUrlop } from '@/domena/typy';
import { przeliczStawki, wymiaryDanych, type DaneKreatora } from '@/domena/wnioski/urlopy';

/** Pola formularza wysyłki ViewLeaveRequestSummary. */
export interface FormularzWysylki {
  email?: string;
  plik?: { typ: string; rozmiar: number };
}

/** Błędy wysyłki: 0134, 0060 przy adresie e-mail, 0103, 0104 przy pliku. */
export function walidujWysylke(f: FormularzWysylki): BledyPol<string> {
  const bledy: BledyPol<string> = {};
  if (f.email !== undefined) {
    if (f.email.trim() === '') bledy.email = '0134';
    else if (walidujEmail(f.email.trim(), true) !== null) bledy.email = '0060';
  }
  if (f.plik !== undefined) {
    const kod = walidujPlik(f.plik);
    if (kod !== null) bledy.plik = kod;
  }
  return bledy;
}

/** Pierwszy i ostatni dzień urlopu objętego wnioskiem. */
export function zakresWniosku(wniosek: Pick<WniosekOUrlop, 'okresy' | 'laczenie'>): { od: DataISO; do: DataISO } | null {
  if (wniosek.laczenie) return { od: wniosek.laczenie.okres.od, do: wniosek.laczenie.ostatniDzienUrlopu };
  if (wniosek.okresy.length === 0) return null;
  const od = wniosek.okresy.reduce((m, o) => (porownajDaty(o.od, m) < 0 ? o.od : m), wniosek.okresy[0].od);
  const doDnia = wniosek.okresy.reduce((m, o) => (porownajDaty(o.do, m) > 0 ? o.do : m), wniosek.okresy[0].do);
  return { od, do: doDnia };
}

/** Pierwszy okres wniosku, od którego liczymy szczególną ochronę. */
export function okresOchrony(wniosek: Pick<WniosekOUrlop, 'okresy'>): OkresWniosku | null {
  return wniosek.okresy[0] ?? null;
}

/**
 * Komunikat na ViewLeaveRequestSent: 0200 przy łączeniu, 0286 przy obniżeniu wymiaru czasu pracy, 0199 gdy ochrona
 * zaczyna się po dniu złożenia, inaczej 0135.
 */
export function komunikatWyslania(
  wniosek: Pick<WniosekOUrlop, 'podrodzaj' | 'dataZlozenia' | 'dataPoczatkuOchrony'>,
): '0135' | '0199' | '0200' | '0286' {
  if (wniosek.podrodzaj === 'laczenie-z-praca') return '0200';
  if (wniosek.podrodzaj === 'obnizenie-wymiaru') return '0286';
  if (wniosek.dataZlozenia && wniosek.dataPoczatkuOchrony && porownajDaty(wniosek.dataPoczatkuOchrony, wniosek.dataZlozenia) > 0) return '0199';
  return '0135';
}

/** Ponowne sprawdzenie terminu 81,5% w dniu wysłania (R-16); zwraca nowe okresy i kod, gdy termin minął. */
export function sprawdzTermin815(
  wniosek: WniosekOUrlop,
  dane: Pick<DaneKreatora, 'dataPorodu' | 'przyjecie' | 'wymiary'>,
  dzis: DataISO,
): { okresy: OkresWniosku[]; kod: KodKomunikatu } | null {
  if (wniosek.wariant !== '81-5') return null;
  const poczatek = dane.przyjecie?.dataPrzyjecia ?? dane.dataPorodu;
  if (!poczatek) return null;
  if (porownajDaty(dzis, dodajDni(poczatek, wymiaryDanych(dane).dniTerminu815)) <= 0) return null;
  return { okresy: przeliczStawki(wniosek.okresy, '100-70'), kod: dane.przyjecie ? '0165' : '0038' };
}

/** Termin, w którym pracodawca może odmówić łączenia urlopu z pracą: 7 dni od złożenia. */
export function terminOdmowyLaczenia(dataZlozenia: DataISO): DataISO {
  return dodajDni(dataZlozenia, 7);
}
