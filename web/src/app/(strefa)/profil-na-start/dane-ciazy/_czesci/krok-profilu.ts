'use client';

// Część Profilu na start (u10): wspólna obsługa kroku kreatora dla ViewProfilePregnancy, ViewProfileEmploymentChange
// i ViewProfileFamily. Zapis szkicu przez `zapiszSzkic` (u07), kolejny i poprzedni ekran z `domena/profil/nawigacja` (u07),
// zapamiętanie ostatniego wyświetlonego ekranu i nawigacja z ładowaniem; powrót prowadzi do ostatniej części
// poprzedniego ekranu.
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDzis, useStanKonta } from '@/dane/magazyn/hooki';
import { zapiszSzkic, type ZmianaSzkicu } from '@/dane/magazyn/operacje/profil-szkic';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { czyMaZgode } from '@/domena/konto';
import { nastepnyEkran, poprzedniEkran } from '@/domena/profil/nawigacja';
import type { DaneRodzica, IdWidoku, KodKomunikatu, SzkicProfilu } from '@/domena/typy';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { sciezkaEkranuProfilu, sciezkaPowrotuProfilu } from '../../_czesci/trasy-profilu';

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

export function useKrokProfilu(ekran: IdWidoku) {
  const router = useRouter();
  const stanKonta = useStanKonta();
  const dzis = useDzis();
  const [bladZapisu, ustawBladZapisu] = useState<KodKomunikatu | null>(null);
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const szkic = stanKonta?.szkicProfilu ?? null;
  const zgoda = stanKonta ? czyMaZgode(stanKonta.konto.decyzjeOZgodzie) : false;
  const zDanymiZus = (stanKonta?.kopiaDanychZus ?? null) !== null;

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
    przejdz(sciezkaEkranuProfilu(nastepnyEkran(wynik.wartosc, zgoda), wynik.wartosc));
  }

  function sciezkaPowrotu(): string {
    if (szkic) return sciezkaPowrotuProfilu(poprzedniEkran({ ...szkic, ostatniEkran: ekran }, zgoda), szkic, zDanymiZus);
    return sciezkaPowrotuProfilu(POPRZEDNI_BEZ_SZKICU[ekran] ?? 'ViewProfileSituation', null, zDanymiZus);
  }

  function wroc() {
    przejdz(sciezkaPowrotu());
  }

  return {
    router,
    stanKonta,
    szkic,
    zgoda,
    zDanymiZus,
    dzis,
    bladZapisu,
    zajety,
    zapiszWTle,
    zapiszIPrzejdzDalej,
    sciezkaPowrotu,
    wroc,
  };
}
