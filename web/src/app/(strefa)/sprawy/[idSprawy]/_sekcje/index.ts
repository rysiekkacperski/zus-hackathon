// Rejestr sekcji ViewCaseDetails (kontrakt, sekcja 12.4). Właściciel rejestru: u00, gospodarz: u12.
// Gospodarz renderuje każdą listę w kolejności wpisów w miejscu ze wzoru i przekazuje propsy z ./typy.ts.
// Każdy plik należy do jednostki podanej w komentarzu wpisu.
import type { WpisSlotu } from './typy';
import { SekcjaTerminIKoszt } from './termin-i-koszt';
import { SekcjaStatusWnioskuZus } from './status-wniosku-zus';
import { SekcjaPrawoWCiazy } from './prawo-w-ciazy';
import { SekcjaZaswiadczeniaEzla } from './zaswiadczenia-ezla';
import { SekcjaStanRozliczen } from './stan-rozliczen';
import { SekcjaOstrzezeniaRyzyk } from './ostrzezenia-ryzyk';
import { SekcjaOchronaK30 } from './ochrona-k30';
import { SekcjaWsparcieK35 } from './wsparcie-k35';
import { SekcjaSytuacjaSzczegolnaK34 } from './sytuacja-szczegolna-k34';
import { SekcjaPrzyjecieK31K33 } from './przyjecie-k31-k33';
import { SekcjaWniosekZas53 } from './wniosek-zas53';
import { SekcjaStraznikOplacenieSkladek } from './straznik-oplacenie-skladek';

export type { MiejsceSlotu, PropsSlotu, WpisSlotu } from './typy';

// Lista sekcji szczegółów sprawy.
export const sekcjeSprawy: WpisSlotu<'sekcja'>[] = [
  { id: 'termin-i-koszt', Komponent: SekcjaTerminIKoszt }, // u13
  { id: 'status-wniosku-zus', Komponent: SekcjaStatusWnioskuZus }, // u14
  { id: 'prawo-w-ciazy', Komponent: SekcjaPrawoWCiazy }, // u16
  { id: 'zaswiadczenia-ezla', Komponent: SekcjaZaswiadczeniaEzla }, // u14
  { id: 'stan-rozliczen', Komponent: SekcjaStanRozliczen }, // u14
  { id: 'ostrzezenia-ryzyk', Komponent: SekcjaOstrzezeniaRyzyk }, // u22
  { id: 'ochrona-k30', Komponent: SekcjaOchronaK30 }, // u22
  { id: 'wsparcie-k35', Komponent: SekcjaWsparcieK35 }, // u22
  { id: 'sytuacja-szczegolna-k34', Komponent: SekcjaSytuacjaSzczegolnaK34 }, // u25
  { id: 'przyjecie-k31-k33', Komponent: SekcjaPrzyjecieK31K33 }, // u24
  { id: 'wniosek-zas53', Komponent: SekcjaWniosekZas53 }, // u30
  { id: 'straznik-oplacenie-skladek', Komponent: SekcjaStraznikOplacenieSkladek }, // u12
];
