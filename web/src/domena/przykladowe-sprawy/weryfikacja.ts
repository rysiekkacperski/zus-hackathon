// Weryfikacja przykładowej sprawy i dane do kalkulatora (kontrakt, sekcja 7.2).
// Właściciel: u21 (Przykładowe sprawy: weryfikacja i sprawdzenie wyliczeń).
// Reguły: wymagania Weryfikacja ubezpieczenia chorobowego, Płatnik zasiłku w sprawie, Podstawa wymiaru ze sprawy,
// Okres zasiłku ze sprawy i Wyliczenie wypłat epiku 3.4.3 (ANALIZY/13 sekcja 5).
import {
  dodajDni,
  dodajMiesiace,
  formatujDate,
  liczbaDniWlacznie,
  maxData,
  minData,
  miesiacZDaty,
  dodajMiesiaceDoMiesiaca,
  pierwszyDzienMiesiaca,
  porownajDaty,
  roznicaDni,
} from '@/domena/daty';
import { ID_KWOT } from '@/dane/katalog/slownik-kwot';
import { ID_WYMIAROW } from '@/dane/katalog/slownik-wymiarow';
import { formatujKwote, zaokraglijDoGrosza } from '@/domena/kwoty';
import { stawkaDzienna } from '@/domena/kalkulatory/rachunek';
import { wartoscObowiazujaca } from '@/domena/katalog/odczyt';
import type {
  DaneSprawy,
  DaneWejscioweKalkulatora,
  DataISO,
  DokumentSprawy,
  FormaZatrudnienia,
  Grosze,
  IdWpisuSlownika,
  Katalog,
  KodKomunikatu,
  LiczbaDzieci,
  MiesiacISO,
  Okres,
  OkresOtwarty,
  OkresScenariusza,
  PodstawaWymiaru,
  Procent,
  RodzajTytulu,
  RodzajUrlopu,
  WynikScenariusza,
  WynikWeryfikacjiSprawy,
} from '@/domena/typy';
import { teksty } from '@/teksty';
import type {
  OkresDoWyliczenia,
  RodzajZdarzeniaSprawy,
  RozszerzenieWeryfikacji,
  SwiadczenieSprawy,
  SzczegolWynikuSwiadczenia,
} from './rozszerzenia-typow';

// Typy rozszerzenia wyniku weryfikacji (kontrakt 12.3) leżą w ./rozszerzenia-typow.ts.
export type {
  OkresDoWyliczenia,
  RodzajZdarzeniaSprawy,
  RozszerzenieWeryfikacji,
  SwiadczenieSprawy,
  SzczegolWynikuSwiadczenia,
} from './rozszerzenia-typow';

// --- Stałe z wymagań epiku (wartości domyślne, gdy katalog nie zawiera wpisu) -------------------

const DNI_CIAZY = 280;
const PRZERWA_LACZENIA_DNI = 30;
const ZASILEK_PO_USTANIU_DNI_OD_USTANIA = 14;
const ZASILEK_PO_USTANIU_MIN_DNI = 30;
const DNI_PRZED_TERMINEM = 42;
const TERMIN_WNIOSKU_81_5_DNI = 21;
const MIESIACE_SPLATY_ZADLUZENIA = 6;
const MIESIACE_PODSTAWY = 12;
const TYGODNIE_URLOPU_MACIERZYNSKIEGO: Record<LiczbaDzieci, number> = { 1: 20, 2: 31, 3: 33, 4: 35, 5: 37 };
const TYGODNIE_RODZICIELSKIEGO_MATKI_81_5 = { jedno: 32, wiecej: 34, zaZyciemJedno: 56, zaZyciemWiecej: 58 };
const TYGODNIE_PO_MARTWYM_URODZENIU = 8;
const DNI_OJCOWSKIEGO = 14;

const DOMYSLNE = {
  pomniejszenieProcent: 13.71,
  minimalnaPodstawaGrosze: 414710,
  najnizszaPodstawaJdgGrosze: 565200,
  progZadluzeniaGrosze: 4806,
  swiadczenieRodzicielskieGrosze: 100000,
  wyczekiwanieObowiazkowe: 30,
  wyczekiwanieDobrowolne: 90,
  liczbaUbezpieczonych: 20,
} as const;

const T = teksty.ViewSampleCaseVerification.reguly;

// --- Odczyt słowników katalogu ---------------------------------------------------------------

interface WartoscZeSlownika {
  wartosc: number;
  od: DataISO;
}

/**
 * Wartość wariantu `klucz` wpisu słownika `idWpisu` obowiązująca w dniu `dzien`. Kwoty (jednostka 'zl') są
 * w groszach. Bez wpisu albo wersji zwracamy wartość domyślną z wymagań z datą uruchomienia katalogu.
 */
function zeSlownika(k: Katalog, idWpisu: IdWpisuSlownika, klucz: string, dzien: DataISO, domyslna: number): WartoscZeSlownika {
  const obowiazujaca = wartoscObowiazujaca(k, idWpisu, dzien, klucz);
  if (obowiazujaca === null || !Number.isFinite(obowiazujaca.wartosc)) return { wartosc: domyslna, od: k.dataUruchomienia };
  return { wartosc: obowiazujaca.wartosc, od: obowiazujaca.od };
}

/** Wartości słowników obowiązujące w dniu zdarzenia, z których korzysta epik. */
export interface WartosciSlownikowSprawy {
  pomniejszenie: WartoscZeSlownika;
  minimalnaPodstawa: WartoscZeSlownika;
  najnizszaPodstawaJdg: WartoscZeSlownika;
  progZadluzenia: WartoscZeSlownika;
  swiadczenieRodzicielskie: WartoscZeSlownika;
  wyczekiwanieObowiazkowe: WartoscZeSlownika;
  wyczekiwanieDobrowolne: WartoscZeSlownika;
  liczbaUbezpieczonych: WartoscZeSlownika;
}

export function wartosciSlownikow(k: Katalog, dzien: DataISO): WartosciSlownikowSprawy {
  return {
    pomniejszenie: zeSlownika(k, ID_KWOT.pomniejszeniePodstawy, 'procent', dzien, DOMYSLNE.pomniejszenieProcent),
    minimalnaPodstawa: zeSlownika(k, ID_KWOT.minimalnaPodstawaPelnyEtat, 'kwota', dzien, DOMYSLNE.minimalnaPodstawaGrosze),
    najnizszaPodstawaJdg: zeSlownika(k, ID_KWOT.najnizszaPodstawaJdg, 'kwota', dzien, DOMYSLNE.najnizszaPodstawaJdgGrosze),
    progZadluzenia: zeSlownika(k, ID_KWOT.progZadluzeniaJdg, 'kwota', dzien, DOMYSLNE.progZadluzeniaGrosze),
    swiadczenieRodzicielskie: zeSlownika(k, ID_KWOT.swiadczenieRodzicielskie, 'kwota', dzien, DOMYSLNE.swiadczenieRodzicielskieGrosze),
    wyczekiwanieObowiazkowe: zeSlownika(k, ID_WYMIAROW.okresWyczekiwania, 'obowiazkowe', dzien, DOMYSLNE.wyczekiwanieObowiazkowe),
    wyczekiwanieDobrowolne: zeSlownika(k, ID_WYMIAROW.okresWyczekiwania, 'dobrowolne', dzien, DOMYSLNE.wyczekiwanieDobrowolne),
    liczbaUbezpieczonych: zeSlownika(k, ID_WYMIAROW.liczbaUbezpieczonychPlatnika, 'osoby', dzien, DOMYSLNE.liczbaUbezpieczonych),
  };
}

// --- Pomocnicze odczyty danych sprawy -----------------------------------------------------------

export interface ZdarzenieSprawy {
  data: DataISO;
  rodzaj: RodzajZdarzeniaSprawy;
}

const RODZAJE_MACIERZYNSKIE: readonly RodzajUrlopu[] = ['macierzynski', 'czesc-przed-porodem', 'przejety-macierzynski'];

function czyOjciec(d: DaneSprawy): boolean {
  return d.ubezpieczony.rola.wartosc === 'ojciec-przejmujacy';
}

