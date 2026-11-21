// Kreator wniosku o zasiłek chorobowy ZAS-53 (kontrakt, sekcja 7.2). Właściciel: u30 (Kreator wniosku o zasiłek chorobowy ZAS-53).
// Czyste reguły epiku 3.9.9: dostęp do kreatora, lista zaświadczeń e-ZLA, prawo do zasiłku chorobowego w okresie
// ubezpieczenia i po jego ustaniu, nieprzerwana niezdolność do pracy, kolejne zaświadczenie i załączniki.
import { dodajDni, dodajMiesiace, formatujDate, liczbaDniWlacznie, maxData, minData, porownajDaty, roznicaDni } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import type {
  DaneRodziny,
  DaneZKontaZus,
  DataISO,
  Grosze,
  IdWidoku,
  KodKomunikatu,
  KontoPrzewodnika,
  Okres,
  StanZgody,
  TytulUbezpieczenia,
  Wniosek,
  WniosekZas53,
  Zalacznik,
  ZaswiadczenieEzla,
} from '@/domena/typy';

/** Zaświadczenie lekarskie zapisane we wniosku: e-ZLA z konta ZUS albo zaświadczenie w trybie alternatywnym. */
export type ZaswiadczenieWnioskuZas53 = NonNullable<WniosekZas53['zaswiadczenie']>;

export interface KomunikatZas53 {
  kod: KodKomunikatu;
  parametry?: Record<string, string>;
}

/** Wynik ustalenia prawa: pola szkicu wniosku, komunikaty w kolejności pokazania i blokada przejścia dalej. */
export type UstaleniePrawaZas53 = Partial<WniosekZas53> & {
  kod?: KodKomunikatu;
  parametry?: Record<string, string>;
  komunikaty: KomunikatZas53[];
  blokuje: boolean;
  poUstaniu: boolean;
  nieprzerwanaDni?: number;
};

/** Wartości reguł świadczeń z ubezpieczenia chorobowego używane przez kreator (słownik wymiarów i okresów, słownik kwot i progów). */
export interface ParametryPrawaZas53 {
  dniWyczekiwaniaObowiazkowe: 30;
  dniWyczekiwaniaDobrowolne: 90;
  przerwaWUbezpieczeniuDni: number;
  okresZasilkowyWCiazyDni: number;
  przerwaWOkresieZasilkowymDni: number;
  dniOdUstaniaDoPowstania: number;
  miesiaceOdUstaniaPrzyKodzieE: number;
  minimalnaNiezdolnoscPoUstaniuDni: number;
  progZadluzenia: Grosze;
  miesiaceSplatyZadluzenia: number;
  stawkaZKodemB: 100;
  stawkaBezKoduB: 80;
}

export const PARAMETRY_PRAWA_ZAS53: ParametryPrawaZas53 = {
  dniWyczekiwaniaObowiazkowe: 30,
  dniWyczekiwaniaDobrowolne: 90,
  przerwaWUbezpieczeniuDni: 30,
  okresZasilkowyWCiazyDni: 270,
  przerwaWOkresieZasilkowymDni: 60,
  dniOdUstaniaDoPowstania: 14,
  miesiaceOdUstaniaPrzyKodzieE: 3,
  minimalnaNiezdolnoscPoUstaniuDni: 30,
  progZadluzenia: 4806,
  miesiaceSplatyZadluzenia: 6,
  stawkaZKodemB: 100,
  stawkaBezKoduB: 80,
};

export type SciezkaZas53 = 'w-ubezpieczeniu' | 'po-ustaniu';

export type DostepZas53 =
  | { dozwolony: true; sciezka: SciezkaZas53; tytul: TytulUbezpieczenia }
  | { dozwolony: false; kod: '0004' | '0083' | '0233'; cel: IdWidoku; tytul?: TytulUbezpieczenia };

// --- Pomocnicze ------------------------------------------------------------------------------------

/** Seria i numer bez odstępów do porównań i parametrów adresu (`ZY 2611021` → `ZY2611021`). */
export function kluczZaswiadczenia(seriaINumer: string | undefined): string {
  return (seriaINumer ?? '').replace(/\s+/g, '').toUpperCase();
}

