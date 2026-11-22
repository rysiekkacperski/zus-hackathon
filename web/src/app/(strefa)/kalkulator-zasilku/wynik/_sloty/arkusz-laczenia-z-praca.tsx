'use client';

// SheetCalcWorkCombination (kontrakt, tabela 2.3): arkusz na ViewCalcMaternityResult, otwierany parametrem ?arkusz=laczenie-z-praca. Właściciel: u20.
// Historyjka 3.10.4.4.1: łączenie urlopu rodzicielskiego z pracą pracownika, wydłużenie urlopu i zasiłek za okres łączenia.
// Renderuje go slot akcje-urlopow.
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  czesciWyniku,
  dataZdarzenia,
  koniecCzesci,
  liczbaCalkowita,
  limityUrlopow,
  walidujLaczenie,
  wyliczLaczenie,
  type FormularzLaczenia,
} from '@/app/(strefa)/kalkulator-zasilku/porownanie/_czesci/reguly-kalkulatora';
import { useNazwyRodzicow } from '@/app/(strefa)/kalkulator-zasilku/porownanie/_czesci/rodzice';
import { formatujDate, formatujKwote, formatujProcent } from '@/komponenty/format';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { Arkusz } from '@/komponenty/okno';
import { PoleLiczby } from '@/komponenty/pole-tekstowe';
import { PoleWyboru } from '@/komponenty/pole-wyboru';
import { Przycisk } from '@/komponenty/przycisk';
import { Tabela } from '@/komponenty/tabela';
import { BladWyliczenia, SzkieletWyliczenia } from '@/komponenty/stan-wyliczenia';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { useDzis, useKatalog } from '@/dane/magazyn/hooki';
import { porownajDaty } from '@/domena/daty';
import { laczeniaScenariusza } from '@/domena/kalkulatory';
import { stawkiZasilku } from '@/domena/kalkulatory/wariant';
import type { LaczenieZPraca, ParametryScenariusza, RodzicWRodzinie } from '@/domena/typy';
import { teksty } from '@/teksty';
import { KLASY_ARKUSZA_Z_PRZYKLEJONA_STOPKA } from '../../_czesci/arkusz';
import { useScenariuszApi } from '../../_czesci/wyliczenie-api';
import type { PropsArkuszaWyniku } from './typy';

const t = teksty.SheetCalcWorkCombination;
const tTygodnie = teksty.SheetCalcParentalParts.tygodnie;
const ID = 'laczenie';
// Kolejność pól i cel fokusu po nieudanym zapisie.
const POLA: Record<keyof FormularzLaczenia, string> = {
  indeksCzesci: `${ID}-indeksCzesci`,
  tygodnie: `${ID}-tygodnie`,
  wymiarPracy: `${ID}-wymiarPracy`,
};

export function ArkuszLaczeniaZPraca(props: PropsArkuszaWyniku) {
  if (!props.otwarte) return null;
  return <TrescArkuszaLaczenia {...props} />;
}

