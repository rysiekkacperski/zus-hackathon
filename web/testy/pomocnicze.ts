// Dane wspólne testów: katalog startowy, katalog po zmianach Administratora i dane wejściowe kalkulatora.
import { seedKatalogu } from '@/dane/katalog';
import { zlozKatalog } from '@/domena/katalog/zloz';
import { edycjePuste, zastosujZmiane } from '@/domena/katalog/zmiany';
import type { DaneWejscioweKalkulatora, Katalog, PodstawaWymiaru, ZmianaKatalogu } from '@/domena/typy';

export const DZIS = '2026-11-22';

/** Katalog startowy bez edycji Administratora. */
export function katalogStartowy(): Katalog {
  return zlozKatalog(seedKatalogu, edycjePuste());
}

/** Katalog po nowych wartościach wpisów słowników obowiązujących od początku katalogu. */
export function katalogZWartosciami(zmiany: Record<string, Record<string, number>>): Katalog {
  let edycje = edycjePuste();
  for (const [idWpisu, wartosci] of Object.entries(zmiany)) {
    const wpis = seedKatalogu.slowniki.find((w) => w.id === idWpisu);
    if (wpis === undefined) throw new Error(`Brak wpisu ${idWpisu}`);
    const poprzednie = wpis.wersje[wpis.wersje.length - 1].wartosci;
    const zmiana: ZmianaKatalogu = { rodzaj: 'nowa-wersja', idWpisu, wersja: { od: wpis.wersje[0].od, wartosci: { ...poprzednie, ...wartosci } } };
    edycje = zastosujZmiane(edycje, zmiana);
  }
  return zlozKatalog(seedKatalogu, edycje);
}

const w = <T>(wartosc: T) => ({ wartosc, zrodlo: 'wartosc-w-kalkulatorze' as const });

/** Poród 10.11.2026, jedno dziecko, oboje rodzice na umowie o pracę. */
export function daneKalkulatora(nadpisz: Record<string, unknown> = {}): DaneWejscioweKalkulatora {
  return {
    zdarzenie: w('porod'),
    dataPorodu: w('2026-11-10'),
    liczbaDzieci: w(1),
    zaZyciem: w(false),
    formaMatki: w({ forma: 'umowa-o-prace', dobrowolne: false }),
    formaDrugiegoRodzica: w({ forma: 'umowa-o-prace', dobrowolne: false }),
    ...nadpisz,
  } as unknown as DaneWejscioweKalkulatora;
}

export function podstawa(kwota: number): PodstawaWymiaru {
  return { kwota, zrodlo: 'wartosc-wpisana-przez-rodzica', pelnyEtat: true } as PodstawaWymiaru;
}

export { w as wartosc };
