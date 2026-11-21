// Ustalenie płatnika zasiłku (kontrakt, sekcja 7.2; analiza 3.3.1, reguła R4).
// Właściciel: u07 (Profil na start: dane ZUS, płatnik, sytuacja).
import type { FormaZatrudnienia, PlatnikZasilku, TytulUbezpieczenia, ZrodloDanej } from '@/domena/typy';

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
): UstaleniePlatnikaZasilku {
  if (forma === 'jdg') return { platnik: 'zus', zrodlo: zrodloFormy };
  if (forma === 'brak-tytulu') return { platnik: 'brak-platnika', zrodlo: zrodloFormy };
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
