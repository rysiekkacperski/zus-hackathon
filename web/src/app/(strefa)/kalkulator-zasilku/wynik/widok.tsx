'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { dodajDni, formatujDate, porownajDaty } from '@/domena/daty';
import { domyslneParametry, wyliczScenariusz } from '@/domena/kalkulatory';
import { walidujDateWZakresie, walidujLiczbeCalkowita } from '@/domena/walidacje';
import type {
  DaneWejscioweKalkulatora,
  KodKomunikatu,
  ParametryScenariusza,
  PodstawaWymiaru,
  RodzicWRodzinie,
} from '@/domena/typy';
import { formatujKwote } from '@/komponenty/format';
import { GrupaOpcji } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { Kwota } from '@/komponenty/kwota';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PoleDaty, PoleLiczby } from '@/komponenty/pole-tekstowe';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { trescKomunikatu } from '@/komponenty/typy-komunikatow';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';
import {
  czyPoprawny,
  czyWariant81Dostepny,
  dataZdarzenia,
  formaZTytulu,
  opcjaFormy,
  terminWariantu81,
  uzupelnijFormularz,
  walidujFormularz,
  zbudujDaneWejsciowe,
} from '../_czesci/formularz';
import { useKontekstKalkulatora, type KontekstKalkulatora } from '../_czesci/kontekst-kalkulatora';
import { RODZICE, formaRodzica, podstawyDoWyliczenia, podstawyRodzicow } from '../_czesci/podstawy';
import { ustawStanRoboczy, useStanRoboczy, type StanRoboczyKalkulatora } from '../_czesci/stan-roboczy';
import { slotyWyniku } from './_sloty';
import { ArkuszPodstawyWymiaru, type ZapisPodstawy } from './_czesci/arkusz-podstawy-wymiaru';
import { KartaDanych, KartaHarmonogramu, TabelaOkresow } from './_czesci/karty-wyniku';
import { OknoZastosowanychRegul } from './_czesci/okno-zastosowanych-regul';

const t = teksty.ViewCalcMaternityResult;
const ti = teksty.ViewCalcMaternityInput;
const ts = teksty.SheetCalcBaseSource;
// Komunikaty, które widok pokazuje w kartach, a nie pod nagłówkiem.
const KOMUNIKATY_W_KARTACH: readonly KodKomunikatu[] = ['0038', '0165', '0064', '0101', '0166'];

export function WidokWynikuKalkulatora() {
  const kontekst = useKontekstKalkulatora();
  if (kontekst === null) return <SzkieletWidoku />;
  return <Wynik key={kontekst.konto.pesel} kontekst={kontekst} />;
}

function Wynik({ kontekst }: { kontekst: KontekstKalkulatora }) {
  const router = useRouter();
  const parametryAdresu = useSearchParams();
  const idSprawy = parametryAdresu.get('sprawa');
  const zrodloAdresu = parametryAdresu.get('zrodlo');
  const stan = useStanRoboczy(kontekst.konto.pesel);
  const { katalog, dzis } = kontekst;

  // Bez stanu roboczego wynik liczy się z profilu rodziny i konta ZUS, gdy dane są kompletne.
  const daneZProfilu = useMemo(() => {
    if (stan) return null;
    const f = uzupelnijFormularz({ konto: kontekst.konto, rodzina: kontekst.rodzina, kopiaKonta: kontekst.kopiaKonta, dzis });
    return czyPoprawny(walidujFormularz(f, dzis, katalog)) ? zbudujDaneWejsciowe(f) : null;
  }, [stan, kontekst, dzis, katalog]);
  const dane: DaneWejscioweKalkulatora | null = stan?.dane ?? daneZProfilu;

  const adresDanych = trasy.ViewCalcMaternityInput({
    ...(idSprawy ? { sprawa: idSprawy } : {}),
    ...(zrodloAdresu === 'przykladowa-sprawa' ? { zrodlo: 'przykladowa-sprawa' as const } : {}),
  });

  useEffect(() => {
    if (dane === null) router.replace(adresDanych);
  }, [dane, router, adresDanych]);

  if (dane === null) return <SzkieletWidoku />;
  return (
    <TrescWyniku
      kontekst={kontekst}
      dane={dane}
      stan={stan}
      idSprawy={idSprawy}
      zrodloAdresu={zrodloAdresu}
      adresDanych={adresDanych}
    />
  );
}