function swiadczeniaZWniosku(d: DaneSprawy): SwiadczenieSprawy[] {
  const zWniosku = d.wniosek.swiadczenia.wartosc ?? [];
  if (zWniosku.length > 0) return [...new Set(zWniosku)];
  return d.zdarzenie.rodzaj.wartosc === 'niezdolnosc' ? ['zasilek-chorobowy'] : ['zasilek-macierzynski'];
}

function dataPorodu(d: DaneSprawy): DataISO | null {
  return d.zdarzenie.dataPorodu.wartosc ?? null;
}

function dataPorodowa(d: DaneSprawy): DataISO | null {
  return d.zdarzenie.dataPorodu.wartosc ?? d.zdarzenie.przewidywanyTermin.wartosc ?? null;
}

function okresyZWniosku(d: DaneSprawy): { rodzajUrlopu: RodzajUrlopu; od: DataISO; do: DataISO }[] {
  return [...(d.wniosek.okresy.wartosc ?? [])].sort((a, b) => porownajDaty(a.od, b.od));
}

/** Data zdarzenia (R-W0): poród, przewidywany termin, pierwszy dzień niezdolności albo okresu ojca. */
export function ustalZdarzenie(d: DaneSprawy): ZdarzenieSprawy | null {
  if (czyOjciec(d)) {
    const pierwszy = okresyZWniosku(d)[0];
    if (pierwszy !== undefined) return { data: pierwszy.od, rodzaj: 'okres-ojca' };
  }
  const niezdolnosc = d.zdarzenie.niezdolnosc.wartosc;
  if (d.zdarzenie.rodzaj.wartosc === 'niezdolnosc' && niezdolnosc !== null) return { data: niezdolnosc.od, rodzaj: 'niezdolnosc' };
  const porod = dataPorodu(d);
  if (porod !== null) return { data: porod, rodzaj: 'porod' };
  const termin = d.zdarzenie.przewidywanyTermin.wartosc;
  if (termin !== null) return { data: termin, rodzaj: 'przewidywany-termin' };
  if (niezdolnosc !== null) return { data: niezdolnosc.od, rodzaj: 'niezdolnosc' };
  return null;
}

/** Okres ciąży: 280 dni przed datą porodu albo przewidywanym terminem do tej daty. */
export function okresCiazySprawy(d: DaneSprawy): Okres | undefined {
  const data = dataPorodowa(d);
  return data === null ? undefined : { od: dodajDni(data, -DNI_CIAZY), do: data };
}

/** Okresy podlegania z datą ustania z ZAS-12 przy trwającym tytule, posortowane. */
function okresyPodlegania(d: DaneSprawy): OkresOtwarty[] {
  const okresy = [...(d.ubezpieczenieChorobowe.okresy.wartosc ?? [])].sort((a, b) => porownajDaty(a.od, b.od));
  const ustanie = d.ubezpieczenieChorobowe.dataUstaniaPrzyTrwajacymTytule.wartosc;
  if (ustanie !== null && okresy.length > 0) {
    const ostatni = okresy[okresy.length - 1];
    if (ostatni.do === undefined) okresy[okresy.length - 1] = { od: ostatni.od, do: ustanie };
  }
  return okresy;
}

function koniecOkresow(okresy: OkresOtwarty[]): DataISO | null {
  if (okresy.length === 0) return null;
  const ostatni = okresy[okresy.length - 1];
  return ostatni.do ?? null;
}

interface LancuchOkresow {
  okresy: OkresOtwarty[];
  dni: number;
  doDnia: DataISO;
  pominiety?: { koniec: DataISO; przerwa: number };
}

/** Okresy połączone przy przerwie do 30 dni, rozpoczęte przed datą zdarzenia, policzone do dnia przed zdarzeniem. */
function polaczoneOkresy(okresy: OkresOtwarty[], zdarzenie: DataISO): LancuchOkresow | null {
  const przed = okresy.filter((o) => porownajDaty(o.od, zdarzenie) < 0);
  if (przed.length === 0) return null;
  let lancuch: OkresOtwarty[] = [przed[0]];
  let pominiety: LancuchOkresow['pominiety'];
  for (let i = 1; i < przed.length; i += 1) {
    const poprzedni = lancuch[lancuch.length - 1];
    const koniec = poprzedni.do;
    const przerwa = koniec === undefined ? 0 : roznicaDni(koniec, przed[i].od) - 1;
    if (koniec !== undefined && przerwa > PRZERWA_LACZENIA_DNI) {
      pominiety = { koniec, przerwa };
      lancuch = [przed[i]];
    } else {
      lancuch.push(przed[i]);
    }
  }
  const dzienPrzed = dodajDni(zdarzenie, -1);
  let dni = 0;
  let doDnia = lancuch[0].od;
  for (const o of lancuch) {
    const koniec = o.do === undefined ? dzienPrzed : minData(o.do, dzienPrzed);
    if (porownajDaty(koniec, o.od) < 0) continue;
    dni += liczbaDniWlacznie({ od: o.od, do: koniec });
    doDnia = koniec;
  }
  return { okresy: lancuch, dni, doDnia, pominiety };
}

/** Dzień, w którym suma dni ubezpieczenia w łańcuchu osiąga `n`. */
function dzienUplywu(lancuch: OkresOtwarty[], n: number): DataISO | null {
  let zostalo = n;
  for (const o of lancuch) {
    const dlugosc = o.do === undefined ? Number.POSITIVE_INFINITY : liczbaDniWlacznie({ od: o.od, do: o.do });
    if (zostalo <= dlugosc) return dodajDni(o.od, zostalo - 1);
    zostalo -= dlugosc;
  }
  return null;
}

export function formaZTytulu(tytul: RodzajTytulu | 'brak-tytulu' | null): FormaZatrudnienia {
  if (tytul === 'pracownik') return 'umowa-o-prace';
  if (tytul === 'zleceniobiorca') return 'umowa-zlecenia';
  if (tytul === 'dzialalnosc') return 'jdg';
  return 'brak-tytulu';
}

function okresSlownie(od: DataISO | null, do_: DataISO | null): string {
  if (od === null) return do_ === null ? '' : T.okresDo({ do: formatujDate(do_) });
  return do_ === null ? T.okresOd({ od: formatujDate(od) }) : T.okresOdDo({ od: formatujDate(od), do: formatujDate(do_) });
}

function nazwaZdarzenia(z: ZdarzenieSprawy): string {
  return T.zdarzenia[z.rodzaj];
}

// --- Warunki weryfikacji ------------------------------------------------------------------------

type WynikWarunku = WynikWeryfikacjiSprawy['warunki'][number]['wynik'];
type Warunek = WynikWeryfikacjiSprawy['warunki'][number];

function warunek(numer: number, wynik: WynikWarunku, uzasadnienie: string): Warunek {
  return { numer, nazwa: T.nazwyWarunkow[numer - 1], wynik, uzasadnienie };
}

const PRZYCZYNY_ZM: readonly string[] = ['upadlosc', 'likwidacja', 'smierc-pracodawcy', 'naruszenie-z-wyrokiem'];
const PRZYCZYNY_ZWZM: readonly string[] = ['upadlosc', 'likwidacja', 'smierc-pracodawcy'];

interface OcenaUstania {
  zm: boolean;
  zwzm: boolean;
  zch: boolean;
  okresZwzm?: Okres;
  uzasadnienie: string;
}

interface StanWeryfikacji {
  d: DaneSprawy;
  zdarzenie: ZdarzenieSprawy;
  okresy: OkresOtwarty[];
  koniec: DataISO | null;
  ciaza?: Okres;
  tytul: RodzajTytulu | 'brak-tytulu' | null;
  rodzajUbezpieczenia: DaneSprawy['ubezpieczenieChorobowe']['rodzaj']['wartosc'];
  swiadczenia: SwiadczenieSprawy[];
  slowniki: WartosciSlownikowSprawy;
  lancuch: LancuchOkresow | null;
  wyczekiwanie?: { n: number; od: DataISO; uplyw: DataISO | null; prawoOd: DataISO | null; spelniony: boolean };
}

function niezdolnoscCiagla(d: DaneSprawy): Okres | null {
  const pierwszy = d.zdarzenie.niezdolnosc.wartosc;
  if (pierwszy === null) return null;
  let koniec = pierwszy.do;
  for (const dalszy of [...(d.zdarzenie.dalszeOkresy.wartosc ?? [])].sort((a, b) => porownajDaty(a.od, b.od))) {
    if (porownajDaty(dalszy.od, dodajDni(koniec, 1)) <= 0) koniec = maxData(koniec, dalszy.do);
  }
  return { od: pierwszy.od, do: koniec };
}

