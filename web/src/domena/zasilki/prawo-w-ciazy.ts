// Ustalenie prawa do świadczeń z ubezpieczenia chorobowego w ciąży (kontrakt, sekcja 7.2; ANALIZY/05 sekcja 5).
// Właściciel: u16 (Świadczenia w ciąży i dokumenty wniosków).
// Funkcje są czyste i deterministyczne: datę dnia dostają jako argument, a wartości reguł czytają ze słowników
// katalogu w wersji obowiązującej we wskazanym dniu. Kolejność przyczyn braku prawa: brak ubezpieczenia,
// ustanie ubezpieczenia, okres wyczekiwania, wyczerpany okres zasiłkowy, zadłużenie ponad próg.
import { WPISY_REGUL } from '@/dane/katalog/reguly-swiadczen';
import { dodajDni, dodajMiesiace, formatujDate, porownajDaty, roznicaDni } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import { dataUrodzeniaZPesel } from '@/domena/pesel';
import {
  analizujUbezpieczenie,
  wartoscSlownika,
  wartosciWyczekiwania,
  type AnalizaUbezpieczenia,
  type WartoscSlownika,
} from '@/domena/zasilki/okres-ubezpieczenia';
import {
  opisPlatnikaNieustalonego,
  opisPracodawcy,
  platnikZasilkuMatki,
  ustalPlatnikaSwiadczenia,
  type WejsciePlatnika,
} from '@/domena/zasilki/platnik';
import type {
  DaneCiazyIDziecka,
  DaneDrugiegoRodzicaZKonta,
  DaneRodziny,
  DaneZKontaZus,
  DataISO,
  FormaZatrudnienia,
  Grosze,
  IdRegulySwiadczenia,
  Katalog,
  StanRozliczenSkladek,
  TytulUbezpieczenia,
  WynikUstaleniaPrawa,
  ZaswiadczenieEzla,
  ZrodloDanej,
} from '@/domena/typy';
import { teksty } from '@/teksty';

const T = teksty.ViewPregnancyBenefits;

export type SwiadczenieWCiazy = WynikUstaleniaPrawa['swiadczenie'];

export interface WejscieUstaleniaPrawa {
  swiadczenie: WynikUstaleniaPrawa['swiadczenie'];
  wskazanyDzien: DataISO;
  osoba: 'matka' | 'drugi-rodzic';
  daneRodziny: DaneRodziny;
  daneCiazy: DaneCiazyIDziecka | null;
  kopia: DaneZKontaZus | null;
  katalog: Katalog;
  dzis: DataISO;
  /** Zgoda na dane dotyczące zdrowia; bez zgody system pomija zaświadczenia e-ZLA. Domyślnie true. */
  zgoda?: boolean;
  /** Na koncie drugiego rodzica: dane z konta ZUS matki, z których system bierze wyłącznie tytuły. */
  tytulyMatkiDlaProfilu?: DaneZKontaZus | DaneDrugiegoRodzicaZKonta | null;
}

export type PodzialZaswiadczenia = NonNullable<WynikUstaleniaPrawa['podzial']>;
export type ZadluzenieBlokujace = Extract<NonNullable<WynikUstaleniaPrawa['przyczyna']>, { rodzaj: 'zadluzenie' }>;

// --- Dane wejściowe -----------------------------------------------------------------------------

const RODZAJ_TYTULU: Record<Exclude<FormaZatrudnienia, 'brak-tytulu'>, TytulUbezpieczenia['rodzaj']> = {
  'umowa-o-prace': 'pracownik',
  'umowa-zlecenia': 'zleceniobiorca',
  jdg: 'dzialalnosc',
};

function formaZTytulow(tytuly: readonly TytulUbezpieczenia[]): FormaZatrudnienia {
  if (tytuly.some((t) => t.rodzaj === 'pracownik')) return 'umowa-o-prace';
  if (tytuly.some((t) => t.rodzaj === 'dzialalnosc')) return 'jdg';
  if (tytuly.some((t) => t.rodzaj === 'zleceniobiorca')) return 'umowa-zlecenia';
  return 'brak-tytulu';
}

/** Tytuł ubezpieczenia złożony z formy zatrudnienia, ubezpieczenia chorobowego i zmiany zatrudnienia w profilu. */
function tytulyZProfilu(daneRodziny: DaneRodziny, pomocnicze: readonly TytulUbezpieczenia[]): TytulUbezpieczenia[] {
  const m = daneRodziny.matka;
  const forma = m.formaZatrudnienia?.wartosc;
  if (forma === undefined || forma === 'brak-tytulu') return [];
  const rodzaj = RODZAJ_TYTULU[forma];
  const zKonta = pomocnicze.filter((t) => t.rodzaj === rodzaj);
  if (zKonta.length > 0) return zKonta;
  const od = m.dataPoczatkuZatrudnienia?.wartosc
    ?? (m.zmianaZatrudnienia?.rodzaj.wartosc === 'rozpoczecie' ? m.zmianaZatrudnienia.data?.wartosc : undefined);
  if (od === undefined) return [];
  const chorobowe = forma === 'umowa-o-prace' ? 'obowiazkowe' : m.dobrowolneChorobowe?.wartosc ? 'dobrowolne' : 'brak';
  return [{
    id: 'profil', rodzaj, od,
    ubezpieczenieChorobowe: { rodzaj: chorobowe, od },
    podstawySkladek: [],
    platnik: { nazwa: m.platnikZasilku?.nazwaPlatnika ?? '', nip: '', regon: '', wyplacaZasilki: 'brak-informacji' },
  }];
}

interface Przygotowanie {
  zgoda: boolean;
  zKonta: boolean;
  forma: FormaZatrudnienia | null;
  tytuly: TytulUbezpieczenia[];
  tytulGlowny?: TytulUbezpieczenia;
  koniecZProfilu?: DataISO;
  ezla: ZaswiadczenieEzla[];
  stany: StanRozliczenSkladek[];
  stanNiedostepny: boolean;
  ptp?: DataISO;
  dataPorodu?: DataISO;
  rokUrodzenia?: number;
  platnik: WejsciePlatnika;
}

