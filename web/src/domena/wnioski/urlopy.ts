// Wnioski o urlop do pracodawcy: kreator, rodzaje, okresy, stawka, terminy, załączniki (kontrakt, sekcja 7.2).
// Właściciel: u28 (Wnioski o urlop do pracodawcy: rdzeń). Epik 3.9.6, analiza 24, reguły R-1 do R-13 i R-15.
// Czyste funkcje: data bieżąca przychodzi jako argument `dzis`.
import { dodajDni, dodajLata, dodajMiesiace, porownajDaty, roznicaDni } from '@/domena/daty';
import type {
  DaneCiazyIDziecka,
  DaneRodzica,
  DaneRodziny,
  DaneZKontaZus,
  DataISO,
  IdSprawy,
  IdWidoku,
  KodKomunikatu,
  KontoPrzewodnika,
  LiczbaDzieci,
  Okres,
  OkresWniosku,
  Pesel,
  PlanRodziny,
  PodrodzajWnioskuOUrlop,
  PrzyjecieDziecka,
  Rola,
  RodzajUrlopu,
  RodzicWRodzinie,
  StanRodziny,
  Wniosek,
  WniosekOUrlop,
  Zalacznik,
} from '@/domena/typy';

// --- Słownik wymiarów i okresów (wartości obowiązujące w dniu porodu albo przyjęcia dziecka) -----

/** Urlop macierzyński i urlop na warunkach urlopu macierzyńskiego w tygodniach według liczby dzieci. */
export const WYMIAR_MACIERZYNSKIEGO_TYGODNI: Record<LiczbaDzieci, number> = { 1: 20, 2: 31, 3: 33, 4: 35, 5: 37 };
/** Część urlopu macierzyńskiego przed porodem: najwyżej 6 tygodni przed przewidywanym terminem porodu. */
export const DNI_PRZED_PORODEM = 42;
/** Nieprzenoszalna część urlopu rodzicielskiego każdego rodzica. */
export const TYGODNIE_NIEPRZENOSZALNE = 9;
/** Najwięcej części urlopu rodzicielskiego. */
export const MAKS_CZESCI_RODZICIELSKIEGO = 5;
/** Urlop ojcowski w dniach i najkrótsza część. */
export const DNI_OJCOWSKIEGO = 14;
export const MIN_DNI_CZESCI_OJCOWSKIEGO = 7;
/** Termin wniosku w wariancie 81,5%: 21 dni od porodu albo przyjęcia dziecka. */
export const DNI_TERMINU_81_5 = 21;
/** Urlop na warunkach urlopu macierzyńskiego trwa co najmniej 9 tygodni. */
export const MIN_TYGODNI_NA_WARUNKACH = 9;

/** Rodzaje wniosku w kolejności listy na ViewLeaveRequestType. */
export const KOLEJNOSC_RODZAJOW: readonly PodrodzajWnioskuOUrlop[] = [
  'czesc-przed-porodem',
  'macierzynski-z-rodzicielskim',
  'rodzicielski',
  'ojcowski',
  'uzupelniajacy',
  'na-warunkach-macierzynskiego',
  'laczenie-z-praca',
];

// --- Pomocnicze ---------------------------------------------------------------------------------

/** Ostatni dzień okresu trwającego `tygodnie` tygodni od `od` (obie daty włącznie). */
export function koniecPoTygodniach(od: DataISO, tygodnie: number): DataISO {
  return dodajDni(od, 7 * tygodnie - 1);
}

/** Ostatni dzień okresu trwającego `dni` dni od `od`. */
export function koniecPoDniach(od: DataISO, dni: number): DataISO {
  return dodajDni(od, dni - 1);
}

function liczbaDzieci(n: number | undefined): LiczbaDzieci {
  if (n === undefined || n < 1) return 1;
  return (n > 5 ? 5 : n) as LiczbaDzieci;
}

