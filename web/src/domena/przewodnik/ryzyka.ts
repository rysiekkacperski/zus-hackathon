// Ryzyka w ciąży, szczególna ochrona umowy i podmioty wsparcia (kontrakt, sekcja 7.2).
// Właściciel: u22 (Ryzyka, szczególna ochrona i podmioty wsparcia).
// Reguły z ANALIZY/18 sekcja 5: R-CIAZA, R-3MC, R-PRZEDLUZENIE, R-K28, R-K29, R-ORG-FILTR, R-ORG-KONTAKT, R-ORG-UNIKALNOSC.
import { dodajDni, porownajDaty } from '@/domena/daty';
import { walidujEmail, walidujTelefon } from '@/domena/walidacje';
import type {
  BledyPol,
  DaneCiazyIDziecka,
  DaneRodzica,
  DaneZKontaZus,
  DataISO,
  FormaZatrudnienia,
  Katalog,
  KodKomunikatu,
  Okres,
  OstrzezenieSprawy,
  PodmiotWsparcia,
  PrzyczynaUstaniaUmowy,
  RodzajSytuacjiSzczegolnej,
  RodzajTytulu,
  RodzajUmowyOPrace,
  TytulUbezpieczenia,
} from '@/domena/typy';

// --- Okres ciąży i trzeci miesiąc ciąży ----------------------------------------------------------

/** Liczba dni okresu ciąży przed przewidywanym terminem porodu. */
export const DNI_OKRESU_CIAZY = 280;
/** Dzień okresu ciąży, w którym upływa trzeci miesiąc ciąży (miesiąc ciąży to 28 dni). */
export const DZIEN_UPLYWU_TRZECIEGO_MIESIACA = 84;

/** Okres ciąży: od dnia 280 dni przed przewidywanym terminem porodu do dnia tego terminu, obie daty włącznie. */
export function okresCiazyZTerminu(ptp: DataISO): Okres {
  return { od: dodajDni(ptp, -DNI_OKRESU_CIAZY), do: ptp };
}

/** Dzień upływu trzeciego miesiąca ciąży: 84. dzień okresu ciąży, licząc pierwszy dzień jako dzień 1. */
export function uplywTrzeciegoMiesiaca(ptp: DataISO): DataISO {
  return dodajDni(okresCiazyZTerminu(ptp).od, DZIEN_UPLYWU_TRZECIEGO_MIESIACA - 1);
}

// --- Przedłużenie umowy do dnia porodu -----------------------------------------------------------

/** Rodzaje umowy, o które sekcja szczególnej ochrony pyta przy końcu umowy terminowej. */
export const RODZAJE_UMOWY_TERMINOWEJ = ['czas-okreslony', 'zastepstwo', 'probna-dluzsza', 'probna-krotsza'] as const;
export type RodzajUmowyTerminowej = (typeof RODZAJE_UMOWY_TERMINOWEJ)[number];

const RODZAJE_PRZEDLUZANE: readonly RodzajUmowyOPrace[] = ['czas-okreslony', 'probna-dluzsza'];

export function czyRodzajUmowyTerminowej(rodzaj: RodzajUmowyOPrace | undefined | null): rodzaj is RodzajUmowyTerminowej {
  return rodzaj !== undefined && rodzaj !== null && (RODZAJE_UMOWY_TERMINOWEJ as readonly string[]).includes(rodzaj);
}

export interface PrzedluzenieUmowy {
  przedluzonaDoPorodu: boolean;
  kod?: KodKomunikatu;
  parametry?: Record<string, string>;
}

/**
 * Przedłużenie umowy o pracę do dnia porodu (K30: 0121, 0157). Dotyczy ustania z przyczyną koniec umowy na czas
 * określony albo na okres próbny. Umowa na czas określony i umowa na okres próbny przekraczający miesiąc przedłużają
 * się, gdy dzień rozwiązania przypada 85. dnia okresu ciąży albo później. Bez rodzaju umowy funkcja zwraca umowę
 * nieprzedłużoną bez kodu komunikatu. Parametr `data` komunikatu 0157 to data ustania w formacie ISO.
 */
export function ustalPrzedluzenieUmowy(
  ptp: DataISO,
  dataUstania: DataISO,
  przyczyna: PrzyczynaUstaniaUmowy,
  rodzaj?: RodzajUmowyOPrace | null,
): PrzedluzenieUmowy {
  if (przyczyna !== 'koniec-umowy-terminowej' || !czyRodzajUmowyTerminowej(rodzaj)) {
    return { przedluzonaDoPorodu: false };
  }
  const przedluzona =
    RODZAJE_PRZEDLUZANE.includes(rodzaj) && porownajDaty(dataUstania, uplywTrzeciegoMiesiaca(ptp)) > 0;
  return przedluzona
    ? { przedluzonaDoPorodu: true, kod: '0121' }
    : { przedluzonaDoPorodu: false, kod: '0157', parametry: { data: dataUstania } };
}

