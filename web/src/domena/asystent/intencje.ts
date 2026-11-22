// Intencje wiadomości do asystenta AI (kontrakt, sekcje 7.2 i 10.3). Właściciel: u31 (Asystent AI).
// Klasyfikacja słowami kluczowymi działa, gdy model jest niedostępny albo zwrócił wynik niezgodny ze schematem.
import type { IdSprawy, IntencjaAsystenta } from '@/domena/typy';

/** Najdłuższa wiadomość do asystenta (R-AS-WAL). */
export const MAKS_DLUGOSC_WIADOMOSCI = 1000;

/** Wszystkie intencje słownika asystenta w kolejności z kontraktu. */
export const INTENCJE_ASYSTENTA: readonly IntencjaAsystenta[] = [
  'termin-sprawy',
  'najblizsze-terminy',
  'prawo-do-swiadczenia',
  'sprawy-na-tydzien',
  'wysokosc-zasilku',
  'sposob-zalatwienia',
  'rozpoczecie-wniosku-zam',
  'porownanie-wariantow',
  'oznaczenie-sprawy',
  'otwarcie-kalkulatora',
  'otwarcie-instrukcji',
  'uzupelnienie-profilu',
  'zaswiadczenia-lekarskie',
  'poza-zakresem-medyczne',
  'poza-zakresem-podatkowe',
  'poza-zakresem-inne-osoby',
  'poza-zakresem-spoza-katalogu',
  'poza-zakresem-ocena-indywidualna',
];

export function czyIntencjaAsystenta(wartosc: unknown): wartosc is IntencjaAsystenta {
  return typeof wartosc === 'string' && (INTENCJE_ASYSTENTA as readonly string[]).includes(wartosc);
}

/** Intencja poza zakresem asystenta (R-AS-GRAN): 0275 dla pytań medycznych, 0276 dla podatkowych, a pozostałe 0070 z akcjami kanałów kontaktu ZUS. */
export function czyPozaZakresem(intencja: IntencjaAsystenta): boolean {
  return intencja.startsWith('poza-zakresem');
}

/** Tekst małymi literami bez polskich znaków i z pojedynczymi spacjami. */
export function normalizujTekst(tekst: string): string {
  return tekst
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')
    .replace(/\s+/g, ' ')
    .trim();
}

interface RegulaIntencji {
  intencja: IntencjaAsystenta;
  wzorce: RegExp[];
  /** Reguła obowiązuje, gdy wiadomość nie wskazuje żadnej sprawy z katalogu. */
  bezWskazanejSprawy?: boolean;
}

