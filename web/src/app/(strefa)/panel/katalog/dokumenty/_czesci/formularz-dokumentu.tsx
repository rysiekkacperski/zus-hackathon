'use client';

// Formularz wpisu słownika dokumentów i adresatów wniosków dla ViewCatalogDocumentEdit i ViewCatalogDocumentAdd.
// Dostęp konta bez roli Administrator rozstrzyga StrazDostepu (0047), a operacja zapiszDokument sprawdza rolę przy zapisie.
// Formularz ma dwie części w ?czesc=N: świadczenie i formy zatrudnienia, potem dokumenty, adresat i termin.
import { useState, type FormEvent } from 'react';
import { WyborForm } from '@/app/(strefa)/panel/katalog/pozycje/nowa/_czesci/wybor-form';
import { kotwicaDokumentu, zapiszDokument } from '@/dane/magazyn/operacje/katalog';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import {
  GRUPY_DOKUMENTOW,
  maksDlugoscPolaDokumentu,
  walidujDokument,
  type FormularzDokumentu,
  type PoleDokumentu,
} from '@/domena/katalog/edycja-panelu';
import type { BledyPol, KodKomunikatu } from '@/domena/typy';
import { CzescFormularza, PrzyciskiCzesci, useCzesciFormularza } from '@/komponenty/czesci-formularza';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { PostepKreatora } from '@/komponenty/kroki';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { PoleTekstowe, PoleTekstuDlugiego } from '@/komponenty/pole-tekstowe';
import { PoleWyboru } from '@/komponenty/pole-wyboru';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';

const ID_POL: Record<PoleDokumentu, string> = {
  grupa: 'grupa',
  swiadczenieAlboWniosek: 'nazwa',
  formy: 'formy-umowa-o-prace',
  dokumenty: 'dokumenty',
  adresat: 'adresat',
  termin: 'termin',
};

const PODZIAL: readonly (readonly PoleDokumentu[])[] = [
  ['grupa', 'swiadczenieAlboWniosek', 'formy'],
  ['dokumenty', 'adresat', 'termin'],
];

export interface FormularzDokumentuProps {
  /** Identyfikator zmienianego wpisu; brak oznacza nowy wpis. */
  idDokumentu?: string;
  poczatkowy: FormularzDokumentu;
}

