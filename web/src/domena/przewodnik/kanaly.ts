// Wybór kanału załatwienia sprawy, dokumentów i adresata wniosku (kontrakt, sekcja 7.2; ANALIZY/08 R-KAN, R-DOK, R-OZN).
// Właściciel: u17 (Instrukcje spraw i przejścia do kanałów). Funkcje są czyste: dane wejściowe dostają w argumentach.
import { wybierzDokumenty } from '@/domena/zasilki/dokumenty';
import type {
  DaneRodzica,
  DaneRodziny,
  FormaZatrudnienia,
  IdPozycji,
  IdWidoku,
  KanalPozycji,
  Katalog,
  PozycjaKatalogu,
  PozycjaPlanu,
  RodzajPozycji,
  WpisSlownikaDokumentow,
} from '@/domena/typy';

export type KanalZewnetrzny = Extract<KanalPozycji, { typ: 'zewnetrzny' }>['kanal'];

export type WyborKanalu =
  | { typ: 'kreator'; idWidoku: IdWidoku }
  | { typ: 'zewnetrzny'; adres: string; kanal: KanalZewnetrzny }
  | { typ: 'brak-akcji' }
  | { typ: 'u-pracodawcy' };

/** Kanał bez adresu: wpis katalogu albo reguła domyślna R-KAN. */
type SpecyfikacjaKanalu =
  | { typ: 'kreator'; idWidoku: IdWidoku }
  | { typ: 'zewnetrzny'; kanal: KanalZewnetrzny; adres?: string; adresSymulowany?: string }
  | { typ: 'u-pracodawcy' }
  | { typ: 'informacja' }
  | { typ: 'brak' };

/** Adresy symulowanych serwisów zewnętrznych w trybie demonstracyjnym (sekcja 2.2 kontraktu). */
export const ADRESY_SYMULOWANE: Record<KanalZewnetrzny, string> = {
  ezus: '/ezus',
  empatia: '/kanal/empatia',
  mobywatel: '/kanal/mobywatel',
  'gov-zgloszenie-urodzenia': '/kanal/gov-zgloszenie-urodzenia',
  'gov-rejestr-stanu-cywilnego': '/kanal/gov-rejestr-stanu-cywilnego',
};

/** Wnioski w eZUS otwierane na osobnych ekranach symulowanego eZUS (KA-06, KA-07 3.8.1.1.1). */
const ADRESY_SYMULOWANE_EZUS: Partial<Record<IdPozycji, string>> = {
  K12: '/ezus/wniosek-800-plus',
  K13: '/ezus/wniosek-800-plus',
  K18: '/ezus/wniosek-aktywny-rodzic',
};

const KREATOR_ZAM: SpecyfikacjaKanalu = { typ: 'kreator', idWidoku: 'ViewZamLeaveType' };
const KREATOR_ZAS53: SpecyfikacjaKanalu = { typ: 'kreator', idWidoku: 'ViewZas53Start' };
const KREATOR_Z15: SpecyfikacjaKanalu = { typ: 'kreator', idWidoku: 'ViewZ15Start' };
const EZUS: SpecyfikacjaKanalu = { typ: 'zewnetrzny', kanal: 'ezus' };
const EMPATIA: SpecyfikacjaKanalu = { typ: 'zewnetrzny', kanal: 'empatia' };
const PRACODAWCA: SpecyfikacjaKanalu = { typ: 'u-pracodawcy' };
const INFORMACJA: SpecyfikacjaKanalu = { typ: 'informacja' };
const BRAK: SpecyfikacjaKanalu = { typ: 'brak' };

/**
 * Kanały spraw z kolumny Instytucja i kanał (wymaganie Kanały spraw epiku 3.8.1). Reguła działa, gdy
 * pozycja katalogu nie ma wpisu kanału dla formy zatrudnienia rodzica sprawy.
 */
