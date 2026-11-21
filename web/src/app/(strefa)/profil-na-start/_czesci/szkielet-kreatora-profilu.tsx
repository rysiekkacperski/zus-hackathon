'use client';

// Część Profilu na start: wspólny szkielet kreatora (kontrakt 11.2, u07: postęp, lista kroków, przyciski).
// Gospodarze: ekrany kreatora profilu u07, u10, u11, u19 (tryb profilu) i u24. Widok kroku renderuje nad
// szkieletem NaglowekStrony (albo NaglowekKreatoraProfilu), a w szkielecie swoje karty z polami; walidację
// i zapis szkicu wykonuje w onDalej. Szkielet pokazuje „Krok N z 7”, kartę „Kroki profilu” ze stanem kroków
// i przyciski Wróć i Przejdź dalej (wzory cz1/P03-*), a przy montowaniu zapisuje ekran jako ostatni
// wyświetlony ekran szkicu (wznowienie po ponownym otwarciu przewodnika).
import { useEffect, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStanKonta } from '@/dane/magazyn/hooki';
import { zapiszOstatniEkran } from '@/dane/magazyn/operacje/profil-szkic';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { czyMaZgode } from '@/domena/konto';
import { krokEkranu, krokiProfilu } from '@/domena/profil/nawigacja';
import type { IdWidoku, SzkicProfilu } from '@/domena/typy';
import { KrokiKreatora, PostepKreatora } from '@/komponenty/kroki';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Przycisk } from '@/komponenty/przycisk';
import { KolumnaBoczna, KolumnaTresci, Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';

const tekst = teksty.ViewProfileZusData.kreator;

export interface SzkieletKreatoraProfiluProps {
  /** Bieżący ekran kreatora, jeden z `EKRANY_PROFILU`. */
  biezacy: IdWidoku;
  /** Treść kroku: pola formularza i komunikaty kroku. */
  children: ReactNode;
  /** Przejście dalej po walidacji i zapisie szkicu; bez propsa przycisk nie występuje. */
  onDalej?: () => void;
  /** Powrót do poprzedniego ekranu; bez propsa przycisk nie występuje. */
  onWroc?: () => void;
  /** Etykieta przycisku dalej, domyślnie `teksty.wspolne.przyciski.dalej`. */
  etykietaDalej?: string;
  /** Blokada przycisków w trakcie zapisu. */
  zajety?: boolean;
  /** Komunikat strony między paskiem postępu a kolumnami (np. 0001, 0004). */
  komunikat?: ReactNode;
  /** Notatki pod listą kroków; domyślnie notatka o zapamiętywaniu odpowiedzi. */
  notatkiKrokow?: ReactNode;
  /** Bez zapisu ekranu jako ostatniego wyświetlonego ekranu szkicu. */
  bezZapisuEkranu?: boolean;
}

/** Nagłówek ekranów kreatora: tytuł „Profil na start” i wstęp ze wzorów, bez linku powrotu. */
export function NaglowekKreatoraProfilu({ tytul, wstep }: { tytul?: string; wstep?: ReactNode }) {
  return (
    <NaglowekStrony
      tytul={tytul ?? teksty.ViewProfileZusData.naglowek}
      wstep={wstep ?? tekst.wstep}
      powrot={false}
    />
  );
}

/** Domyślna notatka pod listą kroków profilu. */
export function NotatkaZapamietywania() {
  return (
    <Notatka>
      <p className="m-0">{tekst.notatkaZapamietywania}</p>
    </Notatka>
  );
}

const SZKIC_PUSTY: SzkicProfilu = {
  kontekst: 'start',
  powrotNaPodsumowanie: false,
  ostatniEkran: 'ViewProfileZusData',
  daneRodziny: {},
  daneCiazy: {},
  zmienionePola: [],
  utworzono: '',
  zaktualizowano: '',
};

export function SzkieletKreatoraProfilu({
  biezacy,
  children,
  onDalej,
  onWroc,
  etykietaDalej,
  zajety,
  komunikat,
  notatkiKrokow,
  bezZapisuEkranu,
}: SzkieletKreatoraProfiluProps) {
  const stanKonta = useStanKonta();
  const parametry = useSearchParams();
  const powrotNaPodsumowanie = parametry.get('powrot') === 'podsumowanie' ? true : undefined;
  const szkic = stanKonta?.szkicProfilu ?? null;
  const zgoda = stanKonta ? czyMaZgode(stanKonta.konto.decyzjeOZgodzie) : false;
  const zmianaProfilu = szkic?.kontekst === 'zmiana-profilu';

  useEffect(() => {
    if (bezZapisuEkranu) return;
    zapiszOstatniEkran(biezacy, pobierzKontekstOperacji(), powrotNaPodsumowanie);
  }, [biezacy, bezZapisuEkranu, powrotNaPodsumowanie]);

  const krok = krokEkranu(szkic, biezacy);
  const kroki = krokiProfilu(szkic ?? SZKIC_PUSTY, zgoda, biezacy);
  const idPostepu = `postep-${biezacy}`;

  return (
    <Stos odstep={7.5} id={`kreator-${biezacy}`}>
      {zmianaProfilu ? null : (
        <PostepKreatora id={idPostepu} krok={krok.numer} liczbaKrokow={krok.liczba} nazwaKroku={krok.nazwa} />
      )}
      {komunikat ?? null}
      <div className="flex max-w-tresc flex-wrap items-start gap-7.5">
        <KolumnaTresci>
          {children}
          {onDalej || onWroc ? (
            <div className="flex min-w-0 flex-wrap justify-between gap-4">
              {onWroc ? (
                <Przycisk wariant="drugorzedny" onClick={onWroc} disabled={zajety}>
                  {teksty.wspolne.przyciski.wroc}
                </Przycisk>
              ) : (
                <span aria-hidden="true" />
              )}
              {onDalej ? (
                <Przycisk wariant="glowny" onClick={onDalej} zajety={zajety}>
                  {etykietaDalej ?? teksty.wspolne.przyciski.dalej}
                </Przycisk>
              ) : null}
            </div>
          ) : null}
        </KolumnaTresci>
        <KolumnaBoczna etykieta={tekst.krokiTytul}>
          <KrokiKreatora
            tytul={tekst.krokiTytul}
            kroki={kroki}
            notatka={<div className="flex flex-col gap-4">{notatkiKrokow ?? <NotatkaZapamietywania />}</div>}
          />
        </KolumnaBoczna>
      </div>
    </Stos>
  );
}
