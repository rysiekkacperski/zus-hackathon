'use client';

// ViewProfileEmploymentChange (historyjka 3.3.1.1.3, wzory cz1/P03-14…P03-18). Właściciel: u10.
// Ekran ma do trzech części (?czesc=N): rodzaj zmiany; przy rozpoczęciu i ustaniu forma i data zmiany; przy ustaniu
// umowy o pracę przyczyna ustania i inne zatrudnienie.
import { useEffect, useMemo, useState } from 'react';
import { czyWOkresie, formatujDate, parsujDate } from '@/domena/daty';
import { okresCiazy } from '@/domena/profil/ciaza';
import { czesciZmianyZatrudnienia } from '@/domena/profil/nawigacja';
import {
  FORMY_ZMIANY,
  PRZYCZYNY_USTANIA,
  RODZAJE_ZMIANY,
  czyPokazacInneZatrudnienie,
  czyPokazacPrzyczyne,
  czyZmianaZData,
  formaZTytulu,
  formularzZeZmiany,
  komunikatPrzyczyny,
  proponujZmianeZatrudnienia,
  tytulPropozycji,
  walidujZmianeZatrudnienia,
  zmianaZFormularza,
  type FormaZmiany,
  type FormularzZmianyZatrudnienia,
  type PoleZmianyZatrudnienia,
} from '@/domena/profil/zmiana-zatrudnienia';
import type {
  DataISO,
  Okres,
  PrzyczynaUstaniaUmowy,
  RodzajZmianyZatrudnienia,
  TytulUbezpieczenia,
  ZmianaZatrudnieniaWCiazy,
  ZrodloDanej,
} from '@/domena/typy';
import { CzescFormularza, useCzesciFormularza } from '@/komponenty/czesci-formularza';
import { GrupaOpcji } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PoleDaty } from '@/komponenty/pole-tekstowe';
import { PoleWyboru } from '@/komponenty/pole-wyboru';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { Stos } from '@/komponenty/uklad';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';
import { SzkieletKreatoraProfilu } from '../_czesci/szkielet-kreatora-profilu';
import { daneMatkiZeSzkicu, useKrokProfilu } from '../dane-ciazy/_czesci/krok-profilu';
import { ZrodloDanejPola } from './_czesci/zrodlo-danej';

const tekst = teksty.ViewProfileEmploymentChange;
const EKRAN = 'ViewProfileEmploymentChange' as const;

const NAZWA = { rodzaj: 'zmiana', forma: 'forma-zmiany', inne: 'inne' } as const;
const ID = { data: 'data-zmiany', przyczyna: 'przyczyna' } as const;
const PODZIAL: readonly (readonly PoleZmianyZatrudnienia[])[] = [
  ['rodzaj'],
  ['forma', 'data'],
  ['przyczyna', 'inneZatrudnienie'],
];

function opisTytulu(t: TytulUbezpieczenia, okres: Okres): string {
  const forma = tekst.formyWZdaniu[formaZTytulu(t.rodzaj)];
  if (t.do !== undefined && czyWOkresie(t.do, okres)) return tekst.opisTytulu.skonczylaSie({ forma, data: formatujDate(t.do) });
  if (czyWOkresie(t.od, okres)) return tekst.opisTytulu.zaczelaSie({ forma, data: formatujDate(t.od) });
  if (t.do === undefined) return tekst.opisTytulu.trwa({ forma, od: formatujDate(t.od) });
  return tekst.opisTytulu.trwala({ forma, od: formatujDate(t.od), do: formatujDate(t.do) });
}

function podpowiedzRodzaju(
  tytul: TytulUbezpieczenia | null,
  okres: Okres,
  propozycja: ZmianaZatrudnieniaWCiazy | null,
  rodzaj: RodzajZmianyZatrudnienia | null,
): string | undefined {
  if (tytul === null || propozycja === null || rodzaj === null) return undefined;
  const opis = opisTytulu(tytul, okres);
  if (rodzaj !== propozycja.rodzaj.wartosc) return tekst.odpowiedzRozna({ opis });
  if (rodzaj === 'bez-zmian') return tekst.zaznaczylismyBezZmian({ opis });
  return tekst.zaznaczylismy({ opis, odpowiedz: tekst.rodzaje[rodzaj].etykieta });
}

