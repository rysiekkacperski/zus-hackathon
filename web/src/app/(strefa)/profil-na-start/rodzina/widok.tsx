'use client';

// ViewProfileFamily (historyjka 3.3.1.2.2, wzory cz1/P03-19, P03-20 i P03-21). Właściciel: u10.
import { useMemo, useState } from 'react';
import { gminy } from '@/dane/gminy';
import { formatujKwoteBezWaluty } from '@/domena/kwoty';
import { gminaODokladnejNazwie, wyszukajGminy } from '@/domena/profil/gminy';
import {
  STANY_CYWILNE,
  UZNANIA_OJCOSTWA,
  czyPytacOUznanieOjcostwa,
  daneRodzinyZFormularza,
  komunikatDanychRodziny,
  walidujDaneRodziny,
  type FormularzDanychRodziny,
  type PoleDanychRodziny,
} from '@/domena/profil/rodzina';
import type { BledyPol, Gmina, StanCywilny, UznanieOjcostwa } from '@/domena/typy';
import { GrupaOpcji, idOpcjiGrupy } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PoleKwoty } from '@/komponenty/pole-tekstowe';
import { PoleZPodpowiedziami } from '@/komponenty/pole-z-podpowiedziami';
import { PoleZaznaczenia } from '@/komponenty/pole-zaznaczenia';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';
import { SzkieletKreatoraProfilu } from '../_czesci/szkielet-kreatora-profilu';
import { useKrokProfilu, ustawFokusNaPierwszymBledzie } from '../dane-ciazy/_czesci/krok-profilu';

const tekst = teksty.ViewProfileFamily;
const EKRAN = 'ViewProfileFamily' as const;

const NAZWA = { stan: 'stan', ojcostwo: 'ojcostwo' } as const;
const ID = { gmina: 'gmina', dochod: 'dochod', pomin: 'dochod-pomin' } as const;
const KOLEJNOSC_POL: readonly (readonly [PoleDanychRodziny, string])[] = [
  ['stanCywilny', idOpcjiGrupy(NAZWA.stan, 'malzenstwo')],
  ['uznanieOjcostwa', idOpcjiGrupy(NAZWA.ojcostwo, 'uznane')],
  ['gmina', ID.gmina],
  ['dochod', ID.dochod],
];

function etykietaGminy(g: Gmina): string {
  return tekst.podpowiedzGminyNaLiscie({ nazwa: g.nazwa, powiat: g.powiat, wojewodztwo: g.wojewodztwo });
}

