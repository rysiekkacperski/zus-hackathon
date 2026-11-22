// Wyliczenie kwot wszystkich świadczeń przykładowej sprawy i porównanie z rozstrzygnięciem. Właściciel: u21.
// Świadczenia liczymy po weryfikacji (weryfikacja.ts), wyłącznie te, które według niej przysługują:
// - zasiłek macierzyński: okresy i stawki z wyliczWynikSprawy (urlop macierzyński, rodzicielski, 81,5%, rola ojca);
// - zasiłek w wysokości zasiłku macierzyńskiego (ZWZM): od dnia po ustaniu zatrudnienia do dnia przed porodem,
//   100% podstawy (art. 30 ust. 3 i art. 31 ust. 1 ustawy z 25.06.1999 o świadczeniach pieniężnych z ubezpieczenia
//   społecznego w razie choroby i macierzyństwa, dalej ustawa zasiłkowa);
// - zasiłek chorobowy: za każdy dzień niezdolności do pracy z dalszymi okresami z ZAS-12, 80% podstawy, a 100% podstawy
//   przy niezdolności w okresie ciąży, którą zaświadczenie lekarskie oznacza kodem B (art. 11 ust. 1 i ust. 2 pkt 2
//   ustawy zasiłkowej; zus.pl, Zasiłek chorobowy, Wysokość: 80% podstawy także za okres pobytu w szpitalu),
//   najdłużej 182 dni, a w okresie ciąży 270 dni (art. 8 ustawy zasiłkowej). Pracownik przy trwającym zatrudnieniu
//   dostaje za pierwsze 33 dni niezdolności w roku kalendarzowym, a od roku po ukończeniu 50 lat za 14 dni,
//   wynagrodzenie za czas choroby od pracodawcy liczone od tej samej podstawy (art. 92 § 1 i § 2 Kodeksu pracy;
//   zus.pl: zasiłek przysługuje od 34. albo od 15. dnia niezdolności w roku kalendarzowym). Zleceniobiorca i osoba
//   prowadząca działalność dostają zasiłek od pierwszego dnia po okresie wyczekiwania.
// Kwota za okres to stawka dzienna (podstawa / 30 zaokrąglona do grosza, × stawka) pomnożona przez liczbę dni,
// a kwota miesięczna to podstawa × stawka (rachunek.ts).
import { ID_KWOT } from '@/dane/katalog/slownik-kwot';
import { ID_WYMIAROW } from '@/dane/katalog/slownik-wymiarow';
import { dodajDni, formatujDate, liczbaDniWlacznie, porownajDaty } from '@/domena/daty';
import { wartoscObowiazujaca } from '@/domena/katalog/odczyt';
import { kwotaMiesieczna, stawkaDzienna } from '@/domena/kalkulatory/rachunek';
import { formatujKwote } from '@/domena/kwoty';
import { okresZasilkuMacierzynskiego } from '@/domena/przykladowe-sprawy/porownanie';
import {
  niezdolnoscCiagla,
  ustalPodstaweZeSprawy,
  wyliczWynikSprawy,
} from '@/domena/przykladowe-sprawy/weryfikacja';
import type {
  DaneSprawy,
  DataISO,
  DokumentSprawy,
  Grosze,
  Katalog,
  KodKomunikatu,
  OkresScenariusza,
  PodstawaWymiaru,
  Procent,
  RozstrzygniecieSprawy,
  WynikScenariusza,
  WynikWeryfikacjiSprawy,
} from '@/domena/typy';
import { teksty } from '@/teksty';
import type { SwiadczenieSprawy } from './rozszerzenia-typow';

const W = teksty.ViewSampleCaseVerification.wyliczenie;

/** Stawki i limity zasiłku chorobowego, wynagrodzenia za czas choroby i ZWZM ze słowników Katalogu świadczeń. */
interface ZasadyZasilkow {
  stawkaChorobowego: Procent;
  stawkaChorobowegoWCiazy: Procent;
  limitDni: number;
  limitDniWCiazy: number;
  dniWynagrodzenia: number;
  dniWynagrodzeniaPoWieku: number;
  wiekKrotszegoWynagrodzenia: number;
  stawkaZwzm: Procent;
}

