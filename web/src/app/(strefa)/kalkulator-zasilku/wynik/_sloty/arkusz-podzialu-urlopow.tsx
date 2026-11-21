'use client';

// SheetCalcParentalParts (kontrakt, tabela 2.3): arkusz na ViewCalcMaternityResult, otwierany parametrem ?arkusz=podzial-urlopow. Właściciel: u20.
// Historyjki 3.10.4.3.2 (części urlopu rodzicielskiego i urlop ojcowski), 3.10.4.3.3 (przejęcie części urlopu macierzyńskiego)
// i 3.10.4.3.4 (urlop ojcowski drugiego rodzica ubezpieczonego po porodzie). Renderuje go slot akcje-urlopow.
import { useMemo, useState } from 'react';
import {
  MAKS_CZESCI_RODZICIELSKIEGO,
  SYTUACJE_PRZY_NIEUBEZPIECZONEJ,
  SYTUACJE_PRZY_UBEZPIECZONEJ,
  dataZdarzenia,
  dniOjcowskiego,
  drugiMaPrawo,
  koniecCzesci,
  koniecMacierzynskiego,
  liczbaCalkowita,
  najwczesniejszePrzejecie,
  okresPrzejecia,
  ostatniDzienOjcowskiego,
  ostatniDzienPodjeciaUbezpieczenia,
  ostatniDzienRodzicielskiego,
  parametryZPodzialu,
  podsumujTygodnie,
  poczatekOjcowskiego,
  walidujPodzial,
  wymiarRodzicielskiego,
  type BledyPodzialu,
  type FormularzCzesci,
  type FormularzPodzialu,
  type KontekstPodzialu,
  type SytuacjaPrzejecia,
} from '@/app/(strefa)/kalkulator-zasilku/porownanie/_czesci/reguly-kalkulatora';
import { opisDzieci, opisFormy, useNazwyRodzicow } from '@/app/(strefa)/kalkulator-zasilku/porownanie/_czesci/rodzice';
import { formatujDate, formatujKwote } from '@/komponenty/format';
import { GrupaOpcji, idOpcjiGrupy } from '@/komponenty/grupa-opcji';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { Arkusz } from '@/komponenty/okno';
import { PoleDaty, PoleLiczby } from '@/komponenty/pole-tekstowe';
import { PoleWyboru } from '@/komponenty/pole-wyboru';
import { Przycisk } from '@/komponenty/przycisk';
import { PrzyciskIkona } from '@/komponenty/przycisk-ikona';
import { Tabela } from '@/komponenty/tabela';
import { useDzis, useKatalog } from '@/dane/magazyn/hooki';
import { dodajDni, liczbaDniWlacznie, parsujDate } from '@/domena/daty';
import { ustalPrawoDoZasilku, wyliczScenariusz } from '@/domena/kalkulatory';
import type { DataISO, FormaZatrudnienia, ParametryScenariusza, RodzicWRodzinie } from '@/domena/typy';
import { teksty } from '@/teksty';
import type { PropsArkuszaWyniku } from './typy';

const t = teksty.SheetCalcParentalParts;
const ID = 'podzial';

function data(d: DataISO | undefined): string {
  return d ? formatujDate(d) : '';
}

