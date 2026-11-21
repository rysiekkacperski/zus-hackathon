// Warunki spraw planu według pozycji katalogu K01–K37 (kontrakt, sekcja 7.2; historyjka 3.6.1.1.1,
// wymagania Warunki spraw, Sprawy przed porodem, Statusy spraw, Dochód nieznany i Plan bez zgody).
// Właściciel: u08 (Silnik planu rodziny).
//
// Każdy warunek jest czystą funkcją wejścia planu. Wynik podaje, czy rodzina spełnia warunek, któremu
// rodzicowi przypada sprawa, czy sprawa wymaga uzupełnienia profilu (plan bez danych ciąży i dziecka),
// czy przypada po porodzie, czy zależy od dochodu i czy profil wskazuje jej załatwienie (K01).
import { wartoscObowiazujaca } from '@/domena/katalog/odczyt';
import { dodajDni, wiekWLatach } from '@/domena/daty';
import type { WejsciePlanu } from '@/domena/przeliczenie';
import { okresZasilkowyWCiazy } from '@/domena/zasilki/okres-zasilkowy';
import type {
  DaneCiazyIDziecka,
  DataISO,
  Etap,
  FormaZatrudnienia,
  FormaZatrudnieniaDrugiegoRodzica,
  Grosze,
  IdPozycji,
  IdWpisuSlownika,
  Katalog,
  PozycjaKatalogu,
  PrzyczynaUstaniaUmowy,
  RodzajPozycji,
  RodzicPozycji,
  RodzicSprawy,
  RodzicWRodzinie,
  WpisSlownika,
} from '@/domena/typy';

// --- Wynik warunku ------------------------------------------------------------------------------

export interface WynikWarunku {
  spelniony: boolean;
  rodzic: RodzicSprawy;
  /** Warunek zależy od Danych ciąży i dziecka, których plan nie ma (brak zgody albo brak danych). */
  wymagaUzupelnienia?: boolean;
  /** Warunek „dziecko się urodziło” spełniony w przyszłości (przed potwierdzeniem daty porodu). */
  poPorodzie?: boolean;
  /** Dochód na osobę jest nieznany, a warunek zależy od progu dochodowego. */
  zalezyOdDochodu?: boolean;
  /** Profil wskazuje załatwienie sprawy (K01: wizyta do końca 10. tygodnia ciąży). */
  zalatwiona?: boolean;
  /** Rodzice spełniający warunek sprawy „każdy rodzic na umowie o pracę” (osobna sprawa na rodzica). */
  rodzice?: RodzicWRodzinie[];
}

export type WarunekSprawy = (w: WejsciePlanu) => WynikWarunku;

// --- Fakty rodziny --------------------------------------------------------------------------------

/** Liczba dni od końca 10. tygodnia ciąży do przewidywanego terminu porodu (280 − 69 dni). */
export const DNI_OD_KONCA_10_TYGODNIA_DO_TERMINU = 211;

const PRZYCZYNY_ZASILKU_MACIERZYNSKIEGO: readonly PrzyczynaUstaniaUmowy[] = [
  'upadlosc',
  'likwidacja',
  'smierc-pracodawcy',
  'naruszenie-z-wyrokiem',
];
const PRZYCZYNY_K26: readonly PrzyczynaUstaniaUmowy[] = ['upadlosc', 'likwidacja', 'smierc-pracodawcy'];

export interface FaktyRodziny {
  formaMatki: FormaZatrudnienia | null;
  duchMatki: boolean;
  formaDrugiegoRodzica: FormaZatrudnieniaDrugiegoRodzica | null;
  duchDrugiegoRodzica: boolean;
  jestDrugiRodzic: boolean;
  /** Matka podlega ubezpieczeniu chorobowemu: umowa o pracę albo umowa zlecenia lub JDG z DUCh. */
  matkaPodlega: boolean;
  drugiRodzicPodlega: boolean;
  /** Profil zawiera Dane ciąży i dziecka (zgoda i przewidywany termin porodu, poród albo przyjęcie). */
  znaneDaneCiazy: boolean;
  daneCiazy: DaneCiazyIDziecka | null;
  /** Data porodu potwierdzona. */
  urodzone: boolean;
  /** Dziecko się nie urodziło; bez danych ciąży warunek traktujemy jako spełniony. */
  wCiazy: boolean;
  przewidywanyTerminPorodu?: DataISO;
  koniec10Tygodnia?: DataISO;
  /** Pierwsza wizyta: true do końca 10. tygodnia, false później, null gdy wizyta się nie odbyła albo brak danych. */
  wizytaWTerminie: boolean | null;
  wizytaOdbyla: boolean;
  liczbaDzieci: number;
  dochod: Grosze | 'nieznany';
  /** Ustanie zatrudnienia matki w ciąży według profilu. */
  ustanie: {
    forma?: Exclude<FormaZatrudnienia, 'brak-tytulu'>;
    data?: DataISO;
    przyczyna?: PrzyczynaUstaniaUmowy;
    inneZatrudnienie: boolean;
    przedluzonaDoPorodu: boolean;
  } | null;
  rozpoczecieWCiazy: boolean;
  /** Umowa o pracę matki ustała w ciąży z przyczyny dającej zasiłek macierzyński (K08). */
  ustanieDajeZasilekMacierzynski: boolean;
  /** Umowa o pracę matki ustała w ciąży z przyczyny dającej zasiłek w wysokości zasiłku macierzyńskiego (K26). */
  ustanieDajeK26: boolean;
  /** Ubezpieczenie chorobowe matki ustało w ciąży (K24). */
  choroboweUstaloWCiazy: boolean;
}