// Wartości startowe słowników (dane/katalog: slownik-kwot.ts i slownik-wymiarow.ts), gdy katalog nie ma wpisu w danym dniu.
const ZASADY_DOMYSLNE: ZasadyZasilkow = {
  stawkaChorobowego: 80,
  stawkaChorobowegoWCiazy: 100,
  limitDni: 182,
  limitDniWCiazy: 270,
  dniWynagrodzenia: 33,
  dniWynagrodzeniaPoWieku: 14,
  wiekKrotszegoWynagrodzenia: 50,
  stawkaZwzm: 100,
};

/** Wartości obowiązujące w dniu `dzien`: Administrator zmienia je w panelu katalogu bez zmiany kodu. */
function zasadyZKatalogu(katalog: Katalog, dzien: DataISO): ZasadyZasilkow {
  const w = (id: string, klucz: string, domyslna: number): number => {
    const v = wartoscObowiazujaca(katalog, id, dzien, klucz);
    return v !== null && Number.isFinite(v.wartosc) && v.wartosc > 0 ? v.wartosc : domyslna;
  };
  const d = ZASADY_DOMYSLNE;
  return {
    stawkaChorobowego: w(ID_KWOT.zasilekChorobowyBezKoduB, 'stawka', d.stawkaChorobowego),
    stawkaChorobowegoWCiazy: w(ID_KWOT.zasilekChorobowyWCiazy, 'stawka', d.stawkaChorobowegoWCiazy),
    limitDni: w(ID_WYMIAROW.okresZasilkowy, 'podstawowy', d.limitDni),
    limitDniWCiazy: w(ID_WYMIAROW.okresZasilkowy, 'ciaza', d.limitDniWCiazy),
    dniWynagrodzenia: w(ID_WYMIAROW.wynagrodzenieChorobowe, 'dni', d.dniWynagrodzenia),
    dniWynagrodzeniaPoWieku: w(ID_WYMIAROW.wynagrodzenieChorobowe, 'dniPoUkonczeniuWieku', d.dniWynagrodzeniaPoWieku),
    wiekKrotszegoWynagrodzenia: w(ID_WYMIAROW.wynagrodzenieChorobowe, 'wiek', d.wiekKrotszegoWynagrodzenia),
    stawkaZwzm: w(ID_KWOT.zasilekWWysokosciMacierzynskiego, 'stawka', d.stawkaZwzm),
  };
}

export type RodzajOkresuSprawy = OkresScenariusza['rodzaj'] | 'zwzm' | 'zasilek-chorobowy' | 'wynagrodzenie-chorobowe';

/** Okres świadczenia ze stawką i wypłatą; `doSumy` false oznacza wynagrodzenie od pracodawcy poza zasiłkiem. */
export interface OkresWyliczeniaSprawy {
  swiadczenie: SwiadczenieSprawy;
  rodzaj: RodzajOkresuSprawy;
  od: DataISO;
  do: DataISO;
  dni: number;
  stawka: Procent;
  miesiecznie: Grosze;
  zaOkres: Grosze;
  doSumy: boolean;
}

export interface WyliczenieSwiadczeniaSprawy {
  swiadczenie: SwiadczenieSprawy;
  okresy: OkresWyliczeniaSprawy[];
  suma: Grosze;
  reguly: string[];
}

export interface WyliczenieSprawy {
  /** Podstawa wymiaru ze sprawy; null, gdy według weryfikacji żadne świadczenie nie przysługuje. */
  podstawa: PodstawaWymiaru | null;
  swiadczenia: WyliczenieSwiadczeniaSprawy[];
  /** Wynik zasiłku macierzyńskiego w formacie kalkulatora (zapis w Wynikach kalkulacji); null bez zasiłku macierzyńskiego. */
  wynikMacierzynskiego: WynikScenariusza | null;
}

