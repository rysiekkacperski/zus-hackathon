// Nawigacja kreatora Profilu na start (kontrakt, sekcja 7.2; analiza 3.3.1, reguły R5 i R6).
// Właściciel: u07 (Profil na start: dane ZUS, płatnik, sytuacja).
// Bieżącym ekranem kreatora jest `szkic.ostatniEkran`: widok zapisuje szkic z własnym identyfikatorem
// (zapiszSzkic) i dopiero potem wyznacza następny albo poprzedni ekran.
import type { KrokiKreatoraProps, KrokZCzesciami } from '@/komponenty/kroki';
import { czyFormaZPlatnikiemSkladek } from '@/domena/profil/platnik';
import { czyPytacODobrowolne } from '@/domena/profil/zapis';
import { czyPokazacPrzyczyne, czyZmianaZData, type FormularzZmianyZatrudnienia } from '@/domena/profil/zmiana-zatrudnienia';
import type {
  DaneRodzica,
  DrugiRodzic,
  FormaZatrudnieniaDrugiegoRodzica,
  IdWidoku,
  SytuacjaRodzica,
  SzkicProfilu,
} from '@/domena/typy';
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
  // Dane przyjęcia dziecka rodzic podaje z udzieloną zgodą na dane dotyczące zdrowia i bez niej (KA-01 3.3.1.4.2).
  if (sytuacja === 'przyjecie') return EKRAN_SYTUACJI.przyjecie;
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
      if (sytuacja === 'przyjecie') return 'ViewProfileChildAdoption';
      if (!zgoda || sytuacja === null || sytuacja === 'planowanie') return 'ViewProfileSituation';
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

/** Liczba kroków na liście „Kroki profilu”. */
export const LICZBA_KROKOW_PROFILU = 7;

// Części ekranów kreatora: ekran dzielony na części mieści każdą część w oknie bez przewijania, a w „Krok X z N”
// każda część liczy się jako osobny krok.

/** Części ViewProfileZusData: dane formy zatrudnienia, ubezpieczenie chorobowe i płatnik, dzieci i pozostałe dane;
 * bez kopii Danych z konta ZUS najpierw stan odczytu z ponowieniem. */
export function czesciDanychZKontaZus(zDanymiZus: boolean): number {
  return zDanymiZus ? 3 : 4;
}

/** Części ViewProfilePregnancy: termin porodu i liczba dzieci, potem pierwsza wizyta. */
export const CZESCI_DANYCH_CIAZY = 2;

/** Części ViewProfileChildAdoption: rola i forma przyjęcia, daty, liczba dzieci. */
export const CZESCI_PRZYJECIA_DZIECKA = 3;

/** Części ViewProfileFamily: stan cywilny i uznanie ojcostwa, potem gmina i dochód. */
export const CZESCI_DANYCH_RODZINY = 2;

/**
 * Części ViewProfileEmploymentChange: rodzaj zmiany; przy rozpoczęciu i ustaniu forma i data zmiany; przy ustaniu
 * umowy o pracę przyczyna ustania i inne zatrudnienie.
 */
export function czesciZmianyZatrudnienia(f: Pick<FormularzZmianyZatrudnienia, 'rodzaj' | 'forma'>): number {
  if (!czyZmianaZData(f.rodzaj)) return 1;
  return czyPokazacPrzyczyne(f) ? 3 : 2;
}

/** Części ViewProfileSecondParent: forma zatrudnienia, a przy umowie zlecenia i działalności dobrowolne ubezpieczenie. */
export function czesciDrugiegoRodzica(forma: FormaZatrudnieniaDrugiegoRodzica | null | undefined): number {
  return czyPytacODobrowolne(forma) ? 2 : 1;
}

export interface KontekstCzesciProfilu {
  szkic: Pick<SzkicProfilu, 'daneRodziny'> | null;
  /** Konto ma kopię Danych z konta ZUS. */
  zDanymiZus: boolean;
}

/** Liczba części ekranu kreatora według odpowiedzi zapisanych w szkicu. */
export function czesciEkranuProfilu(ekran: IdWidoku, { szkic, zDanymiZus }: KontekstCzesciProfilu): number {
  switch (ekran) {
    case 'ViewProfileZusData':
      return czesciDanychZKontaZus(zDanymiZus);
    case 'ViewProfilePregnancy':
      return CZESCI_DANYCH_CIAZY;
    case 'ViewProfileChildAdoption':
      return CZESCI_PRZYJECIA_DZIECKA;
    case 'ViewProfileEmploymentChange': {
      const zmiana = szkic?.daneRodziny.matka?.zmianaZatrudnienia;
      return czesciZmianyZatrudnienia({ rodzaj: zmiana?.rodzaj.wartosc ?? null, forma: zmiana?.forma?.wartosc ?? null });
    }
    case 'ViewProfileFamily':
      return CZESCI_DANYCH_RODZINY;
    case 'ViewProfileSecondParent':
      return czesciDrugiegoRodzica(szkic?.daneRodziny.drugiRodzic?.formaZatrudnienia?.wartosc);
    default:
      return 1;
  }
}

