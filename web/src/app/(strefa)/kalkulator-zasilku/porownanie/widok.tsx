'use client';

// ViewCalcScenarioCompare (historyjka 3.10.4.5.1, wzory P12-36 i P12-37). Właściciel: u20.
// Lista zapisanych scenariuszy rodziny albo konta, wybór od 2 do 3 scenariuszy (0170), tabela porównania
// i zapis scenariusza w planie rodziny (0100). Gość porównuje scenariusze zapisane w tej karcie przeglądarki, a zapis
// w planie rodziny dostaje po zalogowaniu.
import { useSearchParams } from 'next/navigation';
import { useMemo, useState, type FocusEvent, type ReactNode } from 'react';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { opuszczonoKontener } from '@/komponenty/pole';
import { GrupaZaznaczen } from '@/komponenty/pole-zaznaczenia';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Tabela } from '@/komponenty/tabela';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { Znaczek } from '@/komponenty/znaczek';
import { formatujDate, formatujKwote } from '@/komponenty/format';
import { useCzyGosc, useDzis, useKatalog, useKonto, useRodzina, useStanKonta, useWynikiKalkulacji } from '@/dane/magazyn/hooki';
import { zapiszScenariuszWPlanie } from '@/dane/magazyn/operacje/kalkulacje-scenariusze';
import { osobyRodziny } from '@/dane/magazyn/stan';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { dataZdarzenia } from '@/domena/kalkulatory/scenariusz';
import { etykietyStawekZasilku } from '@/domena/kalkulatory/wariant';
import type { KodKomunikatu, Pesel, RodzicWRodzinie, ScenariuszKalkulatora } from '@/domena/typy';
import { teksty } from '@/teksty';
import { NotatkaLogowania } from '../_czesci/notatka-logowania';
import {
  RODZICE,
  sortujScenariusze,
  walidujWyborScenariuszy,
  zakresUrlopu,
  type OkresDoPorownania,
} from './_czesci/reguly-kalkulatora';
import { useNazwyRodzicow } from './_czesci/rodzice';

const t = teksty.ViewCalcScenarioCompare;
const ID_LISTY = 'scenariusze';

function numeryZAdresu(tekst: string | null): string[] {
  if (!tekst) return [];
  return tekst
    .split(',')
    .map((n) => n.trim())
    .filter((n) => /^\d+$/.test(n));
}

function wstep(s: ScenariuszKalkulatora | undefined): string | undefined {
  if (!s) return undefined;
  const d = s.daneWejsciowe;
  const dzieci = t.dzieci[d.liczbaDzieci.wartosc];
  if (d.zdarzenie.wartosc === 'przyjecie' && d.przyjecie) return t.wstepPrzyjecie({ data: formatujDate(d.przyjecie.wartosc.dataPrzyjecia), dzieci });
  if (d.zdarzenie.wartosc === 'przewidywany-porod' && d.przewidywanyTerminPorodu)
    return t.wstepPrzewidywany({ data: formatujDate(d.przewidywanyTerminPorodu.wartosc), dzieci });
  if (d.dataPorodu) return t.wstepPorod({ data: formatujDate(d.dataPorodu.wartosc), dzieci });
  return undefined;
}

