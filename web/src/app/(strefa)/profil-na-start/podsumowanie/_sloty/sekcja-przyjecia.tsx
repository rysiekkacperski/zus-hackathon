'use client';

// Slot ViewProfileSummary „sekcja-przyjecia” w liście slotyPodsumowania (kontrakt, sekcja 12.4). Właściciel: u24.
// Wzory P21-08 (sekcja danych przyjęcia w miejscu danych ciąży) i P21-09 (konto bez zgody, komunikat 0004).
// Teksty: teksty.ViewProfileSummary.sekcjaPrzyjecia.
import { useState } from 'react';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji, type PozycjaListyDefinicji } from '@/komponenty/lista-definicji';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { Stos } from '@/komponenty/uklad';
import { czyMaZgode } from '@/domena/konto/zgoda';
import { formatujDate } from '@/domena/daty';
import type { DataISO, PrzyjecieDziecka } from '@/domena/typy';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewProfileSummary.sekcjaPrzyjecia;

function zmianaDaty(biezaca: DataISO | undefined, poprzednia: DataISO | undefined, porownuj: boolean): string | undefined {
  if (!porownuj || biezaca === poprzednia) return undefined;
  return t.zmienionoPoprzednio({ wartosc: poprzednia ? formatujDate(poprzednia) : t.niePodano });
}

function pozycjePrzyjecia(p: PrzyjecieDziecka, zapisane: PrzyjecieDziecka | undefined, porownuj: boolean): PozycjaListyDefinicji[] {
  const pozycje: PozycjaListyDefinicji[] = [
    { etykieta: t.kimJestes, wartosc: t.role[p.rolaRodzicaPrzyjmujacego] },
    { etykieta: t.formaPrzyjecia, wartosc: t.formy[p.forma] },
    {
      etykieta: t.dataPrzyjecia,
      wartosc: formatujDate(p.dataPrzyjecia),
      zrodlo: zmianaDaty(p.dataPrzyjecia, zapisane?.dataPrzyjecia, porownuj),
    },
    {
      etykieta: t.dataUrodzenia,
      wartosc: formatujDate(p.dataUrodzeniaDziecka),
      zrodlo: zmianaDaty(p.dataUrodzeniaDziecka, zapisane?.dataUrodzeniaDziecka, porownuj),
    },
    { etykieta: t.liczbaDzieci, wartosc: t.liczby[p.liczbaPrzyjetychDzieci] },
  ];
  if (p.forma === 'rodzina-zastepcza-niezawodowa') {
    pozycje.push({ etykieta: t.odroczenie, wartosc: p.odroczenieObowiazkuSzkolnego ? t.tak : t.nie });
  }
  if (p.forma === 'przysposobienie') {
    pozycje.push({
      etykieta: t.dataUprawomocnienia,
      wartosc: p.dataUprawomocnienia ? formatujDate(p.dataUprawomocnienia) : t.niePodano,
      zrodlo: zmianaDaty(p.dataUprawomocnienia, zapisane?.dataUprawomocnienia, porownuj),
    });
  }
  return pozycje;
}

export function SlotSekcjaPrzyjecia({ konto, szkic, kontekst }: PropsSlotu<'sekcja'>) {
  const [brakZgodyPokazany, ustawBrakZgodyPokazany] = useState(false);
  const zgoda = czyMaZgode(konto.decyzjeOZgodzie);
  const zapisaneCiaza = kontekst?.rodzina.daneCiazy ?? null;
  const zapisane = zapisaneCiaza?.przyjecie;
  const przyjecie = szkic ? szkic.daneCiazy.przyjecie : zapisane;
  const porodPotwierdzony = (szkic ? szkic.daneCiazy.dataPoroduPotwierdzona : zapisaneCiaza?.dataPoroduPotwierdzona) === true;
  const adresZmiany = trasy.ViewProfileChildAdoption({ powrot: 'podsumowanie' });

  if (!zgoda) {
    return (
      <Stos odstep={7.5}>
        {brakZgodyPokazany ? <Komunikat kod="0004" /> : null}
        <Karta tytul={t.bezDanych.tytul} bezLinii>
          <p className="mt-0 mb-6">{t.bezDanych.opis}</p>
          <Przycisk wariant="drugorzedny" onClick={() => ustawBrakZgodyPokazany(true)}>
            {t.bezDanych.podaj}
          </Przycisk>
        </Karta>
        <Karta tytul={t.zgoda.tytul} bezLinii>
          <p className="mt-0 mb-4">{t.zgoda.opis}</p>
          <p className="mt-0 mb-6">{t.zgoda.ustawienia}</p>
          <PrzyciskLink href={trasy.ViewGuideSettings()} wariant="drugorzedny" szerokosc="pelna">
            {t.zgoda.przejdz}
          </PrzyciskLink>
        </Karta>
      </Stos>
    );
  }

  if (przyjecie !== undefined) {
    const porownuj = szkic !== null && szkic.kontekst === 'zmiana-profilu' && zapisane !== undefined;
    return (
      <Karta
        tytul={t.tytul}
        bezLinii
        akcje={
          <Odnosnik href={adresZmiany} aria-label={t.zmienEtykieta}>
            {t.zmien}
          </Odnosnik>
        }
      >
        <ListaDefinicji pozycje={pozycjePrzyjecia(przyjecie, zapisane, porownuj)} />
        {szkic !== null ? (
          <Notatka className="mt-6">
            <span className="block font-semibold">{t.planOdDniaPrzyjecia.tytul}</span>
            <span className="block">{t.planOdDniaPrzyjecia.sciezka}</span>
            <span className="block">{t.planOdDniaPrzyjecia.przeliczenie({ data: formatujDate(przyjecie.dataPrzyjecia) })}</span>
          </Notatka>
        ) : null}
      </Karta>
    );
  }

  if (porodPotwierdzony) return null;

  return (
    <Karta tytul={t.akcjaPrzyjecia.tytul} bezLinii>
      <p className="mt-0 mb-6">{t.akcjaPrzyjecia.opis}</p>
      <PrzyciskLink href={adresZmiany} wariant="drugorzedny">
        {t.akcjaPrzyjecia.podaj}
      </PrzyciskLink>
    </Karta>
  );
}