function zrodla(f: FormularzZmianyZatrudnienia, propozycja: ZmianaZatrudnieniaWCiazy | null) {
  const zgodnyRodzaj = propozycja !== null && f.rodzaj === propozycja.rodzaj.wartosc;
  const zgodnaForma = zgodnyRodzaj && f.forma !== null && f.forma === propozycja?.forma?.wartosc;
  const zgodnaData = zgodnaForma && parsujDate(f.data) === propozycja?.data?.wartosc;
  const zrodlo = (zgodna: boolean): ZrodloDanej => (zgodna ? 'konto-zus' : 'odpowiedz-rodzica');
  return { rodzaj: zrodlo(zgodnyRodzaj), forma: zrodlo(zgodnaForma), data: zrodlo(zgodnaData) };
}

/** Data odniesienia okresu ciąży: data porodu przy sytuacji „dziecko już się urodziło”, w pozostałych przypadkach termin porodu. */
function dataOdniesienia(
  sytuacja: string | undefined,
  daneCiazy: { przewidywanyTerminPorodu?: DataISO; dataPorodu?: DataISO } | undefined,
): { data: DataISO; rodzaj: 'termin' | 'porod' } | null {
  if (sytuacja === 'narodziny' && daneCiazy?.dataPorodu) return { data: daneCiazy.dataPorodu, rodzaj: 'porod' };
  if (daneCiazy?.przewidywanyTerminPorodu) return { data: daneCiazy.przewidywanyTerminPorodu, rodzaj: 'termin' };
  if (daneCiazy?.dataPorodu) return { data: daneCiazy.dataPorodu, rodzaj: 'porod' };
  return null;
}

export function WidokZmianyZatrudnienia() {
  const krok = useKrokProfilu(EKRAN);
  const { szkic, zgoda, dzis, router, stanKonta } = krok;

  useEffect(() => {
    if (!zgoda) router.replace(sciezkaWidoku('ViewProfileFamily'));
  }, [zgoda, router]);

  if (!zgoda) return null;

  const odniesienie = dataOdniesienia(szkic?.daneRodziny.sytuacja?.wartosc, szkic?.daneCiazy);
  const tytuly = stanKonta?.kopiaDanychZus?.tytuly ?? [];

  return (
    <>
      <NaglowekStrony tytul={tekst.naglowek} wstep={tekst.wstep} powrot={false} />
      {odniesienie ? (
        <FormularzZmiany
          key={odniesienie.data}
          krok={krok}
          odniesienie={odniesienie}
          tytuly={tytuly}
          zapisana={szkic?.daneRodziny.matka?.zmianaZatrudnienia ?? null}
          dzis={dzis}
        />
      ) : (
        <SzkieletKreatoraProfilu biezacy={EKRAN} onWroc={krok.wroc}>
          <Notatka>
            <p className="m-0">{tekst.brakDatyOdniesienia}</p>
            <p className="m-0 mt-2">
              <Odnosnik href={krok.sciezkaPowrotu()}>{tekst.przejdzDoPoprzedniegoKroku}</Odnosnik>
            </p>
          </Notatka>
        </SzkieletKreatoraProfilu>
      )}
    </>
  );
}