/** Rodzic w rodzinie, którego dotyczy zalogowane konto. */
export function rodzicKontaWRodzinie(pesel: Pesel, rola: Rola, daneRodziny: DaneRodziny): RodzicWRodzinie {
  const zakladajace = daneRodziny.idRodziny === pesel || rola === 'rodzic';
  if (zakladajace) return daneRodziny.rodzicKonta;
  return daneRodziny.rodzicKonta === 'matka' ? 'drugi-rodzic' : 'matka';
}

export function daneRodzicaWRodzinie(daneRodziny: DaneRodziny, rodzic: RodzicWRodzinie): DaneRodzica {
  return rodzic === 'matka' ? daneRodziny.matka : (daneRodziny.drugiRodzic as unknown as DaneRodzica);
}

/** Wniosek o urlop do pracodawcy (bez wniosków epiku 3.9.2). */
export function czyWniosekOUrlop(w: Wniosek): w is WniosekOUrlop {
  return w.rodzaj === 'urlop-do-pracodawcy';
}

export function wyslaneWnioskiOUrlop(wnioski: Wniosek[]): WniosekOUrlop[] {
  return wnioski.filter((w): w is WniosekOUrlop => czyWniosekOUrlop(w) && w.stan === 'wyslany');
}

function rodzicWniosku(w: WniosekOUrlop, daneRodziny: DaneRodziny): RodzicWRodzinie {
  return rodzicKontaWRodzinie(w.konto, w.rola, daneRodziny);
}

// --- Dane kreatora ------------------------------------------------------------------------------

/** Dane wniosku z konta ZUS, profilu rodziny, planu i Wniosków (R-18). */
export interface DaneKreatora {
  rodzic: RodzicWRodzinie;
  rola: Rola;
  pesel: Pesel;
  imieINazwisko: string;
  emailPracownika?: string;
  pracodawca?: string;
  emailPracodawcy?: string;
  dataPoczatkuZatrudnienia?: DataISO;
  przewidywanyTerminPorodu?: DataISO;
  dataPorodu?: DataISO;
  dataPoroduPotwierdzona: boolean;
  liczbaDzieci: LiczbaDzieci;
  zaZyciem: boolean;
  dziecko?: { imie?: string; nazwisko?: string; dataUrodzenia?: DataISO };
  przyjecie?: PrzyjecieDziecka;
  wymiarK11?: number;
  /** Wysłane wnioski o urlop obojga rodziców z rodzicem wniosku. */
  wyslane: { wniosek: WniosekOUrlop; rodzic: RodzicWRodzinie }[];
}

export function wymiarK11(plan: PlanRodziny | null, daneCiazy: DaneCiazyIDziecka | null): number | undefined {
  const pozycja = plan?.pozycje.find((p) => p.idPozycji === 'K11');
  if (pozycja?.dane?.wymiarK11Tygodni) return pozycja.dane.wymiarK11Tygodni;
  if (pozycja?.wybranyWariant?.sprawa === 'K11') return pozycja.wybranyWariant.wymiarTygodni;
  if (daneCiazy?.wymiarUzupelniajacegoUrlopu === 'do-8') return 8;
  if (daneCiazy?.wymiarUzupelniajacegoUrlopu === 'do-15') return 15;
  return undefined;
}

