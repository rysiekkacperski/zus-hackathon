// Porównanie wariantów zasiłku macierzyńskiego 81,5% i 100%/70% (kontrakt, sekcja 7.2).
// Właściciel: u26 (Kalkulatory wariantu zasiłku i podziału urlopu).
// Reguły R1–R7 z analizy epiku 3.10.1: okres porównania, wypłata miesięczna, suma za okres,
// harmonogram z podwyższeniem do kwoty świadczenia rodzicielskiego, skutek powrotu do pracy, termin decyzji.
import { dniWMiesiacu, czesciDaty, dodajDni, liczbaDniWlacznie, miesiacZDaty, roznicaDni } from '@/domena/daty';
import { formatujDate } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import { wartoscObowiazujaca } from '@/domena/katalog/odczyt';
import type {
  BledyPol,
  DaneCiazyIDziecka,
  DaneRodziny,
  DataISO,
  FormaZatrudnienia,
  Grosze,
  Katalog,
  KodKomunikatu,
  MiesiacISO,
  Okres,
  PodstawaWymiaru,
  Procent,
  ZapisPorownaniaWariantow,
} from '@/domena/typy';

export interface WejsciePorownaniaWariantow {
  podstawa: PodstawaWymiaru;
  dataPorodu: DataISO;
  liczbaDzieci: number;
  zaZyciem: boolean;
  tygodniePrzedPowrotem: number;
  dzis: DataISO;
  katalog: Katalog;
}

/** Okres porównania z wypłatą miesięczną i sumą za okres. */
export interface OkresPorownania {
  rodzaj: 'macierzynski' | 'rodzicielski';
  okres: Okres | null;                 // null: urlop rodzicielski 0 tygodni
  dni: number;
  stawka: Procent;
  miesiecznie: Grosze;                 // po podwyższeniu do kwoty świadczenia rodzicielskiego
  miesiecznieZeStawki: Grosze;         // przed podwyższeniem
  podwyzszona: boolean;
  suma: Grosze;                        // suma za okres (R4) albo z harmonogramu (R5)
}

export interface WariantPorownania {
  okresy: OkresPorownania[];
  wyrownanie: Grosze;                  // wariant 81,5% przy 0 tygodniach urlopu rodzicielskiego
  suma: Grosze;
}

export interface SzczegolyPorownania {
  tygodnieMacierzynskiego: number;
  tygodnieRodzicielskiegoMaks: number;
  tygodnieRodzicielskiego: number;
  okresCaly: Okres;
  dniRazem: number;
  wariant81: WariantPorownania;
  wariant100i70: WariantPorownania;
  zHarmonogramu: boolean;              // sumy liczone z wypłat w miesiącach (R5)
  termin: DataISO;                     // data porodu + 21 dni
  dniDoTerminu: number;                // ≥ 0; po terminie 0
  wariant81Dostepny: boolean;
  swiadczenieRodzicielskie: Grosze;
}

export type WynikPorownaniaWariantow = ZapisPorownaniaWariantow['wynik'] & {
  komunikaty: { kod: KodKomunikatu; parametry?: Record<string, string> }[];
  szczegoly: SzczegolyPorownania;
};

// --- Wartości ze słowników z wartością domyślną ---------------------------------------------

const TYGODNIE_MACIERZYNSKIEGO: Record<number, number> = { 1: 20, 2: 31, 3: 33, 4: 35, 5: 37 };
const DOMYSLNE = {
  stawka100: 100,
  stawka815: 81.5,
  stawka70: 70,
  swiadczenieRodzicielskie: 100000,
  pomniejszenie: 13.71,
  nieprzenoszalne: 9,
  terminWariantuDni: 21,
} as const;

/** Wartość wpisu słownika obowiązująca w dniu `dzien` albo wartość domyślna, gdy katalog jej nie ma. */
export function wartoscSlownika(k: Katalog, idWpisu: string, wariant: string, dzien: DataISO, domyslna: number): number {
  const w = wartoscObowiazujaca(k, idWpisu, dzien, wariant);
  return w === null || !Number.isFinite(w.wartosc) ? domyslna : w.wartosc;
}

function klasaLiczbyDzieci(liczbaDzieci: number): number {
  return Math.min(5, Math.max(1, Math.trunc(liczbaDzieci) || 1));
}

