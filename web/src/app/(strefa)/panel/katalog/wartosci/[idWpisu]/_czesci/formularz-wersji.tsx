'use client';

// Formularz „Dopisz nową kwotę / nowy wymiar / nową stawkę” na ViewCatalogValueEdit
// (wzory P04-01 do P04-04, P04-06, P04-07, P04-09, P04-10).
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { formatujWartosc, wartosciWersji } from '@/app/(strefa)/panel/katalog/_czesci/opis-wartosci';
import { dopiszWartosc } from '@/dane/magazyn/operacje/katalog';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import {
  POLE_DATY_POCZATKU,
  czyWypelnicFormularz,
  maksWymiaru,
  rodzajPolaWariantu,
  rodzajWpisu,
  wariantyEdytowalne,
  wartoscDoPola,
  wersjaOdniesienia,
} from '@/domena/katalog/edycja';
import type { BledyPol, DataISO, Katalog, KodKomunikatu, WariantWpisu, WpisSlownika } from '@/domena/typy';
import { formatujDate } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { PoleDaty, PoleKwoty, PoleLiczby } from '@/komponenty/pole-tekstowe';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { teksty } from '@/teksty';

const ID_DATY = 'od';

export function idPolaWariantu(klucz: string): string {
  return `wariant-${klucz}`;
}

function legendaFormularza(wpis: WpisSlownika): string {
  const t = teksty.ViewCatalogValueEdit;
  const rodzaj = rodzajWpisu(wpis);
  if (rodzaj !== 'wymiar') return t.legenda[rodzaj];
  const jednostki = new Set(wariantyEdytowalne(wpis).map((w) => w.jednostka));
  const [jedyna] = [...jednostki];
  return jednostki.size === 1 && jedyna in t.legendaWymiaru
    ? t.legendaWymiaru[jedyna as keyof typeof t.legendaWymiaru]
    : t.legenda.wymiar;
}

function podpowiedzWartosci(wpis: WpisSlownika, jedyna: boolean): string {
  const t = teksty.ViewCatalogValueEdit.podpowiedz;
  const rodzaj = rodzajWpisu(wpis);
  if (rodzaj === 'wymiar') {
    const maks = String(Math.max(...wariantyEdytowalne(wpis).map((w) => maksWymiaru(w.jednostka))));
    return jedyna ? t.wymiarJedyny({ maks }) : t.wymiar({ maks });
  }
  return t[rodzaj];
}

interface PoleWariantuProps {
  wariant: WariantWpisu;
  etykieta: string;
  podpowiedz?: string;
  wartosc: string;
  blad?: KodKomunikatu;
  szerokosc: 'srednia' | 'waska';
  onZmiana: (wartosc: string) => void;
}

function PoleWariantu({ wariant, etykieta, podpowiedz, wartosc, blad, szerokosc, onZmiana }: PoleWariantuProps) {
  const jednostka = teksty.ViewCatalogList.etykiety.jednostkiPol[wariant.jednostka];
  const wspolne = {
    id: idPolaWariantu(wariant.klucz),
    etykieta,
    podpowiedz,
    wartosc,
    onZmiana,
    blad: blad ?? null,
    szerokosc,
    jednostka,
    wymagane: true,
    zwykla: false,
  } as const;
  return rodzajPolaWariantu(wariant.jednostka) === 'wymiar' ? <PoleLiczby {...wspolne} /> : <PoleKwoty {...wspolne} />;
}

export interface FormularzWersjiProps {
  wpis: WpisSlownika;
  katalog: Katalog;
  dzis: DataISO;
  adresListy: string;
}