export function zbierzDaneKreatora(w: {
  konto: KontoPrzewodnika;
  rodzina: StanRodziny;
  daneZus: DaneZKontaZus | null;
}): DaneKreatora {
  const { konto, rodzina, daneZus } = w;
  const daneRodziny = rodzina.daneRodziny;
  const rodzic = rodzicKontaWRodzinie(konto.pesel, konto.rola, daneRodziny);
  const daneRodzica = daneRodzicaWRodzinie(daneRodziny, rodzic);
  const ciaza = rodzina.daneCiazy;
  const tytulPracownika = daneZus?.tytuly.find((t) => t.rodzaj === 'pracownik' && t.do === undefined)
    ?? daneZus?.tytuly.find((t) => t.rodzaj === 'pracownik');
  const dzieckoProfilu = ciaza?.dzieci[0];
  const imie = daneZus?.imie ?? konto.imie;
  const nazwisko = daneZus?.nazwisko ?? konto.nazwisko;
  return {
    rodzic,
    rola: konto.rola,
    pesel: konto.pesel,
    imieINazwisko: `${imie} ${nazwisko}`,
    emailPracownika: daneZus?.emailEzus,
    pracodawca: tytulPracownika?.platnik.nazwa ?? daneRodzica.platnikZasilku?.nazwaPlatnika,
    emailPracodawcy: daneRodzica.emailPracodawcy?.wartosc,
    dataPoczatkuZatrudnienia: daneRodzica.dataPoczatkuZatrudnienia?.wartosc,
    przewidywanyTerminPorodu: ciaza?.przewidywanyTerminPorodu,
    dataPorodu: ciaza?.dataPorodu,
    dataPoroduPotwierdzona: ciaza?.dataPoroduPotwierdzona === true && ciaza.dataPorodu !== undefined,
    liczbaDzieci: liczbaDzieci(ciaza?.liczbaUrodzonychDzieci ?? ciaza?.liczbaDzieciZCiazy),
    zaZyciem: ciaza?.zaswiadczenieZaZyciem === true,
    dziecko: dzieckoProfilu
      ? { imie: dzieckoProfilu.imie, nazwisko: dzieckoProfilu.nazwisko, dataUrodzenia: dzieckoProfilu.dataUrodzenia ?? ciaza?.dataPorodu }
      : undefined,
    przyjecie: ciaza?.przyjecie,
    wymiarK11: wymiarK11(rodzina.plan, ciaza),
    wyslane: wyslaneWnioskiOUrlop(rodzina.wnioski).map((wn) => ({ wniosek: wn, rodzic: rodzicWniosku(wn, daneRodziny) })),
  };
}

// --- R-1 Otwarcie kreatora ----------------------------------------------------------------------

/** Ekran startowy kreatora wniosków o urlop (0140, 0064). */
export function otworzKreatorWnioskow(
  konto: KontoPrzewodnika,
  rodzina: StanRodziny | null,
  idSprawy: IdSprawy | undefined,
): { cel: IdWidoku; kod?: KodKomunikatu } {
  void idSprawy;
  if (rodzina === null) return { cel: 'ViewFamilyPlan', kod: '0064' };
  const rodzic = rodzicKontaWRodzinie(konto.pesel, konto.rola, rodzina.daneRodziny);
  const dane = daneRodzicaWRodzinie(rodzina.daneRodziny, rodzic);
  const forma = dane.formaZatrudnienia?.wartosc;
  if (forma === 'umowa-o-prace') return { cel: 'ViewLeaveRequestType' };
  if ((forma === 'umowa-zlecenia' || forma === 'jdg') && dane.dobrowolneChorobowe?.wartosc === true) {
    return { cel: 'ViewZamLeaveType', kod: '0140' };
  }
  return { cel: 'ViewFamilyPlan', kod: '0064' };
}

// --- R-2 Rodzaje wniosku ------------------------------------------------------------------------

function czyWyslanyRodzicielski(w: WniosekOUrlop): boolean {
  return w.okresy.some((o) => o.rodzajUrlopu === 'rodzicielski');
}

