// Rejestr scenariuszy demonstracyjnych (kontrakt, sekcje 6.6 i 8).
// Rejestr łączy scenariusze jednostek w kolejności numerów jednostek. ViewDemoSettings listuje je,
// a operacja `wczytajScenariusz(id)` stosuje wynik `zastosuj(ctx)` do magazynu.
import { scenariuszeU01 } from '@/dane/scenariusze/u01';
import { scenariuszeU02 } from '@/dane/scenariusze/u02';
import { scenariuszeU03 } from '@/dane/scenariusze/u03';
import { scenariuszeU05 } from '@/dane/scenariusze/u05';
import { scenariuszeU07 } from '@/dane/scenariusze/u07';
import { scenariuszeU08 } from '@/dane/scenariusze/u08';
import { scenariuszeU11 } from '@/dane/scenariusze/u11';
import { scenariuszeU12 } from '@/dane/scenariusze/u12';
import { scenariuszeU13 } from '@/dane/scenariusze/u13';
import { scenariuszeU14 } from '@/dane/scenariusze/u14';
import { scenariuszeU15 } from '@/dane/scenariusze/u15';
import { scenariuszeU16 } from '@/dane/scenariusze/u16';
import { scenariuszeU17 } from '@/dane/scenariusze/u17';
import { scenariuszeU18 } from '@/dane/scenariusze/u18';
import { scenariuszeU19 } from '@/dane/scenariusze/u19';
import { scenariuszeU20 } from '@/dane/scenariusze/u20';
import { scenariuszeU22 } from '@/dane/scenariusze/u22';
import { scenariuszeU23 } from '@/dane/scenariusze/u23';
import { scenariuszeU24 } from '@/dane/scenariusze/u24';
import { scenariuszeU25 } from '@/dane/scenariusze/u25';
import { scenariuszeU26 } from '@/dane/scenariusze/u26';
import { scenariuszeU27 } from '@/dane/scenariusze/u27';
import { scenariuszeU28 } from '@/dane/scenariusze/u28';
import { scenariuszeU29 } from '@/dane/scenariusze/u29';
import { scenariuszeU30 } from '@/dane/scenariusze/u30';
import { scenariuszeU31 } from '@/dane/scenariusze/u31';
import { scenariuszeU32 } from '@/dane/scenariusze/u32';
import { scenariuszeU33 } from '@/dane/scenariusze/u33';
import { scenariuszeU34 } from '@/dane/scenariusze/u34';
import type { Pesel, ScenariuszDemo } from '@/domena/typy';

export const scenariusze: readonly ScenariuszDemo[] = [
  ...scenariuszeU01,
  ...scenariuszeU02,
  ...scenariuszeU03,
  ...scenariuszeU05,
  ...scenariuszeU07,
  ...scenariuszeU08,
  ...scenariuszeU11,
  ...scenariuszeU12,
  ...scenariuszeU13,
  ...scenariuszeU14,
  ...scenariuszeU15,
  ...scenariuszeU16,
  ...scenariuszeU17,
  ...scenariuszeU18,
  ...scenariuszeU19,
  ...scenariuszeU20,
  ...scenariuszeU22,
  ...scenariuszeU23,
  ...scenariuszeU24,
  ...scenariuszeU25,
  ...scenariuszeU26,
  ...scenariuszeU27,
  ...scenariuszeU28,
  ...scenariuszeU29,
  ...scenariuszeU30,
  ...scenariuszeU31,
  ...scenariuszeU32,
  ...scenariuszeU33,
  ...scenariuszeU34,
];

/** Zwraca scenariusz o podanym identyfikatorze albo `undefined`. */
export function znajdzScenariusz(id: string): ScenariuszDemo | undefined {
  return scenariusze.find((scenariusz) => scenariusz.id === id);
}

/** Zwraca scenariusze przygotowane dla konta o podanym numerze PESEL. */
export function scenariuszeKonta(pesel: Pesel): ScenariuszDemo[] {
  return scenariusze.filter((scenariusz) => scenariusz.pesel === pesel);
}