/** Konto zalogowane jest kontem matki w rodzinie (zasiłek chorobowy w ciąży przysługuje matce). */
export function czyKontoMatki(konto: KontoPrzewodnika, daneRodziny: DaneRodziny): boolean {
  if (konto.rola === 'rodzic') return daneRodziny.rodzicKonta === 'matka';
  if (konto.rola === 'drugi-rodzic') return daneRodziny.rodzicKonta === 'drugi-rodzic';
  return false;
}

function koniecUbezpieczenia(t: TytulUbezpieczenia): DataISO | undefined {
  const konce = [t.do, t.ubezpieczenieChorobowe.do].filter((d): d is DataISO => d !== undefined);
  return konce.length === 0 ? undefined : minData(...konce);
}

function poczatekUbezpieczenia(t: TytulUbezpieczenia): DataISO {
  return t.ubezpieczenieChorobowe.od ? maxData(t.od, t.ubezpieczenieChorobowe.od) : t.od;
}

function maChorobowe(t: TytulUbezpieczenia): boolean {
  return t.ubezpieczenieChorobowe.rodzaj !== 'brak';
}

/** Tytuł z ubezpieczeniem chorobowym obowiązującym w dniu `dzien`. */
export function tytulZChorobowymWDniu(tytuly: TytulUbezpieczenia[], dzien: DataISO): TytulUbezpieczenia | undefined {
  return tytuly.find((t) => {
    if (!maChorobowe(t)) return false;
    const koniec = koniecUbezpieczenia(t);
    return porownajDaty(poczatekUbezpieczenia(t), dzien) <= 0 && (koniec === undefined || porownajDaty(koniec, dzien) >= 0);
  });
}

/** Tytuł z ubezpieczeniem chorobowym, który ustał przed dniem `dzien` (najpóźniej ustały). */
export function tytulUstalyPrzed(tytuly: TytulUbezpieczenia[], dzien: DataISO): TytulUbezpieczenia | undefined {
  return tytuly
    .filter((t) => maChorobowe(t))
    .filter((t) => {
      const koniec = koniecUbezpieczenia(t);
      return koniec !== undefined && porownajDaty(koniec, dzien) < 0;
    })
    .sort((a, b) => porownajDaty(koniecUbezpieczenia(b) as DataISO, koniecUbezpieczenia(a) as DataISO))[0];
}

/**
 * Początek nieprzerwanego ubezpieczenia chorobowego trwającego w dniu `dzien`. Do okresu wlicza się poprzedni
 * okres ubezpieczenia chorobowego, gdy przerwa nie przekroczyła `przerwaDni`.
 */
export function poczatekNieprzerwanegoUbezpieczenia(
  tytuly: TytulUbezpieczenia[],
  dzien: DataISO,
  przerwaDni: number,
): DataISO | null {
  const okresy = tytuly
    .filter(maChorobowe)
    .map((t) => ({ od: poczatekUbezpieczenia(t), do: koniecUbezpieczenia(t) }))
    .filter((o) => porownajDaty(o.od, dzien) <= 0)
    .sort((a, b) => porownajDaty(b.od, a.od));
  const biezacy = okresy.find((o) => o.do === undefined || porownajDaty(o.do, dzien) >= 0);
  if (!biezacy) return null;
  let poczatek = biezacy.od;
  for (;;) {
    const poprzedni = okresy.find(
      (o) => o.do !== undefined && porownajDaty(o.od, poczatek) < 0 && roznicaDni(o.do, poczatek) - 1 <= przerwaDni,
    );
    if (!poprzedni) return poczatek;
    poczatek = poprzedni.od;
  }
}

function wyslaneWnioskiZas53(wnioski: Wniosek[]): WniosekZas53[] {
  return wnioski.filter(
    (w): w is WniosekZas53 => w.rodzaj === 'zas-53' && (w.stan === 'wyslany' || w.stan === 'zlozony'),
  );
}

// --- Dostęp do kreatora ----------------------------------------------------------------------------

/**
 * Blokada kreatora ZAS-53 (0004, 0233, 0083) albo ścieżka kreatora. Kolejność: zgoda na dane dotyczące zdrowia,
 * potem zakres wnioskodawcy według formy zatrudnienia i ubezpieczenia chorobowego w dniu `dzis`.
 */
