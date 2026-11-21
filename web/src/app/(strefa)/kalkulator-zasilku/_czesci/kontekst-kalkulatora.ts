'use client';

// Dane, z których korzystają ViewCalcMaternityInput i ViewCalcMaternityResult (u15): konto, rodzina, kopie danych ZUS
// obojga rodziców i imiona do nagłówków sekcji („Matka – Anna Nowak”).
import { useMemo } from 'react';
import {
  useDzis,
  useKatalog,
  useRodzina,
  useStanKonta,
  useStanKontaOsoby,
} from '@/dane/magazyn/hooki';
import { plecZPesel } from '@/domena/pesel';
import type {
  DaneDrugiegoRodzicaZKonta,
  DaneRodziny,
  DaneZKontaZus,
  DataISO,
  Katalog,
  KontoPrzewodnika,
  Pesel,
  RodzicWRodzinie,
  StanRodziny,
} from '@/domena/typy';

export interface KontekstKalkulatora {
  konto: KontoPrzewodnika;
  nowyUzytkownik: boolean;
  rodzina: StanRodziny | null;
  kopiaKonta: DaneZKontaZus | null;
  daneZus: Record<RodzicWRodzinie, DaneZKontaZus | DaneDrugiegoRodzicaZKonta | null>;
  // Drugi rodzic dołączył do planu rodziny albo udostępnił dane przez pełnomocnictwo PEL.
  drugiRodzicZDanymi: boolean;
  imiona: Partial<Record<RodzicWRodzinie, string>>;
  katalog: Katalog;
  dzis: DataISO;
}

function peseleRodzicow(d: DaneRodziny): Partial<Record<RodzicWRodzinie, Pesel>> {
  const aktywne = d.dostepKont.filter((k) => k.stan === 'aktywny');
  const rodzic = aktywne.find((k) => k.rola === 'rodzic')?.pesel ?? d.idRodziny;
  const dolaczony = aktywne.find((k) => k.rola === 'drugi-rodzic' && k.pesel !== rodzic)?.pesel;
  return d.rodzicKonta === 'matka'
    ? { matka: rodzic, 'drugi-rodzic': dolaczony }
    : { matka: dolaczony, 'drugi-rodzic': rodzic };
}

function imieINazwisko(o: { imie?: string; nazwisko?: string } | null | undefined): string | undefined {
  const t = [o?.imie, o?.nazwisko].filter(Boolean).join(' ');
  return t === '' ? undefined : t;
}

export function useKontekstKalkulatora(): KontekstKalkulatora | null {
  const stanKonta = useStanKonta();
  const rodzinaZMagazynu = useRodzina();
  const katalog = useKatalog();
  const dzis = useDzis();
  const konto = stanKonta?.konto ?? null;
  const nowyUzytkownik = konto === null || konto.rola === 'nowy-uzytkownik' || rodzinaZMagazynu === null;
  const rodzina = nowyUzytkownik ? null : rodzinaZMagazynu;
  const pesele = useMemo(() => (rodzina ? peseleRodzicow(rodzina.daneRodziny) : {}), [rodzina]);
  const stanMatki = useStanKontaOsoby(pesele.matka);
  const stanDrugiego = useStanKontaOsoby(pesele['drugi-rodzic']);

  return useMemo(() => {
    if (stanKonta === null || konto === null) return null;
    const kopiaKonta = stanKonta.kopiaDanychZus;
    if (rodzina === null) {
      const kobieta = plecZPesel(konto.pesel) === 'kobieta';
      const imie = imieINazwisko(konto);
      return {
        konto,
        nowyUzytkownik: true,
        rodzina: null,
        kopiaKonta,
        daneZus: { matka: kobieta ? kopiaKonta : null, 'drugi-rodzic': kobieta ? null : kopiaKonta },
        drugiRodzicZDanymi: !kobieta && kopiaKonta !== null,
        imiona: kobieta ? { matka: imie } : { 'drugi-rodzic': imie },
        katalog,
        dzis,
      };
    }
    const drugi = rodzina.daneRodziny.drugiRodzic;
    const kopiaMatki = pesele.matka === konto.pesel ? kopiaKonta : (stanMatki?.kopiaDanychZus ?? null);
    const kopiaDrugiego =
      pesele['drugi-rodzic'] === konto.pesel
        ? kopiaKonta
        : (stanDrugiego?.kopiaDanychZus ?? drugi.daneZKontaZus ?? kopiaKonta?.daneDrugiegoRodzicaZPel ?? null);
    return {
      konto,
      nowyUzytkownik: false,
      rodzina,
      kopiaKonta,
      daneZus: { matka: kopiaMatki, 'drugi-rodzic': kopiaDrugiego },
      drugiRodzicZDanymi: kopiaDrugiego !== null,
      imiona: {
        matka: pesele.matka === konto.pesel ? imieINazwisko(konto) : imieINazwisko(stanMatki?.konto),
        'drugi-rodzic':
          pesele['drugi-rodzic'] === konto.pesel
            ? imieINazwisko(konto)
            : (imieINazwisko(drugi) ?? imieINazwisko(stanDrugiego?.konto)),
      },
      katalog,
      dzis,
    };
  }, [stanKonta, konto, rodzina, pesele, stanMatki, stanDrugiego, katalog, dzis]);
}