function FormularzZmiany({
  krok,
  odniesienie,
  tytuly,
  zapisana,
  dzis,
}: {
  krok: ReturnType<typeof useKrokProfilu>;
  odniesienie: { data: DataISO; rodzaj: 'termin' | 'porod' };
  tytuly: TytulUbezpieczenia[];
  zapisana: ZmianaZatrudnieniaWCiazy | null;
  dzis: DataISO;
}) {
  const okres = useMemo(() => okresCiazy(odniesienie.data), [odniesienie.data]);
  const propozycja = useMemo(() => proponujZmianeZatrudnienia(tytuly, okres), [tytuly, okres]);
  const tytul = useMemo(() => tytulPropozycji(tytuly, okres), [tytuly, okres]);

  const [formularz, ustawFormularz] = useState<FormularzZmianyZatrudnienia>(() =>
    formularzZeZmiany(zapisana ?? propozycja, formatujDate),
  );
  const walidacja = useWalidacjaNaBiezaco({
    wartosci: formularz,
    waliduj: (f: FormularzZmianyZatrudnienia) => walidujZmianeZatrudnienia(f, okres, tytuly, dzis),
    pola: {
      rodzaj: NAZWA.rodzaj,
      forma: NAZWA.forma,
      data: ID.data,
      przyczyna: ID.przyczyna,
      inneZatrudnienie: NAZWA.inne,
    },
  });
  const czesci = useCzesciFormularza({ liczba: czesciZmianyZatrudnienia(formularz), podzial: PODZIAL, walidacja });

  const zmien = (zmiana: Partial<FormularzZmianyZatrudnienia>) => ustawFormularz((f) => ({ ...f, ...zmiana }));

  function zmienRodzaj(rodzaj: RodzajZmianyZatrudnienia) {
    const zPropozycji = propozycja !== null && propozycja.rodzaj.wartosc === rodzaj;
    zmien({
      rodzaj,
      forma: zPropozycji ? (propozycja.forma?.wartosc ?? null) : null,
      data: zPropozycji && propozycja.data ? formatujDate(propozycja.data.wartosc) : '',
      przyczyna: '',
      inneZatrudnienie: null,
    });
  }

  function przejdzDalej() {
    const zmiana = zmianaZFormularza(formularz, propozycja, okres);
    if (zmiana === null) return;
    krok.zapiszIPrzejdzDalej({
      daneRodziny: { matka: { ...daneMatkiZeSzkicu(krok.szkic), zmianaZatrudnienia: zmiana } },
    });
  }

  const zrodloPol = zrodla(formularz, propozycja);
  const zData = czyZmianaZData(formularz.rodzaj);
  const pokazPrzyczyne = czyPokazacPrzyczyne(formularz);
  const pokazInne = czyPokazacInneZatrudnienie(formularz);
  const informacjaPrzyczyny = komunikatPrzyczyny(formularz);
  const opisOkresu =
    odniesienie.rodzaj === 'porod'
      ? tekst.opisOkresuPorod({ od: formatujDate(okres.od), porod: formatujDate(okres.do) })
      : tekst.opisOkresuTermin({ od: formatujDate(okres.od), termin: formatujDate(okres.do) });

  let notatka: string | null = null;
  if (formularz.rodzaj === 'ustanie' && formularz.forma !== 'umowa-o-prace') notatka = tekst.notatkaPrzyczynyPrzyUmowieOPrace;
  if (formularz.rodzaj === 'rozpoczecie' && formularz.forma !== null) {
    notatka = tekst.notatkaRozpoczecia({ coZmienia: tekst.rozpoczecieWZdaniu[formularz.forma] });
  }

  return (
    <SzkieletKreatoraProfilu
      biezacy={EKRAN}
      czesc={czesci.czesc}
      liczbaCzesci={czesci.liczba}
      onDalej={() => czesci.dalej(przejdzDalej)}
      onWroc={() => czesci.wroc(krok.wroc)}
      zajety={krok.zajety}
    >
      {krok.bladZapisu ? <Komunikat kod={krok.bladZapisu} /> : null}
      <Karta tytul={tekst.tytulKarty} bezLinii as="section">
        <Stos odstep={6}>
          <CzescFormularza czesci={czesci} numer={1}>
            <p className="m-0">{opisOkresu}</p>
            <div className="grid min-w-0 gap-2">
              <GrupaOpcji<RodzajZmianyZatrudnienia>
                nazwa={NAZWA.rodzaj}
                legenda={tekst.legendaRodzaju}
                podpowiedz={podpowiedzRodzaju(tytul, okres, propozycja, formularz.rodzaj)}
                opcje={RODZAJE_ZMIANY.map((r) => ({ wartosc: r, etykieta: tekst.rodzaje[r].etykieta, opis: tekst.rodzaje[r].opis }))}
                wartosc={formularz.rodzaj}
                onZmiana={zmienRodzaj}
                {...walidacja.pole('rodzaj')}
              />
              {formularz.rodzaj !== null ? <ZrodloDanejPola zrodlo={zrodloPol.rodzaj} /> : null}
            </div>
          </CzescFormularza>
          {zData ? (
            <>
              <CzescFormularza czesci={czesci} numer={2}>
                <div className="grid min-w-0 gap-2">
                  <GrupaOpcji<FormaZmiany>
                    nazwa={NAZWA.forma}
                    legenda={tekst.legendaFormy}
                    opcje={FORMY_ZMIANY.map((f) => ({ wartosc: f, etykieta: tekst.formy[f] }))}
                    wartosc={formularz.forma}
                    onZmiana={(forma) => zmien({ forma })}
                    {...walidacja.pole('forma')}
                  />
                  {formularz.forma !== null ? <ZrodloDanejPola zrodlo={zrodloPol.forma} /> : null}
                </div>
                <div className="grid min-w-0 gap-2">
                  <PoleDaty
                    id={ID.data}
                    nazwa={ID.data}
                    etykieta={formularz.rodzaj === 'ustanie' ? tekst.etykietaDatyUstania : tekst.etykietaDatyRozpoczecia}
                    podpowiedz={tekst.podpowiedzDaty}
                    wartosc={formularz.data}
                    onZmiana={(data) => zmien({ data })}
                    {...walidacja.pole('data')}
                    wymagane
                  />
                  {formularz.data.trim() !== '' ? <ZrodloDanejPola zrodlo={zrodloPol.data} /> : null}
                </div>
                {notatka ? (
                  <Notatka>
                    <p className="m-0">{notatka}</p>
                  </Notatka>
                ) : null}
              </CzescFormularza>
              <CzescFormularza czesci={czesci} numer={3}>
                {pokazPrzyczyne ? (
                  <div className="grid min-w-0 gap-2">
                    <PoleWyboru<PrzyczynaUstaniaUmowy>
                      id={ID.przyczyna}
                      nazwa={ID.przyczyna}
                      etykieta={tekst.etykietaPrzyczyny}
                      pustaOpcja={tekst.pustaPrzyczyna}
                      opcje={PRZYCZYNY_USTANIA.map((p) => ({ wartosc: p, etykieta: tekst.przyczyny[p] }))}
                      wartosc={formularz.przyczyna}
                      onZmiana={(przyczyna) => zmien({ przyczyna, inneZatrudnienie: null })}
                      {...walidacja.pole('przyczyna')}
                      wymagane
                    />
                    {formularz.przyczyna !== '' ? <ZrodloDanejPola zrodlo="odpowiedz-rodzica" /> : null}
                    {informacjaPrzyczyny ? <Komunikat kod={informacjaPrzyczyny} id="przyczyna-info" /> : null}
                  </div>
                ) : null}
                {pokazInne && formularz.przyczyna !== '' ? (
                  <GrupaOpcji<'tak' | 'nie'>
                    nazwa={NAZWA.inne}
                    legenda={tekst.legendaInnegoZatrudnienia}
                    podpowiedz={tekst.podpowiedzInnegoZatrudnienia({
                      przyczyna:
                        tekst.przyczynyWDopelniaczu[formularz.przyczyna as keyof typeof tekst.przyczynyWDopelniaczu],
                    })}
                    opcje={[
                      { wartosc: 'tak', etykieta: tekst.tak },
                      { wartosc: 'nie', etykieta: tekst.nie },
                    ]}
                    wartosc={formularz.inneZatrudnienie === null ? null : formularz.inneZatrudnienie ? 'tak' : 'nie'}
                    onZmiana={(w) => zmien({ inneZatrudnienie: w === 'tak' })}
                    {...walidacja.pole('inneZatrudnienie')}
                  />
                ) : null}
              </CzescFormularza>
            </>
          ) : null}
        </Stos>
      </Karta>
    </SzkieletKreatoraProfilu>
  );
}