function okres(
  swiadczenie: SwiadczenieSprawy,
  rodzaj: RodzajOkresuSprawy,
  od: DataISO,
  do_: DataISO,
  stawka: Procent,
  podstawa: Grosze,
  doSumy = true,
): OkresWyliczeniaSprawy {
  const dni = liczbaDniWlacznie({ od, do: do_ });
  return { swiadczenie, rodzaj, od, do: do_, dni, stawka, miesiecznie: kwotaMiesieczna(podstawa, stawka), zaOkres: stawkaDzienna(podstawa, stawka) * dni, doSumy };
}

function wynikSwiadczenia(swiadczenie: SwiadczenieSprawy, okresy: OkresWyliczeniaSprawy[], reguly: string[]): WyliczenieSwiadczeniaSprawy {
  return { swiadczenie, okresy, suma: okresy.filter((o) => o.doSumy).reduce((a, o) => a + o.zaOkres, 0), reguly };
}

/** Rok urodzenia z numeru PESEL (zastępczy PESEL zachowuje datę urodzenia); null przy nieprawidłowym numerze. */
function rokUrodzenia(pesel: string | null): number | null {
  if (pesel === null || !/^\d{11}$/.test(pesel)) return null;
  const rok = Number(pesel.slice(0, 2));
  const miesiac = Number(pesel.slice(2, 4));
  const stulecie = miesiac > 80 ? 1800 : miesiac > 60 ? 2200 : miesiac > 40 ? 2100 : miesiac > 20 ? 2000 : 1900;
  return stulecie + rok;
}

/** Liczba dni wynagrodzenia za czas choroby w roku kalendarzowym `rok` (art. 92 § 1 pkt 1 Kodeksu pracy). */
function dniWynagrodzeniaWRoku(d: DaneSprawy, rok: number, z: ZasadyZasilkow): number {
  const urodzenie = rokUrodzenia(d.ubezpieczony.pesel.wartosc);
  return urodzenie !== null && rok > urodzenie + z.wiekKrotszegoWynagrodzenia ? z.dniWynagrodzeniaPoWieku : z.dniWynagrodzenia;
}

type DzienNiezdolnosci = 'bez-prawa' | 'wynagrodzenie-chorobowe' | 'zasilek-chorobowy';

