// Tytuł sprawy planu dla planu rodziny, terminów i asystenta AI. Właściciel: u12.
// Sprawa z katalogu ma tytuł pozycji katalogu, a sprawa Opłacenie składek tytuł z miesiącem składek.
import { czySprawaOplacenia, miesiacZIdSprawyOplacenia } from '@/domena/plan/straznik';
import type { DataISO, Katalog, MiesiacISO, PozycjaPlanu } from '@/domena/typy';
import { teksty } from '@/teksty';

/** Nazwa miesiąca z rokiem, na przykład „listopad 2026”. */
export function nazwaMiesiacaZRokiem(miesiac: MiesiacISO | DataISO): string {
  const [rok, numer] = miesiac.split('-');
  const nazwa = teksty.wspolne.miesiace[Number(numer) - 1];
  return nazwa ? `${nazwa} ${rok}` : miesiac;
}

/** Tytuł sprawy Opłacenie składek za miesiąc składek `miesiac`. */
export function tytulOplaceniaSkladek(miesiac: MiesiacISO): string {
  return teksty.ViewFamilyPlan.oplacenie.tytul({ miesiac: nazwaMiesiacaZRokiem(miesiac) });
}

/** Tytuł sprawy planu: tytuł pozycji katalogu, a dla sprawy Opłacenie składek tytuł z miesiącem składek. */
export function tytulSprawyPlanu(katalog: Katalog, sprawa: PozycjaPlanu): string {
  if (czySprawaOplacenia(sprawa.idSprawy)) {
    const miesiac = sprawa.miesiacSkladek ?? miesiacZIdSprawyOplacenia(sprawa.idSprawy);
    return miesiac ? tytulOplaceniaSkladek(miesiac) : sprawa.idSprawy;
  }
  const pozycja = sprawa.idPozycji === null ? undefined : katalog.pozycje.find((p) => p.id === sprawa.idPozycji);
  return pozycja?.tytul ?? sprawa.idSprawy;
}
