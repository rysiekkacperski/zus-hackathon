'use client';

// ViewCatalogItemEdit: zmiana pozycji katalogu K01–K37 i pozycji dodanych w panelu (tytuł, opis warunku, instytucja
// i kanał, dane i dokumenty, kroki instrukcji, reguła terminu) oraz wyłączenie i włączenie pozycji w planach rodzin.
// Dostęp konta bez roli Administrator rozstrzyga StrazDostepu (0047), a operacje sprawdzają rolę przy zapisie.
// Formularz ma trzy części w ?czesc=N, żeby każda mieściła się w oknie bez przewijania.
import { use, useState, type FormEvent } from 'react';
import { opisRegulyTerminu } from '@/app/(strefa)/panel/katalog/_czesci/opis-reguly';
import { PolePrzesuniecia } from '@/app/(strefa)/panel/katalog/pozycje/nowa/_czesci/pole-przesuniecia';
import { useKatalog } from '@/dane/magazyn/hooki';
import { kotwicaPozycji, ustawWylaczeniePozycji, zmienPozycje } from '@/dane/magazyn/operacje/katalog';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import {
  TERMINY_ZMIENIANEJ_POZYCJI,
  formularzZmianyPozycji,
  maksDlugoscPolaZmiany,
  walidujZmianePozycji,
  type FormularzZmianyPozycji,
  type PoleZmianyPozycji,
} from '@/domena/katalog/edycja-panelu';
import { regulaPozycji } from '@/domena/terminy/reguly';
import type { BledyPol, Katalog, KodKomunikatu, PozycjaKatalogu } from '@/domena/typy';
import { CzescFormularza, PrzyciskiCzesci, useCzesciFormularza } from '@/komponenty/czesci-formularza';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { PostepKreatora } from '@/komponenty/kroki';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { PoleTekstowe, PoleTekstuDlugiego } from '@/komponenty/pole-tekstowe';
import { PoleWyboru } from '@/komponenty/pole-wyboru';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';

const ID_POL: Record<PoleZmianyPozycji, string> = {
  tytul: 'tytul',
  warunekOpis: 'warunek',
  instytucjaIKanal: 'instytucja',
  daneIDokumenty: 'dokumenty',
  kroki: 'kroki',
  przesuniecie: 'przesuniecie',
};

const CZESCI = ['sprawa', 'kanal', 'termin'] as const;
const PODZIAL: readonly (readonly PoleZmianyPozycji[])[] = [
  ['tytul', 'warunekOpis'],
  ['instytucjaIKanal', 'daneIDokumenty', 'kroki'],
  ['przesuniecie'],
];

export function WidokZmianyPozycjiKatalogu({ params }: { params: PageProps<'/panel/katalog/pozycje/[idPozycji]'>['params'] }) {
  const t = teksty.ViewCatalogItemEdit;
  const { idPozycji } = use(params);
  const katalog = useKatalog();
  const pozycja = katalog.pozycje.find((p) => p.id === idPozycji);
  const lista = trasy.ViewCatalogList({ zakladka: 'pozycje' });

  if (pozycja === undefined) {
    return (
      <>
        <NaglowekStrony tytul={t.tytulStrony} powrot={{ href: lista, etykieta: t.powrot }} />
        <Karta className="max-w-tresc">
          <div className="flex flex-col gap-6">
            <p className="m-0">{t.brakPozycji}</p>
            <div>
              <PrzyciskLink href={lista} wariant="drugorzedny">
                {t.powrot}
              </PrzyciskLink>
            </div>
          </div>
        </Karta>
      </>
    );
  }
  return <FormularzZmianyPozycji key={pozycja.id} pozycja={pozycja} katalog={katalog} lista={lista} />;
}

