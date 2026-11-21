// Rejestr slotów ViewBirthPackage (kontrakt, sekcja 12.4). Właściciel rejestru: u00, gospodarz: u19.
// Gospodarz renderuje każdą listę w kolejności wpisów w miejscu ze wzoru i przekazuje propsy z ./typy.ts.
// Każdy plik należy do jednostki podanej w komentarzu wpisu.
import type { WpisSlotu } from './typy';
import { SlotAkcjaWnioskuOUrlop } from './akcja-wniosku-o-urlop';

export type { MiejsceSlotu, PropsSlotu, WpisSlotu } from './typy';

// Lista slotów akcji pakietu narodzin.
export const slotyPakietu: WpisSlotu<'akcja'>[] = [
  { id: 'akcja-wniosku-o-urlop', Komponent: SlotAkcjaWnioskuOUrlop }, // u28
];
