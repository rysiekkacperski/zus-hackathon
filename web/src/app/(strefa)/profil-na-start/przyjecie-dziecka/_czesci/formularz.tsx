'use client';

// Formularz danych przyjęcia dziecka ViewProfileChildAdoption (wzory P21-02..P21-07). Właściciel: u24.
// Formularz ma trzy części (?czesc=N): rola i forma przyjęcia, daty, liczba dzieci.
import { useState, type FormEvent } from 'react';
import { CzescFormularza, useCzesciFormularza } from '@/komponenty/czesci-formularza';
import { GrupaOpcji } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { PoleDaty } from '@/komponenty/pole-tekstowe';
import { Przycisk } from '@/komponenty/przycisk';
import { Stos } from '@/komponenty/uklad';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { zapiszDanePrzyjeciaWSzkicu } from '@/dane/magazyn/operacje/przyjecie';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { formatujDate } from '@/domena/daty';
import { CZESCI_PRZYJECIA_DZIECKA } from '@/domena/profil/nawigacja';
import {
  najpozniejszaDataPrzyjecia,
  walidujDanePrzyjecia,
  type FormularzPrzyjecia,
  type OdpowiedzTakNie,
  type PoleFormularzaPrzyjecia,
  type RolaRodzicaPrzyjmujacego,
} from '@/domena/rodzina/przyjecie';
import type { BledyPol, DataISO, FormaPrzyjecia, KodKomunikatu, LiczbaDzieci } from '@/domena/typy';
import { teksty } from '@/teksty';
import { PostepPrzyjecia } from './boczne';

const t = teksty.ViewProfileChildAdoption;

const LICZBY: readonly LiczbaDzieci[] = [1, 2, 3, 4, 5];
type TekstLiczby = '1' | '2' | '3' | '4' | '5';

// Cel fokusu pola z błędem w kolejności pól na ekranie: identyfikator pola daty albo nazwa grupy opcji.
const ID_POLA = {
  rola: 'przyjecie-rola',
  forma: 'przyjecie-forma',
  dataPrzyjecia: 'przyjecie-data-przyjecia',
  dataUrodzenia: 'przyjecie-data-urodzenia',
  odroczenie: 'przyjecie-odroczenie',
  dataUprawomocnienia: 'przyjecie-data-uprawomocnienia',
  liczbaDzieci: 'przyjecie-liczba',
} as const satisfies Record<PoleFormularzaPrzyjecia, string>;

const PODZIAL: readonly (readonly PoleFormularzaPrzyjecia[])[] = [
  ['rola', 'forma'],
  ['dataPrzyjecia', 'dataUrodzenia', 'odroczenie', 'dataUprawomocnienia'],
  ['liczbaDzieci'],
];

// Data uprawomocnienia się orzeczenia jest nieobowiązkowa.
const WYMAGANE: readonly PoleFormularzaPrzyjecia[] = [
  'rola',
  'forma',
  'dataPrzyjecia',
  'dataUrodzenia',
  'odroczenie',
  'liczbaDzieci',
];

export interface FormularzDanychPrzyjeciaProps {
  poczatkowy: FormularzPrzyjecia;
  dzis: DataISO;
  trybZmiany: boolean;
  zapisanaDataPrzyjecia?: string;
  adresWstecz: string;
  /** Adres po zapisie danych w szkicu. */
  adresDalej: string;
  /** Postęp kreatora nad formularzem (tryb profilu na start). */
  pokazPostep: boolean;
}

