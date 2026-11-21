'use client';

// Część Profilu na start (u10): wspólna obsługa kroku kreatora dla ViewProfilePregnancy, ViewProfileEmploymentChange
// i ViewProfileFamily. Zapis szkicu przez `zapiszSzkic` (u07), kolejny i poprzedni ekran z `domena/profil/nawigacja` (u07),
// zapamiętanie ostatniego wyświetlonego ekranu i fokus na pierwszym polu z błędem.
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDzis, useStanKonta } from '@/dane/magazyn/hooki';
import { zapiszSzkic, type ZmianaSzkicu } from '@/dane/magazyn/operacje/profil-szkic';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { czyMaZgode } from '@/domena/konto';
import { nastepnyEkran, poprzedniEkran } from '@/domena/profil/nawigacja';
import type { DaneRodzica, IdWidoku, KodKomunikatu, SzkicProfilu } from '@/domena/typy';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';

const POPRZEDNI_BEZ_SZKICU: Partial<Record<IdWidoku, IdWidoku>> = {
  ViewProfilePregnancy: 'ViewProfileSituation',
  ViewProfileEmploymentChange: 'ViewProfilePregnancy',
  ViewProfileFamily: 'ViewProfileEmploymentChange',
};

/** Dane matki w szkicu; pusty rekord, gdy szkic jeszcze ich nie ma. */
export function daneMatkiZeSzkicu(szkic: SzkicProfilu | null): DaneRodzica {
  return (
    szkic?.daneRodziny.matka ?? {
      formaZatrudnienia: null,
      dobrowolneChorobowe: null,
      platnikZasilku: null,
      potwierdzeniaSkladek: [],
    }
  );
}

/** Ustawia fokus na pierwszym polu z błędem według kolejności pól na ekranie. */
export function ustawFokusNaPierwszymBledzie<P extends string>(
  kolejnosc: readonly (readonly [P, string])[],
  bledy: Partial<Record<P, KodKomunikatu>>,
) {
  const pierwsze = kolejnosc.find(([pole]) => bledy[pole] !== undefined);
  if (pierwsze) document.getElementById(pierwsze[1])?.focus();
}

export function useKrokProfilu(ekran: IdWidoku) {
  const router = useRouter();
  const stanKonta = useStanKonta();
  const dzis = useDzis();
  const [bladZapisu, ustawBladZapisu] = useState<KodKomunikatu | null>(null);
  const [zajety, ustawZajety] = useState(false);
  const szkic = stanKonta?.szkicProfilu ?? null;
  const zgoda = stanKonta ? czyMaZgode(stanKonta.konto.decyzjeOZgodzie) : false;

  // Ostatni wyświetlony ekran szkicu: po ponownym otwarciu przewodnika rodzic wraca na ten ekran.
  const ostatniEkran = szkic?.ostatniEkran;
  const maSzkic = szkic !== null;
  useEffect(() => {
    if (maSzkic && ostatniEkran !== ekran) zapiszSzkic({}, ekran, pobierzKontekstOperacji());
  }, [maSzkic, ostatniEkran, ekran]);

  /** Zapis bez przejścia, np. gminy wybranej z podpowiedzi przed przejściem dalej. */
  function zapiszWTle(zmiana: ZmianaSzkicu) {
    if (maSzkic) zapiszSzkic(zmiana, ekran, pobierzKontekstOperacji());
  }

  /** Zapis odpowiedzi w szkicu i przejście do kolejnego ekranu; przy błędzie zapisu komunikat zostaje na ekranie. */
  function zapiszIPrzejdzDalej(zmiana: ZmianaSzkicu) {
    ustawZajety(true);
    const wynik = zapiszSzkic(zmiana, ekran, pobierzKontekstOperacji());
    if (!wynik.ok) {
      ustawBladZapisu(wynik.kod);
      ustawZajety(false);
      return;
    }
    ustawBladZapisu(null);
    router.push(sciezkaWidoku(nastepnyEkran(wynik.wartosc, zgoda)));
  }

  function sciezkaPowrotu(): string {
    if (szkic) return sciezkaWidoku(poprzedniEkran({ ...szkic, ostatniEkran: ekran }, zgoda));
    return sciezkaWidoku(POPRZEDNI_BEZ_SZKICU[ekran] ?? 'ViewProfileSituation');
  }

  function wroc() {
    router.push(sciezkaPowrotu());
  }

  return {
    router,
    stanKonta,
    szkic,
    zgoda,
    dzis,
    bladZapisu,
    zajety,
    zapiszWTle,
    zapiszIPrzejdzDalej,
    sciezkaPowrotu,
    wroc,
  };
}