/** Rodzaje wniosku dostępne dla roli i stanu rodziny; `dzis` sprawdza 12 miesięcy urlopu ojcowskiego. */
export function rodzajeWniosku(
  rola: Rola,
  rodzina: StanRodziny | null,
  plan: PlanRodziny | null,
  wnioski: Wniosek[],
  dzis?: DataISO,
): PodrodzajWnioskuOUrlop[] {
  if (rodzina === null) return [];
  const daneRodziny = rodzina.daneRodziny;
  const rodzic: RodzicWRodzinie = rola === 'drugi-rodzic'
    ? (daneRodziny.rodzicKonta === 'matka' ? 'drugi-rodzic' : 'matka')
    : daneRodziny.rodzicKonta;
  const ciaza = rodzina.daneCiazy;
  const wyslane = wyslaneWnioskiOUrlop(wnioski);
  const wlasne = wyslane.filter((w) => rodzicWniosku(w, daneRodziny) === rodzic);
  const wynik = new Set<PodrodzajWnioskuOUrlop>();
  const przyjecie = ciaza?.przyjecie;
  const przyjmujacy: RodzicWRodzinie | undefined = przyjecie
    ? (przyjecie.rolaRodzicaPrzyjmujacego === 'matka' ? 'matka' : 'drugi-rodzic')
    : undefined;

  if (przyjecie && przyjmujacy === rodzic) {
    wynik.add('na-warunkach-macierzynskiego');
    wynik.add('rodzicielski');
  } else if (przyjecie) {
    if (przyjecie.forma === 'przysposobienie' && przyjecie.dataUprawomocnienia) wynik.add('ojcowski');
  } else if (rodzic === 'matka') {
    if (ciaza?.dataPoroduPotwierdzona && ciaza.dataPorodu) {
      wynik.add('macierzynski-z-rodzicielskim');
      wynik.add('rodzicielski');
    } else {
      wynik.add('czesc-przed-porodem');
    }
  } else if (ciaza?.dataPoroduPotwierdzona && ciaza.dataPorodu) {
    const granica = dodajDni(dodajMiesiace(ciaza.dataPorodu, 12), -1);
    if (dzis === undefined || porownajDaty(dzis, granica) <= 0) wynik.add('ojcowski');
    wynik.add('rodzicielski');
  }

  const porodPotwierdzony = ciaza?.dataPoroduPotwierdzona === true && ciaza.dataPorodu !== undefined;
  const uzupelniajacyWyslany = wyslane.some((w) => w.podrodzaj === 'uzupelniajacy');
  if (!przyjecie && porodPotwierdzony && wymiarK11(plan, ciaza) !== undefined && !uzupelniajacyWyslany) {
    wynik.add('uzupelniajacy');
  }
  if (wlasne.some(czyWyslanyRodzicielski)) wynik.add('laczenie-z-praca');
  return KOLEJNOSC_RODZAJOW.filter((r) => wynik.has(r));
}

// --- R-15 Sprawa planu wniosku ------------------------------------------------------------------

/** Pozycja katalogu sprawy, przy której zapisujemy wniosek danego rodzaju. */
export function pozycjaSprawyWniosku(podrodzaj: PodrodzajWnioskuOUrlop, rodzic: RodzicWRodzinie, zPrzyjeciem: boolean): string {
  switch (podrodzaj) {
    case 'czesc-przed-porodem':
    case 'macierzynski-z-rodzicielskim':
      return 'K07';
    case 'rodzicielski':
      if (zPrzyjeciem) return 'K31';
      return rodzic === 'matka' ? 'K07' : 'K10';
    case 'ojcowski':
      return 'K09';
    case 'uzupelniajacy':
      return 'K11';
    case 'na-warunkach-macierzynskiego':
      return 'K31';
    case 'laczenie-z-praca':
      return 'K37';
    default:
      return 'K07';
  }
}

/** Identyfikator sprawy w planie dla pozycji katalogu i rodzica; bez planu identyfikator pozycji. */
export function idSprawyWniosku(plan: PlanRodziny | null, idPozycji: string, rodzic: RodzicWRodzinie): IdSprawy {
  const pozycje = plan?.pozycje.filter((p) => p.idPozycji === idPozycji) ?? [];
  const dlaRodzica = pozycje.find((p) => p.idSprawy.endsWith(`-${rodzic}`)) ?? pozycje[0];
  return dlaRodzica?.idSprawy ?? idPozycji;
}

/** Czy wysłanie wniosku zmienia status sprawy na złożoną (część przed porodem zostawia K07 do zrobienia). */
export function czyWyslanieZamykaSprawe(podrodzaj: PodrodzajWnioskuOUrlop | undefined): boolean {
  return podrodzaj !== 'czesc-przed-porodem';
}

// --- R-3 do R-6 Okresy ----------------------------------------------------------------------------

