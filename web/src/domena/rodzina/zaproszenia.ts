// Zaproszenie, dołączenie i odłączenie drugiego rodzica (kontrakt, sekcja 7.2).
// Właściciel: u23 (Dołączenie drugiego rodzica i pełnomocnictwo PEL). Funkcje są czyste: datę i losowość dostają jako argument.
import { dodajDni } from '@/domena/daty';
import { losowyCiag, ZNAKI_A_Z_0_9, type Losuj } from '@/domena/losowanie';
import { daneProfiluZTytulow, czyDaneZPelnomocnictwa } from '@/domena/rodzina/pelnomocnictwo';
import type {
  DanaZeZrodla,
  DaneDrugiegoRodzicaZKonta,
  DaneRodziny,
  DataISO,
  DostepKonta,
  DrugiRodzic,
  KontoPrzewodnika,
  Pesel,
  StanRodziny,
  Zaproszenie,
  ZnacznikCzasu,
} from '@/domena/typy';

/** Ważność zaproszenia w dniach od dnia utworzenia (ważne do włącznie). */
export const WAZNOSC_ZAPROSZENIA_DNI = 7;

/** Token zaproszenia: 12 znaków A-Z0-9. */
export function nowyToken(losuj: Losuj): string {
  return losowyCiag(losuj, 12, ZNAKI_A_Z_0_9);
}

/** Nowe zaproszenie ważne 7 dni od dnia utworzenia. */
export function noweZaproszenie(token: string, zapraszajacy: Pesel, dzis: DataISO, teraz: ZnacznikCzasu): Zaproszenie {
  return { token, utworzono: teraz, wazneDo: dodajDni(dzis, WAZNOSC_ZAPROSZENIA_DNI), zapraszajacy, stan: 'aktywne' };
}

/** Stan zaproszenia w dniu `dzis`: aktywne zaproszenie po dniu ważności wygasa. */
export function stanZaproszenia(z: Zaproszenie, dzis: DataISO): Zaproszenie['stan'] {
  if (z.stan === 'aktywne' && dzis > z.wazneDo) return 'wygasle';
  return z.stan;
}

/** Aktywny wpis dostępu konta z rolą Drugi rodzic. */
export function dolaczonyDrugiRodzic(daneRodziny: DaneRodziny): DostepKonta | null {
  return daneRodziny.dostepKont.find((d) => d.rola === 'drugi-rodzic' && d.stan === 'aktywny') ?? null;
}

/** Ostatni wpis odłączonego drugiego rodzica, gdy drugi rodzic nie jest dołączony. */
export function odlaczonyDrugiRodzic(daneRodziny: DaneRodziny): DostepKonta | null {
  if (dolaczonyDrugiRodzic(daneRodziny)) return null;
  const odlaczone = daneRodziny.dostepKont.filter((d) => d.rola === 'drugi-rodzic' && d.stan === 'odlaczony');
  return odlaczone.at(-1) ?? null;
}

/** Profil rodziny zawiera drugiego rodzica (odpowiedź rodzica albo dane z konta ZUS). */
export function czyProfilMaDrugiegoRodzica(daneRodziny: DaneRodziny): boolean {
  const forma = daneRodziny.drugiRodzic.formaZatrudnienia?.wartosc;
  return forma !== undefined && forma !== 'brak-drugiego-rodzica';
}

/**
 * Ocena linku zaproszenia dla zalogowanego konta (R-ZAPROSZENIE-WAZNOSC, R-ZAPROSZENIE-KTO): nieważny link 0066,
 * konto zapraszające 0067, konto z rolą Rodzic albo Drugi rodzic w innej rodzinie 0068; null, gdy link jest ważny.
 */
export function ocenLinkZaproszenia(
  token: string,
  konto: KontoPrzewodnika,
  rodzina: StanRodziny | null,
  dzis: DataISO,
): '0066' | '0067' | '0068' | null {
  const z = rodzina?.daneRodziny.zaproszenie;
  if (rodzina === null || rodzina.ukryte || z === undefined || z.token !== token) return '0066';
  if (stanZaproszenia(z, dzis) !== 'aktywne') return '0066';
  if (konto.pesel === z.zapraszajacy || konto.pesel === rodzina.idRodziny) return '0067';
  if (konto.rola === 'administrator') return '0068';
  if (konto.idRodziny !== null && (konto.rola === 'rodzic' || konto.rola === 'drugi-rodzic')) return '0068';
  return null;
}