export function FormularzDanychPrzyjecia({
  poczatkowy,
  dzis,
  trybZmiany,
  zapisanaDataPrzyjecia,
  adresWstecz,
  adresDalej,
  pokazPostep,
}: FormularzDanychPrzyjeciaProps) {
  const [f, ustawF] = useState<FormularzPrzyjecia>(poczatkowy);
  const [bladOgolny, ustawBladOgolny] = useState<KodKomunikatu | null>(null);
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const walidacja = useWalidacjaNaBiezaco({
    wartosci: f,
    waliduj: (w: FormularzPrzyjecia) => walidujDanePrzyjecia(w, dzis),
    pola: ID_POLA,
    wymagane: WYMAGANE,
  });
  const czesci = useCzesciFormularza({ liczba: CZESCI_PRZYJECIA_DZIECKA, podzial: PODZIAL, walidacja });

  const zmien = <P extends PoleFormularzaPrzyjecia>(pole: P, wartosc: FormularzPrzyjecia[P]) =>
    ustawF((poprzedni) => ({ ...poprzedni, [pole]: wartosc }));

  /** Błędy z zapisu: część z pierwszym polem z błędem i fokus na tym polu. */
  const pokazBledyZapisu = (nowe: BledyPol<PoleFormularzaPrzyjecia>) => {
    const indeks = PODZIAL.findIndex((pola) => pola.some((pole) => nowe[pole] !== undefined));
    if (indeks >= 0 && indeks + 1 !== czesci.czesc) czesci.przejdzDo(indeks + 1, { bezFokusu: true });
    walidacja.pokazBledy(nowe);
  };

  const zapisz = () => {
    ustawBladOgolny(null);
    ustawZajety(true);
    const wynik = zapiszDanePrzyjeciaWSzkicu(f, pobierzKontekstOperacji());
    if (wynik.ok) {
      przejdz(adresDalej);
      return;
    }
    ustawZajety(false);
    if (wynik.bledyPol) pokazBledyZapisu(wynik.bledyPol as BledyPol<PoleFormularzaPrzyjecia>);
    else ustawBladOgolny(wynik.kod);
  };

  const wyslij = (zdarzenie: FormEvent<HTMLFormElement>) => {
    zdarzenie.preventDefault();
    if (zajety) return;
    czesci.dalej(zapisz);
  };

  const podpowiedzPrzyjecia = [
    t.dataPrzyjecia.podpowiedz({ data: formatujDate(najpozniejszaDataPrzyjecia(dzis)) }),
    zapisanaDataPrzyjecia ? t.dataPrzyjecia.zapisana({ data: zapisanaDataPrzyjecia }) : null,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <form noValidate onSubmit={wyslij} className="flex min-w-0 flex-col gap-7.5">
      {pokazPostep ? <PostepPrzyjecia czesc={czesci.czesc} /> : null}
      <Karta tytul={t.tytulKarty} bezLinii>
        {czesci.czyPierwsza ? <p className="mt-0 mb-6">{trybZmiany ? t.opisKartyZmiany : t.opisKarty}</p> : null}
        <Stos odstep={6}>
          {bladOgolny ? <Komunikat kod={bladOgolny} /> : null}
          <CzescFormularza czesci={czesci} numer={1}>
            <GrupaOpcji<RolaRodzicaPrzyjmujacego>
              nazwa="przyjecie-rola"
              legenda={t.rola.legenda}
              podpowiedz={trybZmiany ? undefined : t.rola.podpowiedz}
              uklad="poziomo"
              opcje={[
                { wartosc: 'matka', etykieta: t.rola.matka },
                { wartosc: 'ojciec', etykieta: t.rola.ojciec },
              ]}
              wartosc={f.rola}
              onZmiana={(w) => zmien('rola', w)}
              {...walidacja.pole('rola')}
            />
            <GrupaOpcji<FormaPrzyjecia>
              nazwa="przyjecie-forma"
              legenda={t.forma.legenda}
              uklad="karty"
              opcje={[
                { wartosc: 'przysposobienie', etykieta: t.forma.przysposobienie, opis: t.forma.opisPrzysposobienia },
                { wartosc: 'rodzina-zastepcza-niezawodowa', etykieta: t.forma.niezawodowa },
                { wartosc: 'rodzina-zastepcza-zawodowa', etykieta: t.forma.zawodowa },
              ]}
              wartosc={f.forma}
              onZmiana={(w) => zmien('forma', w)}
              {...walidacja.pole('forma')}
            />
          </CzescFormularza>
          <CzescFormularza czesci={czesci} numer={2}>
            <PoleDaty
              id={ID_POLA.dataPrzyjecia}
              etykieta={t.dataPrzyjecia.etykieta}
              podpowiedz={podpowiedzPrzyjecia}
              wartosc={f.dataPrzyjecia}
              onZmiana={(w) => zmien('dataPrzyjecia', w)}
              {...walidacja.pole('dataPrzyjecia')}
              szerokosc="waska"
            />
            <PoleDaty
              id={ID_POLA.dataUrodzenia}
              etykieta={t.dataUrodzenia.etykieta}
              podpowiedz={t.dataUrodzenia.podpowiedz}
              wartosc={f.dataUrodzenia}
              onZmiana={(w) => zmien('dataUrodzenia', w)}
              {...walidacja.pole('dataUrodzenia')}
              szerokosc="waska"
            />
            {f.forma === 'rodzina-zastepcza-niezawodowa' ? (
              <GrupaOpcji<OdpowiedzTakNie>
                nazwa="przyjecie-odroczenie"
                legenda={t.odroczenie.legenda}
                uklad="poziomo"
                opcje={[
                  { wartosc: 'tak', etykieta: t.odroczenie.tak },
                  { wartosc: 'nie', etykieta: t.odroczenie.nie },
                ]}
                wartosc={f.odroczenie}
                onZmiana={(w) => zmien('odroczenie', w)}
                {...walidacja.pole('odroczenie')}
              />
            ) : null}
            {f.forma === 'przysposobienie' ? (
              <PoleDaty
                id={ID_POLA.dataUprawomocnienia}
                etykieta={t.dataUprawomocnienia.etykieta}
                podpowiedz={t.dataUprawomocnienia.podpowiedz}
                wartosc={f.dataUprawomocnienia}
                onZmiana={(w) => zmien('dataUprawomocnienia', w)}
                {...walidacja.pole('dataUprawomocnienia')}
                szerokosc="waska"
              />
            ) : null}
          </CzescFormularza>
          <CzescFormularza czesci={czesci} numer={3}>
            <GrupaOpcji<TekstLiczby>
              nazwa="przyjecie-liczba"
              legenda={t.liczbaDzieci.legenda}
              uklad="poziomo"
              opcje={LICZBY.map((l) => ({ wartosc: String(l) as TekstLiczby, etykieta: t.liczbaDzieci.opcje[l] }))}
              wartosc={f.liczbaDzieci === null ? null : (String(f.liczbaDzieci) as TekstLiczby)}
              onZmiana={(w) => zmien('liczbaDzieci', Number(w) as LiczbaDzieci)}
              {...walidacja.pole('liczbaDzieci')}
            />
            {trybZmiany ? null : <Notatka>{t.notatkaSciezki}</Notatka>}
          </CzescFormularza>
        </Stos>
      </Karta>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Przycisk wariant="drugorzedny" disabled={zajety} onClick={() => czesci.wroc(() => przejdz(adresWstecz))}>
          {t.wstecz}
        </Przycisk>
        <Przycisk type="submit" wariant="glowny" zajety={zajety}>
          {t.dalej}
        </Przycisk>
      </div>
    </form>
  );
}
