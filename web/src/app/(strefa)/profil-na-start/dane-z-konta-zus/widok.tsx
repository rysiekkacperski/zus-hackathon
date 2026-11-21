'use client';

// Ekran zastępczy ViewProfileZusData z podstawowym działaniem (kontrakt 2.4). Właściciel: u07, części u03.
// Pokazuje części u03 (stan odczytu i sekcje kopii), surowy podgląd stanu odczytu i kopii Danych z konta
// ZUS zalogowanego konta, ponowienie odczytu i przejście do następnego widoku ścieżki.
import { useState } from 'react';
import { useStanKonta } from '@/dane/magazyn/hooki';
import { odczytajIObsluzDaneZus } from '@/dane/magazyn/operacje/sesja';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { Karta } from '@/komponenty/karta';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { Stos, Wiersz } from '@/komponenty/uklad';
import { tytulWidoku } from '@/komponenty/ekran-zastepczy';
import { teksty } from '@/teksty';
import { SekcjeDanychZus } from './_czesci/sekcje-danych-zus';
import { StanOdczytuDanychZus } from './_czesci/stan-odczytu-zus';

const tekst = teksty.wspolne.ekranZastepczy;

function SurowyPodglad({ etykieta, wartosc }: { etykieta: string; wartosc: unknown }) {
  return (
    <pre
      role="region"
      aria-label={etykieta}
      tabIndex={0}
      className="m-0 max-h-120 overflow-auto rounded-sm border border-line bg-surface-sunken p-4 text-small whitespace-pre"
    >
      {JSON.stringify(wartosc, null, 2)}
    </pre>
  );
}

export function WidokDanychZKontaZus() {
  const stanKonta = useStanKonta();
  const [odczytWToku, ustawOdczytWToku] = useState(false);
  const kopia = stanKonta?.kopiaDanychZus ?? null;

  const odczytajPonownie = async () => {
    if (!stanKonta) return;
    ustawOdczytWToku(true);
    try {
      await odczytajIObsluzDaneZus(stanKonta.konto.pesel, pobierzKontekstOperacji());
    } finally {
      ustawOdczytWToku(false);
    }
  };

  return (
    <>
      <NaglowekStrony tytul={teksty.ViewProfileZusData.naglowek} />
      <Stos odstep={7.5}>
        <Notatka>
          <p>{tekst.dzialajacy({ jednostka: 'u07' })}</p>
        </Notatka>
        {stanKonta ? <StanOdczytuDanychZus stan={stanKonta.stanOdczytuZus} kopia={kopia} /> : null}
        {kopia ? <SekcjeDanychZus kopia={kopia} /> : null}
        <Karta tytul={tekst.daneZus.stanOdczytu}>
          <SurowyPodglad etykieta={tekst.daneZus.podgladStanu} wartosc={stanKonta?.stanOdczytuZus ?? null} />
        </Karta>
        <Karta tytul={tekst.daneZus.kopia}>
          {kopia ? (
            <SurowyPodglad etykieta={tekst.daneZus.podgladKopii} wartosc={kopia} />
          ) : (
            <p className="m-0">{tekst.daneZus.brakKopii}</p>
          )}
        </Karta>
        <Wiersz odstep={4} className="flex-wrap">
          <PrzyciskLink href={sciezkaWidoku('ViewProfilePayer')} wariant="glowny" ikonaPo="w-prawo">
            {tekst.dalej({ tytul: tytulWidoku('ViewProfilePayer') })}
          </PrzyciskLink>
          <Przycisk wariant="drugorzedny" onClick={() => void odczytajPonownie()} zajety={odczytWToku} disabled={!stanKonta}>
            {tekst.daneZus.odczytajPonownie}
          </Przycisk>
        </Wiersz>
      </Stos>
    </>
  );
}
