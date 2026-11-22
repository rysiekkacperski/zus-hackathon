// Imiona i nazwiska obojga rodziców oraz opisy danych wejściowych dla arkuszy wyniku i porównania scenariuszy. Właściciel: u20.
import { useMemo } from 'react';
import { useKonto, useRodzina, useStanKontaOsoby } from '@/dane/magazyn/hooki';
import { osobyRodziny } from '@/dane/magazyn/stan';
import { kontoPrzykladowe } from '@/dane/konta-demo';
import type {
  DaneWejscioweKalkulatora,
  FormaZatrudnienia,
  FormaZatrudnieniaDrugiegoRodzica,
  RodzicWRodzinie,
} from '@/domena/typy';
import { teksty } from '@/teksty';

export interface NazwaRodzica {
  /** Imię i nazwisko albo „matka” / „drugi rodzic”, gdy przewodnik nie zna osoby. */
  mianownik: string;
  /** Dopełniacz imienia i nazwiska albo „matki” / „drugiego rodzica”. */
  dopelniacz: string;
  znana: boolean;
}

export type NazwyRodzicow = Record<RodzicWRodzinie, NazwaRodzica>;

const t = teksty.SheetCalcReturnToWork;
const tz = teksty.ViewCalcMaternityResult.zapisScenariusza;

function nazwa(
  imie: string | undefined,
  nazwisko: string | undefined,
  dopelniacz: string | undefined,
  rodzic: RodzicWRodzinie,
  pesel?: string,
): NazwaRodzica {
  if (imie && nazwisko) {
    const mianownik = `${imie} ${nazwisko}`;
    // Dopełniacz zapisany przy osobie, a gdy go brak albo równa się mianownikowi, z konta demonstracyjnego o tym samym PESEL
    // i tym samym imieniu i nazwisku.
    const demo = pesel ? kontoPrzykladowe(pesel) : undefined;
    const zDemo = demo && demo.imie === imie && demo.nazwisko === nazwisko ? demo.imieINazwiskoDopelniacz : undefined;
    const wlasny = dopelniacz && dopelniacz !== mianownik ? dopelniacz : undefined;
    return { mianownik, dopelniacz: wlasny ?? zDemo ?? mianownik, znana: true };
  }
  return rodzic === 'matka'
    ? { mianownik: tz.matka, dopelniacz: t.matki, znana: false }
    : { mianownik: tz.drugiRodzic, dopelniacz: t.drugiegoRodzica, znana: false };
}

/** Imiona i nazwiska matki i drugiego rodzica z kont rodziny, Danych rodziny albo konta Nowego użytkownika. */
export function useNazwyRodzicow(): NazwyRodzicow {
  const konto = useKonto();
  const rodzina = useRodzina();
  const osoby = useMemo(() => (rodzina === null ? null : osobyRodziny(rodzina.daneRodziny)), [rodzina]);
  const stanMatki = useStanKontaOsoby(osoby?.peselMatki);
  const stanDrugiego = useStanKontaOsoby(osoby?.peselDrugiegoRodzica);
  return useMemo(() => {
    if (rodzina === null) {
      const wlasna = konto ? nazwa(konto.imie, konto.nazwisko, konto.imieINazwiskoDopelniacz, 'matka') : null;
      const kobieta = konto?.plec === 'kobieta';
      return {
        matka: kobieta && wlasna ? wlasna : nazwa(undefined, undefined, undefined, 'matka'),
        'drugi-rodzic': !kobieta && wlasna ? wlasna : nazwa(undefined, undefined, undefined, 'drugi-rodzic'),
      };
    }
    const kontoMatki = stanMatki?.konto ?? (konto && osoby?.peselMatki === konto.pesel ? konto : null);
    const kontoDrugiego = stanDrugiego?.konto ?? (konto && osoby?.peselDrugiegoRodzica === konto.pesel ? konto : null);
    const drugi = rodzina.daneRodziny.drugiRodzic;
    return {
      matka: kontoMatki
        ? nazwa(kontoMatki.imie, kontoMatki.nazwisko, kontoMatki.imieINazwiskoDopelniacz, 'matka', kontoMatki.pesel)
        : nazwa(undefined, undefined, undefined, 'matka'),
      'drugi-rodzic': kontoDrugiego
        ? nazwa(kontoDrugiego.imie, kontoDrugiego.nazwisko, kontoDrugiego.imieINazwiskoDopelniacz, 'drugi-rodzic', kontoDrugiego.pesel)
        : nazwa(
            drugi.imie,
            drugi.nazwisko,
            drugi.imieINazwiskoDopelniacz,
            'drugi-rodzic',
            osoby?.peselDrugiegoRodzica,
          ),
    };
  }, [konto, rodzina, osoby, stanMatki, stanDrugiego]);
}

/** Opis formy zatrudnienia z ubezpieczeniem chorobowym, małą literą. */
export function opisFormy(w: { forma: FormaZatrudnienia | FormaZatrudnieniaDrugiegoRodzica; dobrowolne: boolean }): string {
  const formy = teksty.SheetCalcParentalParts.formy;
  if (w.forma === 'umowa-zlecenia') return w.dobrowolne ? formy['umowa-zlecenia-z'] : formy['umowa-zlecenia-bez'];
  if (w.forma === 'jdg') return w.dobrowolne ? formy['jdg-z'] : formy['jdg-bez'];
  return formy[w.forma];
}

export function opisDzieci(d: DaneWejscioweKalkulatora): string {
  return teksty.SheetCalcParentalParts.dzieci[d.liczbaDzieci.wartosc];
}

export type ArkuszWyniku = 'podzial-urlopow' | 'laczenie-z-praca' | 'powrot-do-pracy';

/**
 * Otwiera albo zamyka arkusz wyniku parametrem ?arkusz= (z ?rodzic=) bez żądania do serwera (kontrakt, sekcja 1.1 pkt 5).
 * Wywoływana wyłącznie w obsłudze zdarzeń.
 */
export function ustawArkuszWAdresie(arkusz: ArkuszWyniku | null, rodzic?: RodzicWRodzinie): void {
  const adres = new URL(window.location.href);
  if (arkusz === null) adres.searchParams.delete('arkusz');
  else adres.searchParams.set('arkusz', arkusz);
  if (arkusz !== null && rodzic) adres.searchParams.set('rodzic', rodzic);
  else adres.searchParams.delete('rodzic');
  window.history.replaceState(null, '', `${adres.pathname}${adres.search}${adres.hash}`);
}

/** Forma zatrudnienia rodzica w danych wejściowych kalkulatora. */
export function formaRodzica(d: DaneWejscioweKalkulatora, rodzic: RodzicWRodzinie) {
  return rodzic === 'matka' ? d.formaMatki : d.formaDrugiegoRodzica;
}