/** Ustanie umowy o pracę z przyczyną koniec umowy terminowej, przy którym sekcja K30 pyta o rodzaj umowy. */
export function czyKoniecUmowyTerminowej(rodzic: Pick<DaneRodzica, 'zmianaZatrudnienia'>): boolean {
  const zmiana = rodzic.zmianaZatrudnienia;
  return (
    zmiana?.rodzaj.wartosc === 'ustanie' &&
    zmiana.forma?.wartosc === 'umowa-o-prace' &&
    zmiana.przyczyna?.wartosc === 'koniec-umowy-terminowej' &&
    zmiana.data !== undefined
  );
}

// --- Ostrzeżenia K28 i K29 -----------------------------------------------------------------------

const PRZYCZYNY_BEZ_OSTRZEZENIA: readonly PrzyczynaUstaniaUmowy[] = [
  'upadlosc',
  'likwidacja',
  'smierc-pracodawcy',
  'naruszenie-z-wyrokiem',
];

const TYTUL_FORMY: Record<Exclude<FormaZatrudnienia, 'brak-tytulu'>, RodzajTytulu> = {
  'umowa-o-prace': 'pracownik',
  'umowa-zlecenia': 'zleceniobiorca',
  jdg: 'dzialalnosc',
};

function czyTrwaWDniu(okres: { od?: DataISO; do?: DataISO }, dzien: DataISO): boolean {
  if (okres.od !== undefined && porownajDaty(okres.od, dzien) > 0) return false;
  return okres.do === undefined || porownajDaty(okres.do, dzien) >= 0;
}

/** Tytuł z ubezpieczeniem chorobowym trwającym w podanym dniu. */
export function czyTytulZChorobowymWDniu(t: TytulUbezpieczenia, dzien: DataISO): boolean {
  if (!czyTrwaWDniu(t, dzien)) return false;
  if (t.ubezpieczenieChorobowe.rodzaj === 'brak') return false;
  return czyTrwaWDniu(t.ubezpieczenieChorobowe, dzien);
}

export interface WejscieOstrzezenCiazy {
  matka: DaneRodzica;
  daneCiazy: DaneCiazyIDziecka | null;
  daneZusMatki: Pick<DaneZKontaZus, 'tytuly'> | null;
}

export type OstrzezenieTytuluWCiazy = Extract<OstrzezenieSprawy, { rodzaj: 'tytul-w-ciazy' }>;
export type OstrzezenieUstania = Extract<OstrzezenieSprawy, { rodzaj: 'ustanie-przed-porodem' }>;

export interface OstrzezeniaCiazy {
  k28?: OstrzezenieTytuluWCiazy;
  k29?: OstrzezenieUstania;
}

/** Dziecko się urodziło: potwierdzona data porodu kończy ostrzeżenia ciąży. */
export function czyDzieckoUrodzone(daneCiazy: DaneCiazyIDziecka | null): boolean {
  return daneCiazy?.dataPoroduPotwierdzona === true;
}

/** R-K28: rozpoczęcie z profilu albo tytuł z konta ZUS z datą w okresie ciąży; data ryzyka to najwcześniejsza z nich. */
export function ostrzezenieTytuluWCiazy(w: WejscieOstrzezenCiazy): OstrzezenieTytuluWCiazy | undefined {
  const ptp = w.daneCiazy?.przewidywanyTerminPorodu;
  if (ptp === undefined || czyDzieckoUrodzone(w.daneCiazy)) return undefined;
  const okres = okresCiazyZTerminu(ptp);
  const daty: DataISO[] = [];
  const zmiana = w.matka.zmianaZatrudnienia;
  if (zmiana?.rodzaj.wartosc === 'rozpoczecie' && zmiana.data !== undefined) daty.push(zmiana.data.wartosc);
  for (const tytul of w.daneZusMatki?.tytuly ?? []) daty.push(tytul.od);
  const wCiazy = daty.filter((d) => porownajDaty(d, okres.od) >= 0 && porownajDaty(d, okres.do) <= 0).sort();
  return wCiazy.length === 0 ? undefined : { rodzaj: 'tytul-w-ciazy', data: wCiazy[0] };
}