export function sprawdzDostepZas53(w: { stanZgody: StanZgody; kopia: DaneZKontaZus | null; dzis: DataISO }): DostepZas53 {
  if (w.stanZgody !== 'udzielona') return { dozwolony: false, kod: '0004', cel: 'ViewGuideSettings' };
  const tytuly = w.kopia?.tytuly ?? [];
  const biezacy = tytulZChorobowymWDniu(tytuly, w.dzis);
  if (biezacy?.rodzaj === 'dzialalnosc') return { dozwolony: true, sciezka: 'w-ubezpieczeniu', tytul: biezacy };
  if (biezacy) return { dozwolony: false, kod: '0233', cel: 'ViewCaseGuide', tytul: biezacy };
  const ustaly = tytulUstalyPrzed(tytuly, w.dzis);
  if (ustaly) return { dozwolony: true, sciezka: 'po-ustaniu', tytul: ustaly };
  const bezChorobowego = tytuly.find((t) => !maChorobowe(t) && (t.do === undefined || porownajDaty(t.do, w.dzis) >= 0));
  return { dozwolony: false, kod: '0083', cel: 'ViewFamilyPlan', tytul: bezChorobowego };
}

// --- Lista zaświadczeń -----------------------------------------------------------------------------

/** Zaświadczenia e-ZLA z powodu choroby, bez objętych wysłanym wnioskiem ZAS-53, od najpóźniejszego początku. */
export function listaZaswiadczenZas53(kopia: DaneZKontaZus | null, wnioski: Wniosek[]): ZaswiadczenieEzla[] {
  const objete = new Set(
    wyslaneWnioskiZas53(wnioski)
      .map((w) => w.zaswiadczenie)
      .filter((z) => z?.zrodlo === 'e-zla')
      .map((z) => kluczZaswiadczenia(z?.seriaINumer)),
  );
  return (kopia?.zaswiadczeniaEzla ?? [])
    .filter((z) => z.rodzaj === 'choroba' && !objete.has(kluczZaswiadczenia(z.seriaINumer)))
    .sort((a, b) => porownajDaty(b.od, a.od));
}

/** Zapis zaświadczenia e-ZLA w polu wniosku. */
export function zaswiadczenieZEzla(z: ZaswiadczenieEzla): ZaswiadczenieWnioskuZas53 {
  return { zrodlo: 'e-zla', seriaINumer: z.seriaINumer, od: z.od, do: z.do, kodyLiterowe: [...z.kodyLiterowe], platnik: z.platnik };
}

// --- Nieprzerwana niezdolność i okres zasiłkowy ----------------------------------------------------

/**
 * Nieprzerwana niezdolność do pracy od początku zaświadczenia: łańcuch kolejnych zaświadczeń z powodu choroby,
 * w których początek następnego przypada dzień po końcu poprzedniego.
 */
export function nieprzerwanaNiezdolnosc(
  zaswiadczenie: Okres,
  wszystkie: readonly ZaswiadczenieEzla[],
): Okres & { dni: number } {
  const choroby = wszystkie.filter((z) => z.rodzaj === 'choroba');
  let koniec = zaswiadczenie.do;
  for (;;) {
    const nastepne = choroby.find((z) => z.od === dodajDni(koniec, 1));
    if (!nastepne) break;
    koniec = nastepne.do;
  }
  const okres = { od: zaswiadczenie.od, do: koniec };
  return { ...okres, dni: liczbaDniWlacznie(okres) };
}

/**
 * Dzień wyczerpania okresu zasiłkowego w ciąży przed dniem `przed`: dni niezdolności z kodem B z zaświadczeń
 * kończących się przed tym dniem, liczone w jednym okresie zasiłkowym (przerwa najwyżej `przerwaDni`).
 */
export function dzienWyczerpaniaOkresuZasilkowego(
  wszystkie: readonly ZaswiadczenieEzla[],
  przed: DataISO,
  p: Pick<ParametryPrawaZas53, 'okresZasilkowyWCiazyDni' | 'przerwaWOkresieZasilkowymDni'>,
): DataISO | null {
  const wczesniejsze = wszystkie
    .filter((z) => z.rodzaj === 'choroba' && z.kodyLiterowe.includes('B') && porownajDaty(z.od, przed) < 0)
    .sort((a, b) => porownajDaty(a.od, b.od));
  let wykorzystane = 0;
  let poprzedniKoniec: DataISO | null = null;
  for (const z of wczesniejsze) {
    if (poprzedniKoniec !== null && roznicaDni(poprzedniKoniec, z.od) - 1 > p.przerwaWOkresieZasilkowymDni) wykorzystane = 0;
    const koniec = minData(z.do, dodajDni(przed, -1));
    const dni = liczbaDniWlacznie({ od: z.od, do: koniec });
    if (wykorzystane + dni >= p.okresZasilkowyWCiazyDni) {
      return dodajDni(z.od, p.okresZasilkowyWCiazyDni - wykorzystane - 1);
    }
    wykorzystane += dni;
    poprzedniKoniec = koniec;
  }
  return null;
}

