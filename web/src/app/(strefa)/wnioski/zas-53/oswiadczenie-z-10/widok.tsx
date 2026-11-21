'use client';

// ViewZas53AfterInsurance: oświadczenie Z-10 po ustaniu tytułu ubezpieczenia chorobowego (0006, 0010, 0237–0240).
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatujDate } from '@/domena/daty';
import type { KodKomunikatu } from '@/domena/typy';
import {
  formularzZOswiadczenia,
  pytanieWylaczajace,
  PYTANIA_Z10,
  PYTANIA_Z_INFORMACJA,
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
import { GrupaOpcji, idOpcjiGrupy } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { PoleDaty, PoleTekstowe } from '@/komponenty/pole-tekstowe';
import { PoleWyboru } from '@/komponenty/pole-wyboru';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { UkladDwuKolumnowy } from '@/komponenty/uklad';
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

function idPola(pole: PoleZ10): string {
  if (pole.startsWith('odpowiedz-')) return idOpcjiGrupy(`z10-${pole}`, 'tak');
  return `z10-${pole}`;
}

const KOLEJNOSC: PoleZ10[] = PYTANIA_Z10.flatMap((nr): PoleZ10[] =>
  nr === 4 ? [`odpowiedz-${nr}`, 'rodzaj', `data-${nr}`] : [`odpowiedz-${nr}`, `informacja-${nr}`, `data-${nr}`],
);

export function WidokOswiadczeniaZ10() {
  const k = useWniosekZas53();
  if (!k) return <BrakWnioskuZas53 />;
  return <FormularzOswiadczenia key={k.wniosek.idWniosku} k={k} />;
}

function FormularzOswiadczenia({ k }: { k: NonNullable<ReturnType<typeof useWniosekZas53>> }) {
  const { wniosek } = k;
  const dzis = useDzis();
  const router = useRouter();
  const [f, setF] = useState<FormularzZ10>(() => formularzZOswiadczenia(wniosek.oswiadczenieZ10, formatujDate));
  const [bledy, setBledy] = useState<Partial<Record<PoleZ10, KodKomunikatu>>>({});
  const [wylaczenie, setWylaczenie] = useState<NumerPytaniaZ10 | null>(null);
  const [bladZapisu, setBladZapisu] = useState<KodKomunikatu | null>(null);

  const zmien = (zmiana: (f: FormularzZ10) => FormularzZ10) => {
    setF((s) => zmiana(s));
    setWylaczenie(null);
  };

  const dalej = () => {
    const wynik = walidujZ10(f, dzis);
    if (!wynik.ok) {
      setBledy(wynik.bledy);
      const pierwsze = KOLEJNOSC.find((p) => wynik.bledy[p]);
      if (pierwsze) document.getElementById(idPola(pierwsze))?.focus();
      return;
    }
    setBledy({});
    const wylaczajace = pytanieWylaczajace(wynik.odpowiedzi);
    if (wylaczajace !== null) {
      setWylaczenie(wylaczajace);
      document.getElementById(idPola(`odpowiedz-${wylaczajace}`))?.focus();
      return;
    }
    const oswiadczenieZ10 = { odpowiedzi: wynik.odpowiedzi };
    const zalaczniki = zbudujZalaczniki({ ...wniosek, oswiadczenieZ10 });
    const zapis = zapiszKrokZas53(wniosek.idWniosku, { oswiadczenieZ10, zalaczniki }, 'ViewZas53Data', pobierzKontekstOperacji());
    if (!zapis.ok) {
      setBladZapisu(zapis.kod);
      return;
    }
    router.push(adresEkranuZas53('ViewZas53Data', wniosek.idWniosku));
  };

  const zapiszDoDokonczenia = () => {
    const wynik = walidujZ10(f, dzis);
    const zmiana = wynik.ok ? { oswiadczenieZ10: { odpowiedzi: wynik.odpowiedzi } } : {};
    const zapis = zapiszKrokZas53(wniosek.idWniosku, zmiana, 'ViewZas53AfterInsurance', pobierzKontekstOperacji());
    if (!zapis.ok) {
      setBladZapisu(zapis.kod);
      return;
    }
    ustawKomunikatPoPrzejsciu({ kod: '0058', dlaWidoku: 'ViewCaseDetails' });
    router.push(trasy.ViewCaseDetails({ idSprawy: wniosek.idSprawy }));
  };

  return (
    <>
      <NaglowekKreatoraZas53 />
      <div className="flex flex-col gap-7.5">
        <PostepZas53 ekran="ViewZas53AfterInsurance" poUstaniu idWniosku={wniosek.idWniosku} />
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
                <div className="flex flex-col gap-6">
                  {PYTANIA_Z10.map((nr) => {
                    const odp = f.odpowiedzi[nr] ?? null;
                    return (
                      <div key={nr} className="flex flex-col gap-4 border-t border-line-soft pt-6 first:border-t-0 first:pt-0">
                        <GrupaOpcji
                          nazwa={`z10-odpowiedz-${nr}`}
                          legenda={t.pytania[nr]}
                          opcje={[
                            { wartosc: 'tak', etykieta: t.tak },
                            { wartosc: 'nie', etykieta: t.nie },
                          ]}
                          wartosc={odp}
                          onZmiana={(w) => zmien((s) => ({ ...s, odpowiedzi: { ...s.odpowiedzi, [nr]: w as 'tak' | 'nie' } }))}
                          blad={bledy[`odpowiedz-${nr}`] ?? null}
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
                                etykieta={t.informacja[nr as 1 | 2]}
                                wartosc={f.informacja[nr] ?? ''}
                                onZmiana={(w) => zmien((s) => ({ ...s, informacja: { ...s.informacja, [nr]: w.slice(0, 100) } }))}
                                maksDlugosc={100}
                                autoComplete="off"
                                blad={bledy[`informacja-${nr}`] ?? null}
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
                                blad={bledy.rodzaj ?? null}
                              />
                            ) : null}
                            <PoleDaty
                              id={idPola(`data-${nr}`)}
                              etykieta={t.data[nr]}
                              podpowiedz={t.podpowiedzDaty}
                              wartosc={f.data[nr] ?? ''}
                              onZmiana={(w) => zmien((s) => ({ ...s, data: { ...s.data, [nr]: w } }))}
                              blad={bledy[`data-${nr}`] ?? null}
                              szerokosc="srednia"
                            />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </Karta>
              <AkcjeKreatoraZas53
                wstecz={adresEkranuZas53('ViewZas53Certificate', wniosek.idWniosku)}
                onZapisz={zapiszDoDokonczenia}
                onDalej={dalej}
              />
            </form>
          }
          boczna={
            <div className="flex flex-col gap-7.5">
              <PanelWnioskuZas53 wniosek={wniosek} />
              <Karta tytul={t.kiedyNie} bezLinii as="section">
                <ul className="m-0 grid gap-2 pl-5">
                  {t.kiedyNiePozycje.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </Karta>
            </div>
          }
        />
      </div>
    </>
  );
}