function wyliczZasilekChorobowy(
  d: DaneSprawy,
  podstawa: Grosze,
  prawoOd: DataISO | undefined,
  poUstaniu: boolean,
  katalog: Katalog,
): WyliczenieSwiadczeniaSprawy | null {
  const niezdolnosc = niezdolnoscCiagla(d);
  if (niezdolnosc === null) return null;
  const z = zasadyZKatalogu(katalog, niezdolnosc.od);
  const wCiazy = (d.zdarzenie.niezdolnosc.wartosc?.kod ?? '').trim().toUpperCase() === 'B';
  const stawka = wCiazy ? z.stawkaChorobowegoWCiazy : z.stawkaChorobowego;
  const limit = wCiazy ? z.limitDniWCiazy : z.limitDni;
  const pracownik = d.tytul.rodzaj.wartosc === 'pracownik' && !poUstaniu;
  const reguly: string[] = [];

  // Klasyfikacja każdego dnia niezdolności: przed prawem do zasiłku, wynagrodzenie od pracodawcy albo zasiłek.
  const dni = Math.min(liczbaDniWlacznie(niezdolnosc), limit);
  const dniPracodawcyWRoku = new Map<number, number>();
  const rodzajeDni: { dzien: DataISO; rodzaj: DzienNiezdolnosci }[] = [];
  for (let i = 0; i < dni; i += 1) {
    const dzien = dodajDni(niezdolnosc.od, i);
    let rodzaj: DzienNiezdolnosci = 'zasilek-chorobowy';
    if (prawoOd !== undefined && porownajDaty(dzien, prawoOd) < 0) rodzaj = 'bez-prawa';
    else if (pracownik) {
      const rok = Number(dzien.slice(0, 4));
      const wykorzystane = dniPracodawcyWRoku.get(rok) ?? 0;
      if (wykorzystane < dniWynagrodzeniaWRoku(d, rok, z)) {
        rodzaj = 'wynagrodzenie-chorobowe';
        dniPracodawcyWRoku.set(rok, wykorzystane + 1);
      }
    }
    rodzajeDni.push({ dzien, rodzaj });
  }

  const okresy: OkresWyliczeniaSprawy[] = [];
  let poczatek = 0;
  for (let i = 1; i <= rodzajeDni.length; i += 1) {
    if (i < rodzajeDni.length && rodzajeDni[i].rodzaj === rodzajeDni[poczatek].rodzaj) continue;
    const rodzaj = rodzajeDni[poczatek].rodzaj;
    if (rodzaj !== 'bez-prawa') {
      okresy.push(okres('zasilek-chorobowy', rodzaj, rodzajeDni[poczatek].dzien, rodzajeDni[i - 1].dzien, stawka, podstawa, rodzaj === 'zasilek-chorobowy'));
    }
    poczatek = i;
  }
  if (okresy.length === 0) return null;

  const pierwszy = okresy[0];
  const ostatni = okresy[okresy.length - 1];
  reguly.push(W.chorobowyOkres({ od: formatujDate(pierwszy.od), do: formatujDate(ostatni.do), dni: String(okresy.reduce((a, o) => a + o.dni, 0)) }));
  if (prawoOd !== undefined && porownajDaty(prawoOd, niezdolnosc.od) > 0) reguly.push(W.chorobowyWyczekiwanie({ prawoOd: formatujDate(prawoOd) }));
  reguly.push(wCiazy ? W.chorobowyStawka100({ procent: String(stawka) }) : W.chorobowyStawka80({ procent: String(stawka) }));
  const dniPracodawcy = okresy.filter((o) => o.rodzaj === 'wynagrodzenie-chorobowe').reduce((a, o) => a + o.dni, 0);
  if (pracownik) {
    reguly.push(W.wynagrodzenieChorobowe({ limit: String(dniWynagrodzeniaWRoku(d, Number(niezdolnosc.od.slice(0, 4)), z)), dni: String(dniPracodawcy) }));
  }
  if (liczbaDniWlacznie(niezdolnosc) > limit) reguly.push(W.chorobowyLimit({ dni: String(limit) }));
  return wynikSwiadczenia('zasilek-chorobowy', okresy, reguly);
}

/**
 * Wyliczenie świadczeń sprawy, które według weryfikacji przysługują. Kod 0094 albo 0173, gdy świadczenie przysługuje,
 * a podstawy wymiaru nie da się ustalić z dokumentów sprawy.
 */
export function wyliczSwiadczeniaSprawy(
  dane: DaneSprawy,
  weryfikacja: WynikWeryfikacjiSprawy,
  katalog: Katalog,
  dokumenty: readonly DokumentSprawy[] = [],
): WyliczenieSprawy | { kod: '0094' | '0173' } {
  if (!weryfikacja.wyniki.some((w) => w.prawo === 'przysluguje')) return { podstawa: null, swiadczenia: [], wynikMacierzynskiego: null };
  const podstawa = ustalPodstaweZeSprawy(dane, katalog);
  if ('kod' in podstawa) return podstawa;
  const swiadczenia: WyliczenieSwiadczeniaSprawy[] = [];
  let wynikMacierzynskiego: WynikScenariusza | null = null;
  const poUstaniu = weryfikacja.dataUstania !== undefined;
  for (const w of weryfikacja.wyniki) {
    if (w.prawo !== 'przysluguje') continue;
    if (w.swiadczenie === 'zasilek-macierzynski') {
      wynikMacierzynskiego = wyliczWynikSprawy(dane, podstawa, katalog, dokumenty);
      const okresy = wynikMacierzynskiego.okresy.map((o) => ({
        swiadczenie: w.swiadczenie,
        rodzaj: o.rodzaj,
        od: o.od,
        do: o.do,
        dni: o.dni,
        stawka: o.stawka,
        miesiecznie: o.miesiecznie,
        zaOkres: o.zaOkres,
        doSumy: true,
      }));
      // Suma zasiłku macierzyńskiego z harmonogramu wypłat, z podwyższeniem do kwoty świadczenia rodzicielskiego.
      swiadczenia.push({
        ...wynikSwiadczenia(w.swiadczenie, okresy, wynikMacierzynskiego.zastosowaneReguly.map((r) => r.opis)),
        suma: wynikMacierzynskiego.sumy.razem,
      });
    } else if (w.swiadczenie === 'zwzm') {
      const koniec = weryfikacja.rozszerzenie?.szczegoly.find((s) => s.swiadczenie === 'zwzm')?.do;
      if (w.od === undefined || koniec === undefined || porownajDaty(w.od, koniec) > 0) continue;
      const stawkaZwzm = zasadyZKatalogu(katalog, w.od).stawkaZwzm;
      const o = okres('zwzm', 'zwzm', w.od, koniec, stawkaZwzm, podstawa.kwota);
      swiadczenia.push(wynikSwiadczenia('zwzm', [o], [W.zwzm({ dni: String(o.dni), procent: String(stawkaZwzm) })]));
    } else {
      const chorobowy = wyliczZasilekChorobowy(dane, podstawa.kwota, w.od, poUstaniu, katalog);
      if (chorobowy !== null) swiadczenia.push(chorobowy);
    }
  }
  return { podstawa, swiadczenia, wynikMacierzynskiego };
}