const KANALY_DOMYSLNE: Record<IdPozycji, (forma: FormaZatrudnienia | null) => SpecyfikacjaKanalu> = {
  K01: () => BRAK,
  K02: () => BRAK,
  K03: (f) => (f === 'jdg' ? EZUS : f === 'umowa-zlecenia' ? PRACODAWCA : BRAK),
  K04: () => PRACODAWCA,
  K05: (f) => (f === 'jdg' ? EZUS : f === 'umowa-o-prace' || f === 'umowa-zlecenia' ? PRACODAWCA : BRAK),
  K06: () => ({ typ: 'zewnetrzny', kanal: 'mobywatel' }),
  K07: () => PRACODAWCA,
  K08: () => KREATOR_ZAM,
  K09: (f) => (f === 'umowa-o-prace' ? PRACODAWCA : KREATOR_ZAM),
  K10: (f) => (f === 'umowa-o-prace' ? PRACODAWCA : KREATOR_ZAM),
  K11: (f) => (f === 'umowa-o-prace' ? PRACODAWCA : KREATOR_ZAM),
  K12: () => EZUS,
  K13: () => EZUS,
  K14: () => EMPATIA,
  K15: () => EMPATIA,
  K16: () => EMPATIA,
  K17: () => EMPATIA,
  K18: () => EZUS,
  K19: () => EZUS,
  K20: () => PRACODAWCA,
  K21: () => PRACODAWCA,
  K22: () => KREATOR_Z15,
  K23: () => PRACODAWCA,
  K24: (f) => (f === 'jdg' ? KREATOR_ZAS53 : f === 'umowa-o-prace' ? PRACODAWCA : BRAK),
  K25: () => EZUS,
  K26: () => EZUS,
  K27: () => INFORMACJA,
  K28: () => INFORMACJA,
  K29: (f) => (f === 'jdg' ? EZUS : INFORMACJA),
  K30: () => PRACODAWCA,
  K31: () => PRACODAWCA,
  K32: () => KREATOR_ZAM,
  K33: () => INFORMACJA,
  K34: (f) => (f === 'umowa-o-prace' ? PRACODAWCA : EZUS),
  K35: () => INFORMACJA,
  K36: () => ({ typ: 'zewnetrzny', kanal: 'gov-rejestr-stanu-cywilnego' }),
  K37: () => PRACODAWCA,
};

/** Identyfikator pozycji katalogu sprawy: pole idPozycji, a dla spraw na rodzica przedrostek identyfikatora. */
export function idPozycjiSprawy(sprawa: Pick<PozycjaPlanu, 'idSprawy' | 'idPozycji'>): IdPozycji | null {
  if (sprawa.idPozycji !== null) return sprawa.idPozycji;
  const dopasowanie = /^(K\d+)(?:-|$)/.exec(sprawa.idSprawy);
  return dopasowanie ? dopasowanie[1] : null;
}

/** Pozycja katalogu sprawy albo null, gdy katalog jej nie zawiera. */
export function pozycjaSprawy(sprawa: Pick<PozycjaPlanu, 'idSprawy' | 'idPozycji'>, katalog: Katalog): PozycjaKatalogu | null {
  const id = idPozycjiSprawy(sprawa);
  if (id === null) return null;
  return katalog.pozycje.find((p) => p.id === id) ?? null;
}

/** Rodzic, którego dotyczy sprawa (wymaganie Kanały spraw: K05 matka, a przy matce bez tytułu drugi rodzic). */
export function rodzicSprawy(
  sprawa: Pick<PozycjaPlanu, 'idSprawy' | 'rodzic'>,
  pozycjaKatalogu: Pick<PozycjaKatalogu, 'rodzic'> | null,
  daneRodziny: DaneRodziny,
): 'matka' | 'drugi-rodzic' {
  if (sprawa.rodzic === 'drugi-rodzic' || sprawa.idSprawy.endsWith('-drugi-rodzic')) return 'drugi-rodzic';
  if (sprawa.idSprawy.endsWith('-matka')) return 'matka';
  if (sprawa.rodzic === 'rodzic-przyjmujacy') return daneRodziny.rodzicKonta;
  if (pozycjaKatalogu?.rodzic === 'matka-a-bez-tytulu-drugi-rodzic') {
    const formaMatki = daneRodziny.matka.formaZatrudnienia?.wartosc ?? null;
    if (formaMatki === 'brak-tytulu') return 'drugi-rodzic';
  }
  return 'matka';
}