/** R-K29: ustanie umowy albo działalności przed przewidywanym terminem porodu bez innego tytułu z chorobowym. */
export function ostrzezenieUstania(w: WejscieOstrzezenCiazy): OstrzezenieUstania | undefined {
  const ptp = w.daneCiazy?.przewidywanyTerminPorodu;
  if (ptp === undefined || czyDzieckoUrodzone(w.daneCiazy)) return undefined;
  const zmiana = w.matka.zmianaZatrudnienia;
  if (zmiana?.rodzaj.wartosc !== 'ustanie' || zmiana.forma === undefined || zmiana.data === undefined) return undefined;
  const forma = zmiana.forma.wartosc;
  const dataUstania = zmiana.data.wartosc;
  if (porownajDaty(dataUstania, ptp) >= 0) return undefined;

  let sprawdzPrzedluzenie = false;
  if (forma === 'umowa-o-prace') {
    const przyczyna = zmiana.przyczyna?.wartosc;
    if (przyczyna !== undefined && PRZYCZYNY_BEZ_OSTRZEZENIA.includes(przyczyna)) return undefined;
    if (przyczyna === 'koniec-umowy-terminowej') {
      const rodzaj = w.matka.rodzajUmowy?.wartosc;
      if (ustalPrzedluzenieUmowy(ptp, dataUstania, przyczyna, rodzaj).przedluzonaDoPorodu) return undefined;
      sprawdzPrzedluzenie = !czyRodzajUmowyTerminowej(rodzaj);
    }
  }

  const tytulUstania = TYTUL_FORMY[forma];
  const innyTytul = (w.daneZusMatki?.tytuly ?? []).some(
    (t) => t.rodzaj !== tytulUstania && czyTytulZChorobowymWDniu(t, ptp),
  );
  if (innyTytul) return undefined;
  return { rodzaj: 'ustanie-przed-porodem', data: dataUstania, forma, sprawdzPrzedluzenie };
}

/** Ostrzeżenia ciąży przy sprawach K28 i K29; po potwierdzeniu daty porodu brak ostrzeżeń. */
export function wyliczOstrzezeniaCiazy(w: WejscieOstrzezenCiazy): OstrzezeniaCiazy {
  return { k28: ostrzezenieTytuluWCiazy(w), k29: ostrzezenieUstania(w) };
}

/** Ostrzeżenie ciąży (K28 albo K29) spośród ostrzeżeń sprawy. */
export function ostrzezenieRyzyka(
  ostrzezenia: readonly OstrzezenieSprawy[],
): OstrzezenieTytuluWCiazy | OstrzezenieUstania | undefined {
  return ostrzezenia.find(
    (o): o is OstrzezenieTytuluWCiazy | OstrzezenieUstania =>
      o.rodzaj === 'tytul-w-ciazy' || o.rodzaj === 'ustanie-przed-porodem',
  );
}

// --- Podmioty wsparcia -----------------------------------------------------------------------------

/** Sytuacje szczególne słownika podmiotów wsparcia w kolejności wzorów. */
export const SYTUACJE_SZCZEGOLNE: readonly RodzajSytuacjiSzczegolnej[] = [
  'martwe-urodzenie',
  'poronienie-bez-zaswiadczenia',
  'poronienie',
  'zgon-dziecka',
  'przedwczesny-porod',
  'choroba-dziecka',
  'szpital',
  'orzeczenie',
  'porzucenie',
  'smierc-matki',
];

export function czySytuacjaSzczegolna(wartosc: string): wartosc is RodzajSytuacjiSzczegolnej {
  return (SYTUACJE_SZCZEGOLNE as readonly string[]).includes(wartosc);
}

/** Organizacje słownika, których sytuacje obejmują wskazaną sytuację; bez sytuacji wszystkie organizacje. */
export function organizacjeDlaSytuacji(k: Katalog, sytuacja?: RodzajSytuacjiSzczegolnej): PodmiotWsparcia[] {
  const wszystkie = [...k.podmiotyWsparcia].sort((a, b) => a.kolejnosc - b.kolejnosc);
  return sytuacja === undefined ? wszystkie : wszystkie.filter((p) => p.sytuacje.includes(sytuacja));
}

/**
 * Lista ekranu ViewSupportOrganizations dla jednej albo kilku sytuacji: organizacje dla każdej sytuacji w kolejności
 * słownika, a gdy żadna organizacja nie obejmuje sytuacji, wszystkie organizacje z komunikatem 0159.
 */
export function listaOrganizacji(
  k: Katalog,
  sytuacje: readonly RodzajSytuacjiSzczegolnej[],
): { organizacje: PodmiotWsparcia[]; kod?: '0159' } {
  const wszystkie = organizacjeDlaSytuacji(k);
  if (sytuacje.length === 0) return { organizacje: wszystkie };
  const pasujace = wszystkie.filter((p) => p.sytuacje.some((s) => sytuacje.includes(s)));
  return pasujace.length === 0 ? { organizacje: wszystkie, kod: '0159' } : { organizacje: pasujace };
}

