// Rejestr slotów ViewFamilyPlan (kontrakt, sekcja 12.4). Właściciel rejestru: u00, gospodarz: u12.
// Gospodarz renderuje każdą listę w kolejności wpisów w miejscu ze wzoru i przekazuje propsy z ./typy.ts.
// Każdy plik należy do jednostki podanej w komentarzu wpisu.
import type { WpisSlotu } from './typy';
import { SlotAkcjaZglosNarodziny } from './akcja-zglos-narodziny';
import { SlotAkcjaSytuacjaSzczegolna } from './akcja-sytuacja-szczegolna';
import { SlotOknoNowegoDziecka } from './okno-nowego-dziecka';
import { SlotTerminSprawy } from './termin-sprawy';
import { SlotStatusWnioskuZus } from './status-wniosku-zus';
import { SlotOstrzezeniaSprawy } from './ostrzezenia-sprawy';
import { SlotAkcjaPrzejeciaUrlopu } from './akcja-przejecia-urlopu';

export type { MiejsceSlotu, PropsSlotu, WpisSlotu } from './typy';

// Lista kart sekcji „Co możesz zrobić” pod najbliższymi terminami. Każdy slot renderuje Kartę z tytułem h3.
export const slotyAkcji: WpisSlotu<'akcje'>[] = [
  { id: 'akcja-zglos-narodziny', Komponent: SlotAkcjaZglosNarodziny }, // u19
  { id: 'akcja-sytuacja-szczegolna', Komponent: SlotAkcjaSytuacjaSzczegolna }, // u25
];

// Lista slotów nad planem.
export const slotyNadPlanem: WpisSlotu<'nadPlanem'>[] = [
  { id: 'okno-nowego-dziecka', Komponent: SlotOknoNowegoDziecka }, // u19
];

// Lista slotów przy sprawie.
export const slotyPrzySprawie: WpisSlotu<'przySprawie'>[] = [
  { id: 'termin-sprawy', Komponent: SlotTerminSprawy }, // u13
  { id: 'status-wniosku-zus', Komponent: SlotStatusWnioskuZus }, // u14
  { id: 'ostrzezenia-sprawy', Komponent: SlotOstrzezeniaSprawy }, // u22
  { id: 'akcja-przejecia-urlopu', Komponent: SlotAkcjaPrzejeciaUrlopu }, // u25
];
