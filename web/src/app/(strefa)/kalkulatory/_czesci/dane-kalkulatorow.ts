// Odczyt danych kalkulatorów wariantu zasiłku i podziału urlopu z kontekstu rodziny (u26).
// Podstawę wymiaru z podstaw składek liczy wspólny silnik kalkulatora (u09, wyliczPodstawe).
import { miesiacZDaty } from '@/domena/daty';
import { wyliczPodstawe } from '@/domena/kalkulatory';
import type {
  DaneDrugiegoRodzicaZKonta,
  DaneZKontaZus,
  DataISO,
  FormaZatrudnienia,
  Katalog,
  PlanRodziny,
  PodstawaSkladek,
  PodstawaWymiaru,
  WybranyWariant,
  WynikiKalkulacji,
  ZapisPodzialuUrlopu,
  ZapisPorownaniaWariantow,
} from '@/domena/typy';

export type StanPodstawy =
  | { rodzaj: 'wyliczona'; podstawa: PodstawaWymiaru }
  | { rodzaj: 'brak-podstaw' }        // 0094: dane ZUS bez podstaw składek z ubezpieczeniem chorobowym
  | { rodzaj: 'brak-danych' };        // 0173: brak danych ZUS (drugi rodzic bez dołączenia i PEL)

/** Podstawy składek z tytułów z ubezpieczeniem chorobowym. */
function podstawyZChorobowym(dane: DaneZKontaZus | DaneDrugiegoRodzicaZKonta): PodstawaSkladek[] {
  return dane.tytuly.filter((t) => t.ubezpieczenieChorobowe.rodzaj !== 'brak').flatMap((t) => t.podstawySkladek);
}

/** Podstawa wymiaru z konta ZUS dla miesiąca porodu (miesiąc powstania prawa). */
export function podstawaZKontaZus(
  dane: DaneZKontaZus | DaneDrugiegoRodzicaZKonta | null,
  forma: FormaZatrudnienia | null | undefined,
  dataPorodu: DataISO,
  katalog: Katalog,
): StanPodstawy {
  if (dane === null) return { rodzaj: 'brak-danych' };
  const podstawy = podstawyZChorobowym(dane);
  if (podstawy.length === 0) return { rodzaj: 'brak-podstaw' };
  // Początek ubezpieczenia chorobowego rozstrzyga o regule najniższej podstawy przy działalności krótszej niż 12 miesięcy.
  const poczatki = dane.tytuly
    .filter((t) => t.ubezpieczenieChorobowe.rodzaj !== 'brak')
    .map((t) => t.ubezpieczenieChorobowe.od ?? t.od)
    .filter((d): d is DataISO => typeof d === 'string')
    .sort();
  const wynik = wyliczPodstawe({
    podstawy,
    forma: forma ?? 'umowa-o-prace',
    pelnyEtat: forma === 'umowa-o-prace',
    miesiacPrawa: miesiacZDaty(dataPorodu),
    katalog,
    dzien: dataPorodu,
    ...(poczatki.length > 0 ? { poczatekUbezpieczenia: poczatki[0] } : {}),
  });
  if ('kod' in wynik) return wynik.kod === '0173' ? { rodzaj: 'brak-danych' } : { rodzaj: 'brak-podstaw' };
  return { rodzaj: 'wyliczona', podstawa: wynik };
}

/** Wybrany wariant sprawy planu o identyfikatorze pozycji `idPozycji`. */
export function wybranyWariantSprawy(plan: PlanRodziny | null, idPozycji: string): WybranyWariant | undefined {
  return plan?.pozycje.find((p) => p.idPozycji === idPozycji || p.idSprawy === idPozycji)?.wybranyWariant;
}

/** Wariant zasiłku matki z planu: K08 albo K07; bez wyboru 100% i 70%. */
export function wariantMatkiZPlanu(plan: PlanRodziny | null): { wariant: '81-5' | '100-70'; sprawa?: 'K07' | 'K08'; zapisano?: DataISO } {
  for (const id of ['K08', 'K07'] as const) {
    const w = wybranyWariantSprawy(plan, id);
    if (w && 'wariant' in w) return { wariant: w.wariant, sprawa: id, zapisano: w.zapisano };
  }
  return { wariant: '100-70' };
}

const WYNIKI_PUSTE: WynikiKalkulacji = { scenariusze: [], porownaniaWariantow: [], podzialyUrlopu: [], nastepnyNumer: 1 };

export function wynikiRodziny(w: WynikiKalkulacji | undefined): WynikiKalkulacji {
  return w ?? WYNIKI_PUSTE;
}

/** Ostatnie zapisane porównanie wariantów przy sprawie. */
export function ostatniePorownanie(w: WynikiKalkulacji | undefined, sprawa: 'K07' | 'K08'): ZapisPorownaniaWariantow | undefined {
  return [...wynikiRodziny(w).porownaniaWariantow].reverse().find((z) => z.sprawa === sprawa);
}

/** Ostatni zapisany plan podziału urlopu rodzicielskiego. */
export function ostatniPodzial(w: WynikiKalkulacji | undefined): ZapisPodzialuUrlopu | undefined {
  const lista = wynikiRodziny(w).podzialyUrlopu;
  return lista[lista.length - 1];
}
