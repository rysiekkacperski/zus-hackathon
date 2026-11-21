'use client';

// Wyliczenia z zaświadczeń e-ZLA zalogowanego konta (ANALIZY/16 R4–R9), wspólne dla ViewSickLeaveList,
// bloku e-ZLA na ViewFamilyPlan i sekcji e-ZLA na ViewCaseDetails. Właściciel: u14.
import { useMemo } from 'react';
import { useDzis, useKatalog, useParametry, useRodzina, useStanKonta } from '@/dane/magazyn/hooki';
import { osobyRodziny } from '@/dane/magazyn/stan';
import {
  profilZKopii,
  wyliczeniaEzla,
  type ProfilUbezpieczenia,
  type WyliczeniaEzla,
} from '@/domena/zasilki/okres-zasilkowy';
import type { DaneRodzica, DaneZKontaZus, DataISO, DrugiRodzic, KontoPrzewodnika, StanRodziny } from '@/domena/typy';

/** Dane rodzica w profilu rodziny, który odpowiada zalogowanemu kontu. */
export function daneRodzicaKonta(konto: KontoPrzewodnika, rodzina: StanRodziny | null): DaneRodzica | DrugiRodzic | null {
  if (!rodzina) return null;
  const osoby = osobyRodziny(rodzina.daneRodziny);
  if (osoby.peselMatki === konto.pesel) return rodzina.daneRodziny.matka;
  if (osoby.peselDrugiegoRodzica === konto.pesel) return rodzina.daneRodziny.drugiRodzic;
  return rodzina.daneRodziny.rodzicKonta === 'matka' ? rodzina.daneRodziny.matka : rodzina.daneRodziny.drugiRodzic;
}

/** Forma zatrudnienia i ubezpieczenie chorobowe konta: z profilu rodziny, a bez niego z Danych z konta ZUS. */
export function profilUbezpieczeniaKonta(
  konto: KontoPrzewodnika,
  rodzina: StanRodziny | null,
  kopia: DaneZKontaZus | null,
  dzis: DataISO,
): ProfilUbezpieczenia {
  const dane = daneRodzicaKonta(konto, rodzina);
  const forma = dane?.formaZatrudnienia?.wartosc;
  const zKopii = profilZKopii(kopia, dzis);
  if (!forma || forma === 'brak-drugiego-rodzica') return zKopii;
  if (forma === 'umowa-o-prace') return { forma, chorobowe: true };
  if (forma === 'brak-tytulu') return { forma, chorobowe: false };
  const dobrowolne = dane?.dobrowolneChorobowe?.wartosc;
  return { forma, chorobowe: dobrowolne ?? (zKopii.forma === forma ? zKopii.chorobowe : null) };
}

export interface WyliczeniaKonta {
  konto: KontoPrzewodnika;
  kopia: DaneZKontaZus | null;
  rodzina: StanRodziny | null;
  profil: ProfilUbezpieczenia;
  wyliczenia: WyliczeniaEzla | null;
}

/** Wyliczenia e-ZLA zalogowanego konta z jego kopii Danych z konta ZUS. */
export function useWyliczeniaEzlaKonta(): WyliczeniaKonta | null {
  const stanKonta = useStanKonta();
  const rodzina = useRodzina();
  const katalog = useKatalog();
  const parametry = useParametry();
  const dzis = useDzis();

  return useMemo(() => {
    if (!stanKonta) return null;
    const konto = stanKonta.konto;
    const kopia = stanKonta.kopiaDanychZus;
    const profil = profilUbezpieczeniaKonta(konto, rodzina, kopia, dzis);
    const wyliczenia = kopia
      ? wyliczeniaEzla({
          zaswiadczenia: kopia.zaswiadczeniaEzla,
          pesel: konto.pesel,
          profil,
          katalog,
          dzis,
          progOstrzezenia: parametry.progOstrzezeniaOkresuZasilkowegoDni,
        })
      : null;
    return { konto, kopia, rodzina, profil, wyliczenia };
  }, [stanKonta, rodzina, katalog, parametry.progOstrzezeniaOkresuZasilkowegoDni, dzis]);
}
