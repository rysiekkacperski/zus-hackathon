'use client';

// ViewDemoNewAccount: założenie nowego konta bez danych w ZUS (Story 3.1.1.1.3, KA-07–KA-09,
// KA-13–KA-20; wzory P01-11, P01-12, P01-13). Błąd pola pokazuje się po opuszczeniu pola, a po próbie
// założenia konta błędy wszystkich pól pokazują się naraz przy polach, wpisane wartości zostają, a fokus
// przechodzi do pierwszego pola z błędem. Po założeniu konta system loguje użytkownika nowym kontem
// i otwiera ekran startowy (ViewGuideWelcome). Właściciel: u01.
import { useState, type FormEvent } from 'react';
import { NaglowekDemo } from '@/app/(publiczne)/_czesci/naglowek-demo';
import { useDzis, useLogowanieWToku } from '@/dane/magazyn/hooki';
import { losuj } from '@/dane/magazyn/losowanie';
import { zalozNoweKonto } from '@/dane/magazyn/operacje/konta-demo';
import { zalogujKontem } from '@/dane/magazyn/operacje/konto';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { walidujNoweKonto, type DaneNowegoKonta, type PoleNowegoKonta } from '@/domena/konto/nowe-konto';
import type { BledyPol, KodKomunikatu, Plec } from '@/domena/typy';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { PoleTekstowe } from '@/komponenty/pole-tekstowe';
import { PoleWyboru } from '@/komponenty/pole-wyboru';
import { Przycisk } from '@/komponenty/przycisk';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoNewAccount;

// Kolejność pól na ekranie i cel fokusu pierwszego pola z błędem.
const idPol: Record<PoleNowegoKonta, string> = {
  imie: 'nk-imie',
  nazwisko: 'nk-nazwisko',
  dataUrodzenia: 'nk-data',
  plec: 'nk-plec',
};

const opcjePlci: { wartosc: Plec; etykieta: string }[] = [
  { wartosc: 'kobieta', etykieta: tekst.plcie.kobieta },
  { wartosc: 'mezczyzna', etykieta: tekst.plcie.mezczyzna },
];

export function WidokNowegoKonta() {
  const logowanie = useLogowanieWToku();
  const dzis = useDzis();
  const [imie, ustawImie] = useState('');
  const [nazwisko, ustawNazwisko] = useState('');
  const [dataUrodzenia, ustawDateUrodzenia] = useState('');
  const [plec, ustawPlec] = useState<Plec | ''>('');
  const [bladOgolny, ustawBladOgolny] = useState<KodKomunikatu | null>(null);
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();

  const dane: DaneNowegoKonta = { imie, nazwisko, dataUrodzenia, plec: plec === '' ? null : plec };
  const walidacja = useWalidacjaNaBiezaco({
    wartosci: dane,
    waliduj: (d: DaneNowegoKonta) => walidujNoweKonto(d, dzis),
    pola: idPol,
  });

  const zaloz = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (zajety) return;
    if (!walidacja.sprobujWyslac()) {
      ustawBladOgolny(null);
      return;
    }
    ustawZajety(true);
    const wynik = zalozNoweKonto(dane, losuj, pobierzKontekstOperacji());
    if (!wynik.ok) {
      ustawZajety(false);
      const bledyPol = (wynik.bledyPol ?? {}) as BledyPol<PoleNowegoKonta>;
      const zBledemPola = Object.keys(bledyPol).length > 0;
      if (zBledemPola) walidacja.pokazBledy(bledyPol);
      ustawBladOgolny(zBledemPola ? null : wynik.kod);
      return;
    }
    ustawBladOgolny(null);
    const logowanieKontem = zalogujKontem(
      { pesel: wynik.wartosc.pesel, sposob: logowanie?.sposob ?? 'mobywatel', powrot: logowanie?.powrot },
      pobierzKontekstOperacji(),
    );
    if (!logowanieKontem.ok) {
      ustawZajety(false);
      ustawBladOgolny(logowanieKontem.kod);
      return;
    }
    przejdz(logowanieKontem.wartosc.cel);
  };

  return (
    <>
      <NaglowekDemo flaga={tekst.flaga} tytul={tekst.naglowek} wstep={tekst.wstep} powrot={tekst.powrot} />
      {bladOgolny ? <Komunikat kod={bladOgolny} className="mb-7.5 max-w-190" /> : null}
      <Karta tytul={tekst.karta} bezLinii className="max-w-190">
        <form noValidate onSubmit={zaloz}>
          <div className="flex max-w-login-column flex-col gap-6">
            <PoleTekstowe
              id={idPol.imie}
              nazwa="imie"
              etykieta={tekst.imie}
              wartosc={imie}
              onZmiana={ustawImie}
              {...walidacja.pole('imie')}
              maksDlugosc={40}
              autoComplete="off"
            />
            <PoleTekstowe
              id={idPol.nazwisko}
              nazwa="nazwisko"
              etykieta={tekst.nazwisko}
              wartosc={nazwisko}
              onZmiana={ustawNazwisko}
              {...walidacja.pole('nazwisko')}
              maksDlugosc={60}
              autoComplete="off"
            />
            <PoleTekstowe
              id={idPol.dataUrodzenia}
              nazwa="data-urodzenia"
              etykieta={tekst.dataUrodzenia}
              wartosc={dataUrodzenia}
              onZmiana={ustawDateUrodzenia}
              {...walidacja.pole('dataUrodzenia')}
              maksDlugosc={10}
              placeholder={tekst.formatDaty}
              podpowiedz={teksty.wspolne.pola.podpowiedzDaty}
              inputMode="numeric"
              autoComplete="off"
            />
            <PoleWyboru<Plec>
              id={idPol.plec}
              nazwa="plec"
              etykieta={tekst.plec}
              opcje={opcjePlci}
              wartosc={plec}
              onZmiana={ustawPlec}
              pustaOpcja={tekst.wybierz}
              {...walidacja.pole('plec')}
            />
          </div>
          <Notatka className="mt-6">
            <p>{tekst.notatka}</p>
          </Notatka>
          <div className="mt-7.5 flex flex-wrap gap-4">
            <Przycisk type="submit" wariant="glowny" szerokosc="szeroka" zajety={zajety}>
              {tekst.zaloz}
            </Przycisk>
          </div>
        </form>
      </Karta>
    </>
  );
}