export function WidokPorownaniaScenariuszy() {
  const adres = useSearchParams();
  const dzis = useDzis();
  const konto = useKonto();
  const stanKonta = useStanKonta();
  const rodzina = useRodzina();
  const gosc = useCzyGosc();
  const wynikiGoscia = useWynikiKalkulacji();
  const katalog = useKatalog();
  const zPlanem = rodzina !== null && (konto?.rola === 'rodzic' || konto?.rola === 'drugi-rodzic');

  const scenariusze = useMemo(
    () =>
      sortujScenariusze(
        (gosc ? wynikiGoscia : zPlanem ? rodzina.wynikiKalkulacji : stanKonta?.wynikiKalkulacji)?.scenariusze ?? [],
      ),
    [gosc, wynikiGoscia, zPlanem, rodzina, stanKonta],
  );
  // Przy przyjęciu dziecka pierwszy rodzic to rodzic, który przyjął dziecko, a nie matka.
  const nazwy = useNazwyRodzicow(scenariusze.some((s) => s.daneWejsciowe.zdarzenie.wartosc === 'przyjecie'));
  // Stawki w nazwie wariantu z katalogu w dniu zdarzenia scenariusza.
  const wariantScenariusza = (s: ScenariuszKalkulatora) =>
    t.warianty(s.parametry.wariant, etykietyStawekZasilku(katalog, dataZdarzenia(s.daneWejsciowe) ?? dzis));
  const zAdresu = numeryZAdresu(adres.get('numery'));
  const [wybrane, ustawWybrane] = useState<string[]>(zAdresu);
  const [porownane, ustawPorownane] = useState<string[]>(walidujWyborScenariuszy(zAdresu.map(Number)) === null ? zAdresu : []);
  // Wybór od 2 do 3 scenariuszy (0170) sprawdzamy po wyjściu fokusu z listy, a po próbie porównania przy każdej zmianie.
  const walidacja = useWalidacjaNaBiezaco({
    wartosci: { wybor: wybrane },
    waliduj: (w) => ({ wybor: walidujWyborScenariuszy(w.wybor.map(Number)) }),
    pola: { wybor: ID_LISTY },
  });
  const [komunikat, ustawKomunikat] = useState<KodKomunikatu | null>(null);

  const nazwaKonta = (pesel: Pesel): string => {
    if (rodzina) {
      const osoby = osobyRodziny(rodzina.daneRodziny);
      if (osoby.peselMatki === pesel) return nazwy.matka.mianownik;
      if (osoby.peselDrugiegoRodzica === pesel) return nazwy['drugi-rodzic'].mianownik;
    }
    return konto && konto.pesel === pesel ? `${konto.imie} ${konto.nazwisko}` : pesel;
  };

  const porownaj = () => {
    ustawKomunikat(null);
    if (!walidacja.sprobujWyslac()) {
      ustawPorownane([]);
      return;
    }
    ustawPorownane(wybrane);
  };

  const zapiszWPlanie = (numer: number) => {
    const wynik = zapiszScenariuszWPlanie(numer, pobierzKontekstOperacji());
    ustawKomunikat(wynik.ok ? '0100' : wynik.kod);
  };

  const doTabeli = porownane
    .map((n) => scenariusze.find((s) => String(s.numer) === n))
    .filter((s): s is ScenariuszKalkulatora => s !== undefined);

  const kto = (r: RodzicWRodzinie) => nazwy[r].mianownik;
  const etykietaOkresu = (w: OkresDoPorownania): string => {
    if (w.rodzaj === 'ojcowski') return t.wierszOjcowski({ kto: kto(w.rodzic) });
    if (w.rodzaj === 'rodzicielski') return t.wierszRodzicielski({ kto: kto(w.rodzic) });
    return w.rodzic === 'matka' ? t.wierszMacierzynski({ kto: kto(w.rodzic) }) : t.wierszPrzejety({ kto: kto(w.rodzic) });
  };
  const wierszeOkresow: OkresDoPorownania[] = [
    { rodzic: 'matka', rodzaj: 'macierzynski' },
    { rodzic: 'matka', rodzaj: 'rodzicielski' },
    { rodzic: 'drugi-rodzic', rodzaj: 'macierzynski' },
    { rodzic: 'drugi-rodzic', rodzaj: 'ojcowski' },
    { rodzic: 'drugi-rodzic', rodzaj: 'rodzicielski' },
  ];
  const kolumnaScenariusza = (s: ScenariuszKalkulatora) => `s${s.numer}`;
  type Wiersz = { id: string } & Record<string, ReactNode>;
  const wiersz = (id: string, pozycja: string, wartosc: (s: ScenariuszKalkulatora) => ReactNode): Wiersz => {
    const w: Wiersz = { id, pozycja };
    for (const s of doTabeli) w[kolumnaScenariusza(s)] = wartosc(s);
    return w;
  };
  const wiersze: Wiersz[] =
    doTabeli.length === 0
      ? []
      : [
          wiersz('wariant', t.wierszWariant, (s) => wariantScenariusza(s)),
          ...wierszeOkresow
            .filter((w) => doTabeli.some((s) => zakresUrlopu(s.wynik, w) !== null))
            .map((w) =>
              wiersz(`${w.rodzic}-${w.rodzaj}`, etykietaOkresu(w), (s) => {
                const o = zakresUrlopu(s.wynik, w);
                return o ? t.okres({ od: formatujDate(o.od), do_: formatujDate(o.do) }) : t.brakWartosci;
              }),
            ),
          ...RODZICE.filter((r) => doTabeli.some((s) => s.wynik.datyPowrotu[r])).map((r) =>
            wiersz(`powrot-${r}`, t.wierszPowrot({ kto: kto(r) }), (s) => {
              const data = s.wynik.datyPowrotu[r];
              return data ? formatujDate(data) : t.brakWartosci;
            }),
          ),
          wiersz('przepadajace', t.wierszPrzepadajace, (s) => String(s.wynik.tygodniePrzepadajace)),
          wiersz('niewykorzystane', t.wierszNiewykorzystane, (s) => String(s.wynik.tygodnieNiewykorzystane)),
          ...RODZICE.filter((r) => doTabeli.some((s) => s.wynik.sumy[r] !== undefined)).map((r) =>
            wiersz(`suma-${r}`, t.wierszSuma({ kto: kto(r) }), (s) => formatujKwote(s.wynik.sumy[r] ?? 0)),
          ),
          wiersz('suma', t.wierszSumaObojga, (s) => formatujKwote(s.wynik.sumy.razem)),
          ...(zPlanem
            ? [
                wiersz('plan', t.wierszPlan, (s) =>
                  s.wybranyWPlanie ? (
                    <Znaczek>{t.wybranyWPlanie}</Znaczek>
                  ) : s.przykladowaSprawa ? (
                    t.przykladowaSprawaOpis
                  ) : (
                    <Przycisk
                      wariant="drugorzedny"
                      type="button"
                      aria-label={t.zapiszWPlanieScenariusza({ numer: String(s.numer) })}
                      onClick={() => zapiszWPlanie(s.numer)}
                    >
                      {t.zapiszWPlanie}
                    </Przycisk>
                  ),
                ),
              ]
            : []),
        ];

  return (
    <div className="flex flex-col gap-7.5">
      <NaglowekStrony
        tytul={t.naglowek}
        stanNa={dzis}
        wstep={wstep(scenariusze[0])}
        powrot={{ href: '/kalkulator-zasilku/wynik', etykieta: t.powrot }}
      />
      {scenariusze.length === 0 ? (
        <StanPusty ikona="kalkulator" akcja={<PrzyciskLink wariant="glowny" href="/kalkulator-zasilku">{t.przejdzDoKalkulatora}</PrzyciskLink>}>
          {t.pusta}
        </StanPusty>
      ) : (
        <>
          <Karta tytul={t.listaTytul} bezLinii>
            <div className="flex flex-col gap-4">
              <p className="m-0 text-body">{zPlanem ? t.opisRodziny : gosc ? t.opisGosc : t.opisKonta}</p>
              <div
                onBlur={(e: FocusEvent<HTMLDivElement>) => {
                  if (opuszczonoKontener(e)) walidacja.onOpuszczenie('wybor');
                }}
              >
                <GrupaZaznaczen
                  id={ID_LISTY}
                  legenda={t.legenda}
                  opcje={scenariusze.map((s) => ({
                    wartosc: String(s.numer),
                    etykieta: s.parametry.datyPowrotu.matka
                      ? t.opcjaZPowrotem({
                          numer: String(s.numer),
                          wariant: wariantScenariusza(s),
                          data: formatujDate(s.parametry.datyPowrotu.matka),
                        })
                      : t.opcja({ numer: String(s.numer), wariant: wariantScenariusza(s) }),
                    opis: [
                      gosc
                        ? t.opisOpcjiGosc({ data: formatujDate(s.zapisano) })
                        : t.opisOpcji({ data: formatujDate(s.zapisano), konto: nazwaKonta(s.konto) }),
                      s.wybranyWPlanie ? t.wybranyWPlanieOpis : null,
                      s.przykladowaSprawa ? t.przykladowaSprawaOpis : null,
                    ]
                      .filter(Boolean)
                      .join(' '),
                  }))}
                  wartosci={wybrane}
                  onZmiana={ustawWybrane}
                  blad={walidacja.blad('wybor')}
                />
              </div>
              <div>
                <Przycisk wariant="glowny" type="button" onClick={porownaj}>
                  {t.porownaj}
                </Przycisk>
              </div>
            </div>
          </Karta>
          {doTabeli.length > 0 ? (
            <Karta tytul={t.porownanieTytul} bezLinii>
              <div className="flex flex-col gap-4">
                {komunikat ? <Komunikat kod={komunikat} /> : null}
                <Tabela
                  podpis={t.podpisTabeli}
                  etykietaPrzewijania={t.etykietaPrzewijania}
                  kolumny={[
                    { klucz: 'pozycja', naglowek: t.kolumnaPozycja, tytulowa: true },
                    ...doTabeli.map((s) => ({ klucz: kolumnaScenariusza(s), naglowek: t.kolumnaScenariusz({ numer: String(s.numer) }) })),
                  ]}
                  wiersze={wiersze}
                />
                {zPlanem ? <p className="m-0 text-small text-ink-muted">{t.notatkaPlanu}</p> : null}
                {gosc ? <NotatkaLogowania odnosnik={t.zalogujPlan} /> : null}
              </div>
            </Karta>
          ) : null}
        </>
      )}
    </div>
  );
}