function warunek1(s: StanWeryfikacji): Warunek {
  if (s.tytul === null || s.tytul === 'brak-tytulu') return warunek(1, 'niespelniony', T.w1.niespelniony);
  const okres = okresSlownie(s.d.tytul.od.wartosc, s.d.tytul.dataUstania.wartosc);
  const tekst = `${T.tytuly[s.tytul]} ${okres}.`;
  return warunek(1, 'spelniony', `${tekst} ${s.d.tytul.dataUstania.wartosc === null ? T.w1.trwa[s.tytul] : T.w1.ustal}`);
}

function warunek2(s: StanWeryfikacji): Warunek {
  const rodzaj = s.rodzajUbezpieczenia;
  const pierwszy = s.okresy[0];
  const okres = pierwszy === undefined ? '' : ` ${okresSlownie(pierwszy.od, koniecOkresow(s.okresy))}`;
  if (s.tytul === null || s.tytul === 'brak-tytulu' || rodzaj === null) {
    return warunek(2, 'niespelniony', T.w2.brakTytulu);
  }
  const wymagany = s.tytul === 'pracownik' ? 'obowiazkowe' : 'dobrowolne';
  if (rodzaj === wymagany) {
    return warunek(2, 'spelniony', `${T.rodzajeUbezpieczenia[rodzaj]}${okres}. ${T.w2.spelniony[s.tytul]}`);
  }
  return warunek(
    2,
    'niespelniony',
    T.w2.niespelniony({ rodzaj: T.rodzajeUbezpieczeniaMale[rodzaj], tytul: T.tytuly[s.tytul], wymagany: T.rodzajeUbezpieczeniaMale[wymagany] }),
  );
}

function warunek3(s: StanWeryfikacji): Warunek {
  if (s.rodzajUbezpieczenia === 'brak') return warunek(3, 'nie-dotyczy', T.w3.nieDotyczy);
  const l = s.lancuch;
  if (l === null) return warunek(3, 'niespelniony', T.w3.niespelniony({ data: formatujDate(s.zdarzenie.data) }));
  const pierwszy = l.okresy[0];
  const ostatni = l.okresy[l.okresy.length - 1];
  const okres = okresSlownie(pierwszy.od, l.okresy.length === 1 ? (ostatni.do ?? null) : null);
  let tekst =
    l.okresy.length > 1
      ? T.w3.polaczone({ liczba: String(l.okresy.length), dni: String(l.dni), od: formatujDate(pierwszy.od), doDnia: formatujDate(l.doDnia), przerwa: String(PRZERWA_LACZENIA_DNI) })
      : T.w3.jeden({ okres, dni: String(l.dni), od: formatujDate(pierwszy.od), doDnia: formatujDate(l.doDnia), przerwa: String(PRZERWA_LACZENIA_DNI) });
  if (l.pominiety !== undefined) {
    tekst = `${tekst} ${T.w3.pominiety({ koniec: formatujDate(l.pominiety.koniec), przerwa: String(l.pominiety.przerwa) })}`;
  }
  return warunek(3, 'spelniony', tekst);
}

function ocenWyczekiwanie(s: StanWeryfikacji): StanWeryfikacji['wyczekiwanie'] {
  if (!s.swiadczenia.includes('zasilek-chorobowy') || s.lancuch === null) return undefined;
  const dobrowolne = s.rodzajUbezpieczenia === 'dobrowolne';
  const slownik = dobrowolne ? s.slowniki.wyczekiwanieDobrowolne : s.slowniki.wyczekiwanieObowiazkowe;
  const uplyw = dzienUplywu(s.lancuch.okresy, slownik.wartosc);
  const prawoOd = uplyw === null ? null : dodajDni(uplyw, 1);
  const spelniony = prawoOd !== null && porownajDaty(s.zdarzenie.data, prawoOd) >= 0;
  return { n: slownik.wartosc, od: slownik.od, uplyw, prawoOd, spelniony };
}

function warunek4(s: StanWeryfikacji): Warunek {
  if (!s.swiadczenia.includes('zasilek-chorobowy')) {
    return warunek(4, 'nie-dotyczy', s.swiadczenia.includes('zwzm') ? T.w4.nieDotyczyZwzm : T.w4.nieDotyczy);
  }
  const w = s.wyczekiwanie;
  if (s.rodzajUbezpieczenia === 'brak' || s.lancuch === null || w === undefined) return warunek(4, 'niespelniony', T.w4.brakOkresow);
  const rodzaj = s.rodzajUbezpieczenia === 'dobrowolne' ? T.w4.dobrowolnego : T.w4.obowiazkowego;
  const parametry = {
    n: String(w.n),
    rodzaj,
    uplyw: w.uplyw === null ? '' : formatujDate(w.uplyw),
    prawoOd: w.prawoOd === null ? '' : formatujDate(w.prawoOd),
    niezdolnoscOd: formatujDate(s.zdarzenie.data),
    odSlownika: formatujDate(w.od),
  };
  return w.spelniony ? warunek(4, 'spelniony', T.w4.spelniony(parametry)) : warunek(4, 'niespelniony', T.w4.niespelniony(parametry));
}

function warunek5(s: StanWeryfikacji): Warunek {
  const zdarzenie = `${nazwaZdarzenia(s.zdarzenie)} ${formatujDate(s.zdarzenie.data)}`;
  if (s.rodzajUbezpieczenia === 'brak') return warunek(5, 'niespelniony', T.w5.brak({ data: formatujDate(s.zdarzenie.data) }));
  const zawierajacy = s.okresy.find(
    (o) => porownajDaty(o.od, s.zdarzenie.data) <= 0 && (o.do === undefined || porownajDaty(s.zdarzenie.data, o.do) <= 0),
  );
  if (zawierajacy !== undefined) {
    return warunek(5, 'spelniony', T.w5.spelniony({ zdarzenie, okres: okresSlownie(zawierajacy.od, zawierajacy.do ?? null) }));
  }
  if (s.koniec !== null && porownajDaty(s.zdarzenie.data, s.koniec) > 0) {
    return warunek(5, 'niespelniony', T.w5.poKoncu({ zdarzenie, koniec: formatujDate(s.koniec) }));
  }
  return warunek(5, 'niespelniony', T.w5.przedPoczatkiem({ zdarzenie }));
}

