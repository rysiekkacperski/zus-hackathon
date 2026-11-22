'use client';

// ViewCalcMaternityVariant: porównanie wariantu 81,5% z wariantem 100% i 70% (historyjka 3.10.1.1.1, u26).
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PoleKwoty, PoleLiczby } from '@/komponenty/pole-tekstowe';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Tabela } from '@/komponenty/tabela';
import { Ikona } from '@/komponenty/ikona';
import { trasy } from '@/komponenty/rama/trasy';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { useKontekstRodziny } from '@/dane/magazyn/hooki';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { zapiszDecyzjeWariantu } from '@/dane/magazyn/operacje/kalkulacje-decyzje';
import { formatujDate } from '@/domena/daty';
import { formatujKwote, formatujKwoteBezWaluty, parsujKwote } from '@/domena/kwoty';
import { useStanRoboczy } from '@/app/(strefa)/kalkulator-zasilku/_czesci/stan-roboczy';
import {
  daneDzieckaDoKalkulatora,
  matkaMaPrawoDoZasilku,
  porownajWarianty,
  sprawaWariantu,
  tygodnieRodzicielskiegoJednegoRodzica,
  tygodnieUrlopuMacierzynskiego,
  walidujDanePorownania,
} from '@/domena/kalkulatory/wariant';
import type { KodKomunikatu, PodstawaWymiaru, WynikiKalkulacji } from '@/domena/typy';
import { teksty } from '@/teksty';
import { ostatniePorownanie, podstawaZKontaZus, wybranyWariantSprawy, wynikiRodziny } from '../_czesci/dane-kalkulatorow';
import { KafleWariantow } from './_czesci/kafle-wariantow';
import { ZestawienieWariantow } from './_czesci/zestawienie-wariantow';

const t = teksty.ViewCalcMaternityVariant;
type Wariant = '81-5' | '100-70';

/**
 * Podstawa matki wpisana wcześniej przez rodzica albo przyjęta z przykładowej sprawy: najpierw z bieżącego stanu
 * kalkulatora zasiłku, potem z najnowszego zapisu w wynikach kalkulacji (scenariusz, porównanie, podział urlopu).
 */
function podstawaWpisanaWczesniej(robocza: PodstawaWymiaru | undefined, wyniki: WynikiKalkulacji | undefined): PodstawaWymiaru | null {
  if (robocza && robocza.zrodlo !== 'konto-zus') return robocza;
  const w = wynikiRodziny(wyniki);
  const kandydaci = [
    ...w.scenariusze.map((s) => ({ zapisano: s.zapisano, p: s.podstawy.matka })),
    ...w.porownaniaWariantow.map((z) => ({ zapisano: z.zapisano, p: z.podstawa })),
    ...w.podzialyUrlopu.map((z) => ({ zapisano: z.zapisano, p: z.podstawy.matka })),
  ].filter((k): k is { zapisano: string; p: PodstawaWymiaru } => k.p !== undefined && k.p.zrodlo !== 'konto-zus');
  let najnowszy: { zapisano: string; p: PodstawaWymiaru } | null = null;
  for (const k of kandydaci) if (najnowszy === null || k.zapisano >= najnowszy.zapisano) najnowszy = k;
  return najnowszy?.p ?? null;
}

function OdnosnikKalkulatora() {
  return (
    <Odnosnik href={trasy.ViewCalcMaternityResult()} wTekscie>
      {t.kalkulatorzeZasilku}
    </Odnosnik>
  );
}

