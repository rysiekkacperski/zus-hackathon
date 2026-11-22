// Ustalenie płatnika zasiłku (kontrakt, sekcja 7.2; analiza 3.3.1, reguła R4).
// Właściciel: u07 (Profil na start: dane ZUS, płatnik, sytuacja).
import type { DataISO, FormaZatrudnienia, PlatnikZasilku, TytulUbezpieczenia, ZrodloDanej } from '@/domena/typy';

export type OdpowiedzOPlatniku = 'tak' | 'nie' | 'nie-wiem';

export type UstaleniePlatnikaZasilku =
  | { platnik: PlatnikZasilku; nazwa?: string; zrodlo: ZrodloDanej }
  | { pytaj: true; nazwaPlatnika?: string };

/**
 * Płatnik zasiłku z formy zatrudnienia i tytułu tej formy albo potrzeba pytania rodzica (ViewProfilePayer).
 * Przy jednoosobowej działalności zasiłek wypłaca ZUS, a bez tytułu do ubezpieczenia płatnika zasiłku brak.
 * Przy umowie o pracę i umowie zlecenia płatnik składek, który wypłaca zasiłki, jest płatnikiem zasiłku,
 * a płatnik, który ich nie wypłaca, oznacza ZUS. Brak informacji albo brak tytułu tej formy wymaga pytania.
 * `zrodloFormy` podaje źródło płatnika przy działalności i braku tytułu (domyślnie konto ZUS).
 */
export function ustalPlatnikaZasilku(
  forma: FormaZatrudnienia,
  tytul?: TytulUbezpieczenia,
  zrodloFormy: ZrodloDanej = 'konto-zus',
  tytulyZakonczone: TytulUbezpieczenia[] = [],
): UstaleniePlatnikaZasilku {
  if (forma === 'jdg') return { platnik: 'zus', zrodlo: zrodloFormy };
  // Po ustaniu tytułu w ostatnich 280 dniach zasiłek wypłaca ZUS (KA-02 3.3.1.1.5), a bez takiego tytułu
  // płatnika zasiłku brak (KA-03 3.3.1.1.5).
  if (forma === 'brak-tytulu') {
    return tytulyZakonczone.length > 0
      ? { platnik: 'zus', zrodlo: 'konto-zus' }
      : { platnik: 'brak-platnika', zrodlo: zrodloFormy };
  }
  if (tytul === undefined) return { pytaj: true };
  const { nazwa, wyplacaZasilki } = tytul.platnik;
  if (wyplacaZasilki === 'tak') return { platnik: 'platnik-skladek', nazwa, zrodlo: 'konto-zus' };
  if (wyplacaZasilki === 'nie') return { platnik: 'zus', nazwa, zrodlo: 'konto-zus' };
  return { pytaj: true, nazwaPlatnika: nazwa };
}

/** Płatnik zasiłku z odpowiedzi rodzica na ViewProfilePayer: tak, nie albo nie wiem. */
export function platnikZOdpowiedzi(o: OdpowiedzOPlatniku): PlatnikZasilku {
  if (o === 'tak') return 'platnik-skladek';
  if (o === 'nie') return 'zus';
  return 'nieustalony';
}

/** Odpowiedź na ViewProfilePayer odtworzona z zapisanego płatnika ze źródłem odpowiedź rodzica. */
export function odpowiedzZPlatnika(platnik: PlatnikZasilku | undefined): OdpowiedzOPlatniku | null {
  if (platnik === 'platnik-skladek') return 'tak';
  if (platnik === 'zus') return 'nie';
  if (platnik === 'nieustalony') return 'nie-wiem';
  return null;
}

/** Formy, przy których płatnika zasiłku ustala się z płatnika składek albo z pytania na ViewProfilePayer. */
export function czyFormaZPlatnikiemSkladek(forma: FormaZatrudnienia | null | undefined): boolean {
  return forma === 'umowa-o-prace' || forma === 'umowa-zlecenia';
}

/** Płatnik zasiłku ustalony z płatnika składek przy każdym tytule z ubezpieczeniem chorobowym (KA-01 3.3.1.1.5). */
export interface PlatnikTytulu {
  tytul: TytulUbezpieczenia;
  platnik: PlatnikZasilku;
  nazwaPlatnikaSkladek: string;
  glowny: boolean;
}

/** Tytuł ma ubezpieczenie chorobowe obowiązkowe albo dobrowolne. */
function czyZChorobowym(tytul: TytulUbezpieczenia): boolean {
  return tytul.ubezpieczenieChorobowe.rodzaj !== 'brak';
}

/**
 * Płatnicy zasiłku osobno dla każdego trwającego tytułu z ubezpieczeniem chorobowym. Przy działalności zasiłek
 * wypłaca ZUS, przy umowie o pracę i umowie zlecenia płatnik składek, który wypłaca zasiłki, a przy płatniku,
 * który ich nie wypłaca, ZUS. Płatnik z tytułu potwierdzonego jako forma zatrudnienia jest płatnikiem głównym.
 */
export function platnicyTytulow(trwajace: TytulUbezpieczenia[], glowny: TytulUbezpieczenia | undefined): PlatnikTytulu[] {
  return trwajace.filter(czyZChorobowym).map((tytul) => {
    let platnik: PlatnikZasilku = 'zus';
    if (tytul.rodzaj !== 'dzialalnosc') {
      if (tytul.platnik.wyplacaZasilki === 'tak') platnik = 'platnik-skladek';
      else if (tytul.platnik.wyplacaZasilki !== 'nie') platnik = 'nieustalony';
    }
    return { tytul, platnik, nazwaPlatnikaSkladek: tytul.platnik.nazwa, glowny: tytul === glowny };
  });
}

/**
 * Płatnik przewidywany: informacja według stanu na 30 listopada wyznacza płatnika zasiłków w następnym roku
 * kalendarzowym, więc zdarzenie w roku późniejszym wymaga ponownego ustalenia płatnika (KA-05 3.3.1.1.5).
 */
export function czyPlatnikPrzewidywany(tytul: TytulUbezpieczenia | undefined, dataZdarzenia: DataISO | undefined): boolean {
  const stanNa = tytul?.platnik.wyplacaZasilkiStanNa;
  if (!stanNa || !dataZdarzenia) return false;
  const rokWyznaczony = Number(stanNa.slice(0, 4)) + 1;
  return Number(dataZdarzenia.slice(0, 4)) > rokWyznaczony;
}
