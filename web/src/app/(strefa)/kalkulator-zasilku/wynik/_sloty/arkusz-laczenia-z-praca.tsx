'use client';

// SheetCalcWorkCombination (kontrakt, tabela 2.3): arkusz na ViewCalcMaternityResult, otwierany parametrem ?arkusz=laczenie-z-praca. Właściciel: u20.
// Historyjka 3.10.4.4.1: łączenie urlopu rodzicielskiego z pracą pracownika, wydłużenie urlopu i zasiłek za okres łączenia.
// Renderuje go slot akcje-urlopow.
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  koniecCzesci,
  liczbaCalkowita,
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
import { useDzis, useKatalog } from '@/dane/magazyn/hooki';
import { porownajDaty } from '@/domena/daty';
import { wyliczScenariusz } from '@/domena/kalkulatory';
import type { BledyPol, RodzicWRodzinie } from '@/domena/typy';
import { teksty } from '@/teksty';
import type { PropsArkuszaWyniku } from './typy';

const t = teksty.SheetCalcWorkCombination;
const tTygodnie = teksty.SheetCalcParentalParts.tygodnie;
const ID = 'laczenie';
const KOLEJNOSC: (keyof FormularzLaczenia)[] = ['indeksCzesci', 'tygodnie', 'wymiarPracy'];

export function ArkuszLaczeniaZPraca(props: PropsArkuszaWyniku) {
  if (!props.otwarte) return null;
  return <TrescArkuszaLaczenia {...props} />;
}

function TrescArkuszaLaczenia({ daneWejsciowe: d, parametry: p, podstawy, onZmianaParametrow, onZamknij }: PropsArkuszaWyniku) {
  const nazwy = useNazwyRodzicow();
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

  const opcje = p.czesciRodzicielskiego
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

  const [f, ustawF] = useState<FormularzLaczenia>(() => ({
    indeksCzesci: p.laczenie ? String(p.laczenie.indeksCzesci) : '',
    tygodnie: p.laczenie ? String(p.laczenie.tygodnie) : '',
    wymiarPracy: p.laczenie ? String(p.laczenie.wymiarPracy) : '',
  }));
  const [bledy, ustawBledy] = useState<BledyPol<keyof FormularzLaczenia>>({});

  const czesciPracownikow = p.czesciRodzicielskiego.map((c) => (pracownicy.includes(c.rodzic) ? c : { ...c, tygodnie: 0 }));
  const poprawny = Object.keys(walidujLaczenie(f, czesciPracownikow)).length === 0;
  const indeks = Number(f.indeksCzesci);
  const tygodnie = liczbaCalkowita(f.tygodnie) ?? 0;
  const wymiar = liczbaCalkowita(f.wymiarPracy) ?? 0;
  const laczenie = poprawny ? wyliczLaczenie(p.czesciRodzicielskiego, indeks, tygodnie, wymiar) : null;
  const czesc = poprawny ? p.czesciRodzicielskiego[indeks] : undefined;

  const podglad = poprawny
    ? wyliczScenariusz(d, podstawy, { ...p, laczenie: { indeksCzesci: indeks, tygodnie, wymiarPracy: wymiar } }, katalog, dzis)
    : null;

  const wierszeZasilku =
    podglad && czesc && laczenie
      ? podglad.okresy
          .filter(
            (o) =>
              o.rodzic === czesc.rodzic &&
              (o.rodzaj === 'laczenie-z-praca' || o.rodzaj === 'rodzicielski' || o.rodzaj === 'wydluzenie-rodzicielskiego') &&
              porownajDaty(o.od, czesc.od) >= 0 &&
              porownajDaty(o.do, laczenie.nowyKoniecCzesci) <= 0,
          )
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
    podglad?.okresy.find((o) => czesc && o.rodzic === czesc.rodzic && o.rodzaj === 'rodzicielski' && porownajDaty(o.od, czesc.od) >= 0)?.stawka ??
    (p.wariant === '81-5' && czesc?.rodzic === 'matka' ? 81.5 : 70);
  const ktoPracuje = nazwy[czesc?.rodzic ?? pracownicy[0] ?? 'matka'].mianownik;

  const zapisz = () => {
    const nowe = walidujLaczenie(f, czesciPracownikow);
    ustawBledy(nowe);
    const pierwszy = KOLEJNOSC.find((k) => nowe[k] !== undefined);
    if (pierwszy) {
      document.getElementById(`${ID}-${pierwszy}`)?.focus();
      return;
    }
    onZmianaParametrow({ ...p, laczenie: { indeksCzesci: indeks, tygodnie, wymiarPracy: wymiar } });
    onZamknij();
  };

  const stopka = (
    <div className="flex flex-wrap justify-end gap-3">
      <Przycisk wariant="drugorzedny" type="button" onClick={onZamknij}>
        {t.anuluj}
      </Przycisk>
      {pracownicy.length > 0 && opcje.length > 0 ? (
        <Przycisk wariant="glowny" type="button" onClick={zapisz}>
          {t.zapisz}
        </Przycisk>
      ) : null}
    </div>
  );

  if (pracownicy.length === 0) {
    return (
      <Arkusz otwarte onZamknij={onZamknij} tytul={t.tytul} stopka={stopka}>
        <Komunikat kod="0099" />
      </Arkusz>
    );
  }

  return (
    <Arkusz otwarte onZamknij={onZamknij} tytul={t.tytul} szerokosc="szeroka" opis={t.wstep({ kto: ktoPracuje })} stopka={stopka}>
      <div className="flex flex-col gap-5">
        {opcje.length === 0 ? (
          <p className="m-0 text-body">{t.brakCzesci}</p>
        ) : (
          <>
            <div className="flex flex-col gap-1 text-small text-ink-muted">
              <p className="m-0">{t.opisTygodni}</p>
              <p className="m-0">{t.opisWymiaru}</p>
            </div>
            <PoleWyboru
              id={`${ID}-indeksCzesci`}
              etykieta={t.czesc}
              opcje={opcje}
              wartosc={f.indeksCzesci}
              onZmiana={(w) => ustawF({ ...f, indeksCzesci: w })}
              pustaOpcja={t.wybierz}
              blad={bledy.indeksCzesci}
            />
            <div className="flex flex-wrap items-start gap-4">
              <PoleLiczby
                id={`${ID}-tygodnie`}
                etykieta={t.tygodnie}
                wartosc={f.tygodnie}
                onZmiana={(w) => ustawF({ ...f, tygodnie: w })}
                blad={bledy.tygodnie}
                szerokosc="waska"
              />
              <PoleLiczby
                id={`${ID}-wymiarPracy`}
                etykieta={t.wymiarPracy}
                wartosc={f.wymiarPracy}
                onZmiana={(w) => ustawF({ ...f, wymiarPracy: w })}
                blad={bledy.wymiarPracy}
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
