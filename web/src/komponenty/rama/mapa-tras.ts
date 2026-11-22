// Mapa tras aplikacji: każdy wpis odpowiada jednemu folderowi trasy w src/app/.
// Wpis podaje wzorzec adresu, identyfikator widoku, tryb widoku, role z dostępem, pozycję menu
// bocznego, widok rodzica dla linku powrotu i następny widok ścieżki ekranów zastępczych.
// Plik nie ma importów wykonywanych w czasie działania, więc korzystają z niego serwer, przeglądarka
// i skrypty narzędziowe.

import type { IdWidoku, Pochodzenie, Rola } from '@/domena/typy';

export type { IdWidoku };

const NU = 'nowy-uzytkownik' satisfies Rola;
const R = 'rodzic' satisfies Rola;
const DR = 'drugi-rodzic' satisfies Rola;
const A = 'administrator' satisfies Rola;

const BEZ_ROLI: readonly Rola[] = [];
const ROLE_NU_R: readonly Rola[] = [NU, R];
const ROLE_NU_R_DR: readonly Rola[] = [NU, R, DR];
const ROLE_R: readonly Rola[] = [R];
const ROLE_R_DR: readonly Rola[] = [R, DR];
const ROLE_A: readonly Rola[] = [A];
const ROLE_ZALOGOWANE: readonly Rola[] = [NU, R, DR, A];

/** Widoki, które mają własną trasę, w kolejności mapy tras. */
export const idWidokowZTrasa = [
  'ViewGuideStart',
  'ViewMobywatelLogin',
  'ViewEzusLogin',
  'ViewMzusCodeLogin',
  'ViewDemoAccountPicker',
  'ViewDemoNewAccount',
  'ViewDemoSettings',
  'ViewDemoInbox',
  'ViewGuideWelcome',
  'ViewGuideSettings',
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
  'ViewBirthDetails',
  'ViewSecondParentPowerOfAttorney',
  'ViewBirthPackage',
  'ViewSpecialSituation',
  'ViewFamilyPlan',
  'ViewFamilyPlanStage',
  'ViewPregnancyBenefits',
  'ViewCaseDetails',
  'ViewCaseGuide',
  'ViewDeadlines',
  'ViewApplicationList',
  'ViewSickLeaveList',
  'ViewContributionBalance',
  'ViewContributionCertificate',
  'ViewZusAccountData',
  'ViewZusQuestion',
  'ViewZusQuestionSent',
  'ViewSupportOrganizations',
  'ViewCalcMaternityInput',
  'ViewCalcMaternityResult',
  'ViewCalcScenarioCompare',
  'ViewCalcMaternityVariant',
  'ViewCalcParentalSplit',
  'ViewSampleCaseList',
  'ViewSampleCaseUpload',
  'ViewSampleCaseData',
  'ViewSampleCaseVerification',
  'ViewZamLeaveType',
  'ViewZamPrebirth',
  'ViewZamPeriod',
  'ViewFatherTakeover',
  'ViewZamData',
  'ViewZamStatements',
  'ViewZamSummary',
  'ViewZamSent',
  'ViewZamForPayer',
  'ViewZas53Start',
  'ViewZas53Certificate',
  'ViewZas53AfterInsurance',
  'ViewZas53Data',
  'ViewZas53Summary',
  'ViewZas53Sent',
  'ViewZ15Start',
  'ViewZ15Situation',
  'ViewZ15Statements',
  'ViewZ15Data',
  'ViewZ15Summary',
  'ViewZ15Sent',
  'ViewZ15ForPayer',
  'ViewLeaveRequestType',
  'ViewLeaveRequestForm',
  'ViewLeaveRequestSummary',
  'ViewLeaveRequestSent',
  'ViewMaternityResignation',
  'ViewBirthCertificateRequest',
  'ViewBirthCertificateRequestSent',
  'ViewInviteAccept',
  'ViewCatalogList',
  'ViewCatalogValueEdit',
  'ViewCatalogItemAdd',
  'ViewCatalogSupportOrganizations',
  'ViewEzusHome',
  'ViewEzus800Application',
  'ViewEzusActiveParentApplication',
  'ViewEzusApplicationDetails',
  'ViewZusEVisit',
  'ViewSimulatedChannel',
] as const satisfies readonly IdWidoku[];

export type IdWidokuZTrasa = (typeof idWidokowZTrasa)[number];

/** Arkusze, okna modalne i panel asystenta, czyli widoki bez własnej trasy. */
export const idWidokowBezTrasy = [
  'ViewAssistantChat',
  'SheetHealthDataConsent',
  'ModalConsentText',
  'SheetConsentWithdrawConfirm',
  'SheetFamilyDataDeleteConfirm',
  'SheetEmploymentChoice',
  'SheetContributionPaidConfirm',
  'ModalNewChildDetected',
  'ModalBenefitRules',
  'SheetCaseDoneConfirm',
  'SheetCalendarDownload',
  'SheetCalcBaseSource',
  'ModalCalcAppliedRules',
  'SheetCalcParentalParts',
  'SheetCalcWorkCombination',
  'SheetCalcReturnToWork',
  'ModalSampleCaseDocument',
  'ModalSickLeaveDetails',
  'ModalStatementsText',
  'SheetZas53ManualCertificate',
  'ModalEmployerMessagePreview',
  'SheetRiskDetails',
  'SheetInviteSecondParent',
  'SheetSecondParentRemoveConfirm',
  'SheetSpecialSituationConfirm',
  'SheetAssistantActionConfirm',
] as const satisfies readonly IdWidoku[];

export type IdWidokuBezTrasy = (typeof idWidokowBezTrasy)[number];

/** Tryby widoków, które mają kilka tras. Pierwszy tryb na liście jest trybem domyślnym. */
export interface TrybyWidokow {
  ViewBirthDate: 'pakiet' | 'profil';
  ViewProfileSummary: 'start' | 'rodzina';
  ViewBirthDetails: 'pakiet' | 'zmiana';
  ViewFatherTakeover: 'wniosek' | 'zam';
  ViewCatalogSupportOrganizations: 'lista' | 'nowa' | 'edycja';
}

export type IdWidokuZTrybem = keyof TrybyWidokow;
export type TrybWidoku<K extends IdWidokuZTrybem> = TrybyWidokow[K];

export const trybyDomyslne: { readonly [K in IdWidokuZTrybem]: TrybyWidokow[K] } = {
  ViewBirthDate: 'pakiet',
  ViewProfileSummary: 'start',
  ViewBirthDetails: 'pakiet',
  ViewFatherTakeover: 'wniosek',
  ViewCatalogSupportOrganizations: 'lista',
};

/** Kanały symulowanych serwisów zewnętrznych pod /kanal/[kanal] obsługiwane przez ViewSimulatedChannel. */
export const kanalySymulowane = [
  'empatia',
  'mobywatel',
  'gov-zgloszenie-urodzenia',
  'gov-rejestr-stanu-cywilnego',
  'pue-ezus',
] as const;
export type KanalSymulowany = (typeof kanalySymulowane)[number];

