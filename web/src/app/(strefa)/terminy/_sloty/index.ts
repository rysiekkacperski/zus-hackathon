// Rejestr slotów ViewDeadlines (kontrakt, sekcja 12.4). Właściciel rejestru: u00, gospodarz: u13.
// Gospodarz renderuje każdą listę w kolejności wpisów w miejscu ze wzoru i przekazuje propsy z ./typy.ts.
// Każdy plik należy do jednostki podanej w komentarzu wpisu.
import type { WpisSlotu } from './typy';
import { SlotAkcjaPlikuKalendarza } from './akcja-pliku-kalendarza';

export type { MiejsceSlotu, PropsSlotu, WpisSlotu } from './typy';

// Lista slotów akcji terminów.
export const slotyTerminow: WpisSlotu<'akcja'>[] = [
  { id: 'akcja-pliku-kalendarza', Komponent: SlotAkcjaPlikuKalendarza }, // u18
];
