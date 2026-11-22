// Rejestr slotów ViewProfileSummary (kontrakt, sekcja 12.4). Właściciel rejestru: u00, gospodarz: u11.
// Gospodarz renderuje każdą listę w kolejności wpisów w miejscu ze wzoru i przekazuje propsy z ./typy.ts.
// Każdy plik należy do jednostki podanej w komentarzu wpisu.
import type { WpisSlotu } from './typy';
import { SlotSekcjaDanychDziecka } from './sekcja-danych-dziecka';
import { SlotSekcjaPrzyjecia } from './sekcja-przyjecia';
import { SlotSekcjaDrugiegoRodzica } from './sekcja-drugiego-rodzica';
import { SlotSekcjaSytuacji } from './sekcja-sytuacji';

export type { MiejsceSlotu, PropsSlotu, WpisSlotu } from './typy';

// Lista slotów podsumowania profilu.
export const slotyPodsumowania: WpisSlotu<'sekcja'>[] = [
  { id: 'sekcja-danych-dziecka', Komponent: SlotSekcjaDanychDziecka }, // u19
  { id: 'sekcja-przyjecia', Komponent: SlotSekcjaPrzyjecia }, // u24
  { id: 'sekcja-drugiego-rodzica', Komponent: SlotSekcjaDrugiegoRodzica }, // u23
  { id: 'sekcja-sytuacji', Komponent: SlotSekcjaSytuacji }, // u25
];
