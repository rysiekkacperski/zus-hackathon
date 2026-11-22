'use client';

// Dane, z których korzystają ViewCalcMaternityInput i ViewCalcMaternityResult (u15): konto, rodzina, kopie danych ZUS
// obojga rodziców i imiona do nagłówków sekcji („Matka – Anna Nowak”). W trybie gościa kontekst nie ma konta,
// rodziny ani danych ZUS, a kalkulator liczy wyłącznie na wartościach wpisanych w kalkulatorze i z przykładowej sprawy.
import { useMemo } from 'react';
import {
  useCzyGosc,
  useDzis,
  useKatalog,
  useRodzina,
  useStanKonta,
  useStanKontaOsoby,
  useWlascicielDanych,
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
  // Zalogowane konto; null w trybie gościa.
  konto: KontoPrzewodnika | null;
  gosc: boolean;
  // Klucz stanu roboczego: PESEL konta albo 'gosc:<id>'; null dla gościa przed pierwszym zapisem.
  idWlasciciela: string | null;
  // Identyfikator gościa, którego stan przeniosło logowanie w tej karcie (WlascicielDanych.zGoscia).
  zGoscia?: string;
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
  const gosc = useCzyGosc();
  const wlasciciel = useWlascicielDanych();
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
    if (gosc) {
      return {
        konto: null,
        gosc: true,
        idWlasciciela: wlasciciel?.rodzaj === 'gosc' ? wlasciciel.id : null,
        nowyUzytkownik: true,
        rodzina: null,
        kopiaKonta: null,
        daneZus: { matka: null, 'drugi-rodzic': null },
        drugiRodzicZDanymi: false,
        imiona: {},
        katalog,
        dzis,
      };
    }
    if (stanKonta === null || konto === null) return null;
    const kopiaKonta = stanKonta.kopiaDanychZus;
    const zKonta = {
      konto,
      gosc: false,
      idWlasciciela: konto.pesel,
      ...(wlasciciel?.rodzaj === 'konto' && wlasciciel.id === konto.pesel && wlasciciel.zGoscia
        ? { zGoscia: wlasciciel.zGoscia }
        : {}),
    };
    if (rodzina === null) {
      const kobieta = plecZPesel(konto.pesel) === 'kobieta';
      const imie = imieINazwisko(konto);
      return {
        ...zKonta,
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
      ...zKonta,
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
  }, [gosc, wlasciciel, stanKonta, konto, rodzina, pesele, stanMatki, stanDrugiego, katalog, dzis]);
}