function ocenUstanie(s: StanWeryfikacji): OcenaUstania | null {
  const koniec = s.koniec;
  if (koniec === null || porownajDaty(s.zdarzenie.data, koniec) <= 0 || s.rodzajUbezpieczenia === 'brak') return null;
  const d = s.d;
  const przyczyna = d.ustanieZatrudnienia.przyczyna.wartosc;
  const wCiazy = s.ciaza !== undefined && porownajDaty(s.ciaza.od, koniec) <= 0 && porownajDaty(koniec, s.ciaza.do) <= 0;
  const pracownica = s.tytul === 'pracownik' && !czyOjciec(d);
  const zm = pracownica && wCiazy && przyczyna !== null && PRZYCZYNY_ZM.includes(przyczyna);
  const zwzm = pracownica && wCiazy && przyczyna !== null && PRZYCZYNY_ZWZM.includes(przyczyna) && d.ustanieZatrudnienia.inneZatrudnienie.wartosc !== true;
  const porod = dataPorodu(d);
  const okresZwzm = zwzm && porod !== null ? { od: dodajDni(koniec, 1), do: dodajDni(porod, -1) } : undefined;

  const niezdolnosc = niezdolnoscCiagla(d);
  let zch = false;
  let tekstZch = '';
  if (s.swiadczenia.includes('zasilek-chorobowy') && niezdolnosc !== null) {
    const trwa = liczbaDniWlacznie(niezdolnosc);
    const poUstaniu = roznicaDni(koniec, niezdolnosc.od);
    const wCzasie = porownajDaty(niezdolnosc.od, koniec) <= 0 && porownajDaty(niezdolnosc.do, koniec) > 0;
    const krotkoPo = poUstaniu > 0 && poUstaniu <= ZASILEK_PO_USTANIU_DNI_OD_USTANIA && trwa >= ZASILEK_PO_USTANIU_MIN_DNI;
    const bezPracy = d.pracaPoUstaniu.wartosc !== true;
    const wyczekiwanie = s.wyczekiwanie?.spelniony === true;
    zch = (wCzasie || krotkoPo) && bezPracy && wyczekiwanie;
    const parametry = { dniPo: String(poUstaniu), trwa: String(trwa), ustanie: formatujDate(koniec), limit: String(ZASILEK_PO_USTANIU_DNI_OD_USTANIA), min: String(ZASILEK_PO_USTANIU_MIN_DNI) };
    tekstZch = zch ? (wCzasie ? T.w6.zchWCzasie(parametry) : T.w6.zchPo(parametry)) : T.w6.zchNiespelniony(parametry);
  }

  const czesci: string[] = [];
  if (s.swiadczenia.includes('zasilek-macierzynski') || s.swiadczenia.includes('zwzm')) {
    if (zm || zwzm) {
      const opisPrzyczyny = przyczyna === null ? '' : T.przyczynyUstania[przyczyna as keyof typeof T.przyczynyUstania] ?? '';
      czesci.push(T.w6.ustaloWCiazy({ data: formatujDate(koniec), przyczyna: opisPrzyczyny }));
      if (zwzm && okresZwzm !== undefined && s.swiadczenia.includes('zwzm')) {
        czesci.push(T.w6.zwzmOkres({ od: formatujDate(okresZwzm.od), do: formatujDate(okresZwzm.do) }));
      }
      if (zm && s.swiadczenia.includes('zasilek-macierzynski')) czesci.push(T.w6.zmOdPorodu);
    } else {
      const przedZdarzeniem = T.w6.ustaloPrzed({ data: formatujDate(koniec), zdarzenia: T.zdarzeniaDopelniacz[s.zdarzenie.rodzaj] });
      czesci.push(`${przedZdarzeniem} ${T.w6.zmTylkoPracownica}`);
    }
  }
  if (tekstZch !== '') czesci.push(tekstZch);
  return { zm, zwzm, zch, okresZwzm, uzasadnienie: czesci.join(' ') };
}

function warunek6(s: StanWeryfikacji, ocena: OcenaUstania | null): Warunek {
  if (s.rodzajUbezpieczenia === 'brak') return warunek(6, 'nie-dotyczy', T.w6.nieDotyczyBrak);
  if (ocena === null) return warunek(6, 'nie-dotyczy', T.w6.nieDotyczy({ zdarzenia: T.zdarzeniaDopelniacz[s.zdarzenie.rodzaj] }));
  const spelniony =
    (s.swiadczenia.includes('zasilek-macierzynski') && ocena.zm) ||
    (s.swiadczenia.includes('zwzm') && ocena.zwzm) ||
    (s.swiadczenia.includes('zasilek-chorobowy') && ocena.zch);
  return warunek(6, spelniony ? 'spelniony' : 'niespelniony', ocena.uzasadnienie);
}

function warunek7(s: StanWeryfikacji): Warunek {
  if (s.tytul !== 'dzialalnosc') {
    const tytul = s.tytul === null || s.tytul === 'brak-tytulu' ? T.tytulyDopelniacz['brak-tytulu'] : T.tytulyDopelniacz[s.tytul];
    return warunek(7, 'nie-dotyczy', T.w7.nieDotyczy({ tytul }));
  }
  const zadluzenie = s.d.zadluzenieJdg.wartosc;
  if (zadluzenie === null) return warunek(7, 'brak-danych', T.w7.brakDanych);
  const prog = s.slowniki.progZadluzenia;
  const parametry = {
    kwota: formatujKwote(zadluzenie.kwota),
    data: formatujDate(zadluzenie.dzien ?? s.zdarzenie.data),
    prog: formatujKwote(prog.wartosc),
    odSlownika: formatujDate(prog.od),
    dzienZdarzenia: formatujDate(s.zdarzenie.data),
    terminSplaty: formatujDate(dodajMiesiace(s.zdarzenie.data, MIESIACE_SPLATY_ZADLUZENIA)),
  };
  return zadluzenie.kwota <= prog.wartosc ? warunek(7, 'spelniony', T.w7.spelniony(parametry)) : warunek(7, 'niespelniony', T.w7.niespelniony(parametry));
}

function warunek8(s: StanWeryfikacji): Warunek {
  if (czyOjciec(s.d)) return warunek(8, 'nie-dotyczy', T.w8.nieDotyczy);
  const od = s.d.tytul.od.wartosc;
  if (s.ciaza === undefined || od === null) return warunek(8, 'brak-danych', T.w8.brakDanych);
  const parametry = { od: formatujDate(od), ciazaOd: formatujDate(s.ciaza.od) };
  if (porownajDaty(od, s.ciaza.od) >= 0 && porownajDaty(od, s.ciaza.do) <= 0) return warunek(8, 'ostrzezenie', T.w8.ostrzezenie(parametry));
  return warunek(8, 'spelniony', T.w8.spelniony(parametry));
}

// --- Płatnik zasiłku ---------------------------------------------------------------------------

type PlatnikWyniku = 'zus' | 'platnik-skladek' | 'nieustalony';

function ustalPlatnika(s: StanWeryfikacji, poUstaniu: boolean): { platnik: PlatnikWyniku; uzasadnienie: string } {
  const odSlownika = formatujDate(s.slowniki.liczbaUbezpieczonych.od);
  const liczba = String(s.slowniki.liczbaUbezpieczonych.wartosc);
  if (s.tytul === 'dzialalnosc') return { platnik: 'zus', uzasadnienie: T.platnik.jdg };
  if (poUstaniu) return { platnik: 'zus', uzasadnienie: T.platnik.poUstaniu };
  if (s.tytul === null || s.tytul === 'brak-tytulu') return { platnik: 'nieustalony', uzasadnienie: T.platnik.brakTytulu };
  const zgloszeni = s.d.liczbaUbezpieczonychPlatnika.wartosc;
  if (zgloszeni === 'powyzej-20') return { platnik: 'platnik-skladek', uzasadnienie: T.platnik.powyzej({ liczba, odSlownika }) };
  if (zgloszeni === 'do-20') return { platnik: 'zus', uzasadnienie: T.platnik.doLiczby({ liczba, odSlownika }) };
  return { platnik: 'nieustalony', uzasadnienie: T.platnik.nieustalony };
}

// --- Okres zasiłku za urlop macierzyński i komunikaty 0226, 0227 -------------------------------

/** Początek okresu urlopu macierzyńskiego z wniosku po korekcie do 42 dni przed przewidywanym terminem porodu. */
export function okresDoWyliczenia(d: DaneSprawy, dokumenty: readonly DokumentSprawy[] = []): OkresDoWyliczenia | undefined {
  const okres = okresyZWniosku(d).find((o) => RODZAJE_MACIERZYNSKIE.includes(o.rodzajUrlopu));
  if (okres === undefined) return undefined;
  const termin = d.zdarzenie.przewidywanyTermin.wartosc;
  const porod = dataPorodowa(d);
  const zaswiadczenieOTerminie = dokumenty.some((dok) => dok.rodzaj === 'zaswiadczenie-o-terminie-porodu');
  let od = okres.od;
  let skorygowany = false;
  if (termin !== null && porod !== null && porownajDaty(okres.od, porod) < 0) {
    const najwczesniej = dodajDni(termin, -DNI_PRZED_TERMINEM);
    if (porownajDaty(okres.od, najwczesniej) < 0) {
      od = najwczesniej;
      skorygowany = true;
    }
  }
  return { rodzajUrlopu: okres.rodzajUrlopu, odZWniosku: okres.od, od, skorygowany, zaswiadczenieOTerminie };
}

function czyPrzedPorodem(d: DaneSprawy, okres: OkresDoWyliczenia | undefined): boolean {
  const porod = dataPorodowa(d);
  return okres !== undefined && porod !== null && porownajDaty(okres.odZWniosku, porod) < 0;
}

// --- Weryfikacja --------------------------------------------------------------------------------

