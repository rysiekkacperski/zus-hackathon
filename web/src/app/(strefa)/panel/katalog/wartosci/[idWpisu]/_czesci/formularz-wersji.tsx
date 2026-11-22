'use client';

// Formularz „Dopisz nową kwotę / nowy wymiar / nową stawkę” na ViewCatalogValueEdit
// (wzory P04-01 do P04-04, P04-06, P04-07, P04-09, P04-10).
// Formularz ma części w ?czesc=N, żeby każda mieściła się w oknie bez przewijania: historia wartości, potem
// nowa wartość z datą początku (wpis z jednym wariantem) albo nowe wartości wariantów i osobno data początku.
import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { formatujWartosc, wartosciWersji } from '@/app/(strefa)/panel/katalog/_czesci/opis-wartosci';
import { dopiszWartosc } from '@/dane/magazyn/operacje/katalog';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import {
  POLE_DATY_POCZATKU,
  czyWypelnicFormularz,
  maksWymiaru,
  rodzajPolaWariantu,
  rodzajWpisu,
  walidujNowaWersje,
  wariantyEdytowalne,
  wartoscDoPola,
  wersjaOdniesienia,
} from '@/domena/katalog/edycja';
import type { BledyPol, DataISO, Katalog, KodKomunikatu, WariantWpisu, WpisSlownika } from '@/domena/typy';
import { CzescFormularza, PrzyciskiCzesci, useCzesciFormularza } from '@/komponenty/czesci-formularza';
import { formatujDate } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { PostepKreatora } from '@/komponenty/kroki';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { PoleDaty, PoleKwoty, PoleLiczby } from '@/komponenty/pole-tekstowe';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
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
  blad: KodKomunikatu | null;
  onOpuszczenie: () => void;
  szerokosc: 'srednia' | 'waska';
  onZmiana: (wartosc: string) => void;
}

function PoleWariantu({ wariant, etykieta, podpowiedz, wartosc, blad, onOpuszczenie, szerokosc, onZmiana }: PoleWariantuProps) {
  const jednostka = teksty.ViewCatalogList.etykiety.jednostkiPol[wariant.jednostka];
  const wspolne = {
    id: idPolaWariantu(wariant.klucz),
    etykieta,
    podpowiedz,
    wartosc,
    onZmiana,
    onOpuszczenie,
    blad,
    szerokosc,
    jednostka,
    wymagane: true,
    zwykla: false,
  } as const;
  return rodzajPolaWariantu(wariant.jednostka) === 'wymiar' ? <PoleLiczby {...wspolne} /> : <PoleKwoty {...wspolne} />;
}

interface WartosciFormularza {
  wartosci: Record<string, string>;
  od: string;
}

export interface FormularzWersjiProps {
  wpis: WpisSlownika;
  katalog: Katalog;
  dzis: DataISO;
  adresListy: string;
  /** Karta historii wartości: pierwsza część formularza. */
  historia: ReactNode;
}