function przygotuj(w: WejscieUstaleniaPrawa): Przygotowanie {
  const zgoda = w.zgoda ?? true;
  const zKonta = w.osoba === 'matka' && w.kopia !== null;
  const pomocnicze = w.tytulyMatkiDlaProfilu?.tytuly ?? [];
  const tytuly = zKonta && w.kopia ? w.kopia.tytuly : tytulyZProfilu(w.daneRodziny, pomocnicze);
  const forma = w.daneRodziny.matka.formaZatrudnienia?.wartosc ?? (zKonta ? formaZTytulow(tytuly) : null);
  const rodzaj = forma && forma !== 'brak-tytulu' ? RODZAJ_TYTULU[forma] : undefined;
  const zRodzaju = tytuly.filter((t) => t.rodzaj === rodzaj);
  const tytulGlowny = zRodzaju[zRodzaju.length - 1] ?? tytuly[tytuly.length - 1];
  const zmiana = w.daneRodziny.matka.zmianaZatrudnienia;
  const koniecZProfilu = zmiana?.rodzaj.wartosc === 'ustanie' ? zmiana.data?.wartosc : undefined;
  const ezla = zgoda && zKonta && w.kopia
    ? w.kopia.zaswiadczeniaEzla.filter((z) => z.rodzaj === 'choroba').sort((a, b) => porownajDaty(a.od, b.od))
    : [];
  const pesel = zKonta ? w.kopia?.pesel : undefined;
  const dataUr = pesel ? dataUrodzeniaZPesel(pesel) : null;
  const pz = w.daneRodziny.matka.platnikZasilku;
  return {
    zgoda,
    zKonta,
    forma,
    tytuly,
    tytulGlowny,
    koniecZProfilu,
    ezla,
    stany: zKonta && w.kopia ? [...w.kopia.stanyRozliczen].sort((a, b) => porownajDaty(a.dzien, b.dzien)) : [],
    stanNiedostepny: !zKonta || w.kopia?.stanRozliczenNiedostepny === true || (w.kopia?.stanyRozliczen.length ?? 0) === 0,
    ptp: w.daneCiazy?.przewidywanyTerminPorodu,
    dataPorodu: w.daneCiazy?.dataPorodu,
    rokUrodzenia: dataUr ? Number(dataUr.slice(0, 4)) : undefined,
    platnik: {
      forma,
      platnikZasilku: pz?.wartosc ?? null,
      ...(pz?.nazwaPlatnika ? { nazwaPlatnika: pz.nazwaPlatnika } : {}),
      ...(tytulGlowny ? { tytul: tytulGlowny } : {}),
    },
  };
}

// --- Okres zasiłkowy i wynagrodzenie chorobowe ---------------------------------------------------

export interface OkresZasilkowy {
  limit: number;
  wykorzystane: number;
  pozostale: number;
  dzienWyczerpania: DataISO;
  wyczerpany: boolean;
  zaswiadczenia: ZaswiadczenieEzla[];
  ostatniDzien: DataISO;
  wynagrodzenie?: { rok: number; limit: number; wykorzystane: number };
}

function* dni(od: DataISO, do_: DataISO): Generator<DataISO> {
  for (let d = od; porownajDaty(d, do_) <= 0; d = dodajDni(d, 1)) yield d;
}

function limitWynagrodzenia(katalog: Katalog, rok: number, rokUrodzenia: number | undefined, dzien: DataISO): number {
  const po50 = rokUrodzenia !== undefined && rok > rokUrodzenia + 50;
  return po50
    ? wartoscSlownika(katalog, WPISY_REGUL.wynagrodzenieChorobowe, dzien, ['po-50', '14-dni', 'od-roku-po-50'], 14).wartosc
    : wartoscSlownika(katalog, WPISY_REGUL.wynagrodzenieChorobowe, dzien, ['podstawowy', '33-dni', 'dni'], 33).wartosc;
}

/** Zaświadczenia ostatniego okresu zasiłkowego: przerwa do 60 dni łączy zaświadczenia w jeden okres. */
function lancuchZaswiadczen(ezla: readonly ZaswiadczenieEzla[], katalog: Katalog, dzien: DataISO): ZaswiadczenieEzla[] {
  if (ezla.length === 0) return [];
  const przerwa = wartoscSlownika(katalog, WPISY_REGUL.przerwaWNiezdolnosci, dzien, ['dni', 'przerwa'], 60).wartosc;
  const lancuch = [ezla[ezla.length - 1]];
  for (let i = ezla.length - 2; i >= 0; i -= 1) {
    const poprzedni = ezla[i];
    const nastepny = lancuch[0];
    const odstep = roznicaDni(poprzedni.do, nastepny.od) - 1;
    if (odstep > przerwa) break;
    const ciazaPoPrzerwie = odstep > 0 && nastepny.kodyLiterowe.includes('B') && !poprzedni.kodyLiterowe.includes('B');
    if (ciazaPoPrzerwie) break;
    lancuch.unshift(poprzedni);
  }
  return lancuch;
}

