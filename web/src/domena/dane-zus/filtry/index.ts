// Rejestr filtrów odczytu danych z konta ZUS (kontrakt, sekcja 7.2 i 12.3). Właściciel rejestru: u00.
// przygotujKopie (u03) stosuje filtry w tej kolejności; każdy plik filtra należy do jednostki podanej w komentarzu.
import type { DaneZKontaZus } from '@/domena/typy';
import { ezla } from '@/domena/dane-zus/filtry/ezla';
import { korespondencja } from '@/domena/dane-zus/filtry/korespondencja';
import { pelnomocnictwa } from '@/domena/dane-zus/filtry/pelnomocnictwa';
import { podstawowe } from '@/domena/dane-zus/filtry/podstawowe';
import { stanRozliczen } from '@/domena/dane-zus/filtry/stan-rozliczen';
import type { FiltrOdczytu, WejscieFiltraOdczytu } from '@/domena/dane-zus/filtry/typ';
import { wnioskiZus } from '@/domena/dane-zus/filtry/wnioski-zus';

export type { FiltrOdczytu, WejscieFiltraOdczytu } from '@/domena/dane-zus/filtry/typ';

export const filtryOdczytu: FiltrOdczytu[] = [
  podstawowe,       // u03: podstawy składek z 12 miesięcy, zasiłki z 6 miesięcy
  ezla,             // u14: zaświadczenia e-ZLA z 12 miesięcy
  stanRozliczen,    // u14
  wnioskiZus,       // u14
  pelnomocnictwa,   // u23
  korespondencja,   // u29
];

// Stosuje wszystkie filtry rejestru w kolejności.
export function zastosujFiltryOdczytu(kopia: DaneZKontaZus, w: WejscieFiltraOdczytu): DaneZKontaZus {
  return filtryOdczytu.reduce((biezaca, filtr) => filtr(biezaca, w), kopia);
}
