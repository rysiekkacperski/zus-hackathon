'use client';

// ViewCatalogItemAdd: formularz nowej pozycji katalogu (historyjka 3.5.1.2.3; wzory P04-12, P04-13).
// Dostęp konta bez roli Administrator rozstrzyga StrazDostepu (0047), a operacja dodajPozycje sprawdza rolę przy zapisie.
// Formularz ma cztery części w ?czesc=N, żeby każda mieściła się w oknie bez przewijania: sprawa (tytuł, rodzaj, etap),
// warunek (rodzic, formy zatrudnienia, ubezpieczenie chorobowe), instytucja i kanał, termin i koszt spóźnienia.
import { useState, type FormEvent } from 'react';
import { PolePrzesuniecia } from '@/app/(strefa)/panel/katalog/pozycje/nowa/_czesci/pole-przesuniecia';
import { WyborForm } from '@/app/(strefa)/panel/katalog/pozycje/nowa/_czesci/wybor-form';
import { dodajPozycje } from '@/dane/magazyn/operacje/katalog';
import { useKatalog } from '@/dane/magazyn/hooki';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import {
  ETAPY,
  KOTWICE_NOWEJ_POZYCJI,
  MAKS_DLUGOSC_OPISU,
  MAKS_DLUGOSC_TYTULU,
  RODZAJE_POZYCJI,
  RODZICE_NOWEJ_POZYCJI,
  UBEZPIECZENIA_CHOROBOWE,
  formularzNowejPozycjiPoczatkowy,
  nastepnyIdentyfikator,
  walidujNowaPozycje,
  type FormularzNowejPozycji,
  type PoleNowejPozycji,
} from '@/domena/katalog/edycja';
import type { BledyPol, KodKomunikatu } from '@/domena/typy';
import { CzescFormularza, PrzyciskiCzesci, useCzesciFormularza } from '@/komponenty/czesci-formularza';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { PostepKreatora } from '@/komponenty/kroki';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { PoleTekstowe, PoleTekstuDlugiego } from '@/komponenty/pole-tekstowe';
import { PoleWyboru } from '@/komponenty/pole-wyboru';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';

const ID_POL: Record<PoleNowejPozycji, string> = {
  tytul: 'tytul',
  rodzaj: 'rodzaj',
  etap: 'etap',
  rodzic: 'rodzic',
  formyZatrudnienia: 'formy-umowa-o-prace',
  instytucjaIKanal: 'instytucja',
  przesuniecie: 'przesuniecie',
};

const CZESCI_POZYCJI = ['sprawa', 'warunek', 'kanal', 'termin'] as const;
const PODZIAL_POZYCJI: readonly (readonly PoleNowejPozycji[])[] = [
  ['tytul', 'rodzaj', 'etap'],
  ['rodzic', 'formyZatrudnienia'],
  ['instytucjaIKanal'],
  ['przesuniecie'],
];