function TrescArkuszaLaczenia({ daneWejsciowe: d, parametry: p, podstawyApi, onZmianaParametrow, onZamknij }: PropsArkuszaWyniku) {
  const nazwy = useNazwyRodzicow(d.zdarzenie.wartosc === 'przyjecie');
  const katalog = useKatalog();
  const dzis = useDzis();
  const parametryAdresu = useSearchParams();
  const rodzicZAdresu = parametryAdresu.get('rodzic');

  const pracownicy = useMemo(() => {
    const lista: RodzicWRodzinie[] = [];
    if (d.formaMatki.wartosc.forma === 'umowa-o-prace') lista.push('matka');
    if (d.formaDrugiegoRodzica.wartosc.forma === 'umowa-o-prace') lista.push('drugi-rodzic');
    const wskazany = rodzicZAdresu === 'matka' || rodzicZAdresu === 'drugi-rodzic' ? rodzicZAdresu : null;
    return wskazany ? lista.filter((r) => r === wskazany) : lista;
  }, [d, rodzicZAdresu]);

  // Części, które liczy wynik: zapisane w podziale albo domyślne silnika, więc łączenie planujesz od razu na wyniku.
  // Indeks łączenia wskazuje część na tej liście, tak jak w silniku kalkulatora (czesciScenariusza).
  const czesciWyn = useMemo(() => czesciWyniku(d, p, katalog), [d, p, katalog]);
  const zapisane = laczeniaScenariusza(p);
  const opcje = czesciWyn
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => pracownicy.includes(c.rodzic))
    .map(({ c, i }) => ({
      wartosc: String(i),
      etykieta: t.opcjaCzesci({
        kto: nazwy[c.rodzic].mianownik,
        tygodnie: tTygodnie({ liczba: c.tygodnie }),
        od: formatujDate(c.od),
        do_: formatujDate(koniecCzesci(c.od, c.tygodnie)),
      }),
    }));

  const formularzCzesci = (indeksCzesci: string): FormularzLaczenia & { tydzienPoczatku: string } => {
    const l = zapisane.find((z) => String(z.indeksCzesci) === indeksCzesci);
    return {
      indeksCzesci,
      tygodnie: l ? String(l.tygodnie) : '',
      wymiarPracy: l ? String(l.wymiarPracy) : '',
      tydzienPoczatku: String((l?.odTygodnia ?? 0) + 1),
    };
  };
  const [f, ustawF] = useState<FormularzLaczenia & { tydzienPoczatku: string }>(() => {
    const pierwsze = zapisane.find((z) => opcje.some((o) => o.wartosc === String(z.indeksCzesci)));
    return formularzCzesci(pierwsze ? String(pierwsze.indeksCzesci) : opcje.length === 1 ? opcje[0].wartosc : '');
  });
  const czesciPracownikow = czesciWyn.map((c) => (pracownicy.includes(c.rodzic) ? c : { ...c, tygodnie: 0 }));
  // Najwyższy wymiar pracy przy łączeniu ze słownika wymiarów i okresów obowiązujący w dniu porodu albo przyjęcia.
  const maksWymiarPracy = limityUrlopow(katalog, dataZdarzenia(d)).maksWymiarPracy;
  // Tydzień początku łączenia: od 1 do liczby tygodni części; tygodnie łączenia najwyżej do końca części (0061).
  const bledyLaczenia = (w: FormularzLaczenia & { tydzienPoczatku: string }) => {
    const wybrana = w.indeksCzesci === '' ? undefined : czesciPracownikow[Number(w.indeksCzesci)];
    const start = liczbaCalkowita(w.tydzienPoczatku);
    const startOk = start !== null && start >= 1 && (wybrana === undefined || start <= wybrana.tygodnie);
    const pozostale = wybrana && startOk ? { ...wybrana, tygodnie: wybrana.tygodnie - (start - 1) } : wybrana;
    const lista = czesciPracownikow.map((c, i) => (pozostale && String(i) === w.indeksCzesci ? pozostale : c));
    return { ...walidujLaczenie(w, lista, maksWymiarPracy), ...(startOk ? {} : { tydzienPoczatku: '0061' as const }) };
  };
  const walidacja = useWalidacjaNaBiezaco({
    wartosci: f,
    waliduj: bledyLaczenia,
    pola: { ...POLA, tydzienPoczatku: `${ID}-tydzienPoczatku` },
  });
  const poprawny = Object.keys(bledyLaczenia(f)).length === 0;
  const indeks = Number(f.indeksCzesci);
  const tygodnie = liczbaCalkowita(f.tygodnie) ?? 0;
  const wymiar = liczbaCalkowita(f.wymiarPracy) ?? 0;
  const odTygodnia = Math.max(0, (liczbaCalkowita(f.tydzienPoczatku) ?? 1) - 1);
  const laczenie = poprawny ? wyliczLaczenie(czesciWyn, indeks, tygodnie, wymiar) : null;
  const czesc = poprawny ? czesciWyn[indeks] : undefined;

  /** Parametry z łączeniem tej części zamiast dotychczasowego łączenia tej części (null usuwa łączenie części). */
  const zLaczeniem = (nowe: LaczenieZPraca | null): ParametryScenariusza => {
    const lista = [...zapisane.filter((z) => z.indeksCzesci !== Number(f.indeksCzesci)), ...(nowe ? [nowe] : [])].sort(
      (a, b) => a.indeksCzesci - b.indeksCzesci,
    );
    const wynikowe: ParametryScenariusza = { ...p };
    delete wynikowe.laczenie;
    delete wynikowe.laczeniaDodatkowe;
    if (lista.length > 0) wynikowe.laczenie = lista[0];
    if (lista.length > 1) wynikowe.laczeniaDodatkowe = lista.slice(1);
    return wynikowe;
  };
  const noweLaczenie: LaczenieZPraca = { indeksCzesci: indeks, tygodnie, wymiarPracy: wymiar, ...(odTygodnia > 0 ? { odTygodnia } : {}) };

  // Podgląd okresów z łączeniem liczy serwer (POST /api/v1/kalkulator/zasilek-macierzynski) z opóźnieniem po wpisaniu.
  const wyliczeniePodgladu = useScenariuszApi(
    poprawny ? { dane: d, podstawy: podstawyApi, parametry: zLaczeniem(noweLaczenie), dzis } : null,
    { opoznienieMs: 300 },
  );
  const podglad = poprawny && wyliczeniePodgladu.aktualne ? (wyliczeniePodgladu.wartosc?.wynik ?? null) : null;

  // Wiersze części w podglądzie silnika: od początku części do końca jej wydłużenia (część mogła przesunąć się
  // o wydłużenie wcześniejszej części z łączeniem).
  const wierszeCzesci = (() => {
    if (!podglad || !czesc) return [];
    const wlasne = podglad.okresy.filter(
      (o) =>
        o.rodzic === czesc.rodzic &&
        (o.rodzaj === 'laczenie-z-praca' || o.rodzaj === 'rodzicielski' || o.rodzaj === 'wydluzenie-rodzicielskiego') &&
        porownajDaty(o.od, czesc.od) >= 0,
    );
    const koniec = wlasne.findIndex((o) => o.rodzaj === 'wydluzenie-rodzicielskiego');
    return koniec >= 0 ? wlasne.slice(0, koniec + 1) : wlasne;
  })();
  const wierszeZasilku =
    laczenie
      ? wierszeCzesci
          .map((o, i) => ({
            id: `${o.rodzaj}-${i}`,
            okres:
              o.rodzaj === 'laczenie-z-praca'
                ? t.wierszLaczenie({ wymiar: formatujProcent(wymiar), od: formatujDate(o.od), do_: formatujDate(o.do) })
                : o.rodzaj === 'wydluzenie-rodzicielskiego'
                  ? t.wierszWydluzenie({ od: formatujDate(o.od), do_: formatujDate(o.do) })
                  : t.wierszBezLaczenia({ od: formatujDate(o.od), do_: formatujDate(o.do) }),
            dni: String(o.dni),
            stawka: formatujProcent(o.stawka),
            miesiecznie: formatujKwote(o.miesiecznie),
            suma: formatujKwote(o.zaOkres),
          }))
      : [];
  const stawkaCzesci =
    wierszeCzesci.find((o) => o.rodzaj === 'wydluzenie-rodzicielskiego' || o.rodzaj === 'rodzicielski')?.stawka ??
    (p.wariant === '81-5' && czesc?.rodzic === 'matka'
      ? stawkiZasilku(katalog, dataZdarzenia(d) ?? dzis).s815
      : stawkiZasilku(katalog, dataZdarzenia(d) ?? dzis).s70);
  const ktoPracuje = nazwy[czesc?.rodzic ?? pracownicy[0] ?? 'matka'].mianownik;

  const zapisz = () => {
    if (!walidacja.sprobujWyslac()) return;
    onZmianaParametrow(zLaczeniem(noweLaczenie));
    onZamknij();
  };
  const usun = () => {
    onZmianaParametrow(zLaczeniem(null));
    onZamknij();
  };
  const maLaczenie = zapisane.some((z) => String(z.indeksCzesci) === f.indeksCzesci);

  const stopka = (
    <div className="flex flex-wrap justify-end gap-3">
      <Przycisk wariant="drugorzedny" type="button" onClick={onZamknij}>
        {t.anuluj}
      </Przycisk>
      {maLaczenie ? (
        <Przycisk wariant="tlo" type="button" onClick={usun}>
          {t.usun}
        </Przycisk>
      ) : null}
      {pracownicy.length > 0 && opcje.length > 0 ? (
        <Przycisk wariant="glowny" type="button" onClick={zapisz}>
          {t.zapisz}
        </Przycisk>
      ) : null}
    </div>
  );

  if (pracownicy.length === 0) {
    return (
      <Arkusz otwarte onZamknij={onZamknij} tytul={t.tytul} stopka={stopka} className={KLASY_ARKUSZA_Z_PRZYKLEJONA_STOPKA}>
        <Komunikat kod="0099" />
      </Arkusz>
    );
  }

  return (
    <Arkusz
      otwarte
      onZamknij={onZamknij}
      tytul={t.tytul}
      szerokosc="szeroka"
      opis={t.wstep({ kto: ktoPracuje })}
      stopka={stopka}
      className={KLASY_ARKUSZA_Z_PRZYKLEJONA_STOPKA}
    >
      <div className="flex flex-col gap-5">
        {opcje.length === 0 ? (
          <p className="m-0 text-body">{t.brakCzesci}</p>
        ) : (
          <>
            <div className="flex flex-col gap-1 text-small text-ink-muted">
              <p className="m-0">{t.opisTygodni}</p>
              <p className="m-0">{t.opisWymiaru}</p>
              {pracownicy.length > 1 ? <p className="m-0">{t.opisOboje}</p> : null}
            </div>
            <PoleWyboru
              id={`${ID}-indeksCzesci`}
              etykieta={t.czesc}
              opcje={opcje}
              wartosc={f.indeksCzesci}
              onZmiana={(w) => ustawF(formularzCzesci(w))}
              pustaOpcja={t.wybierz}
              {...walidacja.pole('indeksCzesci')}
            />
            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-3">
              <PoleLiczby
                id={`${ID}-tydzienPoczatku`}
                etykieta={t.tydzienPoczatku}
                podpowiedz={t.tydzienPoczatkuPodpowiedz({ maks: String(czesciWyn[Number(f.indeksCzesci)]?.tygodnie ?? 1) })}
                wartosc={f.tydzienPoczatku}
                onZmiana={(w) => ustawF({ ...f, tydzienPoczatku: w })}
                {...walidacja.pole('tydzienPoczatku')}
                szerokosc="waska"
              />
              <PoleLiczby
                id={`${ID}-tygodnie`}
                etykieta={t.tygodnie}
                wartosc={f.tygodnie}
                onZmiana={(w) => ustawF({ ...f, tygodnie: w })}
                {...walidacja.pole('tygodnie')}
                szerokosc="waska"
              />
              <PoleLiczby
                id={`${ID}-wymiarPracy`}
                etykieta={t.wymiarPracy}
                wartosc={f.wymiarPracy}
                onZmiana={(w) => ustawF({ ...f, wymiarPracy: w })}
                {...walidacja.pole('wymiarPracy')}
                szerokosc="waska"
              />
            </div>
            {laczenie && czesc ? (
              <section aria-labelledby={`${ID}-wynik`} className="flex flex-col gap-4" role="status">
                <p id={`${ID}-wynik`} className="m-0 text-body-strong text-ink">
                  {t.wynik}
                </p>
                <ListaDefinicji
                  pozycje={[
                    {
                      etykieta: t.wydluzenie({ tygodnie: tTygodnie({ liczba: tygodnie }), wymiar: formatujProcent(wymiar) }),
                      wartosc: t.dni({ liczba: String(laczenie.dniWydluzenia) }),
                    },
                    ...(laczenie.okresWydluzenia
                      ? [
                          {
                            etykieta: t.okresWydluzenia,
                            wartosc: t.okres({ od: formatujDate(laczenie.okresWydluzenia.od), do_: formatujDate(laczenie.okresWydluzenia.do) }),
                          },
                        ]
                      : []),
                    ...laczenie.przesunieteCzesci.map(({ czesc: c, okres }) => ({
                      etykieta: c.rodzic === 'matka' ? t.przesunietaMatki : t.przesunietaDrugiego,
                      wartosc: t.okres({ od: formatujDate(okres.od), do_: formatujDate(okres.do) }),
                    })),
                    { etykieta: t.nowyKoniec, wartosc: formatujDate(laczenie.nowyKoniecCzesci) },
                  ]}
                />
                {wierszeZasilku.length > 0 ? (
                  <Tabela
                    podpis={t.tabela}
                    podpisWidoczny
                    kwoty
                    etykietaPrzewijania={t.etykietaTabeli}
                    kolumny={[
                      { klucz: 'okres', naglowek: t.kolumnaOkres, tytulowa: true },
                      { klucz: 'dni', naglowek: t.kolumnaDni, liczbowa: true },
                      { klucz: 'stawka', naglowek: t.kolumnaStawka, liczbowa: true },
                      { klucz: 'miesiecznie', naglowek: t.kolumnaMiesiecznie, liczbowa: true },
                      { klucz: 'suma', naglowek: t.kolumnaSuma, liczbowa: true },
                    ]}
                    wiersze={wierszeZasilku}
                  />
                ) : wyliczeniePodgladu.laduje ? (
                  <SzkieletWyliczenia wysokosc="niski" />
                ) : wyliczeniePodgladu.blad ? (
                  <BladWyliczenia
                    kod={wyliczeniePodgladu.blad.kod}
                    parametry={wyliczeniePodgladu.blad.parametry as never}
                    onPonow={wyliczeniePodgladu.ponow}
                  />
                ) : null}
                <p className="m-0 text-small text-ink-muted">
                  {t.objasnienie({
                    stawka: formatujProcent(stawkaCzesci),
                    wymiar: formatujProcent(wymiar),
                    wynik: formatujProcent(Math.round(stawkaCzesci * (100 - wymiar)) / 100),
                  })}
                </p>
              </section>
            ) : (
              <p className="m-0 text-small text-ink-muted">{t.poPoprawieniu}</p>
            )}
          </>
        )}
      </div>
    </Arkusz>
  );
}