export function FormularzDokumentuKatalogu({ idDokumentu, poczatkowy }: FormularzDokumentuProps) {
  const t = teksty.ViewCatalogDocumentEdit;
  const grupy = teksty.ViewCatalogList.zakladkaDokumentow.grupy;
  const [formularz, setFormularz] = useState<FormularzDokumentu>(poczatkowy);
  const [bladOgolny, setBladOgolny] = useState<KodKomunikatu | null>(null);
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const lista = trasy.ViewCatalogList({ zakladka: 'dokumenty' });
  const powrot = idDokumentu === undefined ? lista : `${lista}#${kotwicaDokumentu(idDokumentu)}`;

  const walidacja = useWalidacjaNaBiezaco({
    wartosci: formularz,
    waliduj: (f: FormularzDokumentu) => walidujDokument(f),
    pola: ID_POL,
  });
  const czesci = useCzesciFormularza<PoleDokumentu>({ liczba: PODZIAL.length, podzial: PODZIAL, walidacja });

  function poleZLimitem(pole: PoleDokumentu) {
    const propsy = walidacja.pole(pole);
    return {
      ...propsy,
      parametryBledu: propsy.blad === '0271' ? { liczbaZnakow: String(maksDlugoscPolaDokumentu(pole)) } : undefined,
    };
  }

  function zmien<P extends keyof FormularzDokumentu>(pole: P, wartosc: FormularzDokumentu[P]) {
    setFormularz((poprzedni) => ({ ...poprzedni, [pole]: wartosc }));
  }

  function zapisz() {
    if (zajety) return;
    ustawZajety(true);
    setBladOgolny(null);
    const wynik = zapiszDokument(idDokumentu, formularz, pobierzKontekstOperacji());
    if (wynik.ok) {
      przejdz(`${lista}#${kotwicaDokumentu(wynik.wartosc.id)}`);
      return;
    }
    ustawZajety(false);
    if (!wynik.bledyPol) {
      setBladOgolny(wynik.kod);
      return;
    }
    const bledyPol = wynik.bledyPol as BledyPol<PoleDokumentu>;
    const numer = PODZIAL.findIndex((pola) => pola.some((pole) => bledyPol[pole] !== undefined)) + 1;
    if (numer > 0) czesci.przejdzDo(numer, { bezFokusu: true });
    walidacja.pokazBledy(bledyPol);
  }

  function wyslij(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    czesci.dalej(zapisz);
  }

  const naglowek = idDokumentu === undefined ? t.naglowekNowego : t.naglowekZmiany;
  const nazwaCzesci = czesci.czesc === 1 ? t.nazwa : t.dokumenty;

  return (
    <>
      <NaglowekStrony tytul={naglowek} wstep={t.wstep} powrot={{ href: powrot, etykieta: t.powrot }} />
      <form noValidate onSubmit={wyslij} className="flex max-w-tresc min-w-0 flex-col gap-7.5">
        <PostepKreatora id="postep-dokumentu" krok={czesci.czesc} liczbaKrokow={czesci.liczba} nazwaKroku={nazwaCzesci} />
        {bladOgolny ? <Komunikat kod={bladOgolny} /> : null}

        <CzescFormularza czesci={czesci} numer={1}>
          <Karta tytul={t.nazwa} bezLinii>
            <div className="flex max-w-160 flex-col gap-6">
              <PoleWyboru
                id={ID_POL.grupa}
                etykieta={t.grupa}
                opcje={GRUPY_DOKUMENTOW.map((g) => ({ wartosc: g, etykieta: grupy[g] }))}
                wartosc={formularz.grupa}
                onZmiana={(w) => zmien('grupa', w)}
                pustaOpcja={t.wybierzGrupe}
                {...walidacja.pole('grupa')}
                wymagane
              />
              <PoleTekstowe
                id={ID_POL.swiadczenieAlboWniosek}
                etykieta={t.nazwa}
                podpowiedz={t.podpowiedzNazwy}
                wartosc={formularz.swiadczenieAlboWniosek}
                onZmiana={(w) => zmien('swiadczenieAlboWniosek', w)}
                autoComplete="off"
                {...poleZLimitem('swiadczenieAlboWniosek')}
                wymagane
              />
              <WyborForm
                wartosci={formularz.formy}
                onZmiana={(w) => zmien('formy', w)}
                podpowiedz={t.podpowiedzForm}
                {...walidacja.pole('formy')}
              />
            </div>
          </Karta>
        </CzescFormularza>

        <CzescFormularza czesci={czesci} numer={2}>
          <Karta tytul={t.dokumenty} bezLinii>
            <div className="flex max-w-160 flex-col gap-6">
              <PoleTekstuDlugiego
                id={ID_POL.dokumenty}
                etykieta={t.dokumenty}
                podpowiedz={t.podpowiedzDokumentow}
                wartosc={formularz.dokumenty}
                onZmiana={(w) => zmien('dokumenty', w)}
                wiersze={4}
                {...poleZLimitem('dokumenty')}
                wymagane
              />
              <PoleTekstuDlugiego
                id={ID_POL.adresat}
                etykieta={t.adresat}
                podpowiedz={t.podpowiedzAdresata}
                wartosc={formularz.adresat}
                onZmiana={(w) => zmien('adresat', w)}
                wiersze={2}
                {...poleZLimitem('adresat')}
                wymagane
              />
              <PoleTekstuDlugiego
                id={ID_POL.termin}
                etykieta={t.termin}
                podpowiedz={t.podpowiedzTerminu}
                wartosc={formularz.termin}
                onZmiana={(w) => zmien('termin', w)}
                wiersze={2}
                {...poleZLimitem('termin')}
                wymagane
              />
            </div>
          </Karta>
        </CzescFormularza>

        <PrzyciskiCzesci
          czesci={czesci}
          onAkcjaKroku={zapisz}
          etykietaAkcji={t.zapisz}
          onWrocKroku={() => przejdz(powrot)}
          zajety={zajety}
          dodatkowe={
            <PrzyciskLink href={powrot} wariant="drugorzedny">
              {t.anuluj}
            </PrzyciskLink>
          }
        />
      </form>
    </>
  );
}
