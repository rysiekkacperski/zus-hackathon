// Wybór kanału załatwienia sprawy, dokumentów i adresata wniosku (kontrakt, sekcja 7.2; ANALIZY/08 R-KAN, R-DOK, R-OZN).
// Właściciel: u17 (Instrukcje spraw i przejścia do kanałów). Funkcje są czyste: dane wejściowe dostają w argumentach.
import { SWIADCZENIA_SLOWNIKA } from '@/dane/katalog/slownik-dokumentow';
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
  // K34 przy umowie zlecenia, gdy zasiłek wypłaca płatnik składek (więcej niż 20 zgłoszonych do ubezpieczenia
  // chorobowego według stanu na 30 listopada poprzedniego roku, art. 61 ust. 1 ustawy zasiłkowej): wniosek ZAM
  // z dokumentem o martwym urodzeniu przyjmuje zleceniodawca, tak jak wskazuje słownik dokumentów (zm-uz-platnik).
  if (idPozycji === 'K34' && forma === 'umowa-zlecenia' && dane.platnikZasilku?.wartosc === 'platnik-skladek') {
    spec = PRACODAWCA;
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
type SwiadczenieSlownika = (typeof SWIADCZENIA_SLOWNIKA)[keyof typeof SWIADCZENIA_SLOWNIKA];

/**
 * Wpisy słownika dokumentów, które instrukcja sprawy pokazuje przy wniosku. `grupa` wskazuje świadczenie,
 * którego dokumenty i adresat zależą od płatnika zasiłku. `wnioskiPracownika` to wnioski do pracodawcy
 * dołączane przy umowie o pracę rodzica sprawy, a `zalaczniki` to załączniki sytuacji dla każdej formy
 * zatrudnienia. Przy umowie o pracę wniosek pracownika zawiera już załączniki sytuacji, więc instrukcja
 * pokazuje załączniki sytuacji tylko wtedy, gdy sprawa nie ma wniosku pracownika dla tej formy.
 */
interface DokumentySprawy {
  grupa: GrupaDokumentow;
  wnioskiPracownika?: readonly SwiadczenieSlownika[];
  zalaczniki?: readonly { swiadczenie: SwiadczenieSlownika; sytuacja: string }[];
}

const S = SWIADCZENIA_SLOWNIKA;
const ZALACZNIK_PRZYJECIE = { swiadczenie: S.zalacznikPrzyjecie, sytuacja: 'przyjecie' } as const;

/**
 * Sprawy z wnioskiem, których instrukcja pokazuje dokumenty i adresata ze słownika dokumentów: świadczenia
 * z ubezpieczenia chorobowego oraz urlopy u pracodawcy i w kreatorze ZAM, za które przysługuje zasiłek
 * macierzyński. Adresat zasiłku zależy od płatnika: płatnik składek, który według stanu na 30 listopada
 * poprzedniego roku zgłaszał do ubezpieczenia chorobowego więcej niż 20 osób, sam wypłaca zasiłek,
 * a w pozostałych przypadkach zasiłek wypłaca ZUS (domena/profil/platnik.ts).
 */
const DOKUMENTY_SPRAW: Partial<Record<IdPozycji, DokumentySprawy>> = {
  K07: { grupa: 'zasilek-macierzynski', wnioskiPracownika: [S.wniosekRodzicielski] },
  K08: { grupa: 'zasilek-macierzynski' },
  K09: { grupa: 'zasilek-macierzynski', wnioskiPracownika: [S.wniosekOjcowski] },
  K10: { grupa: 'zasilek-macierzynski', wnioskiPracownika: [S.wniosekRodzicielski] },
  K11: {
    grupa: 'zasilek-macierzynski',
    wnioskiPracownika: [S.wniosekUzupelniajacy],
    zalaczniki: [{ swiadczenie: S.zalacznikUzupelniajacy, sytuacja: 'uzupelniajacy' }],
  },
  K24: { grupa: 'zasilek-chorobowy' },
  K25: { grupa: 'swiadczenie-rehabilitacyjne' },
  K26: { grupa: 'zwzm' },
  K31: { grupa: 'zasilek-macierzynski', wnioskiPracownika: [S.wniosekNaWarunkach], zalaczniki: [ZALACZNIK_PRZYJECIE] },
  K32: { grupa: 'zasilek-macierzynski', zalaczniki: [ZALACZNIK_PRZYJECIE] },
  K34: {
    grupa: 'zasilek-macierzynski',
    zalaczniki: [{ swiadczenie: S.zalacznikMartweUrodzenie, sytuacja: 'martwe-urodzenie' }],
  },
  K37: { grupa: 'zasilek-macierzynski', wnioskiPracownika: [S.wniosekLaczenie] },
};

const NAZWY_GRUP: Record<GrupaDokumentow, string> = {
  'zasilek-chorobowy': 'Zasiłek chorobowy',
  'swiadczenie-rehabilitacyjne': 'Świadczenie rehabilitacyjne',
  zwzm: 'Zasiłek w wysokości zasiłku macierzyńskiego',
  'zasilek-macierzynski': 'Zasiłek macierzyński',
  zalaczniki: 'Załączniki',
  'wnioski-pracownika': 'Wnioski pracownika',
};

/** Dokumenty i adresat wniosku przy jednym płatniku zasiłku. */
export interface WariantDokumentow {
  dokumenty: string[];
  adresat: string | null;
  platnik: 'zus' | 'platnik-skladek';
}

export type DokumentyIAdresat =
  | { typ: 'nie-dotyczy' }
  | { typ: 'platnik-nieustalony'; kod: '0087' }
  | ({ typ: 'lista'; nazwaPlatnika?: string } & WariantDokumentow)
  /**
   * Płatnik zasiłku rodzica sprawy jest nieustalony, a odpowiedź o płatniku zapisuje drugi rodzic na swoim
   * koncie: instrukcja pokazuje dokumenty i adresata przy płatniku składek i przy ZUS.
   */
  | { typ: 'warianty-platnika'; warianty: WariantDokumentow[] };

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

/** Wpisy wniosków pracownika i załączników sytuacji sprawy dla formy zatrudnienia rodzica sprawy. */
function wpisyDodatkowe(opis: DokumentySprawy, forma: FormaZatrudnienia, katalog: Katalog): WpisSlownikaDokumentow[] {
  const zListy = (w: ReturnType<typeof wybierzDokumenty>) => (Array.isArray(w) ? w : []);
  const wnioski =
    forma === 'umowa-o-prace'
      ? (opis.wnioskiPracownika ?? []).flatMap((s) =>
          zListy(wybierzDokumenty({ swiadczenieAlboWniosek: s, forma, platnik: undefined, poUstaniu: false }, katalog)),
        )
      : [];
  const zalaczniki =
    wnioski.length > 0
      ? []
      : (opis.zalaczniki ?? []).flatMap((z) =>
          zListy(
            wybierzDokumenty({ swiadczenieAlboWniosek: z.swiadczenie, forma, platnik: undefined, poUstaniu: false, sytuacja: z.sytuacja }, katalog),
          ),
        );
  return [...wnioski, ...zalaczniki];
}

/** Dokumenty i adresat przy płatniku zasiłku: wpisy świadczenia, potem wnioski pracownika i załączniki sytuacji. */
function wariantDokumentow(
  opis: DokumentySprawy,
  forma: FormaZatrudnienia,
  platnik: 'zus' | 'platnik-skladek',
  poUstaniu: boolean,
  katalog: Katalog,
): WariantDokumentow | { kod: '0087' } {
  const platnikKlucza = platnik === 'zus' ? 'zus' : 'platnik-uprawniony';
  const zSlownika = wybierzDokumenty(
    { swiadczenieAlboWniosek: NAZWY_GRUP[opis.grupa], forma, platnik: platnikKlucza, poUstaniu },
    katalog,
  );
  if (!Array.isArray(zSlownika)) return { kod: zSlownika.kod };

  const wpisySwiadczenia = (
    zSlownika.length > 0
      ? zSlownika
      : katalog.dokumenty.filter((w) => pasujeDoKlucza(w, opis.grupa, forma, platnikKlucza, poUstaniu))
  )
    .slice()
    .sort((a, b) => a.kolejnosc - b.kolejnosc);
  const wpisy = [...wpisySwiadczenia, ...wpisyDodatkowe(opis, forma, katalog)];

  // Dokument, którego treść bez kropki zaczyna inny dokument listy, powtarza go w krótszym brzmieniu,
  // np. „Odpis skrócony aktu urodzenia.” obok „Odpis skrócony aktu urodzenia dziecka.”.
  const wszystkie = [...new Set(wpisy.flatMap((w) => w.dokumenty))];
  const dokumenty = wszystkie.filter((d) => {
    const rdzen = d.replace(/\.$/, '');
    return !wszystkie.some((inny) => inny !== d && inny.startsWith(`${rdzen} `));
  });
  const adresat = wpisy.find((w) => w.adresat.trim().length > 0)?.adresat ?? null;
  return { dokumenty, adresat, platnik };
}

/**
 * Dokumenty, załączniki i adresat wniosku sprawy z wnioskiem ze słownika dokumentów i adresatów wniosków,
 * według formy zatrudnienia rodzica sprawy i płatnika zasiłku z Danych rodziny. Płatnik nieustalony daje
 * 0087 z przejściem do ViewProfilePayer, gdy odpowiedź o płatniku zapisuje rodzic, który ogląda instrukcję
 * (`rodzicOdpowiadajacy`, ten sam rodzic, którego dane zmienia ViewProfilePayer). Gdy sprawa dotyczy
 * drugiego z rodziców, instrukcja pokazuje dokumenty i adresata przy obu płatnikach.
 */
export function wybierzDokumentyIAdresata(
  sprawa: PozycjaPlanu,
  daneRodziny: DaneRodziny,
  katalog: Katalog,
  rodzicOdpowiadajacy: 'matka' | 'drugi-rodzic' = daneRodziny.rodzicKonta === 'drugi-rodzic' ? 'drugi-rodzic' : 'matka',
): DokumentyIAdresat {
  const idPozycji = idPozycjiSprawy(sprawa);
  const opis = idPozycji === null ? undefined : DOKUMENTY_SPRAW[idPozycji];
  if (opis === undefined) return { typ: 'nie-dotyczy' };

  const pozycjaKatalogu = pozycjaSprawy(sprawa, katalog);
  const { rodzic, forma, dane } = daneRodzicaSprawy(sprawa, pozycjaKatalogu, daneRodziny);
  if (forma === null || forma === 'brak-tytulu') return { typ: 'nie-dotyczy' };

  const zapisany = dane.platnikZasilku?.wartosc ?? 'nieustalony';
  const platnik: 'zus' | 'platnik-skladek' | 'nieustalony' | 'brak-platnika' = forma === 'jdg' ? 'zus' : zapisany;
  if (platnik === 'brak-platnika') return { typ: 'nie-dotyczy' };
  const poUstaniu = czyUstanieWCiazy(dane);

  if (platnik === 'nieustalony') {
    if (rodzic === rodzicOdpowiadajacy) return { typ: 'platnik-nieustalony', kod: '0087' };
    const warianty = (['platnik-skladek', 'zus'] as const)
      .map((p) => wariantDokumentow(opis, forma, p, poUstaniu, katalog))
      .filter((w): w is WariantDokumentow => 'dokumenty' in w);
    return warianty.length > 0 ? { typ: 'warianty-platnika', warianty } : { typ: 'nie-dotyczy' };
  }

  const wariant = wariantDokumentow(opis, forma, platnik, poUstaniu, katalog);
  if ('kod' in wariant) return { typ: 'platnik-nieustalony', kod: wariant.kod };
  return {
    typ: 'lista',
    ...wariant,
    nazwaPlatnika: platnik === 'platnik-skladek' ? dane.platnikZasilku?.nazwaPlatnika : undefined,
  };
}