function podlegaChorobowemu(forma: FormaZatrudnieniaDrugiegoRodzica | null, duch: boolean): boolean {
  if (forma === 'umowa-o-prace') return true;
  return (forma === 'umowa-zlecenia' || forma === 'jdg') && duch;
}

function liczbaDzieciRodziny(d: DaneCiazyIDziecka | null, urodzone: boolean): number {
  if (d === null) return 1;
  if (d.przyjecie && !d.przewidywanyTerminPorodu && !urodzone) return d.przyjecie.liczbaPrzyjetychDzieci;
  const liczba = urodzone ? (d.liczbaUrodzonychDzieci ?? d.liczbaDzieciZCiazy) : d.liczbaDzieciZCiazy;
  return liczba ?? 1;
}

const pamiecFaktow = new WeakMap<WejsciePlanu, FaktyRodziny>();

/** Fakty rodziny wyliczone raz dla wejścia planu. */
export function faktyRodziny(w: WejsciePlanu): FaktyRodziny {
  const zapamietane = pamiecFaktow.get(w);
  if (zapamietane) return zapamietane;

  const { matka, drugiRodzic } = w.daneRodziny;
  const formaMatki = matka.formaZatrudnienia?.wartosc ?? null;
  const duchMatki = matka.dobrowolneChorobowe?.wartosc === true;
  const formaDrugiegoRodzica = drugiRodzic.formaZatrudnienia?.wartosc ?? null;
  const duchDrugiegoRodzica = drugiRodzic.dobrowolneChorobowe?.wartosc === true;
  const jestDrugiRodzic = formaDrugiegoRodzica !== null && formaDrugiegoRodzica !== 'brak-drugiego-rodzica';

  const daneCiazy = w.zgoda ? w.daneCiazy : null;
  const ptp = daneCiazy?.przewidywanyTerminPorodu;
  const urodzone = daneCiazy !== null && daneCiazy.dataPoroduPotwierdzona && daneCiazy.dataPorodu !== undefined;
  const przyjecieBezCiazy = daneCiazy?.przyjecie !== undefined && ptp === undefined && !urodzone;
  const znaneDaneCiazy = daneCiazy !== null && (ptp !== undefined || urodzone || przyjecieBezCiazy);
  const wCiazy = znaneDaneCiazy ? !urodzone && !przyjecieBezCiazy : true;

  const koniec10Tygodnia = ptp ? dodajDni(ptp, -DNI_OD_KONCA_10_TYGODNIA_DO_TERMINU) : undefined;
  const wizyta = daneCiazy?.dataPierwszejWizyty;
  const wizytaOdbyla = wizyta !== undefined && wizyta !== 'brak-wizyty';
  const wizytaWTerminie =
    wizytaOdbyla && koniec10Tygodnia !== undefined ? (wizyta as DataISO) <= koniec10Tygodnia : null;

  const zmiana = matka.zmianaZatrudnienia;
  const rodzajZmiany = zmiana?.rodzaj.wartosc ?? 'bez-zmian';
  const ustanie =
    zmiana && rodzajZmiany === 'ustanie'
      ? {
          forma: zmiana.forma?.wartosc,
          data: zmiana.data?.wartosc,
          przyczyna: zmiana.przyczyna?.wartosc,
          inneZatrudnienie: zmiana.inneZatrudnienie?.wartosc === true,
          przedluzonaDoPorodu: zmiana.umowaPrzedluzonaDoPorodu === true,
        }
      : null;
  const ustanieUmowyOPrace = ustanie !== null && ustanie.forma === 'umowa-o-prace';
  const ustanieDajeZasilekMacierzynski =
    ustanieUmowyOPrace && ustanie.przyczyna !== undefined && PRZYCZYNY_ZASILKU_MACIERZYNSKIEGO.includes(ustanie.przyczyna);
  const ustanieDajeK26 =
    ustanieUmowyOPrace &&
    ustanie.przyczyna !== undefined &&
    PRZYCZYNY_K26.includes(ustanie.przyczyna) &&
    !ustanie.inneZatrudnienie;
  const choroboweUstaloWCiazy =
    ustanie !== null && (ustanie.forma === 'umowa-o-prace' || ((ustanie.forma === 'umowa-zlecenia' || ustanie.forma === 'jdg') && duchMatki));

  const dochodZProfilu = w.daneRodziny.dochodNaOsobe?.wartosc;
  const fakty: FaktyRodziny = {
    formaMatki,
    duchMatki,
    formaDrugiegoRodzica,
    duchDrugiegoRodzica,
    jestDrugiRodzic,
    matkaPodlega: podlegaChorobowemu(formaMatki, duchMatki),
    drugiRodzicPodlega: jestDrugiRodzic && podlegaChorobowemu(formaDrugiegoRodzica, duchDrugiegoRodzica),
    znaneDaneCiazy,
    daneCiazy,
    urodzone,
    wCiazy,
    przewidywanyTerminPorodu: ptp,
    koniec10Tygodnia,
    wizytaWTerminie,
    wizytaOdbyla,
    liczbaDzieci: liczbaDzieciRodziny(daneCiazy, urodzone),
    dochod: dochodZProfilu === undefined ? 'nieznany' : dochodZProfilu,
    ustanie,
    rozpoczecieWCiazy: rodzajZmiany === 'rozpoczecie',
    ustanieDajeZasilekMacierzynski,
    ustanieDajeK26,
    choroboweUstaloWCiazy,
  };
  pamiecFaktow.set(w, fakty);
  return fakty;
}

