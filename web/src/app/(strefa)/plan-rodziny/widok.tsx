'use client';

// ViewFamilyPlan: strona główna Rodzica i Drugiego rodzica (historyjki 3.6.1.2.1, 3.6.1.3.1, 3.6.1.4.1,
// wzory Plan-rodziny, P06-04 … P06-13). Sprawy rodziny według etapów, bieżący etap, strażnik ubezpieczenia
// chorobowego w etapie Ciąża, akcje profilu, e-ZLA i stanu rozliczeń składek. Właściciel: u12.
import { useMemo, useState } from 'react';
import { useKontekstRodziny, useParametry, useStanKontaOsoby } from '@/dane/magazyn/hooki';
import { osobyRodziny } from '@/dane/magazyn/stan';
import { formatujDate } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import { wyznaczBiezacyEtap } from '@/domena/plan/etap';
import { czySprawaOplacenia, ocenStraznika } from '@/domena/plan/straznik';
import type { Etap } from '@/domena/typy';
import { Kafelki } from '@/komponenty/kafelki';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Stos, UkladDwuKolumnowy } from '@/komponenty/uklad';
import { teksty } from '@/teksty';
import { ArkuszPotwierdzeniaSkladek } from './_czesci/arkusz-potwierdzenia-skladek';
import { EtapPlanu } from './_czesci/etap-planu';
import { KartaDanychPlanu, KartaNaSkroty, KartaSciezki, KartaTerminow, KartaZmian } from './_czesci/karty-planu';
import { ETAPY } from './_czesci/sprawy';
import { StraznikPlanu } from './_czesci/straznik-planu';
import { slotyNadPlanem, slotyNaglowka } from './_sloty';

const t = teksty.ViewFamilyPlan;

