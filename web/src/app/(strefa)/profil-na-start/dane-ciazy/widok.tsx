'use client';

// ViewProfilePregnancy (historyjka 3.3.1.2.1, wzory cz1/P03-11 i P03-12). Właściciel: u10.
import { useEffect, useMemo, useState } from 'react';
import { useKatalog } from '@/dane/magazyn/hooki';
import { formatujDate, parsujDate } from '@/domena/daty';
import {
  LICZBY_DZIECI,
  daneCiazyZFormularza,
  walidujDaneCiazy,
  wymiaryUrlopowDlaLiczbyDzieci,
  type FormularzDanychCiazy,
  type PoleDanychCiazy,
} from '@/domena/profil/ciaza';
import type { BledyPol, LiczbaDzieci } from '@/domena/typy';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PoleDaty } from '@/komponenty/pole-tekstowe';
import { PoleWyboru } from '@/komponenty/pole-wyboru';
import { PoleZaznaczenia } from '@/komponenty/pole-zaznaczenia';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';
import { SzkieletKreatoraProfilu } from '../_czesci/szkielet-kreatora-profilu';
import { useKrokProfilu, ustawFokusNaPierwszymBledzie } from './_czesci/krok-profilu';

const tekst = teksty.ViewProfilePregnancy;
const EKRAN = 'ViewProfilePregnancy' as const;

const ID = { termin: 'termin', liczbaDzieci: 'dzieci', wizyta: 'wizyta', brakWizyty: 'wizyta-brak' } as const;
const KOLEJNOSC_POL: readonly (readonly [PoleDanychCiazy, string])[] = [
  ['termin', ID.termin],
  ['liczbaDzieci', ID.liczbaDzieci],
  ['wizyta', ID.wizyta],
];

export function WidokDanychCiazy() {
  const krok = useKrokProfilu(EKRAN);
  const { szkic, zgoda, dzis, router } = krok;
  const katalog = useKatalog();

  const [formularz, ustawFormularz] = useState<FormularzDanychCiazy>(() => {
    const ciaza = szkic?.daneCiazy;
    const wizyta = ciaza?.dataPierwszejWizyty;
    return {
      termin: ciaza?.przewidywanyTerminPorodu ? formatujDate(ciaza.przewidywanyTerminPorodu) : '',
      liczbaDzieci: ciaza?.liczbaDzieciZCiazy ?? 1,
      wizyta: wizyta && wizyta !== 'brak-wizyty' ? formatujDate(wizyta) : '',
      brakWizyty: wizyta === 'brak-wizyty',
    };
  });
  const [bledy, ustawBledy] = useState<BledyPol<PoleDanychCiazy>>({});

  // Konto bez zgody na dane dotyczące zdrowia pomija ekran danych ciąży.
  useEffect(() => {
    if (!zgoda) router.replace(sciezkaWidoku('ViewProfileFamily'));
  }, [zgoda, router]);

  const zmien = <K extends keyof FormularzDanychCiazy>(pole: K, wartosc: FormularzDanychCiazy[K]) =>
    ustawFormularz((f) => ({ ...f, [pole]: wartosc }));

  const podpowiedzLiczby = useMemo(() => {
    const liczba: LiczbaDzieci = formularz.liczbaDzieci ?? 1;
    const dzien = parsujDate(formularz.termin) ?? dzis;
    const wymiary = wymiaryUrlopowDlaLiczbyDzieci(katalog, liczba, dzien);
    return tekst.podpowiedzLiczbyDzieci({
      przy: tekst.przyLiczbieDzieci[liczba],
      macierzynski: tekst.tygodnie({ liczba: wymiary.macierzynskiTygodni }),
      rodzicielski: tekst.tygodnie({ liczba: wymiary.rodzicielskiTygodni }),
    });
  }, [formularz.liczbaDzieci, formularz.termin, dzis, katalog]);

  function przejdzDalej() {
    const noweBledy = walidujDaneCiazy(formularz, dzis);
    ustawBledy(noweBledy);
    const dane = daneCiazyZFormularza(formularz, dzis);
    if (Object.keys(noweBledy).length > 0 || dane === null) {
      ustawFokusNaPierwszymBledzie(KOLEJNOSC_POL, noweBledy);
      return;
    }
    krok.zapiszIPrzejdzDalej({ daneCiazy: { ...(szkic?.daneCiazy ?? {}), ...dane } });
  }

  if (!zgoda) return null;

  return (
    <>
      <NaglowekStrony tytul={tekst.naglowek} wstep={tekst.wstep} powrot={false} />
      <SzkieletKreatoraProfilu
        biezacy={EKRAN}
        onDalej={przejdzDalej}
        onWroc={krok.wroc}
        zajety={krok.zajety}
      >
        {krok.bladZapisu ? <Komunikat kod={krok.bladZapisu} /> : null}
        <Karta tytul={tekst.tytulKarty} bezLinii as="section">
          <Stos odstep={6}>
            <p className="m-0">{tekst.opisKarty}</p>
            <PoleDaty
              id={ID.termin}
              nazwa={ID.termin}
              etykieta={tekst.etykietaTerminu}
              podpowiedz={tekst.podpowiedzTerminu}
              wartosc={formularz.termin}
              onZmiana={(w) => zmien('termin', w)}
              blad={bledy.termin}
              wymagane
            />
            <PoleWyboru<`${LiczbaDzieci}`>
              id={ID.liczbaDzieci}
              nazwa={ID.liczbaDzieci}
              etykieta={tekst.etykietaLiczbyDzieci}
              podpowiedz={podpowiedzLiczby}
              opcje={LICZBY_DZIECI.map((l) => ({ wartosc: `${l}` as const, etykieta: tekst.liczbyDzieci[l] }))}
              wartosc={formularz.liczbaDzieci === null ? '' : `${formularz.liczbaDzieci}`}
              onZmiana={(w) => zmien('liczbaDzieci', w === '' ? null : (Number(w) as LiczbaDzieci))}
              blad={bledy.liczbaDzieci}
              szerokosc="srednia"
              wymagane
            />
            <div className="grid min-w-0 gap-3">
              <PoleDaty
                id={ID.wizyta}
                nazwa={ID.wizyta}
                etykieta={tekst.etykietaWizyty}
                podpowiedz={tekst.podpowiedzWizyty}
                wartosc={formularz.wizyta}
                onZmiana={(w) => zmien('wizyta', w)}
                blad={bledy.wizyta}
                wylaczone={formularz.brakWizyty}
              />
              <PoleZaznaczenia
                id={ID.brakWizyty}
                nazwa={ID.brakWizyty}
                etykieta={tekst.brakWizyty}
                zaznaczone={formularz.brakWizyty}
                onZmiana={(z) => {
                  zmien('brakWizyty', z);
                  if (z) ustawBledy((b) => ({ ...b, wizyta: undefined }));
                }}
              />
            </div>
            <Notatka>
              <p className="m-0">
                {tekst.notatkaZgody.przed}
                <Odnosnik href={sciezkaWidoku('ViewGuideSettings')} wTekscie>
                  {tekst.notatkaZgody.odnosnik}
                </Odnosnik>
                {tekst.notatkaZgody.po}
              </p>
            </Notatka>
          </Stos>
        </Karta>
      </SzkieletKreatoraProfilu>
    </>
  );
}