function FormularzZmianyPozycji({ pozycja, katalog, lista }: { pozycja: PozycjaKatalogu; katalog: Katalog; lista: string }) {
  const t = teksty.ViewCatalogItemEdit;
  const kotwice = teksty.ViewCatalogItemAdd.kanal.kotwice;
  const [formularz, setFormularz] = useState<FormularzZmianyPozycji>(() => formularzZmianyPozycji(pozycja));
  const [bladOgolny, setBladOgolny] = useState<KodKomunikatu | null>(null);
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();

  const walidacja = useWalidacjaNaBiezaco({
    wartosci: formularz,
    waliduj: (f: FormularzZmianyPozycji) => walidujZmianePozycji(f, pozycja.id, katalog),
    pola: ID_POL,
  });
  const czesci = useCzesciFormularza<PoleZmianyPozycji>({ liczba: CZESCI.length, podzial: PODZIAL, walidacja });
  const czesc = CZESCI[czesci.czesc - 1];
  const powrotDoWiersza = `${lista}#${kotwicaPozycji(pozycja.id)}`;

  /** Pole z błędem 0271 pokazuje dozwoloną liczbę znaków. */
  function poleZLimitem(pole: PoleZmianyPozycji) {
    const propsy = walidacja.pole(pole);
    return {
      ...propsy,
      parametryBledu: propsy.blad === '0271' ? { liczbaZnakow: String(maksDlugoscPolaZmiany(pole)) } : undefined,
    };
  }

  function zmien<P extends keyof FormularzZmianyPozycji>(pole: P, wartosc: FormularzZmianyPozycji[P]) {
    setFormularz((poprzedni) => ({ ...poprzedni, [pole]: wartosc }));
  }

  function zapisz() {
    if (zajety) return;
    ustawZajety(true);
    setBladOgolny(null);
    const wynik = zmienPozycje(pozycja.id, formularz, pobierzKontekstOperacji());
    if (wynik.ok) {
      przejdz(powrotDoWiersza);
      return;
    }
    ustawZajety(false);
    if (!wynik.bledyPol) {
      setBladOgolny(wynik.kod);
      return;
    }
    const bledyPol = wynik.bledyPol as BledyPol<PoleZmianyPozycji>;
    const numer = PODZIAL.findIndex((pola) => pola.some((pole) => bledyPol[pole] !== undefined)) + 1;
    if (numer > 0) czesci.przejdzDo(numer, { bezFokusu: true });
    walidacja.pokazBledy(bledyPol);
  }

  function przelaczWylaczenie() {
    if (zajety) return;
    ustawZajety(true);
    setBladOgolny(null);
    const wynik = ustawWylaczeniePozycji(pozycja.id, pozycja.wylaczona !== true, pobierzKontekstOperacji());
    if (wynik.ok) {
      przejdz(powrotDoWiersza);
      return;
    }
    ustawZajety(false);
    setBladOgolny(wynik.kod);
  }

  function wyslij(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    czesci.dalej(zapisz);
  }

  return (
    <>
      <NaglowekStrony
        tytul={t.naglowek({ id: pozycja.id })}
        wstep={t.wstep}
        powrot={{ href: powrotDoWiersza, etykieta: t.powrot }}
      />
      <form noValidate onSubmit={wyslij} className="flex max-w-tresc min-w-0 flex-col gap-7.5">
        <PostepKreatora id="postep-zmiany-pozycji" krok={czesci.czesc} liczbaKrokow={czesci.liczba} nazwaKroku={t.czesci[czesc]} />
        {bladOgolny ? <Komunikat kod={bladOgolny} /> : null}

        <CzescFormularza czesci={czesci} numer={1}>
          <Karta tytul={t.sprawa.naglowek} bezLinii>
            <div className="flex max-w-160 flex-col gap-6">
              <PoleTekstowe
                id={ID_POL.tytul}
                etykieta={t.sprawa.tytul}
                podpowiedz={t.sprawa.podpowiedzTytulu}
                wartosc={formularz.tytul}
                onZmiana={(w) => zmien('tytul', w)}
                autoComplete="off"
                {...poleZLimitem('tytul')}
                wymagane
              />
              <PoleTekstuDlugiego
                id={ID_POL.warunekOpis}
                etykieta={t.sprawa.warunek}
                podpowiedz={t.sprawa.podpowiedzWarunku}
                wartosc={formularz.warunekOpis}
                onZmiana={(w) => zmien('warunekOpis', w)}
                wiersze={4}
                {...poleZLimitem('warunekOpis')}
                wymagane
              />
            </div>
          </Karta>
        </CzescFormularza>

        <CzescFormularza czesci={czesci} numer={2}>
          <Karta tytul={t.kanal.naglowek} bezLinii>
            <div className="flex max-w-160 flex-col gap-6">
              <PoleTekstuDlugiego
                id={ID_POL.instytucjaIKanal}
                etykieta={t.kanal.instytucja}
                podpowiedz={t.kanal.podpowiedzInstytucji}
                wartosc={formularz.instytucjaIKanal}
                onZmiana={(w) => zmien('instytucjaIKanal', w)}
                wiersze={2}
                {...poleZLimitem('instytucjaIKanal')}
                wymagane
              />
              <PoleTekstuDlugiego
                id={ID_POL.daneIDokumenty}
                etykieta={t.kanal.dokumenty}
                podpowiedz={t.kanal.podpowiedzDokumentow}
                wartosc={formularz.daneIDokumenty}
                onZmiana={(w) => zmien('daneIDokumenty', w)}
                wiersze={4}
                {...poleZLimitem('daneIDokumenty')}
              />
              <PoleTekstuDlugiego
                id={ID_POL.kroki}
                etykieta={t.kanal.kroki}
                podpowiedz={t.kanal.podpowiedzKrokow}
                wartosc={formularz.kroki}
                onZmiana={(w) => zmien('kroki', w)}
                wiersze={4}
                {...poleZLimitem('kroki')}
              />
            </div>
          </Karta>
        </CzescFormularza>

        <CzescFormularza czesci={czesci} numer={3}>
          <Karta tytul={t.termin.naglowek} bezLinii>
            <div className="flex max-w-160 flex-col gap-6">
              <p className="m-0">{t.termin.obecny({ opis: opisRegulyTerminu(regulaPozycji(pozycja.id, katalog), katalog) })}</p>
              <PoleWyboru
                id="regula"
                etykieta={t.termin.regula}
                podpowiedz={t.termin.podpowiedzReguly}
                opcje={TERMINY_ZMIENIANEJ_POZYCJI.map((w) => ({
                  wartosc: w,
                  etykieta: w === 'obecny' ? t.termin.opcjaObecna : kotwice[w],
                }))}
                wartosc={formularz.termin}
                onZmiana={(w) => {
                  if (w !== '') zmien('termin', w);
                }}
              />
              {formularz.termin !== 'obecny' && formularz.termin !== 'brak' ? (
                <PolePrzesuniecia
                  id={ID_POL.przesuniecie}
                  wartosc={formularz.przesuniecie}
                  jednostka={formularz.jednostkaPrzesuniecia}
                  onZmianaWartosci={(w) => zmien('przesuniecie', w)}
                  onZmianaJednostki={(j) => zmien('jednostkaPrzesuniecia', j)}
                  {...walidacja.pole('przesuniecie')}
                />
              ) : null}
            </div>
          </Karta>
          <Karta tytul={t.wylaczenie.naglowek} bezLinii className="mt-7.5">
            <div className="flex max-w-160 flex-col gap-6">
              <Notatka>
                <p>{pozycja.wylaczona ? t.wylaczenie.wylaczona : t.wylaczenie.aktywna}</p>
              </Notatka>
              <div>
                <Przycisk type="button" wariant="drugorzedny" onClick={przelaczWylaczenie} zajety={zajety}>
                  {pozycja.wylaczona ? t.wylaczenie.wlacz : t.wylaczenie.wylacz}
                </Przycisk>
              </div>
            </div>
          </Karta>
        </CzescFormularza>

        <PrzyciskiCzesci
          czesci={czesci}
          onAkcjaKroku={zapisz}
          etykietaAkcji={t.zapisz}
          onWrocKroku={() => przejdz(powrotDoWiersza)}
          zajety={zajety}
          dodatkowe={
            <PrzyciskLink href={powrotDoWiersza} wariant="drugorzedny">
              {t.anuluj}
            </PrzyciskLink>
          }
        />
      </form>
    </>
  );
}
