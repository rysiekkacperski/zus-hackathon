'use client';

// Formularz dodania i zmiany organizacji na ViewCatalogSupportOrganizations (wzory cz2/P18-17, P18-18, P18-19, P18-21).
// Właściciel: u22. Błąd pola pokazuje się po opuszczeniu pola, a próba przejścia dalej pokazuje błędy części i przenosi
// fokus do pierwszego pola z błędem. Formularz ma trzy części w ?czesc=N (organizacja, sytuacje, kontakt), żeby każda
// mieściła się w oknie bez przewijania.
import { useState, type FormEvent } from 'react';
import { useKatalog } from '@/dane/magazyn/hooki';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { zapiszPodmiotWsparcia } from '@/dane/magazyn/operacje/ryzyka-i-podmioty';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import {
  SYTUACJE_SZCZEGOLNE,
  formularzZPodmiotu,
  pustyFormularzPodmiotu,
  walidujPodmiot,
  type FormularzPodmiotu,
  type PolePodmiotu,
} from '@/domena/przewodnik/ryzyka';
import type { BledyPol, KodKomunikatu, PodmiotWsparcia } from '@/domena/typy';
import { CzescFormularza, PrzyciskiCzesci, useCzesciFormularza } from '@/komponenty/czesci-formularza';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { PostepKreatora } from '@/komponenty/kroki';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { BladPola, idBledu, opuszczonoKontener } from '@/komponenty/pole';
import { PoleTekstowe, PoleTekstuDlugiego } from '@/komponenty/pole-tekstowe';
import { PoleZaznaczenia } from '@/komponenty/pole-zaznaczenia';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';

const tekst = teksty.ViewCatalogSupportOrganizations;
const tf = tekst.formularz;
const etykietySytuacji = teksty.ViewSupportOrganizations.sytuacje;

// Kolejność pól na ekranie i cel fokusu; grupa sytuacji przez id fieldset.
const ID_POL: Record<PolePodmiotu, string> = {
  nazwa: 'org-nazwa',
  zakresPomocy: 'org-zakres',
  sytuacje: 'org-sytuacje',
  telefon: 'org-telefon',
  email: 'org-email',
  adresStrony: 'org-strona',
  krs: 'org-krs',
  charytatywny: 'org-charytatywna',
};

const CZESCI_PODMIOTU = ['organizacja', 'sytuacje', 'kontakt'] as const;
const PODZIAL_PODMIOTU: readonly (readonly PolePodmiotu[])[] = [
  ['nazwa', 'krs', 'zakresPomocy'],
  ['sytuacje'],
  ['telefon', 'email', 'adresStrony', 'charytatywny'],
];

