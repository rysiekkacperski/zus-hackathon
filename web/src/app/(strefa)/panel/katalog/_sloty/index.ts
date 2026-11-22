// Rejestr slotów ViewCatalogList (kontrakt, sekcja 12.4). Właściciel rejestru: u00, gospodarz: u06.
// Gospodarz renderuje każdą listę w kolejności wpisów w miejscu ze wzoru i przekazuje propsy z ./typy.ts.
// Każdy plik należy do jednostki podanej w komentarzu wpisu.
import type { WpisSlotu } from './typy';
import { SlotZakladkaRegul } from './zakladka-regul';
import { SlotZakladkaDokumentow } from './zakladka-dokumentow';

export type { MiejsceSlotu, PropsSlotu, WpisSlotu } from './typy';

// Lista slotów zakładek katalogu.
export const slotyKatalogu: WpisSlotu<'zakladka'>[] = [
  { id: 'zakladka-regul', zakladka: 'reguly', Komponent: SlotZakladkaRegul }, // u16
  { id: 'zakladka-dokumentow', zakladka: 'dokumenty', Komponent: SlotZakladkaDokumentow }, // u16
];