// --- Słownik kwot i progów ------------------------------------------------------------------------

/** Wpis słownika kwot i progów, z którego korzysta warunek albo kwota sprawy. */
export type RodzajKwoty =
  | 'swiadczenie-wychowawcze'
  | 'becikowe'
  | 'prog-becikowego'
  | 'dodatek-z-tytulu-urodzenia'
  | 'prog-zasilku-rodzinnego'
  | 'swiadczenie-rodzicielskie'
  | 'za-zyciem';

interface OpisKwoty {
  /** Fragmenty nazwy wpisu (małe litery, bez polskich znaków), które muszą wystąpić w nazwie. */
  nazwa: string[];
  /** Fragmenty, które nie mogą wystąpić w nazwie. */
  bez?: string[];
  /** Wartość z wymagań historyjek, gdy katalog nie zawiera wpisu. */
  domyslnie: Grosze;
}

const OPISY_KWOT: Record<RodzajKwoty, OpisKwoty> = {
  'swiadczenie-wychowawcze': { nazwa: ['wychowawcze'], domyslnie: 80000 },
  becikowe: { nazwa: ['becikowe'], bez: ['prog'], domyslnie: 100000 },
  'prog-becikowego': { nazwa: ['prog', 'becikow'], domyslnie: 192200 },
  'dodatek-z-tytulu-urodzenia': { nazwa: ['dodatek', 'urodzenia'], domyslnie: 100000 },
  'prog-zasilku-rodzinnego': { nazwa: ['prog', 'zasilku rodzinnego'], domyslnie: 67400 },
  'swiadczenie-rodzicielskie': { nazwa: ['swiadczenie rodzicielskie'], domyslnie: 100000 },
  'za-zyciem': { nazwa: ['za zyciem'], domyslnie: 400000 },
};

