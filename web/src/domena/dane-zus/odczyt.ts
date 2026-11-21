// Przygotowanie kopii Danych z konta ZUS (kontrakt, sekcja 7.2). Właściciel: u03 (Odczyt danych z konta ZUS).
// Funkcje są czyste: datę odczytu dostają w argumencie `teraz` albo `dzien`.
import { zastosujFiltryOdczytu } from '@/domena/dane-zus/filtry';
import { oznaczNoweDzieci } from '@/domena/dane-zus/nowe-dzieci';
import { dataZeZnacznika, dodajDni, porownajDaty } from '@/domena/daty';
import type {
  DaneZKontaZus,
  DataISO,
  TytulUbezpieczenia,
  ZnacznikCzasu,
  ZrodloweDaneKontaZus,
} from '@/domena/typy';

export { oznaczNoweDzieci } from '@/domena/dane-zus/nowe-dzieci';

// Rozszerzenie kopii o datę i godzinę poprzedniego odczytu, z którym system porównał członków rodziny
// (opis oznaczenia nowego dziecka na ViewProfileZusData). Kontrakt, sekcja 12.3.
declare module '@/domena/typy/dane-zus' {
  interface DaneZKontaZus {
    poprzedniOdczyt?: ZnacznikCzasu;
  }
}

/** Kolejność części odczytu pokazywanych w stanie odczytu w toku (wzór P02-03). */
export const CZESCI_ODCZYTU = [
  'tytuly',
  'podstawy',
  'platnicy',
  'czlonkowie',
  'zasilki',
  'kontakt',
] as const;
export type CzescOdczytu = (typeof CZESCI_ODCZYTU)[number];

/** Czy tytuł trwa w dniu `dzien` (obie daty włącznie, tytuł bez daty końca trwa nadal). */
export function czyTytulTrwa(tytul: Pick<TytulUbezpieczenia, 'od' | 'do'>, dzien: DataISO): boolean {
  if (porownajDaty(tytul.od, dzien) > 0) return false;
  return tytul.do === undefined || porownajDaty(tytul.do, dzien) >= 0;
}

/** Pierwszy dzień bez tytułu do ubezpieczenia na dzień `dzien`; undefined, gdy tytuł trwa albo konto nie ma tytułów. */
export function brakTytuluOd(tytuly: TytulUbezpieczenia[], dzien: DataISO): DataISO | undefined {
  if (tytuly.some((tytul) => czyTytulTrwa(tytul, dzien))) return undefined;
  const konce = tytuly
    .map((tytul) => tytul.do)
    .filter((koniec): koniec is DataISO => koniec !== undefined && porownajDaty(koniec, dzien) < 0)
    .sort((a, b) => porownajDaty(a, b));
  const ostatni = konce.at(-1);
  return ostatni === undefined ? undefined : dodajDni(ostatni, 1);
}

/** Kopia danych źródłowych z datą odczytu po zastosowaniu rejestru filtryOdczytu. */
export function przygotujKopie(w: {
  zrodlo: ZrodloweDaneKontaZus;
  poprzednia: DaneZKontaZus | null;
  teraz: ZnacznikCzasu;
}): DaneZKontaZus {
  const { zrodlo, poprzednia, teraz } = w;
  const dzien = dataZeZnacznika(teraz);
  const tytuly = structuredClone(zrodlo.tytuly);
  const brak = brakTytuluOd(tytuly, dzien);

  const kopia: DaneZKontaZus = {
    odczytano: teraz,
    pesel: zrodlo.pesel,
    imie: zrodlo.imie,
    nazwisko: zrodlo.nazwisko,
    tytuly,
    ...(brak === undefined ? {} : { brakTytuluOd: brak }),
    czlonkowieRodziny: oznaczNoweDzieci(structuredClone(zrodlo.czlonkowieRodziny), poprzednia, dzien),
    zasilki: structuredClone(zrodlo.zasilki),
    swiadczeniaRodzinne: structuredClone(zrodlo.swiadczeniaRodzinne),
    wnioski: structuredClone(zrodlo.wnioski),
    zaswiadczeniaEzla: structuredClone(zrodlo.zaswiadczeniaEzla),
    stanyRozliczen: [],
    zaswiadczeniaORozliczeniach: structuredClone(zrodlo.zaswiadczeniaORozliczeniach),
    korespondencja: structuredClone(zrodlo.korespondencja),
    pelnomocnictwa: structuredClone(zrodlo.pelnomocnictwa),
    ...(zrodlo.emailEzus === undefined ? {} : { emailEzus: zrodlo.emailEzus }),
    ...(zrodlo.adres === undefined ? {} : { adres: zrodlo.adres }),
    ...(poprzednia === null ? {} : { poprzedniOdczyt: poprzednia.odczytano }),
  };

  return zastosujFiltryOdczytu(kopia, { zrodlo, poprzednia, teraz });
}

/** Liczba części odczytu pokazywanych w stanie odczytu w toku (6 części). */
export function postepOdczytu(): number {
  return CZESCI_ODCZYTU.length;
}