/** Braki danych potrzebnych do weryfikacji (R-W00) jako ścieżki pól danych sprawy z kodem 0109. */
export function brakiDoWeryfikacji(d: DaneSprawy): Record<string, '0109'> {
  const braki: Record<string, '0109'> = {};
  if (d.tytul.rodzaj.wartosc === null) braki['tytul.rodzaj'] = '0109';
  const rodzaj = d.ubezpieczenieChorobowe.rodzaj.wartosc;
  if ((rodzaj === 'obowiazkowe' || rodzaj === 'dobrowolne') && (d.ubezpieczenieChorobowe.okresy.wartosc ?? []).length === 0) {
    braki['ubezpieczenieChorobowe.okresy'] = '0109';
  }
  if (ustalZdarzenie(d) === null) {
    braki[d.zdarzenie.rodzaj.wartosc === 'niezdolnosc' ? 'zdarzenie.niezdolnosc' : 'zdarzenie.dataPorodu'] = '0109';
  }
  return braki;
}

/** Osiem warunków prawa do świadczeń z ubezpieczenia chorobowego (0226, 0227). */
export function weryfikujUbezpieczenieChorobowe(
  dane: DaneSprawy,
  katalog: Katalog,
  dokumenty: readonly DokumentSprawy[] = [],
): WynikWeryfikacjiSprawy {
  const zdarzenie = ustalZdarzenie(dane);
  if (zdarzenie === null) {
    return { dataZdarzenia: { data: '', rodzaj: '' }, warunki: [], wyniki: [], porownanie: [], komunikaty: ['0109'], czas: '' };
  }
  const okresy = okresyPodlegania(dane);
  const s: StanWeryfikacji = {
    d: dane,
    zdarzenie,
    okresy,
    koniec: koniecOkresow(okresy),
    ciaza: okresCiazySprawy(dane),
    tytul: dane.tytul.rodzaj.wartosc,
    rodzajUbezpieczenia: dane.ubezpieczenieChorobowe.rodzaj.wartosc,
    swiadczenia: swiadczeniaZWniosku(dane),
    slowniki: wartosciSlownikow(katalog, zdarzenie.data),
    lancuch: polaczoneOkresy(okresy, zdarzenie.data),
  };
  s.wyczekiwanie = ocenWyczekiwanie(s);
  const ocena = ocenUstanie(s);
  const warunki = [warunek1(s), warunek2(s), warunek3(s), warunek4(s), warunek5(s), warunek6(s, ocena), warunek7(s), warunek8(s)];
  const wynikWarunku = (n: number) => warunki[n - 1].wynik;
  const poUstaniu = ocena !== null;
  const platnik = ustalPlatnika(s, poUstaniu);

  const wyniki: WynikWeryfikacjiSprawy['wyniki'] = [];
  const szczegoly: SzczegolWynikuSwiadczenia[] = [];
  const kolejnosc: SwiadczenieSprawy[] = ['zwzm', 'zasilek-macierzynski', 'zasilek-chorobowy'];
  for (const swiadczenie of kolejnosc.filter((sw) => s.swiadczenia.includes(sw))) {
    const ustanieSpelnione =
      ocena !== null && (swiadczenie === 'zwzm' ? ocena.zwzm : swiadczenie === 'zasilek-macierzynski' ? ocena.zm : ocena.zch);
    const sprawdzane = swiadczenie === 'zwzm' ? [1, 2, 6] : swiadczenie === 'zasilek-macierzynski' ? [1, 2, 7, 5, 6] : [1, 2, 7, 4, 5, 6];
    let przysluguje = wynikWarunku(1) !== 'niespelniony' && wynikWarunku(2) !== 'niespelniony';
    if (swiadczenie === 'zwzm') przysluguje = przysluguje && ustanieSpelnione;
    else przysluguje = przysluguje && wynikWarunku(7) !== 'niespelniony' && (wynikWarunku(5) === 'spelniony' || ustanieSpelnione);
    const szczegol: SzczegolWynikuSwiadczenia = { swiadczenie };
    let od: DataISO | undefined;
    let przyczyna: string | undefined;
    let prawo: 'przysluguje' | 'nie-przysluguje' = przysluguje ? 'przysluguje' : 'nie-przysluguje';

    if (swiadczenie === 'zasilek-chorobowy' && przysluguje && s.wyczekiwanie !== undefined && !s.wyczekiwanie.spelniony) {
      // Okres wyczekiwania upływa w trakcie albo po niezdolności do pracy.
      const niezdolnosc = niezdolnoscCiagla(dane);
      const prawoOd = s.wyczekiwanie.prawoOd;
      od = prawoOd ?? undefined;
      if (niezdolnosc !== null && prawoOd !== null && porownajDaty(prawoOd, niezdolnosc.do) <= 0) {
        prawo = 'przysluguje';
      } else {
        prawo = 'nie-przysluguje';
        if (niezdolnosc !== null) szczegol.okresBezPrawa = niezdolnosc;
        szczegol.numerWarunkuPrzyczyny = 4;
        przyczyna = T.przyczyny.wyczekiwanie({
          od: niezdolnosc === null ? '' : formatujDate(niezdolnosc.od),
          do: niezdolnosc === null ? '' : formatujDate(niezdolnosc.do),
          prawoOd: prawoOd === null ? '' : formatujDate(prawoOd),
        });
      }
    } else if (prawo === 'przysluguje') {
      if (swiadczenie === 'zwzm' && ocena?.okresZwzm !== undefined) {
        od = ocena.okresZwzm.od;
        szczegol.do = ocena.okresZwzm.do;
      } else if (swiadczenie === 'zasilek-macierzynski' && ustanieSpelnione) {
        od = dataPorodu(dane) ?? zdarzenie.data;
      } else if (swiadczenie === 'zasilek-chorobowy' && s.wyczekiwanie?.prawoOd !== undefined && s.wyczekiwanie.prawoOd !== null && s.wyczekiwanie.spelniony) {
        od = zdarzenie.data;
      }
    } else {
      const pierwszy = sprawdzane.find((n) => {
        if (n === 6) return !ustanieSpelnione && (swiadczenie === 'zwzm' || wynikWarunku(5) !== 'spelniony');
        if (n === 5) return wynikWarunku(5) !== 'spelniony' && !ustanieSpelnione;
        return wynikWarunku(n) === 'niespelniony';
      });
      const numer = pierwszy ?? 6;
      szczegol.numerWarunkuPrzyczyny = numer;
      przyczyna = numer === 7 ? T.przyczyny.zadluzenie : T.przyczyny.warunek({ numer: String(numer), nazwa: T.nazwyWarunkow[numer - 1] });
      if (swiadczenie === 'zasilek-macierzynski' && [1, 2, 5, 6].includes(numer)) {
        szczegol.swiadczenieRodzicielskie = s.slowniki.swiadczenieRodzicielskie.wartosc;
      }
      if (numer === 4 && s.wyczekiwanie?.prawoOd) od = s.wyczekiwanie.prawoOd;
    }
    const platnikSwiadczenia: PlatnikWyniku = swiadczenie === 'zwzm' ? 'zus' : platnik.platnik;
    wyniki.push({ swiadczenie, prawo, ...(od === undefined ? {} : { od }), ...(przyczyna === undefined ? {} : { przyczyna }), platnik: platnikSwiadczenia });
    szczegoly.push(szczegol);
  }

  const komunikaty: KodKomunikatu[] = [];
  const parametryKomunikatow: RozszerzenieWeryfikacji['parametryKomunikatow'] = {};
  const okres = okresDoWyliczenia(dane, dokumenty);
  if (okres?.skorygowany) {
    komunikaty.push('0226');
    parametryKomunikatow['0226'] = {
      dataPoczatkuZWniosku: formatujDate(okres.odZWniosku),
      terminPorodu: formatujDate(dane.zdarzenie.przewidywanyTermin.wartosc ?? okres.od),
      dataPoczatkuDoWyliczenia: formatujDate(okres.od),
    };
  }
  if (czyPrzedPorodem(dane, okres) && okres !== undefined && !okres.zaswiadczenieOTerminie) komunikaty.push('0227');

  return {
    dataZdarzenia: { data: zdarzenie.data, rodzaj: zdarzenie.rodzaj },
    ...(s.ciaza === undefined ? {} : { okresCiazy: s.ciaza }),
    ...(poUstaniu && s.koniec !== null ? { dataUstania: s.koniec } : {}),
    warunki,
    wyniki,
    porownanie: [],
    komunikaty,
    czas: '',
    rozszerzenie: {
      szczegoly,
      uzasadnieniePlatnika: platnik.uzasadnienie,
      ...(okres === undefined ? {} : { okresDoWyliczenia: okres }),
      parametryKomunikatow,
      rodzajZdarzenia: zdarzenie.rodzaj,
    },
  };
}