/** Kanał e-wizyty ZUS pod /kanal/e-wizyta obsługiwany przez ViewZusEVisit. */
export const kanalEWizyty = 'e-wizyta';

/** Widoki pozycji menu bocznego (sekcja menu według roli). */
export type WidokMenu =
  | 'ViewFamilyPlan'
  | 'ViewProfileSummary'
  | 'ViewSpecialSituation'
  | 'ViewDeadlines'
  | 'ViewApplicationList'
  | 'ViewCalcMaternityInput'
  | 'ViewSampleCaseList'
  | 'ViewProfileZusData'
  | 'ViewCatalogList'
  | 'ViewCatalogSupportOrganizations';

/** Parametr ?z= na ViewCaseDetails i ViewCaseGuide nadpisuje wyróżnioną pozycję menu. */
export const widokMenuDlaPochodzenia: Readonly<Partial<Record<Pochodzenie, WidokMenu>>> = {
  plan: 'ViewFamilyPlan',
  terminy: 'ViewDeadlines',
  wnioski: 'ViewApplicationList',
};

export type GrupaTras = 'publiczne' | 'strefa' | 'symulacje';
/** publiczny: trasa bez logowania; zalogowany: trasa wymaga sesji i roli z listy `role`. */
export type DostepTrasy = 'publiczny' | 'zalogowany';
/** Dodatkowy warunek wejścia na trasę publiczną. */
export type WarunekTrasy = 'trybDemonstracyjny' | 'potwierdzonaMakieta';

export interface OdwolanieDoWidoku {
  widok: IdWidokuZTrasa;
  tryb?: string;
}

export interface WpisTrasy {
  widok: IdWidokuZTrasa;
  /** Tryb widoku, gdy widok ma kilka tras (TrybyWidokow). */
  tryb?: string;
  /** Wzorzec adresu z segmentami dynamicznymi w nawiasach kwadratowych, np. /sprawy/[idSprawy]. */
  wzorzec: string;
  /** Folder trasy względem src/app/. */
  folder: string;
  /** Folder z plikiem widok.tsx, gdy trasa importuje widok z trasy podstawowej. */
  folderWidoku?: string;
  grupa: GrupaTras;
  dostep: DostepTrasy;
  role: readonly Rola[];
  /**
   * Trasa dostępna także bez logowania, w trybie gościa (kalkulator zasiłku i przykładowe sprawy). Zalogowane
   * konto wchodzi na nią według listy `role`.
   */
  gosc?: true;
  warunek?: WarunekTrasy;
  pozycjaMenu?: WidokMenu;
  /** Cel linku powrotu bez parametru ?powrot=. */
  rodzic?: OdwolanieDoWidoku;
  /** Następny widok ścieżki, do którego prowadzi ekran zastępczy. */
  nastepnyZastepczy?: OdwolanieDoWidoku;
  /** Obsługiwane parametry zapytania. */
  zapytanie: readonly string[];
  /** Jednostka właściciela widoku. */
  jednostka: string;
  /** Wartości segmentów dynamicznych dla linków ekranów zastępczych i trybu demonstracyjnego. */
  przykladoweParametry?: Readonly<Record<string, string>>;
}

const PLAN: OdwolanieDoWidoku = { widok: 'ViewFamilyPlan' };
const WNIOSKI: OdwolanieDoWidoku = { widok: 'ViewApplicationList' };

