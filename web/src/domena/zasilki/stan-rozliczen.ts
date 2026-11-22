// Stan rozliczeń składek JDG i skutek zadłużenia (kontrakt, sekcja 7.2; ANALIZY/17 R1–R9).
// Właściciel: u14 (Dane ZUS: e-ZLA, rozliczenia składek, statusy wniosków).
import { dataZeZnacznika, dodajDni, dodajMiesiace, formatujDate, porownajDaty } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import { wartoscZKatalogu, zaswiadczeniaOdNajnowszych } from '@/domena/zasilki/okres-zasilkowy';
import type {
  DaneCiazyIDziecka,
  DaneZKontaZus,
  DataISO,
  Grosze,
  Katalog,
  KodKomunikatu,
  OsZadluzenia,
  Pesel,
  StanRozliczenSkladek,
  TytulUbezpieczenia,
  UmowaOSplacie,
  Wniosek,
  WniosekZam,
  ZaswiadczenieEzla,
  ZaswiadczenieOStanieRozliczen,
  ZnacznikCzasu,
} from '@/domena/typy';
import '@/domena/zasilki/rozszerzenia-typow';

/** Wartości domyślne słowników (3.5.1): minimalne wynagrodzenie 4806 zł, próg 1%, spłata 6 miesięcy, wypłata 60 dni. */
export const DOMYSLNE_ROZLICZENIA = {
  minimalneWynagrodzenie: 480_600,
  progProcent: 1,
  okresSplatyMiesiace: 6,
  wyplataPoSplacieDni: 60,
} as const;

export interface KomunikatStanu {
  kod: KodKomunikatu;
  parametry: Record<string, string>;
}

/** Stan rozliczeń na dzień `dzien` z osi zadłużenia (stan obowiązujący w tym dniu). */
export function stanNaDzien(os: OsZadluzenia, dzien: DataISO, teraz: ZnacznikCzasu): StanRozliczenSkladek {
  const zmiany = [...os.zmiany].sort((a, b) => porownajDaty(a.od, b.od));
  let indeks = -1;
  zmiany.forEach((z, i) => {
    if (z.od <= dzien) indeks = i;
  });
  const biezaca = indeks >= 0 ? zmiany[indeks] : null;
  const kwota = biezaca?.kwota ?? 0;
  const stan: StanRozliczenSkladek = { dzien, kwotaZadluzenia: kwota, odczytano: teraz };

  if (kwota > 0 && biezaca) {
    let poczatek = indeks;
    while (poczatek > 0 && zmiany[poczatek - 1].kwota > 0) poczatek -= 1;
    stan.zadluzenieOd = zmiany[poczatek].od;
    if (biezaca.opis) stan.opisZadluzenia = biezaca.opis;
    const dzienOdczytu = dataZeZnacznika(teraz);
    const splata = [...(os.splaty ?? [])]
      .sort((a, b) => porownajDaty(a.dzien, b.dzien))
      .find((s) => s.dzien >= dzien && s.dzien <= dzienOdczytu);
    if (splata) stan.dataSplaty = splata.dzien;
  }

  if (os.umowa && os.umowa.od <= dzien && (os.umowa.do === undefined || dzien <= os.umowa.do)) {
    const umowa: UmowaOSplacie = {
      rodzaj: os.umowa.rodzaj,
      kwotaObjeta: os.umowa.kwotaObjeta,
      splacanaZgodnieZUmowa: os.umowa.splacanaZgodnieZUmowa,
      caleZadluzenieObjete: os.umowa.caleZadluzenieObjete,
    };
    stan.umowa = umowa;
  }
  return stan;
}

/** Układ ratalny albo odroczenie spłacane zgodnie z umową, które obejmuje całe zadłużenie. */
export function czyUmowaBezZadluzenia(stan: StanRozliczenSkladek): boolean {
  return stan.umowa !== undefined && stan.umowa.splacanaZgodnieZUmowa && stan.umowa.caleZadluzenieObjete;
}

/** Kwota przekazywana strażnikowi ubezpieczenia chorobowego: 0,00 zł przy umowie spłacanej terminowo. */
export function kwotaDlaStraznika(stan: StanRozliczenSkladek): Grosze {
  return czyUmowaBezZadluzenia(stan) ? 0 : stan.kwotaZadluzenia;
}

/** Zadłużenie nieobjęte umową. */
export function zadluzenieNieobjeteUmowa(stan: StanRozliczenSkladek): Grosze {
  if (!stan.umowa) return stan.kwotaZadluzenia;
  return stan.umowa.caleZadluzenieObjete ? 0 : Math.max(0, stan.kwotaZadluzenia - stan.umowa.kwotaObjeta);
}