export function FormularzWersji({ wpis, katalog, dzis, adresListy, historia }: FormularzWersjiProps) {
  const t = teksty.ViewCatalogValueEdit;
  const rodzaj = rodzajWpisu(wpis);
  const warianty = wariantyEdytowalne(wpis);
  const jedyna = warianty.length === 1;
  // Więcej niż dwa warianty: pola w kolumnach na całej szerokości karty, żeby część mieściła się w oknie.
  const wKolumnach = warianty.length > 2;
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
  const [bladOgolny, setBladOgolny] = useState<KodKomunikatu | null>(null);
  const { zajety: zapisywanie, ustawZajety: ustawZapisywanie, przejdz } = useNawigacjaZLadowaniem();

  const kluczeWariantow = warianty.map((w) => w.klucz);
  const formularz = useMemo<WartosciFormularza>(() => ({ wartosci, od }), [wartosci, od]);
  const walidacja = useWalidacjaNaBiezaco({
    wartosci: formularz,
    waliduj: (f: WartosciFormularza) => walidujNowaWersje(wpis, f.wartosci, f.od, dzis),
    pola: Object.fromEntries([
      ...kluczeWariantow.map((klucz) => [klucz, idPolaWariantu(klucz)]),
      [POLE_DATY_POCZATKU, ID_DATY],
    ]),
    wartoscPola: (f, pole) => (pole === POLE_DATY_POCZATKU ? f.od : (f.wartosci[pole] ?? '')),
  });
  // Części: historia, potem nowa wartość z datą (jeden wariant) albo wartości wariantów i data początku.
  const podzial: string[][] = jedyna ? [[], [...kluczeWariantow, POLE_DATY_POCZATKU]] : [[], kluczeWariantow, [POLE_DATY_POCZATKU]];
  const nazwyCzesci = jedyna ? [t.historia[rodzaj], t.dopisz[rodzaj]] : [t.historia[rodzaj], t.dopisz[rodzaj], t.dataPoczatku];
  const czesci = useCzesciFormularza<string>({ liczba: podzial.length, podzial, walidacja });

  function zmienWartosc(klucz: string, wartosc: string) {
    setWartosci((poprzednie) => ({ ...poprzednie, [klucz]: wartosc }));
  }

  function zapisz() {
    if (zapisywanie) return;
    ustawZapisywanie(true);
    setBladOgolny(null);
    const wynik = dopiszWartosc(wpis.id, wartosci, od, pobierzKontekstOperacji());
    if (wynik.ok) {
      przejdz(adresListy);
      return;
    }
    ustawZapisywanie(false);
    if (!wynik.bledyPol) {
      setBladOgolny(wynik.kod);
      return;
    }
    const bledyPol: BledyPol<string> = wynik.bledyPol;
    const numer = podzial.findIndex((pola) => pola.some((pole) => bledyPol[pole] !== undefined)) + 1;
    if (numer > 0) czesci.przejdzDo(numer, { bezFokusu: true });
    walidacja.pokazBledy(bledyPol);
  }

  function wyslij(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    czesci.dalej(zapisz);
  }

  const polaWariantow = jedyna ? (
    <PoleWariantu
      wariant={warianty[0]}
      etykieta={t.poleJedyne[rodzaj]}
      podpowiedz={podpowiedzWartosci(wpis, true)}
      wartosc={wartosci[warianty[0].klucz] ?? ''}
      {...walidacja.pole(warianty[0].klucz)}
      szerokosc="srednia"
      onZmiana={(w) => zmienWartosc(warianty[0].klucz, w)}
    />
  ) : (
    <fieldset className="m-0 min-w-0 border-0 p-0" aria-describedby="wartosci-podpowiedz">
      <legend className="m-0 mb-1 p-0 text-body-strong">{legendaFormularza(wpis)}</legend>
      <p id="wartosci-podpowiedz" className="m-0 mb-6">
        {podpowiedzWartosci(wpis, false)}
      </p>
      <div className={wKolumnach ? 'grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-6'}>
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
              {...walidacja.pole(wariant.klucz)}
              szerokosc="waska"
              onZmiana={(w) => zmienWartosc(wariant.klucz, w)}
            />
          );
        })}
      </div>
    </fieldset>
  );

  const poleDaty = (
    <PoleDaty
      id={ID_DATY}
      etykieta={t.dataPoczatku}
      podpowiedz={odniesienie ? t.podpowiedzDaty({ data: formatujDate(odniesienie.od) }) : t.podpowiedzDatyBezWersji}
      wartosc={od}
      onZmiana={setOd}
      {...walidacja.pole(POLE_DATY_POCZATKU)}
      wymagane
    />
  );
  const szerokoscPol = jedyna ? 'max-w-135' : wKolumnach ? '' : 'max-w-160';

  return (
    <form noValidate onSubmit={wyslij} className="flex min-w-0 flex-col gap-7.5">
      <PostepKreatora
        id="postep-wartosci"
        krok={czesci.czesc}
        liczbaKrokow={czesci.liczba}
        nazwaKroku={nazwyCzesci[czesci.czesc - 1] ?? nazwyCzesci[0]}
      />
      {bladOgolny ? <Komunikat kod={bladOgolny} /> : null}
      <CzescFormularza czesci={czesci} numer={1}>
        {historia}
      </CzescFormularza>
      <CzescFormularza czesci={czesci} numer={2}>
        <Karta tytul={t.dopisz[rodzaj]} bezLinii>
          <p className="m-0 mb-6">{czyWypelnicFormularz(wpis) ? t.opisWypelnionego[rodzaj] : t.opisPustego[rodzaj]}</p>
          <div className={`flex flex-col gap-6 ${szerokoscPol}`}>
            {polaWariantow}
            {jedyna ? poleDaty : null}
          </div>
        </Karta>
      </CzescFormularza>
      {jedyna ? null : (
        <CzescFormularza czesci={czesci} numer={3}>
          <Karta tytul={t.dopisz[rodzaj]} bezLinii>
            <div className="flex max-w-135 flex-col gap-6">{poleDaty}</div>
          </Karta>
        </CzescFormularza>
      )}
      <PrzyciskiCzesci
        czesci={czesci}
        onAkcjaKroku={zapisz}
        etykietaAkcji={t.zapisz[rodzaj]}
        onWrocKroku={() => przejdz(adresListy)}
        zajety={zapisywanie}
        dodatkowe={
          <PrzyciskLink href={adresListy} wariant="drugorzedny">
            {t.anuluj}
          </PrzyciskLink>
        }
      />
    </form>
  );
}
