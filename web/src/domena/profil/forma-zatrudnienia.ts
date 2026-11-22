// Propozycja formy zatrudnienia z kopii Danych z konta ZUS (kontrakt, sekcja 7.2; analiza 3.3.1, reguły R1–R3).
// Właściciel: u07 (Profil na start: dane ZUS, płatnik, sytuacja).
import { dataZeZnacznika, dodajDni, porownajDaty } from '@/domena/daty';
import type {
  DanaZeZrodla,
  DaneZKontaZus,
  DataISO,
  FormaZatrudnienia,
  RodzajTytulu,
  TytulUbezpieczenia,
} from '@/domena/typy';

export interface PropozycjaFormyZatrudnienia {
  forma: FormaZatrudnienia;
  dobrowolne: boolean | null;
  pozostaleTytuly: TytulUbezpieczenia[];
  tytulyZakonczone: TytulUbezpieczenia[];
}

/** Okres, w którym tytuł zakończony przed dniem odczytu pokazujemy jako tytuł zakończony. */
export const DNI_TYTULU_ZAKONCZONEGO = 280;

/** Forma zatrudnienia odpowiadająca rodzajowi tytułu ubezpieczenia. */
export const FORMA_Z_TYTULU: Record<RodzajTytulu, Exclude<FormaZatrudnienia, 'brak-tytulu'>> = {
  pracownik: 'umowa-o-prace',
  zleceniobiorca: 'umowa-zlecenia',
  dzialalnosc: 'jdg',
};

/** Kolejność propozycji przy kilku tytułach: umowa o pracę, jednoosobowa działalność gospodarcza, umowa zlecenia. */
const KOLEJNOSC_TYTULOW: Record<RodzajTytulu, number> = { pracownik: 0, dzialalnosc: 1, zleceniobiorca: 2 };

/** Formy, przy których rodzic odpowiada na pytanie o dobrowolne ubezpieczenie chorobowe. */
export function czyPytacODobrowolne(forma: FormaZatrudnienia | null | undefined): boolean {
  return forma === 'umowa-zlecenia' || forma === 'jdg';
}

/** Dzień odczytu kopii Danych z konta ZUS. */
export function dzienOdczytu(kopia: DaneZKontaZus): DataISO {
  return dataZeZnacznika(kopia.odczytano);
}

/** Tytuł trwa w dniu odczytu: bez daty końca albo z datą końca w dniu odczytu lub później. */
function czyTrwa(tytul: TytulUbezpieczenia, dzien: DataISO): boolean {
  return tytul.do === undefined || porownajDaty(tytul.do, dzien) >= 0;
}

/** Tytuły trwające w dniu odczytu w kolejności propozycji. */
export function tytulyTrwajace(kopia: DaneZKontaZus): TytulUbezpieczenia[] {
  const dzien = dzienOdczytu(kopia);
  return kopia.tytuly
    .filter((t) => czyTrwa(t, dzien))
    .map((t, i) => ({ t, i }))
    .sort((a, b) => KOLEJNOSC_TYTULOW[a.t.rodzaj] - KOLEJNOSC_TYTULOW[b.t.rodzaj] || a.i - b.i)
    .map(({ t }) => t);
}

/** Tytuły zakończone przed dniem odczytu, nie wcześniej niż 280 dni przed nim. */
export function tytulyZakonczone(kopia: DaneZKontaZus): TytulUbezpieczenia[] {
  const dzien = dzienOdczytu(kopia);
  const granica = dodajDni(dzien, -DNI_TYTULU_ZAKONCZONEGO);
  return kopia.tytuly.filter(
    (t) => t.do !== undefined && porownajDaty(t.do, dzien) < 0 && porownajDaty(t.do, granica) >= 0,
  );
}

/** Pierwszy trwający tytuł danej formy zatrudnienia albo undefined. */
export function tytulDlaFormy(kopia: DaneZKontaZus | null, forma: FormaZatrudnienia | null | undefined): TytulUbezpieczenia | undefined {
  if (kopia === null || !forma || forma === 'brak-tytulu') return undefined;
  return tytulyTrwajace(kopia).find((t) => FORMA_Z_TYTULU[t.rodzaj] === forma);
}

