'use client';

// ViewFamilyPlanStage (P): strona jednego etapu planu rodziny pod /plan-rodziny/etap/[etap] (historyjki 3.6.1.2.1,
// 3.6.1.3.1, wzór Plan-rodziny). Nagłówek „Etap N: <nazwa>” ze stanem etapu i liczbą spraw, opis etapu, sprawy etapu
// ze slotami przy sprawie, strażnik ubezpieczenia chorobowego w etapie Ciąża, przejścia do poprzedniego i następnego
// etapu oraz powrót do planu rodziny. Slug etapu jest identyfikatorem etapu z typu Etap. Właściciel: u12.
import { use, useState, type ReactNode } from 'react';
import { useKontekstRodziny, useStanKontaOsoby } from '@/dane/magazyn/hooki';
import { osobyRodziny } from '@/dane/magazyn/stan';
import { formatujDate } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import { wyznaczBiezacyEtap } from '@/domena/plan/etap';
import { czySprawaOplacenia } from '@/domena/plan/straznik';
import type { Etap } from '@/domena/typy';
import { Kafelki } from '@/komponenty/kafelki';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';
import { ArkuszPotwierdzeniaSkladek } from '@/app/(strefa)/plan-rodziny/_czesci/arkusz-potwierdzenia-skladek';
import { EtapPlanu } from '@/app/(strefa)/plan-rodziny/_czesci/etap-planu';
import { OznaczenieEtapu, licznikSprawEtapu, stanEtapu } from '@/app/(strefa)/plan-rodziny/_czesci/karty-planu';
import { useOcenaStraznika } from '@/app/(strefa)/plan-rodziny/_czesci/ocena-straznika';
import { etapZeSlugu, sciezkaEtapu } from '@/app/(strefa)/plan-rodziny/_czesci/sciezka-etapu';
import { ETAPY, nazwaEtapu, numerEtapu } from '@/app/(strefa)/plan-rodziny/_czesci/sprawy';
import { StraznikPlanu } from '@/app/(strefa)/plan-rodziny/_czesci/straznik-planu';
import { SlotKomunikatyPrzyjecia } from '@/app/(strefa)/plan-rodziny/_sloty/komunikaty-przyjecia';

const t = teksty.ViewFamilyPlanStage;
const tp = teksty.ViewFamilyPlan;

function tytulEtapu(etap: Etap): string {
  return t.naglowek({ numer: String(numerEtapu(etap)), nazwa: nazwaEtapu(etap) });
}