function okresZasilkowyZ(p: Przygotowanie, katalog: Katalog, dzis: DataISO): OkresZasilkowy | null {
  const lancuch = lancuchZaswiadczen(p.ezla, katalog, dzis);
  if (lancuch.length === 0) return null;
  const start = lancuch[0].od;
  const wCiazy = lancuch.some((z) => z.kodyLiterowe.includes('B'));
  const limit = wCiazy
    ? wartoscSlownika(katalog, WPISY_REGUL.okresZasilkowy, start, ['w-ciazy', '270-dni', 'ciaza'], 270).wartosc
    : wartoscSlownika(katalog, WPISY_REGUL.okresZasilkowy, start, ['podstawowy', '182-dni'], 182).wartosc;
  const analiza = analizujUbezpieczenie(p.tytuly, start, katalog, p.koniecZProfilu);
  const nabycie = analiza?.dzienNabycia;
  let licznik = 0;
  let wykorzystane = 0;
  let dzienWyczerpania: DataISO | undefined;
  let ostatniDzien = lancuch[0].do;
  for (const z of lancuch) {
    for (const d of dni(z.od, z.do)) {
      if (nabycie !== undefined && porownajDaty(d, nabycie) < 0) continue;
      licznik += 1;
      if (porownajDaty(d, dzis) <= 0) wykorzystane += 1;
      if (licznik === limit) dzienWyczerpania = d;
    }
    if (porownajDaty(z.do, ostatniDzien) > 0) ostatniDzien = z.do;
  }
  wykorzystane = Math.min(wykorzystane, limit);
  const koniec = dzienWyczerpania ?? dodajDni(ostatniDzien, limit - licznik);
  let wynagrodzenie: OkresZasilkowy['wynagrodzenie'];
  if (p.forma === 'umowa-o-prace') {
    const rok = Number(ostatniDzien.slice(0, 4));
    const limitW = limitWynagrodzenia(katalog, rok, p.rokUrodzenia, ostatniDzien);
    let dniRoku = 0;
    for (const z of p.ezla) {
      for (const d of dni(z.od, z.do)) {
        if (Number(d.slice(0, 4)) !== rok) continue;
        if (nabycie !== undefined && porownajDaty(d, nabycie) < 0) continue;
        dniRoku += 1;
      }
    }
    wynagrodzenie = { rok, limit: limitW, wykorzystane: Math.min(dniRoku, limitW) };
  }
  return {
    limit,
    wykorzystane,
    pozostale: limit - wykorzystane,
    dzienWyczerpania: koniec,
    wyczerpany: dzienWyczerpania !== undefined && porownajDaty(dzienWyczerpania, dzis) < 0,
    zaswiadczenia: lancuch,
    ostatniDzien,
    ...(wynagrodzenie ? { wynagrodzenie } : {}),
  };
}

export interface KontekstPodzialu {
  forma: FormaZatrudnienia | null;
  dzienNabycia?: DataISO;
  koniecUbezpieczenia?: DataISO;
  rokUrodzenia?: number;
  katalog: Katalog;
  wyplacaZasilek: string;
  wyplacaWynagrodzenie: string;
}

/**
 * Podział okresu zaświadczeń e-ZLA na wynagrodzenie chorobowe (pracownica, pierwsze 33 albo 14 dni w roku
 * kalendarzowym), zasiłek chorobowy i zasiłek po ustaniu ubezpieczenia. Dni w okresie wyczekiwania pomija.
 */
export function podzialZaswiadczenia(
  z: ZaswiadczenieEzla | readonly ZaswiadczenieEzla[],
  k: KontekstPodzialu,
): PodzialZaswiadczenia {
  const lista = (Array.isArray(z) ? [...z] : [z as ZaswiadczenieEzla]).sort((a, b) => porownajDaty(a.od, b.od));
  const licznikRoku = new Map<number, number>();
  const wynik: PodzialZaswiadczenia = [];
  for (const zaswiadczenie of lista) {
    const stawkaZasilku = zaswiadczenie.kodyLiterowe.includes('B') ? 100 : 80;
    for (const d of dni(zaswiadczenie.od, zaswiadczenie.do)) {
      if (k.dzienNabycia !== undefined && porownajDaty(d, k.dzienNabycia) < 0) continue;
      const rok = Number(d.slice(0, 4));
      let rodzaj: PodzialZaswiadczenia[number]['rodzaj'];
      if (k.koniecUbezpieczenia !== undefined && porownajDaty(d, k.koniecUbezpieczenia) > 0) rodzaj = 'zasilek-po-ustaniu';
      else if (k.forma === 'umowa-o-prace' && (licznikRoku.get(rok) ?? 0) < limitWynagrodzenia(k.katalog, rok, k.rokUrodzenia, d)) {
        rodzaj = 'wynagrodzenie-chorobowe';
        licznikRoku.set(rok, (licznikRoku.get(rok) ?? 0) + 1);
      } else rodzaj = 'zasilek-chorobowy';
      const ostatni = wynik[wynik.length - 1];
      if (ostatni && ostatni.rodzaj === rodzaj && dodajDni(ostatni.do, 1) === d) {
        ostatni.do = d;
        ostatni.dni += 1;
      } else {
        wynik.push({
          od: d, do: d, dni: 1, rodzaj,
          stawka: rodzaj === 'wynagrodzenie-chorobowe' ? 100 : stawkaZasilku,
          wyplaca: rodzaj === 'wynagrodzenie-chorobowe' ? k.wyplacaWynagrodzenie
            : rodzaj === 'zasilek-po-ustaniu' ? T.platnicy.zus : k.wyplacaZasilek,
        });
      }
    }
  }
  return wynik;
}

// --- Zadłużenie z tytułu składek -----------------------------------------------------------------

export interface WejscieZadluzenia {
  stany: readonly StanRozliczenSkladek[];
  dzien: DataISO;
  prog: Grosze;
}

/** Stan rozliczeń na dzień powstania prawa, a bez niego ostatni stan przed tym dniem albo najnowszy stan. */
export function stanDlaDnia(stany: readonly StanRozliczenSkladek[], dzien: DataISO): StanRozliczenSkladek | null {
  if (stany.length === 0) return null;
  const dokladny = stany.find((s) => s.dzien === dzien);
  if (dokladny) return dokladny;
  const wczesniejsze = stany.filter((s) => porownajDaty(s.dzien, dzien) <= 0);
  return wczesniejsze[wczesniejsze.length - 1] ?? stany[stany.length - 1];
}