export function WidokDanychRodziny() {
  const krok = useKrokProfilu(EKRAN);
  const { szkic, zgoda } = krok;

  const [formularz, ustawFormularz] = useState<FormularzDanychRodziny>(() => {
    const dane = szkic?.daneRodziny;
    const gmina = dane?.gmina?.wartosc ?? null;
    const dochod = dane?.dochodNaOsobe?.wartosc;
    return {
      stanCywilny: dane?.stanCywilny?.wartosc ?? null,
      uznanieOjcostwa: dane?.uznanieOjcostwa?.wartosc ?? null,
      gminaTekst: gmina ? etykietaGminy(gmina) : '',
      gmina,
      dochod: typeof dochod === 'number' ? formatujKwoteBezWaluty(dochod) : '',
      pominDochod: dochod === 'nieznany',
    };
  });
  const [bledy, ustawBledy] = useState<BledyPol<PoleDanychRodziny>>({});

  const podpowiedzi = useMemo(() => wyszukajGminy(formularz.gminaTekst, gminy), [formularz.gminaTekst]);
  const komunikatStrony = komunikatDanychRodziny(zgoda);

  const zmien = (zmiana: Partial<FormularzDanychRodziny>, czyszczone: PoleDanychRodziny[]) => {
    ustawFormularz((f) => ({ ...f, ...zmiana }));
    ustawBledy((b) => {
      const nowe = { ...b };
      for (const pole of czyszczone) delete nowe[pole];
      return nowe;
    });
  };

  function wybierzGmine(gmina: Gmina | null) {
    zmien({ gmina }, gmina ? ['gmina'] : []);
    // Gmina wybrana z podpowiedzi zostaje w szkicu także wtedy, gdy rodzic zamknie przewodnik przed przejściem dalej.
    if (gmina) krok.zapiszWTle({ daneRodziny: { gmina: { wartosc: gmina, zrodlo: 'odpowiedz-rodzica' } } });
  }

  function przejdzDalej() {
    // Nazwa wpisana dokładnie jak w słowniku gmin wskazuje tę gminę także bez wyboru z listy podpowiedzi.
    const gmina = formularz.gmina ?? gminaODokladnejNazwie(formularz.gminaTekst, gminy);
    const pelny = { ...formularz, gmina };
    if (gmina !== formularz.gmina) ustawFormularz(pelny);
    const noweBledy = walidujDaneRodziny(pelny);
    ustawBledy(noweBledy);
    const dane = daneRodzinyZFormularza(pelny);
    if (Object.keys(noweBledy).length > 0 || dane === null) {
      ustawFokusNaPierwszymBledzie(KOLEJNOSC_POL, noweBledy);
      return;
    }
    krok.zapiszIPrzejdzDalej({ daneRodziny: dane });
  }

  const pytajOOjcostwo = czyPytacOUznanieOjcostwa(formularz.stanCywilny);

  return (
    <>
      <NaglowekStrony tytul={tekst.naglowek} wstep={tekst.wstep} powrot={false} />
      <SzkieletKreatoraProfilu biezacy={EKRAN} onDalej={przejdzDalej} onWroc={krok.wroc} zajety={krok.zajety}>
        {komunikatStrony ? (
          <Komunikat
            kod={komunikatStrony}
            akcje={
              <p className="m-0">
                {tekst.zgoda.przed}
                <Odnosnik href={sciezkaWidoku('ViewGuideSettings')} wTekscie>
                  {tekst.zgoda.odnosnik}
                </Odnosnik>
                {tekst.zgoda.po}
              </p>
            }
          />
        ) : null}
        {krok.bladZapisu ? <Komunikat kod={krok.bladZapisu} /> : null}
        <Karta tytul={tekst.tytulKarty} bezLinii as="section">
          <Stos odstep={6}>
            <p className="m-0">{tekst.opisKarty}</p>
            <GrupaOpcji<StanCywilny>
              nazwa={NAZWA.stan}
              legenda={tekst.legendaStanuCywilnego}
              opcje={STANY_CYWILNE.map((s) => ({ wartosc: s, etykieta: tekst.stanyCywilne[s] }))}
              wartosc={formularz.stanCywilny}
              onZmiana={(stanCywilny) => zmien({ stanCywilny }, ['stanCywilny', 'uznanieOjcostwa'])}
              blad={bledy.stanCywilny}
            />
            {pytajOOjcostwo ? (
              <GrupaOpcji<UznanieOjcostwa>
                nazwa={NAZWA.ojcostwo}
                legenda={tekst.legendaOjcostwa}
                podpowiedz={tekst.podpowiedzOjcostwa}
                opcje={UZNANIA_OJCOSTWA.map((u) => ({ wartosc: u, etykieta: tekst.uznaniaOjcostwa[u] }))}
                wartosc={formularz.uznanieOjcostwa}
                onZmiana={(uznanieOjcostwa) => zmien({ uznanieOjcostwa }, ['uznanieOjcostwa'])}
                blad={bledy.uznanieOjcostwa}
              />
            ) : null}
            <PoleZPodpowiedziami<Gmina>
              id={ID.gmina}
              nazwa={ID.gmina}
              etykieta={tekst.etykietaGminy}
              podpowiedz={tekst.podpowiedzGminy}
              tekst={formularz.gminaTekst}
              onZmianaTekstu={(gminaTekst) => zmien({ gminaTekst }, ['gmina'])}
              podpowiedzi={podpowiedzi}
              kluczPodpowiedzi={(g) => g.idTeryt}
              etykietaPodpowiedzi={etykietaGminy}
              wybrana={formularz.gmina}
              onWybor={wybierzGmine}
              opisWybranej={(g) => tekst.wybranaGmina({ nazwa: g.nazwa, powiat: g.powiat, wojewodztwo: g.wojewodztwo })}
              blad={bledy.gmina}
              wymagane
            />
            <div className="grid min-w-0 gap-3">
              {formularz.pominDochod ? (
                <p className="m-0 text-body-strong">{tekst.etykietaDochodu}</p>
              ) : (
                <PoleKwoty
                  id={ID.dochod}
                  nazwa={ID.dochod}
                  etykieta={tekst.etykietaDochodu}
                  podpowiedz={tekst.podpowiedzDochodu}
                  wartosc={formularz.dochod}
                  onZmiana={(dochod) => zmien({ dochod }, ['dochod'])}
                  blad={bledy.dochod}
                  wymagane
                />
              )}
              <PoleZaznaczenia
                id={ID.pomin}
                nazwa={ID.pomin}
                etykieta={tekst.pominDochod}
                zaznaczone={formularz.pominDochod}
                onZmiana={(pominDochod) => zmien({ pominDochod }, ['dochod'])}
                opis={tekst.podpowiedzPominieciaDochodu}
              />
            </div>
          </Stos>
        </Karta>
      </SzkieletKreatoraProfilu>
    </>
  );
}
