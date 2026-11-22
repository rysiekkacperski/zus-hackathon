'use client';

// ViewCalcParentalSplit: plan podziału urlopu rodzicielskiego (historyjka 3.10.2.1.1, u26).
import { useState } from 'react';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PoleKwoty, PoleLiczby } from '@/komponenty/pole-tekstowe';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { StanPusty } from '@/komponenty/stan-pusty';
import { BladWyliczenia, SzkieletWyliczenia } from '@/komponenty/stan-wyliczenia';
import { Ikona } from '@/komponenty/ikona';
import { trasy } from '@/komponenty/rama/trasy';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { wyliczPodzialUrlopu } from '@/dane/api/klient';
import { useWyliczenieApi } from '@/dane/api/wyliczenie';
import { useKontekstRodziny } from '@/dane/magazyn/hooki';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { zapiszPlanPodzialu } from '@/dane/magazyn/operacje/kalkulacje-decyzje';
import { formatujDate } from '@/domena/daty';
import { formatujKwote, parsujKwote } from '@/domena/kwoty';
import { daneDzieckaDoKalkulatora, etykietyStawekZasilku, maPrawoDoZasilku, walidujPodstawe, walidujTygodnie } from '@/domena/kalkulatory/wariant';
import { wartosciStartowe, zasadyPodzialu } from '@/domena/kalkulatory/podzial';
import type { BledyPol, KodKomunikatu, PodstawaWymiaru, RodzicWRodzinie } from '@/domena/typy';
import { teksty } from '@/teksty';
import { ostatniPodzial, podstawaDoZadaniaApi, podstawaZKontaZus, wariantMatkiZPlanu, wybranyWariantSprawy, type StanPodstawy } from '../_czesci/dane-kalkulatorow';
import { WynikPodzialuUrlopu } from './_czesci/wynik-podzialu';

const t = teksty.ViewCalcParentalSplit;
const tyg = teksty.ViewCalcMaternityVariant.tygodnie;
type Pole = 'tygodnieMatki' | 'tygodnieDrugiegoRodzica' | 'podstawaMatki' | 'podstawaDrugiego';
// Kolejność pól na ekranie i cel fokusu po nieudanym wyliczeniu.
const POLA: Record<Pole, string> = {
  tygodnieMatki: 'tygodnieMatki',
  podstawaMatki: 'podstawaMatki',
  tygodnieDrugiegoRodzica: 'tygodnieDrugiegoRodzica',
  podstawaDrugiego: 'podstawaDrugiego',
};
/** Tygodnie i podstawy rodziców ostatniego wyliczenia. */
interface WejsciePodzialu {
  M: number;
  D: number;
  podstawy: Partial<Record<RodzicWRodzinie, PodstawaWymiaru>>;
}
interface WpisPodzialu {
  tekstMatki: string;
  tekstDrugiego: string;
  tekstPodstawyMatki: string;
  tekstPodstawyDrugiego: string;
}

export function WidokPodzialuUrlopuRodzicielskiego() {
  const kontekst = useKontekstRodziny();
  if (kontekst === null) {
    return (
      <>
        <NaglowekStrony tytul={t.naglowek} />
        <StanPusty ikona="profil" akcja={<PrzyciskLink href={trasy.ViewProfileSummary({ tryb: 'rodzina' })} wariant="drugorzedny">{t.przejdzDoProfilu}</PrzyciskLink>}>
          {t.brakRodziny}
        </StanPusty>
      </>
    );
  }
  return <Kalkulator kontekst={kontekst} />;
}