export function okresUrlopuMacierzynskiego(dane: Pick<DaneKreatora, 'dataPorodu' | 'liczbaDzieci' | 'wyslane'>): Okres | null {
  if (!dane.dataPorodu) return null;
  const przedPorodem = dane.wyslane.find((w) => w.rodzic === 'matka' && w.wniosek.podrodzaj === 'czesc-przed-porodem');
  const od = przedPorodem?.wniosek.okresy[0]?.od ?? dane.dataPorodu;
  return { od, do: koniecPoTygodniach(od, WYMIAR_MACIERZYNSKIEGO_TYGODNI[dane.liczbaDzieci]) };
}

/** Zakres daty początku części urlopu macierzyńskiego przed porodem (R-4). */
export function zakresPrzedPorodem(ptp: DataISO): Okres {
  return { od: dodajDni(ptp, -DNI_PRZED_PORODEM), do: dodajDni(ptp, -1) };
}

/** Wymiar urlopu rodzicielskiego: całkowity i na rodzica (R-5). */
export function wymiarRodzicielskiego(liczba: LiczbaDzieci, zaZyciem: boolean): { calkowity: number; naRodzica: number } {
  const calkowity = (liczba > 1 ? 43 : 41) + (zaZyciem ? 24 : 0);
  return { calkowity, naRodzica: calkowity - TYGODNIE_NIEPRZENOSZALNE };
}

/** 31 grudnia roku, w którym dziecko kończy 6 lat. */
export function granicaRodzicielskiego(dataUrodzenia: DataISO): DataISO {
  const rok = Number(dataUrodzenia.slice(0, 4)) + 6;
  return `${rok}-12-31`;
}

/** Ostatni dzień urlopu poprzedzającego urlop rodzicielski: macierzyński, uzupełniający albo na warunkach. */
export function koniecUrlopuPrzedRodzicielskim(dane: DaneKreatora): DataISO | null {
  const naWarunkach = dane.wyslane.find((w) => w.wniosek.podrodzaj === 'na-warunkach-macierzynskiego');
  const okresNaWarunkach = naWarunkach?.wniosek.okresy.find((o) => o.rodzajUrlopu === 'na-warunkach-macierzynskiego');
  if (okresNaWarunkach) return okresNaWarunkach.do;
  const uzupelniajacy = dane.wyslane.find((w) => w.wniosek.podrodzaj === 'uzupelniajacy')?.wniosek.okresy[0];
  if (uzupelniajacy) return uzupelniajacy.do;
  return okresUrlopuMacierzynskiego(dane)?.do ?? null;
}

export interface WykorzystanieRodzicielskiego {
  czesci: { rodzic: RodzicWRodzinie; od: DataISO; do: DataISO; tygodnie: number; imie?: string }[];
  wlasne: number;
  oboje: number;
  numerCzesci: number;
  limitRodzica: number;
  pozostalo: number;
}

/** Wykorzystane części i tygodnie urlopu rodzicielskiego z wysłanych wniosków obojga rodziców (R-5). */
export function wykorzystanieRodzicielskiego(dane: DaneKreatora): WykorzystanieRodzicielskiego {
  const czesci = dane.wyslane.flatMap(({ wniosek, rodzic }) =>
    wniosek.okresy
      .filter((o) => o.rodzajUrlopu === 'rodzicielski')
      .map((o) => ({ rodzic, od: o.od, do: o.do, tygodnie: o.tygodnie ?? Math.round((roznicaDni(o.od, o.do) + 1) / 7), imie: wniosek.daneRodzica?.imie })),
  ).sort((a, b) => porownajDaty(a.od, b.od));
  const wlasne = czesci.filter((c) => c.rodzic === dane.rodzic).reduce((s, c) => s + c.tygodnie, 0);
  const oboje = czesci.reduce((s, c) => s + c.tygodnie, 0);
  const { calkowity, naRodzica } = wymiarRodzicielskiego(dane.liczbaDzieci, dane.zaZyciem);
  const pozostalo = Math.max(0, Math.min(naRodzica - wlasne, calkowity - oboje));
  return { czesci, wlasne, oboje, numerCzesci: czesci.length + 1, limitRodzica: naRodzica, pozostalo };
}

