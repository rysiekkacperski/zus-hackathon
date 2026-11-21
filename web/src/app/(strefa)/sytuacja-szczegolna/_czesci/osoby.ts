'use client';

// Imiona i nazwiska rodziców do tekstów sytuacji szczególnej (ViewSpecialSituation i sloty planu). Właściciel: u25.
import type { KontekstRodziny } from '@/dane/magazyn/hooki';
import { useStanKontaOsoby } from '@/dane/magazyn/hooki';

export interface OsobySytuacji {
  /** Czy zalogowane konto jest matką dziecka. */
  kontoJestMatka: boolean;
  matkaImieINazwisko: string | null;
  drugiRodzicImieINazwisko: string | null;
  /** Drugi rodzic rodziny z punktu widzenia zalogowanego konta, w dopełniaczu („dla Ciebie i …”). */
  innyRodzicDopelniacz: string | null;
}

function polacz(imie?: string, nazwisko?: string): string | null {
  const tekst = [imie, nazwisko].filter(Boolean).join(' ');
  return tekst === '' ? null : tekst;
}

export function useOsobySytuacji(kontekst: KontekstRodziny | null): OsobySytuacji {
  const dane = kontekst?.rodzina.daneRodziny;
  const kontoZakladajaceJestMatka = dane?.rodzicKonta !== 'drugi-rodzic';
  const kontoJestMatka = kontekst !== null && (kontekst.rola === 'rodzic') === kontoZakladajaceJestMatka;
  const peselInnego =
    kontekst === null || dane === undefined
      ? undefined
      : kontekst.rola === 'rodzic'
        ? dane.dostepKont.find((d) => d.rola === 'drugi-rodzic' && d.stan === 'aktywny' && d.pesel !== kontekst.konto.pesel)?.pesel
        : dane.idRodziny;
  const inny = useStanKontaOsoby(peselInnego)?.konto ?? null;
  if (kontekst === null || dane === undefined) {
    return { kontoJestMatka: false, matkaImieINazwisko: null, drugiRodzicImieINazwisko: null, innyRodzicDopelniacz: null };
  }
  const konto = kontekst.konto;
  const drugi = dane.drugiRodzic;
  const kontoImie = polacz(konto.imie, konto.nazwisko);
  const innyImie = inny ? polacz(inny.imie, inny.nazwisko) : null;
  const drugiZProfilu = polacz(drugi.imie, drugi.nazwisko);
  const drugiRodzicImieINazwisko = drugiZProfilu ?? (kontoJestMatka ? innyImie : kontoImie);
  const matkaImieINazwisko = kontoJestMatka ? kontoImie : innyImie;
  const innyRodzicDopelniacz = kontoJestMatka
    ? (drugi.imieINazwiskoDopelniacz ?? inny?.imieINazwiskoDopelniacz ?? innyImie ?? drugiZProfilu)
    : (inny?.imieINazwiskoDopelniacz ?? innyImie);
  return { kontoJestMatka, matkaImieINazwisko, drugiRodzicImieINazwisko, innyRodzicDopelniacz };
}