const EKRANY_CIAZY_ALBO_DZIECKA: readonly IdWidoku[] = ['ViewProfilePregnancy', 'ViewBirthDate', 'ViewProfileChildAdoption'];

/** Ekrany ścieżki kreatora z liczbą części; krok ciąży albo dziecka bez wybranej sytuacji ma jedną część. */
function ekranySciezki(
  szkic: SzkicProfilu | null,
  zgoda: boolean,
  biezacy: IdWidoku,
  kontekst: KontekstCzesciProfilu,
): KrokZCzesciami<string>[] {
  const sytuacja = sytuacjaSzkicu(szkic);
  const ekran = (id: IdWidoku): KrokZCzesciami<string> => ({ id, czesci: czesciEkranuProfilu(id, kontekst) });
  const ekrany: KrokZCzesciami<string>[] = [ekran('ViewProfileZusData')];
  if (biezacy === 'ViewProfilePayer' || czyEkranPlatnika(szkic)) ekrany.push(ekran('ViewProfilePayer'));
  ekrany.push(ekran('ViewProfileSituation'));
  const naEkranieCiazy = EKRANY_CIAZY_ALBO_DZIECKA.includes(biezacy);
  if (zgoda || naEkranieCiazy || sytuacja === 'przyjecie') {
    const ekranSytuacji = sytuacja === null || sytuacja === 'planowanie' ? null : EKRAN_SYTUACJI[sytuacja];
    const ekranCiazy = naEkranieCiazy ? biezacy : ekranSytuacji;
    ekrany.push(ekranCiazy ? ekran(ekranCiazy) : { id: 'ciaza-albo-dziecko' });
  }
  const przyjecie = sytuacja === 'przyjecie' || biezacy === 'ViewProfileChildAdoption';
  if ((zgoda && !przyjecie) || biezacy === 'ViewProfileEmploymentChange') ekrany.push(ekran('ViewProfileEmploymentChange'));
  ekrany.push(ekran('ViewProfileFamily'), ekran('ViewProfileSecondParent'), ekran('ViewProfileSummary'));
  return ekrany;
}

export interface OpcjeKrokuEkranu {
  zgoda: boolean;
  /** Konto ma kopię Danych z konta ZUS. */
  zDanymiZus: boolean;
  /** Bieżąca część ekranu, od 1. */
  czesc?: number;
  /** Liczba części bieżącego ekranu według odpowiedzi na ekranie; domyślnie według szkicu. */
  liczbaCzesci?: number;
}

/**
 * Numer i nazwa kroku bieżącego ekranu („Krok 4 z 11: Dane ciąży”). Każda część ekranu liczy się jako krok,
 * a ekrany pominięte na ścieżce rodzica się nie liczą.
 */
export function krokEkranu(
  szkic: SzkicProfilu | null,
  biezacy: IdWidoku,
  { zgoda, zDanymiZus, czesc = 1, liczbaCzesci }: OpcjeKrokuEkranu,
): { numer: number; liczba: number; nazwa: string } {
  const ekrany = ekranySciezki(szkic, zgoda, biezacy, { szkic, zDanymiZus }).map((e) =>
    e.id === biezacy && liczbaCzesci !== undefined ? { ...e, czesci: liczbaCzesci } : e,
  );
  const czesci = (e: KrokZCzesciami<string>) => Math.max(1, Math.trunc(e.czesci ?? 1));
  const indeks = ekrany.findIndex((e) => e.id === biezacy);
  const wczesniejsze = ekrany.slice(0, Math.max(0, indeks)).reduce((suma, e) => suma + czesci(e), 0);
  const numer = indeks < 0 ? 1 : wczesniejsze + Math.min(Math.max(1, Math.trunc(czesc)), czesci(ekrany[indeks]));
  const liczba = ekrany.reduce((suma, e) => suma + czesci(e), 0);
  return { numer, liczba, nazwa: nazwyKrokow(sytuacjaSzkicu(szkic))[indeksKroku(biezacy)] };
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
    if (sytuacja !== 'przyjecie') pominiete.add(2);
    pominiete.add(3);
  }
  if (sytuacja === 'przyjecie') pominiete.add(3);

  return nazwyKrokow(sytuacja).map((etykieta, i) => {
    if (i === indeksBiezacego) return { etykieta, stan: 'biezacy' };
    if (pominiete.has(i)) return { etykieta, stan: 'pominiety' };
    return { etykieta, stan: i < indeksBiezacego ? 'gotowe' : 'oczekuje' };
  });
}