// --- Prawo do zasiłku ------------------------------------------------------------------------------

export interface WejscieUstaleniaPrawaZas53 {
  zaswiadczenie: ZaswiadczenieWnioskuZas53;
  kopia: DaneZKontaZus | null;
  wnioski: Wniosek[];
  /** Niezdolność jest skutkiem wypadku przy pracy, wypadku w drodze albo choroby zawodowej. */
  wypadek: boolean;
  /** Dzień wyczerpania okresu zasiłkowego, gdy jest znany z zewnątrz; bez niego liczy go kreator z e-ZLA. */
  dzienWyczerpaniaOkresu?: DataISO | null;
  parametry?: Partial<ParametryPrawaZas53>;
}

/** Kod B oznacza ciążę; zaświadczenie w trybie alternatywnym przyjmujemy jako wystawione w ciąży (wzór P29-22). */
export function czyStawkaPelna(z: ZaswiadczenieWnioskuZas53): boolean {
  return z.zrodlo === 'tryb-alternatywny' || z.kodyLiterowe.includes('B');
}

/**
 * Prawo do zasiłku chorobowego za okres zaświadczenia (0084, 0086, 0182, 0234, 0235, 0236, 0242).
 * Wynik blokujący (`blokuje`) zostawia matkę na ViewZas53Certificate z komunikatem.
 */
