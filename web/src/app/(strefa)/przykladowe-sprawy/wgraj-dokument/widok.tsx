'use client';

// ViewSampleCaseUpload (3.4.3.1.2): wybór pliku od razu rozpoczyna wgranie i odczyt danych (wzory P13-03, P13-04, P13-05).
// Format i wielkość pliku sprawdza pole (0103, 0104), a rozpoznanie i odczyt kończą się komunikatem strony (0105, 0106, 0108).
import { useSearchParams } from 'next/navigation';
import { useRef, useState, type ChangeEvent } from 'react';
import { Karta } from '@/komponenty/karta';
import { ListaKrokow } from '@/komponenty/kroki';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { useNawigacjaZLadowaniem, useStanChwilowy } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { BladPola, idBledu, klasyRamkiPolaWpisu, polaczOpisy } from '@/komponenty/pole';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { Stos, UkladDwuKolumnowy } from '@/komponenty/uklad';
import { formatujLiczbe } from '@/domena/kwoty';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { wgrajDokument, type TrybWgraniaDokumentu } from '@/dane/magazyn/operacje/przykladowe-sprawy';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import type { KodKomunikatu } from '@/domena/typy';
import { teksty } from '@/teksty';

const t = teksty.ViewSampleCaseUpload;
const ID_PLIKU = 'plik';

function rozmiarMb(bajty: number): string {
  return t.kartaPliku.rozmiarMb({ liczba: formatujLiczbe(bajty / 1048576, 1) });
}

export function WidokWgraniaDokumentu() {
  const parametry = useSearchParams();
  const tryb: TrybWgraniaDokumentu = parametry.get('tryb') === 'dodaj' ? 'dodaj' : 'nowa';
  const pole = useRef<HTMLInputElement>(null);
  // Plik i odczyt wracają do stanu początkowego po przejściu do danych sprawy, więc powrót pokazuje pusty wybór pliku.
  const [plik, setPlik] = useStanChwilowy<File | null>(null);
  const { zajety: trwa, ustawZajety: setTrwa, przejdz } = useNawigacjaZLadowaniem();
  const [bladPola, setBladPola] = useState<KodKomunikatu | null>(null);
  const [bladStrony, setBladStrony] = useState<KodKomunikatu | null>(null);

  async function wybierzPlik(e: ChangeEvent<HTMLInputElement>) {
    const wybrany = e.target.files?.[0] ?? null;
    if (wybrany === null || trwa) return;
    setPlik(wybrany);
    setBladPola(null);
    setBladStrony(null);
    setTrwa(true);
    const wynik = await wgrajDokument(wybrany, tryb, pobierzKontekstOperacji());
    if (wynik.ok) {
      for (const kod of wynik.wartosc.komunikaty) ustawKomunikatPoPrzejsciu({ kod, dlaWidoku: 'ViewSampleCaseData' });
      if (pole.current) pole.current.value = '';
      // Odczyt trwa na ekranie do pokazania danych sprawy.
      przejdz(trasy.ViewSampleCaseData());
      return;
    }
    setTrwa(false);
    if (wynik.bledyPol?.plik) {
      setBladPola(wynik.bledyPol.plik);
      pole.current?.focus();
    } else {
      setBladStrony(wynik.kod);
    }
    if (pole.current) pole.current.value = '';
  }

  const idStanu = `${ID_PLIKU}-stan`;
  const opisPola = polaczOpisy(`${ID_PLIKU}-podpowiedz`, plik ? idStanu : null, bladPola ? idBledu(ID_PLIKU) : null);
  const stanPliku = plik === null
    ? null
    : trwa
      ? t.kartaPliku.trwaOdczyt({ nazwa: plik.name })
      : bladStrony
        ? t.kartaPliku.nieOdczytany({ nazwa: plik.name, rozmiar: rozmiarMb(plik.size) })
        : t.kartaPliku.wybranyPlik({ nazwa: plik.name });

  const tresc = (
    <Stos odstep={7.5}>
      {bladStrony ? (
        <Komunikat
          kod={bladStrony}
          akcje={bladStrony === '0108' || bladStrony === '0105' ? <Odnosnik href={trasy.ViewSampleCaseList()}>{t.wybierzZListy}</Odnosnik> : undefined}
        />
      ) : null}
      <Karta tytul={t.kartaPliku.tytul} bezLinii>
        <div className="grid min-w-0 gap-1">
          <label htmlFor={ID_PLIKU} className="font-semibold text-ink">
            {t.kartaPliku.etykieta}
          </label>
          <p id={`${ID_PLIKU}-podpowiedz`} className="m-0 mb-2">
            {t.kartaPliku.podpowiedz}
          </p>
          <input
            ref={pole}
            id={ID_PLIKU}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={wybierzPlik}
            disabled={trwa}
            aria-describedby={opisPola}
            aria-invalid={bladPola ? true : undefined}
            aria-busy={trwa || undefined}
            className={`${klasyRamkiPolaWpisu} cursor-pointer px-3 py-2.5 file:mr-4 file:cursor-pointer file:rounded-sm file:border file:border-brand file:bg-surface-card file:px-4 file:py-1.5 file:font-semibold file:text-brand`}
          />
          {stanPliku ? (
            <p id={idStanu} role={trwa ? 'status' : undefined} className="m-0 mt-1">
              {stanPliku}
            </p>
          ) : null}
          {bladPola ? <BladPola id={idBledu(ID_PLIKU)} kod={bladPola} /> : null}
        </div>
        <Notatka className="mt-6">{t.kartaPliku.notatka}</Notatka>
        <div className="mt-6">
          <PrzyciskLink href={trasy.ViewSampleCaseList()} wariant="drugorzedny">
            {t.wrocDoListy}
          </PrzyciskLink>
        </div>
      </Karta>
    </Stos>
  );

  const boczna = (
    <Stos odstep={7.5}>
      <Karta tytul={t.jak.tytul} bezLinii>
        <ListaKrokow kroki={t.jak.kroki.map((krok) => <span key={krok}>{krok}</span>)} />
      </Karta>
      <Karta tytul={t.rodzaje.tytul} bezLinii>
        <ul className="m-0 grid gap-2 pl-5">
          {t.rodzaje.lista.map((rodzaj) => (
            <li key={rodzaj}>{rodzaj}</li>
          ))}
        </ul>
      </Karta>
    </Stos>
  );

  return (
    <>
      <NaglowekStrony tytul={t.naglowek} wstep={tryb === 'dodaj' ? t.wstepDodaj : t.wstep} />
      <UkladDwuKolumnowy tresc={tresc} boczna={boczna} etykietaBocznej={t.etykietaBocznej} />
    </>
  );
}
