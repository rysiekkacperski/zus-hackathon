'use client';

// ViewDemoNewAccount: założenie nowego konta bez danych w ZUS (Story 3.1.1.1.3, KA-07–KA-09,
// KA-13–KA-20; wzory P01-11, P01-12, P01-13). Błędy wszystkich pól pokazują się naraz przy polach,
// wpisane wartości zostają, a fokus przechodzi do pierwszego pola z błędem. Po założeniu konta
// system loguje użytkownika nowym kontem i otwiera ekran startowy (ViewGuideWelcome). Właściciel: u01.
import { useRouter } from 'next/navigation';
import { useRef, useState, type FormEvent } from 'react';
import { NaglowekDemo } from '@/app/(publiczne)/_czesci/naglowek-demo';
import { useLogowanieWToku } from '@/dane/magazyn/hooki';
import { losuj } from '@/dane/magazyn/losowanie';
import { zalozNoweKonto } from '@/dane/magazyn/operacje/konta-demo';
import { zalogujKontem } from '@/dane/magazyn/operacje/konto';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { POLA_NOWEGO_KONTA, type PoleNowegoKonta } from '@/domena/konto/nowe-konto';
import type { BledyPol, KodKomunikatu, Plec } from '@/domena/typy';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { Notatka } from '@/komponenty/notatka';
import { PoleTekstowe } from '@/komponenty/pole-tekstowe';
import { PoleWyboru } from '@/komponenty/pole-wyboru';
import { Przycisk } from '@/komponenty/przycisk';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoNewAccount;

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
  const router = useRouter();
  const logowanie = useLogowanieWToku();
  const formularz = useRef<HTMLFormElement>(null);
  const [imie, ustawImie] = useState('');
  const [nazwisko, ustawNazwisko] = useState('');
  const [dataUrodzenia, ustawDateUrodzenia] = useState('');
  const [plec, ustawPlec] = useState<Plec | ''>('');
  const [bledy, ustawBledy] = useState<BledyPol<PoleNowegoKonta>>({});
  const [bladOgolny, ustawBladOgolny] = useState<KodKomunikatu | null>(null);
  const [zajety, ustawZajety] = useState(false);

  const zaloz = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (zajety) return;
    const ctx = pobierzKontekstOperacji();
    const wynik = zalozNoweKonto({ imie, nazwisko, dataUrodzenia, plec: plec === '' ? null : plec }, losuj, ctx);
    if (!wynik.ok) {
      const bledyPol = (wynik.bledyPol ?? {}) as BledyPol<PoleNowegoKonta>;
      ustawBledy(bledyPol);
      const pierwsze = POLA_NOWEGO_KONTA.find((pole) => bledyPol[pole] !== undefined);
      ustawBladOgolny(pierwsze === undefined ? wynik.kod : null);
      if (pierwsze !== undefined) formularz.current?.querySelector<HTMLElement>(`#${idPol[pierwsze]}`)?.focus();
      return;
    }
    ustawBledy({});
    ustawBladOgolny(null);
    ustawZajety(true);
    const logowanieKontem = zalogujKontem(
      { pesel: wynik.wartosc.pesel, sposob: logowanie?.sposob ?? 'mobywatel', powrot: logowanie?.powrot },
      pobierzKontekstOperacji(),
    );
    if (!logowanieKontem.ok) {
      ustawZajety(false);
      ustawBladOgolny(logowanieKontem.kod);
      return;
    }
    router.push(logowanieKontem.wartosc.cel);
  };

  return (
    <>
      <NaglowekDemo flaga={tekst.flaga} tytul={tekst.naglowek} wstep={tekst.wstep} powrot={tekst.powrot} />
      {bladOgolny ? <Komunikat kod={bladOgolny} className="mb-7.5 max-w-190" /> : null}
      <Karta tytul={tekst.karta} bezLinii className="max-w-190">
        <form ref={formularz} noValidate onSubmit={zaloz}>
          <div className="flex max-w-login-column flex-col gap-6">
            <PoleTekstowe
              id={idPol.imie}
              nazwa="imie"
              etykieta={tekst.imie}
              wartosc={imie}
              onZmiana={ustawImie}
              blad={bledy.imie}
              maksDlugosc={40}
              autoComplete="off"
            />
            <PoleTekstowe
              id={idPol.nazwisko}
              nazwa="nazwisko"
              etykieta={tekst.nazwisko}
              wartosc={nazwisko}
              onZmiana={ustawNazwisko}
              blad={bledy.nazwisko}
              maksDlugosc={60}
              autoComplete="off"
            />
            <PoleTekstowe
              id={idPol.dataUrodzenia}
              nazwa="data-urodzenia"
              etykieta={tekst.dataUrodzenia}
              wartosc={dataUrodzenia}
              onZmiana={ustawDateUrodzenia}
              blad={bledy.dataUrodzenia}
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
              blad={bledy.plec}
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