export type SwiadczenieDniaPrawa = 'zasilek-chorobowy' | 'zasilek-macierzynski';

export interface DzienPowstaniaPrawa {
  swiadczenie: SwiadczenieDniaPrawa;
  dzien: DataISO;
  podstawa: 'porod' | 'termin-porodu' | 'e-zla' | 'wniosek-zam' | 'wyczekiwanie';
  seriaINumer?: string;
}

/** Okres wyczekiwania na zasiłek chorobowy przy dobrowolnym ubezpieczeniu chorobowym w dniach (3.5.1). */
export const DOMYSLNE_WYCZEKIWANIE_DOBROWOLNE = 90;

/** Ostatnie zaświadczenie e-ZLA z powodu choroby (najpóźniejszy początek niezdolności). */
export function ostatnieZaswiadczenie(ezla: readonly ZaswiadczenieEzla[]): ZaswiadczenieEzla | null {
  return zaswiadczeniaOdNajnowszych(ezla.filter((z) => z.rodzaj === 'choroba'))[0] ?? null;
}

/**
 * Ostatnia nieprzerwana niezdolność do pracy z jednego albo kilku następujących po sobie zaświadczeń e-ZLA
 * z powodu choroby: pierwszy dzień, ostatni dzień i numer zaświadczenia, które ją rozpoczyna.
 */
export function ostatniaNiezdolnosc(
  ezla: readonly ZaswiadczenieEzla[],
): { od: DataISO; do: DataISO; seriaINumer: string } | null {
  const choroba = ezla
    .filter((z) => z.rodzaj === 'choroba')
    .sort((a, b) => porownajDaty(a.od, b.od) || porownajDaty(a.do, b.do));
  if (choroba.length === 0) return null;
  let biezaca = { od: choroba[0].od, do: choroba[0].do, seriaINumer: choroba[0].seriaINumer };
  for (const z of choroba.slice(1)) {
    if (z.od <= dodajDni(biezaca.do, 1)) {
      if (z.do > biezaca.do) biezaca = { ...biezaca, do: z.do };
    } else {
      biezaca = { od: z.od, do: z.do, seriaINumer: z.seriaINumer };
    }
  }
  return biezaca;
}

/** Pierwszy dzień zasiłku macierzyńskiego z wniosku ZAM złożonego przed porodem w grupie danych Wnioski. */
export function poczatekZasilkuZWnioskuZam(wnioski: readonly Wniosek[], pesel: Pesel | null): DataISO | null {
  const zlozone = wnioski
    .filter((w): w is WniosekZam => w.rodzaj === 'zam')
    .filter((w) => (pesel === null || w.konto === pesel) && (w.stan === 'wyslany' || w.stan === 'zlozony'))
    .map((w) => w.przedPorodem?.dzienPoczatkuZasilku)
    .filter((d): d is DataISO => d !== undefined)
    .sort(porownajDaty);
  return zlozone[0] ?? null;
}

export interface OpcjeDniPowstaniaPrawa {
  wnioski?: readonly Wniosek[];
  pesel?: Pesel | null;
  /** Początek dobrowolnego ubezpieczenia chorobowego, od którego biegnie okres wyczekiwania. */
  poczatekChorobowego?: DataISO | null;
  wyczekiwanieDni?: number;
}

/** Dzień powstania prawa do zasiłku macierzyńskiego: początek zasiłku z wniosku ZAM, data porodu albo termin porodu. */
export function dzienPrawaMacierzynskiego(
  daneCiazy: DaneCiazyIDziecka | null,
  opcje: OpcjeDniPowstaniaPrawa = {},
): DzienPowstaniaPrawa | null {
  const zWniosku = poczatekZasilkuZWnioskuZam(opcje.wnioski ?? [], opcje.pesel ?? null);
  if (zWniosku) return { swiadczenie: 'zasilek-macierzynski', dzien: zWniosku, podstawa: 'wniosek-zam' };
  if (daneCiazy?.dataPorodu) return { swiadczenie: 'zasilek-macierzynski', dzien: daneCiazy.dataPorodu, podstawa: 'porod' };
  if (daneCiazy?.przewidywanyTerminPorodu) {
    return { swiadczenie: 'zasilek-macierzynski', dzien: daneCiazy.przewidywanyTerminPorodu, podstawa: 'termin-porodu' };
  }
  return null;
}

/**
 * Dzień powstania prawa do zasiłku chorobowego: pierwszy dzień ostatniej nieprzerwanej niezdolności do pracy,
 * a gdy przypada w okresie wyczekiwania i niezdolność trwa po jego upływie, dzień nabycia prawa.
 */
