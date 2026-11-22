// Plik kalendarza .ics z terminami (kontrakt, sekcja 7.2; historyjka 3.2.1.2.1, wymaganie Plik kalendarza).
// Właściciel: u18 (Przypomnienia, skrzynka demo i plik kalendarza).
import { czesciZnacznika, dataZeZnacznika, dodajDni, dodajMinuty } from '@/domena/daty';
import { tytulSprawy } from '@/domena/katalog/odczyt';
import { spoznienieEmail } from '@/domena/przypomnienia/tresc';
import type { DataISO, IdSprawy, KalendarzTerminow, Katalog, PlanRodziny, ZnacznikCzasu } from '@/domena/typy';
import { teksty } from '@/teksty';

export interface TerminDoKalendarza {
  tytul: string;
  data: DataISO;
  opis: string;
  idSprawy?: IdSprawy;
  szacowany?: boolean;
}

/**
 * Terminy do pliku: sprawy do zrobienia z terminem według stanu planu w chwili pobrania (także drugi termin
 * sprawy), z tytułem z katalogu i kosztem albo skutkiem spóźnienia w opisie, rosnąco według daty.
 */
export function terminyDoKalendarza(plan: PlanRodziny | null, kalendarz: KalendarzTerminow | null, katalog: Katalog): TerminDoKalendarza[] {
  if (plan === null || kalendarz === null) return [];
  const wynik: TerminDoKalendarza[] = [];
  for (const pozycja of plan.pozycje) {
    if (pozycja.status !== 'do-zrobienia') continue;
    const termin = kalendarz.terminy.find((t) => t.idSprawy === pozycja.idSprawy);
    if (!termin) continue;
    const tytul = tytulSprawy(katalog, pozycja.idSprawy);
    const opis = spoznienieEmail(termin.koszt);
    const daty = [termin.termin, termin.drugiTermin?.data].filter((d): d is DataISO => Boolean(d));
    for (const data of new Set(daty)) {
      wynik.push({ tytul, data, opis, idSprawy: pozycja.idSprawy, szacowany: termin.szacowany });
    }
  }
  return wynik.sort((a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : a.tytul.localeCompare(b.tytul, 'pl')));
}

// --- iCalendar (RFC 5545) ----------------------------------------------------------------------

const CRLF = '\r\n';
const MAKS_OKTETOW_WIERSZA = 75;

function escapujTekst(tekst: string): string {
  return tekst
    .replace(/ /g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

const koder = new TextEncoder();

/** Zawija wiersz dłuższy niż 75 oktetów UTF-8; wiersz kontynuacji zaczyna się spacją. */
function zawin(wiersz: string): string {
  const czesci: string[] = [];
  let biezaca = '';
  let oktety = 0;
  for (const znak of wiersz) {
    const dlugosc = koder.encode(znak).length;
    const limit = czesci.length === 0 ? MAKS_OKTETOW_WIERSZA : MAKS_OKTETOW_WIERSZA - 1;
    if (oktety + dlugosc > limit) {
      czesci.push(biezaca);
      biezaca = '';
      oktety = 0;
    }
    biezaca += znak;
    oktety += dlugosc;
  }
  czesci.push(biezaca);
  return czesci.join(`${CRLF} `);
}

function dataIcs(d: DataISO): string {
  return d.replace(/-/g, '');
}

/** Ostatnia niedziela miesiąca (zmiana czasu w Europie). */
function ostatniaNiedziela(rok: number, miesiac: number): DataISO {
  const ostatni = new Date(Date.UTC(rok, miesiac, 0));
  const dzien = ostatni.getUTCDate() - ostatni.getUTCDay();
  return `${rok}-${String(miesiac).padStart(2, '0')}-${String(dzien).padStart(2, '0')}`;
}

/** Czas lokalny Europe/Warsaw na UTC: czas letni od ostatniej niedzieli marca 2:00 do ostatniej niedzieli października 3:00. */
function utcZCzasuWarszawy(teraz: ZnacznikCzasu): string {
  const { rok } = czesciZnacznika(teraz);
  const poczatekLetniego = `${ostatniaNiedziela(rok, 3)}T02:00:00`;
  const koniecLetniego = `${ostatniaNiedziela(rok, 10)}T03:00:00`;
  const przesuniecie = teraz >= poczatekLetniego && teraz < koniecLetniego ? 120 : 60;
  const utc = dodajMinuty(teraz, -przesuniecie);
  const c = czesciZnacznika(utc);
  const dwie = (n: number) => String(n).padStart(2, '0');
  return `${dataIcs(dataZeZnacznika(utc))}T${dwie(c.godzina)}${dwie(c.minuta)}${dwie(c.sekunda)}Z`;
}

function uidWydarzenia(t: TerminDoKalendarza, indeks: number): string {
  const klucz = (t.idSprawy ?? `T${indeks + 1}`).replace(/[^A-Za-z0-9-]/g, '-');
  return `${klucz}-${dataIcs(t.data)}@przewodnik-rodzica`;
}

/** Treść pliku iCalendar z wydarzeniami całodniowymi w dniach terminów. */
export function zbudujIcs(terminy: TerminDoKalendarza[], teraz: ZnacznikCzasu): string {
  const znacznik = utcZCzasuWarszawy(teraz);
  const wiersze: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ZUS//Przewodnik rodzica//PL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapujTekst(teksty.PowiadomieniaPrzypomnienia.nazwaKalendarza)}`,
  ];
  terminy.forEach((t, indeks) => {
    wiersze.push(
      'BEGIN:VEVENT',
      `UID:${uidWydarzenia(t, indeks)}`,
      `DTSTAMP:${znacznik}`,
      `DTSTART;VALUE=DATE:${dataIcs(t.data)}`,
      `DTEND;VALUE=DATE:${dataIcs(dodajDni(t.data, 1))}`,
      `SUMMARY:${escapujTekst(t.tytul)}`,
      ...(t.opis.trim() === '' ? [] : [`DESCRIPTION:${escapujTekst(t.opis)}`]),
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    );
  });
  wiersze.push('END:VCALENDAR');
  return wiersze.map(zawin).join(CRLF) + CRLF;
}

/** Nazwa pobieranego pliku z datą pobrania. */
export function nazwaPlikuKalendarza(dzis: DataISO): string {
  return teksty.PowiadomieniaPrzypomnienia.nazwaPliku({ data: dzis });
}
