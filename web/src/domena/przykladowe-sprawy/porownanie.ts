// Porównanie weryfikacji i wyliczeń z rozstrzygnięciem sprawy (kontrakt, sekcja 7.2).
// Właściciel: u21 (Przykładowe sprawy: weryfikacja i sprawdzenie wyliczeń).
// Reguły: wymaganie Porównanie z rozstrzygnięciem epiku 3.4.3 (ANALIZY/13, R-C1 i R-C2).
import { formatujDate } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import type {
  DataISO,
  Grosze,
  KodKomunikatu,
  RodzajUrlopu,
  RozstrzygniecieSprawy,
  WynikScenariusza,
  WynikWeryfikacjiSprawy,
} from '@/domena/typy';

export type PolePorownania = 'poczatek' | 'koniec' | 'kwota';

export interface PozycjaPorownania {
  pole: PolePorownania;
  wyliczenie: string | null;
  rozstrzygniecie: string | null;
  // null: rozstrzygnięcie nie zawiera tej danej
  zgodne: boolean | null;
  roznica?: Grosze;
}

export interface WynikPorownaniaWyliczenia {
  wynik: 'zgodne' | 'rozne' | 'bez-porownania';
  kod: KodKomunikatu;
  parametry?: Record<string, string>;
  pozycje: PozycjaPorownania[];
  okres?: { od: DataISO; do: DataISO };
  miesiecznaKwota?: Grosze;
}

/** Porównanie wyników weryfikacji z rozstrzygnięciem (0177, 0178, 0180). */
export function porownajWeryfikacje(
  wynik: WynikWeryfikacjiSprawy,
  rozstrzygniecie: RozstrzygniecieSprawy[],
): WynikWeryfikacjiSprawy['porownanie'] {
  return wynik.wyniki.map((w) => {
    const oczekiwane = rozstrzygniecie.find((r) => r.swiadczenie === w.swiadczenie);
    if (oczekiwane === undefined) return { swiadczenie: w.swiadczenie, wynik: 'bez-porownania' as const };
    return { swiadczenie: w.swiadczenie, wynik: oczekiwane.prawo === w.prawo ? ('zgodne' as const) : ('rozne' as const) };
  });
}

/** Kody komunikatów porównania weryfikacji: 0178 przy różnicy, 0177 przy zgodności, 0180 przy braku rozstrzygnięcia. */
export function komunikatyPorownaniaWeryfikacji(porownanie: WynikWeryfikacjiSprawy['porownanie']): KodKomunikatu[] {
  const kody: KodKomunikatu[] = [];
  if (porownanie.some((p) => p.wynik === 'rozne')) kody.push('0178');
  else if (porownanie.some((p) => p.wynik === 'zgodne')) kody.push('0177');
  if (porownanie.length === 0 || porownanie.some((p) => p.wynik === 'bez-porownania')) kody.push('0180');
  return kody;
}

const RODZAJE_ZASILKU_MACIERZYNSKIEGO: readonly (RodzajUrlopu | 'wydluzenie-rodzicielskiego')[] = [
  'macierzynski',
  'czesc-przed-porodem',
  'przejety-macierzynski',
  'rodzicielski',
  'wydluzenie-rodzicielskiego',
];

/** Okres zasiłku macierzyńskiego z wyliczenia: od początku pierwszego do końca ostatniego okresu urlopu macierzyńskiego i rodzicielskiego. */
export function okresZasilkuMacierzynskiego(wynik: WynikScenariusza): { od: DataISO; do: DataISO; miesiecznie: Grosze } | null {
  const okresy = wynik.okresy
    .filter((o) => RODZAJE_ZASILKU_MACIERZYNSKIEGO.includes(o.rodzaj))
    .sort((a, b) => (a.od < b.od ? -1 : a.od > b.od ? 1 : 0));
  if (okresy.length === 0) return null;
  const do_ = okresy.reduce((m, o) => (o.do > m ? o.do : m), okresy[0].do);
  return { od: okresy[0].od, do: do_, miesiecznie: okresy[0].miesiecznie };
}

/** Porównanie wyliczenia kalkulatora z rozstrzygnięciem z tolerancją w groszach (0111, 0112, 0180). */
export function porownajWyliczenie(
  wynik: WynikScenariusza,
  rozstrzygniecie: RozstrzygniecieSprawy[],
  tolerancja: Grosze,
): WynikPorownaniaWyliczenia {
  const wyliczone = okresZasilkuMacierzynskiego(wynik);
  const oczekiwane = rozstrzygniecie.find((r) => r.swiadczenie === 'zasilek-macierzynski');
  const pozycje: PozycjaPorownania[] = [
    {
      pole: 'poczatek',
      wyliczenie: wyliczone === null ? null : formatujDate(wyliczone.od),
      rozstrzygniecie: oczekiwane?.okres === undefined ? null : formatujDate(oczekiwane.okres.od),
      zgodne: oczekiwane?.okres === undefined ? null : wyliczone !== null && wyliczone.od === oczekiwane.okres.od,
    },
    {
      pole: 'koniec',
      wyliczenie: wyliczone === null ? null : formatujDate(wyliczone.do),
      rozstrzygniecie: oczekiwane?.okres === undefined ? null : formatujDate(oczekiwane.okres.do),
      zgodne: oczekiwane?.okres === undefined ? null : wyliczone !== null && wyliczone.do === oczekiwane.okres.do,
    },
    (() => {
      const kwota = oczekiwane?.miesiecznaKwota;
      const roznica = kwota === undefined || wyliczone === null ? undefined : Math.abs(wyliczone.miesiecznie - kwota);
      return {
        pole: 'kwota' as const,
        wyliczenie: wyliczone === null ? null : formatujKwote(wyliczone.miesiecznie),
        rozstrzygniecie: kwota === undefined ? null : formatujKwote(kwota),
        zgodne: kwota === undefined ? null : roznica !== undefined && roznica <= tolerancja,
        ...(roznica === undefined ? {} : { roznica }),
      };
    })(),
  ];
  const wspolne = {
    pozycje,
    ...(wyliczone === null ? {} : { okres: { od: wyliczone.od, do: wyliczone.do }, miesiecznaKwota: wyliczone.miesiecznie }),
  };
  if (oczekiwane === undefined) return { wynik: 'bez-porownania', kod: '0180', ...wspolne };
  const zgodne = oczekiwane.prawo === 'przysluguje' && wyliczone !== null && pozycje.every((p) => p.zgodne !== false);
  return zgodne ? { wynik: 'zgodne', kod: '0111', ...wspolne } : { wynik: 'rozne', kod: '0112', ...wspolne };
}
