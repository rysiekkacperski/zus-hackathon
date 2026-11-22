'use client';

// Pozycja listy kont na ViewDemoAccountPicker (wzory P02-01, P02-02 i Wybor-konta): imię i nazwisko,
// forma zatrudnienia, rola albo oznaczenie nowego konta, akcje „Zaloguj się”, „Symuluj uzupełnienie
// profilu” i „Przywróć stan początkowy”. Symulacja jest dostępna w trybie demonstracyjnym dla każdego konta
// rodzica: zapisuje profil rodziny z danymi przykładowymi, loguje kontem i otwiera plan rodziny w etapie Ciąża.
// „Przywróć stan początkowy” otwiera okno potwierdzenia, bo operacji nie da się cofnąć. „Zaloguj się”
// i symulacja pokazują ładowanie do otwarcia docelowego ekranu. Właściciel: u01.
import { useState } from 'react';
import { useLogowanieWToku } from '@/dane/magazyn/hooki';
import { przywrocStanPoczatkowy, zalogujKontem } from '@/dane/magazyn/operacje/konto';
import { symulujUzupelnienieProfilu } from '@/dane/magazyn/operacje/profil-demo';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import type { KodKomunikatu, KontoDemo } from '@/domena/typy';
import { Ikona } from '@/komponenty/ikona';
import { useKomunikatChwilowy } from '@/komponenty/komunikat-chwilowy';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { OknoModalne } from '@/komponenty/okno';
import { Przycisk } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoAccountPicker;
const opisyForm = tekst.opisyForm;

// ez-link jako przycisk: akcja pomocnicza pod danymi konta, tekst pogrubiony 14/20 w kolorze brand z ikoną 16 px.
const klasyPrzyciskuLinku =
  'inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-small-strong text-brand hover:text-brand-deep hover:underline';

function opisKonta(konto: KontoDemo): string {
  if (konto.rodzaj === 'konto-administratora') return tekst.rolaAdministrator;
  if (konto.rodzaj === 'nowe-konto') return tekst.oznaczenieNowegoKonta;
  return konto.kluczOpisuFormy ? opisyForm[konto.kluczOpisuFormy] : tekst.oznaczenieNowegoKonta;
}

export interface PozycjaKontaProps {
  konto: KontoDemo;
  /** Tryb demonstracyjny włączony: konto rodzica dostaje akcję symulacji uzupełnienia profilu. */
  symulacja: boolean;
  onBlad: (kod: KodKomunikatu | null) => void;
}

export function PozycjaKonta({ konto, symulacja, onBlad }: PozycjaKontaProps) {
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const symulowanie = useNawigacjaZLadowaniem();
  const logowanie = useLogowanieWToku();
  const { pokaz } = useKomunikatChwilowy();
  const imieINazwisko = `${konto.imie} ${konto.nazwisko}`;
  const administrator = konto.rodzaj === 'konto-administratora';
  const symulacjaDostepna = symulacja && !administrator;
  const [potwierdzanie, ustawPotwierdzanie] = useState(false);

  const zaloguj = (cel?: string) => {
    const wynik = zalogujKontem(
      { pesel: konto.pesel, sposob: logowanie?.sposob ?? 'mobywatel', powrot: cel === undefined ? logowanie?.powrot : undefined },
      pobierzKontekstOperacji(),
    );
    if (!wynik.ok) {
      onBlad(wynik.kod);
      return null;
    }
    onBlad(null);
    return cel ?? wynik.wartosc.cel;
  };

  const zalogujINastepnie = () => {
    if (zajety || symulowanie.zajety) return;
    ustawZajety(true);
    const cel = zaloguj();
    if (cel === null) {
      ustawZajety(false);
      return;
    }
    przejdz(cel);
  };

  // Symulacja zapisuje profil z danymi przykładowymi, loguje kontem i otwiera plan rodziny w etapie Ciąża.
  const symuluj = () => {
    if (zajety || symulowanie.zajety) return;
    symulowanie.ustawZajety(true);
    const wynik = symulujUzupelnienieProfilu(konto.pesel, pobierzKontekstOperacji());
    if (!wynik.ok) {
      symulowanie.ustawZajety(false);
      onBlad(wynik.kod);
      return;
    }
    const cel = zaloguj(sciezkaWidoku('ViewFamilyPlan'));
    if (cel === null) {
      symulowanie.ustawZajety(false);
      return;
    }
    symulowanie.przejdz(cel);
  };

  const przywroc = () => {
    ustawPotwierdzanie(false);
    const wynik = przywrocStanPoczatkowy(konto.pesel, pobierzKontekstOperacji());
    if (!wynik.ok) {
      onBlad(wynik.kod);
      return;
    }
    onBlad(null);
    pokaz(tekst.przywrocono({ imieINazwisko }));
  };

  return (
    <li className="border-b border-line-row py-4">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 flex-[1_1_18rem]">
          <h3 className="m-0 text-tile-title text-ink-max">{imieINazwisko}</h3>
          <p className="m-0">{opisKonta(konto)}</p>
          {symulacjaDostepna || !administrator ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
              {symulacjaDostepna ? (
                <button
                  type="button"
                  onClick={symuluj}
                  disabled={symulowanie.zajety}
                  aria-busy={symulowanie.zajety || undefined}
                  aria-label={tekst.symulujKonto({ imieINazwisko })}
                  className={klasyPrzyciskuLinku}
                >
                  {symulowanie.zajety ? (
                    <Ikona nazwa="ladowanie" rozmiar={16} className="motion-safe:animate-spin" />
                  ) : (
                    <Ikona nazwa="dodaj-osobe" rozmiar={16} />
                  )}
                  {tekst.symuluj}
                </button>
              ) : null}
              {administrator ? null : (
                <button
                  type="button"
                  onClick={() => ustawPotwierdzanie(true)}
                  aria-haspopup="dialog"
                  aria-label={tekst.przywrocKonto({ imieINazwisko })}
                  className={klasyPrzyciskuLinku}
                >
                  <Ikona nazwa="cofnij" rozmiar={16} />
                  {tekst.przywroc}
                </button>
              )}
            </div>
          ) : null}
        </div>
        <Przycisk
          wariant="drugorzedny"
          ikona="konto"
          zajety={zajety}
          onClick={zalogujINastepnie}
          aria-label={tekst.zalogujKonto({ imieINazwisko })}
        >
          {tekst.zaloguj}
        </Przycisk>
      </div>
      {administrator ? null : (
        <OknoModalne
          otwarte={potwierdzanie}
          onZamknij={() => ustawPotwierdzanie(false)}
          tytul={tekst.oknoPrzywracania.tytul}
          etykietaZamkniecia={tekst.oknoPrzywracania.zamknij}
          stopka={
            <div className="flex flex-wrap items-center gap-4">
              <Przycisk wariant="glowny" onClick={przywroc}>
                {tekst.oknoPrzywracania.potwierdz}
              </Przycisk>
              <Przycisk wariant="drugorzedny" onClick={() => ustawPotwierdzanie(false)}>
                {tekst.oknoPrzywracania.anuluj}
              </Przycisk>
            </div>
          }
        >
          <p className="m-0">{tekst.oknoPrzywracania.opis({ imieINazwisko })}</p>
        </OknoModalne>
      )}
    </li>
  );
}