/** Czy wynik weryfikacji potwierdza prawo do zasiłku macierzyńskiego (akcja Sprawdź wyliczenia). */
export function czyZasilekMacierzynskiPrzysluguje(w: WynikWeryfikacjiSprawy | undefined): boolean {
  return w?.wyniki.some((r) => r.swiadczenie === 'zasilek-macierzynski' && r.prawo === 'przysluguje') ?? false;
}

// --- Podstawa wymiaru ze sprawy -----------------------------------------------------------------

type KwotaMiesieczna = NonNullable<DaneSprawy['kwotyMiesieczne']['wartosc']>[number];

function pomniejsz(grosze: number, procent: Procent): Grosze {
  return zaokraglijDoGrosza((grosze * (100 - procent)) / 100);
}

/** Miesiąc zdarzenia dla podstawy: ZwWZM od dnia po ustaniu, ojciec od początku jego okresu, w pozostałych sprawach data zdarzenia. */
function miesiacZdarzeniaPodstawy(d: DaneSprawy, zdarzenie: ZdarzenieSprawy): MiesiacISO {
  if (swiadczeniaZWniosku(d).includes('zwzm')) {
    const koniec = koniecOkresow(okresyPodlegania(d));
    if (koniec !== null) return miesiacZDaty(dodajDni(koniec, 1));
  }
  return miesiacZDaty(zdarzenie.data);
}

/** Wynagrodzenie miesiąca Z-3 po uzupełnieniu; null, gdy miesiąc z przepracowaną mniej niż połową czasu pracy. */
function uzupelnionaKwota(k: KwotaMiesieczna, uzupelnijWszystkie: boolean): number | null {
  const przepracowane = k.dniPrzepracowane;
  const doPrzepracowania = k.dniDoPrzepracowania;
  if (przepracowane === undefined || doPrzepracowania === undefined || doPrzepracowania <= 0 || przepracowane >= doPrzepracowania) return k.kwota;
  if (przepracowane * 2 < doPrzepracowania && !uzupelnijWszystkie) return null;
  if (k.skladnik === 'zmienny' && przepracowane > 0) return (k.kwota / przepracowane) * doPrzepracowania;
  return k.kwota;
}

/** Podstawa wymiaru z kwot miesięcznych sprawy; kod, gdy nie da się jej ustalić. */
export function ustalPodstaweZeSprawy(dane: DaneSprawy, katalog: Katalog): PodstawaWymiaru | { kod: '0094' | '0173' } {
  const zdarzenie = ustalZdarzenie(dane);
  if (zdarzenie === null) return { kod: '0094' };
  const sl = wartosciSlownikow(katalog, zdarzenie.data);
  const procent = sl.pomniejszenie.wartosc;
  const P = teksty.ViewSampleCaseVerification.podstawa;
  const miesiacPrawa = miesiacZdarzeniaPodstawy(dane, zdarzenie);
  const tytul = dane.tytul.rodzaj.wartosc;
  const pelnyEtat = tytul === 'pracownik' && dane.wymiarCzasuPracy.wartosc === 'pelny-etat';
  const wynik = (kwota: Grosze, opis: string): PodstawaWymiaru => ({
    kwota,
    zrodlo: 'przykladowa-sprawa',
    ...(tytul === 'pracownik' ? { pelnyEtat } : {}),
    skladniki: [{ opis, kwota }],
    miesiacPowstaniaPrawa: miesiacPrawa,
  });
  // Minimalna podstawa wymiaru zasiłku pracownika obowiązująca w dniu zasiłku, przy niepełnym etacie
  // pomnożona przez wymiar etatu i zaokrąglona do grosza.
  const etat = tytul === 'pracownik' && !pelnyEtat ? wymiarEtatuSprawy(dane) : null;
  const minimumObowiazuje = tytul === 'pracownik' && (pelnyEtat || etat !== null);
  const minimumWDniu = (dzien: DataISO): Grosze => {
    const pelna = zeSlownika(katalog, ID_KWOT.minimalnaPodstawaPelnyEtat, 'kwota', dzien, sl.minimalnaPodstawa.wartosc).wartosc;
    return etat === null ? pelna : zaokraglijDoGrosza((pelna * etat.licznik) / etat.mianownik);
  };
  const zMinimalna = (podstawa: Grosze, opis: string): PodstawaWymiaru => {
    if (!minimumObowiazuje) return wynik(podstawa, opis);
    const zakres = zakresZasilku(dane, zdarzenie);
    const naPoczatku = minimumWDniu(zakres.od);
    const kwotaPoczatkowa = Math.max(podstawa, naPoczatku);
    const zmiany: { od: DataISO; kwota: Grosze }[] = [];
    let poprzednia = kwotaPoczatkowa;
    for (let m = dodajMiesiaceDoMiesiaca(miesiacZDaty(zakres.od), 1); `${m}-01` <= zakres.do; m = dodajMiesiaceDoMiesiaca(m, 1)) {
      const dzien = `${m}-01` as DataISO;
      const kwota = Math.max(podstawa, minimumWDniu(dzien));
      if (kwota !== poprzednia) zmiany.push({ od: dzien, kwota });
      poprzednia = kwota;
    }
    const bazowy =
      podstawa < naPoczatku
        ? wynik(naPoczatku, P.minimalna({ wyliczona: formatujKwote(podstawa), minimalna: formatujKwote(naPoczatku) }))
        : wynik(podstawa, opis);
    return zmiany.length === 0 ? bazowy : { ...bazowy, zmianyWOkresie: zmiany };
  };

  const poprzedni = dane.poprzedniZasilek.wartosc;
  if (poprzedni !== null && porownajDaty(poprzedni.dataKonca, zdarzenie.data) < 0 && porownajDaty(zdarzenie.data, dodajMiesiace(poprzedni.dataKonca, 1)) <= 0) {
    return wynik(poprzedni.podstawa, P.poprzedniZasilek);
  }

  const wszystkie = dane.kwotyMiesieczne.wartosc ?? [];
  const rodzajKwot: KwotaMiesieczna['rodzaj'] = tytul === 'pracownik' ? 'wynagrodzenie' : tytul === 'zleceniobiorca' ? 'przychod' : 'podstawa-skladek';
  let kwoty = wszystkie.filter((k) => k.rodzaj === rodzajKwot);
  let zPoswiadczenia = rodzajKwot === 'podstawa-skladek';
  if (kwoty.length === 0 && rodzajKwot !== 'podstawa-skladek') {
    kwoty = wszystkie.filter((k) => k.rodzaj === 'podstawa-skladek');
    zPoswiadczenia = true;
  }

  // Okno 12 pełnych miesięcy przed miesiącem zdarzenia albo pełnych miesięcy ubezpieczenia.
  const okresy = okresyPodlegania(dane);
  const lancuch = polaczoneOkresy(okresy, zdarzenie.data);
  const poczatek = lancuch?.okresy[0]?.od ?? dane.tytul.od.wartosc;
  let pierwszyPelny = dodajMiesiaceDoMiesiaca(miesiacPrawa, -MIESIACE_PODSTAWY);
  if (poczatek !== null && poczatek !== undefined) {
    const miesiacPoczatku = miesiacZDaty(poczatek);
    const pelny = pierwszyDzienMiesiaca(poczatek) === poczatek ? miesiacPoczatku : dodajMiesiaceDoMiesiaca(miesiacPoczatku, 1);
    if (pelny > pierwszyPelny) pierwszyPelny = pelny;
  }
  const wOknie = kwoty.filter((k) => k.miesiac >= pierwszyPelny && k.miesiac < miesiacPrawa);
  const pelneMiesiace = pierwszyPelny < miesiacPrawa ? Math.max(0, roznicaMiesiecy(pierwszyPelny, miesiacPrawa)) : 0;

  if (tytul === 'dzialalnosc' && zPoswiadczenia) {
    const najnizsza = sl.najnizszaPodstawaJdg.wartosc;
    const bazowa = pomniejsz(najnizsza, procent);
    if (pelneMiesiace === 0 || wOknie.length === 0) return wynik(bazowa, P.jdgPrzedPelnymMiesiacem({ najnizsza: formatujKwote(najnizsza) }));
    if (pelneMiesiace < MIESIACE_PODSTAWY) {
      // Najniższa podstawa wymiaru składek obowiązująca w każdym pełnym miesiącu ubezpieczenia.
      const najnizszaW = (m: MiesiacISO) => najnizszaWMiesiacu(katalog, m, najnizsza);
      const miesiacePelne = Array.from({ length: pelneMiesiace }, (_, i) => dodajMiesiaceDoMiesiaca(pierwszyPelny, i));
      const przecietna = zaokraglijDoGrosza(miesiacePelne.reduce((suma, m) => suma + najnizszaW(m), 0) / pelneMiesiace);
      const bazowaKrotko = pomniejsz(przecietna, procent);
      const nadwyzki = wOknie.reduce((suma, k) => suma + Math.max(0, k.kwota - najnizszaW(k.miesiac)), 0);
      const dodatek = zaokraglijDoGrosza((nadwyzki * (100 - procent)) / 100 / MIESIACE_PODSTAWY);
      return wynik(bazowaKrotko + dodatek, P.jdgKrotko({ najnizsza: formatujKwote(przecietna), bazowa: formatujKwote(bazowaKrotko), dodatek: formatujKwote(dodatek) }));
    }
  }

  if (wOknie.length === 0) {
    // Zdarzenie przed upływem pełnego miesiąca: przychód z umowy za miesiąc zdarzenia.
    const zMiesiacaZdarzenia = kwoty.filter((k) => k.miesiac === miesiacPrawa);
    if (zMiesiacaZdarzenia.length === 0) return { kod: '0094' };
    const kwota = pomniejsz(zMiesiacaZdarzenia[0].kwota, procent);
    return zMinimalna(kwota, P.miesiacZdarzenia);
  }

  const kazdyPonizejPolowy = wOknie.every((k) => uzupelnionaKwota(k, false) === null);
  const uzupelnione = wOknie.map((k) => uzupelnionaKwota(k, kazdyPonizejPolowy)).filter((k): k is number => k !== null);
  if (uzupelnione.length === 0) return { kod: '0094' };
  const srednia = uzupelnione.reduce((a, b) => a + b, 0) / uzupelnione.length;
  const podstawa = pomniejsz(srednia, procent);
  const opis = zPoswiadczenia ? P.zPoswiadczenia : tytul === 'zleceniobiorca' ? P.zZ3a : P.zZ3;
  return zMinimalna(podstawa, opis);
}