/**
 * Zadłużenie blokujące prawo do świadczenia: kwota w dniu powstania prawa ostro większa niż próg, bez układu
 * ratalnego albo odroczenia, które obejmuje całe zadłużenie i jest spłacane zgodnie z umową. Null, gdy go brak.
 */
export function sprawdzZadluzenie(w: WejscieZadluzenia): ZadluzenieBlokujace | null {
  const stan = stanDlaDnia(w.stany, w.dzien);
  if (stan === null) return null;
  if (stan.umowa && stan.umowa.caleZadluzenieObjete && stan.umowa.splacanaZgodnieZUmowa) return null;
  if (stan.kwotaZadluzenia <= w.prog) return null;
  return { rodzaj: 'zadluzenie', kwota: stan.kwotaZadluzenia, dzienStanu: stan.dzien, prog: w.prog };
}

/** Próg zadłużenia z tytułu składek w dniu `dzien` (1% minimalnego wynagrodzenia, 48,06 zł). */
export function progZadluzenia(katalog: Katalog, dzien: DataISO): WartoscSlownika {
  return wartoscSlownika(katalog, WPISY_REGUL.progZadluzenia, dzien, ['prog-grosze'], 4806);
}

// --- Ustalenie prawa ---------------------------------------------------------------------------

export interface WierszWartosciSlownika {
  wpis: string;
  wartosc: string;
  od: DataISO;
}

export interface UstalenieSwiadczenia {
  wynik: WynikUstaleniaPrawa;
  wartosci: WierszWartosciSlownika[];
  /** Wynik zasiłku chorobowego: dzień ustania ubezpieczenia z profilu po dniu ustalenia i przed terminem porodu. */
  ustaniePrzedPorodem?: DataISO;
  /** Warunek braku zadłużenia ponad próg przy braku stanu rozliczeń (0155). */
  warunekZadluzenia?: Grosze;
  platnikNieustalony: boolean;
}

const PRZYCZYNY_ZWZM = ['upadlosc', 'likwidacja', 'smierc-pracodawcy'] as const;
const PRZYCZYNY_MACIERZYNSKIEGO = ['upadlosc', 'likwidacja', 'smierc-pracodawcy', 'naruszenie-z-wyrokiem'] as const;

function daneZrodlowe(w: WejscieUstaleniaPrawa, p: Przygotowanie, an: AnalizaUbezpieczenia | null): WynikUstaleniaPrawa['daneZeZrodlem'] {
  const zrodloKonta: ZrodloDanej | 'profil-rodziny' = p.zKonta ? 'konto-zus' : 'profil-rodziny';
  const dane: WynikUstaleniaPrawa['daneZeZrodlem'] = [];
  const formaDana = w.daneRodziny.matka.formaZatrudnienia;
  if (p.forma) {
    dane.push({
      pole: T.dane.forma,
      wartosc: p.tytulGlowny && p.forma !== 'brak-tytulu'
        ? T.dane.formaOd({ forma: T.formy[p.forma], data: formatujDate(p.tytulGlowny.od) })
        : T.formy[p.forma],
      zrodlo: formaDana ? formaDana.zrodlo : zrodloKonta,
    });
  }
  if (an && an.okres.rodzaj === 'dobrowolne') {
    dane.push({ pole: T.dane.dobrowolne, wartosc: T.dane.odDnia({ data: formatujDate(an.okres.od) }), zrodlo: zrodloKonta });
  }
  const zmiana = w.daneRodziny.matka.zmianaZatrudnienia;
  if (zmiana && zmiana.rodzaj.wartosc !== 'bez-zmian' && zmiana.data) {
    dane.push({
      pole: zmiana.rodzaj.wartosc === 'rozpoczecie' ? T.dane.rozpoczecie : T.dane.ustanie,
      wartosc: formatujDate(zmiana.data.wartosc),
      zrodlo: zmiana.data.zrodlo,
    });
  }
  const pz = w.daneRodziny.matka.platnikZasilku;
  const platnik = platnikZasilkuMatki(p.platnik);
  if (p.forma && p.forma !== 'brak-tytulu') {
    dane.push({ pole: T.dane.platnikZasilku, wartosc: T.platnicyZasilku[platnik], zrodlo: pz?.zrodlo ?? zrodloKonta });
  }
  if (p.ptp) dane.push({ pole: T.dane.ptp, wartosc: formatujDate(p.ptp), zrodlo: 'odpowiedz-rodzica' });
  if (p.zKonta && p.zgoda) {
    const zB = p.ezla.filter((z) => z.kodyLiterowe.includes('B')).length;
    dane.push({ pole: T.dane.ezla, wartosc: p.ezla.length === 0 ? T.dane.brak : T.dane.liczbaEzla({ liczba: String(zB) }), zrodlo: 'konto-zus' });
  }
  if (p.forma === 'jdg') {
    const stan = stanDlaDnia(p.stany, w.wskazanyDzien);
    if (p.zKonta && !p.stanNiedostepny && stan) {
      dane.push({
        pole: T.dane.stanRozliczen,
        wartosc: stan.kwotaZadluzenia === 0
          ? T.dane.bezZadluzenia({ data: formatujDate(stan.dzien) })
          : T.dane.zadluzenieNa({ kwota: formatujKwote(stan.kwotaZadluzenia), data: formatujDate(stan.dzien) }),
        zrodlo: 'konto-zus',
      });
    }
    const potwierdzenie = w.daneRodziny.matka.potwierdzeniaSkladek[w.daneRodziny.matka.potwierdzeniaSkladek.length - 1];
    if (potwierdzenie) {
      dane.push({ pole: T.dane.potwierdzenieSkladek, wartosc: potwierdzenie.miesiac, zrodlo: 'odpowiedz-rodzica' });
    }
  }
  return dane;
}