export function dzienPrawaChorobowego(
  ezla: readonly ZaswiadczenieEzla[],
  opcje: OpcjeDniPowstaniaPrawa = {},
): DzienPowstaniaPrawa | null {
  const niezdolnosc = ostatniaNiezdolnosc(ezla);
  if (!niezdolnosc) return null;
  const dzien: DzienPowstaniaPrawa = {
    swiadczenie: 'zasilek-chorobowy',
    dzien: niezdolnosc.od,
    podstawa: 'e-zla',
    seriaINumer: niezdolnosc.seriaINumer,
  };
  if (opcje.poczatekChorobowego) {
    const nabycie = dodajDni(opcje.poczatekChorobowego, opcje.wyczekiwanieDni ?? DOMYSLNE_WYCZEKIWANIE_DOBROWOLNE);
    if (niezdolnosc.od < nabycie && niezdolnosc.do >= nabycie) return { ...dzien, dzien: nabycie, podstawa: 'wyczekiwanie' };
  }
  return dzien;
}

/** Dni powstania prawa z podstawą: zasiłek chorobowy z e-ZLA, zasiłek macierzyński z wniosku ZAM, porodu albo terminu. */
export function dniPowstaniaPrawaZPodstawa(
  daneCiazy: DaneCiazyIDziecka | null,
  ezla: readonly ZaswiadczenieEzla[],
  opcje: OpcjeDniPowstaniaPrawa = {},
): DzienPowstaniaPrawa[] {
  return [dzienPrawaChorobowego(ezla, opcje), dzienPrawaMacierzynskiego(daneCiazy, opcje)].filter(
    (d): d is DzienPowstaniaPrawa => d !== null,
  );
}

/** Dni powstania prawa do świadczeń z danych ciąży i zaświadczeń e-ZLA. */
export function dniPowstaniaPrawa(
  daneCiazy: DaneCiazyIDziecka | null,
  ezla: ZaswiadczenieEzla[],
  opcje: OpcjeDniPowstaniaPrawa = {},
): DataISO[] {
  return dniPowstaniaPrawaZPodstawa(daneCiazy, ezla, opcje).map((d) => d.dzien);
}

/** Próg zadłużenia obowiązujący w dniu `dzien`: 1% minimalnego wynagrodzenia (48,06 zł przy 4806 zł). Kwoty słownika są w groszach. */
export function progZadluzenia(katalog: Katalog, dzien: DataISO): { prog: Grosze; minimalne: Grosze } {
  const minimalne = Math.round(
    wartoscZKatalogu(katalog, { id: 'minimalne-wynagrodzenie', nazwa: 'Minimalne wynagrodzenie', klucz: 'kwota' }, dzien) ??
      DOMYSLNE_ROZLICZENIA.minimalneWynagrodzenie,
  );
  const prog = wartoscZKatalogu(
    katalog,
    { id: 'prog-zadluzenia-z-tytulu-skladek-jdg', nazwa: 'Próg zadłużenia z tytułu składek', klucz: 'kwota' },
    dzien,
  );
  return { prog: prog !== null ? Math.round(prog) : Math.round((minimalne * DOMYSLNE_ROZLICZENIA.progProcent) / 100), minimalne };
}

/** Okres wyczekiwania na zasiłek chorobowy przy dobrowolnym ubezpieczeniu chorobowym ze słownika wymiarów i okresów. */
export function wyczekiwanieDobrowolneZKatalogu(katalog: Katalog, dzien: DataISO): number {
  const wartosc = wartoscZKatalogu(
    katalog,
    { id: 'okres-wyczekiwania-na-zasilek-chorobowy', nazwa: 'Okres wyczekiwania', klucz: 'dobrowolne' },
    dzien,
  );
  return wartosc ?? DOMYSLNE_WYCZEKIWANIE_DOBROWOLNE;
}

/** Okres spłaty zadłużenia w miesiącach ze słownika wymiarów i okresów. */
export function okresSplatyZKatalogu(katalog: Katalog, dzien: DataISO): number {
  const wartosc = wartoscZKatalogu(
    katalog,
    { id: 'okres-splaty-zadluzenia-z-tytulu-skladek', nazwa: 'Okres spłaty zadłużenia', klucz: 'miesiace' },
    dzien,
  );
  return wartosc ?? DOMYSLNE_ROZLICZENIA.okresSplatyMiesiace;
}

/**
 * Komunikaty karty dnia powstania prawa (R4): 0184 przy umowie spłacanej terminowo, inaczej 0116 albo 0117,
 * potem 0083 bez chorobowego albo skutek (0183, 0182, 0186, 0185), a przy dniu w przyszłości 0187.
 */