export function WidokEtapuPlanu({ params }: { params: PageProps<'/plan-rodziny/etap/[etap]'>['params'] }) {
  const { etap: slug } = use(params);
  const etap = etapZeSlugu(slug);
  const kontekst = useKontekstRodziny();
  const ocena = useOcenaStraznika(kontekst);
  const daneRodziny = kontekst?.rodzina.daneRodziny;
  const peselMatki = daneRodziny ? osobyRodziny(daneRodziny).peselMatki : undefined;
  const kontoMatki = useStanKontaOsoby(kontekst?.rola === 'drugi-rodzic' ? peselMatki : undefined);
  const [arkuszOtwarty, setArkuszOtwarty] = useState(false);
  const powrot = { href: sciezkaWidoku('ViewFamilyPlan'), etykieta: t.powrot };
  const stopka = (
    <div className="flex flex-wrap gap-4">
      <PrzyciskLink wariant="drugorzedny" href={sciezkaWidoku('ViewFamilyPlan')}>
        {t.wrocDoPlanu}
      </PrzyciskLink>
    </div>
  );

  if (etap === null) {
    return (
      <>
        <NaglowekStrony tytul={t.nieznanyEtap.naglowek} powrot={powrot} />
        <StanPusty
          ikona="plan"
          akcja={
            <PrzyciskLink wariant="glowny" href={sciezkaWidoku('ViewFamilyPlan')}>
              {t.nieznanyEtap.akcja}
            </PrzyciskLink>
          }
        >
          {t.nieznanyEtap.opis}
        </StanPusty>
      </>
    );
  }

  if (kontekst === null || kontekst.rodzina.plan === null) {
    return (
      <>
        <NaglowekStrony tytul={tytulEtapu(etap)} powrot={powrot} />
        <Stos odstep={7.5}>
          <StanPusty ikona="plan">{tp.brakPlanu}</StanPusty>
          {stopka}
        </Stos>
      </>
    );
  }

  const { rodzina, dzis } = kontekst;
  const pozycje = rodzina.plan?.pozycje ?? [];
  const terminy = rodzina.kalendarz?.terminy ?? [];
  const daneCiazy = rodzina.daneCiazy;
  const biezacyEtap = wyznaczBiezacyEtap(daneCiazy, dzis);
  const indeks = ETAPY.indexOf(etap);
  const poprzedni = indeks > 0 ? ETAPY[indeks - 1] : null;
  const nastepny = indeks < ETAPY.length - 1 ? ETAPY[indeks + 1] : null;
  const wszystkie = pozycje.filter((p) => p.etap === etap);
  const sprawy = wszystkie
    .filter((p) => !czySprawaOplacenia(p.idSprawy))
    .sort((a, b) => (a.idPozycji ?? '').localeCompare(b.idPozycji ?? '') || a.idSprawy.localeCompare(b.idSprawy));
  const sprawaOplacenia = ocena?.oplacenie
    ? pozycje.find((p) => p.idSprawy === ocena.oplacenie?.idSprawy)
    : undefined;
  const dochod = rodzina.daneRodziny.dochodNaOsobe?.wartosc;
  const bezBecikowego =
    typeof dochod === 'number' && !pozycje.some((p) => p.idPozycji === 'K14' || p.idPozycji === 'K15');
  const matkaDopelniacz =
    kontoMatki?.konto.imieINazwiskoDopelniacz ??
    (kontekst.daneZusMatki ? `${kontekst.daneZusMatki.imie} ${kontekst.daneZusMatki.nazwisko}` : undefined);

  const dataPorodu = daneCiazy?.dataPoroduPotwierdzona && daneCiazy.dataPorodu ? daneCiazy.dataPorodu : null;
  const opisEtapu =
    etap !== 'ciaza'
      ? tp.opisyEtapow[etap]
      : dataPorodu
        ? `${tp.opisyEtapow.ciaza} ${tp.dataPorodu({ data: formatujDate(dataPorodu) })}`
        : daneCiazy?.przewidywanyTerminPorodu
          ? `${tp.opisyEtapow.ciaza} ${tp.terminPorodu({ data: formatujDate(daneCiazy.przewidywanyTerminPorodu) })}`
          : tp.opisyEtapow.ciaza;

  let przedTabela: ReactNode;
  let poTabeli: ReactNode;
  if (etap === 'ciaza') {
    przedTabela = ocena ? (
      <StraznikPlanu
        ocena={ocena}
        sprawaOplacenia={sprawaOplacenia}
        rola={kontekst.rola}
        matkaDopelniacz={matkaDopelniacz}
        onPotwierdz={() => setArkuszOtwarty(true)}
      />
    ) : undefined;
    // Stan rozliczeń składek dotyczy osoby z jednoosobową działalnością gospodarczą.
    const formaOsoby =
      kontekst.rola === 'drugi-rodzic'
        ? rodzina.daneRodziny.drugiRodzic.formaZatrudnienia?.wartosc
        : rodzina.daneRodziny.matka.formaZatrudnienia?.wartosc;
    const jdg = formaOsoby === 'jdg';
    poTabeli = (
      <div className="flex flex-col gap-4">
        <p className="m-0 text-body">{tp.ezla.opis}</p>
        <p className="m-0 text-body">{t.swiadczeniaWCiazy.opis}</p>
        {jdg ? <p className="m-0 text-body">{t.stanRozliczen.opis}</p> : null}
        <Kafelki
          kolumny={jdg ? 3 : 2}
          kafelki={[
            { href: sciezkaWidoku('ViewSickLeaveList'), etykieta: tp.ezla.kafelek },
            { href: sciezkaWidoku('ViewPregnancyBenefits'), etykieta: t.swiadczeniaWCiazy.kafelek },
            ...(jdg ? [{ href: sciezkaWidoku('ViewContributionBalance'), etykieta: t.stanRozliczen.kafelek }] : []),
          ]}
        />
      </div>
    );
  } else if (etap === 'urlopy-i-zasilek') {
    przedTabela = <SlotKomunikatyPrzyjecia kontekst={kontekst} etap={etap} />;
    poTabeli = (
      <div className="flex flex-col gap-4">
        <p className="m-0 text-body">{tp.kalkulator.opis}</p>
        <Kafelki kafelki={[{ href: sciezkaWidoku('ViewCalcMaternityInput'), etykieta: tp.kalkulator.kafelek }]} />
      </div>
    );
  } else if (etap === 'pieniadze-na-dziecko' && bezBecikowego && typeof dochod === 'number') {
    poTabeli = (
      <Notatka>
        <p className="m-0">{tp.bezBecikowego({ dochod: formatujKwote(dochod) })}</p>
      </Notatka>
    );
  }

  return (
    <>
      <NaglowekStrony
        tytul={tytulEtapu(etap)}
        stanNa={dzis}
        powrot={powrot}
        wstep={
          <div className="flex flex-col gap-2">
            <p>{opisEtapu}</p>
            <p className="text-body-strong">{licznikSprawEtapu(wszystkie)}</p>
          </div>
        }
        akcje={<OznaczenieEtapu stan={stanEtapu(indeks, ETAPY.indexOf(biezacyEtap), wszystkie)} />}
      />
      <Stos odstep={7.5}>
        <EtapPlanu
          etap={etap}
          sprawy={sprawy}
          kontekst={kontekst}
          terminy={terminy}
          przedTabela={przedTabela}
          poTabeli={poTabeli}
        />
        <nav aria-label={t.nawigacja} className="flex flex-wrap items-center justify-between gap-4">
          {poprzedni ? (
            <PrzyciskLink wariant="drugorzedny" ikona="strzalka-w-lewo" href={sciezkaEtapu(poprzedni)}>
              {t.poprzedniEtap({ nazwa: nazwaEtapu(poprzedni) })}
            </PrzyciskLink>
          ) : (
            <span aria-hidden="true" />
          )}
          {nastepny ? (
            <PrzyciskLink wariant="drugorzedny" ikonaPo="strzalka-w-prawo" href={sciezkaEtapu(nastepny)}>
              {t.nastepnyEtap({ nazwa: nazwaEtapu(nastepny) })}
            </PrzyciskLink>
          ) : null}
        </nav>
        {stopka}
      </Stos>
      {etap === 'ciaza' ? (
        <ArkuszPotwierdzeniaSkladek
          otwarte={arkuszOtwarty}
          onZamknij={() => setArkuszOtwarty(false)}
          miesiac={ocena?.oplacenie?.miesiac ?? null}
        />
      ) : null}
    </>
  );
}
