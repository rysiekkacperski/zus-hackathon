// Budowniczy adresów widoków. Moduły domeny zwracają IdWidoku, a interfejs zamienia go na adres
// przez `trasy.<IdWidoku>(parametry)` albo `sciezkaWidoku(id, parametry)`.

import type { Etap, IdWidoku, Pochodzenie } from '@/domena/typy';
import {
  czyWidokBezTrasy,
  dopasujTrase,
  gospodarzeWidokowBezTrasy,
  idWidokowZTrasa,
  wpisWidoku,
  type IdWidokuZTrasa,
  type KanalSymulowany,
  type OdwolanieDoWidoku,
  type TrybyWidokow,
} from '@/komponenty/rama/mapa-tras';

export { czyTrasaDlaGoscia, dopasujTrase } from '@/komponenty/rama/mapa-tras';

type Wartosc = string | number | boolean | null | undefined;
type Zapytanie<K extends string> = { readonly [P in K]?: Wartosc };
type BezParametrow = Zapytanie<never>;

/** Parametry dowolnego widoku: segmenty dynamiczne, `tryb` i parametry zapytania. */
export type ParametryTrasy = Readonly<Record<string, Wartosc>>;

/** Parametry budowniczych `trasy.<IdWidoku>`: segmenty dynamiczne są wymagane, zapytanie opcjonalne. */
export interface ParametryWidokow {
  ViewGuideStart: Zapytanie<'powrot'>;
  ViewMobywatelLogin: BezParametrow;
  ViewEzusLogin: BezParametrow;
  ViewMzusCodeLogin: BezParametrow;
  ViewDemoAccountPicker: BezParametrow;
  ViewDemoNewAccount: BezParametrow;
  ViewDemoSettings: BezParametrow;
  ViewDemoInbox: Zapytanie<'konto'>;
  ViewGuideWelcome: BezParametrow;
  ViewGuideSettings: BezParametrow;
  ViewProfileZusData: Zapytanie<'powrot'>;
  ViewProfilePayer: Zapytanie<'powrot'>;
  ViewProfileSituation: BezParametrow;
  ViewProfilePregnancy: BezParametrow;
  ViewBirthDate: { tryb?: TrybyWidokow['ViewBirthDate'] };
  ViewProfileChildAdoption: Zapytanie<'powrot'>;
  ViewProfileEmploymentChange: BezParametrow;
  ViewProfileFamily: BezParametrow;
  ViewProfileSecondParent: BezParametrow;
  ViewProfileSummary: { tryb?: TrybyWidokow['ViewProfileSummary'] };
  ViewBirthDetails: { tryb?: TrybyWidokow['ViewBirthDetails'] };
  ViewSecondParentPowerOfAttorney: BezParametrow;
  ViewBirthPackage: BezParametrow;
  ViewSpecialSituation: BezParametrow;
  ViewFamilyPlan: BezParametrow;
  ViewFamilyPlanStage: { etap: Etap };
  ViewPregnancyBenefits: BezParametrow;
  ViewCaseDetails: { idSprawy: string; z?: Pochodzenie; arkusz?: 'ryzyko'; etap?: Etap };
  ViewCaseGuide: { idSprawy: string; z?: Pochodzenie; etap?: Etap };
  ViewDeadlines: BezParametrow;
  ViewApplicationList: BezParametrow;
  ViewSickLeaveList: BezParametrow;
  ViewContributionBalance: BezParametrow;
  ViewContributionCertificate: BezParametrow;
  ViewZusAccountData: Zapytanie<'sprawa'>;
  ViewZusQuestion: Zapytanie<'sprawa'> & { z?: 'asystent' };
  ViewZusQuestionSent: { idPytania: string };
  ViewSupportOrganizations: Zapytanie<'sytuacja' | 'powrot'>;
  ViewCalcMaternityInput: Zapytanie<'sprawa'> & { zrodlo?: 'przykladowa-sprawa' };
  ViewCalcMaternityResult: Zapytanie<'sprawa' | 'zrodlo'> & {
    arkusz?: 'podzial-urlopow' | 'laczenie-z-praca' | 'powrot-do-pracy';
  };
  ViewCalcScenarioCompare: Zapytanie<'numery'>;
  ViewCalcMaternityVariant: Zapytanie<'sprawa'>;
  ViewCalcParentalSplit: Zapytanie<'sprawa'>;
  ViewSampleCaseList: BezParametrow;
  ViewSampleCaseUpload: { tryb?: never; trybWgrania?: 'nowa' | 'dodaj' };
  ViewSampleCaseData: BezParametrow;
  ViewSampleCaseVerification: BezParametrow;
  ViewZamLeaveType: Zapytanie<'sprawa' | 'wniosek'>;
  ViewZamPrebirth: Zapytanie<'wniosek'>;
  ViewZamPeriod: Zapytanie<'wniosek'>;
  ViewFatherTakeover: { tryb?: TrybyWidokow['ViewFatherTakeover'] } & Zapytanie<'sprawa' | 'sytuacja' | 'data' | 'wniosek'>;
  ViewZamData: Zapytanie<'wniosek'> & { tryb?: never; trybDanych?: 'przekazanie-danych-dziecka' };
  ViewZamStatements: Zapytanie<'wniosek'>;
  ViewZamSummary: Zapytanie<'wniosek'>;
  ViewZamSent: Zapytanie<'wniosek'>;
  ViewZamForPayer: Zapytanie<'wniosek'>;
  ViewZas53Start: Zapytanie<'sprawa' | 'zaswiadczenie'>;
  ViewZas53Certificate: Zapytanie<'wniosek'>;
  ViewZas53AfterInsurance: Zapytanie<'wniosek'>;
  ViewZas53Data: Zapytanie<'wniosek'>;
  ViewZas53Summary: Zapytanie<'wniosek'>;
  ViewZas53Sent: Zapytanie<'wniosek'>;
  ViewZ15Start: Zapytanie<'sprawa' | 'sytuacja'>;
  ViewZ15Situation: Zapytanie<'wniosek'>;
  ViewZ15Statements: Zapytanie<'wniosek'>;
  ViewZ15Data: Zapytanie<'wniosek'>;
  ViewZ15Summary: Zapytanie<'wniosek'>;
  ViewZ15Sent: Zapytanie<'wniosek'>;
  ViewZ15ForPayer: Zapytanie<'wniosek'>;
  ViewLeaveRequestType: Zapytanie<'sprawa' | 'wniosek' | 'scenariusz'>;
  ViewLeaveRequestForm: Zapytanie<'wniosek'>;
  ViewLeaveRequestSummary: Zapytanie<'wniosek'>;
  ViewLeaveRequestSent: Zapytanie<'wniosek'>;
  ViewMaternityResignation: Zapytanie<'sprawa' | 'wniosek'>;
  ViewBirthCertificateRequest: Zapytanie<'wniosek'>;
  ViewBirthCertificateRequestSent: Zapytanie<'wniosek'>;
  ViewInviteAccept: { token: string };
  ViewCatalogList: { zakladka?: 'pozycje' | 'kwoty' | 'wymiary' | 'reguly' | 'dokumenty' };
  ViewCatalogValueEdit: { idWpisu: string };
  ViewCatalogItemAdd: BezParametrow;
  ViewCatalogItemEdit: { idPozycji: string };
  ViewCatalogEntryAdd: Zapytanie<'slownik'>;
  ViewCatalogDocumentEdit: { idDokumentu: string };
  ViewCatalogDocumentAdd: Zapytanie<'grupa'>;
  ViewCatalogSupportOrganizations:
    | { tryb?: 'lista' }
    | { tryb: 'nowa' }
    | { tryb: 'edycja'; idOrganizacji: string };
  ViewEzusHome: BezParametrow;
  ViewEzus800Application: BezParametrow;
  ViewEzusActiveParentApplication: BezParametrow;
  ViewEzusApplicationDetails: { idWniosku: string };
  ViewEzusZas23: Zapytanie<'czesc'>;
  ViewZusEVisit: BezParametrow;
  ViewSimulatedChannel: { kanal: KanalSymulowany };
}

