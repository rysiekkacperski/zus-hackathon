'use client';

// Część ViewProfileZusData: stan odczytu Danych z konta ZUS (kontrakt 11.2, u03): odczyt w toku (wzór P02-03),
// komunikat 0001 z ponowieniem odczytu (P02-11), komunikat 0002 z datą kopii (P02-10). Gospodarz: widok
// ViewProfileZusData (u07). Teksty: teksty.ViewProfileZusData.stanOdczytuZus.
//
// Gospodarz renderuje tę część pod nagłówkiem strony, a sekcje danych (SekcjeDanychZus) wyłącznie wtedy, gdy
// czyPokazacSekcjeDanychZus(stan, kopia) zwraca prawdę. Wstęp nagłówka strony daje wstepNaglowkaDanychZus.
import { useEffect, useState } from 'react';
import { useStanKonta } from '@/dane/magazyn/hooki';
import { czyOdczytDanychZusWToku } from '@/dane/magazyn/operacje/odczyt-zus';
import { odczytajIObsluzDaneZus } from '@/dane/magazyn/operacje/sesja';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { CZESCI_ODCZYTU, type CzescOdczytu } from '@/domena/dane-zus/odczyt';
import type { DaneZKontaZus, StanOdczytuZus } from '@/domena/typy';
import { formatujDate, formatujDateICzas } from '@/komponenty/format';
import { Ikona, type NazwaIkony } from '@/komponenty/ikona';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { Notatka } from '@/komponenty/notatka';
import { Postep } from '@/komponenty/postep';
import { Przycisk } from '@/komponenty/przycisk';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';

const tekst = teksty.ViewProfileZusData.stanOdczytuZus;

export interface StanOdczytuDanychZusProps {
  stan: StanOdczytuZus;
  kopia: DaneZKontaZus | null;
}

/** Czy gospodarz pokazuje sekcje danych: kopia istnieje, a odczyt nie trwa. */
export function czyPokazacSekcjeDanychZus(stan: StanOdczytuZus, kopia: DaneZKontaZus | null): kopia is DaneZKontaZus {
  return kopia !== null && stan.stan !== 'trwa';
}

/** Wstęp nagłówka strony: „Stan na” z datą i godziną kopii albo zdanie wstępne, gdy kopii brak albo odczyt trwa. */
export function wstepNaglowkaDanychZus(stan: StanOdczytuZus, kopia: DaneZKontaZus | null): string {
  return czyPokazacSekcjeDanychZus(stan, kopia)
    ? tekst.stanNa({ dataICzas: formatujDateICzas(kopia.odczytano) })
    : tekst.wstepBezKopii;
}

type StanCzesci = 'pobrano' | 'pobieramy' | 'wKolejce';

const ikonyStanu: Record<StanCzesci, NazwaIkony> = {
  pobrano: 'sukces',
  pobieramy: 'ladowanie',
  wKolejce: 'w-kolejce',
};

function stanCzesci(indeks: number, pobrano: number): StanCzesci {
  if (indeks < pobrano) return 'pobrano';
  return indeks === pobrano ? 'pobieramy' : 'wKolejce';
}

function OdczytWToku({ pobrano, zKolei }: { pobrano: number; zKolei: number }) {
  const liczby = { pobrano: String(pobrano), zKolei: String(zKolei) };
  return (
    <div aria-busy="true">
      <Karta tytul={tekst.tytulOdczytu} bezLinii>
        <Stos odstep={4}>
          <p className="m-0">{tekst.opisOdczytu}</p>
          <div>
            <Postep
              wartosc={pobrano}
              maks={zKolei}
              etykieta={tekst.tytulOdczytu}
              tekstWartosci={tekst.tekstPostepu(liczby)}
            />
            <p role="status" className="m-0 mt-2 text-small-strong">
              {tekst.licznik(liczby)}
            </p>
          </div>
          <ul aria-label={tekst.listaCzesci} className="m-0 list-none border-t border-line-row p-0">
            {CZESCI_ODCZYTU.map((czesc: CzescOdczytu, indeks) => {
              const stanBiezacy = stanCzesci(indeks, pobrano);
              return (
                <li
                  key={czesc}
                  className="box-border flex min-h-row items-center gap-3 border-b border-line-row py-3"
                >
                  <Ikona nazwa={ikonyStanu[stanBiezacy]} className="shrink-0 text-brand" />
                  <span className="min-w-0 flex-auto text-body-strong">{tekst.czesci[czesc]}</span>
                  <span className="text-ink-strong">{tekst.stanyCzesci[stanBiezacy]}</span>
                </li>
              );
            })}
          </ul>
          <Notatka>
            <p>{tekst.tylkoOdczyt}</p>
          </Notatka>
        </Stos>
      </Karta>
    </div>
  );
}

function BrakDanych({ zBledem }: { zBledem: boolean }) {
  const stanKonta = useStanKonta();
  const [wToku, ustawWToku] = useState(false);
  const pesel = stanKonta?.konto.pesel;

  const pobierz = async () => {
    if (pesel === undefined) return;
    ustawWToku(true);
    try {
      await odczytajIObsluzDaneZus(pesel, pobierzKontekstOperacji());
    } finally {
      ustawWToku(false);
    }
  };

  return (
    <Stos odstep={7.5}>
      {zBledem ? <Komunikat kod="0001" /> : null}
      <Karta tytul={tekst.tytulBrakuDanych} bezLinii>
        <StanPusty
          ikona="brak-polaczenia"
          akcja={
            <Przycisk
              wariant="glowny"
              ikona="odswiez"
              zajety={wToku}
              disabled={pesel === undefined}
              onClick={() => void pobierz()}
            >
              {zBledem ? tekst.pobierzPonownie : tekst.pobierz}
            </Przycisk>
          }
        >
          <p>{tekst.opisBrakuDanych}</p>
        </StanPusty>
        <Notatka className="mt-6">
          <p>{tekst.tylkoOdczyt}</p>
        </Notatka>
      </Karta>
    </Stos>
  );
}

/**
 * Wznawia odczyt, który został w stanie `trwa` bez odczytu w toku w tej karcie (na przykład po odświeżeniu
 * strony w trakcie odczytu), żeby ekran nie pozostał w stanie odczytu w toku.
 */
function useWznowienieOdczytu(stan: StanOdczytuZus) {
  const pesel = useStanKonta()?.konto.pesel;
  const trwa = stan.stan === 'trwa';
  useEffect(() => {
    if (!trwa || pesel === undefined || czyOdczytDanychZusWToku(pesel)) return;
    void odczytajIObsluzDaneZus(pesel, pobierzKontekstOperacji());
  }, [trwa, pesel]);
}

export function StanOdczytuDanychZus({ stan, kopia }: StanOdczytuDanychZusProps) {
  useWznowienieOdczytu(stan);

  switch (stan.stan) {
    case 'trwa':
      return <OdczytWToku pobrano={stan.pobrano} zKolei={stan.zKolei} />;
    case 'nieudany-z-kopia':
      return kopia === null ? (
        <BrakDanych zBledem />
      ) : (
        <Komunikat kod="0002" parametry={{ dataOdczytu: formatujDate(kopia.odczytano) }} />
      );
    case 'nieudany-bez-kopii':
      return kopia === null ? <BrakDanych zBledem /> : null;
    case 'brak':
      return kopia === null ? <BrakDanych zBledem={false} /> : null;
    case 'udany':
      return kopia === null ? <BrakDanych zBledem={false} /> : null;
  }
}