/** Najniższa podstawa wymiaru składek osoby prowadzącej pozarolniczą działalność obowiązująca w miesiącu `m`. */
function najnizszaWMiesiacu(k: Katalog, m: MiesiacISO, domyslna: number): number {
  return zeSlownika(k, ID_KWOT.najnizszaPodstawaJdg, 'kwota', `${m}-01` as DataISO, domyslna).wartosc;
}

/** Wymiar etatu sprawy jako ułamek; null, gdy pole jest puste albo nieprawidłowe. */
export function wymiarEtatuSprawy(d: DaneSprawy): { licznik: number; mianownik: number } | null {
  const tekst = d.wymiarEtatu?.wartosc?.trim() ?? '';
  const dopasowanie = /^(\d+)\/(\d+)$/.exec(tekst);
  if (dopasowanie === null) return null;
  const licznik = Number(dopasowanie[1]);
  const mianownik = Number(dopasowanie[2]);
  if (licznik < 1 || licznik >= mianownik || mianownik > 99) return null;
  return { licznik, mianownik };
}

/** Zakres dni zasiłku z wniosku albo od daty zdarzenia do końca okresu z wniosku. */
function zakresZasilku(d: DaneSprawy, zdarzenie: ZdarzenieSprawy): Okres {
  const okresy = okresyZWniosku(d);
  if (okresy.length === 0) return { od: zdarzenie.data, do: zdarzenie.data };
  return { od: okresy[0].od, do: okresy.reduce((koniec, o) => maxData(koniec, o.do), okresy[0].do) };
}

function roznicaMiesiecy(od: MiesiacISO, do_: MiesiacISO): number {
  const [ra, ma] = od.split('-').map(Number);
  const [rb, mb] = do_.split('-').map(Number);
  return (rb - ra) * 12 + (mb - ma);
}

// --- Dane wejściowe kalkulatora -----------------------------------------------------------------

const ZRODLO = 'przykladowa-sprawa' as const;

/** Dzień pobytu w szpitalu liczony w okresie liczenia uzupełniającego urlopu macierzyńskiego. */
export function dniPobytuWOkresieLiczenia(d: DaneSprawy): { dni: number; pierwszyDzien: number } | null {
  const porod = dataPorodu(d);
  const pobyt = d.dziecko.pobyt.wartosc;
  const tydzien = d.dziecko.tydzienCiazy.wartosc;
  const masa = d.dziecko.masaG.wartosc;
  if (porod === null || pobyt === null || tydzien === null) return null;
  const pierwszyDzien = roznicaDni(porod, pobyt.od);
  let okno: Okres;
  if (tydzien <= 27 || (masa !== null && masa <= 1000)) okno = { od: porod, do: dodajDni(porod, 104) };
  else if (tydzien <= 36) okno = { od: porod, do: dodajDni(porod, 55) };
  else {
    // Co najmniej 2 kolejne dni pobytu, z których pierwszy przypada od 5. do 28. dnia po porodzie.
    const pierwszyLiczony = maxData(pobyt.od, dodajDni(porod, 5));
    if (porownajDaty(pierwszyLiczony, dodajDni(porod, 28)) > 0 || porownajDaty(dodajDni(pierwszyLiczony, 1), pobyt.do) > 0) {
      return { dni: 0, pierwszyDzien };
    }
    okno = { od: dodajDni(porod, 5), do: dodajDni(porod, 56) };
  }
  const od = maxData(okno.od, pobyt.od);
  const do_ = minData(okno.do, pobyt.do);
  return { dni: porownajDaty(od, do_) > 0 ? 0 : liczbaDniWlacznie({ od, do: do_ }), pierwszyDzien };
}

/** Dane wejściowe kalkulatora ze sprawy przykładowej. */
export function daneWejscioweZeSprawy(dane: DaneSprawy): DaneWejscioweKalkulatora {
  const porod = dataPorodu(dane);
  const termin = dane.zdarzenie.przewidywanyTermin.wartosc;
  const forma = formaZTytulu(dane.tytul.rodzaj.wartosc);
  const dobrowolne = dane.ubezpieczenieChorobowe.rodzaj.wartosc === 'dobrowolne';
  const martwe = dane.zdarzenie.rodzaj.wartosc === 'martwe-urodzenie';
  const liczbaDzieci = dane.zdarzenie.liczbaDzieci.wartosc ?? 1;
  const pobyt = dniPobytuWOkresieLiczenia(dane);
  const tydzien = dane.dziecko.tydzienCiazy.wartosc;
  const masa = dane.dziecko.masaG.wartosc;
  const ojciec = czyOjciec(dane);
  return {
    zdarzenie: { wartosc: porod === null && termin !== null ? 'przewidywany-porod' : 'porod', zrodlo: ZRODLO },
    ...(porod === null ? {} : { dataPorodu: { wartosc: porod, zrodlo: ZRODLO } }),
    ...(termin === null ? {} : { przewidywanyTerminPorodu: { wartosc: termin, zrodlo: ZRODLO } }),
    liczbaDzieci: { wartosc: liczbaDzieci, zrodlo: dane.zdarzenie.liczbaDzieci.wartosc === null ? 'wartosc-domyslna' : ZRODLO },
    zaZyciem: { wartosc: dane.dziecko.zaZyciem.wartosc !== null, zrodlo: dane.dziecko.zaZyciem.wartosc === null ? 'wartosc-domyslna' : ZRODLO },
    ...(pobyt !== null && tydzien !== null && masa !== null
      ? { wczesniactwo: { wartosc: { tydzienCiazy: tydzien, masaG: masa, dniPobytu: pobyt.dni, pierwszyDzienPobytu: pobyt.pierwszyDzien }, zrodlo: ZRODLO } }
      : {}),
    ...(martwe
      ? { strata: { wartosc: { rodzaj: 'martwe-urodzenie' as const, liczbaDzieci: dane.zdarzenie.liczbaMartwych.wartosc ?? 1 }, zrodlo: ZRODLO } }
      : {}),
    formaMatki: ojciec
      ? { wartosc: { forma: 'umowa-o-prace', dobrowolne: false }, zrodlo: 'wartosc-domyslna' }
      : { wartosc: { forma, dobrowolne }, zrodlo: ZRODLO },
    formaDrugiegoRodzica: ojciec
      ? { wartosc: { forma, dobrowolne }, zrodlo: ZRODLO }
      : { wartosc: { forma: 'brak-drugiego-rodzica', dobrowolne: false }, zrodlo: 'wartosc-domyslna' },
  };
}

