'use client';

// Pozycja listy kont na ViewDemoAccountPicker (wzory P02-01, P02-02 i Wybor-konta): imię i nazwisko,
// forma zatrudnienia, rola albo oznaczenie nowego konta, akcje „Zaloguj się”, „Symuluj zgłoszenie
// dziecka” i „Przywróć stan początkowy”. „Zaloguj się” pokazuje ładowanie do otwarcia ekranu startowego
// konta. Właściciel: u01.
import { useLogowanieWToku, useParametry, useStanSymulowanegoZus } from '@/dane/magazyn/hooki';
import { symulujZgloszenieDziecka } from '@/dane/magazyn/operacje/konta-demo';
import { przywrocStanPoczatkowy, zalogujKontem } from '@/dane/magazyn/operacje/konto';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import type { KodKomunikatu, KontoDemo } from '@/domena/typy';
import { formatujDate } from '@/komponenty/format';
import { Ikona } from '@/komponenty/ikona';
import { useKomunikatChwilowy } from '@/komponenty/komunikat-chwilowy';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { Przycisk } from '@/komponenty/przycisk';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoAccountPicker;
const opisyForm = tekst.opisyForm;

// ez-link jako przycisk: tekst pogrubiony w kolorze brand z ikoną 20 px.
const klasyPrzyciskuLinku =
  'inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-body-strong text-brand hover:text-brand-deep hover:underline';

function opisKonta(konto: KontoDemo): string {
  if (konto.rodzaj === 'konto-administratora') return tekst.rolaAdministrator;
  if (konto.rodzaj === 'nowe-konto') return tekst.oznaczenieNowegoKonta;
  return konto.kluczOpisuFormy ? opisyForm[konto.kluczOpisuFormy] : tekst.oznaczenieNowegoKonta;
}

export interface PozycjaKontaProps {
  konto: KontoDemo;
  onBlad: (kod: KodKomunikatu | null) => void;
}

export function PozycjaKonta({ konto, onBlad }: PozycjaKontaProps) {
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const logowanie = useLogowanieWToku();
  const parametry = useParametry();
  const stanZus = useStanSymulowanegoZus(konto.pesel);
  const { pokaz } = useKomunikatChwilowy();
  const imieINazwisko = `${konto.imie} ${konto.nazwisko}`;
  const administrator = konto.rodzaj === 'konto-administratora';
  const dziecko = stanZus?.dzieckoZSymulacji;
  const symulacjaDostepna = parametry.trybDemonstracyjny && !administrator && dziecko === undefined;

  const zaloguj = () => {
    if (zajety) return;
    ustawZajety(true);
    const wynik = zalogujKontem(
      { pesel: konto.pesel, sposob: logowanie?.sposob ?? 'mobywatel', powrot: logowanie?.powrot },
      pobierzKontekstOperacji(),
    );
    if (!wynik.ok) {
      ustawZajety(false);
      onBlad(wynik.kod);
      return;
    }
    onBlad(null);
    przejdz(wynik.wartosc.cel);
  };

  const symuluj = () => {
    const wynik = symulujZgloszenieDziecka(konto.pesel, pobierzKontekstOperacji());
    onBlad(wynik.ok ? null : wynik.kod);
  };

  const przywroc = () => {
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-[1_1_22.5rem]">
          <h3 className="m-0 text-tile-title text-ink-max">{imieINazwisko}</h3>
          <p className="m-0">{opisKonta(konto)}</p>
          {dziecko ? (
            <>
              <p role="status" className="mt-2 mb-0 flex items-start gap-2">
                <Ikona nazwa="sukces" rozmiar={20} className="mt-0.5 flex-none text-brand" />
                <span className="min-w-0">
                  <strong>{tekst.dzieckoDodane}</strong>{' '}
                  {tekst.opisDziecka({
                    imieINazwisko: `${dziecko.imie} ${dziecko.nazwisko}`,
                    data: formatujDate(dziecko.dataUrodzenia),
                    pesel: dziecko.pesel,
                  })}
                </span>
              </p>
              <p className="mt-1 mb-0">{tekst.podpowiedzSymulacji}</p>
            </>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Przycisk wariant="drugorzedny" zajety={zajety} onClick={zaloguj} aria-label={tekst.zalogujKonto({ imieINazwisko })}>
            {tekst.zaloguj}
          </Przycisk>
          {symulacjaDostepna ? (
            <Przycisk
              wariant="tlo"
              ikona="dodaj-osobe"
              onClick={symuluj}
              aria-label={tekst.symulujKonto({ imieINazwisko })}
            >
              {tekst.symuluj}
            </Przycisk>
          ) : null}
          {administrator ? null : (
            <button
              type="button"
              onClick={przywroc}
              aria-label={tekst.przywrocKonto({ imieINazwisko })}
              className={klasyPrzyciskuLinku}
            >
              <Ikona nazwa="cofnij" rozmiar={20} />
              {tekst.przywroc}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
