// Rejestr sekcji ViewCaseGuide (kontrakt, sekcja 12.4). Właściciel rejestru: u00, gospodarz: u17.
// Gospodarz renderuje każdą listę w kolejności wpisów w miejscu ze wzoru i przekazuje propsy z ./typy.ts.
// Każdy plik należy do jednostki podanej w komentarzu wpisu.
import type { WpisSlotu } from './typy';
import { SekcjaAkcjaWnioskuZam } from './akcja-wniosku-zam';
import { SekcjaAkcjaWnioskuOUrlop } from './akcja-wniosku-o-urlop';
import { SekcjaAkcjaRezygnacjiIPrzejecia } from './akcja-rezygnacji-i-przejecia';
import { SekcjaAkcjaWariantu } from './akcja-wariantu';
import { SekcjaAkcjaPodzialuUrlopu } from './akcja-podzialu-urlopu';
import { SekcjaAkcjaKalkulatora } from './akcja-kalkulatora';
import { SekcjaAkcjaZas53 } from './akcja-zas53';
import { SekcjaAkcjaOdpisu } from './akcja-odpisu';
import { SekcjaPytaniaDoZus } from './pytania-do-zus';

export type { MiejsceSlotu, PropsSlotu, WpisSlotu } from './typy';

// Lista sekcji akcji instrukcji.
export const sekcjeInstrukcji: WpisSlotu<'akcja'>[] = [
  { id: 'akcja-wniosku-zam', Komponent: SekcjaAkcjaWnioskuZam }, // u27
  { id: 'akcja-wniosku-o-urlop', Komponent: SekcjaAkcjaWnioskuOUrlop }, // u28
  { id: 'akcja-rezygnacji-i-przejecia', Komponent: SekcjaAkcjaRezygnacjiIPrzejecia }, // u34
  { id: 'akcja-wariantu', Komponent: SekcjaAkcjaWariantu }, // u26
  { id: 'akcja-podzialu-urlopu', Komponent: SekcjaAkcjaPodzialuUrlopu }, // u26
  { id: 'akcja-kalkulatora', Komponent: SekcjaAkcjaKalkulatora }, // u20
  { id: 'akcja-zas53', Komponent: SekcjaAkcjaZas53 }, // u30
  { id: 'akcja-odpisu', Komponent: SekcjaAkcjaOdpisu }, // u29
  { id: 'pytania-do-zus', Komponent: SekcjaPytaniaDoZus }, // u29
];
