'use client';

// ViewZas53AfterInsurance: oświadczenie Z-10 po ustaniu tytułu ubezpieczenia chorobowego (0006, 0010, 0110,
// 0237–0240, 0270). Każde z siedmiu pytań ma własną część kroku (?czesc=1..7), żeby część z polami warunkowymi
// mieściła się w oknie.
import { useEffect, useRef, useState } from 'react';
import { formatujDate } from '@/domena/daty';
import type { KodKomunikatu } from '@/domena/typy';
import {
  formularzZOswiadczenia,
  pytanieWylaczajace,
  PYTANIA_Z10,
  PYTANIA_Z_INFORMACJA,
  PYTANIE_URLOPU_Z10,
  RODZAJ_Z_HEKTARAMI,
  RODZAJE_DZIALALNOSCI_Z10,
  walidujZ10,
  type FormularzZ10,
  type NumerPytaniaZ10,
  type PoleZ10,
  type RodzajDzialalnosciZ10,
} from '@/domena/wnioski/z10';
import { zbudujZalaczniki } from '@/domena/wnioski/zas53';
import { useDzis } from '@/dane/magazyn/hooki';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { zapiszKrokZas53 } from '@/dane/magazyn/operacje/wnioski-zas53';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { Akordeon } from '@/komponenty/akordeon';
import { useCzesciFormularza } from '@/komponenty/czesci-formularza';
import { GrupaOpcji, idOpcjiGrupy } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { PoleDaty, PoleTekstowe } from '@/komponenty/pole-tekstowe';
import { PoleWyboru } from '@/komponenty/pole-wyboru';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { UkladDwuKolumnowy } from '@/komponenty/uklad';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import {
  adresEkranuZas53,
  AkcjeKreatoraZas53,
  BrakWnioskuZas53,
  NaglowekKreatoraZas53,
  PanelWnioskuZas53,
  PostepZas53,
  useWniosekZas53,
} from '../_czesci/kreator';
import { teksty } from '@/teksty';

const t = teksty.ViewZas53AfterInsurance;

/** Cel fokusu pola: nazwa grupy radio dla odpowiedzi, identyfikator pola dla pozostałych. */
function idPola(pole: PoleZ10): string {
  return `z10-${pole}`;
}

function polaPytania(nr: NumerPytaniaZ10): PoleZ10[] {
  if (nr === PYTANIE_URLOPU_Z10) return [`odpowiedz-${nr}`, 'urlop-od', 'urlop-do'];
  if (nr === 4) return [`odpowiedz-${nr}`, 'rodzaj', 'hektary', `data-${nr}`];
  return [`odpowiedz-${nr}`, `informacja-${nr}`, `data-${nr}`];
}

const KOLEJNOSC: PoleZ10[] = PYTANIA_Z10.flatMap(polaPytania);
const CELE_FOKUSU = Object.fromEntries(KOLEJNOSC.map((p) => [p, idPola(p)])) as Record<PoleZ10, string>;
const PODZIAL = PYTANIA_Z10.map(polaPytania);

function walidujFormularzZ10(dzis: string) {
  return (f: FormularzZ10): Partial<Record<PoleZ10, KodKomunikatu>> => {
    const wynik = walidujZ10(f, dzis);
    return wynik.ok ? {} : wynik.bledy;
  };
}

export function WidokOswiadczeniaZ10() {
  const k = useWniosekZas53();
  if (!k) return <BrakWnioskuZas53 />;
  return <FormularzOswiadczenia key={k.wniosek.idWniosku} k={k} />;
}

