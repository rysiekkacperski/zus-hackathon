// Płatnik świadczenia z ubezpieczenia chorobowego (kontrakt, sekcja 7.2; ANALIZY/05 sekcja 5.13).
// Właściciel: u16 (Świadczenia w ciąży i dokumenty wniosków).
import type { FormaZatrudnienia, PlatnikZasilku, TytulUbezpieczenia } from '@/domena/typy';
import { teksty } from '@/teksty';

export interface PlatnikSwiadczenia {
  platnik: 'zus' | 'platnik-skladek';
  wyplaca: string;
}

export interface WejsciePlatnika {
  forma: FormaZatrudnienia | null;
  /** Płatnik zasiłku zapisany w danych rodziny; null, gdy profil go nie zawiera. */
  platnikZasilku: PlatnikZasilku | null;
  nazwaPlatnika?: string;
  /** Tytuł ubezpieczenia z danymi płatnika składek z konta ZUS. */
  tytul?: TytulUbezpieczenia;
  poUstaniu?: boolean;
  swiadczenie?: 'zasilek-chorobowy' | 'swiadczenie-rehabilitacyjne' | 'zwzm' | 'zasilek-macierzynski';
}

/** Płatnik zasiłku z danych rodziny, a bez nich z informacji o wypłacie zasiłków przez płatnika składek. */
export function platnikZasilkuMatki(w: WejsciePlatnika): PlatnikZasilku {
  if (w.forma === 'jdg' || w.forma === 'brak-tytulu') return w.forma === 'jdg' ? 'zus' : 'brak-platnika';
  if (w.platnikZasilku !== null) return w.platnikZasilku;
  const wyplaca = w.tytul?.platnik.wyplacaZasilki;
  if (wyplaca === 'tak') return 'platnik-skladek';
  if (wyplaca === 'nie') return 'zus';
  return 'nieustalony';
}

/**
 * Kto wypłaca świadczenie: ZUS przy jednoosobowej działalności, po ustaniu ubezpieczenia i przy zasiłku
 * w wysokości zasiłku macierzyńskiego, a u pracownicy i zleceniobiorczyni płatnik uprawniony albo ZUS.
 * Null, gdy płatnik zasiłku jest nieustalony.
 */
export function ustalPlatnikaSwiadczenia(w: WejsciePlatnika): PlatnikSwiadczenia | null {
  const zus: PlatnikSwiadczenia = { platnik: 'zus', wyplaca: teksty.ViewPregnancyBenefits.platnicy.zus };
  if (w.poUstaniu || w.forma === 'jdg' || w.swiadczenie === 'zwzm') return zus;
  const platnik = platnikZasilkuMatki(w);
  if (platnik === 'zus') return zus;
  if (platnik === 'platnik-skladek') {
    const nazwa = w.nazwaPlatnika ?? w.tytul?.platnik.nazwa;
    return { platnik: 'platnik-skladek', wyplaca: nazwa ?? teksty.ViewPregnancyBenefits.platnicy.platnikSkladek };
  }
  return null;
}

/** Tekst „<płatnik> albo ZUS” dla płatnika nieustalonego. */
export function opisPlatnikaNieustalonego(w: WejsciePlatnika): string {
  const nazwa = w.nazwaPlatnika ?? w.tytul?.platnik.nazwa ?? teksty.ViewPregnancyBenefits.platnicy.platnikSkladek;
  return teksty.ViewPregnancyBenefits.platnicy.albo({ nazwa });
}

/** Pracodawca wypłacający wynagrodzenie chorobowe. */
export function opisPracodawcy(tytul?: TytulUbezpieczenia): string {
  const nazwa = tytul?.platnik.nazwa;
  return nazwa ? teksty.ViewPregnancyBenefits.platnicy.pracodawcaZNazwa({ nazwa }) : teksty.ViewPregnancyBenefits.platnicy.pracodawca;
}
