'use client';

// Formularz dodania i zmiany organizacji na ViewCatalogSupportOrganizations (wzory cz2/P18-17, P18-18, P18-19, P18-21).
// Właściciel: u22. Walidacja przy zapisie pokazuje wszystkie błędy naraz i przenosi fokus do pierwszego pola z błędem.
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useKatalog } from '@/dane/magazyn/hooki';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { zapiszPodmiotWsparcia } from '@/dane/magazyn/operacje/ryzyka-i-podmioty';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import {
  POLA_PODMIOTU,
  SYTUACJE_SZCZEGOLNE,
  formularzZPodmiotu,
  pustyFormularzPodmiotu,
  walidujPodmiot,
  type FormularzPodmiotu,
  type PolePodmiotu,
} from '@/domena/przewodnik/ryzyka';
import type { BledyPol, KodKomunikatu, PodmiotWsparcia } from '@/domena/typy';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { BladPola, idBledu } from '@/komponenty/pole';
import { PoleTekstowe, PoleTekstuDlugiego } from '@/komponenty/pole-tekstowe';
import { PoleZaznaczenia } from '@/komponenty/pole-zaznaczenia';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { teksty } from '@/teksty';

const tekst = teksty.ViewCatalogSupportOrganizations;
const tf = tekst.formularz;
const etykietySytuacji = teksty.ViewSupportOrganizations.sytuacje;

const ID_POL: Record<PolePodmiotu, string> = {
  nazwa: 'org-nazwa',
  sytuacje: `org-sytuacje-${SYTUACJE_SZCZEGOLNE[0]}`,
  zakresPomocy: 'org-zakres',
  telefon: 'org-telefon',
  email: 'org-email',
  adresStrony: 'org-strona',
  charytatywny: 'org-charytatywna',
};

function Formularz({ poczatkowy, edycja }: { poczatkowy: FormularzPodmiotu; edycja?: PodmiotWsparcia }) {
  const router = useRouter();
  const katalog = useKatalog();
  const [f, setF] = useState<FormularzPodmiotu>(poczatkowy);
  const [bledy, setBledy] = useState<BledyPol<PolePodmiotu>>({});
  const [bladZapisu, setBladZapisu] = useState<KodKomunikatu | null>(null);
  const [zajety, setZajety] = useState(false);
  const adresListy = sciezkaWidoku('ViewCatalogSupportOrganizations');

  function zmien<P extends keyof FormularzPodmiotu>(pole: P & PolePodmiotu, wartosc: FormularzPodmiotu[P]) {
    setF((obecny) => ({ ...obecny, [pole]: wartosc }));
    setBledy((obecne) => {
      if (obecne[pole] === undefined) return obecne;
      const nowe = { ...obecne };
      delete nowe[pole];
      return nowe;
    });
  }

  function pokazBledy(nowe: BledyPol<PolePodmiotu>) {
    setBledy(nowe);
    const pierwsze = POLA_PODMIOTU.find((p) => nowe[p] !== undefined);
    if (pierwsze) document.getElementById(ID_POL[pierwsze])?.focus();
  }

  function zapisz(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBladZapisu(null);
    const nowe = walidujPodmiot(f, katalog);
    if (POLA_PODMIOTU.some((p) => nowe[p] !== undefined)) {
      pokazBledy(nowe);
      return;
    }
    setZajety(true);
    const wynik = zapiszPodmiotWsparcia(f, pobierzKontekstOperacji());
    setZajety(false);
    if (wynik.ok) {
      ustawKomunikatPoPrzejsciu({ kod: '0051', dlaWidoku: 'ViewCatalogSupportOrganizations' });
      router.push(adresListy);
      return;
    }
    if (wynik.bledyPol) {
      pokazBledy(wynik.bledyPol as BledyPol<PolePodmiotu>);
      return;
    }
    setBladZapisu(wynik.kod);
  }

  function przelaczSytuacje(sytuacja: (typeof SYTUACJE_SZCZEGOLNE)[number], zaznaczone: boolean) {
    const zbior = new Set(f.sytuacje);
    if (zaznaczone) zbior.add(sytuacja);
    else zbior.delete(sytuacja);
    zmien('sytuacje', SYTUACJE_SZCZEGOLNE.filter((s) => zbior.has(s)));
  }

  return (
    <>
      <NaglowekStrony
        tytul={edycja ? tekst.tytulyTrybow.edycja : tekst.tytulyTrybow.nowa}
        wstep={edycja ? tf.wstepEdycja({ nazwa: edycja.nazwa }) : tf.wstepNowa}
        powrot={{ href: adresListy, etykieta: tf.powrot }}
      />
      <Karta tytul={tf.dane} bezLinii className="max-w-tresc">
        <form noValidate onSubmit={zapisz} className="grid max-w-180 gap-6">
          {bladZapisu ? <Komunikat kod={bladZapisu} /> : null}
          <PoleTekstowe
            id="org-nazwa"
            etykieta={tf.nazwa}
            wartosc={f.nazwa}
            onZmiana={(w) => zmien('nazwa', w)}
            blad={bledy.nazwa ?? null}
            autoComplete="off"
          />
          <fieldset
            id="org-sytuacje"
            aria-describedby={bledy.sytuacje ? `org-sytuacje-podpowiedz ${idBledu('org-sytuacje')}` : 'org-sytuacje-podpowiedz'}
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
                  className="flex-[1_1_300px]"
                />
              ))}
            </div>
            {bledy.sytuacje ? <BladPola id={idBledu('org-sytuacje')} kod={bledy.sytuacje} className="mt-3" /> : null}
          </fieldset>
          <PoleTekstuDlugiego
            id="org-zakres"
            etykieta={tf.zakres}
            wartosc={f.zakresPomocy}
            onZmiana={(w) => zmien('zakresPomocy', w)}
            blad={bledy.zakresPomocy ?? null}
            wiersze={4}
          />
          <PoleTekstowe
            id="org-telefon"
            etykieta={tf.telefon}
            podpowiedz={tf.telefonPodpowiedz}
            typ="tel"
            inputMode="tel"
            autoComplete="off"
            wartosc={f.telefon}
            onZmiana={(w) => zmien('telefon', w)}
            blad={bledy.telefon ?? null}
          />
          <PoleTekstowe
            id="org-email"
            etykieta={tf.email}
            typ="email"
            inputMode="email"
            autoComplete="off"
            wartosc={f.email}
            onZmiana={(w) => zmien('email', w)}
            blad={bledy.email ?? null}
          />
          <PoleTekstowe
            id="org-strona"
            etykieta={tf.strona}
            podpowiedz={tf.stronaPodpowiedz}
            autoComplete="off"
            wartosc={f.adresStrony}
            onZmiana={(w) => zmien('adresStrony', w)}
            blad={bledy.adresStrony ?? null}
          />
          <PoleZaznaczenia
            id="org-charytatywna"
            etykieta={tf.charytatywny}
            zaznaczone={f.charytatywny}
            onZmiana={(z) => zmien('charytatywny', z)}
            blad={bledy.charytatywny ?? null}
          />
          <div className="mt-2 flex flex-wrap gap-4">
            <Przycisk type="submit" wariant="glowny" zajety={zajety}>
              {tf.zapisz}
            </Przycisk>
            <PrzyciskLink href={adresListy} wariant="drugorzedny">
              {tf.anuluj}
            </PrzyciskLink>
          </div>
        </form>
      </Karta>
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
