// Rejestr slotów ViewGuideSettings (kontrakt, sekcja 12.4). Właściciel rejestru: u00, gospodarz: u02.
// Gospodarz renderuje każdą listę w kolejności wpisów w miejscu ze wzoru i przekazuje propsy z ./typy.ts.
// Każdy plik należy do jednostki podanej w komentarzu wpisu.
import type { WpisSlotu } from './typy';
import { SlotSekcjaZgody } from './sekcja-zgody';
import { SlotSekcjaPrzypomnien } from './sekcja-przypomnien';
import { SlotKartaPlikuKalendarza } from './karta-pliku-kalendarza';
import { SlotSekcjaDanychRodziny } from './sekcja-danych-rodziny';

export type { MiejsceSlotu, PropsSlotu, WpisSlotu } from './typy';

// Lista slotów ustawień przewodnika.
export const slotyUstawien: WpisSlotu<'sekcja'>[] = [
  { id: 'sekcja-zgody', Komponent: SlotSekcjaZgody }, // u02
  { id: 'sekcja-przypomnien', Komponent: SlotSekcjaPrzypomnien }, // u18
  { id: 'karta-pliku-kalendarza', Komponent: SlotKartaPlikuKalendarza }, // u18
  { id: 'sekcja-danych-rodziny', Komponent: SlotSekcjaDanychRodziny }, // u02
];