/** Dane rodzica sprawy z Danych rodziny. */
export function daneRodzicaSprawy(
  sprawa: Pick<PozycjaPlanu, 'idSprawy' | 'rodzic'>,
  pozycjaKatalogu: Pick<PozycjaKatalogu, 'rodzic'> | null,
  daneRodziny: DaneRodziny,
): { rodzic: 'matka' | 'drugi-rodzic'; forma: FormaZatrudnienia | null; dane: Omit<DaneRodzica, 'formaZatrudnienia'> } {
  const rodzic = rodzicSprawy(sprawa, pozycjaKatalogu, daneRodziny);
  if (rodzic === 'matka') {
    return { rodzic, forma: daneRodziny.matka.formaZatrudnienia?.wartosc ?? null, dane: daneRodziny.matka };
  }
  const forma = daneRodziny.drugiRodzic.formaZatrudnienia?.wartosc ?? null;
  return { rodzic, forma: forma === 'brak-drugiego-rodzica' ? null : forma, dane: daneRodziny.drugiRodzic };
}

function czyUstanieWCiazy(dane: Omit<DaneRodzica, 'formaZatrudnienia'>): boolean {
  return dane.zmianaZatrudnienia?.rodzaj.wartosc === 'ustanie';
}

/** Umowa o pracę na czas określony przedłużona do dnia porodu (reguła K30), która ustała po porodzie. */
function czyUmowaPrzedluzonaDoPorodu(dane: Omit<DaneRodzica, 'formaZatrudnienia'>): boolean {
  return dane.zmianaZatrudnienia?.umowaPrzedluzonaDoPorodu === true;
}

function specyfikacjaZKatalogu(kanal: KanalPozycji | undefined): SpecyfikacjaKanalu | null {
  if (kanal === undefined) return null;
  return kanal;
}

/** Adres kanału zewnętrznego: w trybie demonstracyjnym symulowany serwis, poza nim adres z instrukcji pozycji. */
function adresKanalu(
  spec: Extract<SpecyfikacjaKanalu, { typ: 'zewnetrzny' }>,
  idPozycji: IdPozycji | null,
  pozycjaKatalogu: PozycjaKatalogu | null,
  demonstracyjny: boolean,
): string {
  const symulowany =
    spec.kanal === 'ezus' && idPozycji !== null && ADRESY_SYMULOWANE_EZUS[idPozycji] !== undefined
      ? ADRESY_SYMULOWANE_EZUS[idPozycji]
      : (spec.adresSymulowany ?? ADRESY_SYMULOWANE[spec.kanal]);
  if (demonstracyjny) return symulowany;
  const produkcyjny = spec.adres ?? pozycjaKatalogu?.instrukcja.adresKanalu ?? '';
  return produkcyjny.trim().length > 0 ? produkcyjny : symulowany;
}