/** Wymiar urlopu macierzyńskiego w tygodniach według liczby dzieci. */
export function tygodnieUrlopuMacierzynskiego(liczbaDzieci: number, k: Katalog, dzien: DataISO): number {
  const klasa = klasaLiczbyDzieci(liczbaDzieci);
  return wartoscSlownika(k, 'urlop-macierzynski', String(klasa), dzien, TYGODNIE_MACIERZYNSKIEGO[klasa]);
}

/** Wymiar urlopu rodzicielskiego obojga rodziców (41, 43, 65, 67 tygodni). */
export function wymiarUrlopuRodzicielskiego(liczbaDzieci: number, zaZyciem: boolean, k: Katalog, dzien: DataISO): number {
  const wiecej = klasaLiczbyDzieci(liczbaDzieci) > 1;
  const klucz = `${wiecej ? 'wiecej-dzieci' : 'jedno-dziecko'}${zaZyciem ? '-za-zyciem' : ''}`;
  const domyslny = zaZyciem ? (wiecej ? 67 : 65) : wiecej ? 43 : 41;
  return wartoscSlownika(k, 'urlop-rodzicielski', klucz, dzien, domyslny);
}

/** Tygodnie urlopu rodzicielskiego przysługujące wyłącznie jednemu rodzicowi (9). */
export function tygodnieNieprzenoszalne(k: Katalog, dzien: DataISO): number {
  return wartoscSlownika(k, 'nieprzenoszalna-czesc-urlopu-rodzicielskiego', 'tygodnie', dzien, DOMYSLNE.nieprzenoszalne);
}

/** Najwięcej tygodni urlopu rodzicielskiego jednego rodzica (32, 34, 56, 58). */
export function tygodnieRodzicielskiegoJednegoRodzica(liczbaDzieci: number, zaZyciem: boolean, k: Katalog, dzien: DataISO): number {
  return wymiarUrlopuRodzicielskiego(liczbaDzieci, zaZyciem, k, dzien) - tygodnieNieprzenoszalne(k, dzien);
}

/** Kwota świadczenia rodzicielskiego za pełny miesiąc (1000,00 zł). */
export function kwotaSwiadczeniaRodzicielskiego(k: Katalog, dzien: DataISO): Grosze {
  return Math.round(wartoscSlownika(k, 'swiadczenie-rodzicielskie', 'kwota', dzien, DOMYSLNE.swiadczenieRodzicielskie / 100) * 100);
}

export interface StawkiZasilku { s100: Procent; s815: Procent; s70: Procent }

export function stawkiZasilku(k: Katalog, dzien: DataISO): StawkiZasilku {
  return {
    s100: wartoscSlownika(k, 'zasilek-macierzynski-wariant-100-70', 'macierzynski', dzien, DOMYSLNE.stawka100),
    s815: wartoscSlownika(k, 'zasilek-macierzynski-wariant-81-5', 'stawka', dzien, DOMYSLNE.stawka815),
    s70: wartoscSlownika(k, 'zasilek-macierzynski-wariant-100-70', 'rodzicielski', dzien, DOMYSLNE.stawka70),
  };
}

/** Termin decyzji o wariancie 81,5%: data porodu + 21 dni. */
export function terminWariantu(dataPorodu: DataISO, k: Katalog): DataISO {
  return dodajDni(dataPorodu, wartoscSlownika(k, 'termin-wniosku-w-wariancie-81-5', 'dni', dataPorodu, DOMYSLNE.terminWariantuDni));
}

// --- Prawo do zasiłku i dane z profilu -------------------------------------------------------

/** Prawo do zasiłku macierzyńskiego z formy zatrudnienia i ubezpieczenia chorobowego. */
export function maPrawoDoZasilku(forma: FormaZatrudnienia | 'brak-drugiego-rodzica' | null | undefined, dobrowolne: boolean | null | undefined): boolean {
  if (forma === 'umowa-o-prace') return true;
  if (forma === 'umowa-zlecenia' || forma === 'jdg') return dobrowolne === true;
  return false;
}

