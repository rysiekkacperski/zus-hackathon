// Intencje wiadomości do asystenta AI (kontrakt, sekcje 7.2 i 10.3). Właściciel: u31 (Asystent AI).
// Klasyfikacja słowami kluczowymi działa, gdy model jest niedostępny albo zwrócił wynik niezgodny ze schematem.
import type { IdSprawy, IntencjaAsystenta } from '@/domena/typy';

/** Najdłuższa wiadomość do asystenta (R-AS-WAL). */
export const MAKS_DLUGOSC_WIADOMOSCI = 1000;

/** Wszystkie intencje słownika asystenta w kolejności z kontraktu. */
export const INTENCJE_ASYSTENTA: readonly IntencjaAsystenta[] = [
  'termin-sprawy',
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
  'poza-zakresem-medyczne',
  'poza-zakresem-podatkowe',
  'poza-zakresem-inne-osoby',
  'poza-zakresem-spoza-katalogu',
  'poza-zakresem-ocena-indywidualna',
];

export function czyIntencjaAsystenta(wartosc: unknown): wartosc is IntencjaAsystenta {
  return typeof wartosc === 'string' && (INTENCJE_ASYSTENTA as readonly string[]).includes(wartosc);
}

/** Intencja poza zakresem asystenta (R-AS-GRAN): odpowiedź 0070 z akcjami kanałów kontaktu ZUS. */
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
}

// Kolejność reguł rozstrzyga pytania pasujące do kilku intencji: granice asystenta, oznaczenie sprawy
// i porównanie wariantów mają pierwszeństwo przed ogólnymi pytaniami o termin i prawo do świadczenia.
const REGULY: readonly RegulaIntencji[] = [
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
  { intencja: 'termin-sprawy', wzorce: [/do kiedy/, /\btermin/, /\bkiedy\b/, /zdaz/, /spoznie/] },
  { intencja: 'prawo-do-swiadczenia', wzorce: [/czy dostan/, /czy (mi |nam )?przysluguj/, /czy mam prawo/, /czy nalezy/, /\bbecikow/, /\b800/, /zasilek/, /swiadczeni/] },
  { intencja: 'uzupelnienie-profilu', wzorce: [/\bprofil/] },
];

/** Intencja ze słów kluczowych, gdy model jest niedostępny. */
export function klasyfikujSlowamiKluczowymi(tekst: string): IntencjaAsystenta {
  const znormalizowany = normalizujTekst(tekst);
  for (const regula of REGULY) {
    if (regula.wzorce.some((wzorzec) => wzorzec.test(znormalizowany))) return regula.intencja;
  }
  return 'poza-zakresem-spoza-katalogu';
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
