// Szczególna ochrona stosunku pracy po złożeniu wniosku o urlop (kontrakt, sekcja 7.2).
// Właściciel: u22 (Ryzyka, szczególna ochrona i podmioty wsparcia). Reguła R-OCHRONA z ANALIZY/18 sekcja 5.
import { dodajDni, maxData, porownajDaty } from '@/domena/daty';
import type {
  DaneRodziny,
  DataISO,
  IdWniosku,
  Okres,
  OkresWniosku,
  RodzajUrlopu,
  RodzicWRodzinie,
  Wniosek,
  WniosekOUrlop,
} from '@/domena/typy';

/** Liczba dni przed rozpoczęciem urlopu, od której wcześniej złożony wniosek daje ochronę. */
export const DNI_OCHRONY_PRZED_URLOPEM: Record<RodzajUrlopu, number> = {
  macierzynski: 14,
  'czesc-przed-porodem': 14,
  'na-warunkach-macierzynskiego': 14,
  'przejety-macierzynski': 14,
  uzupelniajacy: 21,
  rodzicielski: 21,
  'laczenie-z-praca': 21,
  ojcowski: 7,
};

/** Początek ochrony: 14, 21 albo 7 dni przed początkiem urlopu, nie wcześniej niż w dniu złożenia wniosku. */
export function poczatekOchrony(dataZlozenia: DataISO, poczatekUrlopu: DataISO, rodzajUrlopu: RodzajUrlopu): DataISO {
  return maxData(dataZlozenia, dodajDni(poczatekUrlopu, -DNI_OCHRONY_PRZED_URLOPEM[rodzajUrlopu]));
}

export interface OkresOchronyWniosku {
  idWniosku: IdWniosku;
  konto: string;
  rodzic?: RodzicWRodzinie;
  rodzajUrlopu: RodzajUrlopu;
  dataZlozenia: DataISO;
  urlop: Okres;
  ochrona: Okres;
}

const RODZAJE_WNIOSKOW_DO_PRACODAWCY: readonly Wniosek['rodzaj'][] = ['urlop-do-pracodawcy', 'wniosek-ojca-o-urlop'];

function czyWyslanyDoPracodawcy(w: Wniosek): w is WniosekOUrlop & { dataZlozenia: DataISO } {
  return (
    RODZAJE_WNIOSKOW_DO_PRACODAWCY.includes(w.rodzaj) &&
    (w.stan === 'wyslany' || w.stan === 'zlozony') &&
    w.dataZlozenia !== undefined &&
    (w.adresat === undefined || w.adresat === 'pracodawca') &&
    'okresy' in w &&
    w.okresy.length > 0
  );
}

/** Rodzic, którego dotyczy wniosek: z okresu wniosku albo z konta, które złożyło wniosek. */
export function rodzicWniosku(w: Pick<WniosekOUrlop, 'konto' | 'okresy'>, daneRodziny?: DaneRodziny): RodzicWRodzinie | undefined {
  const zOkresu = w.okresy.find((o) => o.rodzic !== undefined)?.rodzic;
  if (zOkresu !== undefined) return zOkresu;
  if (daneRodziny === undefined) return undefined;
  const aktywne = daneRodziny.dostepKont.filter((d) => d.stan === 'aktywny');
  const peselRodzica = aktywne.find((d) => d.rola === 'rodzic')?.pesel ?? daneRodziny.idRodziny;
  const inny: RodzicWRodzinie = daneRodziny.rodzicKonta === 'matka' ? 'drugi-rodzic' : 'matka';
  return w.konto === peselRodzica ? daneRodziny.rodzicKonta : inny;
}

function pierwszyOkres(okresy: readonly OkresWniosku[]): OkresWniosku {
  return [...okresy].sort((a, b) => porownajDaty(a.od, b.od))[0];
}

/**
 * Okres ochrony każdego wniosku o urlop wysłanego do pracodawcy (0158). Początek liczymy od pierwszego urlopu wniosku,
 * a koniec to dzień zakończenia ostatniego urlopu wniosku.
 */
export function okresyOchronyWnioskow(wnioski: readonly Wniosek[], daneRodziny?: DaneRodziny): OkresOchronyWniosku[] {
  return wnioski.filter(czyWyslanyDoPracodawcy).map((w) => {
    const pierwszy = pierwszyOkres(w.okresy);
    const koniec = w.okresy.map((o) => o.do).sort().at(-1) ?? pierwszy.do;
    const rodzic = rodzicWniosku(w, daneRodziny);
    return {
      idWniosku: w.idWniosku,
      konto: w.konto,
      ...(rodzic === undefined ? {} : { rodzic }),
      rodzajUrlopu: pierwszy.rodzajUrlopu,
      dataZlozenia: w.dataZlozenia,
      urlop: { od: pierwszy.od, do: koniec },
      ochrona: { od: poczatekOchrony(w.dataZlozenia, pierwszy.od, pierwszy.rodzajUrlopu), do: koniec },
    };
  });
}

/** Okresy ochrony z wysłanych wniosków o urlop (0158). */
export function okresyOchrony(wnioski: Wniosek[]): Okres[] {
  return okresyOchronyWnioskow(wnioski).map((o) => o.ochrona);
}