// --- Wyliczenie okresów i wypłat sprawy (Okres zasiłku ze sprawy, Wyliczenie wypłat) ----------

function czy81i5(d: DaneSprawy): boolean {
  const porod = dataPorodu(d);
  const zlozono = d.wniosek.dataZlozenia.wartosc;
  if (d.wniosek.oswiadczeniePelnyWymiar.wartosc !== true || porod === null || zlozono === null) return false;
  return porownajDaty(zlozono, dodajDni(porod, TERMIN_WNIOSKU_81_5_DNI)) <= 0;
}

function okresScenariusza(
  rodzaj: OkresScenariusza['rodzaj'],
  od: DataISO,
  dni: number,
  stawka: Procent,
  podstawa: Grosze,
  minimum: Grosze | null,
  rodzic: OkresScenariusza['rodzic'],
): OkresScenariusza {
  const surowa = zaokraglijDoGrosza((podstawa * stawka) / 100);
  const miesiecznie = minimum !== null && surowa < minimum ? minimum : surowa;
  // Stawka dzienna: podstawa / 30 zaokrąglona do grosza, × stawka, ponownie zaokrąglona do grosza.
  const zaOkres = stawkaDzienna(podstawa, stawka) * dni;
  return { rodzic, rodzaj, od, do: dodajDni(od, dni - 1), dni, stawka, miesiecznie, zaOkres };
}

/** Okresy zasiłku, stawki i wypłaty dla danych sprawy (kalkulator w trybie przykładowej sprawy). */
export function wyliczWynikSprawy(
  dane: DaneSprawy,
  podstawa: PodstawaWymiaru,
  katalog: Katalog,
  dokumenty: readonly DokumentSprawy[] = [],
): WynikScenariusza {
  const zdarzenie = ustalZdarzenie(dane);
  const sl = wartosciSlownikow(katalog, dataPorodowa(dane) ?? zdarzenie?.data ?? katalog.dataUruchomienia);
  const ojciec = czyOjciec(dane);
  const rodzic: OkresScenariusza['rodzic'] = ojciec ? 'drugi-rodzic' : 'matka';
  const minimum = sl.swiadczenieRodzicielskie.wartosc;
  const wariant815 = czy81i5(dane);
  const liczba = (dane.zdarzenie.liczbaDzieci.wartosc ?? 1) as LiczbaDzieci;
  const zaZyciem = dane.dziecko.zaZyciem.wartosc !== null;
  const porod = dataPorodu(dane);
  const okresyWniosku = okresyZWniosku(dane);
  const okresy: OkresScenariusza[] = [];
  const reguly: WynikScenariusza['zastosowaneReguly'] = [];
  const W = teksty.ViewSampleCaseVerification.wyliczenie;

  const doMacierzynskiego = okresDoWyliczenia(dane, dokumenty);
  let koniecMacierzynskiego: DataISO | null = null;
  if (doMacierzynskiego !== undefined) {
    let dni = TYGODNIE_URLOPU_MACIERZYNSKIEGO[liczba] * 7;
    let od = doMacierzynskiego.od;
    if (dane.zdarzenie.rodzaj.wartosc === 'martwe-urodzenie' && porod !== null) {
      const zywe = Math.max(0, liczba - (dane.zdarzenie.liczbaMartwych.wartosc ?? liczba));
      dni = zywe > 0 ? TYGODNIE_URLOPU_MACIERZYNSKIEGO[zywe as LiczbaDzieci] * 7 : TYGODNIE_PO_MARTWYM_URODZENIU * 7;
      od = porod;
      reguly.push({ opis: W.martweUrodzenie({ dni: String(dni) }) });
    } else if (ojciec) {
      const matki = dane.wniosek.okresMatki.wartosc;
      if (matki !== null) dni -= liczbaDniWlacznie(matki);
      reguly.push({ opis: W.ojciec({ dni: String(dni) }) });
    } else {
      reguly.push({ opis: W.macierzynski({ tygodnie: String(TYGODNIE_URLOPU_MACIERZYNSKIEGO[liczba]), dni: String(dni) }) });
    }
    if (dni > 0) {
      const o = okresScenariusza(ojciec ? 'przejety-macierzynski' : 'macierzynski', od, dni, wariant815 ? 81.5 : 100, podstawa.kwota, minimum, rodzic);
      okresy.push(o);
      koniecMacierzynskiego = o.do;
    }
  }

  // Uzupełniający urlop macierzyński z zaświadczenia szpitala.
  const pobyt = dniPobytuWOkresieLiczenia(dane);
  if (pobyt !== null && pobyt.dni > 0 && koniecMacierzynskiego !== null) {
    const tydzien = dane.dziecko.tydzienCiazy.wartosc ?? 40;
    const masa = dane.dziecko.masaG.wartosc ?? 3000;
    const limit = tydzien <= 27 || masa <= 1000 ? 15 : 8;
    const tygodnie = Math.min(limit, Math.ceil(pobyt.dni / 7));
    okresy.push(okresScenariusza('uzupelniajacy', dodajDni(koniecMacierzynskiego, 1), tygodnie * 7, 100, podstawa.kwota, minimum, rodzic));
    reguly.push({ opis: W.uzupelniajacy({ dni: String(pobyt.dni), tygodnie: String(tygodnie) }) });
  }

  for (const o of okresyWniosku) {
    if (o.rodzajUrlopu === 'rodzicielski' && !ojciec) {
      const tyg = wariant815
        ? zaZyciem
          ? liczba > 1 ? TYGODNIE_RODZICIELSKIEGO_MATKI_81_5.zaZyciemWiecej : TYGODNIE_RODZICIELSKIEGO_MATKI_81_5.zaZyciemJedno
          : liczba > 1 ? TYGODNIE_RODZICIELSKIEGO_MATKI_81_5.wiecej : TYGODNIE_RODZICIELSKIEGO_MATKI_81_5.jedno
        : null;
      const zWniosku = liczbaDniWlacznie(o);
      const maks = (zaZyciem ? (liczba > 1 ? 58 : 56) : liczba > 1 ? 34 : 32) * 7;
      const dni = tyg === null ? Math.min(zWniosku, maks) : tyg * 7;
      okresy.push(okresScenariusza('rodzicielski', o.od, dni, wariant815 ? 81.5 : 70, podstawa.kwota, minimum, rodzic));
      reguly.push({ opis: W.rodzicielski({ tygodnie: String(Math.round(dni / 7)) }) });
    } else if (o.rodzajUrlopu === 'ojcowski') {
      okresy.push(okresScenariusza('ojcowski', o.od, Math.min(DNI_OJCOWSKIEGO, liczbaDniWlacznie(o)), 100, podstawa.kwota, null, rodzic));
    } else if (o.rodzajUrlopu === 'na-warunkach-macierzynskiego') {
      okresy.push(okresScenariusza('na-warunkach-macierzynskiego', o.od, liczbaDniWlacznie(o), 100, podstawa.kwota, minimum, rodzic));
    }
  }
  if (wariant815) reguly.push({ opis: W.wariant815({ dni: String(TERMIN_WNIOSKU_81_5_DNI) }) });

  const suma = okresy.reduce((a, o) => a + o.zaOkres, 0);
  const sumy: WynikScenariusza['sumy'] = { razem: suma, [rodzic]: suma };
  return {
    okresy,
    harmonogram: [],
    sumy,
    datyPowrotu: {},
    tygodniePrzepadajace: 0,
    tygodnieNiewykorzystane: 0,
    uprawnieniaPoPowrocie: [],
    zastosowaneReguly: reguly,
    komunikaty: [],
  };
}