/** Dobrowolne ubezpieczenie chorobowe przy tytule w dniu odczytu. */
function czyDobrowolne(tytul: TytulUbezpieczenia, dzien: DataISO): boolean {
  const ch = tytul.ubezpieczenieChorobowe;
  if (ch.rodzaj !== 'dobrowolne') return false;
  if (ch.do !== undefined && porownajDaty(ch.do, dzien) < 0) return false;
  return true;
}

/** Propozycja odpowiedzi o dobrowolnym ubezpieczeniu chorobowym dla formy, gdy dane konta ZUS mają tytuł tej formy. */
export function proponujDobrowolne(kopia: DaneZKontaZus | null, forma: FormaZatrudnienia | null | undefined): boolean | null {
  if (!czyPytacODobrowolne(forma)) return null;
  const tytul = tytulDlaFormy(kopia, forma);
  if (tytul === undefined || kopia === null) return null;
  return czyDobrowolne(tytul, dzienOdczytu(kopia));
}

/** Forma zatrudnienia z pierwszeństwem UoP > JDG > UZ, z tytułami zakończonymi w ostatnich 280 dniach. */
export function proponujFormeZatrudnienia(kopia: DaneZKontaZus): PropozycjaFormyZatrudnienia | null {
  const trwajace = tytulyTrwajace(kopia);
  const zakonczone = tytulyZakonczone(kopia);
  const pierwszy = trwajace[0];
  if (pierwszy === undefined) {
    return { forma: 'brak-tytulu', dobrowolne: null, pozostaleTytuly: [], tytulyZakonczone: zakonczone };
  }
  const forma = FORMA_Z_TYTULU[pierwszy.rodzaj];
  return {
    forma,
    dobrowolne: czyPytacODobrowolne(forma) ? czyDobrowolne(pierwszy, dzienOdczytu(kopia)) : null,
    pozostaleTytuly: trwajace.slice(1),
    tytulyZakonczone: zakonczone,
  };
}

/** Pozostałe trwające tytuły przy wybranej formie: wszystkie poza pierwszym tytułem tej formy. */
export function pozostaleTytulyDlaFormy(kopia: DaneZKontaZus | null, forma: FormaZatrudnienia | null | undefined): TytulUbezpieczenia[] {
  if (kopia === null) return [];
  const glowny = tytulDlaFormy(kopia, forma);
  return tytulyTrwajace(kopia).filter((t) => t !== glowny);
}

/**
 * Forma po wyborze w arkuszu SheetEmploymentChoice: forma równa propozycji z konta ZUS zachowuje źródło
 * konto ZUS, każda inna ma źródło odpowiedź rodzica (reguła R3).
 */
export function formaPoWyborze(
  wybrana: FormaZatrudnienia,
  propozycja: PropozycjaFormyZatrudnienia | null,
): DanaZeZrodla<FormaZatrudnienia> {
  return { wartosc: wybrana, zrodlo: propozycja?.forma === wybrana ? 'konto-zus' : 'odpowiedz-rodzica' };
}

/**
 * Odpowiedź o dobrowolnym ubezpieczeniu chorobowym po zmianie formy: przy formie z konta ZUS wraca propozycja
 * z konta ZUS, przy formie zmienionej przez rodzica pole jest puste (KA-08 3.3.1.1.1).
 */
export function dobrowolnePoZmianieFormy(
  forma: DanaZeZrodla<FormaZatrudnienia>,
  propozycja: PropozycjaFormyZatrudnienia | null,
): DanaZeZrodla<boolean> | null {
  if (!czyPytacODobrowolne(forma.wartosc)) return null;
  if (forma.zrodlo === 'konto-zus' && propozycja !== null && propozycja.dobrowolne !== null) {
    return { wartosc: propozycja.dobrowolne, zrodlo: 'konto-zus' };
  }
  return null;
}

/** Źródło odpowiedzi o dobrowolnym ubezpieczeniu: równa propozycji z konta ZUS przy formie z konta ZUS daje konto ZUS. */
export function dobrowolneZOdpowiedzi(
  wartosc: boolean,
  forma: DanaZeZrodla<FormaZatrudnienia>,
  propozycja: PropozycjaFormyZatrudnienia | null,
): DanaZeZrodla<boolean> {
  const zKonta = forma.zrodlo === 'konto-zus' && propozycja !== null && propozycja.dobrowolne === wartosc;
  return { wartosc, zrodlo: zKonta ? 'konto-zus' : 'odpowiedz-rodzica' };
}