function normalizuj(tekst: string): string {
  return tekst
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')
    .replace(/[„”"]/g, '')
    .replace(/\s+/g, ' ');
}

function wpisWedlugNazwy(k: Katalog, rodzaj: RodzajKwoty): WpisSlownika | undefined {
  const opis = OPISY_KWOT[rodzaj];
  return k.slowniki.find((wpis) => {
    if (wpis.slownik !== 'kwoty-i-progi') return false;
    const nazwa = normalizuj(wpis.nazwa);
    return opis.nazwa.every((f) => nazwa.includes(f)) && !(opis.bez ?? []).some((f) => nazwa.includes(f));
  });
}

/** Wartość pierwszego wariantu wpisu obowiązująca w dniu `dzien` (od ≤ dzien ≤ do). */
function wartoscWpisu(k: Katalog, wpis: WpisSlownika, dzien: DataISO): number | null {
  const klucz = wpis.warianty[0]?.klucz;
  if (klucz !== undefined) {
    const obowiazujaca = wartoscObowiazujaca(k, wpis.id, dzien, klucz);
    if (obowiazujaca !== null) return obowiazujaca.wartosc;
  }
  const wersja = wpis.wersje.find((v) => v.od <= dzien && (v.do === undefined || dzien <= v.do));
  if (!wersja) return null;
  const wartosc = klucz !== undefined ? wersja.wartosci[klucz] : Object.values(wersja.wartosci)[0];
  return typeof wartosc === 'number' ? wartosc : null;
}

/**
 * Kwota albo próg ze słownika kwot i progów w groszach, obowiązujące w dniu `dzien`. Wpis wskazuje
 * identyfikator z kosztu spóźnienia pozycji katalogu albo nazwa wpisu; bez wpisu wartość z wymagań historyjek.
 */
export function kwotaZeSlownika(k: Katalog, rodzaj: RodzajKwoty, dzien: DataISO, idWpisu?: IdWpisuSlownika): Grosze {
  const wpis = (idWpisu !== undefined ? k.slowniki.find((s) => s.id === idWpisu) : undefined) ?? wpisWedlugNazwy(k, rodzaj);
  const wartosc = wpis ? wartoscWpisu(k, wpis, dzien) : null;
  return wartosc ?? OPISY_KWOT[rodzaj].domyslnie;
}

function kosztKwotowy(k: Katalog, id: IdPozycji): { idWpisuKwoty?: IdWpisuSlownika; idWpisuProgu?: IdWpisuSlownika; naDziecko?: boolean } {
  const koszt = k.pozycje.find((p) => p.id === id)?.kosztSpoznienia;
  return koszt?.typ === 'kwota' ? { idWpisuKwoty: koszt.idWpisuKwoty, idWpisuProgu: koszt.idWpisuProgu, naDziecko: koszt.naDziecko } : {};
}

/** Próg dochodu na osobę sprawy K14 albo K15 w dniu `dzien`. */
export function progDochodowy(k: Katalog, id: 'K14' | 'K15', dzien: DataISO): Grosze {
  const rodzaj: RodzajKwoty = id === 'K14' ? 'prog-becikowego' : 'prog-zasilku-rodzinnego';
  return kwotaZeSlownika(k, rodzaj, dzien, kosztKwotowy(k, id).idWpisuProgu);
}

/** Kwota świadczenia przy sprawie (na rodzinę, z liczbą dzieci), gdy pozycja ma kwotę ze słownika. */
export function kwotaSprawy(
  k: Katalog,
  id: IdPozycji,
  liczbaDzieci: number,
  dzien: DataISO,
): { kwota: Grosze; okres: 'jednorazowo' | 'miesiecznie' } | undefined {
  const opis = KWOTY_SPRAW[id];
  if (!opis) return undefined;
  const koszt = kosztKwotowy(k, id);
  const kwota = kwotaZeSlownika(k, opis.rodzaj, dzien, koszt.idWpisuKwoty);
  const naDziecko = koszt.naDziecko ?? opis.naDziecko;
  return { kwota: naDziecko ? kwota * liczbaDzieci : kwota, okres: opis.okres };
}

const KWOTY_SPRAW: Partial<Record<IdPozycji, { rodzaj: RodzajKwoty; okres: 'jednorazowo' | 'miesiecznie'; naDziecko: boolean }>> = {
  K12: { rodzaj: 'swiadczenie-wychowawcze', okres: 'miesiecznie', naDziecko: true },
  K13: { rodzaj: 'swiadczenie-wychowawcze', okres: 'miesiecznie', naDziecko: true },
  K14: { rodzaj: 'becikowe', okres: 'jednorazowo', naDziecko: true },
  K15: { rodzaj: 'dodatek-z-tytulu-urodzenia', okres: 'jednorazowo', naDziecko: true },
  K16: { rodzaj: 'swiadczenie-rodzicielskie', okres: 'miesiecznie', naDziecko: false },
  K17: { rodzaj: 'za-zyciem', okres: 'jednorazowo', naDziecko: true },
};

// --- Metadane pozycji -------------------------------------------------------------------------------

/** Etap, rodzaj i rodzic pozycji K01–K37 z tabeli katalogu 3.5.1.1.1, gdy katalog nie zawiera pozycji. */
export const METADANE_POZYCJI: Record<string, { etap: Etap; rodzaj: RodzajPozycji; rodzic: RodzicPozycji }> = {
  K01: { etap: 'ciaza', rodzaj: 'obowiazek', rodzic: 'matka' },
  K02: { etap: 'ciaza', rodzaj: 'obowiazek', rodzic: 'oboje-rodzice' },
  K03: { etap: 'ciaza', rodzaj: 'obowiazek', rodzic: 'matka' },
  K04: { etap: 'ciaza', rodzaj: 'uprawnienie', rodzic: 'matka' },
  K05: { etap: 'pierwsze-tygodnie', rodzaj: 'obowiazek', rodzic: 'matka-a-bez-tytulu-drugi-rodzic' },
  K06: { etap: 'pierwsze-tygodnie', rodzaj: 'obowiazek', rodzic: 'matka-albo-ojciec' },
  K07: { etap: 'urlopy-i-zasilek', rodzaj: 'obowiazek', rodzic: 'matka' },
  K08: { etap: 'urlopy-i-zasilek', rodzaj: 'swiadczenie', rodzic: 'matka' },
  K09: { etap: 'urlopy-i-zasilek', rodzaj: 'uprawnienie', rodzic: 'drugi-rodzic' },
  K10: { etap: 'urlopy-i-zasilek', rodzaj: 'uprawnienie', rodzic: 'drugi-rodzic' },
  K11: { etap: 'urlopy-i-zasilek', rodzaj: 'uprawnienie', rodzic: 'matka' },
  K12: { etap: 'pieniadze-na-dziecko', rodzaj: 'swiadczenie', rodzic: 'matka-albo-ojciec' },
  K13: { etap: 'pieniadze-na-dziecko', rodzaj: 'swiadczenie', rodzic: 'matka-albo-ojciec' },
  K14: { etap: 'pieniadze-na-dziecko', rodzaj: 'swiadczenie', rodzic: 'matka-albo-ojciec' },
  K15: { etap: 'pieniadze-na-dziecko', rodzaj: 'swiadczenie', rodzic: 'matka-albo-ojciec' },
  K16: { etap: 'pieniadze-na-dziecko', rodzaj: 'swiadczenie', rodzic: 'matka-albo-ojciec' },
  K17: { etap: 'pieniadze-na-dziecko', rodzaj: 'swiadczenie', rodzic: 'matka-albo-ojciec' },
  K18: { etap: 'pieniadze-na-dziecko', rodzaj: 'swiadczenie', rodzic: 'matka-albo-ojciec' },
  K19: { etap: 'urlopy-i-zasilek', rodzaj: 'obowiazek', rodzic: 'matka' },
  K20: { etap: 'powrot-do-pracy', rodzaj: 'uprawnienie', rodzic: 'matka' },
  K21: { etap: 'powrot-do-pracy', rodzaj: 'uprawnienie', rodzic: 'kazdy-rodzic-na-umowie-o-prace' },
  K22: { etap: 'powrot-do-pracy', rodzaj: 'swiadczenie', rodzic: 'matka-albo-ojciec' },
  K23: { etap: 'powrot-do-pracy', rodzaj: 'uprawnienie', rodzic: 'kazdy-rodzic-na-umowie-o-prace' },
  K24: { etap: 'ciaza', rodzaj: 'swiadczenie', rodzic: 'matka' },
  K25: { etap: 'ciaza', rodzaj: 'swiadczenie', rodzic: 'matka' },
  K26: { etap: 'ciaza', rodzaj: 'swiadczenie', rodzic: 'matka' },
  K27: { etap: 'ciaza', rodzaj: 'informacja', rodzic: 'matka' },
  K28: { etap: 'ciaza', rodzaj: 'informacja', rodzic: 'matka' },
  K29: { etap: 'ciaza', rodzaj: 'informacja', rodzic: 'matka' },
  K30: { etap: 'ciaza', rodzaj: 'uprawnienie', rodzic: 'kazdy-rodzic-na-umowie-o-prace' },
  K31: { etap: 'urlopy-i-zasilek', rodzaj: 'obowiazek', rodzic: 'rodzic-przyjmujacy' },
  K32: { etap: 'urlopy-i-zasilek', rodzaj: 'swiadczenie', rodzic: 'rodzic-przyjmujacy' },
  K33: { etap: 'urlopy-i-zasilek', rodzaj: 'informacja', rodzic: 'rodzic-przyjmujacy' },
  K34: { etap: 'urlopy-i-zasilek', rodzaj: 'swiadczenie', rodzic: 'matka' },
  K35: { etap: 'pierwsze-tygodnie', rodzaj: 'informacja', rodzic: 'oboje-rodzice' },
  K36: { etap: 'pierwsze-tygodnie', rodzaj: 'uprawnienie', rodzic: 'matka-albo-ojciec' },
  K37: { etap: 'urlopy-i-zasilek', rodzaj: 'uprawnienie', rodzic: 'kazdy-rodzic-na-umowie-o-prace' },
};

/** Pozycje z osobną sprawą na każdego rodzica na umowie o pracę. */
export function czySprawaNaRodzica(p: Pick<PozycjaKatalogu, 'rodzic'>): boolean {
  return p.rodzic === 'kazdy-rodzic-na-umowie-o-prace';
}

// --- Budowanie wyników --------------------------------------------------------------------------------

const NIE: WynikWarunku = { spelniony: false, rodzic: 'matka' };

function tak(rodzic: RodzicSprawy, dodatkowe: Omit<WynikWarunku, 'spelniony' | 'rodzic'> = {}): WynikWarunku {
  return { spelniony: true, rodzic, ...dodatkowe };
}

/** Warunek „dziecko się nie urodziło” razem z warunkiem rodziny; bez danych ciąży traktowany jako spełniony. */
function przedPorodem(f: FaktyRodziny, warunek: boolean, rodzic: RodzicSprawy = 'matka'): WynikWarunku {
  return warunek && f.wCiazy ? tak(rodzic) : NIE;
}

/**
 * Warunek „dziecko się urodziło” razem z warunkiem rodziny. Bez danych ciąży i dziecka sprawa wymaga
 * uzupełnienia profilu; przed potwierdzeniem daty porodu jest spełniony w przyszłości (oznaczenie po porodzie).
 */
function poUrodzeniu(f: FaktyRodziny, warunek: boolean, rodzic: RodzicSprawy = 'matka-albo-ojciec', dodatkowe: Omit<WynikWarunku, 'spelniony' | 'rodzic'> = {}): WynikWarunku {
  if (!warunek) return NIE;
  if (!f.znaneDaneCiazy) return tak(rodzic, { ...dodatkowe, wymagaUzupelnienia: true });
  return tak(rodzic, { ...dodatkowe, poPorodzie: !f.urodzone });
}

function naUmowieOPrace(f: FaktyRodziny, rodzic: RodzicWRodzinie): boolean {
  return rodzic === 'matka' ? f.formaMatki === 'umowa-o-prace' : f.jestDrugiRodzic && f.formaDrugiegoRodzica === 'umowa-o-prace';
}

function kazdyRodzicNaUmowieOPrace(f: FaktyRodziny): WynikWarunku {
  const rodzice = (['matka', 'drugi-rodzic'] as const).filter((r) => naUmowieOPrace(f, r));
  if (rodzice.length === 0) return NIE;
  return tak(rodzice.length === 2 ? 'oboje-rodzice' : rodzice[0], { rodzice: [...rodzice] });
}

/** Próg dochodowy K14 i K15: dochód na osobę nie przekracza progu albo jest nieznany. */
function warunekDochodu(w: WejsciePlanu, f: FaktyRodziny, id: 'K14' | 'K15'): { spelniony: boolean; zalezyOdDochodu: boolean } {
  if (f.dochod === 'nieznany') return { spelniony: true, zalezyOdDochodu: true };
  return { spelniony: f.dochod <= progDochodowy(w.katalog, id, w.dzis), zalezyOdDochodu: false };
}

/** Sprawy wymagające wizyty do końca 10. tygodnia ciąży (K14, K15, K17) bez danych ciąży: uzupełnienie profilu. */
function zWizytaWTerminie(f: FaktyRodziny, warunek: boolean, dodatkowe: Omit<WynikWarunku, 'spelniony' | 'rodzic'> = {}): WynikWarunku {
  if (!warunek) return NIE;
  if (!f.znaneDaneCiazy) return tak('matka-albo-ojciec', { ...dodatkowe, wymagaUzupelnienia: true });
  if (f.wizytaWTerminie !== true) return NIE;
  return tak('matka-albo-ojciec', { ...dodatkowe, poPorodzie: !f.urodzone });
}

/** Okres zasiłkowy zasiłku chorobowego w ciąży z e-ZLA kończy się przed przewidywanym terminem porodu (K25). */
function okresZasilkowyPrzedTerminem(w: WejsciePlanu, f: FaktyRodziny): boolean {
  const ptp = f.przewidywanyTerminPorodu;
  const kopia = w.daneZusMatki;
  if (!ptp || !kopia || kopia.zaswiadczeniaEzla.length === 0) return false;
  const poczatekCiazy = dodajDni(ptp, -280);
  const wCiazy = kopia.zaswiadczeniaEzla.filter((z) => z.rodzaj === 'choroba' && z.do >= poczatekCiazy);
  if (wCiazy.length === 0) return false;
  const wynik = okresZasilkowyWCiazy(wCiazy, OKRES_ZASILKOWY_W_CIAZY_DNI, PRZERWA_OKRESU_ZASILKOWEGO_DNI);
  return wynik.dataWyczerpania !== null && wynik.dataWyczerpania < ptp;
}

/** Okres zasiłkowy, gdy niezdolność przypada w ciąży, i przerwa w jednym okresie zasiłkowym (słownik wymiarów). */
const OKRES_ZASILKOWY_W_CIAZY_DNI = 270;
const PRZERWA_OKRESU_ZASILKOWEGO_DNI = 60;

/** Inny tytuł matki z ubezpieczeniem chorobowym w dniu przewidywanego terminu porodu (K29). */
function innyTytulZChorobowymWDniuTerminu(w: WejsciePlanu, f: FaktyRodziny): boolean {
  const formaUstania = f.ustanie?.forma;
  if (f.matkaPodlega && f.formaMatki !== formaUstania) return true;
  const ptp = f.przewidywanyTerminPorodu;
  const kopia = w.daneZusMatki;
  if (!ptp || !kopia) return false;
  const rodzajUstania = formaUstania === 'umowa-o-prace' ? 'pracownik' : formaUstania === 'umowa-zlecenia' ? 'zleceniobiorca' : 'dzialalnosc';
  return kopia.tytuly.some(
    (t) =>
      t.rodzaj !== rodzajUstania &&
      t.od <= ptp &&
      (t.do === undefined || ptp <= t.do) &&
      t.ubezpieczenieChorobowe.rodzaj !== 'brak' &&
      (t.ubezpieczenieChorobowe.do === undefined || ptp <= t.ubezpieczenieChorobowe.do),
  );
}

/** Wiek dziecka w latach w dniu `dzis` (data porodu albo urodzenia pierwszego dziecka profilu). */
function wiekDziecka(f: FaktyRodziny, dzis: DataISO): number | null {
  const d = f.daneCiazy;
  const dataUrodzenia = d?.dataPorodu ?? d?.dzieci.find((dz) => dz.dataUrodzenia)?.dataUrodzenia ?? d?.przyjecie?.dataUrodzeniaDziecka;
  return dataUrodzenia ? wiekWLatach(dataUrodzenia, dzis) : null;
}

// --- Warunki K01–K37 ---------------------------------------------------------------------------------

/** Warunek każdej pozycji katalogu K01–K37. */
export const warunkiSpraw: Record<IdPozycji, WarunekSprawy> = {
  // Wizyta jeszcze się nie odbyła, a dziecko się nie urodziło; wizyta do końca 10. tygodnia: załatwiona.
  K01: (w) => {
    const f = faktyRodziny(w);
    if (!f.znaneDaneCiazy) return tak('matka', { wymagaUzupelnienia: true });
    if (!f.wCiazy) return NIE;
    if (!f.wizytaOdbyla) return tak('matka');
    return f.wizytaWTerminie === true ? tak('matka', { zalatwiona: true }) : NIE;
  },
  K02: (w) => {
    const f = faktyRodziny(w);
    const { stanCywilny, uznanieOjcostwa } = w.daneRodziny;
    const warunek = stanCywilny?.wartosc === 'nie-malzenstwo' && uznanieOjcostwa?.wartosc !== 'uznane';
    return przedPorodem(f, warunek, 'oboje-rodzice');
  },
  K03: (w) => {
    const f = faktyRodziny(w);
    return przedPorodem(f, (f.formaMatki === 'umowa-zlecenia' || f.formaMatki === 'jdg') && !f.duchMatki);
  },
  K04: (w) => {
    const f = faktyRodziny(w);
    return przedPorodem(f, f.formaMatki === 'umowa-o-prace');
  },
  // Co najmniej jeden rodzic ma tytuł do ubezpieczenia; sprawa matki, a bez jej tytułu drugiego rodzica.
  K05: (w) => {
    const f = faktyRodziny(w);
    const matkaMaTytul = f.formaMatki !== null && f.formaMatki !== 'brak-tytulu';
    const drugiMaTytul = f.jestDrugiRodzic && f.formaDrugiegoRodzica !== 'brak-tytulu';
    if (matkaMaTytul) return tak('matka');
    return drugiMaTytul ? tak('drugi-rodzic') : NIE;
  },
  K06: (w) => poUrodzeniu(faktyRodziny(w), true),
  K07: (w) => (faktyRodziny(w).formaMatki === 'umowa-o-prace' ? tak('matka') : NIE),
  K08: (w) => {
    const f = faktyRodziny(w);
    const zDuch = (f.formaMatki === 'umowa-zlecenia' || f.formaMatki === 'jdg') && f.duchMatki;
    return zDuch || f.ustanieDajeZasilekMacierzynski ? tak('matka') : NIE;
  },
  K09: (w) => (faktyRodziny(w).drugiRodzicPodlega ? tak('drugi-rodzic') : NIE),
  K10: (w) => (faktyRodziny(w).drugiRodzicPodlega ? tak('drugi-rodzic') : NIE),
  // Poród przed 37. tygodniem ciąży albo hospitalizacja co najmniej 2 kolejne dni między 5. a 28. dniem życia.
  K11: (w) => {
    const f = faktyRodziny(w);
    const d = f.daneCiazy;
    if (!f.matkaPodlega || !f.urodzone || d === null) return NIE;
    const przedwczesny = d.tydzienCiazyWDniuPorodu !== undefined && d.tydzienCiazyWDniuPorodu < 37;
    const hospitalizacja = (d.dniHospitalizacji5do28 ?? 0) >= 2;
    return przedwczesny || hospitalizacja ? tak('matka') : NIE;
  },
  K12: (w) => poUrodzeniu(faktyRodziny(w), true),
  // Sprawa K12 ma status załatwiona, a dziecko nie ukończyło 18 lat.
  K13: (w) => {
    const f = faktyRodziny(w);
    const k12 = w.poprzedniPlan?.pozycje.find((p) => p.idSprawy === 'K12');
    if (k12?.status !== 'zalatwiona') return NIE;
    const wiek = wiekDziecka(f, w.dzis);
    return wiek === null || wiek < 18 ? tak('matka-albo-ojciec') : NIE;
  },
  K14: (w) => {
    const f = faktyRodziny(w);
    const dochod = warunekDochodu(w, f, 'K14');
    return zWizytaWTerminie(f, dochod.spelniony, { zalezyOdDochodu: dochod.zalezyOdDochodu });
  },
  K15: (w) => {
    const f = faktyRodziny(w);
    const dochod = warunekDochodu(w, f, 'K15');
    return zWizytaWTerminie(f, dochod.spelniony, { zalezyOdDochodu: dochod.zalezyOdDochodu });
  },
  // Matka bez tytułu albo na umowie zlecenia lub JDG bez DUCh, bez zasiłku macierzyńskiego po ustaniu zatrudnienia.
  K16: (w) => {
    const f = faktyRodziny(w);
    const bezChorobowego = f.formaMatki === 'brak-tytulu' || ((f.formaMatki === 'umowa-zlecenia' || f.formaMatki === 'jdg') && !f.duchMatki);
    return poUrodzeniu(f, bezChorobowego && !f.ustanieDajeZasilekMacierzynski);
  },
  K17: (w) => {
    const f = faktyRodziny(w);
    if (!f.znaneDaneCiazy) return NIE;
    if (f.daneCiazy?.ciezkaChorobaDziecka !== true || f.wizytaWTerminie !== true) return NIE;
    return tak('matka-albo-ojciec');
  },
  K18: (w) => poUrodzeniu(faktyRodziny(w), true),
  K19: (w) => {
    const f = faktyRodziny(w);
    return f.formaMatki === 'jdg' && f.duchMatki ? tak('matka') : NIE;
  },
  K20: (w) => (faktyRodziny(w).formaMatki === 'umowa-o-prace' ? tak('matka') : NIE),
  K21: (w) => kazdyRodzicNaUmowieOPrace(faktyRodziny(w)),
  K22: (w) => {
    const f = faktyRodziny(w);
    return f.matkaPodlega || f.drugiRodzicPodlega ? tak('matka-albo-ojciec') : NIE;
  },
  K23: (w) => kazdyRodzicNaUmowieOPrace(faktyRodziny(w)),
  K24: (w) => {
    const f = faktyRodziny(w);
    return przedPorodem(f, f.matkaPodlega || f.choroboweUstaloWCiazy);
  },
  K25: (w) => {
    const f = faktyRodziny(w);
    if (!f.znaneDaneCiazy || !f.wCiazy || !f.matkaPodlega) return NIE;
    return okresZasilkowyPrzedTerminem(w, f) ? tak('matka') : NIE;
  },
  K26: (w) => {
    const f = faktyRodziny(w);
    return przedPorodem(f, f.ustanieDajeK26);
  },
  K27: (w) => {
    const f = faktyRodziny(w);
    const bezChorobowego = f.formaMatki === 'brak-tytulu' || ((f.formaMatki === 'umowa-zlecenia' || f.formaMatki === 'jdg') && !f.duchMatki);
    return przedPorodem(f, bezChorobowego && !f.ustanieDajeK26);
  },
  K28: (w) => {
    const f = faktyRodziny(w);
    return przedPorodem(f, f.rozpoczecieWCiazy);
  },
  K29: (w) => {
    const f = faktyRodziny(w);
    const u = f.ustanie;
    if (u === null) return NIE;
    const ptp = f.przewidywanyTerminPorodu;
    const przedTerminem = u.data === undefined || ptp === undefined || u.data < ptp;
    const przyczynaInna = u.przyczyna === undefined || !PRZYCZYNY_ZASILKU_MACIERZYNSKIEGO.includes(u.przyczyna);
    const warunek = przedTerminem && przyczynaInna && !u.przedluzonaDoPorodu && !innyTytulZChorobowymWDniuTerminu(w, f);
    return przedPorodem(f, warunek);
  },
  K30: (w) => kazdyRodzicNaUmowieOPrace(faktyRodziny(w)),
  // Przyjęcie z wnioskiem o przysposobienie albo jako rodzina zastępcza niezawodowa, dziecko poniżej wieku ze słownika.
  K31: (w) => warunekPrzyjecia(w, 'umowa-o-prace'),
  K32: (w) => warunekPrzyjecia(w, 'z-duch'),
  K33: (w) => {
    const f = faktyRodziny(w);
    return f.daneCiazy?.przyjecie?.forma === 'rodzina-zastepcza-zawodowa' ? tak('rodzic-przyjmujacy') : NIE;
  },
  // Martwe urodzenie, poronienie albo zgon dziecka, a matka podlegała ubezpieczeniu chorobowemu w dniu porodu.
  K34: (w) => {
    const f = faktyRodziny(w);
    const sytuacje = f.daneCiazy?.sytuacjeSzczegolne ?? [];
    const strata = sytuacje.some((s) => s.rodzaj === 'martwe-urodzenie' || s.rodzaj === 'poronienie' || s.rodzaj === 'zgon-dziecka');
    return strata && (f.matkaPodlega || f.ustanieDajeZasilekMacierzynski) ? tak('matka') : NIE;
  },
  K35: (w) => {
    const sytuacje = faktyRodziny(w).daneCiazy?.sytuacjeSzczegolne ?? [];
    const szczegolne = sytuacje.some((s) => s.rodzaj !== 'orzeczenie' && s.rodzaj !== 'porzucenie');
    return szczegolne ? tak('oboje-rodzice') : NIE;
  },
  K36: (w) => poUrodzeniu(faktyRodziny(w), true),
  K37: (w) => kazdyRodzicNaUmowieOPrace(faktyRodziny(w)),
};

/** Wiek dziecka uprawniający do urlopu na warunkach urlopu macierzyńskiego (słownik wymiarów i okresów). */
function wiekGranicznyPrzyjecia(w: WejsciePlanu): number {
  const p = faktyRodziny(w).daneCiazy?.przyjecie;
  if (!p) return 0;
  const wpis = w.katalog.slowniki.find((s) => s.slownik === 'wymiary-i-okresy' && normalizuj(s.nazwa).includes('wiek dziecka'));
  const wersja = wpis?.wersje.find((v) => v.od <= w.dzis && (v.do === undefined || w.dzis <= v.do));
  const wartosci = wersja ? Object.values(wersja.wartosci).filter((v) => typeof v === 'number').sort((a, b) => a - b) : [];
  // Warianty w kolejności rosnącej: rodzina zastępcza niezawodowa, odroczony obowiązek szkolny, przysposobienie.
  const [niezawodowa, odroczenie, przysposobienie] = wartosci.length === 3 ? wartosci : [7, 10, 14];
  if (p.odroczenieObowiazkuSzkolnego) return odroczenie;
  return p.forma === 'przysposobienie' ? przysposobienie : niezawodowa;
}

function warunekPrzyjecia(w: WejsciePlanu, ubezpieczenie: 'umowa-o-prace' | 'z-duch'): WynikWarunku {
  const f = faktyRodziny(w);
  const p = f.daneCiazy?.przyjecie;
  if (!p || p.forma === 'rodzina-zastepcza-zawodowa') return NIE;
  if (wiekWLatach(p.dataUrodzeniaDziecka, p.dataPrzyjecia) >= wiekGranicznyPrzyjecia(w)) return NIE;
  const matkaPrzyjmuje = p.rolaRodzicaPrzyjmujacego === 'matka';
  const forma = matkaPrzyjmuje ? f.formaMatki : f.formaDrugiegoRodzica;
  const duch = matkaPrzyjmuje ? f.duchMatki : f.duchDrugiegoRodzica;
  const spelnia = ubezpieczenie === 'umowa-o-prace' ? forma === 'umowa-o-prace' : (forma === 'umowa-zlecenia' || forma === 'jdg') && duch;
  return spelnia ? tak('rodzic-przyjmujacy') : NIE;
}

// --- Warunek strukturalny pozycji dodanych w panelu -----------------------------------------------------

function spelniaStrukturalnie(p: PozycjaKatalogu, f: FaktyRodziny, rodzic: RodzicWRodzinie): boolean {
  const ws = p.warunekStrukturalny;
  if (!ws) return false;
  const forma = rodzic === 'matka' ? f.formaMatki : f.jestDrugiRodzic ? (f.formaDrugiegoRodzica as FormaZatrudnienia) : null;
  if (forma === null || !ws.formyZatrudnienia.includes(forma)) return false;
  const podlega = rodzic === 'matka' ? f.matkaPodlega : f.drugiRodzicPodlega;
  if (ws.ubezpieczenieChorobowe === 'wymagane' && !podlega) return false;
  if (ws.ubezpieczenieChorobowe === 'brak' && podlega) return false;
  return true;
}

/** Warunek pozycji dodanej przez Administratora z warunkiem strukturalnym (forma, chorobowe, etap dziecka). */
export function warunekStrukturalny(p: PozycjaKatalogu): WarunekSprawy | undefined {
  const ws = p.warunekStrukturalny;
  if (!ws) return undefined;
  return (w) => {
    const f = faktyRodziny(w);
    const rodzice = (['matka', 'drugi-rodzic'] as const).filter((r) => spelniaStrukturalnie(p, f, r));
    if (rodzice.length === 0) return NIE;
    const rodzic: RodzicSprawy =
      p.rodzic === 'matka' || p.rodzic === 'drugi-rodzic'
        ? p.rodzic
        : p.rodzic === 'kazdy-rodzic-na-umowie-o-prace' || p.rodzic === 'matka-a-bez-tytulu-drugi-rodzic'
          ? rodzice.length === 2 ? 'oboje-rodzice' : rodzice[0]
          : p.rodzic;
    if ((p.rodzic === 'matka' && !rodzice.includes('matka')) || (p.rodzic === 'drugi-rodzic' && !rodzice.includes('drugi-rodzic'))) return NIE;
    const dodatkowe = { rodzice: [...rodzice] };
    return ws.warunekEtapu === 'dziecko-nie-urodzilo-sie'
      ? f.wCiazy ? tak(rodzic, dodatkowe) : NIE
      : poUrodzeniu(f, true, rodzic, dodatkowe);
  };
}