/** Kanał sprawy według formy zatrudnienia i trybu demonstracyjnego. */
export function wybierzKanal(
  sprawa: PozycjaPlanu,
  daneRodziny: DaneRodziny,
  katalog: Katalog,
  tryb: { demonstracyjny: boolean; mobywatelZainstalowany: boolean },
): WyborKanalu {
  const idPozycji = idPozycjiSprawy(sprawa);
  const pozycjaKatalogu = pozycjaSprawy(sprawa, katalog);
  const { rodzic, forma, dane } = daneRodzicaSprawy(sprawa, pozycjaKatalogu, daneRodziny);

  let spec: SpecyfikacjaKanalu | null = null;
  // K24 matki po ustaniu ubezpieczenia chorobowego: ZAS-53 z oświadczeniem Z-10 w kreatorze przewodnika.
  if (idPozycji === 'K24' && rodzic === 'matka' && czyUstanieWCiazy(dane)) spec = KREATOR_ZAS53;
  // K08 po ustaniu umowy o pracę w ciąży: ZUS, wniosek ZAM w eZUS z częścią o urodzeniu po ustaniu zatrudnienia,
  // a po ustaniu umowy przedłużonej do dnia porodu ZUS, wniosek ZAM w eZUS (KA-02 3.8.1.1.2).
  if (idPozycji === 'K08' && forma === 'umowa-o-prace' && (czyUstanieWCiazy(dane) || czyUmowaPrzedluzonaDoPorodu(dane))) {
    spec = EZUS;
  }
  if (spec === null && pozycjaKatalogu !== null) {
    spec =
      specyfikacjaZKatalogu(forma === null ? undefined : pozycjaKatalogu.kanaly[forma]) ??
      specyfikacjaZKatalogu(pozycjaKatalogu.kanaly.kazda);
  }
  if (spec === null && idPozycji !== null) spec = KANALY_DOMYSLNE[idPozycji]?.(forma) ?? null;
  if (spec === null) return { typ: 'brak-akcji' };

  switch (spec.typ) {
    case 'kreator':
      return { typ: 'kreator', idWidoku: spec.idWidoku };
    case 'u-pracodawcy':
      return { typ: 'u-pracodawcy' };
    case 'informacja':
    case 'brak':
      return { typ: 'brak-akcji' };
    case 'zewnetrzny': {
      // K06: aplikacja mObywatel, gdy jest zainstalowana, w przeciwnym razie usługa zgłoszenia urodzenia w przeglądarce.
      if (spec.kanal === 'mobywatel' || spec.kanal === 'gov-zgloszenie-urodzenia') {
        const kanal: KanalZewnetrzny = tryb.mobywatelZainstalowany ? 'mobywatel' : 'gov-zgloszenie-urodzenia';
        const adresZInstrukcji = pozycjaKatalogu?.instrukcja.adresKanalu;
        const wpis: Extract<SpecyfikacjaKanalu, { typ: 'zewnetrzny' }> = {
          typ: 'zewnetrzny',
          kanal,
          adres: kanal === 'gov-zgloszenie-urodzenia' ? (adresZInstrukcji ?? spec.adres) : spec.adres,
          adresSymulowany: kanal === spec.kanal ? spec.adresSymulowany : undefined,
        };
        return { typ: 'zewnetrzny', kanal, adres: adresKanalu(wpis, idPozycji, pozycjaKatalogu, tryb.demonstracyjny) };
      }
      return { typ: 'zewnetrzny', kanal: spec.kanal, adres: adresKanalu(spec, idPozycji, pozycjaKatalogu, tryb.demonstracyjny) };
    }
  }
}

/** Oznaczenie sprawy: świadczenie złożone, obowiązek, uprawnienie i informacja załatwione. */
export function rodzajOznaczenia(rodzaj: RodzajPozycji): 'zlozona' | 'zalatwiona' {
  return rodzaj === 'swiadczenie' ? 'zlozona' : 'zalatwiona';
}

// --- Dokumenty i adresat wniosku (R-DOK) -------------------------------------------------------

type GrupaDokumentow = WpisSlownikaDokumentow['grupa'];

/** Sprawy rodzaju świadczenie, których dokumenty i adresat zależą od płatnika zasiłku. */
const GRUPY_SPRAW: Partial<Record<IdPozycji, GrupaDokumentow>> = {
  K08: 'zasilek-macierzynski',
  K24: 'zasilek-chorobowy',
  K25: 'swiadczenie-rehabilitacyjne',
  K26: 'zwzm',
  K32: 'zasilek-macierzynski',
  K34: 'zasilek-macierzynski',
};

const NAZWY_GRUP: Record<GrupaDokumentow, string> = {
  'zasilek-chorobowy': 'Zasiłek chorobowy',
  'swiadczenie-rehabilitacyjne': 'Świadczenie rehabilitacyjne',
  zwzm: 'Zasiłek w wysokości zasiłku macierzyńskiego',
  'zasilek-macierzynski': 'Zasiłek macierzyński',
  zalaczniki: 'Załączniki',
  'wnioski-pracownika': 'Wnioski pracownika',
};