function zeZrodlem<T>(d: DanaZeZrodla<T> | null | undefined, zrodlo: DanaZeZrodla<T>['zrodlo']): DanaZeZrodla<T> | null {
  return d == null ? null : { ...d, zrodlo };
}

/**
 * Dane drugiego rodzica po dołączeniu (R-DOLACZENIE): forma zatrudnienia, dobrowolne ubezpieczenie chorobowe
 * i płatnik zasiłku z jego konta ZUS zastępują odpowiedzi rodzica i dane z pełnomocnictwa PEL. Odpowiedzi
 * rodzica sprzed dołączenia zostają w kopii, którą ekran profilu pokazuje drugiemu rodzicowi.
 */
export function drugiRodzicPoDolaczeniu(
  drugi: DrugiRodzic,
  konto: Pick<KontoPrzewodnika, 'imie' | 'nazwisko' | 'imieINazwiskoDopelniacz' | 'pesel'>,
  daneKonta: DaneDrugiegoRodzicaZKonta,
  dzis: DataISO,
): DrugiRodzic {
  const { zachowaneOdpowiedzi, ...odpowiedzi } = drugi;
  const poprzednie = czyDaneZPelnomocnictwa(drugi) && zachowaneOdpowiedzi ? zachowaneOdpowiedzi : structuredClone(odpowiedzi);
  const profil = daneProfiluZTytulow(daneKonta.tytuly, 'konto-zus', dzis);
  return {
    ...odpowiedzi,
    imie: konto.imie,
    nazwisko: konto.nazwisko,
    ...(konto.imieINazwiskoDopelniacz === undefined ? {} : { imieINazwiskoDopelniacz: konto.imieINazwiskoDopelniacz }),
    pesel: konto.pesel,
    formaZatrudnienia: profil.formaZatrudnienia,
    dobrowolneChorobowe: profil.dobrowolneChorobowe,
    platnikZasilku: profil.platnikZasilku,
    daneZKontaZus: daneKonta,
    zachowaneOdpowiedzi: poprzednie,
  };
}

/**
 * Dane drugiego rodzica po odłączeniu (R-ODLACZENIE): te same wartości ze źródłem odpowiedź rodzica,
 * bez danych z konta ZUS i bez kopii odpowiedzi sprzed dołączenia.
 */
export function drugiRodzicPoOdlaczeniu(drugi: DrugiRodzic): DrugiRodzic {
  const { daneZKontaZus, zachowaneOdpowiedzi, ...reszta } = drugi;
  void daneZKontaZus;
  void zachowaneOdpowiedzi;
  const platnik = reszta.platnikZasilku ? { ...reszta.platnikZasilku, zrodlo: 'odpowiedz-rodzica' as const } : null;
  return {
    ...reszta,
    formaZatrudnienia: zeZrodlem(reszta.formaZatrudnienia, 'odpowiedz-rodzica'),
    dobrowolneChorobowe: zeZrodlem(reszta.dobrowolneChorobowe, 'odpowiedz-rodzica'),
    platnikZasilku: platnik,
    ...(reszta.rodzajUmowy ? { rodzajUmowy: { ...reszta.rodzajUmowy, zrodlo: 'odpowiedz-rodzica' as const } } : {}),
    ...(reszta.dataPoczatkuZatrudnienia
      ? { dataPoczatkuZatrudnienia: { ...reszta.dataPoczatkuZatrudnienia, zrodlo: 'odpowiedz-rodzica' as const } }
      : {}),
  };
}

/** Wpisy dostępu po dołączeniu konta: wcześniejsze wpisy tego konta ustępują nowemu wpisowi aktywnemu. */
export function dostepPoDolaczeniu(dostep: readonly DostepKonta[], pesel: Pesel, dzis: DataISO): DostepKonta[] {
  return [...dostep.filter((d) => d.pesel !== pesel), { pesel, rola: 'drugi-rodzic', dolaczono: dzis, stan: 'aktywny' }];
}

/** Wpisy dostępu po odłączeniu aktywnego drugiego rodzica. */
export function dostepPoOdlaczeniu(dostep: readonly DostepKonta[], dzis: DataISO): DostepKonta[] {
  return dostep.map((d) =>
    d.rola === 'drugi-rodzic' && d.stan === 'aktywny' ? { ...d, stan: 'odlaczony', odlaczono: dzis } : d,
  );
}
