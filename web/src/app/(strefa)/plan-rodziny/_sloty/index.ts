// Rejestr slotów ViewFamilyPlan (kontrakt, sekcja 12.4). Właściciel rejestru: u00, gospodarz: u12.
// Gospodarz renderuje każdą listę w kolejności wpisów w miejscu ze wzoru i przekazuje propsy z ./typy.ts.
// Każdy plik należy do jednostki podanej w komentarzu wpisu.
import type { WpisSlotu } from './typy';
import { SlotOknoNowegoDziecka } from './okno-nowego-dziecka';
import { SlotKomunikatyPrzyjecia } from './komunikaty-przyjecia';
import { SlotStanDanychZus } from './stan-danych-zus';
import { SlotTerminSprawy } from './termin-sprawy';
import { SlotStatusWnioskuZus } from './status-wniosku-zus';
import { SlotOstrzezeniaSprawy } from './ostrzezenia-sprawy';
import { SlotAkcjaPrzejeciaUrlopu } from './akcja-przejecia-urlopu';
import { SlotInformacjaSymulacjiProfilu } from './informacja-symulacji-profilu';

export type { MiejsceSlotu, PropsSlotu, WpisSlotu } from './typy';

// Akcje planu stoją poza rejestrem: „Zgłoś narodziny” w nagłówku pulpitu (warunek czyZgloszenieNarodzinDostepne
// z ./akcja-zglos-narodziny, u19), a karta trybu z ./akcja-sytuacja-szczegolna (u25) w prawej kolumnie pulpitu.

// Lista slotów nad planem.
export const slotyNadPlanem: WpisSlotu<'nadPlanem'>[] = [
  { id: 'informacja-symulacji-profilu', Komponent: SlotInformacjaSymulacjiProfilu }, // u01
  { id: 'stan-danych-zus', Komponent: SlotStanDanychZus }, // u03
  { id: 'okno-nowego-dziecka', Komponent: SlotOknoNowegoDziecka }, // u19
  { id: 'komunikaty-przyjecia', Komponent: SlotKomunikatyPrzyjecia }, // u24
];

// Lista slotów przy sprawie.
export const slotyPrzySprawie: WpisSlotu<'przySprawie'>[] = [
  { id: 'termin-sprawy', Komponent: SlotTerminSprawy }, // u13
  { id: 'status-wniosku-zus', Komponent: SlotStatusWnioskuZus }, // u14
  { id: 'ostrzezenia-sprawy', Komponent: SlotOstrzezeniaSprawy }, // u22
  { id: 'akcja-przejecia-urlopu', Komponent: SlotAkcjaPrzejeciaUrlopu }, // u25
];