export function WidokWariantuZasilku() {
  const kontekst = useKontekstRodziny();
  const zapytanie = useSearchParams();

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
  const daneRodziny = kontekst.rodzina.daneRodziny;
  const parametr = zapytanie.get('sprawa');
  const sprawa: 'K07' | 'K08' = parametr === 'K07' || parametr === 'K08' ? parametr : sprawaWariantu(daneRodziny);
  const dziecko = daneDzieckaDoKalkulatora(kontekst.rodzina.daneCiazy);
  const powrot = { href: trasy.ViewCaseGuide({ idSprawy: sprawa }), etykieta: sprawa === 'K07' ? t.powrotK07 : t.powrotK08 };

  if (!matkaMaPrawoDoZasilku(daneRodziny) || dziecko.dataPorodu === null) {
    return (
      <>
        <NaglowekStrony tytul={t.naglowek} powrot={powrot} stanNa={kontekst.dzis} />
        <StanPusty ikona="kalkulator" akcja={<PrzyciskLink href={powrot.href} wariant="drugorzedny">{t.wrocDoInstrukcji}</PrzyciskLink>}>
          {dziecko.dataPorodu === null ? t.brakDatyPorodu : t.brakPrawa}
        </StanPusty>
      </>
    );
  }
  return <Kalkulator key={sprawa} sprawa={sprawa} kontekst={kontekst} dataPorodu={dziecko.dataPorodu} dziecko={dziecko} powrot={powrot} />;
}

interface KalkulatorProps {
  sprawa: 'K07' | 'K08';
  kontekst: NonNullable<ReturnType<typeof useKontekstRodziny>>;
  dataPorodu: string;
  dziecko: ReturnType<typeof daneDzieckaDoKalkulatora>;
  powrot: { href: string; etykieta: string };
}