// --- R-6, R-12 Stawka ---------------------------------------------------------------------------

/** Dzień, od którego liczymy termin 21 dni dla wariantu 81,5%: poród albo przyjęcie dziecka. */
export function dzienTerminu815(dane: Pick<DaneKreatora, 'dataPorodu' | 'przyjecie'>): DataISO | null {
  if (dane.przyjecie) return dane.przyjecie.dataPrzyjecia;
  return dane.dataPorodu ?? null;
}

/** Stawka zasiłku za okres urlopu (0038, 0165) i liczba dni do końca terminu 81,5%. */
export function stawkaZasilku(w: {
  zakres: WniosekOUrlop['zakres'] | null;
  dzis: DataISO;
  dataPorodu?: DataISO;
  przyjecie?: PrzyjecieDziecka;
}): { stawka: '81-5' | '100-70' | null; kod?: KodKomunikatu; termin?: DataISO; zostaloDni?: number } {
  const poczatek = dzienTerminu815(w);
  if (poczatek === null) return { stawka: null };
  const termin = dodajDni(poczatek, DNI_TERMINU_81_5);
  const zostaloDni = roznicaDni(w.dzis, termin);
  const poTerminie = zostaloDni < 0;
  const kodPoTerminie: KodKomunikatu = w.przyjecie ? '0165' : '0038';
  if (w.zakres === null) return { stawka: null, kod: poTerminie ? kodPoTerminie : undefined, termin, zostaloDni };
  if (w.zakres === 'z-calym-rodzicielskim' && !poTerminie) return { stawka: '81-5', termin, zostaloDni };
  return { stawka: '100-70', kod: poTerminie ? kodPoTerminie : undefined, termin, zostaloDni };
}

/** Stawka okresu (%) według wariantu wniosku. */
export function stawkaOkresu(rodzaj: RodzajUrlopu, wariant: '81-5' | '100-70' | undefined): number {
  if (wariant === '81-5' && (rodzaj === 'macierzynski' || rodzaj === 'rodzicielski' || rodzaj === 'na-warunkach-macierzynskiego')) return 81.5;
  if (rodzaj === 'rodzicielski') return 70;
  return 100;
}

/** Okresy z przeliczonymi stawkami po zmianie wariantu (R-16). */
export function przeliczStawki(okresy: OkresWniosku[], wariant: '81-5' | '100-70'): OkresWniosku[] {
  return okresy.map((o) => ({ ...o, stawka: stawkaOkresu(o.rodzajUrlopu, wariant) }));
}

// --- R-9 Terminy złożenia -----------------------------------------------------------------------

/** Ostrzeżenie o terminie złożenia wniosku (0136, 0137, 0203, 0204, 0205); null, gdy brak. */
export function ostrzezenieTerminu(w: {
  podrodzaj: PodrodzajWnioskuOUrlop;
  dzis: DataISO;
  poczatek?: DataISO | null;
  koniecMacierzynskiego?: DataISO | null;
  dataPrzyjecia?: DataISO | null;
}): { kod: KodKomunikatu; parametry?: Record<string, string> } | null {
  const { podrodzaj, dzis, poczatek } = w;
  switch (podrodzaj) {
    case 'rodzicielski':
      return poczatek && roznicaDni(dzis, poczatek) < 21 ? { kod: '0136' } : null;
    case 'ojcowski':
      return poczatek && roznicaDni(dzis, poczatek) < 7 ? { kod: '0137' } : null;
    case 'uzupelniajacy':
      return w.koniecMacierzynskiego && porownajDaty(dzis, dodajDni(w.koniecMacierzynskiego, -21)) > 0 ? { kod: '0203' } : null;
    case 'na-warunkach-macierzynskiego':
      return w.dataPrzyjecia && porownajDaty(dzis, dodajDni(w.dataPrzyjecia, 7)) > 0 ? { kod: '0204' } : null;
    case 'laczenie-z-praca':
      return poczatek && roznicaDni(dzis, poczatek) < 21 ? { kod: '0205' } : null;
    default:
      return null;
  }
}