export const mapaTras: readonly WpisTrasy[] = [
  // Ekrany przed zalogowaniem
  {
    widok: 'ViewGuideStart', wzorzec: '/', folder: '(publiczne)',
    grupa: 'publiczne', dostep: 'publiczny', role: BEZ_ROLI,
    nastepnyZastepczy: { widok: 'ViewMobywatelLogin' }, zapytanie: ['powrot'], jednostka: 'u01',
  },
  {
    widok: 'ViewMobywatelLogin', wzorzec: '/logowanie/mobywatel', folder: '(publiczne)/logowanie/mobywatel',
    grupa: 'publiczne', dostep: 'publiczny', role: BEZ_ROLI,
    rodzic: { widok: 'ViewGuideStart' }, nastepnyZastepczy: { widok: 'ViewDemoAccountPicker' }, zapytanie: [], jednostka: 'u01',
  },
  {
    widok: 'ViewEzusLogin', wzorzec: '/logowanie/ezus', folder: '(publiczne)/logowanie/ezus',
    grupa: 'publiczne', dostep: 'publiczny', role: BEZ_ROLI,
    rodzic: { widok: 'ViewGuideStart' }, nastepnyZastepczy: { widok: 'ViewDemoAccountPicker' }, zapytanie: [], jednostka: 'u01',
  },
  {
    widok: 'ViewMzusCodeLogin', wzorzec: '/logowanie/mzus', folder: '(publiczne)/logowanie/mzus',
    grupa: 'publiczne', dostep: 'publiczny', role: BEZ_ROLI,
    rodzic: { widok: 'ViewGuideStart' }, nastepnyZastepczy: { widok: 'ViewDemoAccountPicker' }, zapytanie: [], jednostka: 'u01',
  },
  {
    widok: 'ViewDemoAccountPicker', wzorzec: '/demo/wybor-konta', folder: '(publiczne)/demo/wybor-konta',
    grupa: 'publiczne', dostep: 'publiczny', role: BEZ_ROLI, warunek: 'potwierdzonaMakieta',
    rodzic: { widok: 'ViewGuideStart' }, nastepnyZastepczy: { widok: 'ViewGuideWelcome' }, zapytanie: [], jednostka: 'u01',
  },
  {
    widok: 'ViewDemoNewAccount', wzorzec: '/demo/nowe-konto', folder: '(publiczne)/demo/nowe-konto',
    grupa: 'publiczne', dostep: 'publiczny', role: BEZ_ROLI,
    rodzic: { widok: 'ViewDemoAccountPicker' }, nastepnyZastepczy: { widok: 'ViewDemoAccountPicker' }, zapytanie: [], jednostka: 'u01',
  },
  {
    widok: 'ViewDemoSettings', wzorzec: '/demo/ustawienia', folder: '(publiczne)/demo/ustawienia',
    grupa: 'publiczne', dostep: 'publiczny', role: BEZ_ROLI, warunek: 'trybDemonstracyjny',
    rodzic: { widok: 'ViewDemoAccountPicker' }, zapytanie: [], jednostka: 'u01',
  },
  {
    widok: 'ViewDemoInbox', wzorzec: '/demo/skrzynka', folder: '(publiczne)/demo/skrzynka',
    grupa: 'publiczne', dostep: 'publiczny', role: BEZ_ROLI, warunek: 'trybDemonstracyjny',
    rodzic: { widok: 'ViewDemoAccountPicker' }, zapytanie: ['konto'], jednostka: 'u18',
  },

  // Powitanie, ustawienia i profil na start
  {
    widok: 'ViewGuideWelcome', wzorzec: '/powitanie', folder: '(strefa)/powitanie',
    grupa: 'strefa', dostep: 'zalogowany', role: [NU],
    nastepnyZastepczy: { widok: 'ViewProfileZusData' }, zapytanie: [], jednostka: 'u02',
  },
  {
    widok: 'ViewGuideSettings', wzorzec: '/ustawienia', folder: '(strefa)/ustawienia',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_NU_R_DR,
    rodzic: PLAN, zapytanie: [], jednostka: 'u02',
  },
  {
    widok: 'ViewProfileZusData', wzorzec: '/profil-na-start/dane-z-konta-zus', folder: '(strefa)/profil-na-start/dane-z-konta-zus',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_NU_R, pozycjaMenu: 'ViewProfileZusData',
    nastepnyZastepczy: { widok: 'ViewProfilePayer' }, zapytanie: ['powrot'], jednostka: 'u07',
  },
  {
    widok: 'ViewProfilePayer', wzorzec: '/profil-na-start/platnik-zasilku', folder: '(strefa)/profil-na-start/platnik-zasilku',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_NU_R_DR, pozycjaMenu: 'ViewProfileZusData',
    rodzic: { widok: 'ViewProfileZusData' }, nastepnyZastepczy: { widok: 'ViewProfileSituation' }, zapytanie: ['powrot'], jednostka: 'u07',
  },
  {
    widok: 'ViewProfileSituation', wzorzec: '/profil-na-start/sytuacja', folder: '(strefa)/profil-na-start/sytuacja',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_NU_R, pozycjaMenu: 'ViewProfileZusData',
    rodzic: { widok: 'ViewProfilePayer' }, nastepnyZastepczy: { widok: 'ViewProfilePregnancy' }, zapytanie: [], jednostka: 'u07',
  },
  {
    widok: 'ViewProfilePregnancy', wzorzec: '/profil-na-start/dane-ciazy', folder: '(strefa)/profil-na-start/dane-ciazy',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_NU_R, pozycjaMenu: 'ViewProfileZusData',
    rodzic: { widok: 'ViewProfileSituation' }, nastepnyZastepczy: { widok: 'ViewProfileEmploymentChange' }, zapytanie: [], jednostka: 'u10',
  },
  {
    widok: 'ViewBirthDate', tryb: 'profil', wzorzec: '/profil-na-start/data-porodu', folder: '(strefa)/profil-na-start/data-porodu',
    folderWidoku: '(strefa)/narodziny/data-porodu',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_NU_R, pozycjaMenu: 'ViewProfileZusData',
    rodzic: { widok: 'ViewProfileSituation' }, nastepnyZastepczy: { widok: 'ViewProfileEmploymentChange' }, zapytanie: [], jednostka: 'u19',
  },
  {
    widok: 'ViewProfileChildAdoption', wzorzec: '/profil-na-start/przyjecie-dziecka', folder: '(strefa)/profil-na-start/przyjecie-dziecka',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_NU_R, pozycjaMenu: 'ViewProfileZusData',
    rodzic: { widok: 'ViewProfileSituation' }, nastepnyZastepczy: { widok: 'ViewProfileFamily' }, zapytanie: ['powrot'], jednostka: 'u24',
  },
  {
    widok: 'ViewProfileEmploymentChange', wzorzec: '/profil-na-start/zmiana-zatrudnienia', folder: '(strefa)/profil-na-start/zmiana-zatrudnienia',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_NU_R, pozycjaMenu: 'ViewProfileZusData',
    rodzic: { widok: 'ViewProfilePregnancy' }, nastepnyZastepczy: { widok: 'ViewProfileFamily' }, zapytanie: [], jednostka: 'u10',
  },
  {
    widok: 'ViewProfileFamily', wzorzec: '/profil-na-start/rodzina', folder: '(strefa)/profil-na-start/rodzina',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_NU_R, pozycjaMenu: 'ViewProfileZusData',
    rodzic: { widok: 'ViewProfileEmploymentChange' }, nastepnyZastepczy: { widok: 'ViewProfileSecondParent' }, zapytanie: [], jednostka: 'u10',
  },
  {
    widok: 'ViewProfileSecondParent', wzorzec: '/profil-na-start/drugi-rodzic', folder: '(strefa)/profil-na-start/drugi-rodzic',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_NU_R_DR, pozycjaMenu: 'ViewProfileZusData',
    rodzic: { widok: 'ViewProfileFamily' }, nastepnyZastepczy: { widok: 'ViewProfileSummary', tryb: 'start' }, zapytanie: [], jednostka: 'u11',
  },
  {
    widok: 'ViewProfileSummary', tryb: 'start', wzorzec: '/profil-na-start/podsumowanie', folder: '(strefa)/profil-na-start/podsumowanie',
    grupa: 'strefa', dostep: 'zalogowany', role: [NU], pozycjaMenu: 'ViewProfileZusData',
    rodzic: { widok: 'ViewProfileSecondParent' }, nastepnyZastepczy: PLAN, zapytanie: [], jednostka: 'u11',
  },
  {
    widok: 'ViewProfileSummary', tryb: 'rodzina', wzorzec: '/profil-rodziny', folder: '(strefa)/profil-rodziny',
    folderWidoku: '(strefa)/profil-na-start/podsumowanie',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewProfileSummary',
    rodzic: PLAN, nastepnyZastepczy: { widok: 'ViewSecondParentPowerOfAttorney' }, zapytanie: [], jednostka: 'u11',
  },
  {
    widok: 'ViewBirthDetails', tryb: 'zmiana', wzorzec: '/profil-rodziny/dane-dziecka', folder: '(strefa)/profil-rodziny/dane-dziecka',
    folderWidoku: '(strefa)/narodziny/dane-dziecka',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R, pozycjaMenu: 'ViewProfileSummary',
    rodzic: { widok: 'ViewProfileSummary', tryb: 'rodzina' }, nastepnyZastepczy: { widok: 'ViewProfileSummary', tryb: 'rodzina' }, zapytanie: [], jednostka: 'u19',
  },
  {
    widok: 'ViewSecondParentPowerOfAttorney', wzorzec: '/profil-rodziny/pelnomocnictwo', folder: '(strefa)/profil-rodziny/pelnomocnictwo',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R, pozycjaMenu: 'ViewProfileSummary',
    rodzic: { widok: 'ViewProfileSummary', tryb: 'rodzina' }, nastepnyZastepczy: { widok: 'ViewProfileSummary', tryb: 'rodzina' }, zapytanie: [], jednostka: 'u23',
  },

  // Pakiet narodzin i sytuacje szczególne
  {
    widok: 'ViewBirthDate', tryb: 'pakiet', wzorzec: '/narodziny/data-porodu', folder: '(strefa)/narodziny/data-porodu',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: PLAN, nastepnyZastepczy: { widok: 'ViewBirthDetails', tryb: 'pakiet' }, zapytanie: [], jednostka: 'u19',
  },
  {
    widok: 'ViewBirthDetails', tryb: 'pakiet', wzorzec: '/narodziny/dane-dziecka', folder: '(strefa)/narodziny/dane-dziecka',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: { widok: 'ViewBirthDate', tryb: 'pakiet' }, nastepnyZastepczy: { widok: 'ViewBirthPackage' }, zapytanie: [], jednostka: 'u19',
  },
  {
    widok: 'ViewBirthPackage', wzorzec: '/narodziny/pakiet', folder: '(strefa)/narodziny/pakiet',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: PLAN, nastepnyZastepczy: { widok: 'ViewCaseDetails' }, zapytanie: [], jednostka: 'u19',
  },
  {
    widok: 'ViewSpecialSituation', wzorzec: '/sytuacja-szczegolna', folder: '(strefa)/sytuacja-szczegolna',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewSpecialSituation',
    rodzic: PLAN, nastepnyZastepczy: PLAN, zapytanie: [], jednostka: 'u25',
  },

  // Plan rodziny, sprawy i terminy
  {
    widok: 'ViewFamilyPlan', wzorzec: '/plan-rodziny', folder: '(strefa)/plan-rodziny',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    nastepnyZastepczy: { widok: 'ViewCaseDetails' }, zapytanie: [], jednostka: 'u12',
  },
  {
    widok: 'ViewFamilyPlanStage', wzorzec: '/plan-rodziny/etap/[etap]', folder: '(strefa)/plan-rodziny/etap/[etap]',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: PLAN, nastepnyZastepczy: { widok: 'ViewCaseDetails' }, zapytanie: [], jednostka: 'u12',
    przykladoweParametry: { etap: 'ciaza' },
  },
  {
    widok: 'ViewPregnancyBenefits', wzorzec: '/plan-rodziny/swiadczenia-w-ciazy', folder: '(strefa)/plan-rodziny/swiadczenia-w-ciazy',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: PLAN, nastepnyZastepczy: { widok: 'ViewCaseDetails' }, zapytanie: [], jednostka: 'u16',
  },
  {
    widok: 'ViewCaseDetails', wzorzec: '/sprawy/[idSprawy]', folder: '(strefa)/sprawy/[idSprawy]',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: PLAN, nastepnyZastepczy: { widok: 'ViewCaseGuide' }, zapytanie: ['z', 'arkusz', 'etap'], jednostka: 'u12',
    przykladoweParametry: { idSprawy: 'K01' },
  },
  {
    widok: 'ViewCaseGuide', wzorzec: '/sprawy/[idSprawy]/instrukcja', folder: '(strefa)/sprawy/[idSprawy]/instrukcja',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: { widok: 'ViewCaseDetails' }, nastepnyZastepczy: { widok: 'ViewZamLeaveType' }, zapytanie: ['z', 'etap'], jednostka: 'u17',
    przykladoweParametry: { idSprawy: 'K01' },
  },
  {
    widok: 'ViewDeadlines', wzorzec: '/terminy', folder: '(strefa)/terminy',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewDeadlines',
    nastepnyZastepczy: { widok: 'ViewCaseDetails' }, zapytanie: [], jednostka: 'u13',
  },
  {
    widok: 'ViewApplicationList', wzorzec: '/twoje-wnioski', folder: '(strefa)/twoje-wnioski',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewApplicationList',
    nastepnyZastepczy: { widok: 'ViewCaseDetails' }, zapytanie: [], jednostka: 'u12',
  },

  // Dane z konta ZUS i pytania do ZUS
  {
    widok: 'ViewSickLeaveList', wzorzec: '/zaswiadczenia-e-zla', folder: '(strefa)/zaswiadczenia-e-zla',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: PLAN, nastepnyZastepczy: { widok: 'ViewZas53Start' }, zapytanie: [], jednostka: 'u14',
  },
  {
    widok: 'ViewContributionBalance', wzorzec: '/stan-rozliczen-skladek', folder: '(strefa)/stan-rozliczen-skladek',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: PLAN, nastepnyZastepczy: { widok: 'ViewContributionCertificate' }, zapytanie: [], jednostka: 'u14',
  },
  {
    widok: 'ViewContributionCertificate', wzorzec: '/stan-rozliczen-skladek/zaswiadczenie', folder: '(strefa)/stan-rozliczen-skladek/zaswiadczenie',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: { widok: 'ViewContributionBalance' }, nastepnyZastepczy: { widok: 'ViewContributionBalance' }, zapytanie: [], jednostka: 'u14',
  },
  {
    widok: 'ViewZusAccountData', wzorzec: '/dane-konta-zus', folder: '(strefa)/dane-konta-zus',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: PLAN, nastepnyZastepczy: { widok: 'ViewZusQuestion' }, zapytanie: ['sprawa'], jednostka: 'u29',
  },
  {
    widok: 'ViewZusQuestion', wzorzec: '/pytania-do-zus/nowe', folder: '(strefa)/pytania-do-zus/nowe',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: PLAN, nastepnyZastepczy: { widok: 'ViewZusQuestionSent' }, zapytanie: ['sprawa', 'z'], jednostka: 'u29',
  },
  {
    widok: 'ViewZusQuestionSent', wzorzec: '/pytania-do-zus/[idPytania]', folder: '(strefa)/pytania-do-zus/[idPytania]',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: PLAN, nastepnyZastepczy: PLAN, zapytanie: [], jednostka: 'u29',
    przykladoweParametry: { idPytania: 'PYT-1' },
  },
  {
    widok: 'ViewSupportOrganizations', wzorzec: '/podmioty-wsparcia', folder: '(strefa)/podmioty-wsparcia',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_NU_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: PLAN, zapytanie: ['sytuacja', 'powrot'], jednostka: 'u22',
  },

  // Kalkulatory
  {
    widok: 'ViewCalcMaternityInput', wzorzec: '/kalkulator-zasilku', folder: '(strefa)/kalkulator-zasilku',
    grupa: 'strefa', dostep: 'zalogowany', gosc: true, role: ROLE_NU_R_DR, pozycjaMenu: 'ViewCalcMaternityInput',
    nastepnyZastepczy: { widok: 'ViewCalcMaternityResult' }, zapytanie: ['sprawa', 'zrodlo'], jednostka: 'u15',
  },
  {
    widok: 'ViewCalcMaternityResult', wzorzec: '/kalkulator-zasilku/wynik', folder: '(strefa)/kalkulator-zasilku/wynik',
    grupa: 'strefa', dostep: 'zalogowany', gosc: true, role: ROLE_NU_R_DR, pozycjaMenu: 'ViewCalcMaternityInput',
    rodzic: { widok: 'ViewCalcMaternityInput' }, nastepnyZastepczy: { widok: 'ViewCalcScenarioCompare' }, zapytanie: ['sprawa', 'zrodlo', 'arkusz'], jednostka: 'u15',
  },
  {
    widok: 'ViewCalcScenarioCompare', wzorzec: '/kalkulator-zasilku/porownanie', folder: '(strefa)/kalkulator-zasilku/porownanie',
    grupa: 'strefa', dostep: 'zalogowany', gosc: true, role: ROLE_NU_R_DR, pozycjaMenu: 'ViewCalcMaternityInput',
    rodzic: { widok: 'ViewCalcMaternityResult' }, zapytanie: ['numery'], jednostka: 'u20',
  },
  {
    widok: 'ViewCalcMaternityVariant', wzorzec: '/kalkulatory/wariant-zasilku', folder: '(strefa)/kalkulatory/wariant-zasilku',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: PLAN, zapytanie: ['sprawa'], jednostka: 'u26',
  },
  {
    widok: 'ViewCalcParentalSplit', wzorzec: '/kalkulatory/podzial-urlopu-rodzicielskiego', folder: '(strefa)/kalkulatory/podzial-urlopu-rodzicielskiego',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: PLAN, zapytanie: ['sprawa'], jednostka: 'u26',
  },

  // Przykładowe sprawy ZUS
  {
    widok: 'ViewSampleCaseList', wzorzec: '/przykladowe-sprawy', folder: '(strefa)/przykladowe-sprawy',
    grupa: 'strefa', dostep: 'zalogowany', gosc: true, role: ROLE_NU_R_DR, pozycjaMenu: 'ViewSampleCaseList',
    nastepnyZastepczy: { widok: 'ViewSampleCaseUpload' }, zapytanie: [], jednostka: 'u05',
  },
  {
    widok: 'ViewSampleCaseUpload', wzorzec: '/przykladowe-sprawy/wgraj-dokument', folder: '(strefa)/przykladowe-sprawy/wgraj-dokument',
    grupa: 'strefa', dostep: 'zalogowany', gosc: true, role: ROLE_NU_R_DR, pozycjaMenu: 'ViewSampleCaseList',
    rodzic: { widok: 'ViewSampleCaseList' }, nastepnyZastepczy: { widok: 'ViewSampleCaseData' }, zapytanie: ['tryb'], jednostka: 'u05',
  },
  {
    widok: 'ViewSampleCaseData', wzorzec: '/przykladowe-sprawy/dane-sprawy', folder: '(strefa)/przykladowe-sprawy/dane-sprawy',
    grupa: 'strefa', dostep: 'zalogowany', gosc: true, role: ROLE_NU_R_DR, pozycjaMenu: 'ViewSampleCaseList',
    rodzic: { widok: 'ViewSampleCaseList' }, nastepnyZastepczy: { widok: 'ViewSampleCaseVerification' }, zapytanie: [], jednostka: 'u05',
  },
  {
    widok: 'ViewSampleCaseVerification', wzorzec: '/przykladowe-sprawy/weryfikacja', folder: '(strefa)/przykladowe-sprawy/weryfikacja',
    grupa: 'strefa', dostep: 'zalogowany', gosc: true, role: ROLE_NU_R_DR, pozycjaMenu: 'ViewSampleCaseList',
    rodzic: { widok: 'ViewSampleCaseData' }, nastepnyZastepczy: { widok: 'ViewCalcMaternityInput' }, zapytanie: [], jednostka: 'u21',
  },

  // Wniosek o zasiłek macierzyński ZAM
  {
    widok: 'ViewZamLeaveType', wzorzec: '/wnioski/zam/rodzaj-urlopu', folder: '(strefa)/wnioski/zam/rodzaj-urlopu',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: PLAN, nastepnyZastepczy: { widok: 'ViewZamPeriod' }, zapytanie: ['sprawa', 'wniosek'], jednostka: 'u27',
  },
  {
    widok: 'ViewZamPrebirth', wzorzec: '/wnioski/zam/poczatek-zasilku', folder: '(strefa)/wnioski/zam/poczatek-zasilku',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: { widok: 'ViewZamLeaveType' }, nastepnyZastepczy: { widok: 'ViewZamPeriod' }, zapytanie: ['wniosek'], jednostka: 'u33',
  },
  {
    widok: 'ViewZamPeriod', wzorzec: '/wnioski/zam/okres-zasilku', folder: '(strefa)/wnioski/zam/okres-zasilku',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: { widok: 'ViewZamLeaveType' }, nastepnyZastepczy: { widok: 'ViewZamData' }, zapytanie: ['wniosek'], jednostka: 'u27',
  },
  {
    widok: 'ViewFatherTakeover', tryb: 'zam', wzorzec: '/wnioski/zam/przejecie-urlopu', folder: '(strefa)/wnioski/zam/przejecie-urlopu',
    folderWidoku: '(strefa)/wnioski/przejecie-urlopu-macierzynskiego',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: { widok: 'ViewZamLeaveType' }, nastepnyZastepczy: { widok: 'ViewZamPeriod' }, zapytanie: ['wniosek'], jednostka: 'u34',
  },
  {
    widok: 'ViewZamData', wzorzec: '/wnioski/zam/dane', folder: '(strefa)/wnioski/zam/dane',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: { widok: 'ViewZamPeriod' }, nastepnyZastepczy: { widok: 'ViewZamStatements' }, zapytanie: ['wniosek', 'tryb'], jednostka: 'u27',
  },
  {
    widok: 'ViewZamStatements', wzorzec: '/wnioski/zam/oswiadczenia', folder: '(strefa)/wnioski/zam/oswiadczenia',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: { widok: 'ViewZamData' }, nastepnyZastepczy: { widok: 'ViewZamSummary' }, zapytanie: ['wniosek'], jednostka: 'u27',
  },
  {
    widok: 'ViewZamSummary', wzorzec: '/wnioski/zam/podsumowanie', folder: '(strefa)/wnioski/zam/podsumowanie',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: { widok: 'ViewZamStatements' }, nastepnyZastepczy: { widok: 'ViewZamSent' }, zapytanie: ['wniosek'], jednostka: 'u27',
  },
  {
    widok: 'ViewZamSent', wzorzec: '/wnioski/zam/wyslano', folder: '(strefa)/wnioski/zam/wyslano',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewApplicationList',
    rodzic: WNIOSKI, nastepnyZastepczy: PLAN, zapytanie: ['wniosek'], jednostka: 'u27',
  },
  {
    widok: 'ViewZamForPayer', wzorzec: '/wnioski/zam/dla-platnika', folder: '(strefa)/wnioski/zam/dla-platnika',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewApplicationList',
    rodzic: WNIOSKI, nastepnyZastepczy: PLAN, zapytanie: ['wniosek'], jednostka: 'u33',
  },

  // Wniosek o zasiłek chorobowy ZAS-53
  {
    widok: 'ViewZas53Start', wzorzec: '/wnioski/zas-53', folder: '(strefa)/wnioski/zas-53',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: { widok: 'ViewSickLeaveList' }, nastepnyZastepczy: { widok: 'ViewZas53Certificate' }, zapytanie: ['sprawa', 'zaswiadczenie'], jednostka: 'u30',
  },
  {
    widok: 'ViewZas53Certificate', wzorzec: '/wnioski/zas-53/zaswiadczenie', folder: '(strefa)/wnioski/zas-53/zaswiadczenie',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: { widok: 'ViewZas53Start' }, nastepnyZastepczy: { widok: 'ViewZas53AfterInsurance' }, zapytanie: ['wniosek'], jednostka: 'u30',
  },
  {
    widok: 'ViewZas53AfterInsurance', wzorzec: '/wnioski/zas-53/oswiadczenie-z-10', folder: '(strefa)/wnioski/zas-53/oswiadczenie-z-10',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: { widok: 'ViewZas53Certificate' }, nastepnyZastepczy: { widok: 'ViewZas53Data' }, zapytanie: ['wniosek'], jednostka: 'u30',
  },
  {
    widok: 'ViewZas53Data', wzorzec: '/wnioski/zas-53/dane', folder: '(strefa)/wnioski/zas-53/dane',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: { widok: 'ViewZas53Certificate' }, nastepnyZastepczy: { widok: 'ViewZas53Summary' }, zapytanie: ['wniosek'], jednostka: 'u30',
  },
  {
    widok: 'ViewZas53Summary', wzorzec: '/wnioski/zas-53/podsumowanie', folder: '(strefa)/wnioski/zas-53/podsumowanie',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: { widok: 'ViewZas53Data' }, nastepnyZastepczy: { widok: 'ViewZas53Sent' }, zapytanie: ['wniosek'], jednostka: 'u30',
  },
  {
    widok: 'ViewZas53Sent', wzorzec: '/wnioski/zas-53/wyslany', folder: '(strefa)/wnioski/zas-53/wyslany',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R, pozycjaMenu: 'ViewApplicationList',
    rodzic: WNIOSKI, nastepnyZastepczy: PLAN, zapytanie: ['wniosek'], jednostka: 'u30',
  },

  // Wniosek o zasiłek opiekuńczy Z-15
  {
    widok: 'ViewZ15Start', wzorzec: '/wnioski/z-15', folder: '(strefa)/wnioski/z-15',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: { widok: 'ViewFamilyPlan' }, nastepnyZastepczy: { widok: 'ViewZ15Situation' }, zapytanie: ['sprawa', 'sytuacja'], jednostka: 'u30',
  },
  {
    widok: 'ViewZ15Situation', wzorzec: '/wnioski/z-15/sytuacja', folder: '(strefa)/wnioski/z-15/sytuacja',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: { widok: 'ViewZ15Start' }, nastepnyZastepczy: { widok: 'ViewZ15Statements' }, zapytanie: ['wniosek'], jednostka: 'u30',
  },
  {
    widok: 'ViewZ15Statements', wzorzec: '/wnioski/z-15/oswiadczenia', folder: '(strefa)/wnioski/z-15/oswiadczenia',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: { widok: 'ViewZ15Situation' }, nastepnyZastepczy: { widok: 'ViewZ15Data' }, zapytanie: ['wniosek'], jednostka: 'u30',
  },
  {
    widok: 'ViewZ15Data', wzorzec: '/wnioski/z-15/dane', folder: '(strefa)/wnioski/z-15/dane',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: { widok: 'ViewZ15Statements' }, nastepnyZastepczy: { widok: 'ViewZ15Summary' }, zapytanie: ['wniosek'], jednostka: 'u30',
  },
  {
    widok: 'ViewZ15Summary', wzorzec: '/wnioski/z-15/podsumowanie', folder: '(strefa)/wnioski/z-15/podsumowanie',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: { widok: 'ViewZ15Data' }, nastepnyZastepczy: { widok: 'ViewZ15Sent' }, zapytanie: ['wniosek'], jednostka: 'u30',
  },
  {
    widok: 'ViewZ15Sent', wzorzec: '/wnioski/z-15/wyslany', folder: '(strefa)/wnioski/z-15/wyslany',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewApplicationList',
    rodzic: WNIOSKI, nastepnyZastepczy: PLAN, zapytanie: ['wniosek'], jednostka: 'u30',
  },
  {
    widok: 'ViewZ15ForPayer', wzorzec: '/wnioski/z-15/dla-platnika', folder: '(strefa)/wnioski/z-15/dla-platnika',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewApplicationList',
    rodzic: WNIOSKI, nastepnyZastepczy: PLAN, zapytanie: ['wniosek'], jednostka: 'u30',
  },

  // Wnioski o urlopy do pracodawcy
  {
    widok: 'ViewLeaveRequestType', wzorzec: '/wnioski/urlop/rodzaj', folder: '(strefa)/wnioski/urlop/rodzaj',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: PLAN, nastepnyZastepczy: { widok: 'ViewLeaveRequestForm' }, zapytanie: ['sprawa', 'wniosek', 'scenariusz'], jednostka: 'u28',
  },
  {
    widok: 'ViewLeaveRequestForm', wzorzec: '/wnioski/urlop/formularz', folder: '(strefa)/wnioski/urlop/formularz',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: { widok: 'ViewLeaveRequestType' }, nastepnyZastepczy: { widok: 'ViewLeaveRequestSummary' }, zapytanie: ['wniosek'], jednostka: 'u28',
  },
  {
    widok: 'ViewLeaveRequestSummary', wzorzec: '/wnioski/urlop/podsumowanie', folder: '(strefa)/wnioski/urlop/podsumowanie',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: { widok: 'ViewLeaveRequestForm' }, nastepnyZastepczy: { widok: 'ViewLeaveRequestSent' }, zapytanie: ['wniosek'], jednostka: 'u32',
  },
  {
    widok: 'ViewLeaveRequestSent', wzorzec: '/wnioski/urlop/wyslany', folder: '(strefa)/wnioski/urlop/wyslany',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewApplicationList',
    rodzic: WNIOSKI, nastepnyZastepczy: PLAN, zapytanie: ['wniosek'], jednostka: 'u32',
  },

  // Rezygnacja matki, przejęcie urlopu i odpis aktu urodzenia
  {
    widok: 'ViewMaternityResignation', wzorzec: '/wnioski/rezygnacja-z-urlopu-macierzynskiego', folder: '(strefa)/wnioski/rezygnacja-z-urlopu-macierzynskiego',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: PLAN, nastepnyZastepczy: { widok: 'ViewFatherTakeover', tryb: 'wniosek' }, zapytanie: ['sprawa', 'wniosek'], jednostka: 'u34',
  },
  {
    widok: 'ViewFatherTakeover', tryb: 'wniosek', wzorzec: '/wnioski/przejecie-urlopu-macierzynskiego', folder: '(strefa)/wnioski/przejecie-urlopu-macierzynskiego',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: PLAN, nastepnyZastepczy: WNIOSKI, zapytanie: ['sprawa', 'sytuacja', 'data', 'wniosek'], jednostka: 'u34',
  },
  {
    widok: 'ViewBirthCertificateRequest', wzorzec: '/wnioski/odpis-aktu-urodzenia', folder: '(strefa)/wnioski/odpis-aktu-urodzenia',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewFamilyPlan',
    rodzic: PLAN, nastepnyZastepczy: { widok: 'ViewBirthCertificateRequestSent' }, zapytanie: ['wniosek'], jednostka: 'u29',
  },
  {
    widok: 'ViewBirthCertificateRequestSent', wzorzec: '/wnioski/odpis-aktu-urodzenia/zlozony', folder: '(strefa)/wnioski/odpis-aktu-urodzenia/zlozony',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_R_DR, pozycjaMenu: 'ViewApplicationList',
    rodzic: WNIOSKI, nastepnyZastepczy: PLAN, zapytanie: ['wniosek'], jednostka: 'u29',
  },

  // Zaproszenie drugiego rodzica
  {
    widok: 'ViewInviteAccept', wzorzec: '/zaproszenie/[token]', folder: '(strefa)/zaproszenie/[token]',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_ZALOGOWANE,
    nastepnyZastepczy: PLAN, zapytanie: [], jednostka: 'u23',
    przykladoweParametry: { token: 'zaproszenie-demo' },
  },

  // Panel Administratora
  {
    widok: 'ViewCatalogList', wzorzec: '/panel/katalog', folder: '(strefa)/panel/katalog',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_A, pozycjaMenu: 'ViewCatalogList',
    nastepnyZastepczy: { widok: 'ViewCatalogValueEdit' }, zapytanie: ['zakladka'], jednostka: 'u06',
  },
  {
    widok: 'ViewCatalogValueEdit', wzorzec: '/panel/katalog/wartosci/[idWpisu]', folder: '(strefa)/panel/katalog/wartosci/[idWpisu]',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_A, pozycjaMenu: 'ViewCatalogList',
    rodzic: { widok: 'ViewCatalogList' }, nastepnyZastepczy: { widok: 'ViewCatalogList' }, zapytanie: [], jednostka: 'u06',
    przykladoweParametry: { idWpisu: 'swiadczenie-wychowawcze-800-plus' },
  },
  {
    widok: 'ViewCatalogItemAdd', wzorzec: '/panel/katalog/pozycje/nowa', folder: '(strefa)/panel/katalog/pozycje/nowa',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_A, pozycjaMenu: 'ViewCatalogList',
    rodzic: { widok: 'ViewCatalogList' }, nastepnyZastepczy: { widok: 'ViewCatalogList' }, zapytanie: [], jednostka: 'u06',
  },
  {
    widok: 'ViewCatalogSupportOrganizations', tryb: 'lista', wzorzec: '/panel/podmioty-wsparcia', folder: '(strefa)/panel/podmioty-wsparcia',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_A, pozycjaMenu: 'ViewCatalogSupportOrganizations',
    nastepnyZastepczy: { widok: 'ViewCatalogSupportOrganizations', tryb: 'nowa' }, zapytanie: [], jednostka: 'u22',
  },
  {
    widok: 'ViewCatalogSupportOrganizations', tryb: 'nowa', wzorzec: '/panel/podmioty-wsparcia/nowa', folder: '(strefa)/panel/podmioty-wsparcia/nowa',
    folderWidoku: '(strefa)/panel/podmioty-wsparcia',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_A, pozycjaMenu: 'ViewCatalogSupportOrganizations',
    rodzic: { widok: 'ViewCatalogSupportOrganizations', tryb: 'lista' }, nastepnyZastepczy: { widok: 'ViewCatalogSupportOrganizations', tryb: 'edycja' }, zapytanie: [], jednostka: 'u22',
  },
  {
    widok: 'ViewCatalogSupportOrganizations', tryb: 'edycja', wzorzec: '/panel/podmioty-wsparcia/[idOrganizacji]', folder: '(strefa)/panel/podmioty-wsparcia/[idOrganizacji]',
    folderWidoku: '(strefa)/panel/podmioty-wsparcia',
    grupa: 'strefa', dostep: 'zalogowany', role: ROLE_A, pozycjaMenu: 'ViewCatalogSupportOrganizations',
    rodzic: { widok: 'ViewCatalogSupportOrganizations', tryb: 'lista' }, nastepnyZastepczy: { widok: 'ViewCatalogSupportOrganizations', tryb: 'lista' }, zapytanie: [], jednostka: 'u22',
    przykladoweParametry: { idOrganizacji: 'organizacja-demo' },
  },

  // Symulowane serwisy zewnętrzne
  {
    widok: 'ViewEzusHome', wzorzec: '/ezus', folder: '(symulacje)/ezus/[[...sciezka]]',
    grupa: 'symulacje', dostep: 'publiczny', role: BEZ_ROLI,
    nastepnyZastepczy: { widok: 'ViewEzus800Application' }, zapytanie: [], jednostka: 'u17',
  },
  {
    widok: 'ViewEzus800Application', wzorzec: '/ezus/wniosek-800-plus', folder: '(symulacje)/ezus/[[...sciezka]]',
    grupa: 'symulacje', dostep: 'publiczny', role: BEZ_ROLI,
    rodzic: { widok: 'ViewEzusHome' }, nastepnyZastepczy: { widok: 'ViewEzusApplicationDetails' }, zapytanie: [], jednostka: 'u17',
  },
  {
    widok: 'ViewEzusActiveParentApplication', wzorzec: '/ezus/wniosek-aktywny-rodzic', folder: '(symulacje)/ezus/[[...sciezka]]',
    grupa: 'symulacje', dostep: 'publiczny', role: BEZ_ROLI,
    rodzic: { widok: 'ViewEzusHome' }, nastepnyZastepczy: { widok: 'ViewEzusApplicationDetails' }, zapytanie: [], jednostka: 'u17',
  },
  {
    widok: 'ViewEzusApplicationDetails', wzorzec: '/ezus/wnioski/[idWniosku]', folder: '(symulacje)/ezus/[[...sciezka]]',
    grupa: 'symulacje', dostep: 'publiczny', role: BEZ_ROLI,
    rodzic: { widok: 'ViewEzusHome' }, nastepnyZastepczy: { widok: 'ViewEzusHome' }, zapytanie: [], jednostka: 'u17',
    przykladoweParametry: { idWniosku: 'wniosek-demo' },
  },
  {
    widok: 'ViewZusEVisit', wzorzec: '/kanal/e-wizyta', folder: '(symulacje)/kanal/[kanal]',
    grupa: 'symulacje', dostep: 'publiczny', role: BEZ_ROLI,
    zapytanie: [], jednostka: 'u17',
  },
  {
    widok: 'ViewSimulatedChannel', wzorzec: '/kanal/[kanal]', folder: '(symulacje)/kanal/[kanal]',
    grupa: 'symulacje', dostep: 'publiczny', role: BEZ_ROLI,
    zapytanie: [], jednostka: 'u17',
    przykladoweParametry: { kanal: 'empatia' },
  },
];

