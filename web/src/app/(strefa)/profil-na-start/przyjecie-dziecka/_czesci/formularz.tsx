'use client';

// Formularz danych przyjęcia dziecka ViewProfileChildAdoption (wzory P21-02..P21-07). Właściciel: u24.
import { useState, type FormEvent } from 'react';
import { GrupaOpcji, idOpcjiGrupy } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { Notatka } from '@/komponenty/notatka';
import { PoleDaty } from '@/komponenty/pole-tekstowe';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { Stos } from '@/komponenty/uklad';
import { zapiszDanePrzyjeciaWSzkicu } from '@/dane/magazyn/operacje/przyjecie';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { formatujDate } from '@/domena/daty';
import {
  KOLEJNOSC_POL_PRZYJECIA,
  najpozniejszaDataPrzyjecia,
  walidujDanePrzyjecia,
  type FormularzPrzyjecia,
  type OdpowiedzTakNie,
  type PoleFormularzaPrzyjecia,
  type RolaRodzicaPrzyjmujacego,
} from '@/domena/rodzina/przyjecie';
import type { BledyPol, DataISO, FormaPrzyjecia, KodKomunikatu, LiczbaDzieci } from '@/domena/typy';
import { teksty } from '@/teksty';

const t = teksty.ViewProfileChildAdoption;

const LICZBY: readonly LiczbaDzieci[] = [1, 2, 3, 4, 5];
type TekstLiczby = '1' | '2' | '3' | '4' | '5';

// Identyfikatory elementów, które dostają fokus przy pierwszym błędzie.
const ID_POLA: Record<PoleFormularzaPrzyjecia, string> = {
  rola: idOpcjiGrupy('przyjecie-rola', 'matka'),
  forma: idOpcjiGrupy('przyjecie-forma', 'przysposobienie'),
  dataPrzyjecia: 'przyjecie-data-przyjecia',
  dataUrodzenia: 'przyjecie-data-urodzenia',
  odroczenie: idOpcjiGrupy('przyjecie-odroczenie', 'tak'),
  dataUprawomocnienia: 'przyjecie-data-uprawomocnienia',
  liczbaDzieci: idOpcjiGrupy('przyjecie-liczba', '1'),
};

export interface FormularzDanychPrzyjeciaProps {
  poczatkowy: FormularzPrzyjecia;
  dzis: DataISO;
  trybZmiany: boolean;
  zapisanaDataPrzyjecia?: string;
  adresWstecz: string;
  onZapisano: () => void;
}

export function FormularzDanychPrzyjecia({
  poczatkowy,
  dzis,
  trybZmiany,
  zapisanaDataPrzyjecia,
  adresWstecz,
  onZapisano,
}: FormularzDanychPrzyjeciaProps) {
  const [f, ustawF] = useState<FormularzPrzyjecia>(poczatkowy);
  const [bledy, ustawBledy] = useState<BledyPol<PoleFormularzaPrzyjecia>>({});
  const [bladOgolny, ustawBladOgolny] = useState<KodKomunikatu | null>(null);
  const [zajety, ustawZajety] = useState(false);

  const zmien = <P extends PoleFormularzaPrzyjecia>(pole: P, wartosc: FormularzPrzyjecia[P]) =>
    ustawF((poprzedni) => ({ ...poprzedni, [pole]: wartosc }));

  const pokazBledy = (nowe: BledyPol<PoleFormularzaPrzyjecia>) => {
    ustawBledy(nowe);
    const pierwsze = KOLEJNOSC_POL_PRZYJECIA.find((pole) => nowe[pole] !== undefined);
    if (pierwsze !== undefined) {
      window.setTimeout(() => document.getElementById(ID_POLA[pierwsze])?.focus(), 0);
    }
  };

  const wyslij = (zdarzenie: FormEvent<HTMLFormElement>) => {
    zdarzenie.preventDefault();
    if (zajety) return;
    ustawBladOgolny(null);
    const ctx = pobierzKontekstOperacji();
    const nowe = walidujDanePrzyjecia(f, ctx.dzis);
    if (Object.keys(nowe).length > 0) {
      pokazBledy(nowe);
      return;
    }
    ustawZajety(true);
    const wynik = zapiszDanePrzyjeciaWSzkicu(f, ctx);
    if (wynik.ok) {
      onZapisano();
      return;
    }
    ustawZajety(false);
    if (wynik.bledyPol) pokazBledy(wynik.bledyPol as BledyPol<PoleFormularzaPrzyjecia>);
    else ustawBladOgolny(wynik.kod);
  };

  const podpowiedzPrzyjecia = [
    t.dataPrzyjecia.podpowiedz({ data: formatujDate(najpozniejszaDataPrzyjecia(dzis)) }),
    zapisanaDataPrzyjecia ? t.dataPrzyjecia.zapisana({ data: zapisanaDataPrzyjecia }) : null,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <form noValidate onSubmit={wyslij} className="flex min-w-0 flex-col gap-7.5">
      <Karta tytul={t.tytulKarty} bezLinii>
        <p className="mt-0 mb-6">{trybZmiany ? t.opisKartyZmiany : t.opisKarty}</p>
        <Stos odstep={6}>
          {bladOgolny ? <Komunikat kod={bladOgolny} /> : null}
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
            blad={bledy.rola}
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
            blad={bledy.forma}
          />
          <PoleDaty
            id={ID_POLA.dataPrzyjecia}
            etykieta={t.dataPrzyjecia.etykieta}
            podpowiedz={podpowiedzPrzyjecia}
            wartosc={f.dataPrzyjecia}
            onZmiana={(w) => zmien('dataPrzyjecia', w)}
            blad={bledy.dataPrzyjecia}
            szerokosc="waska"
          />
          <PoleDaty
            id={ID_POLA.dataUrodzenia}
            etykieta={t.dataUrodzenia.etykieta}
            podpowiedz={t.dataUrodzenia.podpowiedz}
            wartosc={f.dataUrodzenia}
            onZmiana={(w) => zmien('dataUrodzenia', w)}
            blad={bledy.dataUrodzenia}
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
              blad={bledy.odroczenie}
            />
          ) : null}
          {f.forma === 'przysposobienie' ? (
            <PoleDaty
              id={ID_POLA.dataUprawomocnienia}
              etykieta={t.dataUprawomocnienia.etykieta}
              podpowiedz={t.dataUprawomocnienia.podpowiedz}
              wartosc={f.dataUprawomocnienia}
              onZmiana={(w) => zmien('dataUprawomocnienia', w)}
              blad={bledy.dataUprawomocnienia}
              szerokosc="waska"
            />
          ) : null}
          <GrupaOpcji<TekstLiczby>
            nazwa="przyjecie-liczba"
            legenda={t.liczbaDzieci.legenda}
            uklad="poziomo"
            opcje={LICZBY.map((l) => ({ wartosc: String(l) as TekstLiczby, etykieta: t.liczbaDzieci.opcje[l] }))}
            wartosc={f.liczbaDzieci === null ? null : (String(f.liczbaDzieci) as TekstLiczby)}
            onZmiana={(w) => zmien('liczbaDzieci', Number(w) as LiczbaDzieci)}
            blad={bledy.liczbaDzieci}
          />
          {trybZmiany ? null : <Notatka>{t.notatkaSciezki}</Notatka>}
        </Stos>
      </Karta>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PrzyciskLink href={adresWstecz} wariant="drugorzedny">
          {t.wstecz}
        </PrzyciskLink>
        <Przycisk type="submit" wariant="glowny" zajety={zajety}>
          {t.dalej}
        </Przycisk>
      </div>
    </form>
  );
}