// --- R-11 Załączniki ----------------------------------------------------------------------------

export type IdZalacznikaUrlopu =
  | 'zaswiadczenie-o-terminie-porodu'
  | 'odpis-skrocony-aktu-urodzenia'
  | 'oswiadczenie-o-zamiarze-drugiego-rodzica'
  | 'kopia-zaswiadczenia-za-zyciem'
  | 'oswiadczenie-o-wczesniejszym-ojcowskim'
  | 'kopia-postanowienia-o-przysposobieniu'
  | 'zaswiadczenie-szpitala'
  | 'oswiadczenie-drugi-rodzic-bez-uzupelniajacego'
  | 'oswiadczenie-o-dacie-przyjecia'
  | 'zaswiadczenie-sadu-o-przysposobieniu'
  | 'orzeczenie-o-rodzinie-zastepczej'
  | 'decyzja-o-odroczeniu';

function zalacznik(id: IdZalacznikaUrlopu): Zalacznik {
  return { id, rodzaj: id, wymagany: true };
}

/** Załączniki wniosku o urlop (R-11); nazwy daje teksty.ViewLeaveRequestForm.zalaczniki[id]. */
export function listaZalacznikow(
  podrodzaj: PodrodzajWnioskuOUrlop,
  profil: { zaZyciem: boolean; przyjecie?: PrzyjecieDziecka },
): Zalacznik[] {
  switch (podrodzaj) {
    case 'czesc-przed-porodem':
      return [zalacznik('zaswiadczenie-o-terminie-porodu')];
    case 'macierzynski-z-rodzicielskim':
    case 'rodzicielski': {
      const lista = [zalacznik('odpis-skrocony-aktu-urodzenia'), zalacznik('oswiadczenie-o-zamiarze-drugiego-rodzica')];
      if (profil.zaZyciem) lista.push(zalacznik('kopia-zaswiadczenia-za-zyciem'));
      return lista;
    }
    case 'ojcowski': {
      const lista = [zalacznik('odpis-skrocony-aktu-urodzenia'), zalacznik('oswiadczenie-o-wczesniejszym-ojcowskim')];
      if (profil.przyjecie?.forma === 'przysposobienie') lista.push(zalacznik('kopia-postanowienia-o-przysposobieniu'));
      return lista;
    }
    case 'uzupelniajacy':
      return [zalacznik('zaswiadczenie-szpitala'), zalacznik('oswiadczenie-drugi-rodzic-bez-uzupelniajacego')];
    case 'na-warunkach-macierzynskiego': {
      const lista = [zalacznik('oswiadczenie-o-dacie-przyjecia')];
      if (profil.przyjecie?.forma === 'przysposobienie') lista.push(zalacznik('zaswiadczenie-sadu-o-przysposobieniu'));
      else lista.push(zalacznik('orzeczenie-o-rodzinie-zastepczej'));
      if (profil.przyjecie?.odroczenieObowiazkuSzkolnego) lista.push(zalacznik('decyzja-o-odroczeniu'));
      return lista;
    }
    default:
      return [];
  }
}

// --- Propozycje i okresy -----------------------------------------------------------------------

/** Wartości proponowane w formularzu wniosku (R-7, R-10, R-18). */
export function propozycjeFormularza(podrodzaj: PodrodzajWnioskuOUrlop, dane: DaneKreatora): Partial<WniosekOUrlop> {
  const oswiadczenia: WniosekOUrlop['oswiadczenia'] = {};
  if (podrodzaj === 'ojcowski') {
    const ojcowski7 = dane.wyslane.some(
      (w) => w.rodzic === dane.rodzic && w.wniosek.podrodzaj === 'ojcowski' && (w.wniosek.okresy[0]?.dni ?? 0) === 7,
    );
    if (ojcowski7) oswiadczenia.wczesniejszyOjcowski = '7-dni';
  }
  return { oswiadczenia, zalaczniki: listaZalacznikow(podrodzaj, dane) };
}

