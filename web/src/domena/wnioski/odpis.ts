// Wniosek o odpis aktu urodzenia (kontrakt, sekcja 7.2). Właściciel: u29 (Pytanie do ZUS, dane konta i odpis aktu urodzenia).
import { dataZeZnacznika, dodajDni, parsujDate, porownajDaty } from '@/domena/daty';
import { cyfraKontrolnaPesel, czyPeselZgodnyZData } from '@/domena/pesel';
import type {
  BledyPol,
  DaneCiazyIDziecka,
  DaneRodziny,
  DataISO,
  DzieckoProfilu,
  Gmina,
  Grosze,
  Katalog,
  KodKomunikatu,
  PozycjaPlanu,
  WniosekOOdpis,
  WpisSlownika,
} from '@/domena/typy';
import { walidujImieNazwisko, walidujKodPocztowy } from '@/domena/walidacje';

export type RodzajOdpisu = NonNullable<WniosekOOdpis['rodzajOdpisu']>;
export type CelOdpisu = NonNullable<WniosekOOdpis['cel']>;
export type SposobOdbioruOdpisu = NonNullable<WniosekOOdpis['sposobOdbioru']>;

export const RODZAJE_ODPISU: readonly RodzajOdpisu[] = ['skrocony', 'zupelny', 'wielojezyczny'];
export const CELE_ODPISU: readonly CelOdpisu[] = ['sprawa-w-zus', 'swiadczenie-socjalne', 'opieka-albo-adopcja', 'zatrudnienie', 'inny'];
export const SPOSOBY_ODBIORU: readonly SposobOdbioruOdpisu[] = ['e-doreczenia', 'poczta', 'osobiscie'];

/** Liczba dni kalendarzowych od złożenia wniosku do przewidywanego dnia wydania odpisu. */
export const DNI_DO_WYDANIA_ODPISU = 7;

/** Pola formularza ViewBirthCertificateRequest; teksty pól w postaci wpisanej przez rodzica. */
export interface FormularzOdpisu {
  rodzajOdpisu: RodzajOdpisu | null;
  imie: string;
  nazwisko: string;
  dataUrodzenia: string;
  miejsceUrodzenia: string;
  pesel: string;
  cel: CelOdpisu | null;
  sposobOdbioru: SposobOdbioruOdpisu | null;
  adresDoDoreczenia: string;
}

/** Pola formularza w kolejności na ekranie (fokus na pierwszym polu z błędem). */
export type PoleOdpisu = keyof FormularzOdpisu;
export const KOLEJNOSC_POL_ODPISU: readonly PoleOdpisu[] = [
  'rodzajOdpisu',
  'imie',
  'nazwisko',
  'dataUrodzenia',
  'miejsceUrodzenia',
  'pesel',
  'cel',
  'sposobOdbioru',
  'adresDoDoreczenia',
];

/** Profil rodziny potrzebny symulowanemu rejestrowi i uzupełnieniu wniosku. */
export interface ProfilDoRejestru {
  daneRodziny: DaneRodziny;
  daneCiazy: DaneCiazyIDziecka | null;
}

// --- Opłata skarbowa (R-4) ------------------------------------------------------------------------

/** Kwoty ze Story używane, gdy katalog nie ma wpisu opłaty skarbowej za odpis. */
const OPLATA_ZE_STORY: Record<RodzajOdpisu, Grosze> = { skrocony: 2200, zupelny: 3300, wielojezyczny: 2200 };