/** Widok gospodarza dla arkuszy, okien i panelu asystenta; `arkusz` to wartość parametru ?arkusz=. */
export interface GospodarzWidoku {
  widok: IdWidokuZTrasa;
  tryb?: string;
  arkusz?: string;
}

export const gospodarzeWidokowBezTrasy: { readonly [K in IdWidokuBezTrasy]: GospodarzWidoku } = {
  ViewAssistantChat: { widok: 'ViewFamilyPlan' },
  SheetHealthDataConsent: { widok: 'ViewGuideWelcome' },
  ModalConsentText: { widok: 'ViewGuideWelcome' },
  SheetConsentWithdrawConfirm: { widok: 'ViewGuideSettings' },
  SheetFamilyDataDeleteConfirm: { widok: 'ViewGuideSettings' },
  SheetEmploymentChoice: { widok: 'ViewProfileZusData' },
  SheetContributionPaidConfirm: { widok: 'ViewFamilyPlan' },
  ModalNewChildDetected: { widok: 'ViewFamilyPlan' },
  ModalBenefitRules: { widok: 'ViewPregnancyBenefits' },
  SheetCaseDoneConfirm: { widok: 'ViewCaseGuide' },
  SheetCalendarDownload: { widok: 'ViewDeadlines' },
  SheetCalcBaseSource: { widok: 'ViewCalcMaternityResult' },
  ModalCalcAppliedRules: { widok: 'ViewCalcMaternityResult' },
  SheetCalcParentalParts: { widok: 'ViewCalcMaternityResult', arkusz: 'podzial-urlopow' },
  SheetCalcWorkCombination: { widok: 'ViewCalcMaternityResult', arkusz: 'laczenie-z-praca' },
  SheetCalcReturnToWork: { widok: 'ViewCalcMaternityResult', arkusz: 'powrot-do-pracy' },
  ModalSampleCaseDocument: { widok: 'ViewSampleCaseData' },
  ModalSickLeaveDetails: { widok: 'ViewSickLeaveList' },
  ModalStatementsText: { widok: 'ViewZamStatements' },
  SheetZas53ManualCertificate: { widok: 'ViewZas53Certificate' },
  ModalEmployerMessagePreview: { widok: 'ViewLeaveRequestSummary' },
  SheetRiskDetails: { widok: 'ViewCaseDetails', arkusz: 'ryzyko' },
  SheetInviteSecondParent: { widok: 'ViewProfileSummary', tryb: 'rodzina' },
  SheetSecondParentRemoveConfirm: { widok: 'ViewProfileSummary', tryb: 'rodzina' },
  SheetSpecialSituationConfirm: { widok: 'ViewSpecialSituation' },
  SheetAssistantActionConfirm: { widok: 'ViewFamilyPlan' },
};