/** Matka z prawem do zasiłku macierzyńskiego (R9: akcja porównania wariantów). */
export function matkaMaPrawoDoZasilku(dane: DaneRodziny): boolean {
  return maPrawoDoZasilku(dane.matka.formaZatrudnienia?.wartosc, dane.matka.dobrowolneChorobowe?.wartosc);
}

/** Sprawa planu, przy której matka wybiera wariant: K07 pracownica, K08 umowa zlecenia i JDG. */
export function sprawaWariantu(dane: DaneRodziny): 'K07' | 'K08' {
  return dane.matka.formaZatrudnienia?.wartosc === 'umowa-o-prace' ? 'K07' : 'K08';
}

export interface DaneDzieckaDoKalkulatora { dataPorodu: DataISO | null; przewidywany: boolean; liczbaDzieci: number; zaZyciem: boolean }

export function daneDzieckaDoKalkulatora(d: DaneCiazyIDziecka | null): DaneDzieckaDoKalkulatora {
  const dataPorodu = d?.dataPorodu ?? d?.przewidywanyTerminPorodu ?? null;
  return {
    dataPorodu,
    przewidywany: d?.dataPorodu === undefined && dataPorodu !== null,
    liczbaDzieci: d?.liczbaUrodzonychDzieci ?? d?.liczbaDzieciZCiazy ?? 1,
    zaZyciem: d?.zaswiadczenieZaZyciem === true,
  };
}

// --- Walidacja pól ---------------------------------------------------------------------------

export const MAKS_PODSTAWA: Grosze = 9999999;

/** Pole podstawy wymiaru: puste → 0093; 0, ponad 99 999,99 zł albo zły zapis → 0016. */
export function walidujPodstawe(tekst: string, parsuj: (t: string) => Grosze | null): { kwota: Grosze } | { kod: '0093' | '0016' } {
  if (tekst.trim() === '') return { kod: '0093' };
  const kwota = parsuj(tekst);
  if (kwota === null || kwota <= 0 || kwota > MAKS_PODSTAWA) return { kod: '0016' };
  return { kwota };
}

/** Liczba całkowita tygodni od 0 do `maks`; puste, ułamek, liczba ujemna i spoza zakresu → 0061. */
export function walidujTygodnie(tekst: string, maks: number): { tygodnie: number } | { kod: '0061' } {
  const zapis = tekst.trim();
  if (!/^\d+$/.test(zapis)) return { kod: '0061' };
  const tygodnie = Number(zapis);
  if (!Number.isSafeInteger(tygodnie) || tygodnie > maks) return { kod: '0061' };
  return { tygodnie };
}

export function walidujDanePorownania(
  f: { podstawa?: string; tygodnie: string },
  maks: number,
  parsuj: (t: string) => Grosze | null,
): { bledy: BledyPol<'podstawa' | 'tygodnie'>; kwota?: Grosze; tygodnie?: number } {
  const bledy: BledyPol<'podstawa' | 'tygodnie'> = {};
  let kwota: Grosze | undefined;
  if (f.podstawa !== undefined) {
    const p = walidujPodstawe(f.podstawa, parsuj);
    if ('kod' in p) bledy.podstawa = p.kod;
    else kwota = p.kwota;
  }
  const t = walidujTygodnie(f.tygodnie, maks);
  if ('kod' in t) bledy.tygodnie = t.kod;
  return { bledy, kwota, tygodnie: 'tygodnie' in t ? t.tygodnie : undefined };
}

// --- Wyliczenie wypłat -----------------------------------------------------------------------

/** Wypłata ze stawki: podstawa × stawka, zaokrąglona do grosza (stawka z jednym miejscem po przecinku). */
export function wyplataZeStawki(podstawa: Grosze, stawka: Procent): Grosze {
  return Math.round((podstawa * Math.round(stawka * 10)) / 1000);
}

/** Suma za dni okresu: podstawa / 30 × stawka × dni, zaokrąglona do grosza na końcu. */
export function sumaZaDni(podstawa: Grosze, stawka: Procent, dni: number): Grosze {
  return Math.round((podstawa * Math.round(stawka * 10) * dni) / 30000);
}

interface OkresWyliczenia { okres: Okres; stawka: Procent; podwyzszany: boolean }