function regula(idReguly: IdRegulySwiadczenia, wartosci: WartoscSlownika[]): WynikUstaleniaPrawa['zastosowaneReguly'][number] {
  return { idReguly, wartosci: wartosci.map((v) => ({ idWpisu: v.idWpisu, wartosc: v.wartosc, od: v.od })) };
}

function wiersz(wpis: string, wartosc: string, v: WartoscSlownika): WierszWartosciSlownika {
  return { wpis, wartosc, od: v.od };
}

function ustalZasilekChorobowy(w: WejscieUstaleniaPrawa, p: Przygotowanie): UstalenieSwiadczenia {
  const D = w.wskazanyDzien;
  const k = w.katalog;
  const an = analizujUbezpieczenie(p.tytuly, D, k, p.koniecZProfilu);
  const wycz = wartosciWyczekiwania(k, D);
  const prog = progZadluzenia(k, D);
  const stawka = wartoscSlownika(k, WPISY_REGUL.zasilekChorobowyWCiazy, D, ['stawka', 'procent'], 100);
  const reguly: WynikUstaleniaPrawa['zastosowaneReguly'] = [
    regula('podleganie', []),
    regula('okres-wyczekiwania', [wycz.obowiazkowe, wycz.dobrowolne, wycz.przerwa]),
    regula('wyjatki-wyczekiwania', [wycz.absolwent, wycz.lata]),
  ];
  const wartosci: WierszWartosciSlownika[] = [
    wiersz(T.wpisy.wyczekiwanieObowiazkowe, T.jednostki.dni({ liczba: String(wycz.obowiazkowe.wartosc) }), wycz.obowiazkowe),
    wiersz(T.wpisy.wyczekiwanieDobrowolne, T.jednostki.dni({ liczba: String(wycz.dobrowolne.wartosc) }), wycz.dobrowolne),
    wiersz(T.wpisy.wyczekiwaniePrzerwa, T.jednostki.dni({ liczba: String(wycz.przerwa.wartosc) }), wycz.przerwa),
    wiersz(T.wpisy.wyjatekAbsolwenta, T.jednostki.dni({ liczba: String(wycz.absolwent.wartosc) }), wycz.absolwent),
    wiersz(T.wpisy.wyjatek10Lat, T.jednostki.lata({ liczba: String(wycz.lata.wartosc) }), wycz.lata),
  ];
  if (p.forma === 'umowa-o-prace') {
    const limitW = wartoscSlownika(k, WPISY_REGUL.wynagrodzenieChorobowe, D, ['podstawowy', '33-dni', 'dni'], 33);
    const limit50 = wartoscSlownika(k, WPISY_REGUL.wynagrodzenieChorobowe, D, ['po-50', '14-dni'], 14);
    reguly.push(regula('wynagrodzenie-chorobowe', [limitW, limit50]));
    wartosci.push(wiersz(T.wpisy.wynagrodzenie, T.jednostki.dniIDni({ a: String(limitW.wartosc), b: String(limit50.wartosc) }), limitW));
  }
  reguly.push(regula('zasilek-chorobowy', [stawka]), regula('okres-zasilkowy', []), regula('platnik-swiadczenia', []));
  wartosci.push(wiersz(T.wpisy.zasilekWCiazy, T.jednostki.procentPodstawy({ procent: String(stawka.wartosc) }), stawka));
  if (p.forma === 'jdg') {
    reguly.push(regula('zadluzenie', [prog]));
    wartosci.push(wiersz(T.wpisy.progZadluzenia, formatujKwote(prog.wartosc), prog));
  }
  const warunki: string[] = [...T.warunki.zasilekChorobowy];
  const baza = {
    swiadczenie: 'zasilek-chorobowy' as const,
    wskazanyDzien: D,
    zastosowaneReguly: reguly,
    daneZeZrodlem: daneZrodlowe(w, p, an),
    warunkiBezSprawdzenia: warunki,
  };
  const platnikSw = ustalPlatnikaSwiadczenia({ ...p.platnik, swiadczenie: 'zasilek-chorobowy' });
  const wyplaca = platnikSw?.wyplaca ?? opisPlatnikaNieustalonego(p.platnik);
  const platnikNieustalony = platnikSw === null;

  // 1. Brak ubezpieczenia chorobowego.
  const poczatekCiazy = p.ptp ? dodajDni(p.ptp, -280) : dodajDni(D, -280);
  if (an === null || (!an.podlega && an.okres.do !== undefined && porownajDaty(an.okres.do, poczatekCiazy) < 0)) {
    return { wynik: { ...baza, postac: 'nie-przysluguje', przyczyna: { rodzaj: 'brak-ubezpieczenia' }, kodKomunikatu: '0083' }, wartosci, platnikNieustalony };
  }

  // 2. Ustanie ubezpieczenia (z zasiłkiem po ustaniu, gdy niezdolność trwa albo powstała do 14 dni od ustania).
  if (!an.podlega) {
    const ustanie = an.okres.do as DataISO;
    const poUstaniu = wartoscSlownika(k, WPISY_REGUL.zasilekPoUstaniu, D, ['dni-od-ustania', '14-dni'], 14);
    reguly.push(regula('zasilek-po-ustaniu', [poUstaniu]));
    const niezdolnosc = p.ezla.find((z) => porownajDaty(z.od, D) <= 0 && porownajDaty(D, z.do) <= 0) ?? p.ezla.find((z) => z.od === D);
    const trwalaWUbezpieczeniu = niezdolnosc !== undefined && porownajDaty(niezdolnosc.od, ustanie) <= 0;
    const powstalaPo = niezdolnosc !== undefined && porownajDaty(niezdolnosc.od, dodajDni(ustanie, poUstaniu.wartosc)) <= 0
      && roznicaDni(niezdolnosc.od, niezdolnosc.do) + 1 >= 30;
    if (niezdolnosc && (trwalaWUbezpieczeniu || powstalaPo)) {
      return {
        wynik: {
          ...baza, postac: 'przysluguje', od: niezdolnosc.od, do: niezdolnosc.do, wyplaca: T.platnicy.zus, stawka: stawka.wartosc,
          podzial: podzialZaswiadczenia(p.ezla, {
            forma: p.forma, dzienNabycia: an.dzienNabycia, koniecUbezpieczenia: ustanie, rokUrodzenia: p.rokUrodzenia, katalog: k,
            wyplacaZasilek: wyplaca, wyplacaWynagrodzenie: opisPracodawcy(p.tytulGlowny),
          }),
        },
        wartosci, platnikNieustalony: false,
      };
    }
    return {
      wynik: { ...baza, postac: 'nie-przysluguje', przyczyna: { rodzaj: 'ustanie', dzien: ustanie }, kodKomunikatu: '0085', parametryKomunikatu: { data: formatujDate(ustanie) } },
      wartosci, platnikNieustalony: false,
    };
  }

  // 3. Okres wyczekiwania.
  let od = an.dzienNabycia;
  if (porownajDaty(D, an.dzienNabycia) < 0) {
    const niezdolnosc = p.ezla.find((z) => porownajDaty(z.od, D) <= 0 && porownajDaty(D, z.do) <= 0);
    if (!niezdolnosc || porownajDaty(niezdolnosc.do, an.dzienNabycia) < 0) {
      return {
        wynik: {
          ...baza, postac: 'nie-przysluguje',
          przyczyna: { rodzaj: 'okres-wyczekiwania', ostatniDzien: an.ostatniDzienWyczekiwania, dzienNabycia: an.dzienNabycia, dni: an.dniWyczekiwania === 30 ? 30 : 90 },
          kodKomunikatu: '0084', parametryKomunikatu: { data: formatujDate(an.dzienNabycia), liczbaDni: String(an.dniWyczekiwania) },
        },
        wartosci, platnikNieustalony,
      };
    }
    od = an.dzienNabycia;
  }

  // 4. Wyczerpany okres zasiłkowy.
  const oz = okresZasilkowyZ(p, k, w.dzis);
  if (oz && oz.wyczerpany) {
    return {
      wynik: { ...baza, postac: 'nie-przysluguje', przyczyna: { rodzaj: 'wyczerpany-okres-zasilkowy', dzien: oz.dzienWyczerpania }, kodKomunikatu: '0086' },
      wartosci, platnikNieustalony,
    };
  }

  // 5. Zadłużenie ponad próg (jednoosobowa działalność gospodarcza).
  let warunekZadluzenia: Grosze | undefined;
  if (p.forma === 'jdg') {
    if (p.stanNiedostepny) {
      warunekZadluzenia = prog.wartosc;
      warunki.unshift(T.warunki.zadluzenie({ prog: formatujKwote(prog.wartosc) }));
    } else {
      const zadluzenie = sprawdzZadluzenie({ stany: p.stany, dzien: D, prog: prog.wartosc });
      if (zadluzenie) {
        return {
          wynik: {
            ...baza, postac: 'nie-przysluguje', przyczyna: zadluzenie, kodKomunikatu: '0154',
            parametryKomunikatu: { data: formatujDate(zadluzenie.dzienStanu), kwota: formatujKwote(zadluzenie.kwota), prog: formatujKwote(zadluzenie.prog) },
          },
          wartosci, platnikNieustalony,
        };
      }
    }
  }

  const koniec = an.okres.do;
  const ustaniePrzedPorodem = p.koniecZProfilu && porownajDaty(p.koniecZProfilu, w.dzis) > 0
    && (p.ptp === undefined || porownajDaty(p.koniecZProfilu, p.ptp) < 0) ? p.koniecZProfilu : undefined;
  const podzial = p.ezla.length > 0
    ? podzialZaswiadczenia(p.ezla, {
        forma: p.forma, dzienNabycia: an.dzienNabycia, ...(koniec ? { koniecUbezpieczenia: koniec } : {}), rokUrodzenia: p.rokUrodzenia,
        katalog: k, wyplacaZasilek: wyplaca, wyplacaWynagrodzenie: opisPracodawcy(p.tytulGlowny),
      })
    : undefined;
  return {
    wynik: {
      ...baza, postac: 'przysluguje', od, ...(koniec ? { do: koniec } : {}), wyplaca, stawka: stawka.wartosc,
      ...(podzial ? { podzial } : {}),
      ...(warunekZadluzenia !== undefined ? { kodKomunikatu: '0155' as const, parametryKomunikatu: { prog: formatujKwote(warunekZadluzenia) } } : {}),
    },
    wartosci,
    ...(ustaniePrzedPorodem ? { ustaniePrzedPorodem } : {}),
    ...(warunekZadluzenia !== undefined ? { warunekZadluzenia } : {}),
    platnikNieustalony,
  };
}