export function komunikatyStanu(
  stan: StanRozliczenSkladek,
  dzienPowstania: DataISO,
  prog: Grosze,
  okresSplaty: number,
  dzis: DataISO,
  maChorobowe: boolean,
): KomunikatStanu[] {
  const wynik: KomunikatStanu[] = [];
  const data = formatujDate(stan.dzien);
  if (czyUmowaBezZadluzenia(stan)) {
    wynik.push({ kod: '0184', parametry: {} });
  } else if (stan.kwotaZadluzenia === 0) {
    wynik.push({ kod: '0117', parametry: { data } });
  } else {
    wynik.push({ kod: '0116', parametry: { data, kwota: formatujKwote(stan.kwotaZadluzenia) } });
  }

  const kwota = kwotaDlaStraznika(stan);
  if (!maChorobowe) {
    wynik.push({ kod: '0083', parametry: {} });
  } else if (kwota > 0 && kwota <= prog) {
    wynik.push({ kod: '0183', parametry: { prog: formatujKwote(prog) } });
  } else if (kwota > prog && dzienPowstania <= dzis && dzienPowstania <= stan.dzien) {
    const termin = dodajMiesiace(dzienPowstania, okresSplaty);
    if (stan.dataSplaty && stan.dataSplaty <= termin) {
      wynik.push({
        kod: '0186',
        parametry: {
          dataSplaty: formatujDate(stan.dataSplaty),
          dataWyplaty: formatujDate(dodajDni(stan.dataSplaty, DOMYSLNE_ROZLICZENIA.wyplataPoSplacieDni)),
        },
      });
    } else if ((stan.dataSplaty && stan.dataSplaty > termin) || dzis > termin) {
      wynik.push({ kod: '0185', parametry: { data: formatujDate(termin) } });
    } else {
      wynik.push({ kod: '0182', parametry: { prog: formatujKwote(prog), data: formatujDate(termin) } });
    }
  }

  if (dzienPowstania > stan.dzien) wynik.push({ kod: '0187', parametry: { data: formatujDate(dzienPowstania) } });
  return wynik;
}

/** Skutek zadłużenia dla prawa do świadczenia: 0083, 0116, 0117, 0182–0187 (kod rozstrzygający karty). */
export function skutekZadluzenia(
  stan: StanRozliczenSkladek,
  dzienPowstania: DataISO,
  prog: Grosze,
  okresSplaty: number,
  dzis: DataISO,
  maChorobowe: boolean,
): { kod: KodKomunikatu; parametry: Record<string, string> } {
  const komunikaty = komunikatyStanu(stan, dzienPowstania, prog, okresSplaty, dzis, maChorobowe);
  const pierwszenstwo: KodKomunikatu[] = ['0184', '0083', '0186', '0185', '0182', '0183', '0187', '0117', '0116'];
  for (const kod of pierwszenstwo) {
    const znaleziony = komunikaty.find((k) => k.kod === kod);
    if (znaleziony) return znaleziony;
  }
  return komunikaty[0];
}

/**
 * Rodzaj dokumentu wydanego na wniosek o zaświadczenie o niezaleganiu: zaświadczenie o niezaleganiu bez zadłużenia
 * albo przy całym zadłużeniu objętym umową spłacaną terminowo, a przy każdym innym zadłużeniu decyzja o odmowie
 * (wartość `o-wysokosci-zadluzenia`).
 */
export function rodzajZaswiadczenia(stan: StanRozliczenSkladek): ZaswiadczenieOStanieRozliczen['rodzaj'] {
  return kwotaDlaStraznika(stan) === 0 ? 'o-niezaleganiu' : 'o-wysokosci-zadluzenia';
}

/** Tytuł osoby prowadzącej pozarolniczą działalność w Danych z konta ZUS (najwcześniejszy początek). */
export function tytulDzialalnosci(kopia: DaneZKontaZus | null): TytulUbezpieczenia | null {
  if (!kopia) return null;
  return [...kopia.tytuly].filter((t) => t.rodzaj === 'dzialalnosc').sort((a, b) => porownajDaty(a.od, b.od))[0] ?? null;
}

/** Stan rozliczeń na dzień z kopii (zapisany przy odczycie) albo z osi zadłużenia odczytanej z PUE/eZUS. */
export function stanZKopii(kopia: DaneZKontaZus, dzien: DataISO): StanRozliczenSkladek | null {
  const zapisany = kopia.stanyRozliczen.find((s) => s.dzien === dzien);
  if (zapisany) return zapisany;
  if (kopia.osZadluzenia) return stanNaDzien(kopia.osZadluzenia, dzien, kopia.odczytano);
  return null;
}
