'use client';

// ViewCatalogEntryAdd: nowy wpis słownika kwot i progów albo wymiarów i okresów, czyli nowy parametr z pierwszą
// wersją wartości od podanej daty. Parametr ?slownik=kwoty|wymiary wybiera słownik. Kolejne wersje Administrator
// dopisuje w ViewCatalogValueEdit. Dostęp konta bez roli Administrator rozstrzyga StrazDostepu (0047).
// Formularz ma dwie części w ?czesc=N: nazwa i jednostka, potem wartość i data początku obowiązywania.
import { useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { dodajWpisSlownika } from '@/dane/magazyn/operacje/katalog';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { rodzajPolaWariantu } from '@/domena/katalog/edycja';
import {
  JEDNOSTKI_SLOWNIKA,
  formularzNowegoWpisuPoczatkowy,
  maksDlugoscPolaWpisu,
  walidujNowyWpis,
  type FormularzNowegoWpisu,
  type PoleNowegoWpisu,
} from '@/domena/katalog/edycja-panelu';
import type { BledyPol, KodKomunikatu, RodzajSlownika } from '@/domena/typy';
import { useKatalog } from '@/dane/magazyn/hooki';
import { CzescFormularza, PrzyciskiCzesci, useCzesciFormularza } from '@/komponenty/czesci-formularza';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { PostepKreatora } from '@/komponenty/kroki';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { PoleDaty, PoleKwoty, PoleLiczby, PoleTekstowe } from '@/komponenty/pole-tekstowe';
import { PoleWyboru } from '@/komponenty/pole-wyboru';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';

const ID_POL: Record<PoleNowegoWpisu, string> = {
  nazwa: 'nazwa',
  etykieta: 'etykieta',
  jednostka: 'jednostka',
  wartosc: 'wartosc',
  od: 'od',
};

const PODZIAL: readonly (readonly PoleNowegoWpisu[])[] = [
  ['nazwa', 'etykieta', 'jednostka'],
  ['wartosc', 'od'],
];

type JednostkaNowegoWpisu = keyof typeof teksty.ViewCatalogEntryAdd.jednostki;

export function WidokNowegoWpisuKatalogu() {
  const t = teksty.ViewCatalogEntryAdd;
  const slownik: RodzajSlownika = useSearchParams().get('slownik') === 'wymiary' ? 'wymiary-i-okresy' : 'kwoty-i-progi';
  const katalog = useKatalog();
  const [formularz, setFormularz] = useState<FormularzNowegoWpisu>(() => formularzNowegoWpisuPoczatkowy(slownik));
  const [bladOgolny, setBladOgolny] = useState<KodKomunikatu | null>(null);
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const lista = trasy.ViewCatalogList({ zakladka: slownik === 'kwoty-i-progi' ? 'kwoty' : 'wymiary' });

  const walidacja = useWalidacjaNaBiezaco({
    wartosci: formularz,
    waliduj: (f: FormularzNowegoWpisu) => walidujNowyWpis(f, katalog),
    pola: ID_POL,
  });
  const czesci = useCzesciFormularza<PoleNowegoWpisu>({ liczba: PODZIAL.length, podzial: PODZIAL, walidacja });

  function poleZLimitem(pole: PoleNowegoWpisu) {
    const propsy = walidacja.pole(pole);
    return {
      ...propsy,
      parametryBledu: propsy.blad === '0271' ? { liczbaZnakow: String(maksDlugoscPolaWpisu(pole)) } : undefined,
    };
  }

  function zmien<P extends keyof FormularzNowegoWpisu>(pole: P, wartosc: FormularzNowegoWpisu[P]) {
    setFormularz((poprzedni) => ({ ...poprzedni, [pole]: wartosc }));
  }

  function zapisz() {
    if (zajety) return;
    ustawZajety(true);
    setBladOgolny(null);
    const wynik = dodajWpisSlownika(formularz, pobierzKontekstOperacji());
    if (wynik.ok) {
      przejdz(lista);
      return;
    }
    ustawZajety(false);
    if (!wynik.bledyPol) {
      setBladOgolny(wynik.kod);
      return;
    }
    const bledyPol = wynik.bledyPol as BledyPol<PoleNowegoWpisu>;
    const numer = PODZIAL.findIndex((pola) => pola.some((pole) => bledyPol[pole] !== undefined)) + 1;
    if (numer > 0) czesci.przejdzDo(numer, { bezFokusu: true });
    walidacja.pokazBledy(bledyPol);
  }

  function wyslij(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    czesci.dalej(zapisz);
  }

  const jednostka = formularz.jednostka;
  const polaWartosci = {
    id: ID_POL.wartosc,
    etykieta: t.wartosc,
    wartosc: formularz.wartosc,
    onZmiana: (w: string) => zmien('wartosc', w),
    szerokosc: 'srednia' as const,
    autoComplete: 'off',
    wymagane: true,
    ...walidacja.pole('wartosc'),
  };

  return (
    <>
      <NaglowekStrony tytul={t.naglowek} wstep={t.wstep} powrot={{ href: lista, etykieta: t.powrot }} />
      <form noValidate onSubmit={wyslij} className="flex max-w-tresc min-w-0 flex-col gap-7.5">
        <PostepKreatora
          id="postep-wpisu"
          krok={czesci.czesc}
          liczbaKrokow={czesci.liczba}
          nazwaKroku={czesci.czesc === 1 ? t.nazwa : t.wartosc}
        />
        {bladOgolny ? <Komunikat kod={bladOgolny} /> : null}

        <CzescFormularza czesci={czesci} numer={1}>
          <Karta tytul={teksty.ViewCatalogValueEdit.slowniki[slownik]} bezLinii>
            <div className="flex max-w-160 flex-col gap-6">
              <PoleTekstowe
                id={ID_POL.nazwa}
                etykieta={t.nazwa}
                podpowiedz={t.podpowiedzNazwy}
                wartosc={formularz.nazwa}
                onZmiana={(w) => zmien('nazwa', w)}
                autoComplete="off"
                {...poleZLimitem('nazwa')}
                wymagane
              />
              <PoleTekstowe
                id={ID_POL.etykieta}
                etykieta={t.etykieta}
                podpowiedz={t.podpowiedzEtykiety}
                wartosc={formularz.etykieta}
                onZmiana={(w) => zmien('etykieta', w)}
                autoComplete="off"
                {...poleZLimitem('etykieta')}
              />
              <PoleWyboru<JednostkaNowegoWpisu>
                id={ID_POL.jednostka}
                etykieta={t.jednostka}
                opcje={JEDNOSTKI_SLOWNIKA[slownik].map((j) => ({
                  wartosc: j as JednostkaNowegoWpisu,
                  etykieta: t.jednostki[j as JednostkaNowegoWpisu],
                }))}
                wartosc={(formularz.jednostka as JednostkaNowegoWpisu | '') ?? ''}
                onZmiana={(w) => zmien('jednostka', w)}
                pustaOpcja={t.wybierzJednostke}
                {...walidacja.pole('jednostka')}
                wymagane
              />
            </div>
          </Karta>
        </CzescFormularza>

        <CzescFormularza czesci={czesci} numer={2}>
          <Karta tytul={t.wartosc} bezLinii>
            <div className="flex max-w-160 flex-col gap-6">
              {jednostka !== '' && rodzajPolaWariantu(jednostka) === 'wymiar' ? (
                <PoleLiczby {...polaWartosci} jednostka={teksty.ViewCatalogList.etykiety.jednostkiPol[jednostka]} />
              ) : (
                <PoleKwoty
                  {...polaWartosci}
                  jednostka={jednostka === '' ? undefined : teksty.ViewCatalogList.etykiety.jednostkiPol[jednostka]}
                />
              )}
              <PoleDaty
                id={ID_POL.od}
                etykieta={t.od}
                podpowiedz={t.podpowiedzOd}
                wartosc={formularz.od}
                onZmiana={(w) => zmien('od', w)}
                {...walidacja.pole('od')}
                wymagane
              />
            </div>
          </Karta>
        </CzescFormularza>

        <PrzyciskiCzesci
          czesci={czesci}
          onAkcjaKroku={zapisz}
          etykietaAkcji={t.zapisz}
          onWrocKroku={() => przejdz(lista)}
          zajety={zajety}
          dodatkowe={
            <PrzyciskLink href={lista} wariant="drugorzedny">
              {t.anuluj}
            </PrzyciskLink>
          }
        />
      </form>
    </>
  );
}
