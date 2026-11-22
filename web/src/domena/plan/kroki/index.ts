// Rejestr kroków planu (kontrakt, sekcja 7.2 i 12.3). Właściciel rejestru: u00.
// wyliczPlan wykonuje kroki w tej kolejności; każdy plik kroku należy do jednostki podanej w komentarzu.
import type { KrokPlanu } from '@/domena/plan/kroki/typ';
import { okresZasilkowyEzla } from '@/domena/plan/kroki/okres-zasilkowy-ezla';
import { pakietNarodzin } from '@/domena/plan/kroki/pakiet-narodzin';
import { prawoWCiazy } from '@/domena/plan/kroki/prawo-w-ciazy';
import { przyjecieDziecka, przyjecieDzieckaPorzadek } from '@/domena/plan/kroki/przyjecie-dziecka';
import { ryzykaCiazy } from '@/domena/plan/kroki/ryzyka-ciazy';
import { statusyZus } from '@/domena/plan/kroki/statusy-zus';
import { straznik } from '@/domena/plan/kroki/straznik';
import { sytuacjaSzczegolna } from '@/domena/plan/kroki/sytuacja-szczegolna';
import { warunkiKatalogu } from '@/domena/plan/kroki/warunki-katalogu';

export type { KrokPlanu } from '@/domena/plan/kroki/typ';

export const krokiPlanu: KrokPlanu[] = [
  warunkiKatalogu,      // u08
  przyjecieDziecka,     // u24
  sytuacjaSzczegolna,   // u25
  pakietNarodzin,       // u19
  prawoWCiazy,          // u16
  okresZasilkowyEzla,   // u14
  straznik,             // u12
  ryzykaCiazy,          // u22
  statusyZus,           // u14
  przyjecieDzieckaPorzadek, // u24
];