function ustalRehabilitacyjne(w: WejscieUstaleniaPrawa, p: Przygotowanie): UstalenieSwiadczenia {
  const k = w.katalog;
  const D = w.wskazanyDzien;
  const okres = wartoscSlownika(k, WPISY_REGUL.rehabilitacyjneOkres, D, ['miesiace', 'najwyzej'], 12);
  const stawka = wartoscSlownika(k, WPISY_REGUL.rehabilitacyjneStawka, D, ['w-ciazy', 'ciaza'], 100);
  const pierwsze = wartoscSlownika(k, WPISY_REGUL.rehabilitacyjneStawka, D, ['pierwsze-3-miesiace', 'pierwsze'], 90);
  const dalej = wartoscSlownika(k, WPISY_REGUL.rehabilitacyjneStawka, D, ['pozostaly-okres', 'dalej'], 75);
  const an = analizujUbezpieczenie(p.tytuly, w.dzis, k, p.koniecZProfilu);
  const baza = {
    swiadczenie: 'swiadczenie-rehabilitacyjne' as const,
    wskazanyDzien: D,
    zastosowaneReguly: [regula('swiadczenie-rehabilitacyjne', [okres, pierwsze, dalej, stawka]), regula('platnik-swiadczenia', [])],
    daneZeZrodlem: daneZrodlowe(w, p, an),
    warunkiBezSprawdzenia: [...T.warunki.rehabilitacyjne],
  };
  const wartosci = [
    wiersz(T.wpisy.rehabilitacyjneOkres, T.jednostki.miesiace({ liczba: String(okres.wartosc) }), okres),
    wiersz(T.wpisy.rehabilitacyjneStawka, T.jednostki.trzyStawki({ a: String(pierwsze.wartosc), b: String(dalej.wartosc), c: String(stawka.wartosc) }), stawka),
  ];
  const poUstaniu = an !== null && !an.podlega;
  const platnikSw = ustalPlatnikaSwiadczenia({ ...p.platnik, poUstaniu, swiadczenie: 'swiadczenie-rehabilitacyjne' });
  const wyplaca = platnikSw?.wyplaca ?? opisPlatnikaNieustalonego(p.platnik);
  if (an === null) {
    return { wynik: { ...baza, postac: 'nie-przysluguje', przyczyna: { rodzaj: 'brak-ubezpieczenia' } }, wartosci, platnikNieustalony: false };
  }
  const oz = p.zgoda ? okresZasilkowyZ(p, k, w.dzis) : null;
  if (oz && oz.wyczerpany && porownajDaty(oz.ostatniDzien, w.dzis) >= 0) {
    const od = dodajDni(oz.dzienWyczerpania, 1);
    return {
      wynik: { ...baza, wskazanyDzien: od, postac: 'przysluguje', od, do: dodajDni(dodajMiesiace(od, okres.wartosc), -1), wyplaca, stawka: stawka.wartosc },
      wartosci, platnikNieustalony: platnikSw === null,
    };
  }
  return { wynik: { ...baza, postac: 'warunek', wyplaca, stawka: stawka.wartosc }, wartosci, platnikNieustalony: platnikSw === null };
}