function FormularzOswiadczenia({ k }: { k: NonNullable<ReturnType<typeof useWniosekZas53>> }) {
  const { wniosek } = k;
  const dzis = useDzis();
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const [f, setF] = useState<FormularzZ10>(() => formularzZOswiadczenia(wniosek.oswiadczenieZ10, formatujDate));
  const [wylaczenie, setWylaczenie] = useState<NumerPytaniaZ10 | null>(null);
  const [bladZapisu, setBladZapisu] = useState<KodKomunikatu | null>(null);
  const fokusWylaczenia = useRef<NumerPytaniaZ10 | null>(null);

  const walidacja = useWalidacjaNaBiezaco({ wartosci: f, waliduj: walidujFormularzZ10(dzis), pola: CELE_FOKUSU });
  const czesci = useCzesciFormularza({ liczba: PYTANIA_Z10.length, podzial: PODZIAL, walidacja });
  const nr = PYTANIA_Z10[czesci.czesc - 1];

  // Fokus na odpowiedzi wyłączającej zasiłek po przejściu do części z tym pytaniem.
  useEffect(() => {
    if (fokusWylaczenia.current === null || fokusWylaczenia.current !== nr) return;
    fokusWylaczenia.current = null;
    document.getElementById(idOpcjiGrupy(`z10-odpowiedz-${nr}`, 'tak'))?.focus();
  });

  const zmien = (zmiana: (f: FormularzZ10) => FormularzZ10) => {
    setF((s) => zmiana(s));
    setWylaczenie(null);
  };

  const zapiszIPrzejdzDalej = () => {
    const wynik = walidujZ10(f, dzis);
    if (!wynik.ok) return;
    const wylaczajace = pytanieWylaczajace(wynik.odpowiedzi);
    if (wylaczajace !== null) {
      setWylaczenie(wylaczajace);
      fokusWylaczenia.current = wylaczajace;
      if (wylaczajace !== nr) czesci.przejdzDo(PYTANIA_Z10.indexOf(wylaczajace) + 1, { bezFokusu: true });
      else document.getElementById(idOpcjiGrupy(`z10-odpowiedz-${nr}`, 'tak'))?.focus();
      return;
    }
    ustawZajety(true);
    const oswiadczenieZ10 = { odpowiedzi: wynik.odpowiedzi };
    const zalaczniki = zbudujZalaczniki({ ...wniosek, oswiadczenieZ10 });
    const zapis = zapiszKrokZas53(wniosek.idWniosku, { oswiadczenieZ10, zalaczniki }, 'ViewZas53Data', pobierzKontekstOperacji());
    if (!zapis.ok) {
      ustawZajety(false);
      setBladZapisu(zapis.kod);
      return;
    }
    przejdz(adresEkranuZas53('ViewZas53Data', wniosek.idWniosku));
  };

  const dalej = () => czesci.dalej(zapiszIPrzejdzDalej);

  const zapiszDoDokonczenia = () => {
    const wynik = walidujZ10(f, dzis);
    const zmiana = wynik.ok ? { oswiadczenieZ10: { odpowiedzi: wynik.odpowiedzi } } : {};
    const zapis = zapiszKrokZas53(wniosek.idWniosku, zmiana, 'ViewZas53AfterInsurance', pobierzKontekstOperacji());
    if (!zapis.ok) {
      setBladZapisu(zapis.kod);
      return;
    }
    ustawKomunikatPoPrzejsciu({ kod: '0058', dlaWidoku: 'ViewCaseDetails' });
    przejdz(trasy.ViewCaseDetails({ idSprawy: wniosek.idSprawy }));
  };

  const odp = f.odpowiedzi[nr] ?? null;

  return (
    <>
      <NaglowekKreatoraZas53 />
      <div className="flex flex-col gap-7.5">
        <PostepZas53
          ekran="ViewZas53AfterInsurance"
          poUstaniu
          idWniosku={wniosek.idWniosku}
          czesc={czesci.czesc}
          wypadek={wniosek.wypadek?.tak ?? false}
        />
        {bladZapisu ? <Komunikat kod={bladZapisu} /> : null}
        <UkladDwuKolumnowy
          etykietaBocznej={teksty.ViewZas53Start.kreator.twojWniosek}
          tresc={
            <form
              noValidate
              className="flex flex-col gap-7.5"
              onSubmit={(e) => {
                e.preventDefault();
                dalej();
              }}
            >
              <Karta tytul={t.karta} bezLinii as="section">
                <p className="m-0 mb-6">{t.wstep}</p>
                <div className="flex flex-col gap-4">
                  <GrupaOpcji
                    nazwa={`z10-odpowiedz-${nr}`}
                    legenda={t.pytania[nr]}
                    opcje={[
                      { wartosc: 'tak', etykieta: t.tak },
                      { wartosc: 'nie', etykieta: t.nie },
                    ]}
                    wartosc={odp}
                    onZmiana={(w) => zmien((s) => ({ ...s, odpowiedzi: { ...s.odpowiedzi, [nr]: w as 'tak' | 'nie' } }))}
                    {...walidacja.pole(`odpowiedz-${nr}`)}
                    uklad="poziomo"
                  />
                  {wylaczenie === nr ? (
                    <Komunikat
                      kod="0237"
                      akcje={
                        <PrzyciskLink href={trasy.ViewZusQuestion({ sprawa: wniosek.idSprawy })} wariant="drugorzedny">
                          {t.akcjaPytanie}
                        </PrzyciskLink>
                      }
                    />
                  ) : null}
                  {odp === 'tak' ? (
                    <div className="flex flex-wrap gap-6">
                      {PYTANIA_Z_INFORMACJA.includes(nr) ? (
                        <PoleTekstowe
                          id={idPola(`informacja-${nr}`)}
                          etykieta={t.informacja[nr as 1 | 2 | 6]}
                          wartosc={f.informacja[nr] ?? ''}
                          onZmiana={(w) => zmien((s) => ({ ...s, informacja: { ...s.informacja, [nr]: w.slice(0, 100) } }))}
                          maksDlugosc={100}
                          autoComplete="off"
                          {...walidacja.pole(`informacja-${nr}`)}
                        />
                      ) : null}
                      {nr === 4 ? (
                        <PoleWyboru
                          id={idPola('rodzaj')}
                          etykieta={t.rodzaj}
                          opcje={RODZAJE_DZIALALNOSCI_Z10.map((r) => ({ wartosc: r, etykieta: t.rodzaje[r] }))}
                          wartosc={f.rodzajDzialalnosci}
                          onZmiana={(r) => zmien((s) => ({ ...s, rodzajDzialalnosci: r as RodzajDzialalnosciZ10 | '' }))}
                          pustaOpcja={teksty.wspolne.przyciski.wybierz}
                          {...walidacja.pole('rodzaj')}
                        />
                      ) : null}
                      {nr === 4 && f.rodzajDzialalnosci === RODZAJ_Z_HEKTARAMI ? (
                        <PoleTekstowe
                          id={idPola('hektary')}
                          etykieta={t.hektary}
                          podpowiedz={t.podpowiedzHektarow}
                          wartosc={f.hektary}
                          onZmiana={(w) => zmien((s) => ({ ...s, hektary: w }))}
                          inputMode="decimal"
                          autoComplete="off"
                          {...walidacja.pole('hektary')}
                          szerokosc="srednia"
                        />
                      ) : null}
                      {nr === PYTANIE_URLOPU_Z10 ? (
                        <>
                          <PoleDaty
                            id={idPola('urlop-od')}
                            etykieta={t.urlopOd}
                            podpowiedz={t.podpowiedzDaty}
                            wartosc={f.urlopOd}
                            onZmiana={(w) => zmien((s) => ({ ...s, urlopOd: w }))}
                            {...walidacja.pole('urlop-od')}
                            szerokosc="srednia"
                          />
                          <PoleDaty
                            id={idPola('urlop-do')}
                            etykieta={t.urlopDo}
                            podpowiedz={t.podpowiedzDaty}
                            wartosc={f.urlopDo}
                            onZmiana={(w) => zmien((s) => ({ ...s, urlopDo: w }))}
                            {...walidacja.pole('urlop-do')}
                            szerokosc="srednia"
                          />
                        </>
                      ) : (
                        <PoleDaty
                          id={idPola(`data-${nr}`)}
                          etykieta={t.data[nr as Exclude<NumerPytaniaZ10, 7>]}
                          podpowiedz={t.podpowiedzDaty}
                          wartosc={f.data[nr] ?? ''}
                          onZmiana={(w) => zmien((s) => ({ ...s, data: { ...s.data, [nr]: w } }))}
                          {...walidacja.pole(`data-${nr}`)}
                          szerokosc="srednia"
                        />
                      )}
                    </div>
                  ) : null}
                </div>
              </Karta>
              <AkcjeKreatoraZas53
                onWstecz={() => czesci.wroc(() => przejdz(adresEkranuZas53('ViewZas53Certificate', wniosek.idWniosku)))}
                onZapisz={zapiszDoDokonczenia}
                onDalej={dalej}
                zajety={zajety}
              />
            </form>
          }
          boczna={
            <PanelWnioskuZas53
              wniosek={wniosek}
              dodatek={
                <Akordeon id="z10-kiedy-nie" naglowek={t.kiedyNie} className="mt-4 border-t border-line-soft">
                  <ul className="m-0 grid gap-1 pl-5">
                    {t.kiedyNiePozycje.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </Akordeon>
              }
            />
          }
        />
      </div>
    </>
  );
}