function formularzZParametrow(p: ParametryScenariusza, k: KontekstPodzialu): FormularzPodzialu {
  let czesci: FormularzCzesci[] = p.czesciRodzicielskiego.map((c) => ({
    rodzic: c.rodzic,
    od: data(c.od),
    tygodnie: String(c.tygodnie),
  }));
  if (czesci.length === 0 && k.prawoMatki) {
    const odMatki = dodajDni(k.koniecMacierzynskiego, 1);
    const tygodnieMatki = k.wymiar - 9;
    czesci = [{ rodzic: 'matka', od: data(odMatki), tygodnie: String(tygodnieMatki) }];
    if (k.prawoDrugiego) {
      czesci.push({ rodzic: 'drugi-rodzic', od: data(dodajDni(koniecCzesci(odMatki, tygodnieMatki), 1)), tygodnie: '9' });
    }
  }
  const startOjcowskiego = p.drugiRodzicPoPorodzie?.dataUbezpieczenia ?? k.dataPorodu;
  const wymiar = p.ojcowski.czesci.length === 0 && p.ojcowski.wymiar === 'brak' && k.prawoDrugiego ? '14-dni' : p.ojcowski.wymiar;
  return {
    czesci,
    wymiarOjcowskiego: wymiar,
    liczbaCzesciOjcowskiego: p.ojcowski.czesci.length === 2 ? 2 : 1,
    datyOjcowskiego: [data(p.ojcowski.czesci[0] ?? startOjcowskiego), data(p.ojcowski.czesci[1])],
    dataUbezpieczenia: data(p.drugiRodzicPoPorodzie?.dataUbezpieczenia),
    formaPoPorodzie: p.drugiRodzicPoPorodzie?.forma ?? '',
    przejecie: p.przejecie !== undefined,
    sytuacja: (p.przejecie?.sytuacja as SytuacjaPrzejecia | undefined) ?? '',
    dataPrzejecia: data(p.przejecie?.data),
    koniecPobytu: data(p.przejecie?.koniecPobytuMatki),
  };
}

/** Klucze błędów w kolejności pól arkusza (fokus po nieudanym zapisie). */
function kolejnoscBledow(f: FormularzPodzialu): string[] {
  const klucze = ['dataUbezpieczenia', 'formaPoPorodzie'];
  f.czesci.forEach((_, i) => klucze.push(`czesc-${i}-rodzic`, `czesc-${i}-od`, `czesc-${i}-tygodnie`));
  klucze.push('czesci', 'ojcowski-0', 'ojcowski-1', 'sytuacja', 'dataPrzejecia', 'koniecPobytu');
  return klucze;
}

export function ArkuszPodzialuUrlopow(props: PropsArkuszaWyniku) {
  if (!props.otwarte) return null;
  return <TrescArkuszaPodzialu {...props} />;
}

