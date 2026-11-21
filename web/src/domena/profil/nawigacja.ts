// Nawigacja kreatora Profilu na start (kontrakt, sekcja 7.2; analiza 3.3.1, reguły R5 i R6).
// Właściciel: u07 (Profil na start: dane ZUS, płatnik, sytuacja).
// Bieżącym ekranem kreatora jest `szkic.ostatniEkran`: widok zapisuje szkic z własnym identyfikatorem
// (zapiszSzkic) i dopiero potem wyznacza następny albo poprzedni ekran.
import type { KrokiKreatoraProps } from '@/komponenty/kroki';
import { czyFormaZPlatnikiemSkladek } from '@/domena/profil/platnik';
import type { DaneRodzica, DrugiRodzic, IdWidoku, SytuacjaRodzica, SzkicProfilu } from '@/domena/typy';
import { teksty } from '@/teksty';

/** Ekrany kreatora profilu w kolejności. */
export const EKRANY_PROFILU: IdWidoku[] = [
  'ViewProfileZusData',
  'ViewProfilePayer',
  'ViewProfileSituation',
  'ViewProfilePregnancy',
  'ViewBirthDate',
  'ViewProfileChildAdoption',
  'ViewProfileEmploymentChange',
  'ViewProfileFamily',
  'ViewProfileSecondParent',
  'ViewProfileSummary',
];

/** Klucz danych rodzica konta w szkicu: matka, a przy przyjęciu dziecka przez ojca drugi rodzic. */
export function kluczRodzicaKonta(szkic: Pick<SzkicProfilu, 'daneRodziny'> | null): 'matka' | 'drugiRodzic' {
  return szkic?.daneRodziny.rodzicKonta === 'drugi-rodzic' ? 'drugiRodzic' : 'matka';
}

/** Dane rodzica konta w szkicu (forma zatrudnienia, dobrowolne ubezpieczenie, płatnik zasiłku). */
export function daneRodzicaKonta(szkic: Pick<SzkicProfilu, 'daneRodziny'> | null): Partial<DaneRodzica> | Partial<DrugiRodzic> {
  if (szkic === null) return {};
  return szkic.daneRodziny[kluczRodzicaKonta(szkic)] ?? {};
}

/** Sytuacja rodzica wybrana na ViewProfileSituation. */
export function sytuacjaSzkicu(szkic: Pick<SzkicProfilu, 'daneRodziny'> | null): SytuacjaRodzica | null {
  return szkic?.daneRodziny.sytuacja?.wartosc ?? null;
}

/**
 * Ekran ViewProfilePayer należy do ścieżki, gdy forma rodzica to umowa o pracę albo umowa zlecenia, a płatnik
 * zasiłku nie wynika z danych konta ZUS: brak płatnika w szkicu albo płatnik z odpowiedzi rodzica.
 */
export function czyEkranPlatnika(szkic: Pick<SzkicProfilu, 'daneRodziny'> | null): boolean {
  const dane = daneRodzicaKonta(szkic);
  const forma = dane.formaZatrudnienia?.wartosc;
  if (forma === 'brak-drugiego-rodzica' || !czyFormaZPlatnikiemSkladek(forma)) return false;
  const platnik = dane.platnikZasilku;
  return platnik === null || platnik === undefined || platnik.zrodlo === 'odpowiedz-rodzica';
}

const EKRAN_SYTUACJI: Record<Exclude<SytuacjaRodzica, 'planowanie'>, IdWidoku> = {
  oczekiwanie: 'ViewProfilePregnancy',
  narodziny: 'ViewBirthDate',
  przyjecie: 'ViewProfileChildAdoption',
};

function nastepnyPoSytuacji(szkic: SzkicProfilu, zgoda: boolean): IdWidoku {
  const sytuacja = sytuacjaSzkicu(szkic);
  if (sytuacja === null) return 'ViewProfileSituation';
  if (sytuacja === 'planowanie') return 'ViewCalcMaternityInput';
  return zgoda ? EKRAN_SYTUACJI[sytuacja] : 'ViewProfileFamily';
}

/** Następny ekran kreatora z pominięciami bez zgody, ścieżką przyjęcia i powrotem na podsumowanie. */
export function nastepnyEkran(szkic: SzkicProfilu, zgoda: boolean): IdWidoku {
  const powrot = szkic.powrotNaPodsumowanie;
  switch (szkic.ostatniEkran) {
    case 'ViewProfileZusData':
      if (czyEkranPlatnika(szkic)) return 'ViewProfilePayer';
      return powrot ? 'ViewProfileSummary' : 'ViewProfileSituation';
    case 'ViewProfilePayer':
      return powrot ? 'ViewProfileSummary' : 'ViewProfileSituation';
    case 'ViewProfileSituation':
      return nastepnyPoSytuacji(szkic, zgoda);
    case 'ViewProfilePregnancy':
    case 'ViewBirthDate':
      if (powrot) return 'ViewProfileSummary';
      return zgoda ? 'ViewProfileEmploymentChange' : 'ViewProfileFamily';
    case 'ViewProfileChildAdoption':
      return powrot ? 'ViewProfileSummary' : 'ViewProfileFamily';
    case 'ViewProfileEmploymentChange':
      return powrot ? 'ViewProfileSummary' : 'ViewProfileFamily';
    case 'ViewProfileFamily':
      return powrot ? 'ViewProfileSummary' : 'ViewProfileSecondParent';
    case 'ViewProfileSecondParent':
    case 'ViewProfileSummary':
      return 'ViewProfileSummary';
    default:
      return 'ViewProfileZusData';
  }
}

