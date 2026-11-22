'use client';

// ViewLeaveRequestForm w wariantach wniosku o urlop wychowawczy i o obniżenie wymiaru czasu pracy (3.9.6.1.5).
// Dwie części (?czesc=N): dane z okresem i wymiarem oraz oświadczenia z załącznikami.
import { Fragment, useMemo, useState } from 'react';
import { formatujDate } from '@/domena/daty';
import type { WniosekOUrlop, Zalacznik } from '@/domena/typy';
import {
  ocenWychowawczy,
  odpowiedziPoczatkowe,
  zalacznikiWychowawczego,
  type OdpowiedziWychowawczego,
  type PodrodzajWychowawczy,
  type PoleWychowawczego,
} from '@/domena/wnioski/urlopy-wychowawczy';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { zapiszKrokWnioskuOUrlop } from '@/dane/magazyn/operacje/wnioski-urlop';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { useCzesciFormularza } from '@/komponenty/czesci-formularza';
import { GrupaOpcji } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { PoleDaty, PoleLiczby } from '@/komponenty/pole-tekstowe';
import { Przycisk } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';
import { DaneNaTle, RamaKreatora, type StanKreatora } from '../../_czesci/kreator';

const t = teksty.ViewLeaveRequestForm;
const tw = teksty.ViewLeaveRequestForm.wychowawczy;
const tt = teksty.ViewLeaveRequestType;

const CELE: Record<PoleWychowawczego, string> = {
  rodzaj: 'wych-rodzaj',
  dataPoczatku: 'wych-data-poczatku',
  dataKonca: 'wych-data-konca',
  czesc: 'wych-czesc',
  zamiar: 'wych-zamiar',
  okresDrugiegoOd: 'wych-drugi-od',
  okresDrugiegoDo: 'wych-drugi-do',
  przyczyna36: 'wych-przyczyna',
  wymiarPracy: 'wych-wymiar',
  dotychczasowa: 'wych-dotychczasowa',
  dotychczasowaOd: 'wych-dotychczasowa-od',
  dotychczasowaDo: 'wych-dotychczasowa-do',
};

const PODZIAL: Record<PodrodzajWychowawczy, PoleWychowawczego[][]> = {
  wychowawczy: [
    ['rodzaj', 'dataPoczatku', 'dataKonca', 'czesc'],
    ['zamiar', 'okresDrugiegoOd', 'okresDrugiegoDo', 'przyczyna36'],
  ],
  'obnizenie-wymiaru': [
    ['wymiarPracy', 'dataPoczatku', 'dataKonca'],
    ['dotychczasowa', 'dotychczasowaOd', 'dotychczasowaDo'],
  ],
};