// Parametry zapytania o nazwie `tryb` kolidują z trybem widoku, więc budowniczy przyjmują je pod
// inną nazwą i zapisują w adresie jako ?tryb=.
const zapytanieTrybu: Readonly<Record<string, string>> = {
  trybWgrania: 'tryb',
  trybDanych: 'tryb',
};

type Budowniczy<P> = Record<never, never> extends P ? (parametry?: P) => string : (parametry: P) => string;

export type Trasy = { readonly [K in IdWidokuZTrasa]: Budowniczy<ParametryWidokow[K]> };

function tekstWartosci(wartosc: Wartosc): string | null {
  if (wartosc === null || wartosc === undefined || wartosc === '') return null;
  return String(wartosc);
}

function zbudujSciezke(id: IdWidokuZTrasa, parametry: ParametryTrasy = {}): string {
  const tryb = tekstWartosci(parametry.tryb) ?? undefined;
  const wpis = wpisWidoku(id, tryb);
  const uzyte = new Set<string>(['tryb']);

  const sciezka = wpis.wzorzec.replace(/\[([^\]]+)\]/g, (_, nazwa: string) => {
    uzyte.add(nazwa);
    const wartosc = tekstWartosci(parametry[nazwa]) ?? wpis.przykladoweParametry?.[nazwa] ?? nazwa;
    return encodeURIComponent(wartosc);
  });

  const zapytanie = new URLSearchParams();
  for (const [klucz, wartosc] of Object.entries(parametry)) {
    if (uzyte.has(klucz)) continue;
    const tekst = tekstWartosci(wartosc);
    if (tekst !== null) zapytanie.set(zapytanieTrybu[klucz] ?? klucz, tekst);
  }
  const tekstZapytania = zapytanie.toString();
  return tekstZapytania ? `${sciezka}?${tekstZapytania}` : sciezka;
}