function Kalkulator({ kontekst }: { kontekst: NonNullable<ReturnType<typeof useKontekstRodziny>> }) {
  const { katalog, dzis, rodzina, konto } = kontekst;
  const dane = rodzina.daneRodziny;
  const dziecko = daneDzieckaDoKalkulatora(rodzina.daneCiazy);
  const dzien = dziecko.dataPorodu ?? dzis;
  const z = zasadyPodzialu(dziecko.liczbaDzieci, dziecko.zaZyciem, katalog, dzien);
  const st = etykietyStawekZasilku(katalog, dzien);
  const formaDrugiego = dane.drugiRodzic.formaZatrudnienia?.wartosc ?? null;
  const bezPrawa = formaDrugiego !== null && !maPrawoDoZasilku(formaDrugiego, dane.drugiRodzic.dobrowolneChorobowe?.wartosc);
  const { wariant: wariantMatki, sprawa: sprawaWariantu, zapisano: wariantZapisano } = wariantMatkiZPlanu(rodzina.plan);

  const kopiaMatki = kontekst.daneZusMatki ?? (dane.rodzicKonta === 'matka' ? kontekst.daneZusKonta : null);
  const stanMatki: StanPodstawy = podstawaZKontaZus(kopiaMatki, dane.matka.formaZatrudnienia?.wartosc, dzien, katalog);
  const stanDrugiego: StanPodstawy = podstawaZKontaZus(
    kontekst.daneZusDrugiegoRodzica,
    formaDrugiego === 'brak-drugiego-rodzica' ? null : formaDrugiego,
    dzien,
    katalog,
  );
  const podstawaMatkiZus = stanMatki.rodzaj === 'wyliczona' ? stanMatki.podstawa : null;
  const podstawaDrugiegoZus = !bezPrawa && stanDrugiego.rodzaj === 'wyliczona' ? stanDrugiego.podstawa : null;
  const poleDrugiego = !bezPrawa && podstawaDrugiegoZus === null;

  const imieMatki = kopiaMatki ? `${kopiaMatki.imie} ${kopiaMatki.nazwisko}` : dane.rodzicKonta === 'matka' ? `${konto.imie} ${konto.nazwisko}` : '';
  const imieDrugiego = [dane.drugiRodzic.imie, dane.drugiRodzic.nazwisko].filter(Boolean).join(' ');
  const zapisanyWariant = wybranyWariantSprawy(rodzina.plan, 'K10');
  const zapisanyPlan = ostatniPodzial(rodzina.wynikiKalkulacji);
  const start =
    zapisanyWariant && 'tygodnieMatki' in zapisanyWariant
      ? { tygodnieMatki: zapisanyWariant.tygodnieMatki, tygodnieDrugiegoRodzica: zapisanyWariant.tygodnieDrugiegoRodzica }
      : zapisanyPlan
        ? { tygodnieMatki: zapisanyPlan.tygodnieMatki, tygodnieDrugiegoRodzica: zapisanyPlan.tygodnieDrugiegoRodzica }
        : wartosciStartowe(z, bezPrawa);

  const [tekstMatki, setTekstMatki] = useState(String(start.tygodnieMatki));
  const [tekstDrugiego, setTekstDrugiego] = useState(String(bezPrawa ? 0 : start.tygodnieDrugiegoRodzica));
  const [tekstPodstawyMatki, setTekstPodstawyMatki] = useState('');
  const [tekstPodstawyDrugiego, setTekstPodstawyDrugiego] = useState('');
  const [zapisano, setZapisano] = useState(false);
  const [bladZapisu, setBladZapisu] = useState<KodKomunikatu | null>(null);

  // Wynik podziału liczy serwer: POST /api/v1/kalkulator/podzial-urlopu, z podstawą z konta ZUS jako podstawami składek.
  // Na starcie wynik pokazuje zapisany albo startowy podział, gdy tygodnie mieszczą się w wymiarze.
  const [wejscie, setWejscie] = useState<WejsciePodzialu | null>(() => {
    if (podstawaMatkiZus === null || poleDrugiego) return null;
    const podstawy: Partial<Record<RodzicWRodzinie, PodstawaWymiaru>> = { matka: podstawaMatkiZus };
    if (podstawaDrugiegoZus) podstawy['drugi-rodzic'] = podstawaDrugiegoZus;
    const M = start.tygodnieMatki;
    const D = bezPrawa ? 0 : start.tygodnieDrugiegoRodzica;
    const tm = walidujTygodnie(String(M), z.maks);
    const td = walidujTygodnie(String(D), z.maks);
    return 'kod' in tm || 'kod' in td || M + D > z.wymiar ? null : { M, D, podstawy };
  });
  const formaMatki = dane.matka.formaZatrudnienia?.wartosc;
  const formaDrugiegoDoPodstawy = formaDrugiego === 'brak-drugiego-rodzica' ? null : formaDrugiego;
  // Hook wyliczenia porównuje treść żądania, więc żądanie powstaje przy każdym renderze bez memoizacji.
  const drugiegoWejscia = wejscie?.podstawy['drugi-rodzic'];
  const zadanieApi =
    wejscie === null || wejscie.podstawy.matka === undefined
      ? null
      : {
          dzis,
          dataPorodu: dzien,
          liczbaDzieci: dziecko.liczbaDzieci,
          zaZyciem: dziecko.zaZyciem,
          wariantMatki,
          drugiRodzicBezPrawa: bezPrawa,
          tygodnieMatki: wejscie.M,
          tygodnieDrugiegoRodzica: wejscie.D,
          podstawy: {
            matka: podstawaDoZadaniaApi(wejscie.podstawy.matka, kopiaMatki, formaMatki),
            ...(drugiegoWejscia
              ? { 'drugi-rodzic': podstawaDoZadaniaApi(drugiegoWejscia, kontekst.daneZusDrugiegoRodzica, formaDrugiegoDoPodstawy) }
              : {}),
          },
        };
  const wyliczenieApi = useWyliczenieApi(zadanieApi, wyliczPodzialUrlopu);
  // Wynik pokazujemy wyłącznie z odpowiedzią dla bieżących tygodni i podstaw, bo zapis bierze tygodnie z wejścia.
  const wyliczenie = wejscie !== null && wyliczenieApi.aktualne && wyliczenieApi.wartosc
    ? { ...wejscie, wynik: wyliczenieApi.wartosc.wynik }
    : null;

  const razem = (Number(tekstMatki.trim()) || 0) + (bezPrawa ? 0 : Number(tekstDrugiego.trim()) || 0);

  // Błędy pól i dane do wyliczenia z bieżącego wpisu.
  function ocen(w: WpisPodzialu) {
    const b: BledyPol<Pole> = {};
    const tm = walidujTygodnie(w.tekstMatki, z.maks);
    if ('kod' in tm) b.tygodnieMatki = tm.kod;
    const td = bezPrawa ? { tygodnie: 0 } : walidujTygodnie(w.tekstDrugiego, z.maks);
    if ('kod' in td) b.tygodnieDrugiegoRodzica = td.kod;
    else if ('tygodnie' in tm && tm.tygodnie + td.tygodnie > z.wymiar) b.tygodnieDrugiegoRodzica = '0061';
    const podstawy: Partial<Record<RodzicWRodzinie, PodstawaWymiaru>> = {};
    if (podstawaMatkiZus) podstawy.matka = podstawaMatkiZus;
    else {
      const p = walidujPodstawe(w.tekstPodstawyMatki, parsujKwote);
      if ('kod' in p) b.podstawaMatki = p.kod;
      else podstawy.matka = { kwota: p.kwota, zrodlo: 'wartosc-wpisana-przez-rodzica' };
    }
    if (podstawaDrugiegoZus) podstawy['drugi-rodzic'] = podstawaDrugiegoZus;
    else if (poleDrugiego) {
      const p = walidujPodstawe(w.tekstPodstawyDrugiego, parsujKwote);
      if ('kod' in p) b.podstawaDrugiego = p.kod;
      else podstawy['drugi-rodzic'] = { kwota: p.kwota, zrodlo: 'wartosc-wpisana-przez-rodzica' };
    }
    return { bledy: b, tm, td, podstawy };
  }

  const walidacja = useWalidacjaNaBiezaco({
    wartosci: { tekstMatki, tekstDrugiego, tekstPodstawyMatki, tekstPodstawyDrugiego },
    waliduj: (w) => ocen(w).bledy,
    pola: POLA,
  });

  function wylicz() {
    setZapisano(false);
    if (!walidacja.sprobujWyslac()) {
      setWejscie(null);
      return;
    }
    const { tm, td, podstawy } = ocen({ tekstMatki, tekstDrugiego, tekstPodstawyMatki, tekstPodstawyDrugiego });
    if ('kod' in tm || 'kod' in td) return;
    setWejscie({ M: tm.tygodnie, D: td.tygodnie, podstawy });
  }

  function zapisz() {
    if (wyliczenie === null) return;
    const { wynik } = wyliczenie;
    const r = zapiszPlanPodzialu(
      {
        podstawy: wyliczenie.podstawy,
        wariantMatki,
        liczbaDzieci: dziecko.liczbaDzieci,
        zaZyciem: dziecko.zaZyciem,
        wymiar: wynik.wymiar,
        tygodnieMatki: wyliczenie.M,
        tygodnieDrugiegoRodzica: wyliczenie.D,
        tygodniePrzepadajace: wynik.przepadajace,
        wynik: { stawki: wynik.stawki, miesiecznie: wynik.miesiecznie, sumy: wynik.sumy },
      },
      pobierzKontekstOperacji(),
    );
    if (r.ok) {
      setBladZapisu(null);
      setZapisano(true);
      window.scrollTo({ top: 0 });
    } else setBladZapisu(r.kod);
  }

  const zrodloPodstawy = (p: PodstawaWymiaru, rodzic: RodzicWRodzinie) => {
    if (p.zrodlo === 'wartosc-wpisana-przez-rodzica') return t.zrodloRodzic;
    if (p.zrodlo === 'przykladowa-sprawa') return t.zrodloSprawa;
    if (rodzic === 'drugi-rodzic') {
      const d = kontekst.daneZusDrugiegoRodzica;
      if (d && 'zrodlo' in d && d.zrodlo === 'pelnomocnictwo-pel') return t.zrodloPel;
      const osoba = dane.drugiRodzic.imieINazwiskoDopelniacz;
      return osoba ? t.zrodloKontoZusOsoby({ osoby: osoba }) : t.zrodloKontoZus;
    }
    return t.zrodloKontoZus;
  };
  const opisDzieci =
    dziecko.liczbaDzieci === 1
      ? dziecko.zaZyciem ? t.jednoDzieckoZaZyciem : t.jednoDziecko
      : dziecko.zaZyciem ? t.wiecejDzieciZaZyciem({ liczba: dziecko.liczbaDzieci }) : t.wiecejDzieci({ liczba: dziecko.liczbaDzieci });
  const wariantOpis = sprawaWariantu && wariantZapisano
    ? t.wariantWybrany({ wariant: t.nazwaWariantu(wariantMatki, st), data: formatujDate(wariantZapisano), sprawa: sprawaWariantu === 'K07' ? t.sprawaK07 : t.sprawaK08 })
    : t.wariantZPlanu({ wariant: t.nazwaWariantu(wariantMatki, st) });
  const formaOpis = formaDrugiego
    ? `${t.formy[formaDrugiego]}${
        formaDrugiego === 'umowa-zlecenia' || formaDrugiego === 'jdg'
          ? dane.drugiRodzic.dobrowolneChorobowe?.wartosc ? t.zDobrowolnym : t.bezDobrowolnego
          : ''
      }${dane.drugiRodzic.formaZatrudnienia?.zrodlo === 'odpowiedz-rodzica' ? t.zrodloOdpowiedz : ''}`
    : null;
  const powrot = { href: trasy.ViewCaseGuide({ idSprawy: 'K10' }), etykieta: t.powrot };

  return (
    <>
      <NaglowekStrony
        tytul={t.naglowek}
        powrot={powrot}
        stanNa={dzis}
        akcje={<Odnosnik href={trasy.ViewCalcMaternityResult()}>{t.otworzKalkulator}</Odnosnik>}
      />
      <div className="flex max-w-tresc flex-col gap-7.5">
        {zapisano && wyliczenie ? (
          <Komunikat tresc={t.zapisano({ tygodnieMatki: tyg(wyliczenie.M), tygodnieDrugiego: tyg(wyliczenie.D) })} />
        ) : null}
        {bladZapisu ? <Komunikat kod={bladZapisu} /> : null}
        <Karta tytul={t.rozdzielTytul} bezLinii>
          <p className="m-0 mb-6 text-body">
            {(bezPrawa ? t.opisBezPrawa : t.opis)({ dzieci: opisDzieci, wymiar: tyg(z.wymiar), maks: tyg(z.maks) })}
          </p>
          <div className="flex flex-wrap items-start gap-7.5">
            <div role="group" aria-labelledby="matka-naglowek" className="flex min-w-0 grow basis-90 flex-col gap-4">
              <h3 id="matka-naglowek" className="m-0 flex items-center gap-2 text-body-strong">
                <span aria-hidden="true" className="inline-block size-4 rounded-xs bg-brand-chart" />
                {t.matkaNaglowek({ imie: imieMatki })}
              </h3>
              {podstawaMatkiZus === null ? <Komunikat kod="0094" /> : null}
              <PoleLiczby
                id="tygodnieMatki"
                etykieta={t.tygodnieMatki}
                podpowiedz={t.podpowiedzMatki({ maks: z.maks })}
                wartosc={tekstMatki}
                onZmiana={setTekstMatki}
                {...walidacja.pole('tygodnieMatki')}
                szerokosc="waska"
              />
              {podstawaMatkiZus === null ? (
                <PoleKwoty
                  id="podstawaMatki"
                  etykieta={t.podstawaMatkiEtykieta}
                  podpowiedz={t.podstawaPodpowiedz}
                  wartosc={tekstPodstawyMatki}
                  onZmiana={setTekstPodstawyMatki}
                  {...walidacja.pole('podstawaMatki')}
                  szerokosc="srednia"
                />
              ) : null}
              <dl className="m-0 grid grid-cols-1 gap-x-4 gap-y-1 text-body sm:grid-cols-[auto_1fr]">
                {podstawaMatkiZus ? (
                  <>
                    <dt className="text-ink-muted">{t.podstawaWymiaru}</dt>
                    <dd className="m-0">{t.podstawaZeZrodlem({ kwota: formatujKwote(podstawaMatkiZus.kwota), zrodlo: zrodloPodstawy(podstawaMatkiZus, 'matka') })}</dd>
                  </>
                ) : null}
                <dt className="text-ink-muted">{t.wariantZasilku}</dt>
                <dd className="m-0">
                  {wariantOpis}
                  <Odnosnik href={trasy.ViewCalcMaternityVariant({ sprawa: sprawaWariantu ?? (dane.matka.formaZatrudnienia?.wartosc === 'umowa-o-prace' ? 'K07' : 'K08') })} wTekscie>
                    {t.porownajWarianty}
                  </Odnosnik>
                </dd>
              </dl>
            </div>
            <div role="group" aria-labelledby="drugi-naglowek" className="flex min-w-0 grow basis-90 flex-col gap-4">
              <h3 id="drugi-naglowek" className="m-0 flex items-center gap-2 text-body-strong">
                <span aria-hidden="true" className="inline-block size-4 rounded-xs bg-brand" />
                {bezPrawa ? t.drugiNaglowek({ imie: '' }) : t.drugiNaglowek({ imie: imieDrugiego })}
              </h3>
              {poleDrugiego ? <Komunikat kod={stanDrugiego.rodzaj === 'brak-danych' ? '0173' : '0094'} /> : null}
              {bezPrawa ? (
                <div>
                  <p id="tygodnie-drugiego-etykieta" className="m-0 text-body-strong">{t.tygodnieDrugiego}</p>
                  <p className="m-0 mt-1 flex items-center gap-2 text-amount text-ink-strong" aria-describedby="tygodnie-drugiego-etykieta">
                    <Ikona nazwa="klodka" rozmiar={20} />
                    {t.zeroTygodni}
                  </p>
                  <p className="m-0 text-body">{t.bezZmiany}</p>
                </div>
              ) : (
                <PoleLiczby
                  id="tygodnieDrugiegoRodzica"
                  etykieta={t.tygodnieDrugiego}
                  podpowiedz={t.podpowiedzDrugiego({ maks: z.maks, wymiar: z.wymiar })}
                  wartosc={tekstDrugiego}
                  onZmiana={setTekstDrugiego}
                  {...walidacja.pole('tygodnieDrugiegoRodzica')}
                  szerokosc="waska"
                />
              )}
              {poleDrugiego ? (
                <PoleKwoty
                  id="podstawaDrugiego"
                  etykieta={t.podstawaDrugiegoEtykieta}
                  podpowiedz={t.podstawaPodpowiedz}
                  wartosc={tekstPodstawyDrugiego}
                  onZmiana={setTekstPodstawyDrugiego}
                  {...walidacja.pole('podstawaDrugiego')}
                  szerokosc="srednia"
                />
              ) : null}
              <dl className="m-0 grid grid-cols-1 gap-x-4 gap-y-1 text-body sm:grid-cols-[auto_1fr]">
                {podstawaDrugiegoZus ? (
                  <>
                    <dt className="text-ink-muted">{t.podstawaWymiaru}</dt>
                    <dd className="m-0">{t.podstawaZeZrodlem({ kwota: formatujKwote(podstawaDrugiegoZus.kwota), zrodlo: zrodloPodstawy(podstawaDrugiegoZus, 'drugi-rodzic') })}</dd>
                  </>
                ) : null}
                {formaOpis ? (
                  <>
                    <dt className="text-ink-muted">{t.formaZatrudnienia}</dt>
                    <dd className="m-0">{formaOpis}</dd>
                  </>
                ) : null}
              </dl>
              {bezPrawa ? (
                <Notatka>
                  {t.bezPrawaNotatka}{' '}
                  <Odnosnik href={trasy.ViewProfileSummary({ tryb: 'rodzina' })} wTekscie>{t.sprawdzProfil}</Odnosnik>
                </Notatka>
              ) : null}
              {poleDrugiego && stanDrugiego.rodzaj === 'brak-danych' ? (
                <p className="m-0 text-body">
                  <Odnosnik href={trasy.ViewProfileSummary({ tryb: 'rodzina' })}>{t.zaprosDrugiego}</Odnosnik>
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-line-row pt-6">
            <p className="m-0 text-body" aria-live="polite">
              {t.razemEtykieta}
              <strong>{t.razem({ suma: String(razem), wymiar: z.wymiar })}</strong>
            </p>
            <Przycisk wariant="drugorzedny" onClick={wylicz}>{t.wylicz}</Przycisk>
          </div>
        </Karta>

        <Karta tytul={t.wynikTytul} bezLinii>
          {wyliczenie ? (
            <>
              <WynikPodzialuUrlopu
                wynik={wyliczenie.wynik}
                tygodnieMatki={wyliczenie.M}
                tygodnieDrugiego={wyliczenie.D}
                wariantMatki={wariantMatki}
                zaZyciem={dziecko.zaZyciem}
                bezPrawa={bezPrawa}
                imieMatki={imieMatki}
                imieDrugiego={bezPrawa ? '' : imieDrugiego}
                stawki={st}
              />
              <div className="mt-6 flex flex-col gap-3">
                {!bezPrawa ? <Notatka>{t.notatkaStawki(st)}</Notatka> : null}
                {wyliczenie.wynik.ponadPoUrodzinach ? <Notatka>{t.notatkaPoUrodzinach(st)}</Notatka> : null}
                <Notatka>
                  {t.notatkaCzesci}{' '}
                  <Odnosnik href={trasy.ViewCalcMaternityResult()} wTekscie>{t.kalkulatorzeZasilku}</Odnosnik>
                  {t.kropka}
                </Notatka>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                {zapisano ? (
                  <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="drugorzedny">{t.wrocDoPlanu}</PrzyciskLink>
                ) : (
                  <>
                    <Przycisk wariant="glowny" onClick={zapisz}>{t.zapisz}</Przycisk>
                    <p className="m-0 text-body">{t.zapiszOpis}</p>
                  </>
                )}
              </div>
            </>
          ) : wejscie !== null && wyliczenieApi.blad ? (
            <BladWyliczenia kod={wyliczenieApi.blad.kod} parametry={wyliczenieApi.blad.parametry as never} onPonow={wyliczenieApi.ponow} />
          ) : wejscie !== null ? (
            <SzkieletWyliczenia />
          ) : (
            <StanPusty ikona="kalkulator">{poleDrugiego ? t.pustyWynikPodstawa : t.pustyWynik}</StanPusty>
          )}
        </Karta>
      </div>
    </>
  );
}