export function ustalPrawoZas53(w: WejscieUstaleniaPrawaZas53): UstaleniePrawaZas53 {
  const p: ParametryPrawaZas53 = { ...PARAMETRY_PRAWA_ZAS53, ...w.parametry };
  const z = w.zaswiadczenie;
  const tytuly = w.kopia?.tytuly ?? [];
  const ezla = w.kopia?.zaswiadczeniaEzla ?? [];
  const komunikaty: KomunikatZas53[] = [];
  const blokada = (k: KomunikatZas53, dodatkowe: Partial<UstaleniePrawaZas53> = {}): UstaleniePrawaZas53 => ({
    ...dodatkowe,
    kod: k.kod,
    parametry: k.parametry,
    komunikaty: [k],
    blokuje: true,
    poUstaniu: dodatkowe.poUstaniu ?? false,
  });

  const wD1 = tytulZChorobowymWDniu(tytuly, z.od);
  const wDk = tytulZChorobowymWDniu(tytuly, z.do);
  const ustaly = wDk ? undefined : tytulUstalyPrzed(tytuly, z.do);
  const poUstaniu = ustaly !== undefined;

  let od: DataISO = z.od;
  let tytul: TytulUbezpieczenia | undefined;
  let dzienNabyciaPrawa: DataISO | undefined;
  let dniWyczekiwania: 30 | 90 | undefined;
  let okresUbezpieczenia: WniosekZas53['okresUbezpieczenia'];
  let nieprzerwanaDni: number | undefined;

  if (ustaly) {
    const dzienUstania = koniecUbezpieczenia(ustaly) as DataISO;
    tytul = ustaly;
    okresUbezpieczenia = { rodzaj: 'po-ustaniu', dataUstania: dzienUstania };
    const ciaglosc = nieprzerwanaNiezdolnosc(z, ezla);
    nieprzerwanaDni = ciaglosc.dni;
    const wspolne = { poUstaniu: true, okresUbezpieczenia, nieprzerwanaDni } as const;
    if (porownajDaty(z.od, dzienUstania) > 0) {
      const kodE = z.kodyLiterowe.includes('E');
      const granica = kodE
        ? dodajMiesiace(dzienUstania, p.miesiaceOdUstaniaPrzyKodzieE)
        : dodajDni(dzienUstania, p.dniOdUstaniaDoPowstania);
      if (porownajDaty(z.od, granica) > 0) {
        return blokada({ kod: '0235', parametry: { dataUstania: formatujDate(dzienUstania), data: formatujDate(z.od) } }, wspolne);
      }
      if (ciaglosc.dni < p.minimalnaNiezdolnoscPoUstaniuDni) {
        return blokada({ kod: '0236', parametry: { liczbaDni: String(ciaglosc.dni) } }, wspolne);
      }
    }
    // Za niezdolność w okresie ubezpieczenia pracownika i zleceniobiorcy dokumenty przekazuje płatnik składek.
    if (ustaly.rodzaj !== 'dzialalnosc') od = maxData(z.od, dodajDni(dzienUstania, 1));
  } else {
    if (!wD1) return blokada({ kod: '0083' });
    tytul = wD1;
    okresUbezpieczenia = { rodzaj: 'w-ubezpieczeniu' };
    const poczatek = poczatekNieprzerwanegoUbezpieczenia(tytuly, z.od, p.przerwaWUbezpieczeniuDni) ?? poczatekUbezpieczenia(wD1);
    dniWyczekiwania = wD1.ubezpieczenieChorobowe.rodzaj === 'dobrowolne' ? p.dniWyczekiwaniaDobrowolne : p.dniWyczekiwaniaObowiazkowe;
    dzienNabyciaPrawa = w.wypadek ? poczatek : dodajDni(poczatek, dniWyczekiwania);
    if (porownajDaty(dzienNabyciaPrawa, z.do) > 0) {
      return blokada({ kod: '0084', parametry: { data: formatujDate(dzienNabyciaPrawa), liczbaDni: String(dniWyczekiwania) } });
    }
    if (porownajDaty(dzienNabyciaPrawa, z.od) > 0) {
      od = dzienNabyciaPrawa;
      komunikaty.push({ kod: '0084', parametry: { data: formatujDate(dzienNabyciaPrawa), liczbaDni: String(dniWyczekiwania) } });
    }
  }

  // Okres zasiłkowy w ciąży: 270 dni.
  const wyczerpanie =
    w.dzienWyczerpaniaOkresu !== undefined ? w.dzienWyczerpaniaOkresu : dzienWyczerpaniaOkresuZasilkowego(ezla, z.od, p);
  if (wyczerpanie !== null && porownajDaty(wyczerpanie, z.od) < 0) {
    return blokada({ kod: '0086' }, { poUstaniu, okresUbezpieczenia });
  }
  const doPrawa = wyczerpanie !== null ? minData(z.do, wyczerpanie) : z.do;

  // Kolejne zaświadczenie za nieprzerwaną niezdolność do pracy.
  const poprzedni = wyslaneWnioskiZas53(w.wnioski).find(
    (wn) => wn.zaswiadczenie !== undefined && dodajDni(wn.zaswiadczenie.do, 1) === z.od,
  );
  if (poprzedni) komunikaty.unshift({ kod: '0242' });

  const stawka = czyStawkaPelna(z) ? p.stawkaZKodemB : p.stawkaBezKoduB;
  if (stawka === p.stawkaBezKoduB) komunikaty.push({ kod: '0234' });

  // Zadłużenie z tytułu składek osoby prowadzącej działalność w dniu powstania prawa.
  let zadluzenie: WniosekZas53['zadluzenie'];
  if (tytul?.rodzaj === 'dzialalnosc') {
    const stan = [...(w.kopia?.stanyRozliczen ?? [])]
      .filter((s) => porownajDaty(s.dzien, od) <= 0)
      .sort((a, b) => porownajDaty(b.dzien, a.dzien))[0];
    if (stan && stan.kwotaZadluzenia > p.progZadluzenia) {
      const terminSplaty = dodajMiesiace(od, p.miesiaceSplatyZadluzenia);
      zadluzenie = { kwota: stan.kwotaZadluzenia, dzien: stan.dzien, prog: p.progZadluzenia, terminSplaty };
      komunikaty.push({ kod: '0182', parametry: { prog: formatujKwote(p.progZadluzenia), data: formatujDate(terminSplaty) } });
    }
  }

  return {
    zaswiadczenie: z,
    okresPrawa: { od, do: doPrawa },
    dzienNabyciaPrawa,
    dniWyczekiwania,
    stawka,
    okresUbezpieczenia,
    zadluzenie,
    kolejneZaswiadczenie: poprzedni ? { idPoprzedniegoWniosku: poprzedni.idWniosku } : undefined,
    platnik: tytul ? { nazwa: tytul.platnik.nazwa, nip: tytul.platnik.nip, regon: tytul.platnik.regon } : undefined,
    komunikaty,
    blokuje: false,
    poUstaniu,
    nieprzerwanaDni,
  };
}