function TrescArkuszaPodzialu({ daneWejsciowe: d, parametry: p, podstawy, wynik, onZmianaParametrow, onZamknij }: PropsArkuszaWyniku) {
  const nazwy = useNazwyRodzicow();
  const katalog = useKatalog();
  const dzis = useDzis();

  const kontekst = useMemo<KontekstPodzialu | null>(() => {
    const dataPorodu = dataZdarzenia(d);
    const koniec = koniecMacierzynskiego(d, p, wynik);
    const ostatniRodzicielski = ostatniDzienRodzicielskiego(d);
    const ostatniOjcowski = ostatniDzienOjcowskiego(d);
    if (!dataPorodu || !koniec || !ostatniRodzicielski || !ostatniOjcowski) return null;
    return {
      dataPorodu,
      koniecMacierzynskiego: koniec,
      ostatniDzienRodzicielskiego: ostatniRodzicielski,
      ostatniDzienOjcowskiego: ostatniOjcowski,
      wymiar: wymiarRodzicielskiego(d),
      prawoMatki: ustalPrawoDoZasilku(d, 'matka').przysluguje,
      prawoDrugiego: ustalPrawoDoZasilku(d, 'drugi-rodzic').przysluguje,
      jestDrugiRodzic: d.formaDrugiegoRodzica.wartosc.forma !== 'brak-drugiego-rodzica',
    };
    // wynik zmienia się po każdym przeliczeniu gospodarza
  }, [d, p, wynik]);

  const [f, ustawF] = useState<FormularzPodzialu | null>(() => (kontekst ? formularzZParametrow(p, kontekst) : null));
  const [bledy, ustawBledy] = useState<BledyPodzialu>({});

  const podglad = useMemo(() => {
    if (!kontekst || !f || Object.keys(walidujPodzial(f, kontekst)).length > 0) return null;
    return wyliczScenariusz(d, podstawy, parametryZPodzialu(p, f, kontekst), katalog, dzis);
  }, [kontekst, f, d, podstawy, p, katalog, dzis]);

  if (!kontekst || !f) {
    return (
      <Arkusz otwarte onZamknij={onZamknij} tytul={t.tytul}>
        <p className="m-0 text-body">{t.brakDanych}</p>
      </Arkusz>
    );
  }
  const k = kontekst;
  const formularz = f;

  const zmien = (zmiana: Partial<FormularzPodzialu>) => ustawF({ ...formularz, ...zmiana });
  const zmienCzesc = (i: number, zmiana: Partial<FormularzCzesci>) =>
    zmien({ czesci: formularz.czesci.map((c, j) => (j === i ? { ...c, ...zmiana } : c)) });

  const prawoDrugiego = drugiMaPrawo(k, formularz);
  const matka = nazwy.matka;
  const drugi = nazwy['drugi-rodzic'];
  const tygodnie = podsumujTygodnie(
    formularz.czesci
      .map((c) => ({ rodzic: c.rodzic, od: parsujDate(c.od) ?? '', tygodnie: liczbaCalkowita(c.tygodnie) ?? 0 }))
      .filter((c): c is { rodzic: RodzicWRodzinie; od: string; tygodnie: number } => c.rodzic !== ''),
    k.wymiar,
    { matka: k.prawoMatki, 'drugi-rodzic': prawoDrugiego },
  );
  const najwczesniejCzesci = dodajDni(k.koniecMacierzynskiego, 1);
  const dataUbezpieczenia = parsujDate(formularz.dataUbezpieczenia);
  const startOjcowskiego = poczatekOjcowskiego(k, formularz);
  const sytuacje = k.prawoMatki ? SYTUACJE_PRZY_UBEZPIECZONEJ : SYTUACJE_PRZY_NIEUBEZPIECZONEJ;
  const przejety = podglad?.okresy.find((o) => o.rodzaj === 'przejety-macierzynski' && o.rodzic === 'drugi-rodzic');
  const okresPrzejetej = okresPrzejecia(formularz, k);
  const koniecPobytu = formularz.sytuacja === 'szpital' ? parsujDate(formularz.koniecPobytu) : null;

  const opisZakresuPrzejecia = (): string | null => {
    if (formularz.sytuacja === '') return null;
    const do_ = formatujDate(k.koniecMacierzynskiego);
    if (formularz.sytuacja === 'zatrudnienie-matki') return t.zakresZatrudnienia({ do_ });
    const minimum = najwczesniejszePrzejecie(formularz.sytuacja, k.dataPorodu, k.prawoMatki);
    if (minimum.kod === '0097') return t.zakresRezygnacji({ od: formatujDate(minimum.data), do_ });
    if (minimum.kod === '0169') return t.zakresPo8Tygodniach({ od: formatujDate(minimum.data), do_ });
    return t.zakresOdDniaPo({ do_ });
  };

  const dodajCzesc = () => {
    if (formularz.czesci.length >= MAKS_CZESCI_RODZICIELSKIEGO) {
      ustawBledy({ ...bledy, czesci: '0096' });
      return;
    }
    zmien({ czesci: [...formularz.czesci, { rodzic: '', od: '', tygodnie: '' }] });
  };

  const usunCzesc = (i: number) => {
    zmien({ czesci: formularz.czesci.filter((_, j) => j !== i) });
    const { czesci: _pominiete, ...reszta } = bledy;
    void _pominiete;
    ustawBledy(reszta);
  };

  const zapisz = () => {
    const nowe = walidujPodzial(formularz, k);
    ustawBledy(nowe);
    const pierwszy = kolejnoscBledow(formularz).find((klucz) => nowe[klucz] !== undefined);
    if (pierwszy) {
      const idPola = pierwszy === 'sytuacja' ? idOpcjiGrupy(`${ID}-sytuacja`, sytuacje[0]) : `${ID}-${pierwszy}`;
      document.getElementById(idPola)?.focus();
      return;
    }
    onZmianaParametrow(parametryZPodzialu(p, formularz, k));
    onZamknij();
  };

  const parametryBledu = (kod: string | undefined): Record<string, string> | undefined => {
    if (kod === '0095') return { liczbaTygodni: String(k.wymiar) };
    if (kod === '0247') return { data: formatujDate(ostatniDzienPodjeciaUbezpieczenia(k.dataPorodu)) };
    return undefined;
  };

  const opcjeRodzica = [
    { wartosc: 'matka' as const, etykieta: t.opcjaMatka({ kto: matka.mianownik }) },
    ...(k.jestDrugiRodzic ? [{ wartosc: 'drugi-rodzic' as const, etykieta: t.opcjaDrugiRodzic({ kto: drugi.mianownik }) }] : []),
  ];
  const dniCzesciOjcowskiego = dniOjcowskiego(formularz.wymiarOjcowskiego, formularz.liczbaCzesciOjcowskiego);
  const opisCzesci = !k.prawoMatki
    ? t.czesciOpisMatkaBezPrawa({ najpozniej: formatujDate(k.ostatniDzienRodzicielskiego), kto: drugi.mianownik, limit: String(k.wymiar - 9) })
    : !k.prawoDrugiego && dataUbezpieczenia
      ? t.czesciOpisZUbezpieczeniem({
          od: formatujDate(najwczesniejCzesci),
          kogo: drugi.dopelniacz,
          odDrugiego: formatujDate(dataUbezpieczenia),
          najpozniej: formatujDate(k.ostatniDzienRodzicielskiego),
          limit: String(k.wymiar - 9),
        })
      : t.czesciOpis({ od: formatujDate(najwczesniejCzesci), najpozniej: formatujDate(k.ostatniDzienRodzicielskiego), limit: String(k.wymiar - 9) });

  return (
    <Arkusz
      otwarte
      onZamknij={onZamknij}
      tytul={t.tytul}
      szerokosc="szeroka"
      opis={
        k.prawoMatki
          ? t.wstep({
              data: formatujDate(k.dataPorodu),
              dzieci: opisDzieci(d),
              wymiar: String(k.wymiar),
              koniec: formatujDate(k.koniecMacierzynskiego),
            })
          : t.wstepMatkaBezPrawa({
              data: formatujDate(k.dataPorodu),
              dzieci: opisDzieci(d),
              kto: matka.mianownik,
              forma: opisFormy(d.formaMatki.wartosc),
              zrodlo: t.zrodla[d.formaMatki.zrodlo],
            })
      }
      stopka={
        <div className="flex flex-wrap justify-end gap-3">
          <Przycisk wariant="drugorzedny" type="button" onClick={onZamknij}>
            {t.anuluj}
          </Przycisk>
          <Przycisk wariant="glowny" type="button" onClick={zapisz}>
            {t.zapisz}
          </Przycisk>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {!k.prawoMatki ? <Komunikat kod="0064" /> : null}

        <section aria-labelledby={`${ID}-czesci-tytul`} className="flex flex-col gap-4">
          <h3 id={`${ID}-czesci-tytul`} className="m-0 text-tile-title text-ink">
            {t.czesciTytul}
          </h3>
          <p className="m-0 text-small text-ink-muted">{opisCzesci}</p>
          {formularz.czesci.map((c, i) => {
            const od = parsujDate(c.od);
            const liczba = liczbaCalkowita(c.tygodnie);
            const numer = String(i + 1);
            return (
              <fieldset key={i} className="m-0 flex min-w-0 flex-col gap-3 rounded-sm border border-line p-4">
                <legend className="px-1 text-body-strong text-ink">{t.czesc({ numer })}</legend>
                <div className="flex flex-wrap items-start gap-4">
                  <PoleWyboru
                    id={`${ID}-czesc-${i}-rodzic`}
                    etykieta={t.rodzic}
                    opcje={opcjeRodzica}
                    wartosc={c.rodzic}
                    onZmiana={(w) => zmienCzesc(i, { rodzic: w })}
                    pustaOpcja={t.wybierz}
                    blad={bledy[`czesc-${i}-rodzic`]}
                    szerokosc="srednia"
                  />
                  <PoleDaty
                    id={`${ID}-czesc-${i}-od`}
                    etykieta={t.dataPoczatku}
                    wartosc={c.od}
                    onZmiana={(w) => zmienCzesc(i, { od: w })}
                    blad={bledy[`czesc-${i}-od`]}
                  />
                  <PoleLiczby
                    id={`${ID}-czesc-${i}-tygodnie`}
                    etykieta={t.liczbaTygodni}
                    wartosc={c.tygodnie}
                    onZmiana={(w) => zmienCzesc(i, { tygodnie: w })}
                    blad={bledy[`czesc-${i}-tygodnie`]}
                    parametryBledu={parametryBledu(bledy[`czesc-${i}-tygodnie`])}
                    szerokosc="waska"
                  />
                  <PrzyciskIkona
                    ksztalt="okragly"
                    ikona="usun"
                    etykieta={t.usunCzesc({ numer })}
                    onClick={() => usunCzesc(i)}
                    className="mt-7"
                  />
                </div>
                {od && liczba && liczba > 0 ? (
                  <p className="m-0 text-small text-ink-muted">
                    {t.okres({ od: formatujDate(od), do_: formatujDate(koniecCzesci(od, liczba)) })}
                  </p>
                ) : null}
              </fieldset>
            );
          })}
          <div className="flex flex-col items-start gap-3">
            <Przycisk wariant="tlo" type="button" ikona="plus" onClick={dodajCzesc}>
              {t.dodajCzesc}
            </Przycisk>
            {bledy.czesci ? <Komunikat kod={bledy.czesci} /> : null}
          </div>
        </section>

        {k.jestDrugiRodzic ? (
          <section aria-labelledby={`${ID}-ojcowski-tytul`} className="flex flex-col gap-4">
            <h3 id={`${ID}-ojcowski-tytul`} className="m-0 text-tile-title text-ink">
              {t.ojcowskiTytul({ kto: drugi.mianownik })}
            </h3>
            {!k.prawoDrugiego ? (
              <>
                <p className="m-0 text-body">
                  {t.wDniuPorodu({ forma: opisFormy(d.formaDrugiegoRodzica.wartosc), zrodlo: t.zrodla[d.formaDrugiegoRodzica.zrodlo] })}
                </p>
                <Komunikat kod="0064" />
                <p className="m-0 text-body">{t.ubezpieczenieOpis({ kto: drugi.mianownik })}</p>
                <div className="flex flex-wrap items-start gap-4">
                  <PoleDaty
                    id={`${ID}-dataUbezpieczenia`}
                    etykieta={t.dataUbezpieczenia}
                    podpowiedz={t.ubezpieczeniePodpowiedz({
                      od: formatujDate(dodajDni(k.dataPorodu, 1)),
                      do_: formatujDate(ostatniDzienPodjeciaUbezpieczenia(k.dataPorodu)),
                      kto: drugi.mianownik,
                    })}
                    wartosc={formularz.dataUbezpieczenia}
                    onZmiana={(w) => zmien({ dataUbezpieczenia: w, datyOjcowskiego: [w, formularz.datyOjcowskiego[1]] })}
                    blad={bledy.dataUbezpieczenia}
                    parametryBledu={parametryBledu(bledy.dataUbezpieczenia)}
                  />
                  <PoleWyboru<FormaZatrudnienia>
                    id={`${ID}-formaPoPorodzie`}
                    etykieta={t.formaPoPorodzie}
                    opcje={(['umowa-o-prace', 'umowa-zlecenia', 'jdg'] as const).map((w) => ({ wartosc: w, etykieta: t.formyPoPorodzie[w] }))}
                    wartosc={formularz.formaPoPorodzie}
                    onZmiana={(w) => zmien({ formaPoPorodzie: w })}
                    pustaOpcja={t.wybierz}
                    blad={bledy.formaPoPorodzie}
                  />
                </div>
                {!prawoDrugiego ? <p className="m-0 text-body">{t.bezDatyUbezpieczenia({ kogo: drugi.dopelniacz })}</p> : null}
              </>
            ) : null}
            {prawoDrugiego ? (
              <>
                <GrupaOpcji<ParametryScenariusza['ojcowski']['wymiar']>
                  nazwa={`${ID}-wymiar-ojcowskiego`}
                  legenda={t.wymiarOjcowskiego}
                  opcje={(['14-dni', '7-dni', 'brak'] as const).map((w) => ({ wartosc: w, etykieta: t.wymiaryOjcowskiego[w] }))}
                  wartosc={formularz.wymiarOjcowskiego}
                  onZmiana={(w) => zmien({ wymiarOjcowskiego: w, liczbaCzesciOjcowskiego: w === '14-dni' ? formularz.liczbaCzesciOjcowskiego : 1 })}
                  uklad="poziomo"
                />
                {formularz.wymiarOjcowskiego === '14-dni' ? (
                  <GrupaOpcji<'1' | '2'>
                    nazwa={`${ID}-liczba-czesci-ojcowskiego`}
                    legenda={t.liczbaCzesci}
                    opcje={[
                      { wartosc: '1', etykieta: '1' },
                      { wartosc: '2', etykieta: '2' },
                    ]}
                    wartosc={formularz.liczbaCzesciOjcowskiego === 2 ? '2' : '1'}
                    onZmiana={(w) => zmien({ liczbaCzesciOjcowskiego: w === '2' ? 2 : 1 })}
                    uklad="poziomo"
                  />
                ) : null}
                {dniCzesciOjcowskiego.length > 0 && startOjcowskiego ? (
                  <p className="m-0 text-small text-ink-muted">
                    {k.prawoDrugiego
                      ? t.ojcowskiZakresPorod({ od: formatujDate(startOjcowskiego), najpozniej: formatujDate(k.ostatniDzienOjcowskiego) })
                      : t.ojcowskiZakresUbezpieczenie({ od: formatujDate(startOjcowskiego), najpozniej: formatujDate(k.ostatniDzienOjcowskiego) })}
                  </p>
                ) : null}
                {dniCzesciOjcowskiego.map((dni, i) => {
                  const od = parsujDate(formularz.datyOjcowskiego[i] ?? '');
                  return (
                    <div key={i} className="flex flex-col gap-2">
                      <PoleDaty
                        id={`${ID}-ojcowski-${i}`}
                        etykieta={t.dataCzesciOjcowskiego({ numer: String(i + 1) })}
                        wartosc={formularz.datyOjcowskiego[i] ?? ''}
                        onZmiana={(w) => {
                          const daty: [string, string] = [...formularz.datyOjcowskiego];
                          daty[i] = w;
                          zmien({ datyOjcowskiego: daty });
                        }}
                        blad={bledy[`ojcowski-${i}`]}
                      />
                      {od ? (
                        <p className="m-0 text-small text-ink-muted">
                          {t.okresOjcowskiego({ od: formatujDate(od), do_: formatujDate(dodajDni(od, dni - 1)), dni: String(dni) })}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </>
            ) : null}
          </section>
        ) : (
          <p className="m-0 text-body">{t.bezDrugiegoRodzica}</p>
        )}

        {prawoDrugiego ? (
          <section aria-labelledby={`${ID}-przejecie-tytul`} className="flex flex-col gap-4">
            <h3 id={`${ID}-przejecie-tytul`} className="m-0 text-tile-title text-ink">
              {t.przejecieTytul}
            </h3>
            <GrupaOpcji<'nie' | 'tak'>
              nazwa={`${ID}-przejecie`}
              legenda={t.przejeciePytanie({ kto: drugi.mianownik })}
              opcje={[
                { wartosc: 'nie', etykieta: t.nie },
                { wartosc: 'tak', etykieta: t.tak },
              ]}
              wartosc={formularz.przejecie ? 'tak' : 'nie'}
              onZmiana={(w) => zmien({ przejecie: w === 'tak' })}
              uklad="poziomo"
            />
            {formularz.przejecie ? (
              <>
                <GrupaOpcji<SytuacjaPrzejecia>
                  nazwa={`${ID}-sytuacja`}
                  legenda={t.sytuacja}
                  opcje={sytuacje.map((w) => ({ wartosc: w, etykieta: t.sytuacje[w] }))}
                  wartosc={formularz.sytuacja === '' ? null : formularz.sytuacja}
                  onZmiana={(w) => zmien({ sytuacja: w })}
                  blad={bledy.sytuacja}
                  uklad="proste"
                />
                {opisZakresuPrzejecia() ? <p className="m-0 text-small text-ink-muted">{opisZakresuPrzejecia()}</p> : null}
                <PoleDaty
                  id={`${ID}-dataPrzejecia`}
                  etykieta={t.dataPrzejecia}
                  wartosc={formularz.dataPrzejecia}
                  onZmiana={(w) => zmien({ dataPrzejecia: w })}
                  blad={bledy.dataPrzejecia}
                />
                {formularz.sytuacja === 'szpital' ? (
                  <PoleDaty
                    id={`${ID}-koniecPobytu`}
                    etykieta={t.koniecPobytu}
                    wartosc={formularz.koniecPobytu}
                    onZmiana={(w) => zmien({ koniecPobytu: w })}
                    blad={bledy.koniecPobytu}
                  />
                ) : null}
                {okresPrzejetej ? (
                  <Tabela
                    podpis={t.tabelaPrzejecia}
                    podpisWidoczny
                    etykietaPrzewijania={t.etykietaTabeliPrzejecia}
                    kolumny={[
                      { klucz: 'rodzic', naglowek: t.kolumnaRodzic, tytulowa: true },
                      { klucz: 'od', naglowek: t.kolumnaOd },
                      { klucz: 'do', naglowek: t.kolumnaDo },
                      { klucz: 'dni', naglowek: t.kolumnaDni, liczbowa: true },
                      { klucz: 'zasilek', naglowek: teksty.SheetCalcWorkCombination.kolumnaSuma, liczbowa: true },
                    ]}
                    wiersze={[
                      {
                        id: 'przejety',
                        rodzic: drugi.mianownik,
                        od: formatujDate(przejety?.od ?? okresPrzejetej.od),
                        do: formatujDate(przejety?.do ?? okresPrzejetej.do),
                        dni: String(przejety?.dni ?? liczbaDniWlacznie(okresPrzejetej)),
                        zasilek: przejety ? formatujKwote(przejety.zaOkres) : teksty.ViewCalcScenarioCompare.brakWartosci,
                      },
                    ]}
                  />
                ) : null}
                {koniecPobytu && k.prawoMatki ? (
                  <p className="m-0 text-body">
                    {t.matkaWraca({ kto: matka.mianownik, od: formatujDate(dodajDni(koniecPobytu, 1)), do_: formatujDate(k.koniecMacierzynskiego) })}
                  </p>
                ) : null}
                {!k.prawoMatki ? <p className="m-0 text-body">{t.matkaBezPrawaOkresy({ kto: matka.mianownik })}</p> : null}
              </>
            ) : null}
          </section>
        ) : null}

        <section aria-labelledby={`${ID}-podsumowanie`} className="rounded-sm bg-surface-sunken p-4">
          <p id={`${ID}-podsumowanie`} className="m-0 mb-3 text-body-strong text-ink">
            {t.podsumowanie}
          </p>
          <div role="status">
            <ListaDefinicji
              szerokoscEtykiety="waska"
              pozycje={[
                {
                  etykieta: t.matka,
                  wartosc: k.prawoMatki ? t.zLimitu({ liczba: String(tygodnie.matka), limit: String(tygodnie.limitRodzica) }) : t.bezPrawa,
                },
                {
                  etykieta: t.drugiRodzic,
                  wartosc: prawoDrugiego
                    ? t.zLimitu({ liczba: String(tygodnie.drugi), limit: String(tygodnie.limitRodzica) })
                    : String(tygodnie.drugi),
                },
                { etykieta: t.przepadajace, wartosc: String(tygodnie.przepadajace) },
                { etykieta: t.razem, wartosc: t.zLimitu({ liczba: String(tygodnie.razem), limit: String(tygodnie.wymiar) }) },
              ]}
            />
          </div>
        </section>
      </div>
    </Arkusz>
  );
}