// Kolejność reguł rozstrzyga pytania pasujące do kilku intencji: granice asystenta, oznaczenie sprawy
// i porównanie wariantów mają pierwszeństwo przed ogólnymi pytaniami o termin i prawo do świadczenia.
// Pytanie o ten tydzień ma pierwszeństwo przed pytaniem o najbliższe terminy, a pytanie o najbliższe terminy
// bez wskazanej sprawy przed pytaniem o termin konkretnej sprawy.
const REGULY: readonly RegulaIntencji[] = [
  { intencja: 'zaswiadczenia-lekarskie', wzorce: [/zwolnieni(e|u|a|em) lekarsk/, /\be-?zla\b/, /zaswiadczen(ie|ia|iu) lekarsk/, /\bl4\b/] },
  {
    intencja: 'poza-zakresem-medyczne',
    wzorce: [/\blek(i|u|ow|iem)?\b/, /nudnosc/, /\bbol/, /objaw/, /gorac/, /goraczk/, /tabletk/, /\bdiet/, /witamin/, /krwawien/, /szczepi/, /leczeni/],
  },
  {
    intencja: 'poza-zakresem-podatkowe',
    wzorce: [/podat/, /\bpit\b/, /ulg[aie] (prorodzin|na dziec)/, /urzad skarbow/, /rozlicz(yc|enie) (sie )?z fiskus/],
  },
  {
    intencja: 'poza-zakresem-ocena-indywidualna',
    wzorce: [/czy zus (uzna|przyzna|zaakceptuje|odrzuci|zatwierdzi)/, /zaleg/, /odwolan/, /decyzj[aie] zus/, /kontrol[aie] zus/],
  },
  {
    intencja: 'poza-zakresem-inne-osoby',
    wzorce: [/kolezank/, /kolega/, /sasiad/, /siostr/, /\bbrat/, /\bmoja mama\b/, /tesciow/, /znajom/],
  },
  { intencja: 'oznaczenie-sprawy', wzorce: [/\boznacz/, /zglosil(am|em|ismy) juz/, /juz zglosil/, /zlozyl(am|em|ismy) juz/, /juz zlozyl/, /zalatwil(am|em|ismy)/] },
  { intencja: 'porownanie-wariantow', wzorce: [/oplaca/, /81[,.]5/, /100 ?(i|%) ?70/, /\bwariant/] },
  { intencja: 'wysokosc-zasilku', wzorce: [/ile wyniesie/, /ile dostan/, /wysokosc/, /jaka kwot/, /ile bede dostawac/] },
  { intencja: 'otwarcie-kalkulatora', wzorce: [/kalkulator/] },
  { intencja: 'otwarcie-instrukcji', wzorce: [/instrukcj/] },
  { intencja: 'sposob-zalatwienia', wzorce: [/\bjak (zlozyc|zalatwic|zglosic|zrobic)/, /gdzie (zlozyc|zalatwic|zglosic)/, /w jaki sposob/] },
  { intencja: 'rozpoczecie-wniosku-zam', wzorce: [/(chce|chcialabym|chcialbym) (zlozyc|zaczac|rozpoczac|wypelnic) wniosek o zasilek macierzyn/, /rozpocznij wniosek/, /zacznij wniosek/] },
  { intencja: 'sprawy-na-tydzien', wzorce: [/w tym tygodniu/, /na ten tydzien/, /co mam (teraz )?zrobic/, /co teraz/] },
  {
    intencja: 'najblizsze-terminy',
    bezWskazanejSprawy: true,
    wzorce: [
      /najblizsz/,
      /co (mnie|nas) czeka/,
      /nadchodzac/,
      /zblizajac/,
      /(jakie|ktore) (mam |mamy )?(teraz )?terminy/,
      /(moje|nasze) terminy/,
      /kiedy (musze|musimy|mam|mamy|powinnam|powinienem|powinnismy|trzeba) (cos )?(zlozyc|zalatwic|zglosic|oplacic|zrobic)/,
    ],
  },
  { intencja: 'termin-sprawy', wzorce: [/do kiedy/, /\btermin/, /\bkiedy\b/, /zdaz/, /spoznie/] },
  { intencja: 'prawo-do-swiadczenia', wzorce: [/czy dostan/, /czy (mi |nam )?przysluguj/, /czy mam prawo/, /czy nalezy/, /\bbecikow/, /\b800/, /zasilek/, /swiadczeni/] },
  { intencja: 'uzupelnienie-profilu', wzorce: [/\bprofil/] },
];

/** Intencja ze słów kluczowych, gdy model jest niedostępny. */
export function klasyfikujSlowamiKluczowymi(tekst: string): IntencjaAsystenta {
  const znormalizowany = normalizujTekst(tekst);
  const wskazujeSprawe = pozycjeZTekstu(tekst).length > 0;
  for (const regula of REGULY) {
    if (regula.bezWskazanejSprawy && wskazujeSprawe) continue;
    if (regula.wzorce.some((wzorzec) => wzorzec.test(znormalizowany))) return regula.intencja;
  }
  return 'poza-zakresem-spoza-katalogu';
}

/**
 * Intencja po uzgodnieniu klasyfikacji modelu ze słowami kluczowymi wiadomości `wiadomosc`.
 * - Pytanie o najbliższe terminy bez sprawy z katalogu w wiadomości, które model uznał za pytanie o ten tydzień,
 *   dostaje intencję najblizsze-terminy. Tak samo pytanie, które model uznał za termin sprawy bez wskazanej sprawy.
 *   Sprawy, które model wskazał przy intencji najblizsze-terminy, zostają wtedy bez wpływu na intencję.
 * - Pytanie wprost o ten tydzień zostaje intencją sprawy-na-tydzien.
 * - Pytanie o sprawę z katalogu albo pytanie o termin ze sprawami wskazanymi przez model dostaje intencję termin-sprawy.
 */