// --- Porównanie z rozstrzygnięciem ----------------------------------------------------------------

export type PoleWyliczeniaSprawy = 'prawo' | 'poczatek' | 'koniec' | 'kwota';

export interface PozycjaWyliczeniaSprawy {
  pole: PoleWyliczeniaSprawy;
  wyliczenie: string | null;
  rozstrzygniecie: string | null;
  /** null: rozstrzygnięcie nie zawiera tej danej. */
  zgodne: boolean | null;
  roznica?: Grosze;
}

export interface PorownanieSwiadczeniaSprawy {
  swiadczenie: SwiadczenieSprawy;
  wynik: 'zgodne' | 'rozne' | 'bez-porownania';
  pozycje: PozycjaWyliczeniaSprawy[];
}

export interface PorownanieWyliczeniaSprawy {
  /** 0112 przy różnicy, 0111 przy zgodności, 0180, gdy rozstrzygnięcie nie zawiera żadnego wyliczonego świadczenia. */
  kod: KodKomunikatu;
  wynik: 'zgodne' | 'rozne' | 'bez-porownania';
  swiadczenia: PorownanieSwiadczeniaSprawy[];
}

const KOLEJNOSC: readonly SwiadczenieSprawy[] = ['zwzm', 'zasilek-macierzynski', 'zasilek-chorobowy'];

/** Okres i kwota miesięczna wyliczonego świadczenia do porównania; null bez okresów. */
// Kwotę miesięczną porównujemy z okresem o stawce z rozstrzygnięcia, na przykład 70% za urlop rodzicielski, a bez
// stawki w rozstrzygnięciu z pierwszym okresem świadczenia.
function zakresSwiadczenia(
  w: WyliczenieSprawy,
  s: SwiadczenieSprawy,
  stawka?: number,
): { od: DataISO; do: DataISO; miesiecznie: Grosze } | null {
  const okresy = (w.swiadczenia.find((x) => x.swiadczenie === s)?.okresy ?? []).filter((o) => o.doSumy);
  const zeStawka = stawka === undefined ? undefined : okresy.find((o) => o.stawka === stawka);
  if (s === 'zasilek-macierzynski') {
    const zakres = w.wynikMacierzynskiego === null ? null : okresZasilkuMacierzynskiego(w.wynikMacierzynskiego);
    return zakres === null ? null : { ...zakres, miesiecznie: zeStawka?.miesiecznie ?? zakres.miesiecznie };
  }
  if (okresy.length === 0) return null;
  return { od: okresy[0].od, do: okresy[okresy.length - 1].do, miesiecznie: (zeStawka ?? okresy[0]).miesiecznie };
}

function prawoSlownie(prawo: RozstrzygniecieSprawy['prawo']): string {
  return teksty.ViewSampleCaseVerification.wyliczeniaSprawy.prawo[prawo];
}