export function FormularzWychowawczy({
  stan,
  wniosek,
  podrodzaj,
}: {
  stan: StanKreatora;
  wniosek: WniosekOUrlop;
  podrodzaj: PodrodzajWychowawczy;
}) {
  const { dane, kontekst } = stan;
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const poczatkowe = useMemo(() => odpowiedziPoczatkowe(dane, wniosek, formatujDate), [dane, wniosek]);
  const [odpowiedzi, setOdpowiedzi] = useState<OdpowiedziWychowawczego | null>(null);
  const [bladZapisu, setBladZapisu] = useState<string | null>(null);
  const odp = odpowiedzi ?? poczatkowe;
  const ocena = useMemo(() => ocenWychowawczy(podrodzaj, odp, dane, kontekst.dzis), [podrodzaj, odp, dane, kontekst.dzis]);
  const walidacja = useWalidacjaNaBiezaco({ wartosci: odp, waliduj: () => ocena.bledy, pola: CELE });
  const czesci = useCzesciFormularza({ liczba: 2, podzial: PODZIAL[podrodzaj], walidacja });
  const zmien = (z: Partial<OdpowiedziWychowawczego>) => setOdpowiedzi({ ...odp, ...z });
  const listaZal = zalacznikiWychowawczego(podrodzaj, odp, ocena.wymagaPrzyczyny);

  function zapisz(cel: 'dalej' | 'wstecz' | 'dokonczenie') {
    if (cel === 'dalej' && Object.keys(ocena.bledy).length > 0) {
      walidacja.sprobujWyslac();
      return;
    }
    ustawZajety(true);
    const zalaczniki: Zalacznik[] = listaZal.map(
      (id) => wniosek.zalaczniki.find((z) => z.id === id) ?? { id, rodzaj: id, wymagany: true },
    );
    const zmiana: Partial<WniosekOUrlop> = { ...(ocena.zmiana ?? {}), zalaczniki };
    const ekran = cel === 'dalej' ? 'ViewLeaveRequestSummary' : cel === 'wstecz' ? 'ViewLeaveRequestType' : 'ViewLeaveRequestForm';
    const wynik = zapiszKrokWnioskuOUrlop(wniosek.idWniosku, zmiana, ekran, pobierzKontekstOperacji());
    if (!wynik.ok) {
      ustawZajety(false);
      setBladZapisu(wynik.kod);
      return;
    }
    if (cel === 'dalej') przejdz(trasy.ViewLeaveRequestSummary({ wniosek: wniosek.idWniosku }));
    else if (cel === 'wstecz') przejdz(trasy.ViewLeaveRequestType({ wniosek: wniosek.idWniosku }));
    else {
      ustawKomunikatPoPrzejsciu({ kod: '0058', dlaWidoku: 'ViewCaseGuide' });
      przejdz(trasy.ViewCaseGuide({ idSprawy: wynik.wartosc.idSprawy }));
    }
  }

  const pole = (p: PoleWychowawczego) => ({ ...walidacja.pole(p), parametryBledu: ocena.parametry[p] });
  const data = (p: 'dataPoczatku' | 'dataKonca' | 'okresDrugiegoOd' | 'okresDrugiegoDo' | 'dotychczasowaOd' | 'dotychczasowaDo', etykieta: string) => (
    <PoleDaty id={CELE[p]} etykieta={etykieta} wartosc={odp[p]} onZmiana={(w) => zmien({ [p]: w })} {...pole(p)} szerokosc="waska" />
  );
  const dziecko = dane.dziecko ? [dane.dziecko.imie, dane.dziecko.nazwisko].filter(Boolean).join(' ') : '';
  const wych = podrodzaj === 'wychowawczy';

  const czesc1 = (
    <>
      <Karta tytul={t.daneTytul} bezLinii>
        <p className="m-0 mb-2">{teksty.wspolne.stanNa({ data: formatujDate(kontekst.dzis) })}</p>
        <DaneNaTle
          pozycje={[
            { etykieta: t.pracownik, wartosc: dane.imieINazwisko },
            { etykieta: tw.dziecko, wartosc: dziecko },
            { etykieta: tw.wykorzystany, wartosc: tw.miesiaceIDni(ocena.wykorzystane) },
          ]}
        />
      </Karta>
      <Karta tytul={tw.okresTytul} bezLinii>
        <div className="flex flex-col gap-4">
          {wych ? (
            <GrupaOpcji
              nazwa={CELE.rodzaj}
              legenda={tw.rodzajUrlopu}
              uklad="proste"
              wartosc={odp.rodzaj}
              onZmiana={(w) => zmien({ rodzaj: w })}
              opcje={[
                { wartosc: 'do-6-lat', etykieta: tw.rodzajDo6Lat },
                { wartosc: 'niepelnosprawnosc', etykieta: tw.rodzajNiepelnosprawnosc },
              ]}
            />
          ) : (
            <PoleLiczby
              id={CELE.wymiarPracy}
              etykieta={tw.wymiarPracy}
              podpowiedz={tw.wymiarPracyPodpowiedz}
              jednostka={tw.procent}
              wartosc={odp.wymiarPracy}
              onZmiana={(w) => zmien({ wymiarPracy: w })}
              {...pole('wymiarPracy')}
              szerokosc="waska"
            />
          )}
          {data('dataPoczatku', wych ? tw.dataPoczatku : tw.dataPoczatkuPracy)}
          {ocena.ostrzezenie && !walidacja.blad('dataPoczatku') ? <Komunikat kod={ocena.ostrzezenie} /> : null}
          {data('dataKonca', wych ? tw.dataKonca : tw.dataKoncaPracy)}
          {wych ? (
            <DaneNaTle
              pozycje={[
                ...(ocena.okresMiesiace ? [{ etykieta: tw.okresCzesci, wartosc: tw.miesiaceIDni(ocena.okresMiesiace) }] : []),
                { etykieta: tw.czesc, wartosc: tw.numerCzesci({ numer: ocena.numerCzesci }) },
                { etykieta: tw.pozostaly, wartosc: tw.miesiaceIDni(ocena.pozostalo) },
              ]}
            />
          ) : null}
          {wych && walidacja.blad('czesc') ? <div id={CELE.czesc}><Komunikat kod="0288" /></div> : null}
        </div>
      </Karta>
    </>
  );

  const czesc2 = (
    <>
      <Karta tytul={tw.oswiadczenieTytul} bezLinii>
        <div className="flex flex-col gap-4">
          {wych ? (
            <>
              <GrupaOpcji
                nazwa={CELE.zamiar}
                legenda={tw.zamiar}
                uklad="proste"
                wartosc={odp.zamiar || null}
                onZmiana={(w) => zmien({ zamiar: w as OdpowiedziWychowawczego['zamiar'] })}
                {...walidacja.pole('zamiar')}
                opcje={[
                  { wartosc: 'nie', etykieta: tw.zamiarNie },
                  { wartosc: 'tak', etykieta: tw.zamiarTak },
                ]}
              />
              {odp.zamiar === 'tak' ? (
                <>
                  {data('okresDrugiegoOd', tw.okresDrugiegoOd)}
                  {data('okresDrugiegoDo', tw.okresDrugiegoDo)}
                </>
              ) : null}
              {ocena.wymagaPrzyczyny ? (
                <GrupaOpcji
                  nazwa={CELE.przyczyna36}
                  legenda={tw.przyczyna36}
                  podpowiedz={tw.przyczyna36Opis}
                  uklad="proste"
                  wartosc={odp.przyczyna36 || null}
                  onZmiana={(w) => zmien({ przyczyna36: w })}
                  {...walidacja.pole('przyczyna36')}
                  opcje={(Object.keys(tw.przyczyny) as (keyof typeof tw.przyczyny)[]).map((k) => ({ wartosc: k, etykieta: tw.przyczyny[k] }))}
                />
              ) : null}
            </>
          ) : (
            <>
              <GrupaOpcji
                nazwa={CELE.dotychczasowa}
                legenda={tw.dotychczasowa}
                uklad="proste"
                wartosc={odp.dotychczasowa || null}
                onZmiana={(w) => zmien({ dotychczasowa: w as OdpowiedziWychowawczego['dotychczasowa'] })}
                {...walidacja.pole('dotychczasowa')}
                opcje={[
                  { wartosc: 'nie', etykieta: tw.dotychczasowaNie },
                  { wartosc: 'tak', etykieta: tw.dotychczasowaTak },
                ]}
              />
              {odp.dotychczasowa === 'tak' ? (
                <>
                  {data('dotychczasowaOd', tw.dotychczasowaOd)}
                  {data('dotychczasowaDo', tw.dotychczasowaDo)}
                </>
              ) : null}
            </>
          )}
        </div>
      </Karta>
      <Karta tytul={t.zalacznikiTytul} bezLinii>
        <ul className="m-0 grid gap-2 pl-5">
          {listaZal.map((id) => (
            <li key={id} className="first-letter:uppercase">
              {tw.zalaczniki[id]}
            </li>
          ))}
        </ul>
        <p className="m-0 mt-4">{t.zalacznikiOpis}</p>
      </Karta>
    </>
  );

  return (
    <RamaKreatora
      krok={2}
      czesc={czesci.czesc}
      podrodzaj={podrodzaj}
      nazwaKroku={t.nazwyWnioskow[podrodzaj]}
      idSprawy={wniosek.idSprawy}
      idWniosku={wniosek.idWniosku}
      boczna={
        <Karta tytul={t.ochronaTytul} bezLinii>
          <p className="m-0">{t.ochronaTresc}</p>
        </Karta>
      }
    >
      <form
        noValidate
        className="flex flex-col gap-7.5"
        onSubmit={(e) => {
          e.preventDefault();
          czesci.dalej(() => zapisz('dalej'));
        }}
      >
        <Fragment>{czesci.czesc === 1 ? czesc1 : czesc2}</Fragment>
        {bladZapisu ? <Komunikat kod={bladZapisu as '0003'} /> : null}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Przycisk type="button" wariant="drugorzedny" disabled={zajety} onClick={() => czesci.wroc(() => zapisz('wstecz'))}>
            {tt.wstecz}
          </Przycisk>
          <div className="flex flex-wrap gap-4">
            <Przycisk type="button" wariant="tlo" ikona="zapisz" disabled={zajety} onClick={() => zapisz('dokonczenie')}>
              {tt.zapiszDoDokonczenia}
            </Przycisk>
            <Przycisk type="submit" wariant="glowny" zajety={zajety}>
              {tt.dalej}
            </Przycisk>
          </div>
        </div>
      </form>
    </RamaKreatora>
  );
}