function ustalZwzm(w: WejscieUstaleniaPrawa, p: Przygotowanie): UstalenieSwiadczenia {
  const k = w.katalog;
  const D = w.wskazanyDzien;
  const stawka = wartoscSlownika(k, WPISY_REGUL.zwzm, D, ['stawka', 'procent'], 100);
  const minimum = wartoscSlownika(k, WPISY_REGUL.minimalnaPodstawa, D, ['kwota-grosze'], 414710);
  const an = analizujUbezpieczenie(p.tytuly, w.dzis, k, p.koniecZProfilu);
  const baza = {
    swiadczenie: 'zwzm' as const,
    wskazanyDzien: D,
    zastosowaneReguly: [regula('zwzm', [stawka, minimum])],
    daneZeZrodlem: daneZrodlowe(w, p, an),
    warunkiBezSprawdzenia: [...T.warunki.zwzm],
    wyplaca: T.platnicy.zus,
    stawka: stawka.wartosc,
  };
  const wartosci = [
    wiersz(T.wpisy.zwzm, T.jednostki.procentPodstawy({ procent: String(stawka.wartosc) }), stawka),
    wiersz(T.wpisy.minimalnaPodstawa, formatujKwote(minimum.wartosc), minimum),
  ];
  const zmiana = w.daneRodziny.matka.zmianaZatrudnienia;
  const przyczyna = zmiana?.przyczyna?.wartosc;
  const ustanie = zmiana?.rodzaj.wartosc === 'ustanie' ? zmiana.data?.wartosc ?? an?.okres.do : undefined;
  const dzienPorodu = p.dataPorodu ?? p.ptp;
  const kwalifikuje = p.forma === 'umowa-o-prace' && ustanie !== undefined && przyczyna !== undefined
    && (PRZYCZYNY_ZWZM as readonly string[]).includes(przyczyna) && zmiana?.inneZatrudnienie?.wartosc !== true;
  if (kwalifikuje && ustanie && dzienPorodu) {
    const od = dodajDni(ustanie, 1);
    const koniec = dodajDni(dzienPorodu, -1);
    if (porownajDaty(od, koniec) <= 0) {
      return { wynik: { ...baza, wskazanyDzien: od, postac: 'przysluguje', od, do: koniec }, wartosci, platnikNieustalony: false };
    }
  }
  return { wynik: { ...baza, postac: 'warunek' }, wartosci, platnikNieustalony: false };
}