export type DokumentyIAdresat =
  | { typ: 'nie-dotyczy' }
  | { typ: 'platnik-nieustalony'; kod: '0087' }
  | {
      typ: 'lista';
      dokumenty: string[];
      adresat: string | null;
      platnik: 'zus' | 'platnik-skladek';
      nazwaPlatnika?: string;
    };

function pasujeDoKlucza(
  wpis: WpisSlownikaDokumentow,
  grupa: GrupaDokumentow,
  forma: FormaZatrudnienia,
  platnik: 'platnik-uprawniony' | 'zus',
  poUstaniu: boolean,
): boolean {
  if (wpis.grupa !== grupa) return false;
  if (wpis.klucz.formy !== 'kazda' && !wpis.klucz.formy.includes(forma)) return false;
  if (wpis.klucz.platnik !== undefined && wpis.klucz.platnik !== platnik) return false;
  return Boolean(wpis.klucz.poUstaniu) === poUstaniu;
}

/**
 * Dokumenty, załączniki i adresat wniosku sprawy rodzaju świadczenie ze słownika dokumentów i adresatów
 * wniosków, według formy zatrudnienia rodzica sprawy i płatnika zasiłku z Danych rodziny. Płatnik
 * nieustalony daje 0087 z przejściem do ViewProfilePayer.
 */
export function wybierzDokumentyIAdresata(
  sprawa: PozycjaPlanu,
  daneRodziny: DaneRodziny,
  katalog: Katalog,
): DokumentyIAdresat {
  if (sprawa.rodzaj !== 'swiadczenie') return { typ: 'nie-dotyczy' };
  const idPozycji = idPozycjiSprawy(sprawa);
  const grupa = idPozycji === null ? undefined : GRUPY_SPRAW[idPozycji];
  if (grupa === undefined) return { typ: 'nie-dotyczy' };

  const pozycjaKatalogu = pozycjaSprawy(sprawa, katalog);
  const { forma, dane } = daneRodzicaSprawy(sprawa, pozycjaKatalogu, daneRodziny);
  if (forma === null || forma === 'brak-tytulu') return { typ: 'nie-dotyczy' };

  const zapisany = dane.platnikZasilku?.wartosc ?? 'nieustalony';
  const platnik: 'zus' | 'platnik-skladek' | 'nieustalony' | 'brak-platnika' = forma === 'jdg' ? 'zus' : zapisany;
  if (platnik === 'brak-platnika') return { typ: 'nie-dotyczy' };
  if (platnik === 'nieustalony') return { typ: 'platnik-nieustalony', kod: '0087' };

  const poUstaniu = czyUstanieWCiazy(dane);
  const platnikKlucza = platnik === 'zus' ? 'zus' : 'platnik-uprawniony';
  const zSlownika = wybierzDokumenty(
    { swiadczenieAlboWniosek: NAZWY_GRUP[grupa], forma, platnik: platnikKlucza, poUstaniu },
    katalog,
  );
  if (!Array.isArray(zSlownika)) return { typ: 'platnik-nieustalony', kod: zSlownika.kod };

  const wpisy = (
    zSlownika.length > 0
      ? zSlownika
      : katalog.dokumenty.filter((w) => pasujeDoKlucza(w, grupa, forma, platnikKlucza, poUstaniu))
  )
    .slice()
    .sort((a, b) => a.kolejnosc - b.kolejnosc);

  const dokumenty = [...new Set(wpisy.flatMap((w) => w.dokumenty))];
  const adresat = wpisy.find((w) => w.adresat.trim().length > 0)?.adresat ?? null;
  return {
    typ: 'lista',
    dokumenty,
    adresat,
    platnik,
    nazwaPlatnika: platnik === 'platnik-skladek' ? dane.platnikZasilku?.nazwaPlatnika : undefined,
  };
}
