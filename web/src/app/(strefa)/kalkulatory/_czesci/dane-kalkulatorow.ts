// Odczyt danych kalkulatorów wariantu zasiłku i podziału urlopu z kontekstu rodziny (u26).
// Podstawę wymiaru z podstaw składek liczy wspólny silnik kalkulatora (u09, wyliczPodstawe), a wyliczenia kalkulatorów
// REST API (POST /api/v1/kalkulator/wariant i /kalkulator/podzial-urlopu) z tych samych podstaw składek.
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
import type { PodstawaWZadaniuApi } from '@/domena/typy/api-v1';

export type StanPodstawy =
  | { rodzaj: 'wyliczona'; podstawa: PodstawaWymiaru }
  | { rodzaj: 'brak-podstaw' }        // 0094: dane ZUS bez podstaw składek z ubezpieczeniem chorobowym
  | { rodzaj: 'brak-danych' };        // 0173: brak danych ZUS (drugi rodzic bez dołączenia i PEL)

/** Podstawy składek z tytułów z ubezpieczeniem chorobowym. */
function podstawyZChorobowym(dane: DaneZKontaZus | DaneDrugiegoRodzicaZKonta): PodstawaSkladek[] {
  return dane.tytuly.filter((t) => t.ubezpieczenieChorobowe.rodzaj !== 'brak').flatMap((t) => t.podstawySkladek);
}

/** Podstawy składek z ubezpieczeniem chorobowym, forma, etat i początek ubezpieczenia do wyliczenia podstawy z konta ZUS. */
function wejsciePodstawyZKonta(
  dane: DaneZKontaZus | DaneDrugiegoRodzicaZKonta,
  forma: FormaZatrudnienia | null | undefined,
): { podstawy: PodstawaSkladek[]; forma: FormaZatrudnienia; pelnyEtat: boolean; poczatekUbezpieczenia?: DataISO } {
  // Początek ubezpieczenia chorobowego rozstrzyga o regule najniższej podstawy przy działalności krótszej niż 12 miesięcy.
  const poczatki = dane.tytuly
    .filter((t) => t.ubezpieczenieChorobowe.rodzaj !== 'brak')
    .map((t) => t.ubezpieczenieChorobowe.od ?? t.od)
    .filter((d): d is DataISO => typeof d === 'string')
    .sort();
  return {
    podstawy: podstawyZChorobowym(dane),
    forma: forma ?? 'umowa-o-prace',
    pelnyEtat: forma === 'umowa-o-prace',
    ...(poczatki.length > 0 ? { poczatekUbezpieczenia: poczatki[0] } : {}),
  };
}

/** Podstawa wymiaru z konta ZUS dla miesiąca porodu (miesiąc powstania prawa). */
export function podstawaZKontaZus(
  dane: DaneZKontaZus | DaneDrugiegoRodzicaZKonta | null,
  forma: FormaZatrudnienia | null | undefined,
  dataPorodu: DataISO,
  katalog: Katalog,
): StanPodstawy {
  if (dane === null) return { rodzaj: 'brak-danych' };
  const wejscie = wejsciePodstawyZKonta(dane, forma);
  if (wejscie.podstawy.length === 0) return { rodzaj: 'brak-podstaw' };
  const wynik = wyliczPodstawe({ ...wejscie, miesiacPrawa: miesiacZDaty(dataPorodu), katalog, dzien: dataPorodu });
  if ('kod' in wynik) return wynik.kod === '0173' ? { rodzaj: 'brak-danych' } : { rodzaj: 'brak-podstaw' };
  return { rodzaj: 'wyliczona', podstawa: wynik };
}

/**
 * Podstawa w żądaniu REST API: z konta ZUS podstawy składek z formą, etatem i początkiem ubezpieczenia, z których serwer
 * liczy podstawę tak jak podstawaZKontaZus; podstawa wpisana albo z przykładowej sprawy jako kwota z etatem pracownika.
 */
export function podstawaDoZadaniaApi(
  podstawa: PodstawaWymiaru,
  dane: DaneZKontaZus | DaneDrugiegoRodzicaZKonta | null,
  forma: FormaZatrudnienia | null | undefined,
): PodstawaWZadaniuApi {
  const w = dane === null ? null : wejsciePodstawyZKonta(dane, forma);
  // Bez formy z tytułem ubezpieczenia podstawa nie podlega minimum pracownika, więc wystarczy jej kwota.
  if (podstawa.zrodlo === 'konto-zus' && w !== null && w.forma !== 'brak-tytulu') {
    return {
      podstawySkladek: w.podstawy,
      forma: w.forma,
      pelnyEtat: w.pelnyEtat,
      ...(w.poczatekUbezpieczenia ? { poczatekUbezpieczenia: w.poczatekUbezpieczenia } : {}),
    };
  }
  return podstawa.pelnyEtat === true ? { kwota: podstawa.kwota, forma: 'umowa-o-prace', pelnyEtat: true } : { kwota: podstawa.kwota, pelnyEtat: false };
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