export function WidokDodaniaPozycjiKatalogu() {
  const t = teksty.ViewCatalogItemAdd;
  const etykiety = teksty.ViewCatalogList.etykiety;
  const katalog = useKatalog();
  const [formularz, setFormularz] = useState<FormularzNowejPozycji>(formularzNowejPozycjiPoczatkowy);
  const [bladOgolny, setBladOgolny] = useState<KodKomunikatu | null>(null);
  const { zajety: zapisywanie, ustawZajety: ustawZapisywanie, przejdz } = useNawigacjaZLadowaniem();

  const walidacja = useWalidacjaNaBiezaco({
    wartosci: formularz,
    waliduj: (f: FormularzNowejPozycji) => walidujNowaPozycje(f, katalog),
    pola: ID_POL,
  });
  const czesci = useCzesciFormularza<PoleNowejPozycji>({
    liczba: CZESCI_POZYCJI.length,
    podzial: PODZIAL_POZYCJI,
    walidacja,
  });
  const czesc = CZESCI_POZYCJI[czesci.czesc - 1];

  const lista = trasy.ViewCatalogList({ zakladka: 'pozycje' });
  const nastepnyId = nastepnyIdentyfikator(katalog);

  function zmien<P extends keyof FormularzNowejPozycji>(pole: P, wartosc: FormularzNowejPozycji[P]) {
    setFormularz((poprzedni) => ({ ...poprzedni, [pole]: wartosc }));
  }

  function zapisz() {
    if (zapisywanie) return;
    ustawZapisywanie(true);
    setBladOgolny(null);
    const wynik = dodajPozycje(formularz, pobierzKontekstOperacji());
    if (wynik.ok) {
      przejdz(lista);
      return;
    }
    ustawZapisywanie(false);
    if (!wynik.bledyPol) {
      setBladOgolny(wynik.kod);
      return;
    }
    const bledyPol = wynik.bledyPol as BledyPol<PoleNowejPozycji>;
    const numer = PODZIAL_POZYCJI.findIndex((pola) => pola.some((pole) => bledyPol[pole] !== undefined)) + 1;
    if (numer > 0) czesci.przejdzDo(numer, { bezFokusu: true });
    walidacja.pokazBledy(bledyPol);
  }

  function wyslij(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    czesci.dalej(zapisz);
  }

  return (
    <>
      <NaglowekStrony
        tytul={t.naglowek}
        wstep={t.wstep({ id: nastepnyId })}
        powrot={{ href: lista, etykieta: t.powrot }}
      />
      <form noValidate onSubmit={wyslij} className="flex max-w-tresc min-w-0 flex-col gap-7.5">
        <PostepKreatora
          id="postep-pozycji"
          krok={czesci.czesc}
          liczbaKrokow={czesci.liczba}
          nazwaKroku={t.czesci[czesc]}
        />
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
                maksDlugosc={MAKS_DLUGOSC_TYTULU}
                autoComplete="off"
                {...walidacja.pole('tytul')}
                wymagane
              />
              <PoleWyboru
                id={ID_POL.rodzaj}
                etykieta={t.sprawa.rodzaj}
                opcje={RODZAJE_POZYCJI.map((r) => ({ wartosc: r, etykieta: etykiety.rodzaje[r] }))}
                wartosc={formularz.rodzaj}
                onZmiana={(w) => zmien('rodzaj', w)}
                pustaOpcja={t.sprawa.wybierzRodzaj}
                {...walidacja.pole('rodzaj')}
                wymagane
              />
              <PoleWyboru
                id={ID_POL.etap}
                etykieta={t.sprawa.etap}
                podpowiedz={t.sprawa.podpowiedzEtapu}
                opcje={ETAPY.map((e) => ({ wartosc: e, etykieta: etykiety.etapy[e] }))}
                wartosc={formularz.etap}
                onZmiana={(w) => zmien('etap', w)}
                pustaOpcja={t.sprawa.wybierzEtap}
                {...walidacja.pole('etap')}
                wymagane
              />
            </div>
          </Karta>
        </CzescFormularza>

        <CzescFormularza czesci={czesci} numer={2}>
          <Karta tytul={t.warunek.naglowek} bezLinii>
            <div className="flex max-w-160 flex-col gap-6">
              <PoleWyboru
                id={ID_POL.rodzic}
                etykieta={t.sprawa.rodzic}
                opcje={RODZICE_NOWEJ_POZYCJI.map((r) => ({ wartosc: r, etykieta: etykiety.rodzice[r] }))}
                wartosc={formularz.rodzic}
                onZmiana={(w) => zmien('rodzic', w)}
                pustaOpcja={t.sprawa.wybierzRodzica}
                {...walidacja.pole('rodzic')}
                wymagane
              />
              <WyborForm
                wartosci={formularz.formyZatrudnienia}
                onZmiana={(w) => zmien('formyZatrudnienia', w)}
                {...walidacja.pole('formyZatrudnienia')}
              />
              <PoleWyboru
                id="chorobowe"
                etykieta={t.warunek.ubezpieczenie}
                podpowiedz={t.warunek.podpowiedzUbezpieczenia}
                opcje={UBEZPIECZENIA_CHOROBOWE.map((u) => ({ wartosc: u, etykieta: t.warunek.ubezpieczenia[u] }))}
                wartosc={formularz.ubezpieczenieChorobowe}
                onZmiana={(w) => {
                  if (w !== '') zmien('ubezpieczenieChorobowe', w);
                }}
              />
            </div>
          </Karta>
        </CzescFormularza>

        <CzescFormularza czesci={czesci} numer={3}>
          <Karta tytul={t.kanal.naglowek} bezLinii>
            <div className="flex max-w-160 flex-col gap-6">
              <PoleTekstuDlugiego
                id={ID_POL.instytucjaIKanal}
                etykieta={t.kanal.instytucja}
                podpowiedz={t.kanal.podpowiedzInstytucji}
                wartosc={formularz.instytucjaIKanal}
                onZmiana={(w) => zmien('instytucjaIKanal', w)}
                maksDlugosc={MAKS_DLUGOSC_OPISU}
                wiersze={3}
                {...walidacja.pole('instytucjaIKanal')}
                wymagane
              />
            </div>
          </Karta>
        </CzescFormularza>

        <CzescFormularza czesci={czesci} numer={4}>
          <Karta tytul={t.kanal.naglowek} bezLinii>
            <div className="flex max-w-160 flex-col gap-6">
              <PoleWyboru
                id="kotwica"
                etykieta={t.kanal.kotwica}
                podpowiedz={t.kanal.podpowiedzKotwicy}
                opcje={KOTWICE_NOWEJ_POZYCJI.map((k) => ({ wartosc: k, etykieta: t.kanal.kotwice[k] }))}
                wartosc={formularz.kotwica}
                onZmiana={(w) => {
                  if (w !== '') zmien('kotwica', w);
                }}
              />
              {formularz.kotwica === 'brak' ? (
                <Notatka>
                  <p>{t.kanal.notatkaKotwicy}</p>
                </Notatka>
              ) : (
                <PolePrzesuniecia
                  id={ID_POL.przesuniecie}
                  wartosc={formularz.przesuniecie}
                  jednostka={formularz.jednostkaPrzesuniecia}
                  onZmianaWartosci={(w) => zmien('przesuniecie', w)}
                  onZmianaJednostki={(j) => zmien('jednostkaPrzesuniecia', j)}
                  {...walidacja.pole('przesuniecie')}
                />
              )}
              <PoleTekstuDlugiego
                id="koszt"
                etykieta={t.kanal.koszt}
                podpowiedz={t.kanal.podpowiedzKosztu}
                wartosc={formularz.kosztSpoznienia}
                onZmiana={(w) => zmien('kosztSpoznienia', w)}
                maksDlugosc={MAKS_DLUGOSC_OPISU}
                wiersze={3}
              />
            </div>
          </Karta>
        </CzescFormularza>

        <PrzyciskiCzesci
          czesci={czesci}
          onAkcjaKroku={zapisz}
          etykietaAkcji={t.zapisz}
          zajety={zapisywanie}
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
