// Rejestr slotów ViewCalcMaternityInput (kontrakt, sekcja 12.4). Właściciel rejestru: u00, gospodarz: u15.
// Gospodarz renderuje każdą listę w kolejności wpisów w miejscu ze wzoru i przekazuje propsy z ./typy.ts.
// Każdy plik należy do jednostki podanej w komentarzu wpisu.
import type { WpisSlotu } from './typy';
import { SlotDaneZPrzykladowejSprawy } from './dane-z-przykladowej-sprawy';

export type { MiejsceSlotu, PropsSlotu, WpisSlotu } from './typy';

// Lista slotów danych wejściowych kalkulatora.
export const slotyDanychWejsciowych: WpisSlotu<'daneWejsciowe'>[] = [
  { id: 'dane-z-przykladowej-sprawy', Komponent: SlotDaneZPrzykladowejSprawy }, // u21
];