function Formularz({ poczatkowy, edycja }: { poczatkowy: FormularzPodmiotu; edycja?: PodmiotWsparcia }) {
  const katalog = useKatalog();
  const [f, setF] = useState<FormularzPodmiotu>(poczatkowy);
  const [bladZapisu, setBladZapisu] = useState<KodKomunikatu | null>(null);
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const adresListy = sciezkaWidoku('ViewCatalogSupportOrganizations');

  const walidacja = useWalidacjaNaBiezaco({
    wartosci: f,
    waliduj: (w: FormularzPodmiotu) => walidujPodmiot(w, katalog),
    pola: ID_POL,
  });
  const czesci = useCzesciFormularza<PolePodmiotu>({
    liczba: CZESCI_PODMIOTU.length,
    podzial: PODZIAL_PODMIOTU,
    walidacja,
  });
  const czesc = CZESCI_PODMIOTU[czesci.czesc - 1];
  const bladSytuacji = walidacja.blad('sytuacje');

  function zmien<P extends keyof FormularzPodmiotu>(pole: P & PolePodmiotu, wartosc: FormularzPodmiotu[P]) {
    setF((obecny) => ({ ...obecny, [pole]: wartosc }));
  }

  function zapisz() {
    if (zajety) return;
    setBladZapisu(null);
    ustawZajety(true);
    const wynik = zapiszPodmiotWsparcia(f, pobierzKontekstOperacji());
    if (wynik.ok) {
      ustawKomunikatPoPrzejsciu({ kod: '0051', dlaWidoku: 'ViewCatalogSupportOrganizations' });
      przejdz(adresListy);
      return;
    }
    ustawZajety(false);
    if (wynik.bledyPol) {
      const bledyPol = wynik.bledyPol as BledyPol<PolePodmiotu>;
      const numer = PODZIAL_PODMIOTU.findIndex((pola) => pola.some((pole) => bledyPol[pole] !== undefined)) + 1;
      if (numer > 0) czesci.przejdzDo(numer, { bezFokusu: true });
      walidacja.pokazBledy(bledyPol);
      return;
    }
    setBladZapisu(wynik.kod);
  }

  function wyslij(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    czesci.dalej(zapisz);
  }

  function przelaczSytuacje(sytuacja: (typeof SYTUACJE_SZCZEGOLNE)[number], zaznaczone: boolean) {
    const zbior = new Set(f.sytuacje);
    if (zaznaczone) zbior.add(sytuacja);
    else zbior.delete(sytuacja);
    zmien('sytuacje', SYTUACJE_SZCZEGOLNE.filter((s) => zbior.has(s)));
    walidacja.onOpuszczenie('sytuacje');
  }

  return (
    <>
      <NaglowekStrony
        tytul={edycja ? tekst.tytulyTrybow.edycja : tekst.tytulyTrybow.nowa}
        wstep={edycja ? tf.wstepEdycja({ nazwa: edycja.nazwa }) : tf.wstepNowa}
        powrot={{ href: adresListy, etykieta: tf.powrot }}
      />
      <form noValidate onSubmit={wyslij} className="flex max-w-tresc min-w-0 flex-col gap-7.5">
        <PostepKreatora
          id="postep-organizacji"
          krok={czesci.czesc}
          liczbaKrokow={czesci.liczba}
          nazwaKroku={tekst.czesciFormularza[czesc]}
        />
        {bladZapisu ? <Komunikat kod={bladZapisu} /> : null}
        <Karta tytul={tekst.czesciFormularza[czesc]} bezLinii>
          <div className="grid max-w-180 gap-6">
            <CzescFormularza czesci={czesci} numer={1}>
              <PoleTekstowe
                id={ID_POL.nazwa}
                etykieta={tf.nazwa}
                wartosc={f.nazwa}
                onZmiana={(w) => zmien('nazwa', w)}
                {...walidacja.pole('nazwa')}
                autoComplete="off"
              />
              <PoleTekstowe
                id={ID_POL.krs}
                etykieta={tf.krs}
                podpowiedz={tf.krsPodpowiedz}
                inputMode="numeric"
                autoComplete="off"
                szerokosc="srednia"
                wartosc={f.krs}
                onZmiana={(w) => zmien('krs', w)}
                {...walidacja.pole('krs')}
              />
              <PoleTekstuDlugiego
                id={ID_POL.zakresPomocy}
                etykieta={tf.zakres}
                wartosc={f.zakresPomocy}
                onZmiana={(w) => zmien('zakresPomocy', w)}
                {...walidacja.pole('zakresPomocy')}
                wiersze={4}
              />
            </CzescFormularza>
            <CzescFormularza czesci={czesci} numer={2}>
              <fieldset
                id={ID_POL.sytuacje}
                aria-describedby={bladSytuacji ? `org-sytuacje-podpowiedz ${idBledu(ID_POL.sytuacje)}` : 'org-sytuacje-podpowiedz'}
                onBlur={(e) => {
                  if (opuszczonoKontener(e)) walidacja.onOpuszczenie('sytuacje');
                }}
                className="m-0 min-w-0 border-0 p-0"
              >
                <legend className="m-0 mb-1 p-0 text-body-strong">{tf.sytuacje}</legend>
                <p id="org-sytuacje-podpowiedz" className="m-0 mb-3 text-body">
                  {tf.sytuacjePodpowiedz}
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  {SYTUACJE_SZCZEGOLNE.map((s) => (
                    <PoleZaznaczenia
                      key={s}
                      id={`org-sytuacje-${s}`}
                      nazwa="sytuacje"
                      etykieta={etykietySytuacji[s]}
                      zaznaczone={f.sytuacje.includes(s)}
                      onZmiana={(z) => przelaczSytuacje(s, z)}
                      nieprawidlowe={bladSytuacji !== null}
                      className="flex-[1_1_18.75rem]"
                    />
                  ))}
                </div>
                {bladSytuacji ? <BladPola id={idBledu(ID_POL.sytuacje)} kod={bladSytuacji} className="mt-3" /> : null}
              </fieldset>
            </CzescFormularza>
            <CzescFormularza czesci={czesci} numer={3}>
              <PoleTekstowe
                id={ID_POL.telefon}
                etykieta={tf.telefon}
                podpowiedz={tf.telefonPodpowiedz}
                typ="tel"
                inputMode="tel"
                autoComplete="off"
                wartosc={f.telefon}
                onZmiana={(w) => zmien('telefon', w)}
                {...walidacja.pole('telefon')}
              />
              <PoleTekstowe
                id={ID_POL.email}
                etykieta={tf.email}
                typ="email"
                inputMode="email"
                autoComplete="off"
                wartosc={f.email}
                onZmiana={(w) => zmien('email', w)}
                {...walidacja.pole('email')}
              />
              <PoleTekstowe
                id={ID_POL.adresStrony}
                etykieta={tf.strona}
                podpowiedz={tf.stronaPodpowiedz}
                autoComplete="off"
                wartosc={f.adresStrony}
                onZmiana={(w) => zmien('adresStrony', w)}
                {...walidacja.pole('adresStrony')}
              />
              <PoleZaznaczenia
                id={ID_POL.charytatywny}
                etykieta={tf.charytatywny}
                opis={tf.charytatywnyOpis}
                zaznaczone={f.charytatywny}
                onZmiana={(z) => zmien('charytatywny', z)}
                {...walidacja.pole('charytatywny')}
              />
            </CzescFormularza>
          </div>
        </Karta>
        <PrzyciskiCzesci
          czesci={czesci}
          onAkcjaKroku={zapisz}
          etykietaAkcji={tf.zapisz}
          zajety={zajety}
          dodatkowe={
            <PrzyciskLink href={adresListy} wariant="drugorzedny">
              {tf.anuluj}
            </PrzyciskLink>
          }
        />
      </form>
    </>
  );
}

export function FormularzPodmiotuWsparcia({ idOrganizacji }: { idOrganizacji?: string }) {
  const katalog = useKatalog();
  if (idOrganizacji === undefined) return <Formularz poczatkowy={pustyFormularzPodmiotu()} />;
  const podmiot = katalog.podmiotyWsparcia.find((p) => p.id === idOrganizacji);
  if (podmiot === undefined) {
    return (
      <>
        <NaglowekStrony
          tytul={tekst.tytulyTrybow.edycja}
          powrot={{ href: sciezkaWidoku('ViewCatalogSupportOrganizations'), etykieta: tf.powrot }}
        />
        <StanPusty
          ikona="serce"
          akcja={
            <PrzyciskLink href={sciezkaWidoku('ViewCatalogSupportOrganizations')} wariant="drugorzedny">
              {tf.wrocDoListy}
            </PrzyciskLink>
          }
        >
          {tf.nieZnaleziono}
        </StanPusty>
      </>
    );
  }
  return <Formularz key={podmiot.id} poczatkowy={formularzZPodmiotu(podmiot)} edycja={podmiot} />;
}
