// Rejestr slotów ModalSickLeaveDetails (kontrakt, sekcja 12.4). Właściciel rejestru: u00, gospodarz: u14.
// Gospodarz renderuje każdą listę w kolejności wpisów w miejscu ze wzoru i przekazuje propsy z ./typy.ts.
// Każdy plik należy do jednostki podanej w komentarzu wpisu.
import type { WpisSlotu } from './typy';
import { SlotAkcjaWnioskuZas53 } from './akcja-wniosku-zas53';

export type { MiejsceSlotu, PropsSlotu, WpisSlotu } from './typy';

// Lista slotów akcji okna szczegółów zaświadczenia.
export const slotyOknaZaswiadczenia: WpisSlotu<'akcja'>[] = [
  { id: 'akcja-wniosku-zas53', Komponent: SlotAkcjaWnioskuZas53 }, // u30
];
