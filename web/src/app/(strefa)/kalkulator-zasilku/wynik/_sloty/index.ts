// Rejestr slotów ViewCalcMaternityResult (kontrakt, sekcja 12.4). Właściciel rejestru: u00, gospodarz: u15.
// Gospodarz renderuje każdą listę w kolejności wpisów w miejscu ze wzoru i przekazuje propsy z ./typy.ts.
// Każdy plik należy do jednostki podanej w komentarzu wpisu.
import type { WpisSlotu } from './typy';
import { SlotAkcjeUrlopow } from './akcje-urlopow';
import { SlotZapisScenariusza } from './zapis-scenariusza';
import { SlotPorownanieZRozstrzygnieciem } from './porownanie-z-rozstrzygnieciem';

export type { MiejsceSlotu, PropsSlotu, WpisSlotu } from './typy';

// Lista slotów wyniku kalkulatora.
export const slotyWyniku: WpisSlotu<'wynik'>[] = [
  { id: 'akcje-urlopow', Komponent: SlotAkcjeUrlopow }, // u20
  { id: 'zapis-scenariusza', Komponent: SlotZapisScenariusza }, // u20
  { id: 'porownanie-z-rozstrzygnieciem', Komponent: SlotPorownanieZRozstrzygnieciem }, // u21
];