function normalizuj(tekst: string): string {
  return tekst.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

function wpisOplatySkarbowej(katalog: Katalog): WpisSlownika | undefined {
  return katalog.slowniki.find((w) => {
    const nazwa = normalizuj(w.nazwa);
    return nazwa.includes('oplata skarbowa') && nazwa.includes('odpis');
  });
}

function wartoscWGroszach(wartosc: number): Grosze {
  // Kwoty katalogu w groszach są liczbami całkowitymi od 1000 wzwyż; mniejsze wartości są złotymi.
  return Number.isInteger(wartosc) && wartosc >= 1000 ? wartosc : Math.round(wartosc * 100);
}

function kwotaZKatalogu(katalog: Katalog, rodzaj: RodzajOdpisu, dzien: DataISO): Grosze | null {
  const wpis = wpisOplatySkarbowej(katalog);
  if (wpis === undefined) return null;
  const wersja = wpis.wersje.find((w) => porownajDaty(w.od, dzien) <= 0 && (w.do === undefined || porownajDaty(dzien, w.do) <= 0));
  if (wersja === undefined) return null;
  const szukany = rodzaj === 'zupelny' ? 'zup' : 'skr';
  const wariant = wpis.warianty.find((w) => normalizuj(`${w.klucz} ${w.etykieta}`).includes(szukany));
  const wartosc = wariant ? wersja.wartosci[wariant.klucz] : undefined;
  return wartosc === undefined ? null : wartoscWGroszach(wartosc);
}

/** Opłata skarbowa za odpis w dniu `dzien`: bez opłaty dla celów zwolnionych, kwota ze słownika dla celu „inny cel”. */
export function oplataSkarbowa(rodzaj: RodzajOdpisu, cel: CelOdpisu, dzien: DataISO, katalog: Katalog): Grosze {
  if (cel !== 'inny') return 0;
  return kwotaZKatalogu(katalog, rodzaj, dzien) ?? OPLATA_ZE_STORY[rodzaj];
}

// --- Sposób odbioru (R-3) -------------------------------------------------------------------------

/** Sposoby odbioru dostępne dla rodzaju odpisu; odpis wielojęzyczny tylko w formie papierowej (0198). */
export function opcjeOdbioru(rodzaj: RodzajOdpisu): SposobOdbioruOdpisu[] {
  return rodzaj === 'wielojezyczny' ? ['poczta', 'osobiscie'] : [...SPOSOBY_ODBIORU];
}

/** Komunikat przy sposobie odbioru: 0198 dla odpisu wielojęzycznego. */
export function komunikatOdbioru(rodzaj: RodzajOdpisu | null): '0198' | null {
  return rodzaj === 'wielojezyczny' ? '0198' : null;
}

/** Sposób odbioru po zmianie rodzaju odpisu: wybór spoza dostępnych opcji zostaje usunięty. */
export function sposobPoZmianieRodzaju(
  rodzaj: RodzajOdpisu,
  sposob: SposobOdbioruOdpisu | null,
): SposobOdbioruOdpisu | null {
  return sposob !== null && opcjeOdbioru(rodzaj).includes(sposob) ? sposob : null;
}

// --- Walidacja (R-8, R-10, R-6) -------------------------------------------------------------------

/** Błąd numeru PESEL dziecka: 0025 (liczba cyfr), 0026 (cyfra kontrolna), 0027 (data z PESEL inna niż data urodzenia). */
export function walidujPeselDziecka(tekst: string, dataUrodzenia: DataISO | null): '0025' | '0026' | '0027' | null {
  const pesel = tekst.trim();
  if (pesel === '') return null;
  if (!/^\d{11}$/.test(pesel)) return '0025';
  if (cyfraKontrolnaPesel(pesel.slice(0, 10)) !== Number(pesel[10])) return '0026';
  if (dataUrodzenia !== null && !czyPeselZgodnyZData(pesel, dataUrodzenia)) return '0027';
  return null;
}

/** Błędy wniosku o odpis: 0006, 0010, 0025–0031, 0163, 0191, 0195, 0196; wszystkie pola naraz. */
export function walidujWniosekOOdpis(f: FormularzOdpisu, dzis: DataISO): BledyPol<PoleOdpisu> {
  const bledy: BledyPol<PoleOdpisu> = {};
  if (f.rodzajOdpisu === null) bledy.rodzajOdpisu = '0006';

  const imie = walidujImieNazwisko(f.imie, 'imie');
  if (imie) bledy.imie = imie;
  const nazwisko = walidujImieNazwisko(f.nazwisko, 'nazwisko');
  if (nazwisko) bledy.nazwisko = nazwisko;

  let data: DataISO | null = null;
  if (f.dataUrodzenia.trim() === '') bledy.dataUrodzenia = '0163';
  else {
    data = parsujDate(f.dataUrodzenia);
    if (data === null) bledy.dataUrodzenia = '0010';
    else if (porownajDaty(data, dzis) > 0) bledy.dataUrodzenia = '0191';
  }

  if (f.miejsceUrodzenia.trim() === '') bledy.miejsceUrodzenia = '0031';

  const pesel = walidujPeselDziecka(f.pesel, data);
  if (pesel) bledy.pesel = pesel;

  if (f.cel === null) bledy.cel = '0006';

  if (f.sposobOdbioru === null || (f.rodzajOdpisu !== null && !opcjeOdbioru(f.rodzajOdpisu).includes(f.sposobOdbioru))) {
    bledy.sposobOdbioru = '0006';
  } else if (f.sposobOdbioru === 'poczta') {
    if (f.adresDoDoreczenia.trim() === '') bledy.adresDoDoreczenia = '0195';
    else if (!walidujKodPocztowy(f.adresDoDoreczenia)) bledy.adresDoDoreczenia = '0196';
  }
  return bledy;
}

/** Pierwsze pole z błędem w kolejności na ekranie. */
export function pierwszePoleZBledem(bledy: BledyPol<PoleOdpisu>): PoleOdpisu | null {
  return KOLEJNOSC_POL_ODPISU.find((p) => bledy[p] !== undefined) ?? null;
}

// --- Uzupełnienie z profilu (R-1, R-2, R-5, R-7) --------------------------------------------------

/** Dziecko z profilu, którego dotyczy wniosek (pierwsze dziecko w profilu). */
export function dzieckoZProfilu(daneCiazy: DaneCiazyIDziecka | null): DzieckoProfilu | null {
  return daneCiazy?.dzieci[0] ?? null;
}

/** Warunek wejścia do wniosku: potwierdzona data porodu w profilu (inaczej 0037). */
export function sprawdzWejscieDoOdpisu(daneCiazy: DaneCiazyIDziecka | null): '0037' | null {
  return daneCiazy?.dataPoroduPotwierdzona && daneCiazy.dataPorodu ? null : '0037';
}

/** Pierwszy odpis skrócony bezpłatny: komunikat 0197, gdy zgłoszenie urodzenia K06 ma status do zrobienia. */
export function komunikatPierwszegoOdpisu(pozycje: readonly PozycjaPlanu[]): '0197' | null {
  return pozycje.some((p) => p.idPozycji === 'K06' && p.status === 'do-zrobienia') ? '0197' : null;
}

/** Nazwa urzędu stanu cywilnego w gminie zamieszkania z profilu. */
export function urzadStanuCywilnego(gmina: Gmina | null, nazwy: { wMiejscowniku: (m: string) => string; wGminie: (g: string) => string }): string | null {
  if (gmina === null) return null;
  return gmina.urzadStanuCywilnegoMiejscownik ? nazwy.wMiejscowniku(gmina.urzadStanuCywilnegoMiejscownik) : nazwy.wGminie(gmina.nazwa);
}

/** Formularz wypełniony z profilu: dane dziecka z profilu, data urodzenia z potwierdzonej daty porodu. */
export function formularzZProfilu(daneCiazy: DaneCiazyIDziecka | null): FormularzOdpisu {
  const dziecko = dzieckoZProfilu(daneCiazy);
  const data = daneCiazy?.dataPoroduPotwierdzona ? (daneCiazy.dataPorodu ?? dziecko?.dataUrodzenia) : dziecko?.dataUrodzenia;
  return {
    rodzajOdpisu: null,
    imie: dziecko?.imie ?? '',
    nazwisko: dziecko?.nazwisko ?? '',
    dataUrodzenia: data ? `${data.slice(8, 10)}.${data.slice(5, 7)}.${data.slice(0, 4)}` : '',
    miejsceUrodzenia: dziecko?.miejsceUrodzenia ?? '',
    pesel: dziecko?.pesel ?? '',
    cel: null,
    sposobOdbioru: null,
    adresDoDoreczenia: '',
  };
}

export type PoleDziecka = 'imie' | 'nazwisko' | 'dataUrodzenia' | 'miejsceUrodzenia' | 'pesel';
export const POLA_DZIECKA: readonly PoleDziecka[] = ['imie', 'nazwisko', 'dataUrodzenia', 'miejsceUrodzenia', 'pesel'];

/** Źródło pola dziecka: z profilu, puste w profilu albo zmienione we wniosku. */
export function zrodloPolaDziecka(
  pole: PoleDziecka,
  wartosc: string,
  zProfilu: FormularzOdpisu,
): 'z-profilu' | 'puste-w-profilu' | 'zmienione' {
  const profil = zProfilu[pole];
  if (profil.trim() === '') return 'puste-w-profilu';
  return wartosc.trim() === profil.trim() ? 'z-profilu' : 'zmienione';
}

/** Dane dziecka do zapisu w profilu: wyłącznie pola, które profil zostawił puste (R-2). */
export function uzupelnieniaProfilu(
  dziecko: DzieckoProfilu | null,
  dane: { imie: string; nazwisko: string; miejsceUrodzenia?: string; pesel?: string },
): Partial<Pick<DzieckoProfilu, 'imie' | 'nazwisko' | 'miejsceUrodzenia' | 'pesel'>> {
  const wynik: Partial<Pick<DzieckoProfilu, 'imie' | 'nazwisko' | 'miejsceUrodzenia' | 'pesel'>> = {};
  if (!dziecko?.imie && dane.imie) wynik.imie = dane.imie;
  if (!dziecko?.nazwisko && dane.nazwisko) wynik.nazwisko = dane.nazwisko;
  if (!dziecko?.miejsceUrodzenia && dane.miejsceUrodzenia) wynik.miejsceUrodzenia = dane.miejsceUrodzenia;
  if (!dziecko?.pesel && dane.pesel) wynik.pesel = dane.pesel;
  return wynik;
}

// --- Symulowany rejestr stanu cywilnego (R-9) -----------------------------------------------------

function rowne(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return true;
  return a.trim().normalize('NFC').toLocaleLowerCase('pl') === b.trim().normalize('NFC').toLocaleLowerCase('pl');
}

/**
 * Odpowiedź symulowanego rejestru stanu cywilnego: akt jest w rejestrze, gdy imię, nazwisko i data urodzenia
 * dziecka we wniosku są równe danym dziecka w profilu (pole puste w profilu nie rozstrzyga). Brak aktu: 0146.
 */
export function symulujRejestr(
  wniosek: WniosekOOdpis,
  profil: ProfilDoRejestru,
): { kod: Extract<KodKomunikatu, '0145' | '0146'> } | { urzadStanuCywilnego: string; przewidywanyDzienWydania: DataISO } {
  const dziecko = dzieckoZProfilu(profil.daneCiazy);
  const dane = wniosek.daneDziecka;
  const dataProfilu = profil.daneCiazy?.dataPorodu ?? dziecko?.dataUrodzenia;
  const zgodne =
    dane !== undefined &&
    rowne(dane.imie, dziecko?.imie) &&
    rowne(dane.nazwisko, dziecko?.nazwisko) &&
    (dataProfilu === undefined || dane.dataUrodzenia === dataProfilu);
  if (!zgodne) return { kod: '0146' };
  const zlozenie = wniosek.dataZlozenia ?? dataZeZnacznika(wniosek.zaktualizowano);
  return {
    urzadStanuCywilnego: wniosek.urzadStanuCywilnego ?? '',
    przewidywanyDzienWydania: dodajDni(zlozenie, DNI_DO_WYDANIA_ODPISU),
  };
}