function ustalMacierzynski(w: WejscieUstaleniaPrawa, p: Przygotowanie): UstalenieSwiadczenia {
  const k = w.katalog;
  const D = w.wskazanyDzien;
  const an = analizujUbezpieczenie(p.tytuly, D, k, p.koniecZProfilu);
  const wariant = wartoscSlownika(k, WPISY_REGUL.zasilekMacierzynski, D, ['81-5', 'wariant-81-5'], 81.5);
  const baza = {
    swiadczenie: 'zasilek-macierzynski' as const,
    wskazanyDzien: D,
    zastosowaneReguly: [regula('zasilek-macierzynski-bez-wyczekiwania', [wariant]), regula('platnik-swiadczenia', [])],
    daneZeZrodlem: daneZrodlowe(w, p, an),
    warunkiBezSprawdzenia: [] as string[],
  };
  const wartosci = [wiersz(T.wpisy.macierzynski, T.jednostki.procentPodstawy({ procent: String(wariant.wartosc) }), wariant)];
  if (an === null) {
    return { wynik: { ...baza, postac: 'nie-przysluguje', przyczyna: { rodzaj: 'brak-ubezpieczenia' } }, wartosci, platnikNieustalony: false };
  }
  if (!an.podlega) {
    const zmiana = w.daneRodziny.matka.zmianaZatrudnienia;
    const przyczyna = zmiana?.przyczyna?.wartosc;
    const chroniona = (przyczyna !== undefined && (PRZYCZYNY_MACIERZYNSKIEGO as readonly string[]).includes(przyczyna))
      || zmiana?.umowaPrzedluzonaDoPorodu === true;
    if (chroniona) {
      return { wynik: { ...baza, postac: 'przysluguje', od: D, wyplaca: T.platnicy.zus }, wartosci, platnikNieustalony: false };
    }
    return { wynik: { ...baza, postac: 'nie-przysluguje', przyczyna: { rodzaj: 'ustanie', dzien: an.okres.do as DataISO } }, wartosci, platnikNieustalony: false };
  }
  if (p.forma === 'jdg' && !p.stanNiedostepny) {
    const prog = progZadluzenia(k, D);
    const zadluzenie = sprawdzZadluzenie({ stany: p.stany, dzien: D, prog: prog.wartosc });
    if (zadluzenie) return { wynik: { ...baza, postac: 'nie-przysluguje', przyczyna: zadluzenie }, wartosci, platnikNieustalony: false };
  }
  const platnikSw = ustalPlatnikaSwiadczenia({ ...p.platnik, swiadczenie: 'zasilek-macierzynski' });
  return {
    wynik: { ...baza, postac: 'przysluguje', od: D, wyplaca: platnikSw?.wyplaca ?? opisPlatnikaNieustalonego(p.platnik) },
    wartosci, platnikNieustalony: platnikSw === null,
  };
}

/** Ustalenie prawa z wierszami wartości słowników i informacjami dla ekranu świadczeń w ciąży. */
export function ustalSwiadczenie(w: WejscieUstaleniaPrawa): UstalenieSwiadczenia {
  const p = przygotuj(w);
  switch (w.swiadczenie) {
    case 'zasilek-chorobowy':
      return ustalZasilekChorobowy(w, p);
    case 'swiadczenie-rehabilitacyjne':
      return ustalRehabilitacyjne(w, p);
    case 'zwzm':
      return ustalZwzm(w, p);
    default:
      return ustalMacierzynski(w, p);
  }
}

/** Prawo do świadczenia we wskazanym dniu (K24, K25, K26 i zasiłek macierzyński). */
export function ustalPrawo(w: WejscieUstaleniaPrawa): WynikUstaleniaPrawa {
  return ustalSwiadczenie(w).wynik;
}

// --- Komplet świadczeń w ciąży -----------------------------------------------------------------

export type WejscieSwiadczen = Omit<WejscieUstaleniaPrawa, 'swiadczenie' | 'wskazanyDzien'>;

export interface SwiadczeniaWCiazy {
  tryb: 'konto-zus' | 'profil-rodziny';
  zgoda: boolean;
  forma: FormaZatrudnienia | null;
  poUstaniu: boolean;
  zasilekChorobowy: UstalenieSwiadczenia;
  rehabilitacyjne: UstalenieSwiadczenia;
  zwzm: UstalenieSwiadczenia;
  macierzynski: UstalenieSwiadczenia;
  okresZasilkowy: OkresZasilkowy | null;
  liczbaEzla: number;
  tytul?: TytulUbezpieczenia;
}

/** Wskazane dni czterech świadczeń zgodnie z regułą Ustalenie prawa (ANALIZY/05 sekcja 5.2). */
export function wskazaneDni(w: WejscieSwiadczen): Record<SwiadczenieWCiazy, DataISO> {
  const p = przygotuj({ ...w, swiadczenie: 'zasilek-chorobowy', wskazanyDzien: w.dzis });
  const lancuch = lancuchZaswiadczen(p.ezla, w.katalog, w.dzis);
  const oz = okresZasilkowyZ(p, w.katalog, w.dzis);
  const zmiana = w.daneRodziny.matka.zmianaZatrudnienia;
  const ustanie = zmiana?.rodzaj.wartosc === 'ustanie' ? zmiana.data?.wartosc : undefined;
  return {
    'zasilek-chorobowy': lancuch[0]?.od ?? w.dzis,
    'swiadczenie-rehabilitacyjne': oz ? dodajDni(oz.dzienWyczerpania, 1) : w.dzis,
    zwzm: ustanie ? dodajDni(ustanie, 1) : w.dzis,
    'zasilek-macierzynski': p.dataPorodu ?? p.ptp ?? w.dzis,
  };
}

/** Wynik czterech świadczeń, okres zasiłkowy i wynagrodzenie chorobowe dla ekranu ViewPregnancyBenefits i planu. */
export function ustalSwiadczeniaWCiazy(w: WejscieSwiadczen): SwiadczeniaWCiazy {
  const dniWsk = wskazaneDni(w);
  const ustal = (s: SwiadczenieWCiazy) => ustalSwiadczenie({ ...w, swiadczenie: s, wskazanyDzien: dniWsk[s] });
  const p = przygotuj({ ...w, swiadczenie: 'zasilek-chorobowy', wskazanyDzien: w.dzis });
  const an = analizujUbezpieczenie(p.tytuly, w.dzis, w.katalog, p.koniecZProfilu);
  return {
    tryb: p.zKonta ? 'konto-zus' : 'profil-rodziny',
    zgoda: p.zgoda,
    forma: p.forma,
    poUstaniu: an !== null && !an.podlega,
    zasilekChorobowy: ustal('zasilek-chorobowy'),
    rehabilitacyjne: ustal('swiadczenie-rehabilitacyjne'),
    zwzm: ustal('zwzm'),
    macierzynski: ustal('zasilek-macierzynski'),
    okresZasilkowy: okresZasilkowyZ(p, w.katalog, w.dzis),
    liczbaEzla: p.ezla.length,
    ...(p.tytulGlowny ? { tytul: p.tytulGlowny } : {}),
  };
}
