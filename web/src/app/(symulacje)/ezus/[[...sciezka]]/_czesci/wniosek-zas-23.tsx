'use client';

// ViewEzusZas23: wniosek ZAS-23 o skrócenie okresu wypłaty zasiłku macierzyńskiego w symulowanym eZUS (u34,
// komunikat 0207). Matka na umowie zlecenia albo w działalności, której zasiłek wypłaca ZUS, rezygnuje z dalszej
// części zasiłku po 14 tygodniach po porodzie, a pozostałą część przejmuje ojciec dziecka na podstawie oświadczenia.
import { useMemo } from 'react';
import { FormularzRezygnacjiZZasilku } from '@/app/(strefa)/wnioski/rezygnacja-z-urlopu-macierzynskiego/_czesci/formularz-zasilku';
import { useKontekstRodziny } from '@/dane/magazyn/hooki';
import { osobyRodziny } from '@/dane/magazyn/stan';
import type { WniosekOUrlop } from '@/domena/typy';
import {
  czyObjetyChorobowym,
  dniPrzedPorodemZWnioskow,
  otworzRezygnacje,
  urlopMacierzynski,
} from '@/domena/wnioski/rezygnacja';
import { formatujDate } from '@/komponenty/format';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';

const t = teksty.ViewEzusZas23;

export function WniosekZas23() {
  const kontekst = useKontekstRodziny();
  const dane = useMemo(() => {
    if (!kontekst) return null;
    const { daneRodziny, daneCiazy, wnioski } = kontekst.rodzina;
    const peselMatki = osobyRodziny(daneRodziny).peselMatki ?? kontekst.konto.pesel;
    const otwarcie = otworzRezygnacje({
      daneRodziny,
      daneCiazy,
      wnioski,
      daneZusMatki: kontekst.daneZusMatki ?? kontekst.daneZusKonta,
      peselMatki,
    });
    const dataPorodu = daneCiazy?.dataPorodu;
    const urlop = dataPorodu
      ? urlopMacierzynski(kontekst.katalog, dataPorodu, daneCiazy?.liczbaUrodzonychDzieci ?? 1, dniPrzedPorodemZWnioskow(wnioski, dataPorodu))
      : null;
    const zapisana =
      wnioski
        .filter(
          (w): w is WniosekOUrlop =>
            w.rodzaj === 'rezygnacja-z-czesci-zasilku' && w.adresat === 'zus' && w.stan === 'wyslany' && w.konto === kontekst.konto.pesel,
        )
        .at(-1) ?? null;
    return { otwarcie, urlop, zapisana };
  }, [kontekst]);

  const naglowek = <NaglowekStrony tytul={t.naglowek} wstep={t.wstep} powrot={false} bezKomunikatowPoPrzejsciu />;
  const przejdzDoRezygnacji = (
    <PrzyciskLink href={trasy.ViewMaternityResignation()} wariant="drugorzedny">
      {t.przejdzDoRezygnacji}
    </PrzyciskLink>
  );

  if (!kontekst || !dane) {
    return (
      <>
        {naglowek}
        <Komunikat tresc={t.brakRodziny} />
      </>
    );
  }
  const { otwarcie, urlop, zapisana } = dane;
  if (!urlop) {
    return (
      <>
        {naglowek}
        <Komunikat tresc={t.brakDatyPorodu} akcje={przejdzDoRezygnacji} />
      </>
    );
  }
  if (otwarcie.wariant !== 'rezygnacja-w-ezus' && !zapisana) {
    return (
      <>
        {naglowek}
        <Komunikat kod="0338" akcje={przejdzDoRezygnacji} />
      </>
    );
  }

  const drugi = kontekst.rodzina.daneRodziny.drugiRodzic;
  const formaOjca = drugi.formaZatrudnienia?.wartosc;
  if (!zapisana && (!formaOjca || formaOjca === 'brak-drugiego-rodzica')) {
    return (
      <>
        {naglowek}
        <Komunikat kod="0206" akcje={przejdzDoRezygnacji} />
      </>
    );
  }
  if (!zapisana && !czyObjetyChorobowym(formaOjca, drugi.dobrowolneChorobowe?.wartosc)) {
    return (
      <>
        {naglowek}
        <Komunikat kod="0258" akcje={przejdzDoRezygnacji} />
      </>
    );
  }

  const wniosekZam = otwarcie.wniosekZam;
  const pozycjeZam = [
    {
      etykieta: t.zasilekZaUrlop,
      wartosc: t.okres({ od: formatujDate(urlop.okres.od), do_: formatujDate(urlop.okres.do) }),
    },
    {
      etykieta: t.wniosekZam,
      wartosc:
        wniosekZam?.potwierdzenie && wniosekZam.dataZlozenia
          ? t.wniosekZamNumer({ numer: wniosekZam.potwierdzenie, data: formatujDate(wniosekZam.dataZlozenia) })
          : t.wniosekZamWZus,
    },
  ];

  return (
    <>
      {naglowek}
      <Stos odstep={7.5} className="mt-7.5">
        <FormularzRezygnacjiZZasilku
          adresat="zus"
          idSprawy={wniosekZam?.idSprawy ?? 'K08'}
          urlop={urlop}
          zOrzeczeniem={otwarcie.zOrzeczeniem}
          dzis={kontekst.dzis}
          matka={`${kontekst.konto.imie} ${kontekst.konto.nazwisko}`}
          ojciec={[drugi.imie, drugi.nazwisko].filter(Boolean).join(' ')}
          pozycjeZam={pozycjeZam}
          zapisana={zapisana}
        />
      </Stos>
    </>
  );
}