export function uzgodnijIntencje(
  zModelu: IntencjaAsystenta,
  zeSlowKluczowych: IntencjaAsystenta,
  idSprawy: readonly string[],
  wiadomosc: string,
): IntencjaAsystenta {
  if (zeSlowKluczowych === 'najblizsze-terminy') {
    if (zModelu === 'sprawy-na-tydzien') return 'najblizsze-terminy';
    if (zModelu === 'termin-sprawy' && idSprawy.length === 0) return 'najblizsze-terminy';
    return zModelu;
  }
  if (zModelu !== 'najblizsze-terminy') return zModelu;
  if (zeSlowKluczowych === 'sprawy-na-tydzien') return 'sprawy-na-tydzien';
  const sprawaWWiadomosci = pozycjeZTekstu(wiadomosc).length > 0;
  if (sprawaWWiadomosci || (zeSlowKluczowych === 'termin-sprawy' && idSprawy.length > 0)) return 'termin-sprawy';
  return zModelu;
}

// Słowa kluczowe pozycji katalogu, z których odczytujemy sprawy wskazane w pytaniu.
const SLOWA_SPRAW: readonly { idPozycji: string; wzorce: RegExp[] }[] = [
  { idPozycji: 'K12', wzorce: [/800/, /wychowawcz/] },
  { idPozycji: 'K14', wzorce: [/becikow/] },
  { idPozycji: 'K15', wzorce: [/dodat(ek|ku) z tytulu urodzenia/] },
  { idPozycji: 'K16', wzorce: [/swiadczeni[ea] rodzicielski/] },
  { idPozycji: 'K06', wzorce: [/urodzeni[ea] dziecka/, /zglosil(am|em|ismy)? (juz )?urodzeni/, /\burodzenie\b/, /akt urodzenia/] },
  { idPozycji: 'K05', wzorce: [/ubezpieczeni[ea] zdrowotn/, /\bnfz\b/] },
  { idPozycji: 'K07', wzorce: [/urlop (macierzynski|rodzicielski) .*pracodaw/, /u pracodawcy/] },
  { idPozycji: 'K08', wzorce: [/zasil(ek|ku) macierzyn/, /\bzam\b/] },
  { idPozycji: 'K09', wzorce: [/ojcowsk/] },
  { idPozycji: 'K10', wzorce: [/rodzicielsk.* drugiego rodzica/] },
  { idPozycji: 'K01', wzorce: [/pierwsz[aey] wizyt/] },
];

/** Pozycje katalogu, o które pyta wiadomość, w kolejności z listy słów kluczowych. */
export function pozycjeZTekstu(tekst: string): string[] {
  const znormalizowany = normalizujTekst(tekst);
  return SLOWA_SPRAW.filter((s) => s.wzorce.some((w) => w.test(znormalizowany))).map((s) => s.idPozycji);
}

/** Sprawy planu wskazane w wiadomości: dopasowanie pozycji katalogu do identyfikatorów spraw planu. */
export function sprawyZTekstu(tekst: string, sprawyPlanu: readonly { idSprawy: IdSprawy }[], pozycjeSpraw: Readonly<Record<IdSprawy, string>>): IdSprawy[] {
  const pozycje = pozycjeZTekstu(tekst);
  const wynik: IdSprawy[] = [];
  for (const idPozycji of pozycje) {
    for (const sprawa of sprawyPlanu) {
      const pozycja = pozycjeSpraw[sprawa.idSprawy] ?? sprawa.idSprawy;
      if (pozycja === idPozycji && !wynik.includes(sprawa.idSprawy)) wynik.push(sprawa.idSprawy);
    }
  }
  return wynik;
}

/** Wiadomość przycięta do 1000 znaków (wklejenie dłuższego tekstu, R-AS-WAL). */
export function przytnijWiadomosc(t: string): string {
  return t.length > MAKS_DLUGOSC_WIADOMOSCI ? t.slice(0, MAKS_DLUGOSC_WIADOMOSCI) : t;
}

/** Liczba znaków wiadomości liczona jak w polu z limitem `maxlength`. */
export function dlugoscWiadomosci(t: string): number {
  return t.length;
}

/** Czy wiadomość ma od 1 do 1000 znaków po pominięciu samych spacji. */
export function walidujWiadomosc(t: string): boolean {
  return t.trim().length >= 1 && t.length <= MAKS_DLUGOSC_WIADOMOSCI;
}