export function WidokPlanuRodziny() {
  const kontekst = useKontekstRodziny();
  const parametry = useParametry();
  const daneRodziny = kontekst?.rodzina.daneRodziny;
  const peselMatki = daneRodziny ? osobyRodziny(daneRodziny).peselMatki : undefined;
  const kontoMatki = useStanKontaOsoby(kontekst?.rola === 'drugi-rodzic' ? peselMatki : undefined);
  const [arkuszOtwarty, setArkuszOtwarty] = useState(false);

  const ocena = useMemo(
    () =>
      kontekst
        ? ocenStraznika({
            daneRodziny: kontekst.rodzina.daneRodziny,
            daneCiazy: kontekst.rodzina.daneCiazy,
            kopia: kontekst.daneZusMatki,
            katalog: kontekst.katalog,
            progPodwyzszeniaProcent: parametry.progPodwyzszeniaPodstawyProcent,
            dzis: kontekst.dzis,
          })
        : null,
    [kontekst, parametry.progPodwyzszeniaPodstawyProcent],
  );

  if (kontekst === null) {
    return (
      <>
        <NaglowekStrony tytul={t.naglowek} powrot={false} />
        <StanPusty ikona="plan">{t.brakPlanu}</StanPusty>
      </>
    );
  }

  const { rodzina, dzis, stanZgody } = kontekst;
  const plan = rodzina.plan;
  const pozycje = plan?.pozycje ?? [];
  const terminy = rodzina.kalendarz?.terminy ?? [];
  const biezacyEtap: Etap = wyznaczBiezacyEtap(rodzina.daneCiazy, dzis);
  const indeksBiezacego = ETAPY.indexOf(biezacyEtap);
  const sprawaOplacenia = ocena?.oplacenie
    ? pozycje.find((p) => p.idSprawy === ocena.oplacenie?.idSprawy)
    : undefined;
  const daneCiazy = rodzina.daneCiazy;
  const dochod = rodzina.daneRodziny.dochodNaOsobe?.wartosc;
  const bezBecikowego =
    typeof dochod === 'number' && !pozycje.some((p) => p.idPozycji === 'K14' || p.idPozycji === 'K15');
  const matkaDopelniacz =
    kontoMatki?.konto.imieINazwiskoDopelniacz ??
    (kontekst.daneZusMatki ? `${kontekst.daneZusMatki.imie} ${kontekst.daneZusMatki.nazwisko}` : undefined);

  const dodatkiEtapu = (etap: Etap) => {
    if (etap === 'ciaza') {
      return {
        wstep: (
          <p>
            {t.opisyEtapow.ciaza}
            {daneCiazy?.przewidywanyTerminPorodu
              ? ` ${t.terminPorodu({ data: formatujDate(daneCiazy.przewidywanyTerminPorodu) })}`
              : null}
          </p>
        ),
        przedTabela: ocena ? (
          <StraznikPlanu
            ocena={ocena}
            sprawaOplacenia={sprawaOplacenia}
            rola={kontekst.rola}
            matkaDopelniacz={matkaDopelniacz}
            onPotwierdz={() => setArkuszOtwarty(true)}
          />
        ) : undefined,
        poTabeli: (
          <div className="flex flex-col gap-4">
            <p className="m-0 text-body">{t.ezla.opis}</p>
            <Kafelki kafelki={[{ href: sciezkaWidoku('ViewSickLeaveList'), etykieta: t.ezla.kafelek }]} />
          </div>
        ),
      };
    }
    if (etap === 'urlopy-i-zasilek') {
      return {
        wstep: <p>{t.opisyEtapow[etap]}</p>,
        poTabeli: (
          <div className="flex flex-col gap-4">
            <p className="m-0 text-body">{t.kalkulator.opis}</p>
            <Kafelki kafelki={[{ href: sciezkaWidoku('ViewCalcMaternityInput'), etykieta: t.kalkulator.kafelek }]} />
          </div>
        ),
      };
    }
    if (etap === 'pieniadze-na-dziecko') {
      return {
        wstep: <p>{t.opisyEtapow[etap]}</p>,
        poTabeli:
          bezBecikowego && typeof dochod === 'number' ? (
            <Notatka>
              <p className="m-0">{t.bezBecikowego({ dochod: formatujKwote(dochod) })}</p>
            </Notatka>
          ) : undefined,
      };
    }
    return { wstep: <p>{t.opisyEtapow[etap]}</p> };
  };

  return (
    <>
      <NaglowekStrony
        tytul={t.naglowek}
        stanNa={dzis}
        powrot={false}
        akcje={
          <>
            <Odnosnik href={sciezkaWidoku('ViewProfileSummary', { tryb: 'rodzina' })}>{t.otworzProfil}</Odnosnik>
            {slotyNaglowka.map(({ id, Komponent }) => (
              <Komponent key={id} kontekst={kontekst} />
            ))}
          </>
        }
      />
      <Stos odstep={7.5}>
        {stanZgody !== 'udzielona' ? (
          <Komunikat
            kod="0004"
            akcje={<Odnosnik href={sciezkaWidoku('ViewGuideSettings')}>{t.zmienDecyzjeOZgodzie}</Odnosnik>}
          />
        ) : null}
        {slotyNadPlanem.map(({ id, Komponent }) => (
          <Komponent key={id} kontekst={kontekst} />
        ))}
        {plan === null ? (
          <StanPusty ikona="plan">{t.brakPlanu}</StanPusty>
        ) : (
          <>
            <UkladDwuKolumnowy
              tresc={<KartaSciezki pozycje={pozycje} biezacyEtap={biezacyEtap} />}
              boczna={
                <Stos odstep={7.5}>
                  <KartaTerminow kontekst={kontekst} ocena={ocena} />
                  <KartaNaSkroty />
                </Stos>
              }
            />
            <KartaZmian kontekst={kontekst} />
            {ETAPY.map((etap, indeks) => {
              const wszystkie = pozycje.filter((p) => p.etap === etap);
              const sprawy = wszystkie
                .filter((p) => !czySprawaOplacenia(p.idSprawy))
                .sort((a, b) => (a.idPozycji ?? '').localeCompare(b.idPozycji ?? '') || a.idSprawy.localeCompare(b.idSprawy));
              const dodatki = dodatkiEtapu(etap);
              return (
                <EtapPlanu
                  key={etap}
                  etap={etap}
                  sprawy={sprawy}
                  liczbaSpraw={wszystkie.length}
                  kontekst={kontekst}
                  terminy={terminy}
                  biezacy={etap === biezacyEtap}
                  zakonczony={indeks < indeksBiezacego}
                  wstep={dodatki.wstep}
                  przedTabela={dodatki.przedTabela}
                  poTabeli={dodatki.poTabeli}
                />
              );
            })}
            <KartaDanychPlanu kontekst={kontekst} />
          </>
        )}
      </Stos>
      <ArkuszPotwierdzeniaSkladek
        otwarte={arkuszOtwarty}
        onZamknij={() => setArkuszOtwarty(false)}
        miesiac={ocena?.oplacenie?.miesiac ?? null}
      />
    </>
  );
}