/** Porównanie wyliczenia każdego świadczenia z rozstrzygnięciem: prawo, okres i kwota miesięczna z tolerancją w groszach. */
export function porownajWyliczenieSprawy(
  wyliczenie: WyliczenieSprawy,
  weryfikacja: WynikWeryfikacjiSprawy,
  rozstrzygniecie: readonly RozstrzygniecieSprawy[],
  tolerancja: Grosze,
): PorownanieWyliczeniaSprawy {
  const swiadczenia = KOLEJNOSC.filter(
    (s) => weryfikacja.wyniki.some((w) => w.swiadczenie === s) || rozstrzygniecie.some((r) => r.swiadczenie === s),
  ).map((s): PorownanieSwiadczeniaSprawy => {
    const r = rozstrzygniecie.find((x) => x.swiadczenie === s);
    const zakres = zakresSwiadczenia(wyliczenie, s, r?.prawo === 'przysluguje' ? r.stawka : undefined);
    // Prawo do świadczenia ustala weryfikacja, a przy świadczeniu spoza weryfikacji wyliczony okres.
    const prawo: RozstrzygniecieSprawy['prawo'] =
      weryfikacja.wyniki.find((w) => w.swiadczenie === s)?.prawo ?? (zakres === null ? 'nie-przysluguje' : 'przysluguje');
    const pozycje: PozycjaWyliczeniaSprawy[] = [
      { pole: 'prawo', wyliczenie: prawoSlownie(prawo), rozstrzygniecie: r === undefined ? null : prawoSlownie(r.prawo), zgodne: r === undefined ? null : r.prawo === prawo },
    ];
    if (zakres !== null || r?.prawo === 'przysluguje') {
      const okresR = r?.prawo === 'przysluguje' ? r.okres : undefined;
      pozycje.push(
        {
          pole: 'poczatek',
          wyliczenie: zakres === null ? null : formatujDate(zakres.od),
          rozstrzygniecie: okresR === undefined ? null : formatujDate(okresR.od),
          zgodne: okresR === undefined ? null : zakres !== null && zakres.od === okresR.od,
        },
        {
          pole: 'koniec',
          wyliczenie: zakres === null ? null : formatujDate(zakres.do),
          rozstrzygniecie: okresR === undefined ? null : formatujDate(okresR.do),
          zgodne: okresR === undefined ? null : zakres !== null && zakres.do === okresR.do,
        },
      );
      const kwota = r?.prawo === 'przysluguje' ? r.miesiecznaKwota : undefined;
      const roznica = kwota === undefined || zakres === null ? undefined : Math.abs(zakres.miesiecznie - kwota);
      pozycje.push({
        pole: 'kwota',
        wyliczenie: zakres === null ? null : formatujKwote(zakres.miesiecznie),
        rozstrzygniecie: kwota === undefined ? null : formatujKwote(kwota),
        zgodne: kwota === undefined ? null : roznica !== undefined && roznica <= tolerancja,
        ...(roznica === undefined ? {} : { roznica }),
      });
    }
    if (r === undefined) return { swiadczenie: s, wynik: 'bez-porownania', pozycje };
    return { swiadczenie: s, wynik: pozycje.every((p) => p.zgodne !== false) ? 'zgodne' : 'rozne', pozycje };
  });
  const wynik = swiadczenia.some((s) => s.wynik === 'rozne') ? 'rozne' : swiadczenia.some((s) => s.wynik === 'zgodne') ? 'zgodne' : 'bez-porownania';
  return { kod: wynik === 'rozne' ? '0112' : wynik === 'zgodne' ? '0111' : '0180', wynik, swiadczenia };
}

/** Czy wynik weryfikacji potwierdza prawo do świadczenia, którego kwotę liczymy (Sprawdź wyliczenia). */
export function czyJestCoWyliczyc(w: WynikWeryfikacjiSprawy | undefined): boolean {
  return w?.wyniki.some((r) => r.prawo === 'przysluguje') ?? false;
}
