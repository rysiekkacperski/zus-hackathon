// Nawigacja kreatora Profilu na start (kontrakt, sekcja 7.2). Właściciel: u07 (Profil na start: dane ZUS, płatnik, sytuacja).
// Zaślepka fundamentu: implementuje u07. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { KrokiKreatoraProps } from '@/komponenty/kroki';
import type { IdWidoku, SzkicProfilu } from '@/domena/typy';

/** Ekrany kreatora profilu w kolejności. */
export const EKRANY_PROFILU: IdWidoku[] = [];

/** Następny ekran kreatora z pominięciami bez zgody, ścieżką przyjęcia i powrotem na podsumowanie. */
export function nastepnyEkran(szkic: SzkicProfilu, zgoda: boolean): IdWidoku {
  return 'ViewProfileSummary';
}

/** Poprzedni ekran kreatora. */
export function poprzedniEkran(szkic: SzkicProfilu, zgoda: boolean): IdWidoku {
  return 'ViewProfileZusData';
}

/** Lista kroków kreatora ze stanem względem bieżącego ekranu. */
export function krokiProfilu(szkic: SzkicProfilu, zgoda: boolean, biezacy: IdWidoku): KrokiKreatoraProps['kroki'] {
  return [];
}