/** Poprzedni ekran kreatora. */
export function poprzedniEkran(szkic: SzkicProfilu, zgoda: boolean): IdWidoku {
  const biezacy = szkic.ostatniEkran;
  if (szkic.powrotNaPodsumowanie && biezacy !== 'ViewProfilePayer' && biezacy !== 'ViewProfileSummary') {
    return 'ViewProfileSummary';
  }
  const sytuacja = sytuacjaSzkicu(szkic);
  switch (biezacy) {
    case 'ViewProfileZusData':
      return 'ViewGuideWelcome';
    case 'ViewProfilePayer':
      return 'ViewProfileZusData';
    case 'ViewProfileSituation':
      return czyEkranPlatnika(szkic) ? 'ViewProfilePayer' : 'ViewProfileZusData';
    case 'ViewProfilePregnancy':
    case 'ViewBirthDate':
    case 'ViewProfileChildAdoption':
      return 'ViewProfileSituation';
    case 'ViewProfileEmploymentChange':
      if (sytuacja === 'narodziny') return 'ViewBirthDate';
      if (sytuacja === 'oczekiwanie') return 'ViewProfilePregnancy';
      return 'ViewProfileSituation';
    case 'ViewProfileFamily':
      if (!zgoda || sytuacja === null || sytuacja === 'planowanie') return 'ViewProfileSituation';
      if (sytuacja === 'przyjecie') return 'ViewProfileChildAdoption';
      return 'ViewProfileEmploymentChange';
    case 'ViewProfileSecondParent':
      return 'ViewProfileFamily';
    case 'ViewProfileSummary':
      return 'ViewProfileSecondParent';
    default:
      return 'ViewProfileZusData';
  }
}

type KluczKroku = keyof typeof teksty.ViewProfileZusData.kreator.nazwyKrokow;

/** Numer kroku (od 1) dla ekranu kreatora; ekrany spoza kreatora dostają krok 1. */
function indeksKroku(ekran: IdWidoku): number {
  switch (ekran) {
    case 'ViewProfileSituation':
      return 1;
    case 'ViewProfilePregnancy':
    case 'ViewBirthDate':
    case 'ViewProfileChildAdoption':
      return 2;
    case 'ViewProfileEmploymentChange':
      return 3;
    case 'ViewProfileFamily':
      return 4;
    case 'ViewProfileSecondParent':
      return 5;
    case 'ViewProfileSummary':
      return 6;
    default:
      return 0;
  }
}

function kluczKrokuCiazy(sytuacja: SytuacjaRodzica | null): KluczKroku {
  if (sytuacja === 'oczekiwanie') return 'daneCiazy';
  if (sytuacja === 'narodziny') return 'dataPorodu';
  if (sytuacja === 'przyjecie') return 'przyjecieDziecka';
  return 'ciazaAlboDziecko';
}

/** Liczba kroków kreatora profilu. */
export const LICZBA_KROKOW_PROFILU = 7;

/** Numer i nazwa kroku bieżącego ekranu („Krok 3 z 7: Dane ciąży”). */
export function krokEkranu(szkic: SzkicProfilu | null, biezacy: IdWidoku): { numer: number; liczba: number; nazwa: string } {
  const kroki = nazwyKrokow(sytuacjaSzkicu(szkic));
  const indeks = indeksKroku(biezacy);
  return { numer: indeks + 1, liczba: LICZBA_KROKOW_PROFILU, nazwa: kroki[indeks] };
}

function nazwyKrokow(sytuacja: SytuacjaRodzica | null): string[] {
  const n = teksty.ViewProfileZusData.kreator.nazwyKrokow;
  return [
    n.pracaIZasilek,
    n.sytuacja,
    n[kluczKrokuCiazy(sytuacja)],
    n.zmianaZatrudnienia,
    n.rodzina,
    n.drugiRodzic,
    n.podsumowanie,
  ];
}

/** Lista kroków kreatora ze stanem względem bieżącego ekranu. */
export function krokiProfilu(szkic: SzkicProfilu, zgoda: boolean, biezacy: IdWidoku): KrokiKreatoraProps['kroki'] {
  const sytuacja = sytuacjaSzkicu(szkic);
  const indeksBiezacego = indeksKroku(biezacy);
  const sytuacjaZDanymi = sytuacja === 'oczekiwanie' || sytuacja === 'narodziny' || sytuacja === 'przyjecie';
  const pominiete = new Set<number>();
  if (!zgoda && sytuacjaZDanymi) {
    pominiete.add(2);
    pominiete.add(3);
  }
  if (sytuacja === 'przyjecie') pominiete.add(3);

  return nazwyKrokow(sytuacja).map((etykieta, i) => {
    if (i === indeksBiezacego) return { etykieta, stan: 'biezacy' };
    if (pominiete.has(i)) return { etykieta, stan: 'pominiety' };
    return { etykieta, stan: i < indeksBiezacego ? 'gotowe' : 'oczekuje' };
  });
}