function miesiaceOkresu(o: Okres): { miesiac: MiesiacISO; dni: number }[] {
  const wynik: { miesiac: MiesiacISO; dni: number }[] = [];
  let poczatek = o.od;
  while (poczatek <= o.do) {
    const { rok, miesiac } = czesciDaty(poczatek);
    const koniecMiesiaca = `${String(rok).padStart(4, '0')}-${String(miesiac).padStart(2, '0')}-${String(dniWMiesiacu(rok, miesiac)).padStart(2, '0')}`;
    const koniec = koniecMiesiaca < o.do ? koniecMiesiaca : o.do;
    wynik.push({ miesiac: miesiacZDaty(poczatek), dni: liczbaDniWlacznie({ od: poczatek, do: koniec }) });
    poczatek = dodajDni(koniec, 1);
  }
  return wynik;
}

/**
 * Harmonogram miesięczny (R5): kwota za miesiąc z dni okresu w miesiącu, ostatni miesiąc okresu
 * domyka sumę okresu; suma miesiąca niższa niż świadczenie rodzicielskie (za miesiąc częściowy
 * kwota proporcjonalna zaokrąglona w górę do 10 groszy) podwyższona do tej kwoty.
 */
function sumaZHarmonogramu(podstawa: Grosze, okresy: OkresWyliczenia[], swiadczenie: Grosze): { suma: Grosze; zaOkresy: Grosze[] } {
  const miesiace = new Map<MiesiacISO, { kwota: number; dniPodwyzszane: number }>();
  const zaOkresy: Grosze[] = [];
  for (const o of okresy) {
    const czesci = miesiaceOkresu(o.okres);
    const sumaOkresu = sumaZaDni(podstawa, o.stawka, liczbaDniWlacznie(o.okres));
    let dotad = 0;
    czesci.forEach((c, i) => {
      const kwota = i === czesci.length - 1 ? sumaOkresu - dotad : sumaZaDni(podstawa, o.stawka, c.dni);
      dotad += kwota;
      const m = miesiace.get(c.miesiac) ?? { kwota: 0, dniPodwyzszane: 0 };
      miesiace.set(c.miesiac, { kwota: m.kwota + kwota, dniPodwyzszane: m.dniPodwyzszane + (o.podwyzszany ? c.dni : 0) });
    });
    zaOkresy.push(sumaOkresu);
  }
  let suma = 0;
  for (const [miesiac, m] of miesiace) {
    const [rok, mies] = miesiac.split('-').map(Number);
    const dniMiesiaca = dniWMiesiacu(rok, mies);
    let prog = 0;
    if (m.dniPodwyzszane >= dniMiesiaca) prog = swiadczenie;
    else if (m.dniPodwyzszane > 0) prog = Math.ceil((Math.round(swiadczenie / dniMiesiaca) * m.dniPodwyzszane) / 10) * 10;
    suma += Math.max(m.kwota, prog);
  }
  return { suma, zaOkresy };
}

function okresOd(od: DataISO, dni: number): Okres | null {
  return dni <= 0 ? null : { od, do: dodajDni(od, dni - 1) };
}