function TrescWyniku({
  kontekst,
  dane,
  stan,
  idSprawy,
  zrodloAdresu,
  adresDanych,
}: {
  kontekst: KontekstKalkulatora;
  dane: DaneWejscioweKalkulatora;
  stan: StanRoboczyKalkulatora | null;
  idSprawy: string | null;
  zrodloAdresu: string | null;
  adresDanych: string;
}) {
  const { katalog, dzis } = kontekst;
  const [arkuszRodzica, ustawArkuszRodzica] = useState<RodzicWRodzinie | null>(null);
  const [oknoRegul, ustawOknoRegul] = useState(false);

  const zdarzenie = dane.zdarzenie.wartosc;
  const dzienZdarzenia = dataZdarzenia(dane);
  const poStracie = Boolean(dane.strata && dane.strata.wartosc.liczbaDzieci >= dane.liczbaDzieci.wartosc);
  const wariant81 = czyWariant81Dostepny(dane, dzis) && !dane.strata;

  const parametryBazowe = useMemo(() => stan?.parametry ?? domyslneParametry(dane, katalog), [stan, dane, katalog]);
  const parametry: ParametryScenariusza = useMemo(
    () => (wariant81 ? parametryBazowe : { ...parametryBazowe, wariant: '100-70' }),
    [wariant81, parametryBazowe],
  );

  const podstawy = useMemo(
    () =>
      podstawyRodzicow({
        dane,
        daneZus: kontekst.daneZus,
        nadpisania: stan?.podstawy ?? {},
        pelnyEtat: stan?.pelnyEtat ?? {},
        parametry,
        katalog,
        dzien: dzienZdarzenia ?? dzis,
      }),
    [dane, kontekst.daneZus, stan, parametry, katalog, dzienZdarzenia, dzis],
  );
  const podstawyWyliczenia = useMemo(() => podstawyDoWyliczenia(podstawy), [podstawy]);
  const wynik = useMemo(
    () => wyliczScenariusz(dane, podstawyWyliczenia, parametry, katalog, dzis),
    [dane, podstawyWyliczenia, parametry, katalog, dzis],
  );
  const wynikDrugiegoWariantu = useMemo(
    () =>
      wariant81
        ? wyliczScenariusz(
            dane,
            podstawyWyliczenia,
            { ...parametry, wariant: parametry.wariant === '81-5' ? '100-70' : '81-5' },
            katalog,
            dzis,
          )
        : null,
    [wariant81, dane, podstawyWyliczenia, parametry, katalog, dzis],
  );

  // Każda zmiana na wyniku zapisuje stan roboczy; bez niego tworzy go z bieżących danych.
  function zmienStan(zmiana: (s: StanRoboczyKalkulatora) => StanRoboczyKalkulatora) {
    const baza: StanRoboczyKalkulatora = stan ?? {
      konto: kontekst.konto.pesel,
      dane,
      podstawy: {},
      pelnyEtat: {},
      parametry: null,
    };
    ustawStanRoboczy(zmiana(baza));
  }
  function ustawParametry(p: ParametryScenariusza) {
    zmienStan((s) => ({ ...s, parametry: p }));
  }
  function zapiszPodstawe(z: ZapisPodstawy) {
    zmienStan((s) => {
      const nadpisania: Partial<Record<RodzicWRodzinie, PodstawaWymiaru>> = { ...s.podstawy };
      if (z.zrodlo === 'konto-zus') delete nadpisania[z.rodzic];
      if (z.zrodlo === 'wpisana' && z.kwota !== undefined)
        nadpisania[z.rodzic] = { kwota: z.kwota, zrodlo: 'wartosc-wpisana-przez-rodzica', pelnyEtat: z.pelnyEtat };
      return { ...s, podstawy: nadpisania, pelnyEtat: { ...s.pelnyEtat, [z.rodzic]: z.pelnyEtat } };
    });
  }

  const etykiety: Record<RodzicWRodzinie, string> = {
    matka: kontekst.imiona.matka
      ? ti.zImieniem({ rola: zdarzenie === 'przyjecie' ? ti.rodzicPrzyjmujacy : ti.matka, imie: kontekst.imiona.matka })
      : zdarzenie === 'przyjecie'
        ? ti.rodzicPrzyjmujacy
        : ti.matka,
    'drugi-rodzic': kontekst.imiona['drugi-rodzic']
      ? ti.zImieniem({ rola: ti.drugiRodzic, imie: kontekst.imiona['drugi-rodzic'] })
      : ti.drugiRodzic,
  };

  const komunikaty = useMemo(() => {
    const widziane = new Set<string>();
    return wynik.komunikaty.filter((k) => {
      if (KOMUNIKATY_W_KARTACH.includes(k.kod) || widziane.has(k.kod)) return false;
      widziane.add(k.kod);
      return true;
    });
  }, [wynik.komunikaty]);

  const propsSlotu = {
    idSprawy,
    zrodlo: zrodloAdresu,
    daneWejsciowe: dane,
    podstawy: podstawyWyliczenia,
    parametry,
    wynik,
    onZmianaParametrow: ustawParametry,
  };

  const podstawaArkusza = arkuszRodzica ? podstawy[arkuszRodzica] : undefined;
  const tytulArkusza =
    podstawaArkusza && podstawaArkusza.zKonta.rodzaj === 'wyliczona'
      ? (() => {
          const tytul = podstawaArkusza.zKonta.tytul;
          const forma = formaZTytulu(tytul);
          return ts.opisTytulu({ forma: ti.formy[opcjaFormy(forma.forma, forma.dobrowolne)], od: formatujDate(tytul.od) });
        })()
      : undefined;

  return (
    <>
      <NaglowekStrony
        tytul={t.naglowek}
        stanNa={dzis}
        powrot={{ href: adresDanych, etykieta: t.powrot }}
        akcje={
          <Przycisk type="button" wariant="tlo" ikona="info" onClick={() => ustawOknoRegul(true)}>
            {t.zastosowaneReguly}
          </Przycisk>
        }
      />
      <Stos odstep={7.5} className="max-w-tresc">
        {kontekst.nowyUzytkownik ? <Komunikat kod="0101" tresc={trescKomunikatu('0101')} /> : null}
        {dane.strata ? <Komunikat kod="0166" tresc={trescKomunikatu('0166')} /> : null}
        {komunikaty.map((k) => (
          <Komunikat key={k.kod} kod={k.kod} tresc={trescKomunikatu(k.kod, k.parametry as never)} />
        ))}

        {poStracie ? (
          <KartaPoStracie
            wynik={wynik}
            podstawa={podstawyWyliczenia.matka ?? podstawyWyliczenia['drugi-rodzic'] ?? null}
            onSprawdzPodstawe={() => ustawArkuszRodzica(podstawyWyliczenia.matka ? 'matka' : 'drugi-rodzic')}
          />
        ) : null}
        {poStracie ? (
          <Karta tytul={t.kartaWsparcia} bezLinii>
            <p className="m-0 mb-6 text-body">{t.wsparcieOpis}</p>
            <PrzyciskLink
              wariant="glowny"
              ikona="serce"
              href={trasy.ViewSupportOrganizations({
                ...(dane.strata ? { sytuacja: dane.strata.wartosc.rodzaj } : {}),
                powrot: trasy.ViewCalcMaternityResult(),
              })}
            >
              {t.zobaczOrganizacje}
            </PrzyciskLink>
          </Karta>
        ) : null}

        <KartaDanych
          dane={dane}
          etykiety={etykiety}
          akcja={
            <Odnosnik href={adresDanych} ikonaPo="edytuj">
              {t.zmienDane}
            </Odnosnik>
          }
        />

        {poStracie ? null : (
          <Karta tytul={t.kartaPodstawy} bezLinii>
            <div className="flex flex-wrap gap-7.5">
              {RODZICE.filter((r) => r === 'matka' || dane.formaDrugiegoRodzica.wartosc.forma !== 'brak-drugiego-rodzica').map(
                (r) => {
                  const p = podstawy[r];
                  const opis =
                    p.efektywna?.zrodlo === 'konto-zus'
                      ? t.opisPodstawyZus
                      : p.efektywna?.zrodlo === 'przykladowa-sprawa'
                        ? t.opisPodstawySprawy
                        : p.efektywna
                          ? t.opisPodstawyWpisanej
                          : t.brakPodstawy;
                  return (
                    <div key={r} className="flex min-w-0 grow basis-70 flex-col items-start gap-2">
                      <h3 className="m-0 text-body-strong">{etykiety[r]}</h3>
                      {p.prawo ? (
                        <>
                          {p.efektywna ? (
                            <>
                              <p className="m-0 text-amount text-success-text">{formatujKwote(p.efektywna.kwota)}</p>
                              <p className="m-0 text-small">
                                {ti.zrodlo({ zrodlo: t.zrodlaPodstawy[p.efektywna.zrodlo] })}
                              </p>
                            </>
                          ) : null}
                          <p className="m-0 text-body">{opis}</p>
                          <Przycisk
                            type="button"
                            wariant="drugorzedny"
                            aria-label={t.sprawdzPodstaweRodzica({ rodzic: etykiety[r] })}
                            onClick={() => ustawArkuszRodzica(r)}
                          >
                            {t.sprawdzPodstawe}
                          </Przycisk>
                        </>
                      ) : (
                        <Komunikat kod="0064" tresc={trescKomunikatu('0064')} />
                      )}
                    </div>
                  );
                },
              )}
            </div>
          </Karta>
        )}

        {poStracie ? null : (
          <KartaWariantu
            dane={dane}
            dzis={dzis}
            dostepny={wariant81}
            parametry={parametry}
            sumaBiezaca={wynik.sumy.razem}
            sumaDrugiego={wynikDrugiegoWariantu?.sumy.razem ?? null}
            onZmiana={(wariant) => ustawParametry({ ...parametry, wariant })}
          />
        )}

        {poStracie ? null : (
          <KartaOkresow
            key={`${parametry.tygodniePrzedPorodem}-${parametry.poczatekNaWarunkach ?? ''}`}
            dane={dane}
            wynik={wynik}
            parametry={parametry}
            etykiety={etykiety}
            prawo={{ matka: podstawy.matka.prawo, 'drugi-rodzic': podstawy['drugi-rodzic'].prawo }}
            onZmiana={ustawParametry}
          />
        )}

        <KartaHarmonogramu wynik={wynik} etykiety={etykiety} />

        {slotyWyniku.map(({ id, Komponent }) => (
          <Komponent key={id} {...propsSlotu} />
        ))}
      </Stos>

      <ArkuszPodstawyWymiaru
        otwarte={arkuszRodzica !== null}
        onZamknij={() => ustawArkuszRodzica(null)}
        podstawa={podstawaArkusza}
        etykietaRodzica={
          arkuszRodzica
            ? [
                (arkuszRodzica === 'matka'
                  ? zdarzenie === 'przyjecie'
                    ? ti.rodzicPrzyjmujacy
                    : ti.matka
                  : ti.drugiRodzic
                ).toLowerCase(),
                kontekst.imiona[arkuszRodzica],
              ]
                .filter(Boolean)
                .join(', ')
            : undefined
        }
        pracownik={arkuszRodzica ? formaRodzica(dane, arkuszRodzica) === 'umowa-o-prace' : false}
        opisTytulu={tytulArkusza}
        dzis={dzis}
        onZapisz={zapiszPodstawe}
      />
      <OknoZastosowanychRegul
        otwarte={oknoRegul}
        onZamknij={() => ustawOknoRegul(false)}
        reguly={wynik.zastosowaneReguly}
        katalog={katalog}
        zdarzenie={zdarzenie}
        dataZdarzenia={dzienZdarzenia}
      />
    </>
  );
}