export function czyWidokZTrasa(id: string): id is IdWidokuZTrasa {
  return (idWidokowZTrasa as readonly string[]).includes(id);
}

export function czyWidokBezTrasy(id: string): id is IdWidokuBezTrasy {
  return (idWidokowBezTrasy as readonly string[]).includes(id);
}

/** Wszystkie wpisy mapy tras danego widoku (kilka wpisów ma widok z trybami). */
export function wpisyWidoku(id: IdWidokuZTrasa): readonly WpisTrasy[] {
  return mapaTras.filter((w) => w.widok === id);
}

/** Wpis mapy tras widoku w podanym trybie; bez trybu albo przy nieznanym trybie wpis trybu domyślnego. */
export function wpisWidoku(id: IdWidokuZTrasa, tryb?: string): WpisTrasy {
  const wpisy = wpisyWidoku(id);
  const domyslny = (trybyDomyslne as Readonly<Record<string, string>>)[id];
  return (
    wpisy.find((w) => tryb !== undefined && w.tryb === tryb) ??
    wpisy.find((w) => w.tryb === domyslny) ??
    wpisy[0]
  );
}

/** Dopasowany wpis mapy tras (pola wpisu dostępne wprost i w polu `wpis`) z parametrami segmentów. */
export interface DopasowanieTrasy extends WpisTrasy {
  /** Identyfikator dopasowanego widoku, równy `widok`. */
  idWidoku: IdWidokuZTrasa;
  wpis: WpisTrasy;
  /** Wartości segmentów dynamicznych, zdekodowane. */
  parametry: Readonly<Record<string, string>>;
}