/**
 * Adres widoku. Widok bez trasy (arkusz, okno, panel asystenta) prowadzi do widoku gospodarza,
 * a arkusz otwierany parametrem dostaje ?arkusz=. Brakujący segment dynamiczny przyjmuje wartość
 * przykładową z mapy tras, co pozwala przejść ścieżkę ekranów zastępczych.
 */
export function sciezkaWidoku(id: IdWidoku, parametry?: ParametryTrasy): string {
  if (czyWidokBezTrasy(id)) {
    const gospodarz = gospodarzeWidokowBezTrasy[id];
    return zbudujSciezke(gospodarz.widok, {
      ...(gospodarz.tryb ? { tryb: gospodarz.tryb } : {}),
      ...(gospodarz.arkusz ? { arkusz: gospodarz.arkusz } : {}),
      ...parametry,
    });
  }
  return zbudujSciezke(id as IdWidokuZTrasa, parametry);
}

/** Adres odwołania z mapy tras (rodzic, następny widok ekranu zastępczego). */
export function sciezkaOdwolania(odwolanie: OdwolanieDoWidoku, parametry?: ParametryTrasy): string {
  return zbudujSciezke(odwolanie.widok, { ...parametry, ...(odwolanie.tryb ? { tryb: odwolanie.tryb } : {}) });
}

export const trasy = Object.fromEntries(
  idWidokowZTrasa.map((id) => [id, (parametry?: ParametryTrasy) => zbudujSciezke(id, parametry)]),
) as unknown as Trasy;

const MAKS_DLUGOSC_POWROTU = 2048;
const BAZA_ADRESU = 'http://przewodnik.invalid';

/**
 * Bezpieczna wartość parametru ?powrot=: ścieżka zaczynająca się od jednego ukośnika, bez znaków
 * sterujących i ukośników wstecznych, wskazująca trasę z mapy tras. Zwraca ścieżkę z zapytaniem
 * albo null.
 */
export function bezpiecznyPowrot(wartosc: string | null | undefined): string | null {
  if (typeof wartosc !== 'string' || wartosc.length === 0 || wartosc.length > MAKS_DLUGOSC_POWROTU) return null;
  if (!wartosc.startsWith('/') || wartosc.startsWith('//')) return null;
  if (/[\\\u0000-\u001f\u007f]/.test(wartosc)) return null;

  let adres: URL;
  try {
    adres = new URL(wartosc, BAZA_ADRESU);
  } catch {
    return null;
  }
  if (adres.origin !== BAZA_ADRESU) return null;
  if (dopasujTrase(adres.pathname) === null) return null;
  return `${adres.pathname}${adres.search}`;
}

/** Adres strony startowej z logowaniem i powrotem na podaną ścieżkę (przycisk „Zaloguj się” gościa). */
export function sciezkaLogowaniaZPowrotem(sciezka: string): string {
  const powrot = bezpiecznyPowrot(sciezka);
  return powrot === null || powrot === '/' ? '/' : zbudujSciezke('ViewGuideStart', { powrot });
}