function KartaPoStracie({
  wynik,
  podstawa,
  onSprawdzPodstawe,
}: {
  wynik: ReturnType<typeof wyliczScenariusz>;
  podstawa: PodstawaWymiaru | null;
  onSprawdzPodstawe: () => void;
}) {
  const okres = wynik.okresy.find((o) => o.rodzaj === 'macierzynski');
  return (
    <Karta tytul={t.kartaZasilkuPoStracie} bezLinii>
      <Stos odstep={6}>
        {okres ? (
          <p className="m-0 text-body">
            {t.okresPoStracie({
              tygodnie: okres.dni % 7 === 0 ? t.tygodnie({ liczba: okres.dni / 7 }) : `${okres.dni} dni`,
              od: formatujDate(okres.od),
              do: formatujDate(okres.do),
            })}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-7.5">
          {okres ? (
            <div className="flex min-w-0 grow basis-60 flex-col gap-1">
              <Kwota etykieta={t.zasilekZaDni({ dni: String(okres.dni) })} kwota={okres.zaOkres} />
              <p className="m-0 text-small">{t.miesiecznieZaliczka({ kwota: formatujKwote(okres.miesiecznie) })}</p>
            </div>
          ) : null}
          <div className="flex min-w-0 grow basis-60 flex-col items-start gap-1">
            {podstawa ? (
              <>
                <Kwota etykieta={t.kartaPodstawy} kwota={podstawa.kwota} />
                <p className="m-0 text-small">{ti.zrodlo({ zrodlo: t.zrodlaPodstawy[podstawa.zrodlo] })}</p>
              </>
            ) : (
              <p className="m-0 text-body">{t.brakPodstawy}</p>
            )}
            <Przycisk type="button" wariant="drugorzedny" onClick={onSprawdzPodstawe} className="mt-2">
              {t.sprawdzPodstawe}
            </Przycisk>
          </div>
        </div>
        <Notatka>{t.bezRodzicielskiegoPoStracie}</Notatka>
      </Stos>
    </Karta>
  );
}

function KartaWariantu({
  dane,
  dzis,
  dostepny,
  parametry,
  sumaBiezaca,
  sumaDrugiego,
  onZmiana,
}: {
  dane: DaneWejscioweKalkulatora;
  dzis: string;
  dostepny: boolean;
  parametry: ParametryScenariusza;
  sumaBiezaca: number;
  sumaDrugiego: number | null;
  onZmiana: (w: '81-5' | '100-70') => void;
}) {
  const termin = terminWariantu81(dane);
  const zdarzenie = dane.zdarzenie.wartosc;
  const suma = (w: '81-5' | '100-70') =>
    w === parametry.wariant ? sumaBiezaca : sumaDrugiego;
  const opcja = (w: '81-5' | '100-70') => {
    const s = suma(w);
    return {
      wartosc: w,
      etykieta: t.warianty[w].tytul,
      opis: (
        <span className="flex flex-col">
          <span>{t.warianty[w].opis}</span>
          {s !== null && s > 0 ? <span>{t.razemWariant({ kwota: formatujKwote(s) })}</span> : null}
        </span>
      ),
    };
  };
  const opcje = dostepny ? [opcja('100-70'), opcja('81-5')] : [opcja('100-70')];
  const kodTerminu: KodKomunikatu = zdarzenie === 'przyjecie' ? '0165' : '0038';
  const opisTerminu =
    termin === null
      ? null
      : zdarzenie === 'przewidywany-porod'
        ? t.terminWariantuPrzewidywany({ data: formatujDate(termin) })
        : zdarzenie === 'przyjecie'
          ? t.terminWariantuPrzyjecie({ data: formatujDate(termin) })
          : t.terminWariantuPorod({ data: formatujDate(termin) });
  const poTerminie = termin !== null && porownajDaty(dzis, termin) > 0 && zdarzenie !== 'przewidywany-porod';
  return (
    <Karta tytul={t.kartaWariantu} bezLinii>
      <Stos odstep={4}>
        <GrupaOpcji<'81-5' | '100-70'>
          nazwa="wariant"
          legenda={t.wariantLegenda}
          opcje={opcje}
          wartosc={parametry.wariant}
          onZmiana={onZmiana}
        />
        {dostepny && opisTerminu ? <Notatka ikona="zegar">{opisTerminu}</Notatka> : null}
        {!dostepny && poTerminie ? <Komunikat kod={kodTerminu} tresc={trescKomunikatu(kodTerminu)} /> : null}
      </Stos>
    </Karta>
  );
}

function KartaOkresow({
  dane,
  wynik,
  parametry,
  etykiety,
  prawo,
  onZmiana,
}: {
  dane: DaneWejscioweKalkulatora;
  wynik: ReturnType<typeof wyliczScenariusz>;
  parametry: ParametryScenariusza;
  etykiety: Record<RodzicWRodzinie, string>;
  prawo: Record<RodzicWRodzinie, boolean>;
  onZmiana: (p: ParametryScenariusza) => void;
}) {
  const zdarzenie = dane.zdarzenie.wartosc;
  const przyjecie = dane.przyjecie?.wartosc;
  const [tygodnie, ustawTygodnie] = useState(String(parametry.tygodniePrzedPorodem));
  const [poczatek, ustawPoczatek] = useState(parametry.poczatekNaWarunkach ? formatujDate(parametry.poczatekNaWarunkach) : '');
  const [bladTygodni, ustawBladTygodni] = useState<KodKomunikatu | null>(null);
  const [bladPoczatku, ustawBladPoczatku] = useState<KodKomunikatu | null>(null);

  function przelicz() {
    if (zdarzenie === 'przyjecie' && przyjecie) {
      if (poczatek.trim() === '') {
        ustawBladPoczatku(null);
        onZmiana({ ...parametry, poczatekNaWarunkach: undefined });
        return;
      }
      const r = walidujDateWZakresie(
        poczatek,
        { od: przyjecie.dataPrzyjecia, do: dodajDni(przyjecie.dataPrzyjecia, 21) },
        { format: '0010', zaWczesnie: '0042', zaPozno: '0042' },
      );
      if ('kod' in r) {
        ustawBladPoczatku(r.kod);
        document.getElementById('wynik-poczatek')?.focus();
        return;
      }
      ustawBladPoczatku(null);
      onZmiana({ ...parametry, poczatekNaWarunkach: r.data });
      return;
    }
    const r = walidujLiczbeCalkowita(tygodnie, 0, 6, '0061');
    if ('kod' in r) {
      ustawBladTygodni(r.kod);
      document.getElementById('wynik-przed-porodem')?.focus();
      return;
    }
    ustawBladTygodni(null);
    onZmiana({ ...parametry, tygodniePrzedPorodem: r.liczba });
  }

  const rodzicePrawo = (['matka', 'drugi-rodzic'] as const).filter((r) => prawo[r]);
  const uzupelniajacy = zdarzenie === 'porod' && dane.wczesniactwo;
  const okresyRodzicielskie = (r: RodzicWRodzinie) =>
    wynik.okresy
      .filter((o) => o.rodzic === r && (o.rodzaj === 'rodzicielski' || o.rodzaj === 'laczenie-z-praca'))
      .reduce((s, o) => s + Math.floor(o.dni / 7), 0);
  const tygMatki = okresyRodzicielskie('matka');
  const tygDrugiego = okresyRodzicielskie('drugi-rodzic');
  const wymiar = tygMatki + tygDrugiego + wynik.tygodniePrzepadajace + wynik.tygodnieNiewykorzystane;
  const okresUzupelniajacy = wynik.okresy.find((o) => o.rodzaj === 'uzupelniajacy');
  const poczatekRodzicielskiegoMatki = wynik.okresy.find((o) => o.rodzic === 'matka' && o.rodzaj === 'rodzicielski');
  const pokazaneRodzice = (['matka', 'drugi-rodzic'] as const).filter(
    (r) => r === 'matka' || dane.formaDrugiegoRodzica.wartosc.forma !== 'brak-drugiego-rodzica',
  );

  return (
    <Karta tytul={t.kartaOkresow} bezLinii>
      <Stos odstep={7.5}>
        <div className="flex flex-wrap items-end gap-4">
          {zdarzenie === 'przyjecie' && przyjecie ? (
            <PoleDaty
              id="wynik-poczatek"
              etykieta={t.poczatekNaWarunkach}
              podpowiedz={t.poczatekNaWarunkachPodpowiedz({
                od: formatujDate(przyjecie.dataPrzyjecia),
                do: formatujDate(dodajDni(przyjecie.dataPrzyjecia, 21)),
              })}
              wartosc={poczatek}
              onZmiana={ustawPoczatek}
              blad={bladPoczatku}
              szerokosc="waska"
            />
          ) : (
            <PoleLiczby
              id="wynik-przed-porodem"
              etykieta={t.tygodniePrzed}
              podpowiedz={t.tygodniePrzedPodpowiedz}
              wartosc={tygodnie}
              onZmiana={ustawTygodnie}
              blad={bladTygodni}
              szerokosc="waska"
            />
          )}
          <Przycisk type="button" wariant="drugorzedny" onClick={przelicz}>
            {t.przelicz}
          </Przycisk>
        </div>

        {uzupelniajacy && rodzicePrawo.length > 1 ? (
          <GrupaOpcji<RodzicWRodzinie>
            nazwa="rodzic-uzupelniajacego"
            legenda={t.uzupelniajacyLegenda}
            podpowiedz={t.uzupelniajacyPodpowiedz}
            uklad="poziomo"
            opcje={rodzicePrawo.map((r) => ({ wartosc: r, etykieta: etykiety[r] }))}
            wartosc={parametry.rodzicUzupelniajacego ?? 'matka'}
            onZmiana={(r) => onZmiana({ ...parametry, rodzicUzupelniajacego: r })}
          />
        ) : null}

        {pokazaneRodzice.map((r) =>
          prawo[r] ? (
            <TabelaOkresow key={r} wynik={wynik} rodzic={r} etykieta={etykiety[r]} />
          ) : (
            <div key={r} className="flex flex-col gap-3">
              <h3 className="m-0 text-body-strong">{etykiety[r]}</h3>
              <Komunikat kod="0064" tresc={trescKomunikatu('0064')} />
            </div>
          ),
        )}

        <div className="flex flex-wrap items-start justify-between gap-7.5">
          <Stos odstep={4} className="min-w-0 grow basis-140">
            {wymiar > 0 ? (
              <p className="m-0 text-body">
                {t.podsumowanieTygodni({
                  razem: t.tygodnie({ liczba: wymiar }),
                  matka: t.tygodnie({ liczba: tygMatki }),
                  drugi: t.tygodnie({ liczba: tygDrugiego }),
                  przepadajace: String(wynik.tygodniePrzepadajace),
                })}
              </p>
            ) : null}
            {zdarzenie === 'porod' && !dane.wczesniactwo ? <Notatka>{t.bezUzupelniajacego}</Notatka> : null}
            {okresUzupelniajacy && poczatekRodzicielskiegoMatki ? (
              <Notatka>{t.zUzupelniajacym({ data: formatujDate(poczatekRodzicielskiegoMatki.od) })}</Notatka>
            ) : null}
          </Stos>
          <Kwota etykieta={t.sumaObojga} kwota={wynik.sumy.razem} className="shrink-0" />
        </div>
      </Stos>
    </Karta>
  );
}
