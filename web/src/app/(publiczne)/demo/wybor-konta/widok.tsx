'use client';

// Ekran zastępczy ViewDemoAccountPicker z podstawowym działaniem (kontrakt 2.4 i 3.5). Właściciel: u01.
// Lista kont przykładowych i nowych kont z akcjami „Zaloguj się” (zalogujKontem ze sposobem z logowania
// w toku) i „Przywróć stan początkowy” (przywrocStanPoczatkowy).
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useKontaDemo, useLogowanieWToku, useStanKontaWTrybieDemo } from '@/dane/magazyn/hooki';
import { przywrocStanPoczatkowy, zalogujKontem } from '@/dane/magazyn/operacje/konto';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import type { KodKomunikatu, KontoDemo } from '@/domena/typy';
import { FlagaDemo } from '@/komponenty/flaga-demo';
import { Komunikat } from '@/komponenty/komunikat';
import { useKomunikatChwilowy } from '@/komponenty/komunikat-chwilowy';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { Przycisk } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { Tabela } from '@/komponenty/tabela';
import { Stos, Wiersz } from '@/komponenty/uklad';
import { teksty } from '@/teksty';

const tekst = teksty.wspolne.ekranZastepczy.wyborKonta;

type Kolumna = 'konto' | 'opis' | 'stan' | 'akcje';

function opisKonta(konto: KontoDemo): string {
  return konto.kluczOpisuFormy ? tekst.opisyForm[konto.kluczOpisuFormy] : tekst.rodzajeKont[konto.rodzaj];
}

function StanKontaDemo({ konto }: { konto: KontoDemo }) {
  const stan = useStanKontaWTrybieDemo(konto.pesel);
  return <>{stan ? teksty.rama.etykietyRol[stan.konto.rola] : tekst.pierwszeLogowanie}</>;
}

function AkcjeKontaDemo({ konto, onBlad }: { konto: KontoDemo; onBlad: (kod: KodKomunikatu | null) => void }) {
  const router = useRouter();
  const logowanie = useLogowanieWToku();
  const { pokaz } = useKomunikatChwilowy();
  const imieINazwisko = `${konto.imie} ${konto.nazwisko}`;

  const zaloguj = () => {
    const wynik = zalogujKontem(
      { pesel: konto.pesel, sposob: logowanie?.sposob ?? 'mobywatel', powrot: logowanie?.powrot },
      pobierzKontekstOperacji(),
    );
    if (!wynik.ok) {
      onBlad(wynik.kod);
      return;
    }
    onBlad(null);
    router.push(wynik.wartosc.cel);
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
    <Wiersz odstep={3} className="flex-wrap">
      <Przycisk wariant="glowny" onClick={zaloguj} aria-label={tekst.zalogujKonto({ imieINazwisko })}>
        {tekst.zaloguj}
      </Przycisk>
      {konto.rodzaj === 'konto-administratora' ? null : (
        <Przycisk wariant="drugorzedny" onClick={przywroc} aria-label={tekst.przywrocKonto({ imieINazwisko })}>
          {tekst.przywroc}
        </Przycisk>
      )}
    </Wiersz>
  );
}

export function WidokWyboruKonta() {
  const konta = useKontaDemo();
  const [blad, ustawBlad] = useState<KodKomunikatu | null>(null);

  return (
    <>
      <NaglowekStrony tytul={teksty.ViewDemoAccountPicker.naglowek} wstep={tekst.wstep} akcje={<FlagaDemo />} />
      <Stos odstep={6}>
        <Notatka>
          <p>{teksty.wspolne.ekranZastepczy.dzialajacy({ jednostka: 'u01' })}</p>
        </Notatka>
        {blad ? <Komunikat kod={blad} /> : null}
        <Tabela<Kolumna>
          podpis={tekst.podpis}
          etykietaPrzewijania={tekst.przewijanie}
          kolumny={[
            { klucz: 'konto', naglowek: tekst.kolumny.konto, tytulowa: true },
            { klucz: 'opis', naglowek: tekst.kolumny.opis },
            { klucz: 'stan', naglowek: tekst.kolumny.stan },
            { klucz: 'akcje', naglowek: tekst.kolumny.akcje },
          ]}
          wiersze={konta.map((konto) => ({
            id: konto.pesel,
            konto: `${konto.imie} ${konto.nazwisko}`,
            opis: opisKonta(konto),
            stan: <StanKontaDemo konto={konto} />,
            akcje: <AkcjeKontaDemo konto={konto} onBlad={ustawBlad} />,
          }))}
        />
        <Wiersz odstep={6} className="flex-wrap">
          <Odnosnik href={sciezkaWidoku('ViewDemoNewAccount')} ikonaPo="w-prawo">
            {tekst.noweKonto}
          </Odnosnik>
          <Odnosnik href={sciezkaWidoku('ViewDemoSettings')} ikonaPo="w-prawo">
            {tekst.ustawieniaDemo}
          </Odnosnik>
        </Wiersz>
      </Stos>
    </>
  );
}