function segmenty(sciezka: string): string[] {
  return sciezka.split('/').filter((s) => s.length > 0);
}

function czySegmentDynamiczny(segment: string): boolean {
  return segment.startsWith('[') && segment.endsWith(']');
}

function zdekoduj(segment: string): string | null {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}

/**
 * Znajduje wpis mapy tras dla ścieżki adresu (bez zapytania i kotwicy, które funkcja odcina).
 * Przy kilku pasujących wzorcach wygrywa wzorzec z najmniejszą liczbą segmentów dynamicznych,
 * więc /pytania-do-zus/nowe trafia do ViewZusQuestion, a /kanal/e-wizyta do ViewZusEVisit.
 */
export function dopasujTrase(pathname: string): DopasowanieTrasy | null {
  const bezZapytania = pathname.split(/[?#]/, 1)[0] ?? '';
  const czesci = segmenty(bezZapytania);
  let najlepsze: { dopasowanie: DopasowanieTrasy; dynamiczne: number } | null = null;

  for (const wpis of mapaTras) {
    const wzorzec = segmenty(wpis.wzorzec);
    if (wzorzec.length !== czesci.length) continue;
    const parametry: Record<string, string> = {};
    let dynamiczne = 0;
    let pasuje = true;
    for (let i = 0; i < wzorzec.length; i += 1) {
      const w = wzorzec[i];
      const c = czesci[i];
      if (czySegmentDynamiczny(w)) {
        const wartosc = zdekoduj(c);
        if (wartosc === null || wartosc.length === 0) {
          pasuje = false;
          break;
        }
        parametry[w.slice(1, -1)] = wartosc;
        dynamiczne += 1;
      } else if (w !== c) {
        pasuje = false;
        break;
      }
    }
    if (wpis.widok === 'ViewSimulatedChannel' && pasuje) {
      pasuje = (kanalySymulowane as readonly string[]).includes(parametry.kanal ?? '');
    }
    if (pasuje && (najlepsze === null || dynamiczne < najlepsze.dynamiczne)) {
      najlepsze = { dopasowanie: { ...wpis, idWidoku: wpis.widok, wpis, parametry }, dynamiczne };
    }
  }

  return najlepsze?.dopasowanie ?? null;
}

/** Trasa dostępna bez logowania w trybie gościa (wpis mapy tras z `gosc: true`). */
export function czyTrasaDlaGoscia(pathname: string): boolean {
  return dopasujTrase(pathname)?.gosc === true;
}