export function FormularzWersji({ wpis, katalog, dzis, adresListy }: FormularzWersjiProps) {
  const t = teksty.ViewCatalogValueEdit;
  const router = useRouter();
  const rodzaj = rodzajWpisu(wpis);
  const warianty = wariantyEdytowalne(wpis);
  const jedyna = warianty.length === 1;
  const odniesienie = wersjaOdniesienia(wpis, dzis);
  const obowiazujace = odniesienie ? wartosciWersji(katalog, wpis, odniesienie, dzis) : {};

  const [wartosci, setWartosci] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      warianty.map((w) => {
        const biezaca = obowiazujace[w.klucz];
        return [w.klucz, czyWypelnicFormularz(wpis) && biezaca !== undefined ? wartoscDoPola(biezaca, w.jednostka) : ''];
      }),
    ),
  );
  const [od, setOd] = useState('');
  const [bledy, setBledy] = useState<BledyPol<string>>({});
  const [bladOgolny, setBladOgolny] = useState<KodKomunikatu | null>(null);
  const [zapisywanie, setZapisywanie] = useState(false);

  function zmienWartosc(klucz: string, wartosc: string) {
    setWartosci((poprzednie) => ({ ...poprzednie, [klucz]: wartosc }));
  }

  function zapisz(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (zapisywanie) return;
    setZapisywanie(true);
    const wynik = dopiszWartosc(wpis.id, wartosci, od, pobierzKontekstOperacji());
    if (wynik.ok) {
      router.push(adresListy);
      return;
    }
    setZapisywanie(false);
    const bledyPol: BledyPol<string> = wynik.bledyPol ?? {};
    setBledy(bledyPol);
    setBladOgolny(wynik.bledyPol ? null : wynik.kod);
    const kolejnosc = [...warianty.map((w) => w.klucz), POLE_DATY_POCZATKU];
    const pierwszy = kolejnosc.find((klucz) => bledyPol[klucz] !== undefined);
    if (pierwszy !== undefined) {
      document.getElementById(pierwszy === POLE_DATY_POCZATKU ? ID_DATY : idPolaWariantu(pierwszy))?.focus();
    }
  }

  const polaWariantow = jedyna ? (
    <PoleWariantu
      wariant={warianty[0]}
      etykieta={t.poleJedyne[rodzaj]}
      podpowiedz={podpowiedzWartosci(wpis, true)}
      wartosc={wartosci[warianty[0].klucz] ?? ''}
      blad={bledy[warianty[0].klucz]}
      szerokosc="srednia"
      onZmiana={(w) => zmienWartosc(warianty[0].klucz, w)}
    />
  ) : (
    <fieldset className="m-0 min-w-0 border-0 p-0" aria-describedby="wartosci-podpowiedz">
      <legend className="m-0 mb-1 p-0 text-body-strong">{legendaFormularza(wpis)}</legend>
      <p id="wartosci-podpowiedz" className="m-0 mb-6">
        {podpowiedzWartosci(wpis, false)}
      </p>
      <div className="flex flex-col gap-6">
        {warianty.map((wariant) => {
          const biezaca = obowiazujace[wariant.klucz];
          return (
            <PoleWariantu
              key={wariant.klucz}
              wariant={wariant}
              etykieta={wariant.etykieta}
              podpowiedz={
                biezaca === undefined
                  ? undefined
                  : t.obowiazuje({ wartosc: formatujWartosc(biezaca, wariant.jednostka) })
              }
              wartosc={wartosci[wariant.klucz] ?? ''}
              blad={bledy[wariant.klucz]}
              szerokosc="waska"
              onZmiana={(w) => zmienWartosc(wariant.klucz, w)}
            />
          );
        })}
      </div>
    </fieldset>
  );

  return (
    <Karta tytul={t.dopisz[rodzaj]} bezLinii>
      <p className="m-0 mb-6">{czyWypelnicFormularz(wpis) ? t.opisWypelnionego[rodzaj] : t.opisPustego[rodzaj]}</p>
      <form noValidate onSubmit={zapisz} className={`flex flex-col gap-6 ${jedyna ? 'max-w-135' : 'max-w-160'}`}>
        {bladOgolny ? <Komunikat kod={bladOgolny} /> : null}
        {polaWariantow}
        <PoleDaty
          id={ID_DATY}
          etykieta={t.dataPoczatku}
          podpowiedz={
            odniesienie ? t.podpowiedzDaty({ data: formatujDate(odniesienie.od) }) : t.podpowiedzDatyBezWersji
          }
          wartosc={od}
          onZmiana={setOd}
          blad={bledy[POLE_DATY_POCZATKU] ?? null}
          wymagane
        />
        <div className="flex flex-wrap gap-4 pt-2">
          <Przycisk type="submit" wariant="glowny" zajety={zapisywanie}>
            {t.zapisz[rodzaj]}
          </Przycisk>
          <PrzyciskLink href={adresListy} wariant="drugorzedny">
            {t.anuluj}
          </PrzyciskLink>
        </div>
      </form>
    </Karta>
  );
}