/** Kwoty miesięczne i sumy obu wariantów, wyrównanie, data powrotu i komunikaty 0246 i 0038. */
export function porownajWarianty(w: WejsciePorownaniaWariantow): WynikPorownaniaWariantow {
  const { katalog: k, dataPorodu } = w;
  const podstawa = w.podstawa.kwota;
  const stawki = stawkiZasilku(k, dataPorodu);
  const swiadczenie = kwotaSwiadczeniaRodzicielskiego(k, dataPorodu);
  const tygM = tygodnieUrlopuMacierzynskiego(w.liczbaDzieci, k, dataPorodu);
  const tygRMaks = tygodnieRodzicielskiegoJednegoRodzica(w.liczbaDzieci, w.zaZyciem, k, dataPorodu);
  const tygR = Math.max(0, Math.min(tygRMaks, Math.trunc(w.tygodniePrzedPowrotem)));

  const macierzynski = okresOd(dataPorodu, tygM * 7) as Okres;
  const poczatekRodzicielskiego = dodajDni(macierzynski.do, 1);
  const rodzicielski = okresOd(poczatekRodzicielskiego, tygR * 7);
  const dataPowrotu = rodzicielski === null ? poczatekRodzicielskiego : dodajDni(rodzicielski.do, 1);
  const okresCaly: Okres = { od: dataPorodu, do: rodzicielski?.do ?? macierzynski.do };

  const miesiecznie = (stawka: Procent) => {
    const zeStawki = wyplataZeStawki(podstawa, stawka);
    return { zeStawki, poPodwyzszeniu: Math.max(zeStawki, swiadczenie), podwyzszona: zeStawki < swiadczenie };
  };
  const zHarmonogramu = [stawki.s815, stawki.s100, stawki.s70].some((s) => wyplataZeStawki(podstawa, s) < swiadczenie);

  const wylicz = (stawkaM: Procent, stawkaR: Procent): WariantPorownania => {
    const okresyWyliczenia: OkresWyliczenia[] = [{ okres: macierzynski, stawka: stawkaM, podwyzszany: true }];
    if (rodzicielski !== null) okresyWyliczenia.push({ okres: rodzicielski, stawka: stawkaR, podwyzszany: true });
    const zHarm = sumaZHarmonogramu(podstawa, okresyWyliczenia, swiadczenie);
    const mM = miesiecznie(stawkaM);
    const mR = miesiecznie(stawkaR);
    const okresy: OkresPorownania[] = [
      { rodzaj: 'macierzynski', okres: macierzynski, dni: tygM * 7, stawka: stawkaM, miesiecznie: mM.poPodwyzszeniu,
        miesiecznieZeStawki: mM.zeStawki, podwyzszona: mM.podwyzszona, suma: zHarm.zaOkresy[0] },
      { rodzaj: 'rodzicielski', okres: rodzicielski, dni: tygR * 7, stawka: stawkaR, miesiecznie: mR.poPodwyzszeniu,
        miesiecznieZeStawki: mR.zeStawki, podwyzszona: mR.podwyzszona, suma: zHarm.zaOkresy[1] ?? 0 },
    ];
    const suma = zHarmonogramu ? zHarm.suma : zHarm.zaOkresy.reduce((a, b) => a + b, 0);
    return { okresy, wyrownanie: 0, suma };
  };

  const w81 = wylicz(stawki.s815, stawki.s815);
  const w100 = wylicz(stawki.s100, stawki.s70);
  if (tygR === 0) {
    // Wyrównanie zasiłku za urlop macierzyński do 100%, gdy matka nie wykorzysta urlopu rodzicielskiego.
    const wyrownanie = Math.max(0, sumaZaDni(podstawa, stawki.s100, tygM * 7) - sumaZaDni(podstawa, stawki.s815, tygM * 7));
    w81.wyrownanie = wyrownanie;
    w81.suma += wyrownanie;
  }

  const termin = terminWariantu(dataPorodu, k);
  const wariant81Dostepny = w.dzis <= termin;
  const roznica = w100.suma - w81.suma;
  const komunikaty: WynikPorownaniaWariantow['komunikaty'] = [];
  if (!wariant81Dostepny) komunikaty.push({ kod: '0038' });
  else if (tygR > 0 && tygR < tygRMaks && roznica > 0) {
    komunikaty.push({ kod: '0246', parametry: { data: formatujDate(dataPowrotu), kwota: formatujKwote(roznica) } });
  }

  const miesieczneWariantu = (v: WariantPorownania) => v.okresy.filter((o) => o.dni > 0).map((o) => o.miesiecznie);
  return {
    wariant81: { miesiecznie: miesieczneWariantu(w81), suma: w81.suma },
    wariant100i70: { miesiecznie: miesieczneWariantu(w100), suma: w100.suma },
    roznica,
    dataPowrotu,
    komunikaty,
    szczegoly: {
      tygodnieMacierzynskiego: tygM,
      tygodnieRodzicielskiegoMaks: tygRMaks,
      tygodnieRodzicielskiego: tygR,
      okresCaly,
      dniRazem: liczbaDniWlacznie(okresCaly),
      wariant81: w81,
      wariant100i70: w100,
      zHarmonogramu,
      termin,
      dniDoTerminu: Math.max(0, roznicaDni(w.dzis, termin)),
      wariant81Dostepny,
      swiadczenieRodzicielskie: swiadczenie,
    },
  };
}
