// Oznaczenie nowych dzieci w kopii Danych z konta ZUS (kontrakt, sekcje 7.2 i 11.2). Właściciel: u03 (Odczyt danych z konta ZUS).
// Moduł domena/dane-zus/odczyt.ts reeksportuje oznaczNoweDzieci.
//
// Reguła (historyjka 3.4.1.1.1, wymaganie Nowe dziecko):
// - konto z poprzednią kopią: członek rodziny jest nowym dzieckiem, gdy jego numeru PESEL nie było w poprzedniej kopii,
//   a data urodzenia przypada nie wcześniej niż 36 miesięcy przed dniem odczytu;
// - pierwszy odczyt konta: nowym dzieckiem jest wyłącznie członek urodzony nie wcześniej niż 30 dni przed dniem odczytu;
// - członek obecny w poprzedniej kopii nie ma oznaczenia, także gdy poprzednio je miał.
import { dodajDni, dodajMiesiace, porownajDaty } from '@/domena/daty';
import type { CzlonekRodzinyZus, DaneZKontaZus, DataISO } from '@/domena/typy';

/** Okno nowego dziecka przy kolejnym odczycie, w miesiącach przed dniem odczytu. */
export const OKNO_NOWEGO_DZIECKA_MIESIACE = 36;
/** Okno nowego dziecka przy pierwszym odczycie konta, w dniach przed dniem odczytu. */
export const OKNO_NOWEGO_DZIECKA_PIERWSZY_ODCZYT_DNI = 30;

/** Najwcześniejsza data urodzenia nowego dziecka przy odczycie w dniu `dzienOdczytu` (granica włącznie). */
export function najwczesniejszaDataNowegoDziecka(dzienOdczytu: DataISO, pierwszyOdczyt: boolean): DataISO {
  return pierwszyOdczyt
    ? dodajDni(dzienOdczytu, -OKNO_NOWEGO_DZIECKA_PIERWSZY_ODCZYT_DNI)
    : dodajMiesiace(dzienOdczytu, -OKNO_NOWEGO_DZIECKA_MIESIACE);
}

/** Członkowie rodziny z oznaczeniem dzieci, których nie było w poprzedniej kopii. */
export function oznaczNoweDzieci(
  czlonkowie: Omit<CzlonekRodzinyZus, 'noweDziecko'>[],
  poprzednia: DaneZKontaZus | null,
  dzienOdczytu: DataISO,
): CzlonekRodzinyZus[] {
  const pierwszyOdczyt = poprzednia === null;
  const granica = najwczesniejszaDataNowegoDziecka(dzienOdczytu, pierwszyOdczyt);
  const wczesniejsze = new Set(poprzednia?.czlonkowieRodziny.map((czlonek) => czlonek.pesel) ?? []);

  return czlonkowie.map((czlonek) => {
    const nieznany = !wczesniejsze.has(czlonek.pesel);
    const wOknie = porownajDaty(czlonek.dataUrodzenia, granica) >= 0;
    return { ...czlonek, noweDziecko: nieznany && wOknie };
  });
}