/** Okresy urlopu we wniosku z wartości pól po walidacji (R-3 do R-8, R-12). */
export function wyliczOkresyUrlopu(
  podrodzaj: PodrodzajWnioskuOUrlop,
  w: { od: DataISO; tygodnie?: number; dni?: number; zakres?: WniosekOUrlop['zakres']; wariant?: '81-5' | '100-70' },
  dane: DaneKreatora,
): OkresWniosku[] {
  const okres = (rodzajUrlopu: RodzajUrlopu, od: DataISO, doDnia: DataISO, extra: Partial<OkresWniosku>): OkresWniosku => ({
    rodzajUrlopu, od, do: doDnia, rodzic: dane.rodzic, stawka: stawkaOkresu(rodzajUrlopu, w.wariant), ...extra,
  });
  const { naRodzica } = wymiarRodzicielskiego(dane.liczbaDzieci, dane.zaZyciem);
  switch (podrodzaj) {
    case 'czesc-przed-porodem': {
      const tygodnie = WYMIAR_MACIERZYNSKIEGO_TYGODNI[dane.liczbaDzieci];
      return [okres('czesc-przed-porodem', w.od, koniecPoTygodniach(w.od, tygodnie), { tygodnie })];
    }
    case 'macierzynski-z-rodzicielskim': {
      const mac = okresUrlopuMacierzynskiego(dane);
      if (!mac) return [];
      const tygodnie = WYMIAR_MACIERZYNSKIEGO_TYGODNI[dane.liczbaDzieci];
      const lista = [okres('macierzynski', mac.od, mac.do, { tygodnie })];
      if (w.zakres === 'z-calym-rodzicielskim') {
        const od = dodajDni(mac.do, 1);
        lista.push(okres('rodzicielski', od, koniecPoTygodniach(od, naRodzica), { tygodnie: naRodzica }));
      }
      return lista;
    }
    case 'rodzicielski': {
      const tygodnie = w.tygodnie ?? 1;
      return [okres('rodzicielski', w.od, koniecPoTygodniach(w.od, tygodnie), { tygodnie })];
    }
    default:
      return [];
  }
}

/** Nazwa pliku PDF wniosku, np. „Wniosek-o-urlop-macierzynski-z-urlopem-rodzicielskim.pdf”. */
export function nazwaPlikuWniosku(podrodzaj: PodrodzajWnioskuOUrlop | undefined): string {
  const nazwy: Record<PodrodzajWnioskuOUrlop, string> = {
    'czesc-przed-porodem': 'Wniosek-o-czesc-urlopu-macierzynskiego-przed-porodem',
    'macierzynski-z-rodzicielskim': 'Wniosek-o-urlop-macierzynski-z-urlopem-rodzicielskim',
    rodzicielski: 'Wniosek-o-urlop-rodzicielski',
    ojcowski: 'Wniosek-o-urlop-ojcowski',
    uzupelniajacy: 'Wniosek-o-uzupelniajacy-urlop-macierzynski',
    'na-warunkach-macierzynskiego': 'Wniosek-o-urlop-na-warunkach-urlopu-macierzynskiego',
    'laczenie-z-praca': 'Wniosek-o-laczenie-urlopu-rodzicielskiego-z-praca',
    'rezygnacja-matki': 'Wniosek-o-rezygnacje-z-urlopu-macierzynskiego',
    'pozostala-czesc-macierzynskiego': 'Wniosek-o-pozostala-czesc-urlopu-macierzynskiego',
  };
  return `${nazwy[podrodzaj ?? 'macierzynski-z-rodzicielskim']}.pdf`;
}

/** Granica wieku dziecka przy urlopie na warunkach urlopu macierzyńskiego: dzień przed ukończeniem 7, 10 albo 14 lat. */
export function granicaWiekuPrzyjecia(przyjecie: PrzyjecieDziecka): DataISO {
  const lata = przyjecie.forma === 'przysposobienie' ? 14 : przyjecie.odroczenieObowiazkuSzkolnego ? 10 : 7;
  return dodajDni(dodajLata(przyjecie.dataUrodzeniaDziecka, lata), -1);
}