/** Adres tel: z cyframi bez spacji i z zachowanym prefiksem +48. */
export function adresTelefonu(numer: string): string {
  return `tel:${numer.replace(/[\s ]/g, '')}`;
}

/** Tekst adresu strony bez https:// i bez końcowego ukośnika. */
export function tekstAdresuStrony(adres: string): string {
  return adres.replace(/^https:\/\//, '').replace(/\/$/, '');
}

/** Pola formularza ViewCatalogSupportOrganizations. */
export interface FormularzPodmiotu {
  id?: string;
  nazwa: string;
  sytuacje: RodzajSytuacjiSzczegolnej[];
  zakresPomocy: string;
  telefon: string;
  email: string;
  adresStrony: string;
  krs: string;
  charytatywny: boolean;
}

export type PolePodmiotu =
  | 'nazwa'
  | 'sytuacje'
  | 'zakresPomocy'
  | 'telefon'
  | 'email'
  | 'adresStrony'
  | 'krs'
  | 'charytatywny';

/** Kolejność pól formularza, w której fokus trafia do pierwszego pola z błędem. */
export const POLA_PODMIOTU: readonly PolePodmiotu[] = [
  'nazwa',
  'sytuacje',
  'zakresPomocy',
  'telefon',
  'email',
  'adresStrony',
  'krs',
  'charytatywny',
];

function normalizujNazwe(nazwa: string): string {
  return nazwa.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pl-PL');
}

/** Pusty formularz nowej organizacji. */
export function pustyFormularzPodmiotu(): FormularzPodmiotu {
  return { nazwa: '', sytuacje: [], zakresPomocy: '', telefon: '', email: '', adresStrony: '', krs: '', charytatywny: false };
}

/** Formularz z danymi organizacji ze słownika. */
export function formularzZPodmiotu(p: PodmiotWsparcia): FormularzPodmiotu {
  return {
    id: p.id,
    nazwa: p.nazwa,
    sytuacje: [...p.sytuacje],
    zakresPomocy: p.zakresPomocy,
    telefon: p.telefon ?? '',
    email: p.email ?? '',
    adresStrony: p.adresStrony,
    krs: p.krs ?? '',
    charytatywny: p.charytatywny,
  };
}

/** Błędy formularza podmiotu wsparcia: 0122, 0161, 0006, 0160, 0124, 0060, 0123, 0280, 0162. */
export function walidujPodmiot(f: FormularzPodmiotu, k: Katalog): BledyPol<PolePodmiotu> {
  const bledy: BledyPol<PolePodmiotu> = {};
  const nazwa = normalizujNazwe(f.nazwa);
  if (nazwa === '') bledy.nazwa = '0122';
  else if (k.podmiotyWsparcia.some((p) => p.id !== f.id && normalizujNazwe(p.nazwa) === nazwa)) bledy.nazwa = '0161';
  if (!f.sytuacje.some(czySytuacjaSzczegolna)) bledy.sytuacje = '0006';
  if (f.zakresPomocy.trim() === '') bledy.zakresPomocy = '0160';
  if (f.telefon.trim() !== '' && walidujTelefon(f.telefon) !== null) bledy.telefon = '0124';
  const email = walidujEmail(f.email, false);
  if (email !== null) bledy.email = email;
  const strona = f.adresStrony.trim();
  if (!/^https:\/\/[^\s/]+\.[^\s]+$/.test(strona)) bledy.adresStrony = '0123';
  if (!/^\d{10}$/.test(f.krs.trim())) bledy.krs = '0280';
  if (!f.charytatywny) bledy.charytatywny = '0162';
  return bledy;
}

/** Podmiot wsparcia z poprawnego formularza; sytuacje w kolejności słownika sytuacji. */
export function podmiotZFormularza(f: FormularzPodmiotu, id: string, kolejnosc: number): PodmiotWsparcia {
  const telefon = f.telefon.trim().replace(/\s+/g, ' ');
  const email = f.email.trim();
  return {
    id,
    nazwa: f.nazwa.trim().replace(/\s+/g, ' '),
    sytuacje: SYTUACJE_SZCZEGOLNE.filter((s) => f.sytuacje.includes(s)),
    zakresPomocy: f.zakresPomocy.trim(),
    ...(telefon === '' ? {} : { telefon }),
    ...(email === '' ? {} : { email }),
    adresStrony: f.adresStrony.trim(),
    krs: f.krs.trim(),
    charytatywny: true,
    kolejnosc,
  };
}