function Kalkulator({ sprawa, kontekst, dataPorodu, dziecko, powrot }: KalkulatorProps) {
  const { katalog, dzis, rodzina } = kontekst;
  const matka = rodzina.daneRodziny.matka;
  const forma = matka.formaZatrudnienia?.wartosc ?? null;
  const stanPodstawy = useMemo(
    () => podstawaZKontaZus(kontekst.daneZusMatki ?? kontekst.daneZusKonta, forma, dataPorodu, katalog),
    [kontekst.daneZusMatki, kontekst.daneZusKonta, forma, dataPorodu, katalog],
  );
  const podstawaZus = stanPodstawy.rodzaj === 'wyliczona' ? stanPodstawy.podstawa : null;
  const tygM = tygodnieUrlopuMacierzynskiego(dziecko.liczbaDzieci, katalog, dataPorodu);
  const maks = tygodnieRodzicielskiegoJednegoRodzica(dziecko.liczbaDzieci, dziecko.zaZyciem, katalog, dataPorodu);
  const zapisany = ostatniePorownanie(rodzina.wynikiKalkulacji, sprawa);
  const wybranyWPlanie = wybranyWariantSprawy(rodzina.plan, sprawa);
  const wybrany: Wariant | null = wybranyWPlanie && 'wariant' in wybranyWPlanie ? wybranyWPlanie.wariant : (zapisany?.decyzja ?? null);

  const stanRoboczy = useStanRoboczy(kontekst.konto.pesel);
  const podstawaWczesniej = podstawaZus === null ? podstawaWpisanaWczesniej(stanRoboczy?.podstawy.matka, rodzina.wynikiKalkulacji) : null;
  const [podstawaTekst, setPodstawaTekst] = useState(podstawaWczesniej ? formatujKwoteBezWaluty(podstawaWczesniej.kwota) : '');
  const [tygodnieTekst, setTygodnieTekst] = useState(String(maks));
  // Podstawę wpisuje rodzic tylko wtedy, gdy kalkulator nie wyliczył jej z konta ZUS.
  const ocen = (w: { podstawa: string; tygodnie: string }) =>
    walidujDanePorownania({ podstawa: podstawaZus === null ? w.podstawa : undefined, tygodnie: w.tygodnie }, maks, parsujKwote);
  const walidacja = useWalidacjaNaBiezaco({
    wartosci: { podstawa: podstawaTekst, tygodnie: tygodnieTekst },
    waliduj: (w) => ocen(w).bledy,
    pola: { podstawa: 'podstawa', tygodnie: 'tygodnie' },
  });
  const [wejscie, setWejscie] = useState<{ podstawa: PodstawaWymiaru; tygodnie: number } | null>(
    () => {
      const p = podstawaZus ?? podstawaWczesniej;
      return p === null ? null : { podstawa: p, tygodnie: maks };
    },
  );
  const [zapisano, setZapisano] = useState<Wariant | null>(null);
  const [bladZapisu, setBladZapisu] = useState<KodKomunikatu | null>(null);
  const [zapisywanie, setZapisywanie] = useState(false);

  const wynik = useMemo(
    () =>
      wejscie === null
        ? null
        : porownajWarianty({
            podstawa: wejscie.podstawa,
            dataPorodu,
            liczbaDzieci: dziecko.liczbaDzieci,
            zaZyciem: dziecko.zaZyciem,
            tygodniePrzedPowrotem: wejscie.tygodnie,
            dzis,
            katalog,
          }),
    [wejscie, dataPorodu, dziecko.liczbaDzieci, dziecko.zaZyciem, dzis, katalog],
  );
  const poTerminie = wynik !== null && !wynik.szczegoly.wariant81Dostepny;

  function oblicz() {
    if (!walidacja.sprobujWyslac()) return;
    const w = ocen({ podstawa: podstawaTekst, tygodnie: tygodnieTekst });
    const podstawa: PodstawaWymiaru = podstawaZus ?? { kwota: w.kwota as number, zrodlo: 'wartosc-wpisana-przez-rodzica' };
    setWejscie({ podstawa, tygodnie: w.tygodnie as number });
    setZapisano(null);
  }

  function wybierz(wariant: Wariant) {
    if (wejscie === null || wynik === null) return;
    setZapisywanie(true);
    const r = zapiszDecyzjeWariantu(
      {
        sprawa,
        podstawa: wejscie.podstawa,
        tygodniePrzedPowrotem: wejscie.tygodnie,
        dataPorodu,
        liczbaDzieci: dziecko.liczbaDzieci,
        zaZyciem: dziecko.zaZyciem,
        wynik: { wariant81: wynik.wariant81, wariant100i70: wynik.wariant100i70, roznica: wynik.roznica, dataPowrotu: wynik.dataPowrotu },
        decyzja: wariant,
        tygodnieMacierzynskiego: tygM,
      },
      pobierzKontekstOperacji(),
    );
    setZapisywanie(false);
    if (r.ok) {
      setBladZapisu(null);
      setZapisano(wariant);
      window.scrollTo({ top: 0 });
    } else setBladZapisu(r.kod);
  }

  const zrodloPodstawy = wejscie ? t.zrodla[wejscie.podstawa.zrodlo] : '';
  const opisFormy = forma && forma !== 'brak-tytulu' && podstawaZus === null
    ? `, ${t.formaWProfilu[forma]}${matka.formaZatrudnienia?.zrodlo === 'odpowiedz-rodzica' ? t.twojaOdpowiedz : ''}`
    : '';
  const opisDzieci = dziecko.zaZyciem ? t.zZaZyciem : dziecko.liczbaDzieci === 1 ? t.przyJednymDziecku : t.przyWiecejDzieciach;
  const s = wynik?.szczegoly;

  return (
    <>
      <NaglowekStrony
        tytul={t.naglowek}
        powrot={powrot}
        stanNa={dzis}
        akcje={<Odnosnik href={trasy.ViewCalcMaternityResult({ sprawa })}>{t.otworzKalkulator}</Odnosnik>}
      />
      <div className="flex max-w-tresc flex-col gap-7.5">
        {poTerminie ? <Komunikat kod="0038" /> : null}
        {bladZapisu ? <Komunikat kod={bladZapisu} /> : null}
        {zapisano && wynik && s ? (
          <>
            <Komunikat
              tresc={
                sprawa === 'K07'
                  ? zapisano === '81-5' ? t.zapisanoK07 : t.zapisanoK07Wariant100
                  : zapisano === '81-5' ? t.zapisanoK08 : t.zapisanoK08Wariant100
              }
            />
            <Karta tytul={t.wyborTytul({ wariant: t.nazwaWariantu[zapisano] })} bezLinii>
              <div className="flex flex-wrap items-start gap-7.5">
                <div className="flex min-w-0 grow basis-105 flex-col gap-4">
                  <p className="m-0 text-body">
                    {zapisano === '81-5'
                      ? t.wyborOpis81({
                          kwota: formatujKwote(s.wariant81.okresy[0].miesiecznie),
                          tygodnie: t.tygodnie(s.tygodnieMacierzynskiego + s.tygodnieRodzicielskiego),
                          od: formatujDate(s.okresCaly.od),
                          do: formatujDate(s.okresCaly.do),
                          suma: formatujKwote(s.wariant81.suma),
                        })
                      : t.wyborOpis100({
                          kwotaM: formatujKwote(s.wariant100i70.okresy[0].miesiecznie),
                          kwotaR: formatujKwote(s.wariant100i70.okresy[1].miesiecznie),
                          suma: formatujKwote(s.wariant100i70.suma),
                        })}
                  </p>
                  <p className="m-0 flex items-start gap-2 text-body">
                    <Ikona nazwa="kalendarz" rozmiar={20} className="mt-0.5 shrink-0 text-brand" />
                    <span>
                      <strong>{sprawa === 'K07' ? t.wyborTerminK07({ termin: formatujDate(s.termin) }) : t.wyborTerminK08({ termin: formatujDate(s.termin) })}</strong>
                      {sprawa === 'K07' ? t.wyborTerminK07Dopisek : t.wyborTerminK08Dopisek}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {sprawa === 'K07' ? (
                      <PrzyciskLink href={powrot.href} wariant="glowny">{t.zobaczInstrukcjePracodawcy}</PrzyciskLink>
                    ) : (
                      <PrzyciskLink href={trasy.ViewZamLeaveType({ sprawa })} wariant="glowny">{t.wypelnijWniosek}</PrzyciskLink>
                    )}
                    <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="drugorzedny">{t.wrocDoPlanu}</PrzyciskLink>
                  </div>
                </div>
                <div className="flex min-w-0 grow basis-84 flex-col gap-4 rounded-md bg-surface-page p-5">
                  <p className="m-0 text-body-strong">{t.zapisaneWWynikach({ data: formatujDate(dzis) })}</p>
                  <div>
                    <p className="m-0 text-body">{t.wariantZasilku}</p>
                    <p className="m-0 text-body-strong">{t.nazwaWariantu[zapisano]}</p>
                  </div>
                  <div>
                    <p className="m-0 text-body">{t.podstawaWymiaru}</p>
                    <p className="m-0 text-body-strong">{t.podstawaZeZrodlem({ kwota: formatujKwote(wejscie!.podstawa.kwota), zrodlo: zrodloPodstawy })}</p>
                  </div>
                  <div>
                    <p className="m-0 text-body">{t.urlopPrzedPowrotem}</p>
                    <p className="m-0 text-body-strong">{t.tygodnie(s.tygodnieRodzicielskiego)}</p>
                  </div>
                  <div>
                    <p className="m-0 text-body">{t.sprawaWPlanie}</p>
                    <p className="m-0 text-body-strong">{sprawa === 'K07' ? t.tytulSprawyK07 : t.tytulSprawyK08}</p>
                  </div>
                </div>
              </div>
            </Karta>
          </>
        ) : (
          <Karta tytul={t.daneTytul} bezLinii>
            {podstawaZus === null && podstawaWczesniej === null ? <Komunikat kod="0094" className="mb-6" /> : null}
            {podstawaWczesniej ? <Notatka className="mb-6">{t.podstawaWczesniej}</Notatka> : null}
            <p className="m-0 mb-6 text-body">
              {t.zProfilu({ dataPorodu: formatujDate(dataPorodu), przewidywany: dziecko.przewidywany, liczbaDzieci: dziecko.liczbaDzieci, zaZyciem: dziecko.zaZyciem })}
              {opisFormy}
              {'. '}
              {t.wymiaryUrlopow({ macierzynski: t.tygodnie(tygM), dniM: tygM * 7, rodzicielski: t.tygodnie(maks), dniR: maks * 7 })}
            </p>
            <div className="flex flex-wrap items-start gap-7.5">
              <div className="flex min-w-0 grow basis-105 flex-col gap-4">
                {podstawaZus ? (
                  <>
                    <div>
                      <p className="m-0 text-body-strong">{t.podstawaEtykieta}</p>
                      <p className="m-0 mt-1 text-amount text-ink-strong">{formatujKwote(podstawaZus.kwota)}</p>
                      <p className="m-0 text-body">{t.zrodlo({ zrodlo: t.zrodla[podstawaZus.zrodlo] })}</p>
                    </div>
                    {s && s.podstawy.length > 1 ? (
                      <div>
                        <p className="m-0 text-body-strong">{t.zmianaPodstawyTytul}</p>
                        <ul className="m-0 mt-1 list-disc pl-6 text-body">
                          {s.podstawy.map((c, i) => (
                            <li key={c.od}>
                              {i === 0
                                ? t.podstawaPrzedZmiana({ kwota: formatujKwote(c.kwota), data: formatujDate(c.do) })
                                : t.podstawaOdZmiany({ kwota: formatujKwote(c.kwota), data: formatujDate(c.od) })}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {podstawaZus.skladniki && podstawaZus.skladniki.length > 0 && !poTerminie ? (
                      <Tabela
                        podpis={t.jakPoliczylismy}
                        podpisWidoczny
                        etykietaPrzewijania={t.przewijanieTabeli}
                        kolumny={[
                          { klucz: 'skladnik', naglowek: t.kolumnaSkladnik, tytulowa: true },
                          { klucz: 'kwota', naglowek: t.kolumnaKwota, liczbowa: true },
                        ]}
                        wiersze={podstawaZus.skladniki.map((sk, i) => ({ id: `s${i}`, skladnik: sk.opis, kwota: formatujKwote(sk.kwota) }))}
                        suma={{ skladnik: t.podstawaWiersz, kwota: <strong>{formatujKwote(podstawaZus.kwota)}</strong> }}
                      />
                    ) : null}
                    {!poTerminie ? (
                      <Notatka>
                        {t.poChorobowym} <OdnosnikKalkulatora />
                        {t.kropka}
                      </Notatka>
                    ) : null}
                  </>
                ) : (
                  <>
                    <PoleKwoty
                      id="podstawa"
                      etykieta={t.podstawaEtykieta}
                      podpowiedz={t.podstawaPodpowiedz}
                      wartosc={podstawaTekst}
                      onZmiana={setPodstawaTekst}
                      {...walidacja.pole('podstawa')}
                      szerokosc="srednia"
                    />
                    {wejscie ? (
                      <div>
                        <p className="m-0 text-body-strong">{t.podstawaDoWyliczenia}</p>
                        <p className="m-0 mt-1 text-amount text-ink-strong">{formatujKwote(wejscie.podstawa.kwota)}</p>
                        <p className="m-0 text-body">{t.zrodlo({ zrodlo: zrodloPodstawy })}</p>
                      </div>
                    ) : (
                      <Notatka>{t.podstawaNotatka}</Notatka>
                    )}
                  </>
                )}
              </div>
              <div className="flex min-w-0 grow basis-90 flex-col gap-6 md:max-w-120">
                <PoleLiczby
                  id="tygodnie"
                  etykieta={t.tygodnieEtykieta}
                  podpowiedz={t.tygodniePodpowiedz({ maks, opis: opisDzieci, pelny: t.tygodnie(maks) })}
                  wartosc={tygodnieTekst}
                  onZmiana={setTygodnieTekst}
                  {...walidacja.pole('tygodnie')}
                  szerokosc="waska"
                />
              </div>
            </div>
            <div className="mt-6">
              <Przycisk wariant="glowny" onClick={oblicz}>{t.oblicz}</Przycisk>
            </div>
          </Karta>
        )}

        {wynik && s ? (
          <>
            <Karta tytul={poTerminie ? t.poTerminieTytul : t.porownanieTytul} bezLinii>
              <p className="m-0 mb-4 text-body">
                {poTerminie ? t.poTerminieOpis({ termin: formatujDate(s.termin) }) : null}
                {s.tygodnieRodzicielskiego === 0
                  ? t.wynikZero({ powrot: formatujDate(wynik.dataPowrotu) })
                  : s.tygodnieRodzicielskiego === s.tygodnieRodzicielskiegoMaks
                    ? t.wynikPelny({ tygodnie: t.tygodniDopelniacz(s.tygodnieRodzicielskiego), koniec: formatujDate(s.okresCaly.do) })
                    : t.wynikCzesciowy({ tygodnie: t.tygodniDopelniacz(s.tygodnieRodzicielskiego), koniec: formatujDate(s.okresCaly.do), powrot: formatujDate(wynik.dataPowrotu) })}
                {wejscie && wejscie.podstawa.zrodlo !== 'konto-zus' ? t.zPodstawa({ kwota: formatujKwote(wejscie.podstawa.kwota), zrodlo: zrodloPodstawy }) : null}
              </p>
              {wynik.komunikaty.some((k) => k.kod === '0246') ? (
                <Komunikat
                  kod="0246"
                  parametry={{ data: formatujDate(wynik.dataPowrotu), kwota: formatujKwote(wynik.roznica) }}
                  className="mb-4"
                />
              ) : null}
              {s.tygodnieRodzicielskiego === 0 && !poTerminie ? (
                <Komunikat tresc={t.informacjaWyrownanie({ kwota: formatujKwote(s.wariant81.wyrownanie) })} className="mb-4" />
              ) : null}
              {!poTerminie && zapisano === null ? (
                <p className="m-0 mb-6 flex items-start gap-2 text-body">
                  <Ikona nazwa="kalendarz" rozmiar={20} className="mt-0.5 shrink-0 text-brand" />
                  <span>
                    <strong>{t.terminWyboru({ termin: formatujDate(s.termin) })}</strong>
                    {t.terminWyboruDopisek({ dni: t.dni(s.dniDoTerminu) })}
                  </span>
                </p>
              ) : null}
              <KafleWariantow s={s} wybrany={zapisano ?? wybrany} zapisywanie={zapisywanie} onWybor={wybierz} />
              {!poTerminie && zapisano === null && s.tygodnieRodzicielskiego === s.tygodnieRodzicielskiegoMaks && wynik.roznica > 0 ? (
                <Notatka className="mt-6">
                  {wejscie?.podstawa.zrodlo === 'konto-zus'
                    ? t.roznicaPelny({ kwota: formatujKwote(wynik.roznica) })
                    : t.roznicaPelnyRodzic({ kwota: formatujKwote(wynik.roznica) })}
                </Notatka>
              ) : null}
            </Karta>
            {zapisano === null ? (
              <Karta tytul={t.okresyTytul} bezLinii>
                <ZestawienieWariantow s={s} dataPowrotu={wynik.dataPowrotu} />
                <div className="mt-6 flex flex-col gap-3">
                  {s.zHarmonogramu ? (
                    <>
                      <Notatka>{t.notatkaPodwyzszenie({ kwota: formatujKwote(s.swiadczenieRodzicielskie) })}</Notatka>
                      <Notatka>
                        {t.notatkaHarmonogram} <OdnosnikKalkulatora />
                        {t.kropka}
                      </Notatka>
                    </>
                  ) : (
                    <>
                      {s.tygodnieRodzicielskiego === s.tygodnieRodzicielskiegoMaks ? (
                        <Notatka>{t.notatkaSuma({ kwota: formatujKwote(s.swiadczenieRodzicielskie) })}</Notatka>
                      ) : null}
                      <Notatka>
                        {s.tygodnieRodzicielskiego === s.tygodnieRodzicielskiegoMaks ? t.notatkaKalkulator : t.notatkaKalkulatorPowrot}{' '}
                        <OdnosnikKalkulatora />
                        {t.kropka}
                      </Notatka>
                    </>
                  )}
                </div>
                {poTerminie ? (
                  <div className="mt-6">
                    <PrzyciskLink href={powrot.href} wariant="drugorzedny">{t.wrocDoInstrukcji}</PrzyciskLink>
                  </div>
                ) : null}
              </Karta>
            ) : null}
          </>
        ) : (
          <Karta tytul={t.porownanieTytul} bezLinii>
            <StanPusty ikona="kalkulator">{t.pustePorownanie}</StanPusty>
          </Karta>
        )}
      </div>
    </>
  );
}