// --- Kolejność ekranów -----------------------------------------------------------------------------

export function ekranyZas53(poUstaniu: boolean): IdWidoku[] {
  return poUstaniu
    ? ['ViewZas53Certificate', 'ViewZas53AfterInsurance', 'ViewZas53Data', 'ViewZas53Summary']
    : ['ViewZas53Certificate', 'ViewZas53Data', 'ViewZas53Summary'];
}

export function czyPoUstaniu(w: Pick<WniosekZas53, 'okresUbezpieczenia'>): boolean {
  return w.okresUbezpieczenia?.rodzaj === 'po-ustaniu';
}

// --- Załączniki ------------------------------------------------------------------------------------

export const ID_ZALACZNIKA_ZASWIADCZENIA = 'zaswiadczenie-tryb-alternatywny';
export const ID_ZALACZNIKA_WYPADKU = 'dokument-wypadku';
export const ID_ZALACZNIKA_Z10 = 'oswiadczenie-z10';

/**
 * Załączniki wniosku ZAS-53 do komunikatu 0149: plik zaświadczenia w trybie alternatywnym (wymagany), dokument
 * potwierdzający wypadek albo chorobę zawodową (plik opcjonalny) i oświadczenie Z-10 tworzone z odpowiedzi.
 * Pliki dołączone wcześniej zostają przy tej samej pozycji.
 */
export function zbudujZalaczniki(wniosek: WniosekZas53): Zalacznik[] {
  const poprzednie = new Map(wniosek.zalaczniki.map((z) => [z.id, z]));
  const zachowaj = (z: Zalacznik): Zalacznik => {
    const p = poprzednie.get(z.id);
    return p?.plik && p.opis === z.opis ? { ...z, plik: p.plik } : z;
  };
  const lista: Zalacznik[] = [];
  if (wniosek.zaswiadczenie?.zrodlo === 'tryb-alternatywny') {
    lista.push(zachowaj({ id: ID_ZALACZNIKA_ZASWIADCZENIA, rodzaj: 'zaswiadczenie-lekarskie', opis: wniosek.zaswiadczenie.seriaINumer ?? '', wymagany: true }));
  }
  if (wniosek.wypadek?.tak && wniosek.wypadek.dokument) {
    lista.push(zachowaj({ id: ID_ZALACZNIKA_WYPADKU, rodzaj: wniosek.wypadek.dokument.rodzaj, opis: wniosek.wypadek.dokument.numer, wymagany: false }));
  }
  if (czyPoUstaniu(wniosek) && wniosek.oswiadczenieZ10) {
    lista.push({ id: ID_ZALACZNIKA_Z10, rodzaj: 'oswiadczenie-z10', wymagany: false });
  }
  return lista;
}

/** Brak wymaganego pliku blokuje wysłanie wniosku. */
export function brakujeWymaganegoPliku(zalaczniki: Zalacznik[]): boolean {
  return zalaczniki.some((z) => z.wymagany && !z.plik);
}

/** Sprawa powiązana K26, gdy jej okres prawa nachodzi na okres wniosku. */
export function czyOkresyNachodza(a: Okres, b: Okres): boolean {
  return porownajDaty(a.od, b.do) <= 0 && porownajDaty(b.od, a.do) <= 0;
}

/** Pola szkicu wniosku z wyniku ustalenia prawa; pola bez wartości czyszczą poprzedni wynik. */
export function polaSzkicuZUstalenia(prawo: UstaleniePrawaZas53): Partial<WniosekZas53> {
  return {
    zaswiadczenie: prawo.zaswiadczenie,
    okresPrawa: prawo.okresPrawa,
    dzienNabyciaPrawa: prawo.dzienNabyciaPrawa,
    dniWyczekiwania: prawo.dniWyczekiwania,
    stawka: prawo.stawka,
    okresUbezpieczenia: prawo.okresUbezpieczenia,
    zadluzenie: prawo.zadluzenie,
    kolejneZaswiadczenie: prawo.kolejneZaswiadczenie,
    platnik: prawo.platnik,
  };
}
